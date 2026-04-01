require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const machineRoutes = require('./routes/machines');
const depositRoutes = require('./routes/deposits');
const withdrawalRoutes = require('./routes/withdrawals');
const referralRoutes = require('./routes/referrals');
const settingsRoutes = require('./routes/settings');
const investmentRoutes = require('./routes/investments');
const cronRoutes = require('./routes/cron');
const { startCron, calculateDailyReturns } = require('./utils/cron');

const app = express();


// simple request logger for debugging browser API issues
app.use((req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    console.log('[REQ]', req.method, req.originalUrl, 'Auth:', auth ? '[present]' : '[missing]');
  } catch (e) {
    // ignore logging errors
  }
  next();
});

const path = require('path');

// middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

// serve uploaded files with absolute path - moved up for reliability
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
// Apply limiter only to API routes
app.use('/api', limiter);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/cron', cronRoutes);

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Temp setup route to sync database on Vercel
app.get('/api/setup-db', async (req, res) => {
  try {
    await sequelize.sync({ alter: true });

    // Proactively expand TEXT columns that may have been created as VARCHAR(255)
    try {
      const dialect = sequelize.getDialect();
      if (dialect === 'postgres') {
        await sequelize.query('ALTER TABLE "Deposits" ALTER COLUMN "proofUrl" TYPE TEXT');
        await sequelize.query('ALTER TABLE "Machines" ALTER COLUMN "imageUrl" TYPE TEXT');
      } else {
        await sequelize.query('ALTER TABLE `Deposits` MODIFY COLUMN `proofUrl` LONGTEXT');
        await sequelize.query('ALTER TABLE `Machines` MODIFY COLUMN `imageUrl` LONGTEXT');
      }
      console.log('[SETUP-DB] proofUrl and imageUrl columns expanded to TEXT');
    } catch (alterErr) {
      // Columns may already be TEXT — ignore
      console.log('[SETUP-DB] Column alter skipped (already TEXT):', alterErr.message);
    }

    // Create default admin if does not exist
    const { User, Machine } = require('./models');
    const bcrypt = require('bcryptjs');

    let admin = await User.findOne({ where: { role: 'admin' } });
    let adminCreated = false;

    if (!admin) {
      const hash = await bcrypt.hash('samuel123', 10);
      admin = await User.create({
        fullName: 'Super Administrator',
        username: 'Admin',
        phone: '0000000000',
        email: 'admin@tracova.com',
        password: hash,
        country: 'Global',
        currency: 'USD',
        role: 'admin',
        isVerified: true,
      });
      adminCreated = true;
    }

    // --- CREATE 5 HOT PLANS ---
    const hotPlans = [
      {
        name: 'Rapid Harvest X1',
        description: 'Elite 4-day agricultural cycle for fast turnover. Maximum efficiency staking.',
        priceFBu: 100000,
        currency: 'FBu',
        durationDays: 4,
        dailyPercent: 12.5, // 50% profit
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      },
      {
        name: 'Flash Seeder Pro',
        description: 'Accelerated 5-day seeding contract with total maturation payout.',
        priceFBu: 250000,
        currency: 'FBu',
        durationDays: 5,
        dailyPercent: 10.0, // 50% profit
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      },
      {
        name: 'Prime Drone Hot',
        description: 'Short-term high-velocity drone leasing for precision farming.',
        priceFBu: 450000,
        currency: 'FBu',
        durationDays: 4,
        dailyPercent: 13.0, // 52% profit
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      },
      {
        name: 'Elite Harvest Max',
        description: 'Premium short-duration harvesting lease with high-yield return protocol.',
        priceFBu: 1000000,
        currency: 'FBu',
        durationDays: 5,
        dailyPercent: 11.0, // 55% profit
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      },
      {
        name: 'Global Farm Pulse',
        description: 'Ultimate 4-day intensive farming package for institutional investors.',
        priceFBu: 2500000,
        currency: 'FBu',
        durationDays: 4,
        dailyPercent: 15.0, // 60% profit
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      }
    ];

    for (const p of hotPlans) {
      await Machine.findOrCreate({
        where: { name: p.name },
        defaults: p
      });
    }

    res.json({
      message: 'Supabase Database Synchronized & 5 Hot Plans Created!',
      adminConfigured: true,
      hotPlansAdded: 5,
      hint: adminCreated ? 'A default admin was created. Login at /auth/admin-secure-v2 with Username: admin | Password: admin123' : 'Admin already exists.'
    });
  } catch (err) {
    console.error('Sync Error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});



const port = process.env.PORT || 5000;

// Export the Express API for Vercel
module.exports = app;

// Only start the server if we are not in a Vercel Serverless environment
if (!process.env.VERCEL) {
  sequelize.sync({ alter: false }).then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      // Start ROI Scheduler
      startCron();
      // Initial check on boot
      calculateDailyReturns();
    });
  });
}



