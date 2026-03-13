const { Investment, Machine, User, Transaction } = require('../models');

exports.invest = async (req, res) => {
  try {
    const { machineId, amount } = req.body;
    const user = req.user;
    const machine = await Machine.findByPk(machineId);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    if (parseFloat(user.balance) < parseFloat(amount))
      return res.status(400).json({ message: 'Insufficient balance' });
    // ensure amount equals price maybe
    user.balance = parseFloat(user.balance) - parseFloat(amount);
    await user.save();
    const dailyIncome = (parseFloat(amount) * parseFloat(machine.dailyPercent)) / 100;
    const inv = await Investment.create({
      userId: user.id,
      machineId,
      amount,
      dailyIncome,
      startDate: new Date(),
      status: 'active'
    });
    await Transaction.create({ userId: user.id, type: 'investment', amount, description: `Invested in ${machine.name}` });
    res.json(inv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listUser = async (req, res) => {
  const inv = await Investment.findAll({ where: { userId: req.user.id }, include: [Machine] });
  res.json(inv);
};

exports.listAll = async (req, res) => {
  const inv = await Investment.findAll({ include: [Machine, User] });
  res.json(inv);
};
