import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Deposit() {
  const [amount, setAmount] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [procedures, setProcedures] = useState({});
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [depositId, setDepositId] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [payerNumber, setPayerNumber] = useState('');
  const [payerNames, setPayerNames] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Deposit | Super Cash"; }, []);

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
    // load public payment procedures and options
    const load = async () => {
      try {
        const [procRes, optsRes] = await Promise.all([
          api.get('/settings/payment-procedures'),
          api.get('/settings/payment-options'),
        ]);
        setProcedures(procRes.data || {});
        setOptions((optsRes.data || []).filter(o => o.active !== false));
      } catch (err) {
        console.error('Failed to load payment settings', err.response?.data || err.message);
      }
    };
    load();
  }, []);

  // when user and procedures are loaded, auto-select country procedure if present
  useEffect(() => {
    if (!user) return;
    const country = user.country || '';
    const findProcedureForCountry = (countryName) => {
      if (!countryName) return null;
      const wanted = countryName.toLowerCase();
      if (procedures[wanted]) return procedures[wanted];
      for (const [key, proc] of Object.entries(procedures || {})) {
        if ((proc?.country && proc.country.toLowerCase() === wanted) || key.toLowerCase() === wanted) return proc;
      }
      return null;
    };

    const proc = findProcedureForCountry(country);
    if (proc) {
      setSelectedProcedure(proc);
      setSelectedOption(proc.name || proc.method || proc.type || null);
    } else if (options && options.length) {
      setSelectedProcedure(options[0]);
      setSelectedOption(options[0].name || options[0].type || null);
    }
  }, [user, procedures, options]);

  // Fallback static methods if admin did not configure procedures/options
  const fallbackMethods = {
    'Burundi': [
      { name: 'Lumicash Burundi', icon: '💎', instructions: '1. Dial *161# \n2. Choose Pay Bill \n3. Enter Merchant ID: 889977 \n4. Confirm pay and Enter PIN.' },
      { name: 'Ecocash Burundi', icon: '🌱', instructions: '1. Dial *444# \n2. Select Send Money \n3. Use number: +257 667788 \n4. Enter PIN and confirm.' },
      { name: 'InterBank Burundi', icon: '🏦', instructions: '1. Transfer to Account: 100223344 \n2. Holder: Super Cash Admin \n3. Save receipt for upload.' }
    ],
    'Rwanda': [
      { name: 'MTN Mobile Money', icon: '💛', instructions: 'Dial *182# or use MTN Mobile Money application.' },
      { name: 'Airtel Money', icon: '❤️', instructions: 'Dial *110# or use Airtel Money.' },
      { name: 'Bank Transfer', icon: '🏦', instructions: 'Transfer via BNR, I&M Bank, or Equity Bank.' }
    ],
    'Uganda': [
      { name: 'MTN MoMo Uganda', icon: '💛', instructions: '1. Dial *165# \n2. Select Send Money \n3. Enter number: +256 77001122 \n4. Enter Amount and PIN.' },
      { name: 'Airtel Money Uganda', icon: '❤️', instructions: '1. Dial *185# \n2. Select Pay Bill \n3. Merchant ID: 554433 \n4. Enter PIN.' },
      { name: 'Bank Transfer', icon: '🏦', instructions: 'Transfer to Centenary Bank: 122334455 \nHolder: Super Cash UG.' }
    ],
    'Kenya': [
      { name: 'Safaricom M-Pesa', icon: '💚', instructions: '1. Use M-Pesa Menu \n2. Lipa na M-Pesa \n3. Buy Goods/Paybill: 998877 \n4. Enter Amount and PIN.' },
      { name: 'Airtel Money Kenya', icon: '❤️', instructions: '1. Dial *334# \n2. Select Pay Bill \n3. Merchant ID: 112233 \n4. Enter PIN.' },
      { name: 'Equity Bank Kenya', icon: '🏦', instructions: 'Transfer to Equity Bank: 4455667788 \nHolder: Super Cash Kenya.' }
    ]
  };

  const currentMethods = () => {
    if (!user) return [];
    const country = user.country || '';
    const wanted = country.toLowerCase();
    for (const [key, proc] of Object.entries(procedures || {})) {
      if ((proc?.country && proc.country.toLowerCase() === wanted) || key.toLowerCase() === wanted) return [proc];
    }
    if (options && options.length) return options;
    return fallbackMethods[country] || fallbackMethods['Rwanda'] || fallbackMethods[Object.keys(fallbackMethods)[0]];
  };

  const parseInstructions = (text) => {
    if (!text) return [];
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length > 1) return lines;
    const numbered = text.split(/(?:\n|\r|\d+\.|\d+\)|\-|\*|•)\s*/).map(s => s.trim()).filter(Boolean);
    if (numbered.length > 1) return numbered;
    return text.split(/\.\s+/).map(s => s.trim()).filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/deposits', { amount: parseFloat(amount) });
      setDepositId(res.data.id);
      setSuccess(`Deposit request #${res.data.id} submitted successfully!\n\nPlease complete the payment and upload your proof below.`);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!proofFile) return alert('Please choose a proof file');
    if (!payerNumber || !payerNames) return alert('Please enter payer phone number and full names');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('proof', proofFile);
      fd.append('payerNumber', payerNumber);
      fd.append('payerNames', payerNames);
      await api.post(`/deposits/${depositId}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Proof uploaded successfully! Admin will review it shortly.');
      setProofFile(null);
      setPayerNames('');
      setPayerNumber('');
      setDepositId(null);
      setSuccess('Your deposit proof is under review. You can check its status in your dashboard.');
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally { 
      setUploading(false); 
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
    </div>
  );

  // Quick amount suggestions
  const defaultPresets = [5000, 10000, 20000, 50000];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <header className="bg-primary text-white pt-16 pb-8 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -tr-translate-x-1/2 -tr-translate-y-1/2 w-56 h-56 bg-green-500 rounded-full opacity-15 blur-2xl"></div>
        <div className="max-w-5xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
              💵 Fund Your Account
            </h1>
            <p className="text-green-50 text-sm md:text-base font-medium opacity-90">Add balance securely to your wallet.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 bg-black/10 hover:bg-black/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-20">
        {success && (
          <div className="bg-green-50 border-[1px] border-green-500 text-green-800 p-4 rounded-xl mb-6 text-sm md:text-base font-medium shadow-sm flex items-start gap-3 whitespace-pre-line transition-all">
            <span className="text-xl">✅</span>
            <p className="mt-0.5">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-[1px] border-red-500 text-red-800 p-4 rounded-xl mb-6 text-sm md:text-base font-medium shadow-sm flex items-center gap-2 transition-all">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          <div className="flex flex-col gap-6">
            
            {/* Step 1: Professional Amount Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-primary font-bold text-sm">1</span>
                  <h2 className="text-xl font-bold text-gray-800">Deposit Amount</h2>
                </div>
                <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-right">
                  <p className="text-xs text-gray-500 font-medium">Current Balance</p>
                  <p className="text-sm font-bold text-gray-800">{Number(user.balance).toLocaleString()} {user.currency}</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col">
                
                {/* Quick Select Buttons */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Select</p>
                  <div className="flex flex-wrap gap-2">
                     {defaultPresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${amount == preset ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary hover:bg-green-50/30'}`}
                        >
                          + {preset.toLocaleString()}
                        </button>
                     ))}
                  </div>
                </div>

                <div className="mb-6 relative">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Custom Amount</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g., 5000"
                      className="w-full pl-5 pr-20 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-xl font-bold text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium shadow-inner"
                      min="1000"
                      step="100"
                      required
                    />
                    <div className="absolute right-3 px-3 py-1.5 bg-white shadow-sm border border-gray-100 text-gray-800 rounded-lg text-sm font-extrabold uppercase tracking-wider">
                      {user.currency}
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 px-1 text-sm">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Minimum: 1,000 {user.currency}
                    </span>
                    <span className="text-primary font-bold bg-green-100/50 px-2 py-0.5 rounded text-xs">0% Processing Fee</span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <button
                    disabled={loading || !amount || depositId !== null}
                    className="w-full py-4 bg-primary hover:bg-green-700 focus:ring-4 focus:ring-green-200 text-white rounded-xl shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transform transition-transform duration-200 active:scale-[0.98] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex justify-center items-center gap-2 border border-transparent"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : depositId ? (
                      '✓ Request Submitted'
                    ) : (
                       <>
                         Proceed with {amount ? `${Number(amount).toLocaleString()} ${user.currency}` : 'Deposit'}
                         <svg className="w-5 h-5 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                       </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Step 3: Upload Proof - Compressed version */}
            {depositId && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-primary transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold text-xs">3</span>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Upload Transfer Proof</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Request <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200">#{depositId}</span></p>
                  </div>
                </div>

                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Phone / Account</label>
                      <input type="text" placeholder="+250 788 123 456" value={payerNumber} onChange={e => setPayerNumber(e.target.value)} className="w-full p-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-secondary/50 outline-none text-sm transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Full Name</label>
                      <input type="text" placeholder="John Doe" value={payerNames} onChange={e => setPayerNames(e.target.value)} className="w-full p-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-secondary/50 outline-none text-sm transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-green-200 border-dashed rounded-xl cursor-pointer bg-green-50/50 hover:bg-green-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                      {proofFile ? (
                        <>
                          <svg className="w-5 h-5 mb-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-xs font-bold text-gray-800 text-center px-4 truncate w-full">{proofFile.name}</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mb-1 text-primary opacity-80" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="text-xs text-gray-600 font-medium"><span className="font-semibold text-primary">Click to choose a file</span></p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={e => setProofFile(e.target.files[0])} />
                  </label>
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={uploading || !proofFile || !payerNumber || !payerNames} 
                  className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl shadow-md transition-transform duration-200 active:scale-[0.98] font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Confirm Payment'}
                </button>
              </div>
            )}

          </div>

          {/* Sidebar Area: Methods & Instructions */}
          <div className="flex flex-col gap-6">
            
            {/* Step 2: Payment Methods */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-primary font-bold text-sm">2</span>
                <h2 className="text-xl font-bold text-gray-800">{user.country} Methods</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mb-5">
                {currentMethods().map((method, idx) => {
                  const isSelected = selectedProcedure && (selectedProcedure === method || selectedProcedure.country === method.country || selectedProcedure.method === method.method);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { setSelectedOption(method.name || method.title || method.type || method.method || null); setSelectedProcedure(method); }} 
                      className={`cursor-pointer group flex items-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-green-50/40 shadow-sm' : 'border-gray-100 hover:border-green-300 hover:bg-gray-50'}`}
                    >
                      <div className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-2xl border transition-colors ${isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 group-hover:bg-green-50 group-hover:text-primary'} mr-4`}>
                          {method.icon || '💳'}
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <div className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                          {method.name || method.title || method.method || method.type}
                        </div>
                      </div>
                      
                      {isSelected && (
                         <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white ml-2">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Instructions Box */}
              {selectedProcedure ? (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-auto">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <span className="text-primary text-base">📋</span> Instructions
                  </h3>
                  {(() => {
                    const steps = parseInstructions(selectedProcedure.instructions || selectedProcedure.accountDetails || selectedProcedure.account || '');
                    if (!steps || steps.length === 0) return <p className="text-sm text-gray-500 italic">Follow standard payment instructions.</p>;
                    return (
                      <ul className="space-y-3">
                        {steps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-white text-primary font-bold text-xs border border-gray-200 shadow-sm">
                              {i+1}
                            </span>
                            <span className="mt-0.5">{step}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center mt-auto">
                  <p className="text-sm text-gray-500">Pick a payment method to see instructions.</p>
                </div>
              )}
            </div>

            {/* Premium Note vertically stretched */}
             <div className="bg-blue-50 border-l-4 border-secondary p-5 rounded-xl flex gap-4 items-center justify-center shadow-sm min-h-[140px]">
               <div className="flex flex-col items-center text-center">
                 <span className="text-3xl mb-2">ℹ️</span>
                 <h3 className="text-lg font-bold text-gray-900 mb-1">Processing Time</h3>
                 <p className="text-xs text-gray-700 leading-relaxed max-w-sm">
                   Balance credited within 1 to 24 hours after proof upload. Questions? Contact <strong className="text-primary">admin@supercash.com</strong>.
                 </p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Deposit;