import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Withdraw() {
  const [form, setForm] = useState({ amount: '', phone: '', network: '' });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Withdraw | Super Cash"; }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/me');
        const userData = res.data;
        setUser(userData);
        
        // Auto-select first network based on country
        if (userData.country === 'Burundi') setForm(prev => ({ ...prev, network: 'Lumicash' }));
        else if (userData.country === 'Kenya') setForm(prev => ({ ...prev, network: 'M-Pesa' }));
        else setForm(prev => ({ ...prev, network: 'MTN' }));

      } catch (err) {
        console.error('Failed to fetch user data');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/withdrawals', form);
      setSuccess(`✓ Withdrawal request #${res.data.id} submitted! You'll receive payment within 24 hours.`);
      setForm(prev => ({ ...prev, amount: '', phone: '' }));
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request withdrawal. Check your balance.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading Cashier...</p>
        </div>
      </div>
    );
  }

  const userBalance = Math.max(0, parseFloat(user.balance || 0));
  const currency = user.currency || 'FBu';
  
  // Adjust min withdraw based on currency type (simplified logic)
  const isUgx = currency === 'UGX';
  const minWithdraw = isUgx ? 10000 : 10000; // keeping same for structure, but in real life you'd fetch from backend stats
  const maxWithdraw = userBalance;
  const canWithdraw = parseFloat(form.amount) >= minWithdraw && parseFloat(form.amount) <= maxWithdraw;
  
  // Quick amounts
  const quickAmounts = [
    { label: 'Min.', value: minWithdraw },
    { label: '50K', value: 50000 },
    { label: '100K', value: 100000 },
    { label: 'Max', value: userBalance }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      
      {/* Premium Header */}
      <header className="bg-primary text-white pt-16 pb-14 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -tr-translate-x-1/2 -tr-translate-y-1/2 w-64 h-64 bg-green-500 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
        
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
              📱 Withdraw Funds
            </h1>
            <p className="text-green-50 font-medium opacity-90">Securely transfer earnings to your mobile money account.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 bg-black/10 hover:bg-black/20 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-sm"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-10 relative z-20">
        
        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 font-medium shadow-sm flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold">✓</div>
            <p>{success}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 font-medium shadow-sm flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold">!</div>
            <p>{error}</p>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 md:p-8 rounded-2xl shadow-xl mb-6 relative overflow-hidden border border-gray-800">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-green-500 rounded-full opacity-10 blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider mb-1">Withdrawable Balance</p>
              <h2 className="text-4xl font-black text-white">
                {userBalance.toLocaleString()} <span className="text-xl text-gray-500">{currency}</span>
              </h2>
            </div>
            <div className="text-left md:text-right">
              <p className="text-gray-400 font-medium text-xs">Available for instant transfer</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          
          <form onSubmit={handleSubmit}>
            
            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">Withdrawal Amount</label>
              
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -tr-translate-y-1/2 text-gray-400 font-bold group-focus-within:text-primary transition-colors">
                  {currency}
                </span>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-16 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary focus:bg-white transition-all text-xl font-black text-gray-900"
                  min={minWithdraw}
                  max={maxWithdraw}
                  required
                />
              </div>

              {/* Quick Select Amounts */}
              <div className="flex flex-wrap gap-2 mt-3">
                {quickAmounts.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => {
                      if (q.value <= maxWithdraw) {
                        setForm({ ...form, amount: q.value.toString() });
                      }
                    }}
                    disabled={q.value > maxWithdraw}
                    className="flex-1 min-w-[60px] py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Transfer Destination</label>
              <div className="relative">
                <select
                  name="network"
                  value={form.network}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-semibold appearance-none cursor-pointer"
                >
                  {user.country === 'Burundi' && (
                    <>
                      <option value="Lumicash">Lumicash</option>
                      <option value="Ecocash">Ecocash</option>
                    </>
                  )}
                  {(user.country === 'Rwanda' || user.country === 'Uganda') && (
                    <>
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Airtel">Airtel Money</option>
                    </>
                  )}
                  {user.country === 'Kenya' && (
                    <>
                      <option value="M-Pesa">Safaricom M-Pesa</option>
                      <option value="Airtel">Airtel Money</option>
                    </>
                  )}
                  {!['Burundi', 'Rwanda', 'Uganda', 'Kenya'].includes(user.country) && (
                    <>
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Airtel">Airtel Money</option>
                    </>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="mb-8">
               <label className="block text-sm font-bold text-gray-700 mb-2">Receiver Account / Number</label>
               <input
                 name="phone"
                 value={form.phone}
                 onChange={handleChange}
                 placeholder="e.g. +257..."
                 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-semibold"
                 required
               />
               <p className="text-xs text-gray-500 mt-2 font-medium">Double check your details. Transfers sent to the wrong account cannot be reversed.</p>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading || !canWithdraw}
              className="w-full py-4 bg-primary hover:bg-green-700 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:scale-100 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Transfer...
                </>
              ) : (
                <>
                  Confirm Withdrawal
                  <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50/50 border border-yellow-200 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
             <span className="w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center font-bold text-xs">i</span>
             <h3 className="font-extrabold text-yellow-900">Withdrawal Policy</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
            <div>
              <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-0.5">Mobile Fee</p>
              <p className="text-sm font-bold text-yellow-900">2% Flat deduction</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-0.5">Processing Time</p>
              <p className="text-sm font-bold text-yellow-900">Max 24 Hours</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-0.5">Minimum Required</p>
              <p className="text-sm font-bold text-yellow-900">{minWithdraw.toLocaleString()} {currency}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Withdraw;