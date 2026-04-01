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
  const [proofFile, setProofFile] = useState(null);
  const [payerNumber, setPayerNumber] = useState('');
  const [payerNames, setPayerNames] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentTab, setPaymentTab] = useState('mobile'); // 'mobile' | 'auto' | 'crypto'
  const [cryptoWallet, setCryptoWallet] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [cryptoProofFile, setCryptoProofFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Fund Your Account | Tracova"; }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/me');
        setUser(res.data);
      } catch (err) { navigate('/login'); }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [procRes, optsRes, cryptoRes] = await Promise.all([
          api.get('/settings/payment-procedures'),
          api.get('/settings/payment-options'),
          api.get('/settings/crypto-wallets')
        ]);
        setProcedures(procRes.data || {});
        setOptions((optsRes.data || []).filter(o => o.active !== false));
        if (cryptoRes.data?.enabled && cryptoRes.data?.trc20) {
          setCryptoWallet(cryptoRes.data);
        }
      } catch (err) {
        console.error('Failed to load payment settings', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) return;
    const wanted = (user.country || '').toLowerCase();
    let found = null;
    for (const [key, proc] of Object.entries(procedures || {})) {
      if ((proc?.country && proc.country.toLowerCase() === wanted) || key.toLowerCase() === wanted) {
        found = proc; break;
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

  const handleCopyAddress = () => {
    if (!cryptoWallet?.trc20) return;
    navigator.clipboard.writeText(cryptoWallet.trc20).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleManualSubmit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return alert('Please enter a valid amount');
    if (!payerNumber || !payerNames) return alert('Please enter the sender phone number and name');
    if (!proofFile) return alert('Please upload your payment screenshot before submitting');
    setLoading(true); setUploading(true); setError(null); setSuccess(null);
    try {
      const res = await api.post('/deposits', { amount: parseFloat(amount), paymentMethod: 'manual' });
      const newDepositId = res.data.id;
      const fd = new FormData();
      fd.append('proof', proofFile);
      fd.append('payerNumber', payerNumber);
      fd.append('payerNames', payerNames);
      await api.post(`/deposits/${newDepositId}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(`Deposit request #${newDepositId} submitted. Waiting for approval.`);
      setProofFile(null); setPayerNumber(''); setPayerNames('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add money.');
    } finally { setLoading(false); setUploading(false); }

  };

  const handleAutomaticPayment = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return alert('Please enter a valid amount');
    setLoading(true);
    try {
      const res = await api.post('/deposits/automatic', { amount: parseFloat(amount), phoneNumber: user.phone });
      if (res.data.link) window.location.href = res.data.link;
    } catch (err) {
      setError('Automatic payment failed. Please try manual transfer.');
    } finally { setLoading(false); }
  };

  const handleCryptoSubmit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return alert('Please enter a valid amount');
    if (!txHash.trim()) return alert('Please enter the transaction hash (TxID) from your crypto wallet');
    if (!cryptoProofFile) return alert('Please upload a screenshot of your transaction');
    setLoading(true); setUploading(true); setError(null); setSuccess(null);
    try {
      const res = await api.post('/deposits', { amount: parseFloat(amount), paymentMethod: 'crypto_trc20' });
      const newDepositId = res.data.id;
      const fd = new FormData();
      fd.append('proof', cryptoProofFile);
      fd.append('payerNumber', txHash.trim()); // reuse payerNumber field for txHash
      fd.append('payerNames', 'USDT TRC-20');
      await api.post(`/deposits/${newDepositId}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(`Crypto deposit #${newDepositId} submitted! Admin will verify your TxID and approve within 1-3 hours.`);
      setTxHash(''); setCryptoProofFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit crypto deposit.');
    } finally { setLoading(false); setUploading(false); }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans pb-20">

      {/* Header */}
      <header className="bg-[#1F8B4C] pt-8 pb-10 px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💵</span>
            <div>
               <h1 className="text-2xl font-black text-white tracking-tight">Add Money</h1>
               <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider">Add money to your account safely.</p>
            </div>
          </div>

          <Link to="/dashboard" className="bg-[#00000030] hover:bg-black/30 text-white px-5 py-2 rounded-lg font-bold transition-all text-[12px] border border-white/5 flex items-center gap-2">← Back</Link>
        </div>
      </header>

      <br /><br />

      <div className="max-w-5xl mx-auto px-6">
        
        {/* Processing Time Notice */}
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-8 flex items-center gap-5 text-amber-900 shadow-sm relative overflow-hidden -mt-10 z-20">
           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl"></div>
           <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-amber-200">⏳</div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[3px] mb-1 text-amber-600">Processing Time</p>
              <p className="text-[13px] font-bold leading-tight">Your request will be processed within <span className="text-amber-700">5 minutes to 24 hours</span>. If it exceeds this time, please contact Customer Support.</p>
           </div>
        </div>


        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-4 shadow-sm animate-pulse">
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

        {/* Payment Method Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => setPaymentTab('auto')}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all ${paymentTab === 'auto' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-blue-500'}`}
          >
            🚀 Auto Pay
          </button>
          <button
            onClick={() => setPaymentTab('mobile')}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all ${paymentTab === 'mobile' ? 'bg-[#1F8B4C] text-white shadow-lg' : 'text-gray-400 hover:text-[#1F8B4C]'}`}
          >
            🏦 Mobile Money
          </button>
          {cryptoWallet && (
            <button
              onClick={() => setPaymentTab('crypto')}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all ${paymentTab === 'crypto' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
            >
              ₮ USDT TRC-20
            </button>
          )}
        </div>

        {/* ─── CRYPTO TAB ─────────────────────────────────────────────────────── */}
        {paymentTab === 'crypto' && cryptoWallet && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fadeIn">

            {/* Left: Instructions + Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-black text-sm">₮</div>
                <h2 className="text-lg font-black text-gray-800 tracking-tight">Send USDT via TRC-20</h2>
              </div>

              {/* Amount */}
              <div className="mb-5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Amount ({user.currency})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-black text-gray-900 focus:bg-white focus:border-[#1F8B4C] outline-none transition-all"
                  placeholder="0"
                />
                <p className="text-[10px] text-orange-400 font-bold mt-2">Contact support for the USDT equivalent of your amount before sending.</p>
              </div>

              {/* QR + Address */}
              <div className="bg-gray-950 rounded-2xl p-6 mb-5 text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Scan or Copy Wallet Address</p>
                <div className="flex justify-center mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(cryptoWallet.trc20)}&bgcolor=0a0a0a&color=4ade80&margin=10`}
                    alt="USDT TRC-20 QR Code"
                    className="rounded-xl border-4 border-gray-800"
                  />
                </div>
                <div className="bg-gray-800 rounded-xl p-4 mb-3">
                  <p className="text-green-400 font-mono text-xs break-all leading-relaxed">{cryptoWallet.trc20}</p>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {copied ? '✓ Address Copied!' : 'Copy Address'}
                </button>
              </div>

              {/* Network Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
                <p className="text-orange-700 font-black text-[10px] uppercase tracking-widest mb-1">⚠️ Important</p>
                <p className="text-orange-600 text-xs font-bold">Only send USDT on the <strong>TRON (TRC-20)</strong> network. Sending on any other network will result in permanent loss of funds.</p>
              </div>

              {/* Step-by-step */}
              <div className="space-y-3 mb-5">
                {[
                  'Open your crypto wallet app (Binance, Trust Wallet, etc.)',
                  'Send USDT on the TRC-20 / TRON network to the address above',
                  'Copy the Transaction ID (TxID) from your wallet',
                  'Paste the TxID below and upload a screenshot, then submit'
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-5 h-5 border border-gray-200 text-gray-400 rounded-md flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-[12px] font-bold text-gray-500 leading-normal">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Submit Proof */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#F0FDF4] text-[#1F8B4C] rounded-full flex items-center justify-center font-black text-sm">2</div>
                <h2 className="text-lg font-black text-gray-800 tracking-tight">Submit Proof</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Transaction Hash (TxID)</label>
                  <input
                    type="text"
                    placeholder="Enter TxID from your wallet..."
                    value={txHash}
                    onChange={e => setTxHash(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs outline-none focus:border-[#1F8B4C] transition-all"
                  />
                  <p className="text-[10px] text-gray-400 font-bold mt-1">Found in your wallet's transaction history after sending</p>
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Transaction Screenshot</label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${cryptoProofFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setCryptoProofFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      style={{ position: 'relative' }}
                    />
                    {cryptoProofFile ? (
                      <div>
                        <p className="text-green-600 font-black text-xs">✓ {cryptoProofFile.name}</p>
                        <img src={URL.createObjectURL(cryptoProofFile)} alt="preview" className="mt-3 h-32 object-cover rounded-lg mx-auto" />
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl mb-2">📷</p>
                        <p className="text-gray-400 font-bold text-xs">Click to upload screenshot</p>
                        <p className="text-gray-300 text-[10px] mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Submission Summary</p>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500">Amount</span>
                    <span className="text-gray-900">{parseFloat(amount || 0).toLocaleString()} {user.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold mt-1">
                    <span className="text-gray-500">Network</span>
                    <span className="text-gray-900">USDT TRC-20 (TRON)</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold mt-1">
                    <span className="text-gray-500">Processing Time</span>
                    <span className="text-gray-900">1 – 3 hours</span>
                  </div>
                </div>

                <button
                  onClick={handleCryptoSubmit}
                  disabled={loading || uploading}
                  className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-[2px] shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {uploading ? 'Submitting...' : '₮ Submit Crypto Deposit'}
                </button>

                <p className="text-[10px] text-gray-400 font-bold text-center">
                  After submission, admin will verify your TxID on the TRON blockchain and credit your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── MOBILE MONEY TAB ───────────────────────────────────────────────── */}
        {paymentTab === 'mobile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-[#F0FDF4] text-[#1F8B4C] rounded-full flex items-center justify-center font-black text-sm">1</div>
                   <h2 className="text-lg font-black text-gray-800 tracking-tight">Deposit Amount</h2>
                 </div>
                 <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-right border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Currency</p>
                    <p className="text-xs font-black text-gray-800">{user.currency}</p>
                 </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Quick Select</label>
                  <div className="grid grid-cols-4 gap-2">
                     {[5000, 10000, 20000, 50000].map(p => (
                       <button key={p} onClick={() => setAmount(p.toString())} className={`py-2 rounded-lg text-[11px] font-black transition-all border ${amount == p ? 'bg-[#1F8B4C] text-white border-[#1F8B4C]' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-green-200'}`}>
                         + {p.toLocaleString()}
                       </button>
                     ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Custom Amount</label>
                  <div className="relative">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-black text-gray-900 focus:bg-white focus:border-[#1F8B4C] outline-none transition-all" placeholder="0" />
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
                      Transfer Verification (Required)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <input type="text" placeholder="Sender Phone" value={payerNumber} onChange={e => setPayerNumber(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-xs outline-none focus:border-[#1F8B4C] transition-all" />
                      <input type="text" placeholder="Sender Name" value={payerNames} onChange={e => setPayerNames(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-xs outline-none focus:border-[#1F8B4C] transition-all" />
                    </div>
                    <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-lg font-bold text-xs cursor-pointer mb-2" />
                    <p className="text-[10px] text-gray-400 font-bold mb-6">ⓘ Upload a screenshot of your payment transfer</p>
                </div>
                <div className="pt-2 space-y-3">
                   <button onClick={handleManualSubmit} disabled={loading || uploading} className="w-full py-3.5 bg-white border-2 border-[#1F8B4C] text-[#1F8B4C] hover:bg-green-50 rounded-xl font-black text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                     {uploading ? 'UPLOADING PROOF...' : '🏦 SUBMIT STANDARD PAY'}
                   </button>
                </div>

              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-8 h-8 bg-[#F0FDF4] text-[#1F8B4C] rounded-full flex items-center justify-center font-black text-sm">2</div>
                   <h2 className="text-lg font-black text-gray-800 tracking-tight">{user.country} Payment Method</h2>
                </div>
                {selectedProcedure && (
                  <div className="space-y-4">
                     <div className="border-[#1F8B4C] border-[3px] bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-10 bg-gradient-to-br from-[#1F8B4C] to-green-700 rounded-lg flex items-center justify-center text-xl text-white">💳</div>
                           <p className="font-extrabold text-[#1F8B4C] text-sm uppercase tracking-tight">{selectedProcedure.name || selectedProcedure.method || 'Mobile Money'}</p>
                        </div>
                        <div className="w-6 h-6 bg-[#1F8B4C] shadow-lg shadow-green-100 text-white rounded-full flex items-center justify-center text-[10px]">✓</div>
                     </div>
                     <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                           <span className="text-sm">📋</span>
                           <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-[3px]">Payment Instructions</h3>
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
        )}

        {/* ─── AUTO PAY TAB ───────────────────────────────────────────────────── */}
        {paymentTab === 'auto' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center font-black text-sm">🚀</div>
                <h2 className="text-lg font-black text-gray-800 tracking-tight">Automatic Payment</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Deposit Amount</label>
                  <div className="relative">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-black text-gray-900 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="0" />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 uppercase text-sm">{user.currency}</div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <p className="text-blue-700 font-black text-xs mb-1">⚡ Instant Credit</p>
                  <p className="text-blue-600 text-xs font-bold">Your balance is credited automatically after payment is confirmed via Flutterwave.</p>
                </div>
                <button onClick={handleAutomaticPayment} disabled={loading} className="w-full py-3.5 bg-[#4B83F1] hover:bg-[#3466CD] text-white rounded-xl font-black text-xs uppercase tracking-[2px] shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                  {loading ? 'Processing...' : '🚀 Pay Now via Flutterwave'}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col gap-4 justify-center">
              {[
                { icon: '⚡', title: 'Instant Processing', desc: 'Funds credited within seconds of payment' },
                { icon: '🔒', title: 'Secure Payment', desc: 'Powered by Flutterwave — bank-grade security' },
                { icon: '📱', title: 'Mobile Money', desc: 'Supports MTN, Airtel, Mpesa and more' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">{f.icon}</div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{f.title}</p>
                    <p className="text-xs text-gray-500 font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Info */}
        <div className="mt-8 bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-6 text-center shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[3px] bg-[#3B82F6]"></div>
           <div className="w-8 h-8 bg-[#3B82F6] text-white rounded-lg mx-auto mb-2 flex items-center justify-center text-sm shadow-blue-100">ℹ</div>
           <h3 className="text-base font-black text-slate-800 mb-1 tracking-tight">Processing Time</h3>
           <p className="text-[12px] font-bold text-slate-500 leading-relaxed max-w-2xl mx-auto">
             Mobile money: <span className="text-slate-800 underline underline-offset-4 decoration-[#3B82F6] decoration-[2px]">1-24 hours</span> after proof upload.
             Crypto: <span className="text-slate-800 underline underline-offset-4 decoration-orange-400 decoration-[2px]">1-3 hours</span> after TxID verification.
             Auto pay: <span className="text-slate-800">instant</span>.
           </p>
        </div>
      </div>
    </div>
  );
}

export default Deposit;