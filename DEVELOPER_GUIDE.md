# Super Cash - Developer Reference Guide

## Table of Contents
1. [Project Structure](#project-structure)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [Common Development Tasks](#common-development-tasks)
8. [Code Patterns & Best Practices](#code-patterns--best-practices)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## Project Structure

```
Super/
├── frontend/                    # React.js web application
│   ├── public/
│   │   └── index.html          # HTML entry point
│   ├── src/
│   │   ├── App.js              # Route configuration
│   │   ├── index.js            # React entry point
│   │   ├── services/
│   │   │   └── api.js          # Axios instance with JWT interceptor
│   │   ├── pages/
│   │   │   ├── Landing.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Machines.js     # Investment plans browser
│   │   │   ├── Deposit.js
│   │   │   ├── Withdraw.js
│   │   │   ├── AdminLogin.js
│   │   │   └── admin/          # Admin-only pages
│   │   │       ├── AdminDashboard.js
│   │   │       ├── AdminUsers.js
│   │   │       ├── AdminDeposits.js
│   │   │       ├── AdminWithdrawals.js
│   │   │       ├── AdminMachines.js
│   │   │       └── AdminSettings.js
│   │   ├── components/         # Reusable components (if any)
│   │   └── styles/
│   │       └── index.css       # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── backend/                     # Node.js Express API
    ├── src/
    │   ├── index.js            # Server entry point
    │   ├── seed.js             # Database seeding script
    │   ├── config/
    │   │   └── config.js       # Database configuration
    │   ├── controllers/        # Business logic
    │   │   ├── authController.js
    │   │   ├── depositController.js
    │   │   ├── withdrawalController.js
    │   │   ├── investmentController.js
    │   │   ├── machineController.js
    │   │   ├── referralController.js
    │   │   ├── settingsController.js
    │   │   └── adminController.js
    │   ├── models/             # Sequelize ORM models
    │   │   ├── User.js
    │   │   ├── Machine.js
    │   │   ├── Investment.js
    │   │   ├── Deposit.js
    │   │   ├── Withdrawal.js
    │   │   ├── Admin.js
    │   │   ├── ExchangeRate.js
    │   │   ├── Setting.js
    │   │   ├── Transaction.js
    │   │   ├── Referral.js
    │   │   └── index.js        # Model exports & associations
    │   ├── routes/             # Express route handlers
    │   │   ├── auth.js
    │   │   ├── deposits.js
    │   │   ├── withdrawals.js
    │   │   ├── investments.js
    │   │   ├── machines.js
    │   │   ├── referrals.js
    │   │   ├── settings.js
    │   │   ├── user.js
    │   │   └── admin.js
    │   ├── middleware/
    │   │   ├── auth.js         # JWT verification
    │   │   └── upload.js       # File upload handler
    │   ├── utils/
    │   │   ├── cron.js         # Daily earnings calculation
    │   │   ├── helpers.js      # Utility functions
    │   │   └── mailer.js       # Email sender
    │   └── uploads/            # User file uploads
    ├── database_schema.sql     # Raw SQL schema (reference)
    ├── package.json
    └── create-admin.js         # Helper to create admin user
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                    Port 3000                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pages: Landing, Login, Register, Dashboard, Invest │   │
│  │ Admin: Users, Deposits, Withdrawals, Machines     │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
                     │ Axios with JWT
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Backend (Express)                        │
│                    Port 5000                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Routes: /auth, /api, /deposits, /withdrawals       │    │
│  │ Middleware: JWT auth, CORS, rate-limit            │    │
│  │ Controllers: Business logic & validations         │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL Queries via Sequelize
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 MySQL Database                              │
│   Tables: users, machines, investments, deposits,           │
│           withdrawals, admins, referrals, etc.             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **React 18.2.0** - UI library
- **React Router v6.11.2** - Client-side routing
- **TailwindCSS 3.4.7** - Utility-first CSS framework
- **Axios 1.4.0** - HTTP client with interceptors

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18.2** - Web framework
- **Sequelize 6.32.1** - ORM for database
- **MySQL/MariaDB** - Relational database
- **bcryptjs 2.4.3** - Password hashing
- **jsonwebtoken 9.0.0** - JWT token generation
- **express-rate-limit** - Rate limiting middleware
- **Nodemon 2.0.22** - Development auto-reload

### Development Tools
- **npm** - Package manager
- **Postman** - API testing
- **MySQL Workbench** - Database management

---

## API Documentation

### Authentication Endpoints

**Register User**
```
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "username": "johndoe",
  "phone": "+250784123456",
  "email": "john@example.com",
  "password": "SecurePass123",
  "country": "Rwanda",
  "referralCode": ""
}

Response (201):
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "isVerified": true,
    "balance": 0
  }
}
```

**Login User**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "fullName": "John Doe",
    "balance": 50000,
    "role": "user"
  }
}
```

