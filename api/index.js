const path = require('path');
console.log('Vercel Function starting...');

try {
  // 1. Force critical drivers for the Vercel Bundle
  require('bcryptjs');
  require('pg');
  require('pg-hstore');
  require('dotenv').config();
  
  // 2. Early Environment Check
  if (!process.env.DATABASE_URL) {
    throw new Error('MISSING DATABASE_URL Environment Variable.');
  }

  // 3. Resolve and Load Backend
  const backendPath = path.resolve(__dirname, '../backend/src/index.js');
  console.log('[BOOT] Target:', backendPath);
  
  const app = require(backendPath);
  module.exports = app;
  
  console.log('[BOOT] Success.');
} catch (err) {
  console.error('[CRITICAL BOOT ERROR]:', err.message);
  console.error(err.stack);
  
  // Return a readable error for debugging
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Backend Boot Failed',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
}
