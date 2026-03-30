const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { User, Transaction, Deposit, Withdrawal } = require('../models');
const authController = require('../controllers/authController');
const { calculateDailyReturns } = require('../utils/cron');

router.get('/me', authenticate, async (req, res) => {
  // Synchronize missed returns dynamically before returning balance
  try {
    await calculateDailyReturns(req.user.id);
  } catch (syncErr) {
    console.error('Error synchronizing user returns:', syncErr);
  }

  const user = await User.findByPk(req.user.id, {
    include: [{ model: User, as: 'upline', attributes: ['id', 'username', 'fullName'] }]
  });
  res.json(user);
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    const deposits = await Deposit.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const withdrawals = await Withdrawal.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ transactions, deposits, withdrawals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load history' });
  }
});

router.put('/me', authenticate, async (req, res) => {
  const user = req.user;
  const { fullName, phone } = req.body;
  user.fullName = fullName || user.fullName;
  user.phone = phone || user.phone;
  await user.save();
  res.json(user);
});

router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;