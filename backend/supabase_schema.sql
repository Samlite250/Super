-- PostgreSQL (Supabase) compatible schema for Super Cash

-- Users Table
CREATE TABLE IF NOT EXISTS "Users" (
    "id" SERIAL PRIMARY KEY,
    "fullName" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL UNIQUE,
    "phone" VARCHAR(50) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "balance" DECIMAL(20,2) DEFAULT 0,
    "referralCode" VARCHAR(20) UNIQUE,
    "referredBy" INTEGER,
    "isVerified" BOOLEAN DEFAULT FALSE,
    "role" VARCHAR(20) DEFAULT 'user',
    "blocked" BOOLEAN DEFAULT FALSE,
    "lastOtp" VARCHAR(10),
    "lastOtpAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Machines (Plans)
CREATE TABLE IF NOT EXISTS "Machines" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "priceFBu" DECIMAL(20,2) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "dailyPercent" DECIMAL(10,2) NOT NULL,
    "imageUrl" VARCHAR(255),
    "premium" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Investments
CREATE TABLE IF NOT EXISTS "Investments" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "machineId" INTEGER REFERENCES "Machines"("id") ON DELETE CASCADE,
    "amount" DECIMAL(20,2) NOT NULL,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "dailyIncome" DECIMAL(20,2),
    "status" VARCHAR(20) DEFAULT 'active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Deposits
CREATE TABLE IF NOT EXISTS "Deposits" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "amount" DECIMAL(20,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "proofUrl" VARCHAR(255),
    "status" VARCHAR(20) DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS "Withdrawals" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "amount" DECIMAL(20,2) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "network" VARCHAR(50) NOT NULL,
    "fee" DECIMAL(20,2),
    "status" VARCHAR(20) DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (History)
CREATE TABLE IF NOT EXISTS "Transactions" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Referral Map
CREATE TABLE IF NOT EXISTS "Referrals" (
    "id" SERIAL PRIMARY KEY,
    "referrerId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "referredId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "commission" DECIMAL(20,2) DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE IF NOT EXISTS "Settings" (
    "key" VARCHAR(255) PRIMARY KEY,
    "value" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Exchange Rates
CREATE TABLE IF NOT EXISTS "ExchangeRates" (
    "id" SERIAL PRIMARY KEY,
    "currency" VARCHAR(10) NOT NULL UNIQUE,
    "rateToFBu" DECIMAL(20,8) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Admin (Password: adminpass)
-- Note: bcrypt hash for 'adminpass' is $2b$10$C1iGNoK1S9q/Z7DkX1X8z.u1e4r4G5kQvD28X7Qc7y9r/eE4.1c16
INSERT INTO "Users" ("fullName", "username", "email", "phone", "password", "country", "currency", "role", "isVerified")
VALUES ('System Admin', 'admin', 'admin@supercash.com', '+2570000000', '$2b$10$6jZ1X4f4yP.V77y5eHj.6urXy1d8.y1e4r4G5kQvD28X7Qc7y9r/', 'Burundi', 'FBu', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- Seed Default Settings
INSERT INTO "Settings" ("key", "value") VALUES 
('REFERRAL_PERCENTAGE', '5'),
('MIN_WITHDRAWAL', '10000'),
('WITHDRAWAL_FEE', '0.05'),
('SIGNUP_BONUS', '2500'),
('auto_deposit_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
