import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Transaction Ledger | Admin'; }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/admin/transactions');
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (err.response?.status === 403) navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [navigate]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return alert('No transactions to export.');
    const headers = ['ID', 'User', 'Email', 'Type', 'Amount', 'Currency', 'Description', 'Date'];
    const rows = filtered.map(tx => [
      tx.id,
      tx.User?.fullName || 'System',
      tx.User?.email || '',
      tx.type || '',
      parseFloat(tx.amount || 0).toFixed(2),
      tx.currency || 'FBu',
      `"${(tx.description || '').replace(/"/g, "'")}"`,
      tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ledger_${typeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div>
      </div>
    );
  }

  const txTypes = [...new Set(transactions.map(t => t.type).filter(Boolean))];

  const filtered = transactions.filter(tx => {
    const matchSearch = !search ||
      tx.User?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.User?.email?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    return matchSearch && matchType;
  });

  const typeStyle = (type) => {
    const styles = {
      deposit:    'bg-green-50 text-primary border-green-100',
      withdrawal: 'bg-red-50 text-red-600 border-red-100',
      roi:        'bg-blue-50 text-secondary border-blue-100',
      referral:   'bg-purple-50 text-purple-600 border-purple-100',
      investment: 'bg-orange-50 text-orange-600 border-orange-100',
    };
    return styles[type] || 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const typeIcon = (type) => {
    const icons = { deposit: '⬆️', withdrawal: '⬇️', roi: '📈', referral: '🤝', investment: '🚜' };
    return icons[type] || '💱';
  };

  const totalIn = filtered.filter(t => ['deposit', 'roi', 'referral'].includes(t.type)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const totalOut = filtered.filter(t => ['withdrawal', 'investment'].includes(t.type)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Transaction Ledger</h2>
            <p className="text-gray-500 font-medium">Full internal money movement log — deposits, ROI, referrals, withdrawals.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-xl shadow-secondary/5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{filtered.length} Transactions</span>
            </div>
            <button onClick={handleExportCSV} className="bg-green-500 text-white px-6 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all">Export CSV</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Records</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter">{filtered.length}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Money In (Credits)</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{totalIn.toLocaleString()}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-red-100">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Money Out (Debits)</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{totalOut.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
          <input type="text" placeholder="Search by user name, email or description..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:border-secondary" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-black text-sm outline-none focus:border-secondary uppercase">
            <option value="all">All Types</option>
            {txTypes.map(t => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
          </select>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-32 text-center">
              <p className="text-gray-300 font-black uppercase tracking-[8px] text-sm">No Transactions Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-6 font-mono text-xs font-black text-gray-300">#{tx.id}</td>
                      <td className="p-6">
                        <p className="font-extrabold text-gray-900 tracking-tight">{tx.User?.fullName || 'System'}</p>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-0.5">{tx.User?.email || '—'}</p>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest border ${typeStyle(tx.type)}`}>
                          <span>{typeIcon(tx.type)}</span>
                          {(tx.type || 'unknown').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <p className={`font-black text-lg tabular-nums tracking-tighter ${['deposit', 'roi', 'referral'].includes(tx.type) ? 'text-primary' : 'text-red-500'}`}>
                          {['deposit', 'roi', 'referral'].includes(tx.type) ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{tx.currency || 'FBu'}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-sm text-gray-600 font-medium max-w-xs truncate" title={tx.description}>{tx.description || '—'}</p>
                      </td>
                      <td className="p-6 text-center text-xs font-bold text-gray-500 whitespace-nowrap">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
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

export default AdminLedger;
