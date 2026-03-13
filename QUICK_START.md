# Super Cash Platform - Quick Start Guide

## 🚀 System Status
✅ Backend running on `http://localhost:5000`  
✅ Frontend running on `http://localhost:3000`  
✅ 11 Investment Plans loaded  
✅ Admin user created  
✅ Test user created  

---

## 👨‍💼 ADMIN ACCESS

### Admin Login Credentials
- **Email:** `admin@supercash.com`
- **Password:** `adminpass123`

### Step-by-Step Admin Access:
1. Go to `http://localhost:3000`
2. Click **"Admin"** button in header
3. Enter admin email and password
4. Click **Login**

### Admin Dashboard Features:
- View total users, deposits, withdrawals, investments
- Manage users (view, block, unblock)
- Manage deposits and withdrawals
- View/edit investment plans (machines)
- Configure system settings

---

## 👤 USER ACCESS (Test Account)

### Test User Credentials
- **Email:** `user@supercash.com`
- **Password:** `userpass123`
- **Country:** Rwanda (RWF)
- **Starting Balance:** 500,000 RWF

### Step-by-Step User Access:
1. Go to `http://localhost:3000`
2. Click **"Login"** button
3. Enter user email and password
4. Click **Sign In**
5. You'll be redirected to Dashboard

---

## 📋 COMPLETE USER FLOW

### 1. **Registration** (New Users)
   - Click "Register" on landing page
   - Fill form with your details
   - Select your country
   - Submit
   - ✅ Auto-redirects to login page
   - Login with your new credentials

### 2. **Dashboard Access**
   After login, you'll see:
   - ✅ Your available balance
   - ✅ Your country
   - ✅ Your referral code
   - ✅ Your active investments

### 3. **View Investment Plans**
   - Click "View Plans" button on dashboard
   - Or click header "Investment Plans" link
   - See all 11 available plans:
     - 8 Standard Plans (3.0% - 4.0% daily)
     - 3 Premium Plans (4.5% - 5.0% daily)

### 4. **Invest in a Plan**
   - Click "Invest Now" button on any plan
   - Confirms your investment
   - Updates your active investments
   - Balance is deducted

### 5. **Logout**
   - Click red "Logout" button in header
   - Returns to home page

---

## 💡 System Features Demonstrated

### ✅ Already Working:
- User registration & login
- Admin authentication
- 11 investment plans displayed
- Dashboard with balance and investments
- Navigation between pages
- Role-based access control
- Responsive design (mobile-friendly)

### 📊 Investment Plans Load Automatically:
1. Tractor X200 (50,000 FBu - 3.0%)
2. Plow Deluxe (100,000 FBu - 3.2%)
3. Harvester Pro (150,000 FBu - 3.5%)
4. Mini Cultivator (60,000 FBu - 3.1%)
5. Seeder M1 (200,000 FBu - 3.6%)
6. Miller 250 (250,000 FBu - 3.7%)
7. Irrigation Machine (500,000 FBu - 4.0%)
8. Crop Duster (300,000 FBu - 3.8%)
9. Harvest Titan (700,000 FBu - 4.5%) ⭐ Premium
10. Pro Seeder 900 (900,000 FBu - 4.8%) ⭐ Premium
11. Mega Agro Combine (1,000,000 FBu - 5.0%) ⭐ Premium

---

## 🔗 Quick Links

| Page | URL | Access |
|------|-----|--------|
| Home | http://localhost:3000 | Public |
| Login | http://localhost:3000/login | Public |
| Register | http://localhost:3000/register | Public |
| Admin Login | http://localhost:3000/admin-login | Public |
| Dashboard | http://localhost:3000/dashboard | Users Only |
| Investment Plans | http://localhost:3000/machines | Users Only |
| Admin Panel | http://localhost:3000/admin | Admins Only |
| Admin Users | http://localhost:3000/admin/users | Admins Only |
| Admin Deposits | http://localhost:3000/admin/deposits | Admins Only |
| Admin Withdrawals | http://localhost:3000/admin/withdrawals | Admins Only |
| Admin Machines | http://localhost:3000/admin/machines | Admins Only |
| Admin Settings | http://localhost:3000/admin/settings | Admins Only |

---

## 🎯 How to Test the Complete System

### Scenario 1: Test as Admin
1. Open `http://localhost:3000/admin-login`
2. Enter: `admin@supercash.com` / `adminpass123`
3. View admin dashboard with all stats
4. Click management buttons to navigate

### Scenario 2: Test as Existing User
1. Open `http://localhost:3000/login`
2. Enter: `user@supercash.com` / `userpass123`
3. View your dashboard (balance: 500,000 RWF)
4. Click "View Plans" to see investment options
5. Click "Invest Now" on any plan
6. View updated dashboard with new investment
7. Click "Logout" to return home

### Scenario 3: Test as New User (Registration)
1. Open `http://localhost:3000/register`
2. Fill in your details:
   - Full Name: Your Name
   - Username: unique_username
   - Phone: +25712345678
   - Email: yourtest@email.com
   - Password: testpass123
   - Country: Select any country
3. Click "Sign Up"
4. ✅ Auto-redirected to login page
5. Login with your new credentials
6. View your new dashboard
7. Explore investment plans

---

## 🐛 Troubleshooting

### Frontend not loading?
```bash
# In frontend terminal
npm start
```

### Backend not running?
```bash
# In backend terminal
npm run dev
```

### Clear browser cache if issues persist:
- Ctrl+Shift+Delete (Windows)
- Clear all browser data
- Refresh page

---

## 📝 Next Steps

To add more data:
- Create more test users: `node create-test-user.js`
- Add more investment plans: `node insert-machines.js`
- Implement remaining features (deposits, withdrawals, referrals)

---

**Enjoy testing the Super Cash Investment Platform!** 🎉
