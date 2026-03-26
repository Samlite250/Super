const { Deposit, User, Transaction } = require('../models');
const axios = require('axios');
const crypto = require('crypto');

exports.request = async (req, res) => {
  const { amount, paymentMethod } = req.body;
  const deposit = await Deposit.create({ 
    userId: req.user.id, 
    amount, 
    currency: req.user.currency, 
    status: 'pending',
    paymentMethod: paymentMethod || 'manual',
    txRef: `SC-${Date.now()}-${req.user.id}`
  });
  res.json(deposit);
};

exports.initiateAutomaticDeposit = async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;
    const user = req.user;

    const txRef = `SC-${Date.now()}-${user.id}`;
    
    // Map legacy or custom currency codes to ISO standards for Flutterwave
    let flwCurrency = user.currency || 'RWF';
    if (flwCurrency === 'FBu') flwCurrency = 'BIF';

    // Create pending deposit record
    const deposit = await Deposit.create({
      userId: user.id,
      amount,
      currency: user.currency || 'RWF', 
      status: 'pending',
      paymentMethod: 'automatic',
      txRef,
      payerNumber: phoneNumber
    });

    // Flutterwave payload
    const payload = {
      tx_ref: txRef,
      amount: amount,
      currency: flwCurrency,
      redirect_url: process.env.FLUTTERWAVE_REDIRECT_URL,
      customer: {
        email: user.email,
        phonenumber: phoneNumber || user.phone,
        name: user.fullName
      },
      customizations: {
        title: "Tracova Deposit",
        description: `Funding account for ${user.email}`,
      }
    };

    const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      res.json({
        status: 'success',
        link: response.data.data.link,
        depositId: deposit.id
      });
    } else {
      res.status(400).json({ message: 'Failed to initiate payment' });
    }

  } catch (err) {
    console.error('[FLW INIT ERROR]:', err.response?.data || err.message);
    res.status(500).json({ message: 'Payment gateway error' });
  }
};

exports.handleWebhook = async (req, res) => {
  const payload = req.body;
  console.log('[PAYMENT WEBHOOK RECEIVED]:', payload.event, payload.data?.tx_ref);

  if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
    const { tx_ref, amount, id: flwId } = payload.data;

    const deposit = await Deposit.findOne({ where: { txRef: tx_ref } });
    if (deposit && deposit.status === 'pending') {
      const user = await User.findByPk(deposit.userId);
      
      // Verification call to Flutterwave
      const verifyRes = await axios.get(`https://api.flutterwave.com/v3/transactions/${flwId}/verify`, {
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
      });

      if (verifyRes.data.status === 'success' && verifyRes.data.data.amount >= deposit.amount) {
        deposit.status = 'approved';
        await deposit.save();

        user.balance = parseFloat(user.balance) + parseFloat(deposit.amount);
        await user.save();

        await Transaction.create({ 
          userId: user.id, 
          type: 'deposit', 
          amount: deposit.amount, 
          description: `Automated Deposit #${deposit.id} via Flutterwave`
        });
      }
    }
  }
  res.status(200).end();
};

exports.uploadProof = async (req, res) => {
  const { id } = req.params;
  const deposit = await Deposit.findByPk(id);
  if (!deposit || deposit.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });
  try {
    const { payerNumber, payerNames } = req.body;
    if (!payerNumber || !payerNames) return res.status(400).json({ message: 'Payer number and names are required' });
    if (req.file) {
      deposit.proofUrl = req.file.buffer 
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
        : `/uploads/${req.file.filename}`;
    }
    deposit.payerNumber = payerNumber;
    deposit.payerNames = payerNames;
    deposit.proofUploadedAt = new Date();

    // Try to save; if it fails due to column size, auto-alter and retry
    try {
      await deposit.save();
    } catch (saveErr) {
      // Check if this is a "value too long" or "data truncated" error
      const errMsg = saveErr.message || '';
      const isColumnError = errMsg.includes('value too long') || errMsg.includes('Data too long') || 
                            errMsg.includes('String or binary data would be truncated') || saveErr.name === 'SequelizeDatabaseError';
      if (isColumnError) {
        // Attempt to alter the column and retry
        const { sequelize } = require('../models');
        try {
          const dialect = sequelize.getDialect();
          if (dialect === 'postgres') {
            await sequelize.query('ALTER TABLE "Deposits" ALTER COLUMN "proofUrl" TYPE TEXT');
          } else {
            await sequelize.query('ALTER TABLE `Deposits` MODIFY COLUMN `proofUrl` LONGTEXT');
          }
          console.log('[DEPOSIT] proofUrl column auto-altered to TEXT');
          await deposit.save();
        } catch (alterErr) {
          console.error('[DEPOSIT] Auto-alter failed:', alterErr.message);
          throw saveErr; // re-throw original error
        }
      } else {
        throw saveErr;
      }
    }

    res.json(deposit);
  } catch (err) {
    console.error('[DEPOSIT] uploadProof error:', err.message);
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
};


// admin
exports.list = async (req, res) => {
  const deposits = await Deposit.findAll({ include: [User] });
  res.json(deposits);
};

exports.approve = async (req, res) => {
  const { id } = req.params;
  const deposit = await Deposit.findByPk(id);
  if (!deposit) return res.status(404).json({ message: 'Not found' });
  deposit.status = 'approved';
  await deposit.save();
  const user = await User.findByPk(deposit.userId);
  user.balance = parseFloat(user.balance) + parseFloat(deposit.amount);
  await user.save();
  await Transaction.create({ userId: user.id, type: 'deposit', amount: deposit.amount, description: 'Deposit approved' });
  res.json(deposit);
};

exports.reject = async (req, res) => {
  const { id } = req.params;
  const deposit = await Deposit.findByPk(id);
  if (!deposit) return res.status(404).json({ message: 'Not found' });
  deposit.status = 'rejected';
  await deposit.save();
  res.json(deposit);
};