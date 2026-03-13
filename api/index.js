// Vercel Serverless Function entry point
// Loads dotenv and then imports the Express app
require('dotenv').config();
module.exports = require('../backend/src/index.js');
