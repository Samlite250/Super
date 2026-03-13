const express = require('express');
const router = express.Router();
const { calculateDailyReturns } = require('../utils/cron');

router.all('/roi', async (req, res) => {
  // Vercel Cron sends a secure Bearer token in the Authorization header
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized CRON request' });
  }

  try {
    await calculateDailyReturns();
    res.status(200).json({ success: true, message: 'ROI calculation completed' });
  } catch (error) {
    console.error('CRON Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
