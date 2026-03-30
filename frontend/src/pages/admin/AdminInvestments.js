import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Investments Manager | Admin'; }, []);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await api.get('/investments');
        setInvestments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (err.response?.status === 403) navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, [navigate]);

  const handleTerminate = async (invId) => {
    if (!window.confirm('Terminate this investment? The user will stop receiving daily returns.')) return;
    try {
      await api.delete(`/investments/${invId}`);
      setInvestments(investments.map(i => i.id === invId ? { ...i, status: 'terminated' } : i));
      alert('✓ Investment terminated');
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div>
      </div>
    );
  }

  const filtered = investments.filter(inv => {
    const matchSearch = !search ||
      inv.User?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.User?.email?.toLowerCase().includes(search.toLowerCase()) ||
      inv.Machine?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = investments.filter(i => i.status === 'active').length;
  const totalVolume = investments.filter(i => i.status === 'active').reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const dailyPayout = investments.filter(i => i.status === 'active').reduce((s, i) => s + parseFloat(i.dailyIncome || 0), 0);

  const statusColor = (s) => {
    if (s === 'active') return 'bg-green-50 text-primary border-green-100';
    if (s === 'completed') return 'bg-blue-50 text-secondary border-blue-100';
    return 'bg-red-50 text-red-600 border-red-100';
  };

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Investments Manager</h2>
            <p className="text-gray-500 font-medium">View and manage all active user investment plans.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-xl shadow-secondary/5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{activeCount} Active Plans Running</span>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Investments</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter">{activeCount}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Total Capital Deployed</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{totalVolume.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-800">
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Est. Daily ROI Payout</p>
            <p className="text-4xl font-black text-secondary tracking-tighter">{dailyPayout.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[2rem] p-6 mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by user name, email or plan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:border-secondary"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-black text-sm outline-none focus:border-secondary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-32 text-center">
              <p className="text-gray-300 font-black uppercase tracking-[8px] text-sm">No Investments Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Daily ROI</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Start Date</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-6 font-mono text-xs font-black text-gray-300">#{inv.id}</td>
                      <td className="p-6">
                        <p className="font-extrabold text-gray-900 tracking-tight">{inv.User?.fullName || 'Anonymous'}</p>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-0.5">{inv.User?.email}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-bold text-gray-800 text-sm">{inv.Machine?.name || '—'}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{inv.Machine?.durationDays}d plan</p>
                      </td>
                      <td className="p-6 text-right">
                        <p className="font-black text-primary text-lg tabular-nums">{parseFloat(inv.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{inv.User?.currency || 'FBu'}</p>
                      </td>
                      <td className="p-6 text-center">
                        <span className="px-4 py-2 bg-gray-900 text-secondary rounded-xl text-xs font-black">
                          +{parseFloat(inv.dailyIncome).toLocaleString()}/day
                        </span>
                      </td>
                      <td className="p-6 text-center text-sm font-bold text-gray-500">
                        {inv.startDate ? new Date(inv.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-2 rounded-full text-[9px] font-black tracking-widest border ${statusColor(inv.status)}`}>
                          {(inv.status || 'active').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        {inv.status === 'active' ? (
                          <button
                            onClick={() => handleTerminate(inv.id)}
                            className="px-5 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-red-100"
                          >
                            Terminate
                          </button>
                        ) : (
                          <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminInvestments;
