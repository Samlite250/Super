const { Machine } = require('../models');

exports.list = async (req, res) => {
  let machines = await Machine.findAll({ order: [['priceFBu', 'ASC']] });
  
  // Auto-seed the 15 plans if the database is empty (fixing the "Registry Void" issue)
  if (machines.length === 0) {
     const plans = ['Tractor X200', 'Plow Deluxe', 'Harvester Pro', 'Mini Cultivator', 'Seeder M1', 'Miller 250', 'Irrigation Machine', 'Crop Duster', 'Harvest Titan', 'Pro Seeder 900', 'Mega Agro Combine', 'Deep Well Driller', 'Soil Nutrient Lab', 'Autonomous Crop Rover', 'Silo Storage Unit'];
     const basePrices = [15000, 30000, 60000, 150000, 300000, 450000, 600000, 900000, 1200000, 1500000, 2100000, 2700000, 3300000, 3900000, 4500000];
     try {
       for (let i = 0; i < plans.length; i++) {
          await Machine.create({
              name: plans[i],
              description: 'Advanced automated agricultural equipment. Lease stake to generate daily agro-returns.',
              priceFBu: basePrices[i],
              durationDays: 30 + (i * 2), // e.g. 30 to 58 days
              dailyPercent: 5.0 + (i * 0.1), // e.g. 5.0 to 6.4%
              premium: i >= 10,
              imageUrl: null
          });
       }
       machines = await Machine.findAll({ order: [['priceFBu', 'ASC']] });
     } catch (seedErr) {
       console.error('[MACHINE] Auto-seed failed', seedErr);
     }
  }

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
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.buffer 
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
        : `/uploads/${req.file.filename}`;
    }
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
      machine.imageUrl = req.file.buffer 
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
        : `/uploads/${req.file.filename}`;
      console.log(`[MACHINE] Image uploaded or updated for ID: ${id}`);
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

    // Try to save; auto-alter imageUrl column if too short, then retry
    try {
      await machine.save();
    } catch (saveErr) {
      const errMsg = saveErr.message || '';
      const isColumnError = errMsg.includes('value too long') || errMsg.includes('Data too long') || 
                            errMsg.includes('String or binary data would be truncated') || saveErr.name === 'SequelizeDatabaseError';
      if (isColumnError) {
        const { sequelize } = require('../models');
        try {
          const dialect = sequelize.getDialect();
          if (dialect === 'postgres') {
            await sequelize.query('ALTER TABLE "Machines" ALTER COLUMN "imageUrl" TYPE TEXT');
          } else {
            await sequelize.query('ALTER TABLE `Machines` MODIFY COLUMN `imageUrl` LONGTEXT');
          }
          console.log('[MACHINE] imageUrl column auto-altered to TEXT');
          await machine.save();
        } catch (alterErr) {
          console.error('[MACHINE] Auto-alter failed:', alterErr.message);
          throw saveErr;
        }
      } else {
        throw saveErr;
      }
    }

    console.log(`[MACHINE] Successfully updated machine: ${machine.name}`);
    res.json(machine);
  } catch (err) {
    console.error(`[MACHINE] CRITICAL UPDATE ERROR for ID ${id}:`, err.message);
    res.status(500).json({ 
      message: `Update failed: ${err.message}`,
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