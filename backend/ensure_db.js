const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database ${process.env.DB_NAME} ensured.`);
    await connection.end();
  } catch (err) {
    console.error('Setup error:', err);
  }
}

setup();
