const { Sequelize, DataTypes } = require('sequelize');
const pg = require('pg');
let sequelize;
if (process.env.DATABASE_URL || process.env.VERCEL) {
  // Validate that the ENV variable exists and is a valid string
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || typeof dbUrl !== 'string' || dbUrl.trim() === '') {
    throw new Error('MISSING DATABASE_URL: Please add your valid PostgreSQL connection string to Vercel Environment Variables.');
  }

  // Ensure it has a protocol to prevent Sequelize from crashing with "Cannot read properties of null (reading 'replace')"
  if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    throw new Error(`INVALID DATABASE_URL FORMAT: The provided string "${dbUrl}" does not start with "postgres://" or "postgresql://". Please copy the correct URI from your database provider.`);
  }

  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development fallback
  sequelize = new Sequelize(
    process.env.DB_NAME || 'tracova',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false
    }
  );
}



const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// import models
const User = require('./user')(sequelize, DataTypes);
const Admin = require('./admin')(sequelize, DataTypes);
const Machine = require('./machine')(sequelize, DataTypes);
const Investment = require('./investment')(sequelize, DataTypes);
const Deposit = require('./deposit')(sequelize, DataTypes);
const Withdrawal = require('./withdrawal')(sequelize, DataTypes);
const Transaction = require('./transaction')(sequelize, DataTypes);
const Referral = require('./referral')(sequelize, DataTypes);
const Setting = require('./setting')(sequelize, DataTypes);
const ExchangeRate = require('./exchange_rate')(sequelize, DataTypes);

// associations
User.hasMany(Investment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Investment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Deposit, { foreignKey: 'userId', onDelete: 'CASCADE' });
Deposit.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Withdrawal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Withdrawal.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Referral, { foreignKey: 'referrerId', onDelete: 'CASCADE' });
Referral.belongsTo(User, { foreignKey: 'referrerId' });
Referral.belongsTo(User, { foreignKey: 'referredId', as: 'referredUser' });
User.hasMany(Referral, { foreignKey: 'referredId', onDelete: 'CASCADE' });

User.belongsTo(User, { as: 'upline', foreignKey: 'referredBy' });
User.hasMany(User, { as: 'downline', foreignKey: 'referredBy', onDelete: 'SET NULL' });

Machine.hasMany(Investment, { foreignKey: 'machineId' });
Investment.belongsTo(Machine, { foreignKey: 'machineId' });

// Export individual models
db.User = User;
db.Admin = Admin;
db.Machine = Machine;
db.Investment = Investment;
db.Deposit = Deposit;
db.Withdrawal = Withdrawal;
db.Transaction = Transaction;
db.Referral = Referral;
db.Setting = Setting;
db.ExchangeRate = ExchangeRate;

module.exports = db;
