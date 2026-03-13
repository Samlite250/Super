module.exports = (sequelize, DataTypes) => {
  const Referral = sequelize.define('Referral', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    referrerId: { type: DataTypes.INTEGER, allowNull: false },
    referredId: { type: DataTypes.INTEGER, allowNull: false },
    commission: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 }
  });
  return Referral;
};