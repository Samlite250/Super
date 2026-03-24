require('dotenv').config();

const baseConfig = {
  dialect: 'mysql',
  logging: false,
};

// If DATABASE_URL is provided, use it. Otherwise, construct from params.
if (process.env.DATABASE_URL || process.env.VERCEL) {
  baseConfig.url = process.env.DATABASE_URL;
  baseConfig.dialect = 'postgres';
  baseConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
} else {
  baseConfig.username = process.env.DB_USER || 'root';
  baseConfig.password = process.env.DB_PASS || '';
  baseConfig.database = process.env.DB_NAME || 'supercash';
  baseConfig.host = process.env.DB_HOST || 'localhost';
  baseConfig.port = process.env.DB_PORT || 3306;
}

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig }
};