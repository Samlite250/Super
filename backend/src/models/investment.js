module.exports = (sequelize, DataTypes) => {
  const Investment = sequelize.define('Investment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    machineId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(20,2), allowNull: false },
    startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    endDate: { type: DataTypes.DATE },
    dailyIncome: { type: DataTypes.DECIMAL(20,2) },
    status: { type: DataTypes.STRING, defaultValue: 'active' },
    lastReturnAt: { type: DataTypes.DATE },
    isReinvest: { type: DataTypes.BOOLEAN, defaultValue: false }
  });

  return Investment;
};