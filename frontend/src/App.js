import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Landing from './pages/Landing';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminMachines from './pages/admin/AdminMachines';
import AdminSettings from './pages/admin/AdminSettings';
import AdminActivity from './pages/admin/AdminActivity';
import AdminManifest from './pages/admin/AdminManifest';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/auth/admin-secure-v2" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/deposits" element={<AdminDeposits />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/admin/machines" element={<AdminMachines />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
        <Route path="/admin/withdrawals/manifest" element={<AdminManifest />} />
        <Route path="/admin/withdrawals/manifest/:country" element={<AdminManifest />} />

        {/* additional static pages could be added here */}
      </Routes>
    </Router>
  );
}

export default App;