module.exports = (sequelize, DataTypes) => {
  const Withdrawal = sequelize.define('Withdrawal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(20,2), allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    network: { type: DataTypes.STRING, allowNull: false },
    fee: { type: DataTypes.DECIMAL(20,2) },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
  });
  return Withdrawal;
};