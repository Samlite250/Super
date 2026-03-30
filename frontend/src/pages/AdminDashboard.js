import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Admin Dashboard | Tracova"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, depRes, withRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/deposits'),
          api.get('/withdrawals'),
        ]);
        setStats(statsRes.data);
        // Latest 5 deposits and withdrawals for the activity feed
        setRecentDeposits((depRes.data || []).slice(0, 5));
        setRecentWithdrawals((withRes.data || []).slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied. Please sign in again.');
        setTimeout(() => navigate('/auth/admin-secure-v2'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary mb-4"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading dashboard...</p>
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

  const pendingDeposits = recentDeposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = recentWithdrawals.filter(w => w.status === 'pending');

  const quickLinks = [
    { label: 'Review Deposits', count: pendingDeposits.length, path: '/admin/deposits', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { label: 'Process Withdrawals', count: pendingWithdrawals.length, path: '/admin/withdrawals', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Manage Users', count: stats.totalUsers, path: '/admin/users', color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/10' },
    { label: 'View Investments', count: null, path: '/admin/investments', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
  ];

  // Build combined activity feed from real data
  const activityFeed = [
    ...recentDeposits.map(d => ({
      time: new Date(d.createdAt).toLocaleTimeString(),
      date: new Date(d.createdAt).toLocaleDateString(),
      action: `Deposit of ${parseFloat(d.amount).toLocaleString()} ${d.currency} — ${d.User?.fullName || 'Unknown'}`,
      status: d.status,
      color: d.status === 'approved' ? 'bg-primary' : d.status === 'pending' ? 'bg-orange-400' : 'bg-red-400',
    })),
    ...recentWithdrawals.map(w => ({
      time: new Date(w.createdAt).toLocaleTimeString(),
      date: new Date(w.createdAt).toLocaleDateString(),
      action: `Withdrawal of ${parseFloat(w.amount).toLocaleString()} ${w.User?.currency || ''} — ${w.User?.fullName || 'Unknown'}`,
      status: w.status,
      color: w.status === 'approved' ? 'bg-secondary' : w.status === 'pending' ? 'bg-orange-400' : 'bg-red-400',
    })),
  ]
    .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))
    .slice(0, 8);

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">

        {/* Page Title */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Platform Overview</h2>
            <p className="text-gray-500 font-medium">Live snapshot of your platform's business performance.</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">System Status</p>
              <p className="text-xs font-black text-primary uppercase tracking-widest leading-none">Online & Active</p>
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/admin/users" className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-gray-100 hover:-translate-y-1 transition-all block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Users</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.totalUsers || 0}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-secondary uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Registered accounts
            </div>
          </Link>

          <Link to="/admin/deposits" className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-gray-100 hover:-translate-y-1 transition-all block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Deposits</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{parseFloat(stats.totalDeposits || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-primary uppercase tracking-wider">
              All-time deposit volume
            </div>
          </Link>

          <Link to="/admin/withdrawals" className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-secondary/5 border border-gray-100 hover:-translate-y-1 transition-all block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Withdrawals</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{parseFloat(stats.totalWithdrawals || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-secondary uppercase tracking-wider">
              Funds paid out to users
            </div>
          </Link>

          <Link to="/admin/investments" className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-gray-100 hover:-translate-y-1 transition-all block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Investments</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{parseFloat(stats.totalInvestments || 0).toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-primary uppercase tracking-wider">
              Capital deployed in plans
            </div>
          </Link>
        </div>

        {/* Quick Actions + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Activity Log (real data) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  Recent Activity
                </h3>
                <Link to="/admin/ledger" className="text-[10px] font-black text-gray-400 uppercase tracking-widest underline underline-offset-8 hover:text-secondary transition-colors">
                  View All Transactions
                </Link>
              </div>

              {activityFeed.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityFeed.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-gray-50/50 hover:bg-white hover:shadow-md rounded-2xl border border-gray-50 transition-all group/row">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.color}`}></div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 tracking-tight">{log.action}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{log.date} · {log.time}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ml-4 flex-shrink-0 ${
                        log.status === 'approved' ? 'bg-green-50 text-primary border border-green-100' :
                        log.status === 'pending'  ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-red-50 text-red-500 border border-red-100'
                      }`}>{log.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Panel */}
          <div className="space-y-5">

            {/* Attention Required */}
            <div className="bg-gray-950 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary rounded-full opacity-[0.04] blur-3xl"></div>
              <h3 className="text-lg font-black text-white mb-6 relative z-10 flex items-center gap-3">
                <span className="text-secondary">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-3 relative z-10">
                {quickLinks.map((item, i) => (
                  <Link
                    key={i}
                    to={item.path}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group/task"
                  >
                    <p className="text-sm font-bold text-gray-400 group-hover/task:text-white transition-colors">{item.label}</p>
                    {item.count !== null && (
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black ${item.count > 0 ? item.bg + ' ' + item.color + ' border ' + item.border : 'bg-white/10 text-gray-500'}`}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Pending Alerts */}
            {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
              <div className="bg-orange-50 border border-orange-100 p-7 rounded-[2.5rem]">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">⚠ Needs Your Attention</p>
                <div className="space-y-2">
                  {pendingDeposits.length > 0 && (
                    <Link to="/admin/deposits" className="block p-4 bg-white rounded-2xl border border-orange-100 hover:shadow-md transition-all">
                      <p className="text-sm font-black text-gray-900">{pendingDeposits.length} Pending Deposit{pendingDeposits.length > 1 ? 's' : ''}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">Awaiting your approval</p>
                    </Link>
                  )}
                  {pendingWithdrawals.length > 0 && (
                    <Link to="/admin/withdrawals" className="block p-4 bg-white rounded-2xl border border-orange-100 hover:shadow-md transition-all">
                      <p className="text-sm font-black text-gray-900">{pendingWithdrawals.length} Pending Withdrawal{pendingWithdrawals.length > 1 ? 's' : ''}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">Awaiting processing</p>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Server Time */}
            <div className="bg-white p-7 rounded-[2.5rem] shadow-lg border border-gray-100 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] mb-2">Current Server Time</p>
              <p className="text-sm font-bold text-gray-700 tracking-widest">{new Date().toLocaleString()}</p>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;