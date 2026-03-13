-- SQL schema for Super Cash

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  country VARCHAR(50) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  balance DECIMAL(20,2) DEFAULT 0,
  referralCode VARCHAR(20) UNIQUE,
  referredBy INT,
  isVerified BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'user',
  blocked BOOLEAN DEFAULT FALSE,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priceFBu DECIMAL(20,2) NOT NULL,
  durationDays INT NOT NULL,
  dailyPercent DECIMAL(5,2) NOT NULL,
  imageUrl VARCHAR(255),
  premium BOOLEAN DEFAULT FALSE,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  machineId INT NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  startDate DATETIME,
  endDate DATETIME,
  dailyIncome DECIMAL(20,2),
  status VARCHAR(20) DEFAULT 'active',
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (machineId) REFERENCES machines(id)
);

CREATE TABLE deposits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  proofUrl VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE withdrawals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  network VARCHAR(50) NOT NULL,
  fee DECIMAL(20,2),
  status VARCHAR(20) DEFAULT 'pending',
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  description VARCHAR(255),
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrerId INT NOT NULL,
  referredId INT NOT NULL,
  commission DECIMAL(20,2) DEFAULT 0,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (referrerId) REFERENCES users(id),
  FOREIGN KEY (referredId) REFERENCES users(id)
);

CREATE TABLE settings (
  `key` VARCHAR(100) PRIMARY KEY,
  value TEXT,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE exchange_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  currency VARCHAR(10) NOT NULL UNIQUE,
  rateToFBu DECIMAL(20,8) NOT NULL,
  createdAt DATETIME,
  updatedAt DATETIME
);
