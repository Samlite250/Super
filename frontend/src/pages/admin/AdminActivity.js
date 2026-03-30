import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminActivity() {
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [activeTab, setActiveTab] = useState('depositors');
  const navigate = useNavigate();

  useEffect(() => { document.title = "Regional Activity Report | Admin"; }, []);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/admin/regional-activity');
        setReport(res.data);
        const countries = Object.keys(res.data);
        if (countries.length > 0) {
          setSelectedCountry(countries[0]);
        }
      } catch (err) {
        setError('Failed to load activity report');
        if (err.response?.status === 403) navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div>
      </div>
    );
  }

  const countries = Object.keys(report);
  const data = selectedCountry ? report[selectedCountry] : null;

  const tabs = [
    { id: 'depositors', label: 'Deposits' },
    { id: 'withdrawers', label: 'Withdrawals' },
    { id: 'investors', label: 'Investments' },
    { id: 'referrers', label: 'Referrals' }
  ];

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
           <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Regional Activity</h2>
              <p className="text-gray-500 font-medium">View deposits, withdrawals, and investments by country.</p>
           </div>
           <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-xl shadow-secondary/5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">{countries.length} Countries</span>
           </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-[2rem] mb-8 font-bold shadow-sm animate-fadeIn">⚠️ {error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          
          {/* Country Selection Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-6 ml-2">Select Country</h3>
            {countries.map(country => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`w-full text-left px-8 py-6 rounded-[2rem] transition-all border ${
                  selectedCountry === country 
                  ? 'bg-gray-900 text-white border-transparent shadow-2xl scale-[1.02]' 
                  : 'bg-white text-gray-600 border-gray-100 hover:border-secondary/30 shadow-lg'
                }`}
              >
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Region</p>
                <div className="flex items-center justify-between mb-2">
                   <span className="font-black text-lg tracking-tight">{country}</span>
                   {selectedCountry === country && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
                </div>
                <div className="flex gap-4 opacity-60 text-[8px] font-black uppercase tracking-widest">
                   <span>{report[country].depositors.length} D</span>
                   <span>{report[country].withdrawers.length} W</span>
                   <span>{report[country].investors.length} I</span>
                </div>
              </button>
            ))}
          </div>

          {/* Activity View Area */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Context Specific Tabs */}
            <div className="bg-white p-2 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-wrap md:flex-nowrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                    ? 'bg-secondary text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden min-h-[500px]">
              {data && data[activeTab] && data[activeTab].length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                        <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                        <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Cumulative Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data[activeTab].map(user => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-8">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                   {(user.fullName || user.username || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-extrabold text-gray-800 tracking-tight text-lg">{user.fullName}</p>
                                   <p className="text-[10px] text-gray-400 font-bold tracking-widest lowercase">@{user.username}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-8 text-center">
                             <div className="flex flex-col items-center">
                                <span className="px-5 py-2 rounded-full bg-green-50 text-primary border border-green-100 text-[9px] font-black tracking-widest uppercase mb-1">Active</span>
                                {user.upline && (
                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Via: {user.upline.fullName}</p>
                                )}
                             </div>
                          </td>
                          <td className="p-8 text-right">
                             <p className="font-black text-gray-900 text-2xl tracking-tighter">
                                {parseFloat(user.totalActivity).toLocaleString()} <span className="text-[10px] text-gray-400 uppercase font-black ml-1">{user.currency}</span>
                             </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-center p-20">
                   <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <span className="text-4xl opacity-20">📡</span>
                   </div>
                   <h4 className="text-xl font-black text-gray-900 mb-2">No Activity Found</h4>
                   <p className="text-gray-400 font-medium max-w-xs uppercase text-[10px] tracking-widest leading-relaxed">There is no activity in this category for {selectedCountry}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminActivity;
