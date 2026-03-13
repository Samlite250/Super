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
      alert('Failed to export data: ' + (err.response?.data?.message || 'Unauthorized'));
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

  const handleApprove = async (withdrawalId) => {
    try {
      await api.post(`/withdrawals/${withdrawalId}/approve`);
      setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'approved' } : w));
      alert('✓ Disbursement Dispatched');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (withdrawalId) => {
    if (!window.confirm("Reject this payout request? User balance will be restored minus fees.")) return;
    try {
      await api.post(`/withdrawals/${withdrawalId}/reject`);
      setWithdrawals(withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'rejected' } : w));
      alert('✓ Protocol Rejected');
    } catch (err) {
      alert('Failed to reject withdrawal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div>
      </div>
    );
  }

  const pending = withdrawals.filter(w => w.status === 'pending');
  const approved = withdrawals.filter(w => w.status === 'approved');
  const rejected = withdrawals.filter(w => w.status === 'rejected');

  const countries = [...new Set(withdrawals.map(w => w.User?.country).filter(Boolean))];

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
           <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Disbursement Engine</h2>
              <p className="text-gray-500 font-medium">Authorize outgoing capital transfers and monitor global liquidity flux.</p>
           </div>
           <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm">
                 <select 
                   value={exportRegion} 
                   onChange={(e) => setExportRegion(e.target.value)}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                 >
                    <option value="">All Regions</option>
                    {countries.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                 </select>
                 <button 
                   onClick={handleExport}
                   disabled={isExporting}
                   className="ml-2 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                 >
                    {isExporting ? 'Generating...' : 'Excel'}
                 </button>
                 <button 
                   onClick={() => window.open(`/admin/withdrawals/manifest/${exportRegion}`, '_blank')}
                   className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 border border-white/10"
                 >
                    Print Manifest
                 </button>
              </div>

              <div className="hidden md:flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-2xl shadow-secondary/5">
                 <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-[0_0_12px_rgba(66,133,244,0.8)]"></span>
                 <span className="text-[10px] font-black text-gray-900 uppercase tracking-[4px] leading-none">Node Stable / Payout Index Active</span>
              </div>
           </div>
        </div>


        {/* KPI Cards - Blue Emphasis */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-secondary/5 border border-gray-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[5px] mb-2 relative z-10">Verification Queue</p>
            <p className="text-6xl font-black text-gray-900 relative z-10 tracking-tighter">{pending.length}</p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-primary/5 border border-gray-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[5px] mb-2 relative z-10">Total Disbursed</p>
            <p className="text-6xl font-black text-gray-900 relative z-10 tracking-tighter">{approved.length}</p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-red-500/5 border border-gray-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[5px] mb-2 relative z-10">Voided Index</p>
            <p className="text-6xl font-black text-gray-900 relative z-10 tracking-tighter">{rejected.length}</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-[2.5rem] mb-10 font-bold shadow-sm animate-fadeIn">⚠️ {error}</div>}

        <div className="bg-white rounded-[4rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="p-40 text-center">
               <p className="text-gray-300 font-black uppercase tracking-[10px] text-sm italic">Queue Depleted</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px]">Protocol Alias</th>
                    <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px]">Identity Index</th>
                    <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px]">Target Cluster</th>
                    <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px] text-right">Net Liquidity</th>
                    <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px] text-center">Protocol State</th>
                    <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[5px] text-center">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-8 font-mono text-xs font-black text-gray-300 group-hover:text-secondary transition-colors uppercase tracking-[4px]">#WF-{w.id.toString().padStart(4, '0')}</td>
                      <td className="p-8">
                         <p className="font-extrabold text-gray-900 tracking-tight text-lg">{w.User?.fullName || 'Anonymous'}</p>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[3px] mt-0.5">{w.User?.email}</p>
                      </td>
                      <td className="p-8">
                         <div className="flex flex-col">
                            <span className="text-base font-black text-gray-900 tracking-tighter">{w.phone}</span>
                            <span className="text-[9px] font-black text-secondary bg-secondary/5 px-3 py-1 rounded-xl border border-secondary/10 w-max mt-2 uppercase tracking-[3px] leading-none shadow-sm">{w.network}</span>
                         </div>
                      </td>
                      <td className="p-8 text-right">
                         <p className="font-black text-gray-900 text-2xl tabular-nums tracking-tighter">{parseFloat(w.amount).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">{w.User?.currency || 'FBu'}</span></p>
                         <p className="text-[10px] font-black text-primary uppercase tracking-[4px] mt-1 underline decoration-primary/20 underline-offset-4">Fee Adjustment: {parseFloat(w.fee).toLocaleString()}</p>
                      </td>
                      <td className="p-8 text-center">
                        <span className={`px-5 py-2.5 rounded-full text-[9px] font-black tracking-[4px] border transition-all ${
                          w.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-[0_5px_15px_rgba(249,115,22,0.1)]' :
                          w.status === 'approved' ? 'bg-secondary/5 text-secondary border-secondary/10 shadow-[0_5px_15px_rgba(66,133,244,0.1)]' :
                          'bg-red-50 text-red-600 border-red-100 shadow-[0_5px_15px_rgba(220,38,38,0.1)]'
                        }`}>
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-8 text-center">
                        {w.status === 'pending' ? (
                          <div className="flex gap-4 justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <button onClick={() => handleApprove(w.id)} className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-black shadow-2xl shadow-black/30 transition-all hover:-translate-y-1">Dispatch</button>
                            <button onClick={() => handleReject(w.id)} className="px-8 py-3 bg-white text-red-500 border border-red-100 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-red-50 transition-all">Reject</button>
                          </div>
                        ) : (
                           <span className="text-[10px] font-black text-gray-200 uppercase tracking-[6px] italic">Immutable_Log</span>
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

export default AdminWithdrawals;