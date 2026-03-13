# Super Cash Investment Platform

This repository contains a full-stack MVP for the Super Cash investment platform, including frontend, backend, and database schema. The platform allows users in Burundi, Rwanda, Uganda, and Kenya to invest in agricultural machines and earn daily returns.

## 🚀 Features
- Authentication (register, login, email/phone verification)
- Country selection with automatic currency and conversion
- Investment plans representing agricultural machines (10 seed plans)
- Deposit/withdrawal system with proof upload and admin approval
- Referral program with unique codes and statistics
- User dashboard showing balance, active investments, earnings, and history
- Admin panel accessible via `/admin` for managing users, deposits, withdrawals, machines, exchange rates, and other settings
- Exchange rate and system configuration in database
- Daily cron job to calculate earnings and complete expired plans
- Secure password hashing, JWT auth, rate limiting, input validation, and basic CSRF protection

## 🗂 Project Structure
```
Super/
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── index.js
│   │   └── ...
│   ├── package.json
│   └── .env.example
├── frontend/           # React application with TailwindCSS
│   ├── src/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 📦 Tech Stack
- **Frontend:** React, React Router, TailwindCSS, Axios
- **Backend:** Node.js, Express, Sequelize (MySQL)
- **Database:** MySQL (schema included)

## 🧩 Database Schema
See `backend/database_schema.sql` for the full SQL definitions.

## 🔧 Installation Guide
### Prerequisites
- Node.js (v18+)
- MySQL or MariaDB
- npm or yarn

### Backend Setup
1. Clone repository and navigate to backend:
   ```bash
   cd Super/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in values:
   ```bash
   cp .env.example .env
   ```
4. Create MySQL database and run migrations (or simply sync models):
   ```bash
   # using Sequelize sync for MVP
   node src/index.js
   ```

   Optionally seed initial data (admin user, machines, rates):
   ```bash
   node src/seed.js
   ```
5. Start server in development mode:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file if you need to customize API URL:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start frontend:
   ```bash
   npm start
   ```

## ⚙ Environment Variables
The `.env.example` file contains all required variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=super_cash
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
REFERRAL_PERCENTAGE=5
MIN_WITHDRAWAL=10000
WITHDRAWAL_FEE=0.02
```

## 📥 Deployment Instructions
1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve static files from backend or deploy frontend separately (e.g., Netlify, Vercel).
3. Configure environment variables on your host (Heroku, AWS, DigitalOcean, etc.).
4. Ensure MySQL database is available and set credentials.
5. Run backend with process manager (PM2, Docker, etc.) and schedule cron job:
   ```bash
   # cron example
   0 0 * * * cd /path/to/backend && node -e "require('./src/utils/cron').calculateDailyReturns()"
   ```
6. Secure with HTTPS using a certificate or reverse proxy.

## 👮 Security Considerations
- Passwords hashed with bcrypt
- JWT authentication with role-based access
- Input validation and rate limiting included
- File uploads handled via multer with restrictions
- SQL injection mitigated via Sequelize ORM
- Ready for HTTPS

## ✨ Notes & Future Improvements
- Email/phone verification currently stubbed
- Payment methods are manual with proof upload
- Admin panel UI is minimal, more features can be added
- Real payment integration and notifications needed
- Mobile responsiveness can be improved

---

This MVP provides a solid foundation for the Super Cash investment platform. Extend and refine features as needed for production readiness.
