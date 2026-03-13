module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.TEXT }
  });
  return Setting;
};