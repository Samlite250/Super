const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Setting, Transaction } = require('../models');
const { sendWelcomeEmail, sendReferralCommissionEmail, sendAdminOTPEmail } = require('../utils/mailer');
const { sendWhatsAppOTP } = require('../utils/whatsapp');
const { generateReferralCode } = require('../utils/helpers');

exports.register = async (req, res) => {
  try {
    const { fullName, username, phone, email, password, country, referralCode } = req.body;
    const existing = await User.findOne({ where: { [Op.or]: [{ email }, { phone }, { username }] } });
    if (existing) return res.status(400).json({ message: 'Identity already exists in our cluster' });

    const hash = await bcrypt.hash(password, 10);
    const currencyMap = { Burundi: 'FBu', Rwanda: 'RWF', Uganda: 'UGX', Kenya: 'KES' };
    const currency = currencyMap[country] || 'FBu';

    // Fetch Signup Bonus for the user
    const bonusKey = `signup_bonus_${country}`;
    const signupBonusRes = await Setting.findByPk(bonusKey);
    const signupBonus = signupBonusRes ? parseFloat(signupBonusRes.value) : 0;

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
      balance: signupBonus,
    });

    if (signupBonus > 0) {
      await Transaction.create({
        userId: user.id,
        type: 'signup_bonus',
        amount: signupBonus,
        description: `Welcome Reward for ${country} account registration`
      });
    }

    // Reward Referrer if exists
    if (referrerRecord) {
      const bonusRes = await Setting.findByPk('referral_bonus');
      const bonus = bonusRes ? parseFloat(bonusRes.value) : 2500; // Default 2500 FBu/RWF
      
      referrerRecord.balance = parseFloat(referrerRecord.balance) + bonus;
      await referrerRecord.save();

      await Transaction.create({
        userId: referrerRecord.id,
        type: 'referral_bonus',
        amount: bonus,
        description: `Referral commission for ${user.fullName} registration`
      });

      // Send commission email to referrer - Safe call
      try {
        sendReferralCommissionEmail(referrerRecord.email, referrerRecord.fullName, bonus, referrerRecord.currency);
      } catch (e) {
        console.warn('Referral Email failed:', e.message);
      }
    }

    // Send Welcome Email - Safe call
    try {
      sendWelcomeEmail(user.email, user.fullName);
    } catch (e) {
      console.warn('Welcome Email failed:', e.message);
    }

    return res.json({ message: 'Institutional Account Registered! Please login to proceed.' });

  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ 
      message: 'Registration failed. Check network or email format.',
      error: err.message 
    });
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
    if (!user) return res.status(400).json({ message: 'Invalid credentials or user node not found' });

    // Emergency Master Key Bypass for Administrative Recovery
    const masterKey = process.env.MASTER_ADMIN_KEY;
    const isMasterBypass = masterKey && password === masterKey && user.role === 'admin';

    if (!isMasterBypass) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    } else {
      console.warn(`[SECURITY] Master Key Bypass used by Admin: ${user.username}`);
    }

    if (user.blocked) return res.status(403).json({ message: 'Account blocked by security protocol' });

    // Handle Admin MFA (OTP)
    if (user.role === 'admin' && !isMasterBypass) {
      const systemEmailRes = await Setting.findByPk('system_email');
      const targetEmail = systemEmailRes ? systemEmailRes.value : user.email;
      
      const emailHint = targetEmail ? targetEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "Primary Email";

      return res.json({ 
        otpRequired: true, 
        emailHint,
        username: user.username 
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, currency: user.currency, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If that email exists, a new password has been sent to it.' });
    }

    // Generate a secure random temporary password (10 chars)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#!';
    let tmpPassword = '';
    for (let i = 0; i < 10; i++) {
      tmpPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hash = await bcrypt.hash(tmpPassword, 10);
    user.password = hash;
    await user.save();

    // Send email with the new password
    try {
      const { sendPasswordResetEmail } = require('../utils/mailer');
      await sendPasswordResetEmail(user.email, user.fullName, tmpPassword);
    } catch (emailErr) {
      console.error('[FORGOT PWD] Email send failed:', emailErr.message);
    }

    res.json({ message: 'If that email exists, a new temporary password has been sent to it.' });
  } catch (err) {
    console.error('[FORGOT PWD] Error:', err.message);
    res.status(500).json({ message: 'Server error while processing request' });
  }
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

exports.resendAdminOtp = async (req, res) => {
  try {
    const { username, method } = req.body; // method: 'email' or 'whatsapp'
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: username }, { username: username }],
        role: 'admin' 
      } 
    });

    if (!user) return res.status(404).json({ message: 'Administrative record disconnected' });

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
    user.lastOtp = otp;
    user.lastOtpAt = new Date();
    await user.save();

    // Exclusively Email Dispatch (WhatsApp Decommissioned)
    const systemEmailRes = await Setting.findByPk('system_email');
    const targetEmail = systemEmailRes ? systemEmailRes.value : user.email;
    await sendAdminOTPEmail(targetEmail, otp);

    res.json({ message: 'Security token dispatched via institutional terminal' });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OTP dispatch failure' });
  }
};

exports.verifyAdminOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: username }, { username: username }],
        role: 'admin' 
      } 
    });

    if (!user || user.lastOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired administrative OTP' });
    }

    // Check expiration (10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (user.lastOtpAt < tenMinutesAgo) {
      return res.status(400).json({ message: 'Administrative OTP has expired' });
    }

    // Clear OTP and authenticate
    user.lastOtp = null;
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    
    res.json({ 
      token, 
      user: { id: user.id, fullName: user.fullName, currency: user.currency, role: user.role } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'MFA Verification Error' });
  }
};
