module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(20,2), allowNull: false },
    description: { type: DataTypes.STRING }
  });
  return Transaction;
};