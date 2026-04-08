const { Machine } = require('../models');

// Helper: fetch machines with fallback if 'country' column doesn't exist yet in DB
async function fetchMachinesSafe(whereClause) {
  try {
    return await Machine.findAll({ where: whereClause, order: [['priceFBu', 'ASC']] });
  } catch (dbErr) {
    // country column likely missing — fall back without it
    const errMsg = dbErr.message || '';
    const isColumnError = errMsg.includes('country') || errMsg.includes('column') || errMsg.includes('does not exist');
    if (isColumnError) {
      console.warn('[MACHINE] country column missing, using fallback query. Run /api/setup-db to fix.');
      // Return all machines without country filtering; treat them all as 'Global'
      const rows = await Machine.findAll({
        attributes: ['id', 'name', 'description', 'priceFBu', 'durationDays', 'dailyPercent', 'imageUrl', 'premium', 'createdAt', 'updatedAt'],
        order: [['priceFBu', 'ASC']]
      });
      // Patch in a default country value
      rows.forEach(r => r.setDataValue('country', 'Global'));
      return rows;
    }
    throw dbErr;
  }
}

exports.list = async (req, res) => {
  try {
    let userCountry = null;
    let userCurrency = null;
    let isAdmin = false;

    try {
      const header = req.headers.authorization;
      if (header) {
        const token = header.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
          isAdmin = true;
        } else {
          const { User } = require('../models');
          const user = await User.findByPk(decoded.id);
          if (user) {
            userCurrency = user.currency;
            userCountry = user.country;
          }
        }
      }
    } catch (err) {
      // ignore auth errors
    }

    const { Op } = require('sequelize');
    let whereClause = {};
    let machines = [];
    
    if (!isAdmin && userCountry) {
      // Fetch plans for user's country OR any hot plans (which should be visible to everyone)
      whereClause = {
        [Op.or]: [
          { country: userCountry },
          { type: 'hot' } 
        ]
      };
      machines = await fetchMachinesSafe(whereClause);
      
      // Secondary fallback: if NOTHING found (not even hot plans), show Global normal plans
      if (machines.length === 0) {
        whereClause = { country: 'Global' };
        machines = await fetchMachinesSafe(whereClause);
      }
    } else if (!isAdmin) {
      whereClause = { country: 'Global' };
      machines = await fetchMachinesSafe(whereClause);
    } else {
      // If admin, fetch all
      machines = await fetchMachinesSafe({});
    }

    // Light fallback: only seed Global plans if the table is completely empty
    if (machines.length === 0 && Object.keys(whereClause).length === 0) {
      const GLOBAL_PLANS = [
        'Tractor X200', 'Plow Deluxe', 'Harvester Pro', 'Mini Cultivator',
        'Seeder M1', 'Miller 250', 'Irrigation Machine', 'Crop Duster',
        'Harvest Titan', 'Pro Seeder 900', 'Mega Agro Combine',
        'Deep Well Driller', 'Soil Nutrient Lab', 'Autonomous Crop Rover', 'Silo Storage Unit'
      ];
      const GLOBAL_PRICES = [15000, 30000, 60000, 150000, 300000, 450000, 600000, 900000, 1200000, 1500000, 2100000, 2700000, 3300000, 3900000, 4500000];
      try {
        const total = await Machine.count();
        if (total === 0) {
          for (let i = 0; i < GLOBAL_PLANS.length; i++) {
            await Machine.create({
              name: GLOBAL_PLANS[i],
              description: 'Advanced automated agricultural equipment. Lease stake to generate daily agro-returns.',
              priceFBu: GLOBAL_PRICES[i],
              durationDays: 30 + (i * 2),
              dailyPercent: 5.0 + (i * 0.1),
              premium: i >= 10,
              country: 'Global',
              imageUrl: null
            });
          }
          machines = await fetchMachinesSafe(whereClause);
        }
      } catch (seedErr) {
        console.error('[MACHINE] Global auto-seed failed', seedErr);
      }
    }

    // Currency conversion for non-FBu users
    if (userCurrency && userCurrency !== 'FBu') {
      const { ExchangeRate } = require('../models');
      const rate = await ExchangeRate.findOne({ where: { currency: userCurrency } });

      const rwLadder = [5000, 10000, 20000, 50000, 100000, 150000, 200000, 300000, 400000, 500000, 700000, 900000, 1100000, 1300000, 1500000];
      const keLadder = [650, 7746, 14843, 21939, 29036, 36132, 43229, 50325, 57421, 64518, 71614, 78711, 85807, 92904, 100000];
      const globalPlanNames = [
        'Tractor X200', 'Plow Deluxe', 'Harvester Pro', 'Mini Cultivator',
        'Seeder M1', 'Miller 250', 'Irrigation Machine', 'Crop Duster',
        'Harvest Titan', 'Pro Seeder 900', 'Mega Agro Combine',
        'Deep Well Driller', 'Soil Nutrient Lab', 'Autonomous Crop Rover', 'Silo Storage Unit'
      ];

      machines.forEach((m) => {
        let convertedPrice;
        const mCountry = m.country || m.getDataValue('country') || 'Global';

        if (mCountry !== 'Global') {
          convertedPrice = m.priceFBu; // exact local price set by admin
        } else {
          const gIdx = globalPlanNames.indexOf(m.name);
          if (userCurrency === 'RWF' && gIdx !== -1 && rwLadder[gIdx]) {
            convertedPrice = rwLadder[gIdx];
          } else if (userCurrency === 'KES' && gIdx !== -1 && keLadder[gIdx]) {
            convertedPrice = keLadder[gIdx];
          } else if (rate) {
            convertedPrice = (parseFloat(m.priceFBu) / parseFloat(rate.rateToFBu)).toFixed(2);
          } else {
            convertedPrice = m.priceFBu;
          }
        }

        m.setDataValue('price', convertedPrice);
        m.setDataValue('currency', userCurrency || 'FBu');
      });
    }

    res.json(machines);
  } catch (err) {
    console.error('[MACHINE] list error:', err.message);
    res.status(500).json({ message: 'Failed to load plans: ' + err.message });
  }
};

