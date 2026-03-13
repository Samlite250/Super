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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));



const port = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // Start ROI Scheduler
    startCron();
    // Initial check on boot
    calculateDailyReturns();
  });
});



