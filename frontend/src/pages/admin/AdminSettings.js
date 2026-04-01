import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminSettings() {
  const [options, setOptions] = useState([]);
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '', whatsapp_verification: '' });
  const [rewards, setRewards] = useState({ 
    Burundi: '0', Rwanda: '0', Uganda: '0', Kenya: '0', referral: '2500'
  });
  const [supportEmail, setSupportEmail] = useState('support@tracova.com');
  const [referralSettings, setReferralSettings] = useState({
    reward_percentage: '10',
    high_threshold: '500000',
    high_bonus: '5'
  });
  const [autoDepositEnabled, setAutoDepositEnabled] = useState(true);
  const [cryptoWallets, setCryptoWallets] = useState({ trc20: '', enabled: false });
  const [loading, setLoading] = useState(true);
  const [newOpt, setNewOpt] = useState({ name: '', type: '', account: '', active: true, logo: '' });
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Global Settings | Admin"; }, []);

  useEffect(() => {
    async function load() {
      try {
        const [optRes, socRes, setRes, cryptoRes] = await Promise.all([
          api.get('/settings/payment-options'),
          api.get('/settings/social-links'),
          api.get('/settings'),
          api.get('/settings/crypto-wallets')
        ]);
        setOptions(optRes.data || []);
        setSocialLinks(socRes.data || { whatsapp: '', telegram: '', whatsapp_verification: '' });
        if (cryptoRes.data) setCryptoWallets({ trc20: cryptoRes.data.trc20 || '', enabled: cryptoRes.data.enabled || false });
        if (setRes.data) {
          const s = setRes.data;
          if (s.supportEmail) setSupportEmail(s.supportEmail);
          if (s.auto_deposit_enabled !== undefined) {
             setAutoDepositEnabled(s.auto_deposit_enabled === 'true' || s.auto_deposit_enabled === true);
          }
          setReferralSettings({
            reward_percentage: s.referral_reward_percentage || '10',
            high_threshold: s.referral_high_capital_threshold || '500000',
            high_bonus: s.referral_high_capital_bonus || '5'
          });
          setRewards({
            Burundi: s.signup_bonus_Burundi || '0',
            Rwanda: s.signup_bonus_Rwanda || '0',
            Uganda: s.signup_bonus_Uganda || '0',
            Kenya: s.signup_bonus_Kenya || '0',
            referral: s.referral_bonus || '2500'
          });
        }
      } catch (err) {
        console.error(err);
        navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);


  const saveReferralSettings = async () => {
    try {
      setSavingSocial(true);
      await Promise.all([
        api.post('/settings', { key: 'referral_reward_percentage', value: referralSettings.reward_percentage }),
        api.post('/settings', { key: 'referral_high_capital_threshold', value: referralSettings.high_threshold }),
        api.post('/settings', { key: 'referral_high_capital_bonus', value: referralSettings.high_bonus })
      ]);
      alert('Referral reward configuration success!');
    } catch (err) {
      alert('Referral update failed');
    } finally {
      setSavingSocial(false);
    }
  };

  const saveCryptoWallets = async () => {
    try {
      setSavingSocial(true);
      await api.post('/settings/crypto-wallets', cryptoWallets);
      alert('Crypto wallet settings saved!');
    } catch (err) {
      alert('Failed to save crypto wallet');
    } finally {
      setSavingSocial(false);
    }
  };

  const saveRewards = async () => {

    try {
      setSavingSocial(true);
      await Promise.all([
        api.post('/settings', { key: 'signup_bonus_Burundi', value: rewards.Burundi }),
        api.post('/settings', { key: 'signup_bonus_Rwanda', value: rewards.Rwanda }),
        api.post('/settings', { key: 'signup_bonus_Uganda', value: rewards.Uganda }),
        api.post('/settings', { key: 'signup_bonus_Kenya', value: rewards.Kenya }),
        api.post('/settings', { key: 'referral_bonus', value: rewards.referral })
      ]);
      alert('Signup bonuses saved successfully');
    } catch (err) {
      alert('Failed to save bonuses');
    } finally {
      setSavingSocial(false);
    }
  };

  const toggleAutoDeposit = async () => {
    try {
      setSavingSocial(true);
      const newState = !autoDepositEnabled;
      await api.post('/settings', { key: 'auto_deposit_enabled', value: newState.toString() });
      setAutoDepositEnabled(newState);
      alert(newState ? 'Auto-Payment Gateway enabled' : 'Auto-Payment Gateway disabled');
    } catch (err) {
      alert('Failed to update gateway status');
    } finally {
      setSavingSocial(false);
    }
  };

  const updateSupportEmail = async () => {
    try {
      setSavingSocial(true);
      await api.post('/settings', { key: 'supportEmail', value: supportEmail });
      alert('Support email updated');
    } catch (err) {
      alert('Failed to update email');
    } finally {
      setSavingSocial(false);
    }
  };

  const saveSocialLinks = async () => {
    try {
      setSavingSocial(true);
      await api.post('/settings/social-links', socialLinks);
      alert('Community links saved');
    } catch (err) {
      alert('Failed to save social links');
    } finally {
      setSavingSocial(false);
    }
  };

  const saveOptions = async (list) => {
    try {
      setSaving(true);
      const res = await api.post('/settings/payment-options', { options: list });
      setOptions(res.data.options || list);
      setSaving(false);
      return res.data;
    } catch (err) {
      setSaving(false);
      alert('Failed to save payment options: ' + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  const addOption = async () => {
    if (!newOpt.name) return alert('Please enter a payment method name');
    const list = [newOpt, ...options];
    try {
      await saveOptions(list);
      setNewOpt({ name: '', type: '', account: '', active: true, logo: '' });
      alert('Payment method added');
    } catch (e) {}
  };

  const toggleActive = async (idx) => {
    const list = [...options];
    list[idx].active = !list[idx].active;
    if (!list[idx].active && !window.confirm(`Deactivate ${list[idx].name}?`)) return;
    try { await saveOptions(list); } catch (e) {}
  };

  const uploadLogo = async (file, idx = null) => {
    const fd = new FormData();
    fd.append('logo', file);
    try {
       const res = await api.post('/settings/payment-options/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
       const url = res.data.url;
       if (idx === null) {
         setNewOpt({ ...newOpt, logo: url });
       } else {
         const list = [...options];
         list[idx].logo = url;
         setOptions(list);
         await saveOptions(list);
       }
       alert('Logo uploaded');
    } catch(e) {
       alert('Upload failed');
    }
  };

  const saveEdit = async (idx) => {
    const list = [...options];
    if (!list[idx].name) return alert('Name is required');
    try {
      await saveOptions(list);
      alert('Payment method updated');
    } catch (e) {}
  };

  const deleteOption = async (idx) => {
    const list = [...options];
    if (!window.confirm(`Delete payment method '${list[idx].name}'?`)) return;
    list.splice(idx, 1);
    try {
      await saveOptions(list);
      alert('Payment method deleted');
    } catch (e) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div></div>;

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
           <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Settings</h2>
              <p className="text-gray-500 font-medium">Manage payment methods, bonuses, contact links and system options.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-1 space-y-8">

              {/* Gateway Toggle */}
              <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                     <span className="text-2xl">⚡</span> Auto-Payment Gateway
                  </h3>
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                     <p className="text-[11px] font-black text-gray-900 uppercase tracking-[3px]">Flutterwave Auto-Pay</p>
                     <button onClick={toggleAutoDeposit} disabled={savingSocial} className={`w-16 h-8 rounded-full relative transition-all ${autoDepositEnabled ? 'bg-primary' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${autoDepositEnabled ? 'left-9' : 'left-1'}`}></div>
                     </button>
                  </div>
                  <p className={`mt-4 text-[10px] font-black uppercase tracking-widest text-center py-2 rounded-xl ${autoDepositEnabled ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-50'}`}>
                     {autoDepositEnabled ? 'ONLINE — Payments are automated' : 'OFFLINE — Manual approval required'}
                  </p>
              </div>

              {/* Add Payment Method */}
              <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100">
                 <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-4">
                    <span className="text-2xl text-secondary">💳</span> Add Payment Method
                 </h3>
                 <div className="space-y-6">
                    <input placeholder="Payment Method Name (e.g. MTN MoMo)" value={newOpt.name} onChange={e => setNewOpt({ ...newOpt, name: e.target.value })} className="w-full px-7 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] font-black text-gray-900 outline-none" />
                    <input placeholder="Type (e.g. Mobile Money)" value={newOpt.type} onChange={e => setNewOpt({ ...newOpt, type: e.target.value })} className="w-full px-7 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] font-black text-gray-900 outline-none" />
                    <input placeholder="Account Number / Phone" value={newOpt.account} onChange={e => setNewOpt({ ...newOpt, account: e.target.value })} className="w-full px-7 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] font-black font-mono text-sm outline-none" />
                    <button onClick={addOption} disabled={saving} className="w-full py-6 bg-gray-950 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[5px] shadow-3xl hover:bg-black transition-all">Add Payment Method</button>
                 </div>
              </div>

              {/* Crypto Wallet */}
              <div className="bg-gray-900 p-10 rounded-[4rem] shadow-2xl border border-white/5 text-white">
                  <h3 className="text-xl font-black mb-2 flex items-center gap-4">
                     <span className="text-2xl">₮</span> USDT (TRC-20) Wallet
                  </h3>
                  <p className="text-gray-500 text-xs font-bold mb-8">Users can deposit crypto to this address. You verify the transaction hash and approve manually.</p>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Enable Crypto Payments</p>
                        <p className="text-[10px] text-gray-500 font-medium">Show USDT option to users on deposit page</p>
                      </div>
                      <button onClick={() => setCryptoWallets(w => ({...w, enabled: !w.enabled}))} className={`w-14 h-7 rounded-full relative transition-all ${cryptoWallets.enabled ? 'bg-secondary' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${cryptoWallets.enabled ? 'left-8' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">TRC-20 Wallet Address</label>
                      <input
                        type="text"
                        placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={cryptoWallets.trc20}
                        onChange={e => setCryptoWallets(w => ({...w, trc20: e.target.value}))}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono tracking-wide"
                      />
                      {cryptoWallets.trc20 && (
                        <div className="flex justify-center pt-2">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(cryptoWallets.trc20)}&bgcolor=1f2937&color=ffffff&margin=10`}
                            alt="QR Code"
                            className="rounded-2xl border border-white/10"
                          />
                        </div>
                      )}
                    </div>
                    <button onClick={saveCryptoWallets} disabled={savingSocial} className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-all">Save Crypto Settings</button>
                  </div>
              </div>
              {/* Referral Dynamics */}
              <div className="bg-[#1e293b] p-10 rounded-[4rem] shadow-2xl border border-white/10 text-white">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-4 text-secondary">
                     <span className="text-2xl">👥</span> Referral Rewards
                  </h3>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Base Reward (%)</label>
                        <input 
                           type="number" 
                           value={referralSettings.reward_percentage} 
                           onChange={e => setReferralSettings({ ...referralSettings, reward_percentage: e.target.value })} 
                           className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">High Capital Threshold</label>
                        <input 
                           type="number" 
                           value={referralSettings.high_threshold} 
                           onChange={e => setReferralSettings({ ...referralSettings, high_threshold: e.target.value })} 
                           className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">High Capital Bonus (+%)</label>
                        <input 
                           type="number" 
                           value={referralSettings.high_bonus} 
                           onChange={e => setReferralSettings({ ...referralSettings, high_bonus: e.target.value })} 
                           className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono" 
                        />
                     </div>
                     <button onClick={saveReferralSettings} disabled={savingSocial} className="w-full py-5 bg-secondary text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[4px] shadow-3xl hover:bg-blue-400 transition-all mt-4">Update Referral Dynamics</button>
                  </div>
              </div>

              <div className="bg-[#0f172a] p-10 rounded-[4rem] shadow-2xl border border-white/10 text-white">

                  <h3 className="text-xl font-black mb-8 flex items-center gap-4">
                     <span className="text-2xl text-yellow-400">🎁</span> Signup Bonuses
                  </h3>
                  <div className="space-y-4">
                     {['Burundi', 'Rwanda', 'Uganda', 'Kenya'].map(country => (
                        <div key={country} className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{country} Signup Bonus</label>
                           <input 
                              type="number" 
                              value={rewards[country]} 
                              onChange={e => setRewards({ ...rewards, [country]: e.target.value })} 
                              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-primary/50 font-mono" 
                           />
                        </div>
                     ))}
                     <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Referral Bonus (All Countries)</label>
                        <input 
                           type="number" 
                           value={rewards.referral} 
                           onChange={e => setRewards({ ...rewards, referral: e.target.value })} 
                           className="w-full px-5 py-3.5 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-xs outline-none focus:border-primary/50 font-mono font-bold" 
                        />
                     </div>
                     <button onClick={saveRewards} disabled={savingSocial} className="w-full py-5 bg-primary text-gray-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[4px] shadow-3xl hover:bg-green-400 transition-all mt-4">Save Bonuses</button>
                  </div>
              </div>

              {/* Community & Support */}
               <div className="bg-primary px-8 py-10 rounded-[3.5rem] border border-white/20 shadow-3xl text-white">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">WhatsApp Group Link</label>
                        <input placeholder="https://chat.whatsapp.com/..." value={socialLinks.whatsapp} onChange={e => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-white/30 transition-all font-mono" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Telegram Group Link</label>
                        <input placeholder="https://t.me/..." value={socialLinks.telegram} onChange={e => setSocialLinks({ ...socialLinks, telegram: e.target.value })} className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-white/30 transition-all font-mono" />
                    </div>
                    <button onClick={saveSocialLinks} className="w-full py-4 bg-white text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all mt-4">Save Links</button>
                    
                    <div className="pt-8 border-t border-white/10 mt-4">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1 mb-2 block">Support Email Address</label>
                       <input placeholder="support@example.com" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white text-xs outline-none mb-3 font-mono" />
                       <button onClick={updateSupportEmail} className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 active:scale-95 transition-all">Update Email</button>
                    </div>
                </div>
              </div>
           </div>

           {/* Payment Methods List */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-8">
                 <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[6px]">Active Payment Methods</h2>
                 <span className="text-[10px] bg-secondary/10 text-secondary px-4 py-2 rounded-full font-black">{options.length} Methods</span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {options.map((opt, idx) => (
                  <div key={idx} className={`bg-white p-8 rounded-[3.5rem] shadow-sm border transition-all hover:shadow-xl group ${opt.active ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                    <div className="flex items-center justify-between gap-10">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative shrink-0">
                           {opt.logo ? <img src={opt.logo} className="w-20 h-16 object-contain rounded-2xl" alt="logo" /> : <div className="w-20 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[8px] font-black text-gray-300 tracking-widest">No Logo</div>}
                           <input type="file" onChange={e => uploadLogo(e.target.files[0], idx)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-gray-900 text-2xl uppercase tracking-tight">{opt.name}</h4>
                          <p className="text-[10px] font-black text-secondary tracking-[3px] mt-1">{opt.type}</p>
                          <p className="text-xs font-mono text-gray-400 mt-2">{opt.account}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(idx)} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100" title={opt.active ? 'Deactivate' : 'Activate'}>🔌</button>
                        <button onClick={() => deleteOption(idx)} className="p-3 bg-red-50 rounded-xl text-red-500 hover:bg-red-100" title="Delete">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                {options.length === 0 && (
                  <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-20 text-center">
                    <p className="text-gray-300 font-black uppercase tracking-[6px] text-sm">No payment methods configured</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;