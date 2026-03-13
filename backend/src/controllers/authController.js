const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Setting, Transaction } = require('../models');
const { sendWelcomeEmail, sendReferralCommissionEmail } = require('../utils/mailer');
const { generateReferralCode } = require('../utils/helpers');

exports.register = async (req, res) => {
  try {
    const { fullName, username, phone, email, password, country, referralCode } = req.body;
    const existing = await User.findOne({ where: { [Op.or]: [{ email }, { phone }, { username }] } });
    if (existing) return res.status(400).json({ message: 'Identity already exists in our cluster' });

    const hash = await bcrypt.hash(password, 10);
    const currencyMap = { Burundi: 'FBu', Rwanda: 'RWF', Uganda: 'UGX', Kenya: 'KES' };
    const currency = currencyMap[country] || 'FBu';

    let referredBy = null;
    let referrerRecord = null;
    if (referralCode) {
      referrerRecord = await User.findOne({ where: { referralCode } });
      if (referrerRecord) referredBy = referrerRecord.id;
    }

    const user = await User.create({
      fullName,
      username,
      phone,
      email,
      password: hash,
      country,
      currency,
      referralCode: username,
      referredBy,
      isVerified: true,
      balance: 0,
    });

    // Reward Referrer if exists
    if (referrerRecord) {
      const bonusRes = await Setting.findByPk('signupBonus');
      const bonus = bonusRes ? parseFloat(bonusRes.value) : 2500; // Default 2500 FBu/RWF
      
      referrerRecord.balance = parseFloat(referrerRecord.balance) + bonus;
      await referrerRecord.save();

      await Transaction.create({
        userId: referrerRecord.id,
        type: 'referral_bonus',
        amount: bonus,
        description: `Referral commission for ${user.fullName} registration`
      });

      // Send commission email to referrer
      sendReferralCommissionEmail(referrerRecord.email, referrerRecord.fullName, bonus, referrerRecord.currency);
    }

    // Send Welcome Email
    sendWelcomeEmail(user.email, user.fullName);

    res.json({ message: 'Institutional Account Registered! Please login to proceed.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { loginIdentifier, email, password } = req.body;
    const identifier = loginIdentifier || email;

    if (!identifier) {
      return res.status(400).json({ message: 'Login identifier is required' });
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: identifier }, { username: identifier }] 
      } 
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.blocked) return res.status(403).json({ message: 'Account blocked' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({ token, user: { id: user.id, fullName: user.fullName, currency: user.currency } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  // implementation stub
  res.json({ message: 'Check your email for reset instructions' });
};

exports.resetPassword = async (req, res) => {
  // given token and new password
  res.json({ message: 'Password changed' });
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (user) {
      user.isVerified = true;
      await user.save();
      return res.json({ message: 'Email verified' });
    }
    res.status(400).json({ message: 'Invalid token' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
