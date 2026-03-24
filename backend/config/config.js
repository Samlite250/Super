require('dotenv').config();

const baseConfig = {
  logging: false,
};

// Database configuration locked to Postgres for Vercel/Supabase
baseConfig.url = process.env.DATABASE_URL;
baseConfig.dialect = 'postgres';
baseConfig.dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig }
};