exports.create = async (req, res) => {
  const { name, description, priceFBu, durationDays, dailyPercent, premium, country } = req.body;
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
      country: country || 'Global',
      type: req.body.type || 'normal',
      payoutType: req.body.payoutType || 'daily',
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
  const { name, description, priceFBu, durationDays, dailyPercent, premium, country } = req.body;
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
    if (country) machine.country = country;
    if (req.body.type) machine.type = req.body.type;
    if (req.body.payoutType) machine.payoutType = req.body.payoutType;

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

// ─── Seed country plans (admin-triggered, avoids Vercel timeout) ─────────────
const PLAN_NAMES = [
  'Tractor X200', 'Plow Deluxe', 'Harvester Pro', 'Mini Cultivator',
  'Seeder M1', 'Miller 250', 'Irrigation Machine', 'Crop Duster',
  'Harvest Titan', 'Pro Seeder 900', 'Mega Agro Combine',
  'Deep Well Driller', 'Soil Nutrient Lab', 'Autonomous Crop Rover', 'Silo Storage Unit'
];

const COUNTRY_SEED_CONFIGS = [
  {
    country: 'Global',
    prices: [15000, 30000, 60000, 150000, 300000, 450000, 600000, 900000, 1200000, 1500000, 2100000, 2700000, 3300000, 3900000, 4500000]
  },
  {
    country: 'Uganda',
    prices: [20000, 40000, 85000, 200000, 400000, 600000, 800000, 1200000, 1600000, 2000000, 2800000, 3600000, 4400000, 5200000, 6000000]
  },
  {
    country: 'Rwanda',
    prices: [5000, 10000, 20000, 50000, 100000, 150000, 200000, 300000, 400000, 500000, 700000, 900000, 1100000, 1300000, 1500000]
  },
  {
    country: 'Kenya',
    prices: [650, 7746, 14843, 21939, 29036, 36132, 43229, 50325, 57421, 64518, 71614, 78711, 85807, 92904, 100000]
  },
  {
    country: 'Burundi',
    prices: [50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1200000, 1500000, 1700000, 2000000]
  },
];

exports.seedCountries = async (req, res) => {
  try {
    const results = [];
    for (const cfg of COUNTRY_SEED_CONFIGS) {
      const existing = await Machine.count({ where: { country: cfg.country } });
      if (existing > 0) {
        if (cfg.country === 'Burundi') {
          const machines = await Machine.findAll({ where: { country: 'Burundi' }, order: [['priceFBu', 'ASC']] });
          let updated = 0;
          for (let i = 0; i < machines.length && i < cfg.prices.length; i++) {
            machines[i].priceFBu = cfg.prices[i];
            machines[i].durationDays = 30;
            machines[i].dailyPercent = 5.0;
            await machines[i].save();
            updated++;
          }
          results.push({ country: cfg.country, status: 'updated', updated });
        } else {
          results.push({ country: cfg.country, status: 'skipped', existing });
        }
        continue;
      }
      let created = 0;
      for (let i = 0; i < PLAN_NAMES.length; i++) {
        await Machine.create({
          name: PLAN_NAMES[i],
          description: 'Advanced automated agricultural equipment. Lease stake to generate daily agro-returns.',
          priceFBu: cfg.prices[i],
          durationDays: cfg.country === 'Burundi' ? 30 : 30 + (i * 2),
          dailyPercent: cfg.country === 'Burundi' ? 5.0 : 5.0 + (i * 0.1),
          premium: i >= 10,
          country: cfg.country,
          imageUrl: null
        });
        created++;
      }
      results.push({ country: cfg.country, status: 'seeded', created });
    }
    res.json({ message: 'Seed completed', results });
  } catch (err) {
    console.error('[MACHINE] seedCountries error:', err.message);
    res.status(500).json({ message: 'Seed failed: ' + err.message });
  }
};

exports.seedInstitutional = async (req, res) => {
  try {
    const plans = [
      {
        name: 'Elite Harvest Management',
        description: 'Industrial-scale agricultural management system. Co-funding a fleet of 5 automated harvesters.',
        priceFBu: 2500000, 
        durationDays: 30,
        dailyPercent: 5.5,
        imageUrl: '/heavy_tractor_agro.png',
        premium: true,
        type: 'hot',
        country: 'Global'
      },
      {
        name: 'Agro-Industrial Hub',
        description: 'Comprehensive processing hub for grain and legumes. High-capacity industrial throughput.',
        priceFBu: 5000000, 
        durationDays: 45,
        dailyPercent: 6.0,
        imageUrl: '/silo_agro.png',
        premium: true,
        type: 'hot',
        country: 'Global'
      },
      {
        name: 'Continental Fleet Commander',
        description: 'Participate in the cross-border logistics fleet moving agricultural produce across East Africa.',
        priceFBu: 10000000, 
        durationDays: 60,
        dailyPercent: 6.5,
        imageUrl: '/drone_agro.png',
        premium: true,
        type: 'hot',
        country: 'Global'
      },
      {
        name: 'Sovereign Wealth Asset',
        description: 'Direct stake in the Tracova regional processing center and logistics infrastructure.',
        priceFBu: 25000000, 
        durationDays: 90,
        dailyPercent: 7.0,
        imageUrl: '/harvester_agro.png',
        premium: true,
        type: 'hot',
        country: 'Global'
      }
    ];

    const results = [];
    for (const p of plans) {
      const exists = await Machine.findOne({ where: { name: p.name } });
      if (!exists) {
        await Machine.create(p);
        results.push({ name: p.name, status: 'created' });
      } else {
        results.push({ name: p.name, status: 'skipped (exists)' });
      }
    }
    res.json({ message: 'Institutional seed completed', results });
  } catch (err) {
    console.error('[MACHINE] seedInstitutional error:', err.message);
    res.status(500).json({ message: 'Institutional Seed failed: ' + err.message });
  }
};

exports.seedHotFlash = async (req, res) => {
  try {
    const plans = [
      {
        name: 'Starter Sprout Flash',
        description: 'Micro-investment for early harvest testing. High frequency returns.',
        priceFBu: 5000,
        durationDays: 7,
        dailyPercent: 2.15,
        type: 'hot',
        country: 'Global',
        imageUrl: '/tractor_agro.png'
      },
      {
        name: 'Weekend Mini Booster',
        description: 'Limited weekend-only growth accelerator. Quick 3-day cycle.',
        priceFBu: 15000,
        durationDays: 3,
        dailyPercent: 8.34,
        type: 'hot',
        country: 'Global',
        imageUrl: '/drone_agro.png'
      },
      {
        name: 'Community Harvest Core',
        description: 'Mid-tier flash sale for village community cooperatives.',
        priceFBu: 25000,
        durationDays: 5,
        dailyPercent: 4.0,
        type: 'hot',
        country: 'Global',
        imageUrl: '/harvester_agro.png'
      },
      {
        name: 'Junior Drone Scout',
        description: 'Aerial monitoring stake for small-scale precision farming.',
        priceFBu: 50000,
        durationDays: 10,
        dailyPercent: 1.8,
        type: 'hot',
        country: 'Global',
        imageUrl: '/drone_agro.png'
      }
    ];

    const results = [];
    for (const p of plans) {
      const exists = await Machine.findOne({ where: { name: p.name } });
      if (!exists) {
        await Machine.create(p);
        results.push({ name: p.name, status: 'created' });
      } else {
        results.push({ name: p.name, status: 'skipped (exists)' });
      }
    }
    res.json({ message: 'Hot Flash seed completed', results });
  } catch (err) {
    console.error('[MACHINE] seedHotFlash error:', err.message);
    res.status(500).json({ message: 'Hot Flash Seed failed: ' + err.message });
  }
};
