const { Deposit, User, Transaction } = require('../models');

exports.request = async (req, res) => {
  const { amount } = req.body;
  // currency derived from user
  const deposit = await Deposit.create({ userId: req.user.id, amount, currency: req.user.currency, status: 'pending' });
  res.json(deposit);
};

exports.uploadProof = async (req, res) => {
  const { id } = req.params;
  const deposit = await Deposit.findByPk(id);
  if (!deposit || deposit.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });
  try {
    const { payerNumber, payerNames } = req.body;
    if (!payerNumber || !payerNames) return res.status(400).json({ message: 'Payer number and names are required' });
    if (req.file) deposit.proofUrl = `/uploads/${req.file.filename}`;
    deposit.payerNumber = payerNumber;
    deposit.payerNames = payerNames;
    deposit.proofUploadedAt = new Date();
    await deposit.save();
    res.json(deposit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
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