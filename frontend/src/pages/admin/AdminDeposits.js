import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Deposits Management | Admin"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/deposits');
        setDeposits(res.data);
      } catch (err) {
        setError('Failed to load deposits');
        navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleApprove = async (depositId) => {
    try {
      await api.post(`/deposits/${depositId}/approve`);
      setDeposits(deposits.map(d => d.id === depositId ? { ...d, status: 'approved' } : d));
      setSelectedDeposit(null);
      alert('✓ Deposit approved and funds added to user account!');
    } catch (err) {
      alert('Failed to approve deposit: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (depositId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
      try {
        await api.post(`/deposits/${depositId}/reject`, { reason });
        setDeposits(deposits.map(d => d.id === depositId ? { ...d, status: 'rejected' } : d));
        setSelectedDeposit(null);
        alert('✓ Deposit rejected');
      } catch (err) {
        alert('Failed to reject deposit');
      }
    }
  };

  const handleDelete = async (depositId) => {
    if (!window.confirm('WARNING: Permanently delete this deposit? This action is irreversible.')) return;
    try {
      await api.delete(`/deposits/${depositId}`);
      setDeposits(deposits.filter(d => d.id !== depositId));
      setSelectedDeposit(null);
      alert('✓ Deposit deleted');
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div>
      </div>
    );
  }

  const pending = deposits.filter(d => d.status === 'pending');
  const approved = deposits.filter(d => d.status === 'approved');
  const rejected = deposits.filter(d => d.status === 'rejected');

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        
        <div className="flex flex-col mb-12 gap-2">
           <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Deposits Management</h2>
           <p className="text-gray-500 font-medium">Review pending user funding requests and manage approvals.</p>
        </div>

        <div className="animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-orange-500/5 border border-gray-100 flex flex-col hover:scale-[1.02] transition-all">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-[5px] mb-2">Pending</p>
                <div className="flex items-center justify-between mt-auto">
                   <p className="text-6xl font-black text-gray-900 tracking-tighter">{pending.length}</p>
                   <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.8)]"></span>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-green-500/5 border border-primary/10 flex flex-col hover:scale-[1.02] transition-all">
                <p className="text-[10px] font-black text-primary uppercase tracking-[5px] mb-2">Approved</p>
                <p className="text-6xl font-black text-gray-900 mt-auto tracking-tighter">{approved.length}</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-red-500/5 border border-gray-100 flex flex-col hover:scale-[1.02] transition-all">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-[5px] mb-2">Rejected</p>
                <p className="text-6xl font-black text-gray-900 mt-auto tracking-tighter">{rejected.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
               {deposits.length === 0 ? (
                 <div className="p-40 text-center">
                    <p className="text-gray-300 font-black uppercase tracking-[10px] text-sm">No deposits found</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50/80 border-b border-gray-100">
                       <tr>
                         <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[4px]">ID</th>
                         <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[4px]">User</th>
                         <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[4px] text-right">Amount</th>
                         <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[4px] text-center">Status</th>
                         <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[4px] text-center">Screenshot</th>
                         <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[4px] text-center">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {deposits.map(d => (
                         <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="p-8 font-mono text-xs font-black text-gray-300 group-hover:text-secondary transition-colors uppercase tracking-widest">#{d.id.toString().padStart(6, '0')}</td>
                           <td className="p-8">
                              <p className="font-extrabold text-gray-900 tracking-tight text-lg">{d.User?.fullName || 'Anonymous'}</p>
                              <p className="text-[10px] font-black text-secondary uppercase tracking-[3px] mt-0.5">{d.User?.country || 'GLOBAL'}</p>
                           </td>
                           <td className="p-8 text-right font-black text-primary tabular-nums text-2xl tracking-tighter">
                              {parseFloat(d.amount).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">{d.currency}</span>
                           </td>
                           <td className="p-8 text-center">
                             <span className={`px-4 py-2 rounded-full text-[9px] font-black tracking-[3px] border transition-all ${
                               d.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                               d.status === 'approved' ? 'bg-green-50 text-primary border-green-100' :
                               'bg-red-50 text-red-600 border-red-100'
                             }`}>
                               {d.status.toUpperCase()}
                             </span>
                           </td>
                           <td className="p-8 text-center">
                             {d.proofUrl ? (
                               <div className="relative inline-block group/img">
                                   <img 
                                     src={d.proofUrl.startsWith('http') || d.proofUrl.startsWith('data:') ? d.proofUrl : `${(api.defaults.baseURL || '').replace(/\/api$/, '')}${d.proofUrl}`} 
                                     alt="proof" 
                                    className="w-16 h-12 object-cover rounded-2xl mx-auto shadow-xl ring-4 ring-white cursor-pointer hover:scale-[1.4] hover:shadow-2xl transition-all duration-500" 
                                  />
                               </div>
                             ) : (
                               <div className="text-gray-200 text-xl">∅</div>
                             )}
                           </td>
                           <td className="p-8 text-center">
                             <button onClick={() => setSelectedDeposit(d)} className="px-8 py-3 bg-gray-900 text-white hover:bg-black rounded-2xl transition-all shadow-xl shadow-black/20 font-black text-[10px] tracking-widest uppercase hover:-translate-y-1">Review</button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          </div>
      </div>

      {/* Audit Modal Overlay - Balanced Theme */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-2xl flex items-center justify-center z-[100] p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-14 shadow-[0_50px_120px_-20px_rgba(0,0,0,0.6)] border border-white/20 relative">
            <button onClick={() => setSelectedDeposit(null)} className="absolute top-12 right-12 w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all font-black text-xl shadow-sm">✕</button>

            <div className="mb-14">
               <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black rounded-xl uppercase tracking-[4px] mb-6 inline-block border border-secondary/10">Deposit #{selectedDeposit.id}</span>
               <h3 className="text-4xl font-black text-gray-900 tracking-tight">Deposit Review</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
              <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 group hover:bg-secondary/5 hover:border-secondary/20 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-3">User Verification</p>
                <p className="font-black text-gray-900 text-2xl tracking-tight">{selectedDeposit.User?.username}</p>
                <p className="text-[10px] text-secondary font-black uppercase tracking-widest mt-1 opacity-60">{selectedDeposit.User?.email}</p>
              </div>
              <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 group hover:bg-primary/5 hover:border-primary/20 transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-3">Amount Requested</p>
                <p className="font-black text-primary text-3xl tabular-nums tracking-tighter">{selectedDeposit.currency} {parseFloat(selectedDeposit.amount).toLocaleString()}</p>
              </div>
            </div>

            {selectedDeposit.proofUrl && (
              <div className="mb-14 bg-gray-50 rounded-[3rem] border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center px-12">
                   <p className="text-[10px] font-black text-gray-900 uppercase tracking-[5px] flex items-center gap-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                      Payment Screenshot
                   </p>
                   <button onClick={() => {
                      const origin = (api.defaults.baseURL || '').replace(/\/api$/, '');
                      const url = (selectedDeposit.proofUrl.startsWith('http') || selectedDeposit.proofUrl.startsWith('data:')) ? selectedDeposit.proofUrl : `${origin}${selectedDeposit.proofUrl}`;
                      window.open(url, '_blank');
                   }} className="text-[10px] font-black text-secondary hover:underline uppercase tracking-[3px] decoration-2">View Full Image</button>
                </div>
                <div className="p-12">
                   <img src={(selectedDeposit.proofUrl && ((selectedDeposit.proofUrl.startsWith('http') || selectedDeposit.proofUrl.startsWith('data:')) ? selectedDeposit.proofUrl : `${(api.defaults.baseURL || '').replace(/\/api$/, '')}${selectedDeposit.proofUrl}`))} alt="Evidence" className="w-full rounded-[2.5rem] border-[6px] border-white shadow-3xl transform hover:scale-[1.03] transition-transform duration-700" />
                   <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] mb-2 underline decoration-secondary/20 underline-offset-8">Payer Number</p>
                         <p className="text-sm font-black text-gray-800 tracking-tight">{selectedDeposit.payerNumber || 'Not provided'}</p>
                      </div>
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[4px] mb-2 underline decoration-primary/20 underline-offset-8">Payer Name</p>
                         <p className="text-sm font-black text-gray-800 tracking-tight">{selectedDeposit.payerNames || 'Not provided'}</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {selectedDeposit.status === 'pending' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  onClick={() => handleApprove(selectedDeposit.id)}
                  className="py-6 bg-primary text-white font-black rounded-3xl shadow-[0_20px_40px_-10px_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-95 transition-all text-[12px] tracking-[4px] uppercase"
                >
                  Approve Deposit
                </button>
                <button
                  onClick={() => handleReject(selectedDeposit.id)}
                  className="py-6 bg-red-600 text-white font-black rounded-3xl shadow-[0_20px_40px_-10px_rgba(220,38,38,0.4)] hover:scale-[1.02] active:scale-95 transition-all text-[12px] tracking-[4px] uppercase"
                >
                  Reject Request
                </button>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => handleDelete(selectedDeposit.id)}
                className="w-full py-4 bg-gray-50 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white transition-all text-[10px] tracking-widest uppercase"
              >
                  ⚠ Delete Deposit
              </button>
            </div>
            
            <button
               onClick={() => setSelectedDeposit(null)}
               className="w-full mt-10 py-4 text-gray-400 font-black uppercase tracking-[5px] text-[10px] hover:text-gray-900 transition-colors"
            >
               Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDeposits;