module.exports = (sequelize, DataTypes) => {
  const Deposit = sequelize.define('Deposit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(20,2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false },
    proofUrl: { type: DataTypes.TEXT('long') },
    payerNumber: { type: DataTypes.STRING },
    payerNames: { type: DataTypes.STRING },
    proofUploadedAt: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    txRef: { type: DataTypes.STRING, unique: true },
    paymentMethod: { type: DataTypes.STRING, defaultValue: 'manual' }
  });
  return Deposit;
};