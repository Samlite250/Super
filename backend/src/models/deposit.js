module.exports = (sequelize, DataTypes) => {
  const Deposit = sequelize.define('Deposit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(20,2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false },
    proofUrl: { type: DataTypes.STRING },
    payerNumber: { type: DataTypes.STRING },
    payerNames: { type: DataTypes.STRING },
    proofUploadedAt: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
  });
  return Deposit;
};