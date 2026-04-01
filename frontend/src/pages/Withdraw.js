import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Withdraw() {
  const [form, setForm] = useState({ amount: '', phone: '', network: '' });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Withdraw | Tracova"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, cryptoRes] = await Promise.all([
          api.get('/user/me'),
          api.get('/settings/crypto-wallets')
        ]);
        
        const userData = meRes.data;
        setUser(userData);
        setCryptoEnabled(cryptoRes.data?.enabled || false);
        
        // Default network logic
        if (userData.country === 'Burundi') setForm(f => ({ ...f, network: 'Lumicash' }));
        else if (userData.country === 'Kenya') setForm(f => ({ ...f, network: 'M-Pesa' }));
        else setForm(f => ({ ...f, network: 'MTN' }));

      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
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
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request withdrawal. Check your balance.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div></div>;

  const userBalance = Math.max(0, parseFloat(user.balance || 0));
  const currency = user.currency || 'FBu';
  const minWithdraw = 10000;
  const maxWithdraw = userBalance;
  
  // Quick selections
  const quickAmounts = [
    { label: 'Min.', value: minWithdraw },
    { label: '50K', value: 50000 },
    { label: '100K', value: 100000 },
    { label: 'Max', value: userBalance }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      
      {/* Header */}
      <header className="bg-primary text-white pt-16 pb-14 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Get Cash</h1>
            <p className="text-green-50 text-xs font-bold uppercase tracking-widest opacity-80">Move profits to your phone</p>
          </div>

          <button onClick={() => navigate('/dashboard')} className="bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">← Dashboard</button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 mt-10">
        
        {/* Processing Time Notice */}
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-8 flex items-center gap-5 text-amber-900 shadow-sm relative overflow-hidden -mt-16 z-20">
           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl"></div>
           <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-amber-200">⏳</div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[3px] mb-1 text-amber-600 font-sans">Processing Time</p>
              <p className="text-[13px] font-bold leading-tight">Your payout will be processed within <span className="text-amber-700">5 minutes to 24 hours</span>. If it exceeds this time, please contact Customer Support.</p>
           </div>
        </div>

        
        {/* Status Alerts */}
        {success && <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-2xl mb-6 shadow-sm flex items-center gap-4 animate-fadeIn"><div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-black">✓</div><p className="font-bold text-sm">{success}</p></div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl mb-6 shadow-sm flex items-center gap-4 animate-fadeIn"><div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-black">!</div><p className="font-bold text-sm">{error}</p></div>}

        {/* Balance Card */}
        <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl mb-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[4px] mb-2">Available Balance</p>
          <h2 className="text-5xl font-black text-white tracking-tighter">
            {userBalance.toLocaleString()} <span className="text-xl text-secondary">{currency}</span>
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Amount */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Cash Amount</label>

              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300">{currency}</span>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:bg-white focus:ring-2 focus:ring-secondary outline-none transition-all text-2xl font-black text-gray-900"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {quickAmounts.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => q.value <= maxWithdraw && setForm({ ...form, amount: q.value.toString() })}
                    disabled={q.value > maxWithdraw}
                    className="flex-1 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-secondary hover:border-secondary transition-all disabled:opacity-30"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Network */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Standard Networks Based on Country */}
                <select
                  name="network"
                  value={form.network}
                  onChange={handleChange}
                  className={`w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-secondary ${form.network === 'USDT TRC-20' ? 'opacity-40' : ''}`}
                >
                  <optgroup label="Mobile Money">
                    {user.country === 'Burundi' && (
                      <><option value="Lumicash">Lumicash</option><option value="Ecocash">Ecocash</option></>
                    )}
                    {(user.country === 'Rwanda' || user.country === 'Uganda') && (
                      <><option value="MTN">MTN Money</option><option value="Airtel">Airtel Money</option></>
                    )}
                    {user.country === 'Kenya' && (
                      <><option value="M-Pesa">M-Pesa</option><option value="Airtel">Airtel Money</option></>
                    )}
                    {!['Burundi', 'Rwanda', 'Uganda', 'Kenya'].includes(user.country) && (
                      <><option value="MTN">MTN Money</option><option value="Airtel">Airtel Money</option></>
                    )}
                  </optgroup>
                </select>

                {/* Crypto Highlight Button */}
                {cryptoEnabled && (
                  <button 
                    type="button"
                    onClick={() => setForm(f => ({ ...f, network: 'USDT TRC-20' }))}
                    className={`p-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${
                      form.network === 'USDT TRC-20' 
                      ? 'bg-gray-900 border-transparent text-secondary shadow-xl' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl">₮</span> USDT TRC-20 {form.network === 'USDT TRC-20' && '✓'}
                  </button>
                )}
              </div>
            </div>

            {/* Destination */}
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                 {form.network === 'USDT TRC-20' ? 'Your USDT Wallet Address' : 'Your Phone Number'}
               </label>

               <input
                 name="phone"
                 value={form.phone}
                 onChange={handleChange}
                 placeholder={form.network === 'USDT TRC-20' ? "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" : "e.g. +257..."}
                 className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:bg-white focus:ring-2 focus:ring-secondary transition-all font-black text-xs"
                 required
               />
               <p className="text-[10px] text-gray-400 font-bold mt-3 leading-relaxed">
                 {form.network === 'USDT TRC-20' 
                   ? '⚠️ Ensure you provide a TRC-20 USDT address. Sending to a different network will lose your funds.' 
                   : 'Double check the receiver number. Mistyped numbers cannot be reversed once paid.'}
               </p>
            </div>

            {/* Submit */}
            <button
              disabled={loading || parseFloat(form.amount) < minWithdraw || parseFloat(form.amount) > maxWithdraw}
              className="w-full py-6 bg-primary hover:bg-green-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[4px] shadow-2xl transition-all flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> PROCESSING...</>
              ) : (
                'CONFIRM WITHDRAWAL'
              )}
            </button>
          </form>
        </div>

        {/* Policy Box */}
        <div className="mt-8 bg-orange-50/50 border border-orange-100 p-8 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[4px] mb-5 flex items-center gap-3">
             <span className="text-lg">📋</span> Withdrawal Policy
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Admin Fee</p>
              <p className="text-sm font-black text-orange-950">2% Deduction</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Wait Time</p>
              <p className="text-sm font-black text-orange-950">1 – 24 Hours</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Withdraw;