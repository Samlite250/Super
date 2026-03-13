// Vercel Serverless Function entry point
// Forces inclusion of postgres drivers for Sequelize
require('pg');
require('pg-hstore');
require('dotenv').config();

module.exports = require('../backend/src/index.js');
