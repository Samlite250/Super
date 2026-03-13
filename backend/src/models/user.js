module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false },
    balance: { type: DataTypes.DECIMAL(20,2), defaultValue: 0 },
    referralCode: { type: DataTypes.STRING, unique: true },
    referredBy: { type: DataTypes.INTEGER, allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.STRING, defaultValue: 'user' },
    blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
  return User;
};