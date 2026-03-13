module.exports = (sequelize, DataTypes) => {
  const ExchangeRate = sequelize.define('ExchangeRate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    currency: { type: DataTypes.STRING, allowNull: false, unique: true },
    rateToFBu: { type: DataTypes.DECIMAL(20,8), allowNull: false }
  });
  return ExchangeRate;
};