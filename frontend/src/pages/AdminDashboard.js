import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { document.title = "Admin Dashboard | Tracova"; }, []);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied. Please sign in again.');
        setTimeout(() => navigate('/auth/admin-secure-v2'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-red-50 flex items-center justify-center">
        <div className="bg-white border border-red-100 p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 font-medium mb-8">{error}</p>
          <button onClick={() => navigate('/auth/admin-secure-v2')} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Return to Login</button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        
        {/* Page Title Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Platform <span className="text-secondary">Overview</span></h2>
              <p className="text-gray-500 font-medium">Monitoring your **business performance** and **user activity** in real-time.</p>
           </div>
           <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4">
              <div className="flex -space-x-3">
                 <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white"></div>
                 <div className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-white"></div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">System Status</p>
                 <p className="text-xs font-black text-secondary uppercase tracking-widest leading-none">Healthy & **Active**</p>
              </div>
           </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-gray-100 relative overflow-hidden transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 relative z-10">Total Registered **Users**</p>
            <p className="text-5xl font-black text-gray-900 relative z-10 tracking-tighter">{stats.totalUsers || 0}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-secondary uppercase tracking-wider relative z-10">
               <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
               Live user accounts
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-gray-100 relative overflow-hidden transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 relative z-10">Total **Deposits** Volume</p>
            <p className="text-4xl font-black text-gray-900 relative z-10 tracking-tighter">{parseFloat(stats.totalDeposits || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-primary uppercase tracking-wider relative z-10">
               Verified FBu Revenue
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-gray-100 relative overflow-hidden transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 relative z-10">Total **Withdrawals**</p>
            <p className="text-4xl font-black text-gray-900 relative z-10 tracking-tighter">{parseFloat(stats.totalWithdrawals || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-secondary uppercase tracking-wider relative z-10">
               Funds paid out to users
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-gray-100 relative overflow-hidden transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 relative z-10">Active **Investments**</p>
            <p className="text-4xl font-black text-gray-900 relative z-10 tracking-tighter">{parseFloat(stats.totalInvestments || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-primary uppercase tracking-wider relative z-10">
               Current plans running
            </div>
          </div>
        </div>

        {/* Operational Modules Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      Recent **Activity Log**
                   </h3>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest underline underline-offset-8 cursor-pointer hover:text-secondary">View full history</span>
                </div>
                <div className="space-y-4">
                  {[
                    { time: "Just now", action: "User WITHDRAWAL request #WF-1092 was verified", type: "blue" },
                    { time: "15 mins ago", action: "NEW INVESTMENT started: 'Harvester X-1'", type: "green" },
                    { time: "1 hour ago", action: "Daily interest DISTRIBUTED to all users", type: "green" },
                    { time: "3 hours ago", action: "NEW USER identity verified: 'Alpha'", type: "blue" },
                    { time: "5 hours ago", action: "Manual account CREDIT added to 'SuperUser'", type: "blue" }
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-gray-50/50 hover:bg-white hover:shadow-lg rounded-2xl border border-gray-50 transition-all group/row">
                       <div className="flex items-center gap-5">
                          <div className={`w-2 h-2 rounded-full ${
                             log.type === 'blue' ? 'bg-secondary' : 'bg-primary'
                          }`}></div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 tracking-tight group-hover/row:text-gray-900">{log.action}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{log.time}</p>
                          </div>
                       </div>
                       <button className="text-[10px] font-black text-gray-300 hover:text-secondary transition-colors uppercase tracking-widest">Details</button>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-gray-950 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary rounded-full opacity-[0.05] blur-3xl"></div>
                <h3 className="text-xl font-black text-white mb-10 relative z-10 flex items-center gap-3">
                   <span className="text-secondary">📋</span>
                   **Daily Tasks**
                </h3>
                <div className="space-y-4 relative z-10">
                   {[
                     { task: "Check pending deposits", color: "primary" },
                     { task: "Approve large withdrawals", color: "secondary" },
                     { task: "Review system settings", color: "secondary" },
                     { task: "Update investment yields", color: "primary" }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/task">
                        <span className={`text-[10px] font-black ${item.color === 'primary' ? 'text-primary' : 'text-secondary'} opacity-40 group-hover/task:opacity-100 tracking-widest`}>TASK {i+1}</span>
                        <p className="text-sm font-bold text-gray-400 group-hover/task:text-white transition-colors">{item.task}</p>
                     </div>
                   ))}
                </div>
                <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-[4px] mb-2">Current Server Time</p>
                   <p className="text-sm font-bold text-white tracking-widest">{new Date().toLocaleTimeString()} (GMT)</p>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">System Health Monitor</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-gray-600">Main Server</span>
                     <span className="px-3 py-1 bg-green-50 text-primary text-[9px] font-black rounded-full border border-green-100 uppercase tracking-widest">Running Well</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-gray-600">Database Sync</span>
                     <span className="px-3 py-1 bg-blue-50 text-secondary text-[9px] font-black rounded-full border border-blue-100 uppercase tracking-widest">Synchronized</span>
                  </div>
                </div>
             </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;