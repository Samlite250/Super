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
    
    // Referral High-Commission Reward (if amount > threshold)
    if (user.referredBy) {
      const { Setting } = require('../models');
      const thresholdRes = await Setting.findByPk('referral_high_capital_threshold');
      const threshold = thresholdRes ? parseFloat(thresholdRes.value) : 500000;
      
      const isHighCapital = parseFloat(amount) >= threshold;
      
      const referrer = await User.findByPk(user.referredBy);
      if (referrer) {
        // Fetch dynamic commission rates
        const baseRateRes = await Setting.findByPk('referral_reward_percentage');
        const baseRate = baseRateRes ? parseFloat(baseRateRes.value) : 10; // Default 10%
        
        const highBonusRes = await Setting.findByPk('referral_high_capital_bonus');
        const highBonus = highBonusRes ? parseFloat(highBonusRes.value) : 5; // Default 5% extra
        
        const finalRate = (isHighCapital ? (baseRate + highBonus) : baseRate) / 100;
        const rewardAmount = parseFloat(amount) * finalRate;
        
        referrer.balance = parseFloat(referrer.balance) + rewardAmount;
        await referrer.save();

        await Transaction.create({
          userId: referrer.id,
          type: 'referral_bonus',
          amount: rewardAmount,
          description: `${isHighCapital ? 'High-Yield' : 'Standard'} Commission for ${user.username}'s activation of ${amount} ${user.currency}`
        });
        
        // Also log in Referral table if exists
        const { Referral } = require('../models');
        await Referral.create({
          referrerId: referrer.id,
          referredId: user.id,
          commission: rewardAmount
        }).catch(() => {}); // Catch-all for schema drift
      }
    }


    await Transaction.create({ userId: user.id, type: 'investment', amount, description: `Invested in ${machine.name}` });
    res.json(inv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const { calculateDailyReturns } = require('../utils/cron');

exports.listUser = async (req, res) => {
  try {
    await calculateDailyReturns(req.user.id);
  } catch (err) {
    console.error('Error syncing returns on listUser:', err);
  }
  const inv = await Investment.findAll({ where: { userId: req.user.id }, include: [Machine] });
  res.json(inv);
};

exports.listAll = async (req, res) => {
  const inv = await Investment.findAll({ include: [Machine, User] });
  res.json(inv);
};