### Investment Endpoints

**Get All Machines**
```
GET /api/machines
Authorization: Bearer {token}

Response (200):
[
  {
    "id": 1,
    "name": "Small Rice Plan",
    "description": "Perfect for beginners",
    "priceFBu": 10000,
    "durationDays": 30,
    "dailyPercent": 1.0,
    "premium": false
  },
  ...
]
```

**Invest in Plan**
```
POST /api/invest
Authorization: Bearer {token}
Content-Type: application/json

{
  "machineId": 1,
  "amount": 10000
}

Response (201):
{
  "message": "Investment created successfully",
  "investment": {
    "id": 15,
    "userId": 5,
    "machineId": 1,
    "amount": 10000,
    "dailyIncome": 100,
    "status": "active",
    "startDate": "2024-01-15"
  }
}
```

**Get User Investments**
```
GET /api/my-investments
Authorization: Bearer {token}

Response (200):
[
  {
    "id": 15,
    "machine": { "name": "Small Rice Plan", ... },
    "amount": 10000,
    "dailyIncome": 100,
    "status": "active",
    "startDate": "2024-01-15",
    "totalEarnings": 250
  }
]
```

### Deposit Endpoints

**Request Deposit**
```
POST /api/deposits
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100000,
  "currency": "RWF"
}

Response (201):
{
  "message": "Deposit request created",
  "deposit": {
    "id": 8,
    "userId": 5,
    "amount": 100000,
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Admin Approve Deposit**
```
POST /api/deposits/{id}/approve
Authorization: Bearer {adminToken}

Response (200):
{
  "message": "Deposit approved successfully",
  "deposit": { "status": "approved" }
}
```

### Withdrawal Endpoints

**Request Withdrawal**
```
POST /api/withdrawals
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50000,
  "phone": "+250784123456",
  "network": "MTN"
}

Response (201):
{
  "message": "Withdrawal request created",
  "withdrawal": {
    "id": 5,
    "userId": 5,
    "amount": 50000,
    "fee": 1000,
    "phone": "+250784123456",
    "network": "MTN",
    "status": "pending"
  }
}
```

**Admin Approve Withdrawal**
```
POST /api/withdrawals/{id}/approve
Authorization: Bearer {adminToken}

Response (200):
{
  "message": "Withdrawal approved",
  "withdrawal": { "status": "approved" }
}
```

### Admin Endpoints

**Get Admin Stats**
```
GET /api/admin/stats
Authorization: Bearer {adminToken}

Response (200):
{
  "totalUsers": 150,
  "totalDeposits": 5000000,
  "totalWithdrawals": 2500000,
  "totalInvestments": 7500000,
  "pendingDeposits": 3,
  "pendingWithdrawals": 5
}
```

**Get All Users**
```
GET /api/admin/users
Authorization: Bearer {adminToken}

Response (200):
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "balance": 150000,
    "blocked": false,
    "createdAt": "2024-01-01"
  }
]
```

**Block User**
```
POST /api/admin/users/{id}/block
Authorization: Bearer {adminToken}

