const { Sequelize, DataTypes } = require('sequelize');

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Supabase requires this often
        }
      }
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
User.hasMany(Investment);
Investment.belongsTo(User);
User.hasMany(Deposit);
Deposit.belongsTo(User);
User.hasMany(Withdrawal);
Withdrawal.belongsTo(User);
User.hasMany(Transaction);
Transaction.belongsTo(User);
User.hasMany(Referral, { foreignKey: 'referrerId' });
Referral.belongsTo(User, { foreignKey: 'referrerId' });
// allow loading the referred user's details via alias
Referral.belongsTo(User, { foreignKey: 'referredId', as: 'referredUser' });
User.hasMany(Referral, { foreignKey: 'referredId' });

// Self-referential for upline/downline
User.belongsTo(User, { as: 'upline', foreignKey: 'referredBy' });
User.hasMany(User, { as: 'downline', foreignKey: 'referredBy' });

Machine.hasMany(Investment);
Investment.belongsTo(Machine);

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
