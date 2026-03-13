import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminMode');
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', label: 'Overview', icon: '📊' },
    { path: '/admin/users', label: 'User Registry', icon: '👥' },
    { path: '/admin/deposits', label: 'Financial Inflow', icon: '💰' },
    { path: '/admin/withdrawals', label: 'Payout Control', icon: '🏦' },
    { path: '/admin/activity', label: 'Regional Analysis', icon: '🌍' },
    { path: '/admin/machines', label: 'Asset Lab', icon: '🚜' },
    { path: '/admin/settings', label: 'System Prefs', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col fixed h-full z-30 shadow-2xl overflow-hidden group">
        
        {/* Sidebar Logo */}
        <div className="p-8 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl flex items-center justify-center border border-white/10 shadow-lg transition-transform group-hover:scale-110">
              <img src="/logo.png" className="w-8 h-8 object-contain" alt="Super Cash Logo" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Super Cash</h1>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[3px]">Nexus Control</p>
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
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  isActive 
                  ? `${isOverview ? 'bg-secondary' : 'bg-primary'} text-white shadow-xl scale-[1.05]` 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 active:scale-95'
                }`}
              >
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'opacity-50'}`}>{item.icon}</span>
                <span className="tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-6 mt-auto border-t border-white/5 bg-black/10">
          <div className="bg-gray-800/50 p-4 rounded-3xl border border-white/5 mb-4">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-xs font-black text-secondary">A</div>
                <div className="overflow-hidden">
                   <p className="text-xs font-black text-white truncate">Master Admin</p>
                   <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Clearance: Level 4</p>
                </div>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            System Exit
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen relative overflow-hidden">
        
        {/* Background Accents Mix */}
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
