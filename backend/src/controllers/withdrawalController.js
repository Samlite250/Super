const { Withdrawal, User, Transaction } = require('../models');
const { sendWithdrawalRequestEmail, sendWithdrawalApprovalEmail } = require('../utils/mailer');
const axios = require('axios');

exports.request = async (req, res) => {
  const { amount, phone, network } = req.body;
  const user = req.user;
  const amt = parseFloat(amount);
  const fee = parseFloat(process.env.WITHDRAWAL_FEE || 0) * amt;
  const totalDeduct = amt + fee;

  if (totalDeduct > parseFloat(user.balance))
    return res.status(400).json({ message: 'Insufficient balance (including fees)' });

  const withdrawal = await Withdrawal.create({
    userId: user.id,
    amount: amt,
    phone,
    network,
    fee,
    status: 'pending',
  });

  // Deduct balance immediately to prevent double-spending
  user.balance = parseFloat(user.balance) - totalDeduct;
  await user.save();

  await Transaction.create({
    userId: user.id,
    type: 'withdrawal_request',
    amount: amt,
    description: `Withdrawal request #${withdrawal.id} (${network})`
  });

  // Notify user of initiation
  sendWithdrawalRequestEmail(user.email, amt, user.currency, network);

  res.json(withdrawal);
};

// admin
exports.list = async (req, res) => {
  const list = await Withdrawal.findAll({ include: [User] });
  res.json(list);
};

exports.approve = async (req, res) => {
  const { id } = req.params;
  const { autoDispatch } = req.body;

  try {
    const withdrawal = await Withdrawal.findByPk(id, { include: [User] });
    if (!withdrawal) return res.status(404).json({ message: 'Not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    const user = withdrawal.User;
    
    // Check balance
    const netAmount = parseFloat(withdrawal.amount);
    const totalDeduct = netAmount + parseFloat(withdrawal.fee);
    
    if (parseFloat(user.balance) < totalDeduct) {
      return res.status(400).json({ message: 'User has insufficient balance.' });
    }

    if (autoDispatch) {
      try {
        const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
        const network = (withdrawal.network || '').toUpperCase();
        const country = (user.country || '').toUpperCase();
        let account_bank = '';
        
        if (country === 'RWANDA') {
          account_bank = network.includes('MTN') ? 'MTN' : 'AIRTEL';
        } else if (country === 'UGANDA') {
          account_bank = network.includes('MTN') ? 'MTN_UG' : 'AIRTEL_UG';
        } else if (country === 'KENYA') {
          account_bank = 'MPS';
        }

        const transferPayload = {
          account_bank: account_bank,
          account_number: withdrawal.phone,
          amount: netAmount,
          currency: user.currency === 'FBu' ? 'BIF' : (user.currency || 'RWF'),
          narration: `Tracova Payout #${withdrawal.id}`,
          reference: `SC-W-${withdrawal.id}-${Date.now()}`,
          debit_currency: "RWF" 
        };

        const response = await axios.post('https://api.flutterwave.com/v3/transfers', transferPayload, {
          headers: { Authorization: `Bearer ${flwSecretKey}` }
        });

        if (response.data.status !== 'success' && response.data.status !== 'pending') {
          throw new Error(response.data.message || 'Flutterwave Transfer Failed');
        }
        
        withdrawal.transferRef = response.data.data.id.toString();
      } catch (flwErr) {
        return res.status(400).json({ message: 'Automated dispatch failed: ' + (flwErr.response?.data?.message || flwErr.message) });
      }
    }

    // Finalize
    withdrawal.status = 'approved';
    await withdrawal.save();

    // Balance already deducted at request stage

    await Transaction.create({ 
      userId: user.id, 
      type: 'withdrawal_approved', 
      amount: withdrawal.amount, 
      description: `Withdrawal #${withdrawal.id} approved ${autoDispatch ? '(Automated)' : '(Manual)'}` 
    });

    sendWithdrawalApprovalEmail(user.email, withdrawal.amount, user.currency);
    res.json(withdrawal);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.reject = async (req, res) => {
  const { id } = req.params;
  try {
    const withdrawal = await Withdrawal.findByPk(id, { include: [User] });
    if (!withdrawal) return res.status(404).json({ message: 'Not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    withdrawal.status = 'rejected';
    await withdrawal.save();

    // Refund balance
    const user = withdrawal.User;
    const totalRefund = parseFloat(withdrawal.amount) + parseFloat(withdrawal.fee);
    user.balance = parseFloat(user.balance) + totalRefund;
    await user.save();

    await Transaction.create({
      userId: user.id,
      type: 'withdrawal_refund',
      amount: totalRefund,
      description: `Refund for rejected withdrawal #${withdrawal.id}`
    });

    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ message: 'Reject failed' });
  }
};

exports.exportWithdrawals = async (req, res) => {
  try {
    const { country } = req.query;
    const where = {};
    const include = [{
      model: User,
      where: country ? { country } : {}
    }];

    const withdrawals = await Withdrawal.findAll({
      where,
      include
    });

    if (withdrawals.length === 0) {
      return res.status(404).json({ message: 'No withdrawals found for this country' });
    }

    let csv = 'DISBURSEMENT_ID,BENEFICIARY_NAME,PAYMENT_METHOD,RECIPIENT_PHONE,GROSS_AMOUNT,SERVICE_FEE,NET_PAYOUT_TOTAL,STATUS,REGION,REQUEST_DATE\n';

    withdrawals.forEach((w) => {
      const receiveTotal = (parseFloat(w.amount) - (w.fee ? parseFloat(w.fee) : 0)).toFixed(2);
      const row = [
        `#WF-${w.id.toString().padStart(4, '0')}`,
        `"${w.User ? w.User.fullName : 'N/A'}"`,
        w.network.toUpperCase(),
        `'${w.phone}`,
        w.amount,
        w.fee || 0,
        receiveTotal,
        w.status.toUpperCase(),
        w.User ? w.User.country.toUpperCase() : 'N/A',
        new Date(w.createdAt).toLocaleDateString()
      ];
      csv += row.join(',') + '\n';
    });


    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=withdrawals_${country || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
};

exports.deleteWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdrawal.findByPk(id);
    if (!withdrawal) return res.status(404).json({ message: 'Not found' });
    
    await withdrawal.destroy();
    res.json({ message: 'Withdrawal record purged from registry' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed: ' + err.message });
  }
};