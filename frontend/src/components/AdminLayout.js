import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingStats, setPendingStats] = useState({ deposits: 0, withdrawals: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dRes, wRes] = await Promise.all([
          api.get('/deposits'),
          api.get('/withdrawals')
        ]);
        const pendingDeposits = Array.isArray(dRes.data) ? dRes.data.filter(d => d.status === 'pending').length : 0;
        const pendingWithdrawals = Array.isArray(wRes.data) ? wRes.data.filter(w => w.status === 'pending').length : 0;
        setPendingStats({ deposits: pendingDeposits, withdrawals: pendingWithdrawals });
      } catch (e) {
        // silently fail — badges just won't show
      }
    };
    fetchStats();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminMode');
    navigate('/');
  };

  const menuItems = [
    { path: '/admin',             label: 'Overview',           icon: '📊' },
    { path: '/admin/users',       label: 'Users',              icon: '👥' },
    { path: '/admin/deposits',    label: 'Deposits',           icon: '💰', badge: pendingStats.deposits },
    { path: '/admin/withdrawals', label: 'Withdrawals',        icon: '🏦', badge: pendingStats.withdrawals },
    { path: '/admin/investments', label: 'Investments',        icon: '📈' },
    { path: '/admin/ledger',      label: 'Transaction Ledger', icon: '📋' },
    { path: '/admin/machines',    label: 'Farm Packages',      icon: '🚜' },
    { path: '/admin/settings',    label: 'Global Settings',    icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-gray-900 text-white flex flex-col fixed h-full z-50 shadow-2xl overflow-hidden group transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Sidebar Logo */}
        <div className="p-8 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center border border-white/10 shadow-lg transition-transform group-hover:scale-110">
              <img src="/logo.png" className="h-10 w-auto object-contain scale-110" alt="Tracova Logo" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Admin Panel</h1>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[3px]">Platform Control</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isOverview = item.path === '/admin';
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  isActive 
                  ? `${isOverview ? 'bg-secondary' : 'bg-primary'} text-white shadow-xl scale-[1.05]` 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 active:scale-95'
                }`}
              >
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'opacity-50'}`}>{item.icon}</span>
                <span className="tracking-tight flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-6 mt-auto border-t border-white/5 bg-black/10 space-y-3">
          {/* View Site Link */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs font-bold tracking-wide"
          >
            <span className="text-base">🌐</span>
            <span>View Live Site →</span>
          </a>

          {/* Admin identity */}
          <div className="bg-gray-800/50 p-4 rounded-3xl border border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-xs font-black text-secondary">A</div>
                <div className="overflow-hidden">
                   <p className="text-xs font-black text-white truncate">Admin</p>
                   <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Administrator</p>
                </div>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen relative overflow-hidden flex flex-col">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900 text-white z-30 sticky top-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
              <img src="/logo.png" className="h-10 w-auto object-contain scale-110" alt="Tracova Logo" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight">Admin Panel</h1>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[3px] leading-tight">Platform Control</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(pendingStats.deposits + pendingStats.withdrawals) > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-2 py-0.5 animate-pulse">
                {pendingStats.deposits + pendingStats.withdrawals}
              </span>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/5 shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary rounded-full opacity-[0.05] blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-primary rounded-full opacity-[0.03] blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
