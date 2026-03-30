import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Deposit() {
  const [amount, setAmount] = useState('50000');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [procedures, setProcedures] = useState({});
  const [options, setOptions] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [depositId, setDepositId] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [payerNumber, setPayerNumber] = useState('');
  const [payerNames, setPayerNames] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Fund Your Account | Tracova"; }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/me');
        setUser(res.data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [procRes, optsRes] = await Promise.all([
          api.get('/settings/payment-procedures'),
          api.get('/settings/payment-options')
        ]);
        setProcedures(procRes.data || {});
        setOptions((optsRes.data || []).filter(o => o.active !== false));
      } catch (err) {
        console.error('Failed to load payment settings', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) return;
    const country = user.country || '';
    const wanted = country.toLowerCase();
    
    let found = null;
    for (const [key, proc] of Object.entries(procedures || {})) {
      if ((proc?.country && proc.country.toLowerCase() === wanted) || key.toLowerCase() === wanted) {
        found = proc;
        break;
      }
    }
    
    if (found) {
      setSelectedProcedure(found);
    } else {
        const opt = options.find(o => !o.country || o.country.toLowerCase() === wanted);
        if (opt) setSelectedProcedure(opt);
    }
  }, [user, procedures, options]);

  const parseInstructions = (text) => {
    if (!text) return [];
    return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  };

  const handleManualSubmit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return alert('Please enter a valid amount');
    if (!payerNumber || !payerNames) return alert('Please enter the payer phone number and name');
    if (!proofFile) return alert('Please upload your payment screenshot (proof) before submitting');

    setLoading(true);
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      // Create deposit request
      const res = await api.post('/deposits', { amount: parseFloat(amount), paymentMethod: 'manual' });
      const newDepositId = res.data.id;
      
      // Immediately upload proof via FormData
      const fd = new FormData();
      fd.append('proof', proofFile);
      fd.append('payerNumber', payerNumber);
      fd.append('payerNames', payerNames);
      await api.post(`/deposits/${newDepositId}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      setSuccess(`Deposit request #${newDepositId} created successfully. Awaiting Admin verification.`);
      setProofFile(null);
      setPayerNumber('');
      setPayerNames('');
      
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request manual deposit. Make sure to provide valid files.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleAutomaticPayment = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return alert('Please enter a valid amount');
    setLoading(true);
    try {
      const res = await api.post('/deposits/automatic', { amount: parseFloat(amount), phoneNumber: user.phone });
      if (res.data.link) {
        window.location.href = res.data.link;
      }
    } catch (err) {
      setError('Automatic payment initiation failed. Please try manual transfer.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    // Deprecated in favor of single-click submission
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans pb-20">
      
      {/* Dynamic Header */}
      <header className="bg-[#1F8B4C] pt-8 pb-10 px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💵</span>
            <div>
               <h1 className="text-2xl font-black text-white tracking-tight">Fund Your Account</h1>
               <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider">Add balance securely to your wallet.</p>
            </div>
          </div>
          <Link to="/dashboard" className="bg-[#00000030] hover:bg-black/30 text-white px-5 py-2 rounded-lg font-bold transition-all text-[12px] border border-white/5 flex items-center gap-2">
            ← Back
          </Link>
        </div>
      </header>

      {/* Manual Space between Header and Cards */}
      <br /><br />

      <div className="max-w-5xl mx-auto px-6">
        
        {error && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl mb-8 flex items-center gap-4 shadow-sm animate-pulse">
             <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-xs">⚠️</div>
             <p className="font-bold text-[13px]">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-[#F0FDF4] border border-[#86EFAC] text-[#166534] p-4 rounded-xl mb-8 flex items-center gap-4 shadow-sm">
             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</div>
             <p className="font-bold text-[13px]">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Section 1: Deposit Amount */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-[#F0FDF4] text-[#1F8B4C] rounded-full flex items-center justify-center font-black text-sm">1</div>
                 <h2 className="text-lg font-black text-gray-800 tracking-tight">Deposit Amount</h2>
               </div>
               <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-right border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Current Balance</p>
                  <p className="text-xs font-black text-gray-800">0 {user.currency}</p>
               </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Quick Select</label>
                <div className="grid grid-cols-4 gap-2">
                   {[5000, 10000, 20000, 50000].map(p => (
                     <button 
                       key={p} 
                       onClick={() => setAmount(p.toString())}
                       className={`py-2 rounded-lg text-[11px] font-black transition-all border ${amount == p ? 'bg-[#1F8B4C] text-white border-[#1F8B4C]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-green-200'}`}
                     >
                       + {p.toLocaleString()}
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Custom Amount</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-black text-gray-900 focus:bg-white focus:border-[#1F8B4C] outline-none transition-all"
                    placeholder="0"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 uppercase text-sm">{user.currency}</div>
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                   <p className="text-[9px] font-bold text-orange-400 uppercase tracking-tight">ⓘ Minimum: 1,000 {user.currency}</p>
                   <p className="text-[9px] font-bold text-green-500 uppercase tracking-tight">0% Processing Fee</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-dashed border-gray-100">
                  <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-[10px]">📷</span>
                    Transfer Verification (Required for Manual)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <input type="text" placeholder="Sender Phone" value={payerNumber} onChange={e => setPayerNumber(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-xs outline-none focus:border-[#1F8B4C] transition-all" />
                    <input type="text" placeholder="Sender Name" value={payerNames} onChange={e => setPayerNames(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-xs outline-none focus:border-[#1F8B4C] transition-all" />
                  </div>
                  <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-lg font-bold text-xs cursor-pointer mb-2" />
                  <p className="text-[10px] text-gray-400 font-bold mb-6">ⓘ You MUST upload a screenshot of your payment transfer</p>
              </div>

              <div className="pt-2 space-y-3">
                 <button 
                   onClick={handleAutomaticPayment}
                   disabled={loading || uploading}
                   className="w-full py-3.5 bg-[#4B83F1] hover:bg-[#3466CD] text-white rounded-xl font-black text-xs uppercase tracking-[2px] shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                 >
                   {loading && !uploading ? 'Processing...' : '🚀 AUTOMATIC TRANSFER'}
                 </button>
                 <button 
                   onClick={handleManualSubmit}
                   disabled={loading || uploading}
                   className="w-full py-3.5 bg-white border-2 border-[#1F8B4C] text-[#1F8B4C] hover:bg-green-50 rounded-xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                 >
                   {uploading ? 'UPLOADING PROOF...' : '🏦 SUBMIT MANUAL TRANSFER'}
                 </button>
              </div>
            </div>
          </div>

          {/* Section 2: Methods */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-8 h-8 bg-[#F0FDF4] text-[#1F8B4C] rounded-full flex items-center justify-center font-black text-sm">2</div>
                 <h2 className="text-lg font-black text-gray-800 tracking-tight">{user.country} Methods</h2>
              </div>

              {selectedProcedure && (
                <div className="space-y-4">
                   <div className="border-[#1F8B4C] border-[3px] bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-10 bg-gradient-to-br from-[#1F8B4C] to-green-700 rounded-lg flex items-center justify-center text-xl text-white">💳</div>
                         <p className="font-extrabold text-[#1F8B4C] text-sm uppercase tracking-tight">{selectedProcedure.name || selectedProcedure.method || 'Selection'}</p>
                      </div>
                      <div className="w-6 h-6 bg-[#1F8B4C] shadow-lg shadow-green-100 text-white rounded-full flex items-center justify-center text-[10px]">✓</div>
                   </div>

                   <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-6">
                         <span className="text-sm">📋</span>
                         <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-[3px]">Instructions</h3>
                      </div>
                      <div className="space-y-3">
                         {parseInstructions(selectedProcedure.instructions || selectedProcedure.description).map((line, idx) => (
                           <div key={idx} className="flex gap-4 items-start">
                              <span className="w-5 h-5 border border-gray-200 text-gray-300 rounded-md flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">{idx + 1}</span>
                              <p className="text-[12px] font-bold text-gray-500 leading-normal">{line}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Info - Stretched to Full Width */}
        <div className="mt-8 bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-6 text-center shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[3px] bg-[#3B82F6]"></div>
           <div className="w-8 h-8 bg-[#3B82F6] text-white rounded-lg mx-auto mb-2 flex items-center justify-center text-sm shadow-blue-100">ℹ</div>
           <h3 className="text-base font-black text-slate-800 mb-1 tracking-tight">Processing Time</h3>
           <p className="text-[12px] font-bold text-slate-500 leading-relaxed max-w-2xl mx-auto">
             Balance credited within <span className="text-slate-800 underline underline-offset-4 decoration-[#3B82F6] decoration-[2px]">1 to 24 hours</span> after proof upload. Questions? Contact <span className="text-[#1F8B4C] font-black hover:underline cursor-pointer">admin@tracova.com</span>.
           </p>
        </div>
      </div>
    </div>
  );
}

export default Deposit;