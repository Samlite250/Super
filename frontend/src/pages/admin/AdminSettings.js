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
  const [flutterwaveConfig, setFlutterwaveConfig] = useState({ publicKey: '', secretKey: '', encryptionKey: '' });
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
          setFlutterwaveConfig({
            publicKey: s.flutterwave_public_key || '',
            secretKey: s.flutterwave_secret_key || '',
            encryptionKey: s.flutterwave_encryption_key || ''
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

  const saveFlutterwaveConfig = async () => {
    try {
      setSavingSocial(true);
      await Promise.all([
        api.post('/settings', { key: 'flutterwave_public_key', value: flutterwaveConfig.publicKey }),
        api.post('/settings', { key: 'flutterwave_secret_key', value: flutterwaveConfig.secretKey }),
        api.post('/settings', { key: 'flutterwave_encryption_key', value: flutterwaveConfig.encryptionKey })
      ]);
      alert('Flutterwave API credentials active!');
    } catch (err) {
      alert('Failed to save API keys');
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
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Global Settings</h2>
          <p className="text-gray-500 font-medium">Manage payment gateways, bonuses, community links and system configuration.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── COLUMN 1: Gateway & Community ── */}
          <div className="space-y-8">

            {/* Auto-Payment Gateway + Flutterwave Keys */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center text-lg border border-yellow-100">⚡</div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Auto-Payment Gateway</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Flutterwave Integration</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-3">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-[2px]">Flutterwave Auto-Pay</p>
                <button onClick={toggleAutoDeposit} disabled={savingSocial} className={`w-14 h-7 rounded-full relative transition-all ${autoDepositEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${autoDepositEnabled ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest text-center py-2 rounded-xl mb-6 ${autoDepositEnabled ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-50'}`}>
                {autoDepositEnabled ? '● ONLINE — Payments automated' : '● OFFLINE — Manual approval required'}
              </p>
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">API Credentials</p>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Public Key</label>
                  <input type="text" value={flutterwaveConfig.publicKey} onChange={e => setFlutterwaveConfig({...flutterwaveConfig, publicKey: e.target.value})} placeholder="FLWPUBK_TEST-..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-xs outline-none focus:border-secondary font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Secret Key</label>
                  <input type="password" value={flutterwaveConfig.secretKey} onChange={e => setFlutterwaveConfig({...flutterwaveConfig, secretKey: e.target.value})} placeholder="FLWSECK_TEST-..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-xs outline-none focus:border-secondary font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Encryption Key</label>
                  <input type="password" value={flutterwaveConfig.encryptionKey} onChange={e => setFlutterwaveConfig({...flutterwaveConfig, encryptionKey: e.target.value})} placeholder="Secret Hash..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-xs outline-none focus:border-secondary font-mono" />
                </div>
                <button onClick={saveFlutterwaveConfig} disabled={savingSocial} className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:bg-black transition-all">Connect API</button>
              </div>
            </div>

            {/* Community & Support */}
            <div className="bg-primary p-8 rounded-[3rem] shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-lg">💬</div>
                <div>
                  <h3 className="text-base font-black">Community & Support</h3>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Links & Contact</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1">WhatsApp Group</label>
                  <input placeholder="https://chat.whatsapp.com/..." value={socialLinks.whatsapp} onChange={e => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-white/30 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1">Telegram Group</label>
                  <input placeholder="https://t.me/..." value={socialLinks.telegram} onChange={e => setSocialLinks({ ...socialLinks, telegram: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-white/30 font-mono" />
                </div>
                <button onClick={saveSocialLinks} className="w-full py-3.5 bg-white text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">Save Links</button>
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1 block">Support Email</label>
                  <input placeholder="support@example.com" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white text-xs outline-none font-mono" />
                  <button onClick={updateSupportEmail} className="w-full py-3.5 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-all">Update Email</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── COLUMN 2: Payment Methods ── */}
          <div className="space-y-8">
            {/* Add Payment Method */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-lg border border-blue-100">💳</div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Add Payment Method</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manual Gateway Setup</p>
                </div>
              </div>
              <div className="space-y-4">
                <input placeholder="Payment Method Name (e.g. MTN MoMo)" value={newOpt.name} onChange={e => setNewOpt({ ...newOpt, name: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none text-sm" />
                <input placeholder="Type (e.g. Mobile Money)" value={newOpt.type} onChange={e => setNewOpt({ ...newOpt, type: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none text-sm" />
                <input placeholder="Account Number / Phone" value={newOpt.account} onChange={e => setNewOpt({ ...newOpt, account: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-sm outline-none" />
                <button onClick={addOption} disabled={saving} className="w-full py-4 bg-gray-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-[4px] hover:bg-black transition-all shadow-xl">Add Payment Method</button>
              </div>
            </div>

            {/* Active Methods List */}
            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[5px]">Active Methods</p>
                <span className="text-[10px] bg-secondary/10 text-secondary px-3 py-1.5 rounded-full font-black">{options.length}</span>
              </div>
              <div className="p-5 space-y-3 max-h-[520px] overflow-y-auto">
                {options.map((opt, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all hover:shadow-md ${opt.active ? 'border-gray-100 bg-gray-50/50' : 'border-red-100 opacity-60 bg-red-50/20'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          {opt.logo ? <img src={opt.logo} className="w-12 h-10 object-contain rounded-xl" alt="logo" /> : <div className="w-12 h-10 bg-white rounded-xl flex items-center justify-center text-[7px] font-black text-gray-300 border border-gray-100">Logo</div>}
                          <input type="file" onChange={e => uploadLogo(e.target.files[0], idx)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-gray-900 text-sm uppercase truncate">{opt.name}</h4>
                          <p className="text-[9px] font-black text-secondary tracking-[2px]">{opt.type}</p>
                          <p className="text-[9px] font-mono text-gray-400 truncate">{opt.account}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => toggleActive(idx)} className="p-2 bg-white rounded-xl text-gray-400 hover:bg-gray-100 border border-gray-100 text-xs">🔌</button>
                        <button onClick={() => deleteOption(idx)} className="p-2 bg-red-50 rounded-xl text-red-400 hover:bg-red-100 border border-red-100 text-xs">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                {options.length === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center">
                    <p className="text-gray-300 font-black uppercase tracking-[4px] text-xs">No payment methods yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── COLUMN 3: Crypto, Referral, Bonuses ── */}
          <div className="space-y-8">

            {/* Crypto Wallet */}
            <div className="bg-gray-900 p-8 rounded-[3rem] shadow-xl border border-white/5 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center text-lg border border-secondary/10">₮</div>
                <div>
                  <h3 className="text-base font-black">USDT (TRC-20)</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Crypto Wallet</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Enable Crypto</p>
                    <p className="text-[9px] text-gray-500 font-medium mt-0.5">Show USDT on deposit page</p>
                  </div>
                  <button onClick={() => setCryptoWallets(w => ({...w, enabled: !w.enabled}))} className={`w-12 h-6 rounded-full relative transition-all ${cryptoWallets.enabled ? 'bg-secondary' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${cryptoWallets.enabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">TRC-20 Wallet Address</label>
                  <input type="text" placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={cryptoWallets.trc20} onChange={e => setCryptoWallets(w => ({...w, trc20: e.target.value}))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono" />
                  {cryptoWallets.trc20 && (
                    <div className="flex justify-center pt-2">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(cryptoWallets.trc20)}&bgcolor=111827&color=ffffff&margin=10`} alt="QR Code" className="rounded-xl border border-white/10" />
                    </div>
                  )}
                </div>
                <button onClick={saveCryptoWallets} disabled={savingSocial} className="w-full py-3.5 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-all">Save Crypto Settings</button>
              </div>
            </div>

            {/* Referral Dynamics */}
            <div className="bg-[#1e293b] p-8 rounded-[3rem] shadow-xl border border-white/10 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center text-lg border border-secondary/10">👥</div>
                <div>
                  <h3 className="text-base font-black text-secondary">Referral Rewards</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Commission Config</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1">Base Reward (%)</label>
                  <input type="number" value={referralSettings.reward_percentage} onChange={e => setReferralSettings({ ...referralSettings, reward_percentage: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1">High Capital Threshold</label>
                  <input type="number" value={referralSettings.high_threshold} onChange={e => setReferralSettings({ ...referralSettings, high_threshold: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1">High Capital Bonus (+%)</label>
                  <input type="number" value={referralSettings.high_bonus} onChange={e => setReferralSettings({ ...referralSettings, high_bonus: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-secondary/50 font-mono" />
                </div>
                <button onClick={saveReferralSettings} disabled={savingSocial} className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:bg-blue-400 transition-all">Update Referral Dynamics</button>
              </div>
            </div>

            {/* Signup Bonuses */}
            <div className="bg-[#0f172a] p-8 rounded-[3rem] shadow-xl border border-white/10 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-lg border border-yellow-500/10">🎁</div>
                <div>
                  <h3 className="text-base font-black text-yellow-400">Signup Bonuses</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Per Country Config</p>
                </div>
              </div>
              <div className="space-y-3">
                {['Burundi', 'Rwanda', 'Uganda', 'Kenya'].map(country => (
                  <div key={country} className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-60 ml-1">{country}</label>
                    <input type="number" value={rewards[country]} onChange={e => setRewards({ ...rewards, [country]: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-primary/50 font-mono" />
                  </div>
                ))}
                <div className="pt-3 border-t border-white/10 space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Referral Bonus (Global)</label>
                  <input type="number" value={rewards.referral} onChange={e => setRewards({ ...rewards, referral: e.target.value })} className="w-full px-4 py-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-xs outline-none focus:border-primary/50 font-mono font-bold" />
                </div>
                <button onClick={saveRewards} disabled={savingSocial} className="w-full py-4 bg-primary text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:bg-green-400 transition-all">Save Bonuses</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;