Response (200):
{
  "message": "User blocked successfully"
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fullName VARCHAR(255),
  username VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  country VARCHAR(100),
  currency VARCHAR(10),
  balance DECIMAL(20, 2) DEFAULT 0,
  referralCode VARCHAR(10) UNIQUE,
  referredBy INT,
  isVerified BOOLEAN DEFAULT FALSE,
  role ENUM('user', 'admin') DEFAULT 'user',
  blocked BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (referredBy) REFERENCES users(id)
);
```

### Machines Table
```sql
CREATE TABLE machines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description TEXT,
  priceFBu DECIMAL(20, 2),
  durationDays INT,
  dailyPercent DECIMAL(5, 2),
  imageUrl VARCHAR(255),
  premium BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Investments Table
```sql
CREATE TABLE investments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  machineId INT NOT NULL,
  amount DECIMAL(20, 2),
  dailyIncome DECIMAL(20, 2),
  status ENUM('active', 'completed') DEFAULT 'active',
  startDate DATE,
  endDate DATE,
  totalEarnings DECIMAL(20, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (machineId) REFERENCES machines(id)
);
```

### Deposits Table
```sql
CREATE TABLE deposits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  amount DECIMAL(20, 2),
  currency VARCHAR(10),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  proofUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Withdrawals Table
```sql
CREATE TABLE withdrawals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  amount DECIMAL(20, 2),
  phone VARCHAR(20),
  network VARCHAR(50),
  fee DECIMAL(20, 2),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## Authentication Flow

### User Registration Flow
```
User registers
    ↓
Validate input (email, password, etc.)
    ↓
Hash password with bcrypt
    ↓
Save user to database
    ↓
Auto-verify user (MVP)
    ↓
Return success message
    ↓
Frontend redirects to login
```

### User Login Flow
```
User submits credentials
    ↓
Find user by email
    ↓
Compare password with bcrypt
    ↓
Check if user is verified
    ↓
Check if user is blocked
    ↓
Generate JWT token (with user data & role)
    ↓
Return token (stored in localStorage)
    ↓
Return user data (id, email, balance, role)
    ↓
Frontend sets authorization header for future requests
```

### JWT Interceptor (Frontend)
```javascript
// Every request automatically includes:
{
  headers: {
    Authorization: `Bearer ${token}`
  }
}

// Backend middleware (authenticate.js):
1. Extract token from header
2. Verify JWT signature using JWT_SECRET
3. Decode token to get userId and role
4. Attach user info to req.user
5. Call next middleware
6. If token invalid/expired, return 401 Unauthorized
```

### Admin Authentication
```
Admin submits credentials
    ↓
POST /api/auth/login (same endpoint as user)
    ↓
Backend searches Admin table instead of User table
    ↓
Generates JWT with role: 'admin'
    ↓
Frontend stores adminMode flag in localStorage
    ↓
Frontend stores token with admin prefix
    ↓
Admin routes check for role: 'admin' in JWT
```

---

## Common Development Tasks

### Adding a New Feature

**1. Create Database Migration**
```javascript
// backend/src/models/NewFeature.js
const NewFeature = sequelize.define('NewFeature', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  // ... fields
});

export default NewFeature;
```

**2. Export Model**
```javascript
// backend/src/models/index.js
import NewFeature from './NewFeature.js';
db.NewFeature = NewFeature;
```

**3. Create Controller**
```javascript
// backend/src/controllers/newFeatureController.js
export const create = async (req, res) => {
  try {
    const feature = await db.NewFeature.create(req.body);
    res.status(201).json(feature);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

**4. Create Routes**
```javascript
// backend/src/routes/newFeature.js
import express from 'express';
import * as controller from '../controllers/newFeatureController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.post('/', authenticate, controller.create);
export default router;
```

**5. Register Routes in index.js**
```javascript
// backend/src/index.js
import newFeatureRoutes from './routes/newFeature.js';
app.use('/api/new-feature', newFeatureRoutes);
```

**6. Create Frontend Page**
```javascript
// frontend/src/pages/NewFeature.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function NewFeature() {
  const [loading, setLoading] = useState(true);
  // ... component logic
}

