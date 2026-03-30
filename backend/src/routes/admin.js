const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { User, Investment, Deposit, Withdrawal, Referral, Transaction } = require('../models');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail } = require('../utils/mailer');

router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
  const totalUsers = await User.count();
  const totalDeposits = await Deposit.sum('amount');
  const totalWithdrawals = await Withdrawal.sum('amount');
  const totalInvestments = await Investment.sum('amount');
  res.json({ totalUsers, totalDeposits, totalWithdrawals, totalInvestments });
});

router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  const users = await User.findAll({
    include: [
      { model: User, as: 'upline', attributes: ['id', 'username', 'email', 'fullName'] },
      { model: User, as: 'downline', attributes: ['id', 'username', 'email', 'fullName'] }
    ]
  });
  res.json(users);
});

router.put('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  Object.assign(user, req.body);
  await user.save();
  res.json(user);
});

router.post('/users/:id/block', authenticate, authorizeAdmin, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  user.blocked = true;
  await user.save();
  res.json(user);
});

router.post('/users/:id/unblock', authenticate, authorizeAdmin, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  user.blocked = false;
  await user.save();
  res.json(user);
});

router.delete('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot purge your own account' });

    const { Op } = require('sequelize');

    // Delete related records first to avoid foreign key constraints
    await Investment.destroy({ where: { userId: id } });
    await Deposit.destroy({ where: { userId: id } });
    await Withdrawal.destroy({ where: { userId: id } });
    await Transaction.destroy({ where: { userId: id } });
    
    // Delete referrals where user is either referrer OR referred
    await Referral.destroy({ 
      where: { 
        [Op.or]: [{ referrerId: id }, { referredId: id }] 
      } 
    });

    // Remove reference from downlines by setting referredBy to null
    await User.update({ referredBy: null }, { where: { referredBy: id } });

    await user.destroy();
    res.json({ message: `User ID ${id} and all associated data deleted successfully` });
  } catch (err) {
    console.error('[ADMIN] Delete User Error:', err);
    res.status(500).json({ message: 'Internal server error: ' + err.message });
  }
});

// Admin: reset a user's password to a generated temporary password and email it
router.post('/users/:id/reset-password', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });

    // generate a simple temporary password
    const temp = Math.random().toString(36).slice(2, 10) + String(Math.floor(Math.random() * 90) + 10);
    const hash = await bcrypt.hash(temp, 10);

    user.password = hash;
    await user.save();

    // send email (logs by default) — in production integrate real mailer
    try {
      await sendPasswordResetEmail(user.email, temp);
    } catch (mailErr) {
      console.error('Failed sending reset email', mailErr);
    }

    // return temp password to admin so they can relay it if needed
    res.json({ message: 'Password reset', tempPassword: temp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regional Activity Report
router.get('/regional-activity', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullName', 'username', 'country', 'balance', 'currency'],
      include: [
        { model: Deposit, attributes: ['id', 'amount', 'status'] },
        { model: Withdrawal, attributes: ['id', 'amount', 'status'] },
        { model: Investment, attributes: ['id', 'amount', 'status'] },
        { model: Referral, attributes: ['id', 'commission'] },
        { model: User, as: 'upline', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'downline', attributes: ['id'] }
      ]
    });

    const report = {};

    users.forEach(user => {
      const country = user.country || 'Global';
      if (!report[country]) {
        report[country] = {
          depositors: [],
          withdrawers: [],
          investors: [],
          referrers: []
        };
      }

      if (user.Deposits && user.Deposits.length > 0) {
        const total = user.Deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);
        report[country].depositors.push({ ...user.get({ plain: true }), totalActivity: total });
      }

      if (user.Withdrawals && user.Withdrawals.length > 0) {
        const total = user.Withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
        report[country].withdrawers.push({ ...user.get({ plain: true }), totalActivity: total });
      }

      if (user.Investments && user.Investments.length > 0) {
        const total = user.Investments.reduce((sum, i) => sum + parseFloat(i.amount), 0);
        report[country].investors.push({ ...user.get({ plain: true }), totalActivity: total });
      }

      if ((user.Referrals && user.Referrals.length > 0) || (user.downline && user.downline.length > 0)) {
        const total = user.Referrals ? user.Referrals.reduce((sum, r) => sum + parseFloat(r.commission), 0) : 0;
        report[country].referrers.push({ ...user.get({ plain: true }), totalActivity: total });
      }
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/gateways', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Setting } = require('../models');
    const proc = req.body;
    let setting = await Setting.findByPk('paymentProcedures');
    let procedures = {};
    if (setting && setting.value) {
      try { procedures = JSON.parse(setting.value); } catch (e) { procedures = {}; }
    }
    if (!proc || !proc.country) return res.status(400).json({ error: 'Invalid procedure' });
    procedures[proc.country] = proc;
    const value = JSON.stringify(procedures);
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key: 'paymentProcedures', value });
    }
    res.json({ success: true, procedures });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save gateway' });
  }
});

router.delete('/gateways', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Setting } = require('../models');
    const { country } = req.body;
    let setting = await Setting.findByPk('paymentProcedures');
    if (!setting || !setting.value) return res.json({ success: true });
    let procedures = JSON.parse(setting.value);
    delete procedures[country];
    setting.value = JSON.stringify(procedures);
    await setting.save();
    res.json({ success: true, procedures });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gateway' });
  }
});

// Admin: full transaction ledger
router.get('/transactions', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const txs = await Transaction.findAll({
      include: [{ model: User, attributes: ['id', 'fullName', 'email', 'country', 'currency'] }],
      order: [['createdAt', 'DESC']],
      limit: 2000
    });
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;