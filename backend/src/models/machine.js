module.exports = (sequelize, DataTypes) => {
  const Machine = sequelize.define('Machine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    priceFBu: { type: DataTypes.DECIMAL(20,2), allowNull: false },
    durationDays: { type: DataTypes.INTEGER, allowNull: false },
    dailyPercent: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    imageUrl: { type: DataTypes.STRING },
    premium: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
  return Machine;
};