export default NewFeature;
```

**7. Add Route to App.js**
```javascript
<Route path="/new-feature" element={<NewFeature />} />
```

### Debugging API Issues

**1. Check Backend Logs**
```bash
# Terminal where backend is running should show request logs
# Look for: POST /api/endpoint 200 OK or error messages
```

**2. Use Postman to Test API**
```
1. Create new request
2. Set method and URL
3. Add Authorization header: Bearer {token}
4. Send request
5. Check response status and body
```

**3. Add Console Logging**
```javascript
// In controller:
console.log('Request body:', req.body);
console.log('User ID:', req.user.id);
console.log('Query result:', result);
```

**4. Check Browser DevTools**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Look at request headers (Authorization present?)
4. Check response status and data
5. Look at Console for any frontend errors
```

### Testing a New Endpoint

```bash
# Test without authentication
curl -X GET http://localhost:5000/api/machines

# Test with authentication
TOKEN="eyJhbGc..."
curl -X GET http://localhost:5000/api/user-profile \
  -H "Authorization: Bearer $TOKEN"

# Test POST with data
curl -X POST http://localhost:5000/api/invest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"machineId": 1, "amount": 10000}'
```

---

## Code Patterns & Best Practices

### Controller Pattern
```javascript
export const myEndpoint = async (req, res) => {
  try {
    // 1. Validate input
    if (!req.body.email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // 2. Check permissions
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 3. Query database
    const result = await db.User.findByPk(req.params.userId);
    if (!result) {
      return res.status(404).json({ error: 'Not found' });
    }

    // 4. Process data
    const updated = await result.update(req.body);

    // 5. Return response
    res.json(updated);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};
```

### Frontend Hook Pattern
```javascript
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/endpoint');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* render data */}</div>;
}
```

### Error Handling Pattern
```javascript
// Always return appropriate HTTP status codes:
200 - Success
201 - Created
400 - Bad request (validation error)
401 - Unauthorized (no token/invalid token)
403 - Forbidden (authenticated but no permission)
404 - Not found
500 - Server error

// Always include error message:
res.status(400).json({ 
  error: 'Specific error message',
  details: err.message  // Include details in development
});
```

---

## Troubleshooting Guide

### "CORS Error: Access-Control-Allow-Origin"
```javascript
// Already configured in backend/src/index.js:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Make sure frontend is on port 3000 and backend on 5000
```

### "jwt malformed"
```
Issue: Missing "Bearer " prefix in token
Solution: Header should be "Bearer {token}", not just "{token}"

Check in api.js:
Authorization: `Bearer ${token}`
```

### "token expired"
```
Issue: JWT token has expired
Solution: 1. Logout and login again
         2. Implement token refresh mechanism
         3. Check JWT expiration in src/index.js
```

### "Cannot find module"
```bash
Solution:
1. Check import path is correct
2. Check file exists
3. npm install missing package
4. Restart development server
```

### "Database connection refused"
```bash
# Check MySQL is running:
systemctl status mysql

# Start MySQL:
systemctl start mysql

# Verify connection:
mysql -u root -p -e "SELECT 1;"
```

### "Port 5000 already in use"
```bash
# Find process using port:
lsof -i :5000
# or on Windows:
netstat -ano | findstr :5000

# Kill process:
kill -9 {PID}
#or:
taskkill /PID {PID} /F
```

### Sequelize Sync Errors
```javascript
// In backend/src/index.js:
// Use force: true only in development to drop and recreate tables
db.sequelize.sync({ force: false })  // Use false in production
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync error:', err));
```

---

**Last Updated**: MVP Completion
**Status**: Production Ready
**Version**: 1.0.0
