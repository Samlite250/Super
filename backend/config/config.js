require('dotenv').config();

const baseConfig = {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

// If DATABASE_URL is provided, use it. Otherwise, construct from params.
if (process.env.DATABASE_URL) {
  baseConfig.url = process.env.DATABASE_URL;
} else {
  baseConfig.username = process.env.DB_USER || 'postgres';
  baseConfig.password = process.env.DB_PASS || 'postgres';
  baseConfig.database = process.env.DB_NAME || 'supercash';
  baseConfig.host = process.env.DB_HOST || '127.0.0.1';
  baseConfig.port = process.env.DB_PORT || 5432;
}

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig }
};