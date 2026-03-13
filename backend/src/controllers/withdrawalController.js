const { Withdrawal, User, Transaction } = require('../models');
const { sendWithdrawalRequestEmail, sendWithdrawalApprovalEmail } = require('../utils/mailer');

exports.request = async (req, res) => {
  const { amount, phone, network } = req.body;
  if (parseFloat(amount) > parseFloat(req.user.balance))
    return res.status(400).json({ message: 'Insufficient balance' });
  const fee = parseFloat(process.env.WITHDRAWAL_FEE || 0) * parseFloat(amount);
  const withdrawal = await Withdrawal.create({
    userId: req.user.id,
    amount,
    phone,
    network,
    fee,
    status: 'pending',
  });

  // Notify user of initiation
  sendWithdrawalRequestEmail(req.user.email, amount, req.user.currency, network);

  res.json(withdrawal);
};

// admin
exports.list = async (req, res) => {
  const list = await Withdrawal.findAll({ include: [User] });
  res.json(list);
};

exports.approve = async (req, res) => {
  const { id } = req.params;
  const withdrawal = await Withdrawal.findByPk(id, { include: [User] });
  if (!withdrawal) return res.status(404).json({ message: 'Not found' });
  withdrawal.status = 'approved';
  await withdrawal.save();
  const user = await User.findByPk(withdrawal.userId);
  user.balance = parseFloat(user.balance) - parseFloat(withdrawal.amount) - parseFloat(withdrawal.fee);
  await user.save();
  await Transaction.create({ userId: user.id, type: 'withdrawal', amount: withdrawal.amount, description: 'Withdrawal approved' });

  // Notify user of disbursement
  if (user) {
    sendWithdrawalApprovalEmail(user.email, withdrawal.amount, user.currency);
  }

  res.json(withdrawal);
};


exports.reject = async (req, res) => {
  const { id } = req.params;
  const withdrawal = await Withdrawal.findByPk(id);
  if (!withdrawal) return res.status(404).json({ message: 'Not found' });
  withdrawal.status = 'rejected';
  await withdrawal.save();
  res.json(withdrawal);
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

    // CSV Headers - Optimized for Payout Agents
    let csv = 'DISBURSEMENT_ID,BENEFICIARY_NAME,PAYMENT_METHOD,RECIPIENT_PHONE,GROSS_AMOUNT,SERVICE_FEE,NET_PAYOUT_TOTAL,STATUS,REGION,REQUEST_DATE\n';

    withdrawals.forEach((w) => {
      const receiveTotal = (parseFloat(w.amount) - (w.fee ? parseFloat(w.fee) : 0)).toFixed(2);
      const row = [
        `#WF-${w.id.toString().padStart(4, '0')}`,
        `"${w.User ? w.User.fullName : 'N/A'}"`,
        w.network.toUpperCase(),
        `'${w.phone}`, // Added quote to prevent Excel from scientific notation
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