const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connection established successfully.');
    process.exit(0);
  } catch (error) {
    console.error('MySQL Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
