const { Machine } = require('../models');

exports.list = async (req, res) => {
  const machines = await Machine.findAll({ order: [['priceFBu', 'ASC']] });
  // attempt to decode token if provided for currency conversion
  let userCurrency;
  try {
    const header = req.headers.authorization;
    if (header) {
      const token = header.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { User, ExchangeRate } = require('../models');
      const user = await User.findByPk(decoded.id);
      if (user) userCurrency = user.currency;
      if (userCurrency && userCurrency !== 'FBu') {
        const { User, ExchangeRate } = require('../models');
        const rate = await ExchangeRate.findOne({ where: { currency: userCurrency } });
        
        // Specialized Price Ladder for Rwanda (RWF)
        const rwLadder = [5000, 10000, 20000, 50000, 100000, 150000, 200000, 300000, 400000, 500000, 700000, 900000, 1100000, 1300000, 1500000];

        // Specialized Price Ladder for Kenya (KES)
        const keLadder = [650, 7746, 14843, 21939, 29036, 36132, 43229, 50325, 57421, 64518, 71614, 78711, 85807, 92904, 100000];

        machines.forEach((m, idx) => {
          let convertedPrice;
          if (userCurrency === 'RWF' && rwLadder[idx]) {
            convertedPrice = rwLadder[idx];
          } else if (userCurrency === 'KES' && keLadder[idx]) {
            convertedPrice = keLadder[idx];
          } else if (rate) {
            convertedPrice = (parseFloat(m.priceFBu) / parseFloat(rate.rateToFBu)).toFixed(2);
          } else {
            convertedPrice = m.priceFBu;
          }
          
          m.setDataValue('price', convertedPrice);
          m.setDataValue('currency', userCurrency);
        });
      }
    }
  } catch (err) {
    // ignore
  }
  res.json(machines);
};

exports.create = async (req, res) => {
  const { name, description, priceFBu, durationDays, dailyPercent, premium } = req.body;
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const machine = await Machine.create({ 
      name, 
      description, 
      priceFBu: parseFloat(priceFBu), 
      durationDays: parseInt(durationDays), 
      dailyPercent: parseFloat(dailyPercent), 
      premium: premium === 'true' || premium === true,
      imageUrl 
    });
    res.json(machine);
  } catch (err) {
    console.error('[MACHINE] create error:', err);
    res.status(500).json({ message: 'Deployment failed: ' + err.message });
  }
};


exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, description, priceFBu, durationDays, dailyPercent, premium } = req.body;
  try {
    console.log(`[MACHINE] Update attempt for ID: ${id}`);
    
    const machine = await Machine.findByPk(id);
    if (!machine) {
      return res.status(404).json({ message: `Machine with ID ${id} not found.` });
    }

    if (req.file) {
      machine.imageUrl = `/uploads/${req.file.filename}`;
      console.log(`[MACHINE] Image uploaded: ${req.file.filename}`);
    }

    // Sanitize and validate inputs
    machine.name = name || machine.name;
    machine.description = description === 'null' ? '' : (description || machine.description);
    
    const parsedPrice = parseFloat(priceFBu);
    if (!isNaN(parsedPrice)) machine.priceFBu = parsedPrice;
    
    const parsedDuration = parseInt(durationDays);
    if (!isNaN(parsedDuration)) machine.durationDays = parsedDuration;
    
    const parsedPercent = parseFloat(dailyPercent);
    if (!isNaN(parsedPercent)) machine.dailyPercent = parsedPercent;
    
    machine.premium = (premium === 'true' || premium === true);

    await machine.save();
    console.log(`[MACHINE] Successfully updated machine: ${machine.name}`);
    res.json(machine);
  } catch (err) {
    console.error(`[MACHINE] CRITICAL UPDATE ERROR for ID ${id}:`, err);
    res.status(500).json({ 
      message: `Update failed: ${err.name} - ${err.message}`,
      details: err.errors ? err.errors.map(e => e.message) : []
    });
  }
};



exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    console.log('[MACHINE] delete', id);
    const { Investment } = require('../models');
    const invCount = await Investment.count({ where: { machineId: id } });
    if (invCount > 0) {
      return res.status(400).json({ message: 'Cannot delete plan with existing investments' });
    }
    await Machine.destroy({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[MACHINE] delete error', err);
    res.status(500).json({ message: 'Delete failed' });
  }
};