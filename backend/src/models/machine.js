module.exports = (sequelize, DataTypes) => {
  const Machine = sequelize.define('Machine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    priceFBu: { type: DataTypes.DECIMAL(20,2), allowNull: false },
    durationDays: { type: DataTypes.INTEGER, allowNull: false },
    dailyPercent: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    imageUrl: { type: DataTypes.TEXT('long') },
    premium: { type: DataTypes.BOOLEAN, defaultValue: false },
    country: { type: DataTypes.STRING, defaultValue: 'Global' }, // e.g., 'Global', 'Uganda', 'Kenya', 'Rwanda', 'Burundi'
    type: { type: DataTypes.STRING, defaultValue: 'normal' }, // 'normal' or 'hot'
    payoutType: { type: DataTypes.STRING, defaultValue: 'daily' } // 'daily' or 'total'
  });
  return Machine;
};