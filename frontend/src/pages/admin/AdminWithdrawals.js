import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportRegion, setExportRegion] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Global Withdrawals | Admin"; }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await api.get(`/withdrawals/export?country=${exportRegion}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Withdrawals_${exportRegion || 'All'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await api.get('/withdrawals');
        setWithdrawals(res.data);
      } catch (err) {
        setError('Failed to load withdrawals');
        navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, [navigate]);

  const handleApprove = async (withdrawalId, autoDispatch = false) => {
    if (autoDispatch && !window.confirm("Perform AUTOMATED disbursement via Flutterwave? This will send real money instantly.")) return;
    try {
      await api.post(`/withdrawals/${withdrawalId}/approve`, { autoDispatch });
      setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'approved' } : w));
      alert(autoDispatch ? '🚀 Automated Payout Dispatched' : '✓ Manual Approval Logged');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (withdrawalId) => {
    if (!window.confirm("Reject this payout request?")) return;
    try {
      await api.post(`/withdrawals/${withdrawalId}/reject`);
      setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'rejected' } : w));
      alert('✓ Request Rejected');
    } catch (err) {
      alert('Failed to reject withdrawal');
    }
  };

  const handleDelete = async (withdrawalId) => {
    if (!window.confirm('WARNING: Permanently purge this disbursement record? This action is irreversible.')) return;
    try {
      await api.delete(`/withdrawals/${withdrawalId}`);
      setWithdrawals(withdrawals.filter(w => w.id !== withdrawalId));
      alert('✓ Withdrawal deleted');
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div></div>;

  const pending = withdrawals.filter(w => w.status === 'pending');
  const countries = [...new Set(withdrawals.map(w => w.User?.country).filter(Boolean))];

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
           <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Withdrawals</h2>
              <p className="text-gray-500 font-medium">Manage and process user withdrawals.</p>
           </div>
           <div className="flex flex-wrap items-center gap-4">
              <select value={exportRegion} onChange={(e) => setExportRegion(e.target.value)} className="bg-white border border-gray-100 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
                <option value="">All Regions</option>
                {countries.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
              <button onClick={handleExport} disabled={isExporting} className="bg-green-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">📊 Export to Excel</button>
              <button onClick={() => window.open(`/admin/withdrawals/manifest/${exportRegion}`, '_blank')} className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">🖨️ Print Daily Manifest</button>
           </div>
        </div>

        <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px]">ID</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px]">User</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px]">Details</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px] text-right">Amount</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px] text-center">Status</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50/50 group">
                    <td className="p-8 font-mono text-xs font-black text-gray-300">#WF-{w.id.toString().padStart(4, '0')}</td>
                    <td className="p-8">
                       <p className="font-extrabold text-gray-900">{w.User?.fullName}</p>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-[3px]">{w.User?.email}</p>
                    </td>
                    <td className="p-8">
                       <p className="text-base font-black text-gray-900">{w.phone}</p>
                       <span className="text-[9px] font-black text-secondary bg-secondary/5 px-3 py-1 rounded-xl uppercase tracking-[3px]">{w.network}</span>
                    </td>
                    <td className="p-8 text-right">
                       <p className="font-black text-gray-900 text-2xl tracking-tighter">{parseFloat(w.amount).toLocaleString()} {w.User?.currency}</p>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[4px]">Fee: {parseFloat(w.fee).toLocaleString()}</p>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black tracking-[4px] border ${w.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : w.status === 'approved' ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-8 text-center">
                      {w.status === 'pending' ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleApprove(w.id, true)} className="px-4 py-2 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Auto</button>
                          <button onClick={() => handleApprove(w.id, false)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Manual</button>
                          <button onClick={() => handleReject(w.id)} className="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest">Reject</button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-center">
                           <span className="text-[10px] font-black text-gray-200 uppercase tracking-[6px] italic mb-2">Processed</span>
                           <button 
                             onClick={() => handleDelete(w.id)}
                             className="text-[9px] font-black text-red-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                           >
                             Delete
                           </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminWithdrawals;