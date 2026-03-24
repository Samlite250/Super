const path = require('path');
console.log('Vercel Function starting...');

try {
  // Forces inclusion of drivers for the Vercel Bundle
  require('pg');
  require('pg-hstore');
  require('dotenv').config();
  
  const backendPath = path.resolve(__dirname, '../backend/src/index.js');
  console.log('Loading backend from:', backendPath);
  
  const app = require(backendPath);
  module.exports = app;
  
  console.log('Backend loaded successfully.');
} catch (err) {
  console.error('CRITICAL BOOT ERROR:', err.message);
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
