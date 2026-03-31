import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { document.title = "User Registry | Admin"; }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users');
        navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleBlock = async (userId, blocked) => {
    try {
      const endpoint = blocked ? 'unblock' : 'block';
      await api.post(`/admin/users/${userId}/${endpoint}`);
      setUsers(users.map(u => u.id === userId ? { ...u, blocked: !blocked } : u));
    } catch (err) {
      if (err.response?.status === 403) { alert('Admin only — please login'); navigate('/auth/admin-secure-v2'); return; }
      alert('Failed to update user');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password for this user? A temporary password will be generated and emailed.')) return;
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`);
      const temp = res.data?.tempPassword;
      alert(temp ? 'Password reset. Temporary password: ' + temp + '\nAn email was sent to the user.' : 'Password reset. Email sent to user.');
    } catch (err) {
      if (err.response?.status === 403) { alert('Admin only — please login'); navigate('/auth/admin-secure-v2'); return; }
      alert('Failed to reset password: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE this user and all associated data? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      if (err.response?.status === 403) { alert('Admin only — please login'); navigate('/auth/admin-secure-v2'); return; }
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '', country: '', balance: 0, role: 'user' });

  const openEdit = (u) => {
    setEditingUser(u.id);
    setEditForm({ fullName: u.fullName || '', email: u.email || '', phone: u.phone || '', country: u.country || '', balance: u.balance || 0, role: u.role || 'user' });
  };
  const closeEdit = () => { setEditingUser(null); setEditForm({ fullName: '', email: '', phone: '', country: '', balance: 0, role: 'user' }); };
  const handleEditChange = (e) => { const { name, value } = e.target; setEditForm({ ...editForm, [name]: value }); };
  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/users/${editingUser}`, editForm);
      setUsers(users.map(u => u.id === editingUser ? res.data : u));
      closeEdit();
      alert('User updated');
    } catch (err) {
      if (err.response?.status === 403) { alert('Admin only — please login'); navigate('/auth/admin-secure-v2'); return; }
      alert('Failed to update user: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div>
      </div>
    );
  }

  const countries = [...new Set(users.map(u => u.country).filter(Boolean))];
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || (u.fullName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
    const matchCountry = countryFilter === 'all' || u.country === countryFilter;
    return matchSearch && matchCountry;
  });
  const activeCount = users.filter(u => !u.blocked).length;
  const blockedCount = users.filter(u => u.blocked).length;

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
           <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Users Manager</h2>
              <p className="text-gray-500 font-medium">Manage user accounts and balances.</p>
           </div>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-green-100 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-primary"></span>
               <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{activeCount} Active</span>
             </div>
             {blockedCount > 0 && (
               <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-red-100 shadow-sm">
                 <span className="w-2 h-2 rounded-full bg-red-500"></span>
                 <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{blockedCount} Blocked</span>
               </div>
             )}
           </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="bg-white rounded-[2rem] p-6 mb-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, email or username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:border-secondary"
          />
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-black text-sm outline-none focus:border-secondary"
          >
            <option value="all">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-[2rem] mb-8 font-bold shadow-sm animate-fadeIn">⚠️ {error}</div>}
        
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
           {filtered.length === 0 ? (
             <div className="p-32 text-center">
                <p className="text-gray-300 font-black uppercase tracking-[8px] text-sm">{search || countryFilter !== 'all' ? 'No users match your search' : 'Registry Clear'}</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50/80 border-b border-gray-100">
                   <tr>
                     <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Identity</th>
                     <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Country</th>
                     <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance</th>
                     <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                     <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {filtered.map(u => (
                     <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="p-6">
                          <div className="flex items-center gap-5">
                             <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center font-black text-xl transition-all group-hover:scale-110 shadow-lg ${u.blocked ? 'bg-red-100 text-red-600 shadow-red-100/50' : 'bg-secondary/10 text-secondary shadow-secondary/5'}`}>
                                {(u.fullName || u.username || 'U')[0].toUpperCase()}
                             </div>
                             <div>
                                <p className="font-extrabold text-gray-900 tracking-tight text-lg">{u.fullName}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[3px] mt-0.5">{u.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-6 text-center">
                          <span className="text-[10px] font-black text-secondary bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 uppercase tracking-widest">{u.country || 'GLOBAL'}</span>
                       </td>
                       <td className="p-6 text-right font-black text-gray-900 tabular-nums text-xl tracking-tighter">
                          {Math.max(0, parseFloat(u.balance)).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase">{u.currency || 'FBu'}</span>
                       </td>
                       <td className="p-6 text-center">
                         <span className={`px-4 py-2 rounded-full text-[9px] font-black tracking-widest border transition-all ${
                           u.blocked ? 'bg-red-50 text-red-600 border-red-100 shadow-[0_5px_15px_rgba(220,38,38,0.1)]' : 'bg-green-50 text-primary border-green-100 shadow-[0_5px_15px_rgba(34,197,94,0.1)]'
                         }`}>
                           {u.blocked ? 'BLOCKED' : 'ACTIVE'}
                         </span>
                       </td>
                       <td className="p-6 text-center">
                         <div className="flex gap-3 items-center justify-center transition-all">
                           <button onClick={() => openEdit(u)} className="p-3.5 rounded-2xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-100 shadow-sm transition-all" title="Edit User">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                           </button>
                           <button onClick={() => handleBlock(u.id, u.blocked)} className={`p-3.5 rounded-2xl border shadow-sm transition-all ${u.blocked ? 'bg-green-50 text-green-500 border-green-100 hover:bg-green-500 hover:text-white' : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white'}`} title={u.blocked ? 'Unblock User' : 'Block User'}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                           </button>
                           <button onClick={() => handleResetPassword(u.id)} className="p-3.5 rounded-2xl bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-100 shadow-sm transition-all" title="Reset Password">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="p-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 shadow-sm transition-all" title="Delete User">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </td>
                     </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white p-12 lg:p-14 rounded-[4rem] w-full max-w-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 relative">
            <button onClick={closeEdit} className="absolute top-10 right-10 w-12 h-12 bg-gray-50 flex items-center justify-center rounded-full text-gray-400 hover:bg-black hover:text-white transition-all font-black text-xl">✕</button>
            <h3 className="text-3xl font-black text-gray-900 mb-10 decoration-secondary underline underline-offset-[14px] decoration-4">Edit User</h3>
            <form onSubmit={submitEdit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Full Name</label>
                    <input name="fullName" value={editForm.fullName} onChange={handleEditChange} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-gray-800" />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Email</label>
                    <input name="email" value={editForm.email} onChange={handleEditChange} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-gray-800" />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Phone Number</label>
                    <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-gray-800" />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Country</label>
                    <input name="country" value={editForm.country} onChange={handleEditChange} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-gray-800" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Balance</label>
                    <input name="balance" value={editForm.balance} onChange={handleEditChange} type="number" step="0.01" className="w-full px-6 py-5 bg-secondary/5 border border-secondary/20 rounded-[1.5rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-secondary text-xl tracking-tighter" />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">User Role</label>
                    <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full px-6 py-5 bg-gray-900 border border-white/10 rounded-[1.5rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-white cursor-pointer appearance-none text-xs tracking-widest">
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                </div>
              </div>
              <div className="pt-8 border-t border-gray-100 space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">Referral Network</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Referred By</p>
                      {users.find(u => u.id === editingUser)?.upline ? (
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-black text-[10px]">{users.find(u => u.id === editingUser).upline.fullName?.[0]}</div>
                           <div>
                              <p className="text-sm font-black text-gray-900">{users.find(u => u.id === editingUser).upline.fullName}</p>
                              <p className="text-[10px] text-gray-400 font-bold">@{users.find(u => u.id === editingUser).upline.username}</p>
                           </div>
                        </div>
                      ) : <p className="text-[10px] font-bold text-gray-300 italic">No Referrer</p>}
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Referred Users ({users.find(u => u.id === editingUser)?.downline?.length || 0})</p>
                      {users.find(u => u.id === editingUser)?.downline?.length > 0 ? (
                        <div className="space-y-3 max-h-32 overflow-y-auto">
                           {users.find(u => u.id === editingUser).downline.map(d => (
                              <div key={d.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100">
                                 <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-[8px]">{d.fullName?.[0]}</div>
                                 <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-gray-800 truncate">{d.fullName}</p>
                                    <p className="text-[8px] text-gray-400 font-bold truncate">@{d.username}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                      ) : <p className="text-[10px] font-bold text-gray-300 italic">No Referred Users</p>}
                   </div>
                </div>
              </div>
              <div className="flex gap-4 pt-10 border-t border-gray-50">
                <button type="button" onClick={closeEdit} className="flex-1 py-5 bg-gray-50 text-gray-400 font-black rounded-3xl hover:bg-gray-100 transition-all uppercase tracking-[4px] text-[10px]">Cancel</button>
                <button type="submit" className="flex-1 py-5 bg-gray-900 text-white font-black rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-black transition-all uppercase tracking-[4px] text-[10px]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUsers;