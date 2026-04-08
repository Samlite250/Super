import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminSettings() {
  const [options, setOptions] = useState([]);
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '' });
  const [rewards, setRewards] = useState({ Burundi: '0', Rwanda: '0', Uganda: '0', Kenya: '0', referral: '2500' });
  const [supportEmail, setSupportEmail] = useState('support@tracova.com');
  const [referralSettings, setReferralSettings] = useState({ reward_percentage: '10', high_threshold: '500000', high_bonus: '5' });
  const [flutterwaveConfig, setFlutterwaveConfig] = useState({ publicKey: '', secretKey: '', encryptionKey: '' });
  const [autoDepositEnabled, setAutoDepositEnabled] = useState(true);
  const [cryptoWallets, setCryptoWallets] = useState({ trc20: '', enabled: false });
  const [loading, setLoading] = useState(true);
  const [newOpt, setNewOpt] = useState({ name: '', type: '', account: '', active: true, logo: '' });
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [activeTab, setActiveTab] = useState('gateway');
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
        setSocialLinks(socRes.data || { whatsapp: '', telegram: '' });
        if (cryptoRes.data) setCryptoWallets({ trc20: cryptoRes.data.trc20 || '', enabled: cryptoRes.data.enabled || false });
        if (setRes.data) {
          const s = setRes.data;
          if (s.supportEmail) setSupportEmail(s.supportEmail);
          if (s.auto_deposit_enabled !== undefined) setAutoDepositEnabled(s.auto_deposit_enabled === 'true' || s.auto_deposit_enabled === true);
          setReferralSettings({ reward_percentage: s.referral_reward_percentage || '10', high_threshold: s.referral_high_capital_threshold || '500000', high_bonus: s.referral_high_capital_bonus || '5' });
          setFlutterwaveConfig({ publicKey: s.flutterwave_public_key || '', secretKey: s.flutterwave_secret_key || '', encryptionKey: s.flutterwave_encryption_key || '' });
          setRewards({ Burundi: s.signup_bonus_Burundi || '0', Rwanda: s.signup_bonus_Rwanda || '0', Uganda: s.signup_bonus_Uganda || '0', Kenya: s.signup_bonus_Kenya || '0', referral: s.referral_bonus || '2500' });
        }
      } catch (err) { navigate('/auth/admin-secure-v2'); }
      finally { setLoading(false); }
    }
    load();
  }, [navigate]);

  const saveFlutterwaveConfig = async () => {
    try { setSavingSocial(true); await Promise.all([api.post('/settings', { key: 'flutterwave_public_key', value: flutterwaveConfig.publicKey }), api.post('/settings', { key: 'flutterwave_secret_key', value: flutterwaveConfig.secretKey }), api.post('/settings', { key: 'flutterwave_encryption_key', value: flutterwaveConfig.encryptionKey })]); alert('Flutterwave API credentials saved!'); }
    catch { alert('Failed to save API keys'); } finally { setSavingSocial(false); }
  };
  const toggleAutoDeposit = async () => {
    try { setSavingSocial(true); const v = !autoDepositEnabled; await api.post('/settings', { key: 'auto_deposit_enabled', value: v.toString() }); setAutoDepositEnabled(v); alert(v ? 'Auto-Pay enabled' : 'Auto-Pay disabled'); }
    catch { alert('Failed to update'); } finally { setSavingSocial(false); }
  };
  const saveCryptoWallets = async () => {
    try { setSavingSocial(true); await api.post('/settings/crypto-wallets', cryptoWallets); alert('Crypto settings saved!'); }
    catch { alert('Failed'); } finally { setSavingSocial(false); }
  };
  const saveReferralSettings = async () => {
    try { setSavingSocial(true); await Promise.all([api.post('/settings', { key: 'referral_reward_percentage', value: referralSettings.reward_percentage }), api.post('/settings', { key: 'referral_high_capital_threshold', value: referralSettings.high_threshold }), api.post('/settings', { key: 'referral_high_capital_bonus', value: referralSettings.high_bonus })]); alert('Referral config updated!'); }
    catch { alert('Failed'); } finally { setSavingSocial(false); }
  };
  const saveRewards = async () => {
    try { setSavingSocial(true); await Promise.all([api.post('/settings', { key: 'signup_bonus_Burundi', value: rewards.Burundi }), api.post('/settings', { key: 'signup_bonus_Rwanda', value: rewards.Rwanda }), api.post('/settings', { key: 'signup_bonus_Uganda', value: rewards.Uganda }), api.post('/settings', { key: 'signup_bonus_Kenya', value: rewards.Kenya }), api.post('/settings', { key: 'referral_bonus', value: rewards.referral })]); alert('Bonuses saved!'); }
    catch { alert('Failed'); } finally { setSavingSocial(false); }
  };
  const saveSocialLinks = async () => {
    try { setSavingSocial(true); await api.post('/settings/social-links', socialLinks); alert('Links saved!'); }
    catch { alert('Failed'); } finally { setSavingSocial(false); }
  };
  const updateSupportEmail = async () => {
    try { setSavingSocial(true); await api.post('/settings', { key: 'supportEmail', value: supportEmail }); alert('Email updated!'); }
    catch { alert('Failed'); } finally { setSavingSocial(false); }
  };
  const saveOptions = async (list) => {
    try { setSaving(true); const res = await api.post('/settings/payment-options', { options: list }); setOptions(res.data.options || list); setSaving(false); return res.data; }
    catch (err) { setSaving(false); alert('Failed: ' + (err.response?.data?.error || err.message)); throw err; }
  };
  const addOption = async () => {
    if (!newOpt.name) return alert('Enter a payment method name');
    try { await saveOptions([newOpt, ...options]); setNewOpt({ name: '', type: '', account: '', active: true, logo: '' }); alert('Payment method added'); } catch (e) {}
  };
  const toggleActive = async (idx) => { const list = [...options]; list[idx].active = !list[idx].active; if (!list[idx].active && !window.confirm(`Deactivate ${list[idx].name}?`)) return; try { await saveOptions(list); } catch (e) {} };
  const uploadLogo = async (file, idx = null) => {
    const fd = new FormData(); fd.append('logo', file);
    try { const res = await api.post('/settings/payment-options/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); const url = res.data.url; if (idx === null) { setNewOpt({ ...newOpt, logo: url }); } else { const list = [...options]; list[idx].logo = url; setOptions(list); await saveOptions(list); } alert('Logo uploaded'); } catch { alert('Upload failed'); }
  };
  const deleteOption = async (idx) => {
    const list = [...options]; if (!window.confirm(`Delete '${list[idx].name}'?`)) return; list.splice(idx, 1);
    try { await saveOptions(list); alert('Deleted'); } catch (e) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div></div>;

  const tabs = [
    { id: 'gateway',  label: 'Payment Gateway',   icon: '⚡' },
    { id: 'methods',  label: 'Payment Methods',    icon: '💳' },
    { id: 'commissions', label: 'Commissions',     icon: '👥' },
    { id: 'system',   label: 'System',             icon: '⚙️' },
  ];

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">

        {/* ── Page Header ── */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-1">Global Settings</h2>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">Configure your platform's payment gateways, commissions, and system preferences.</p>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex items-center gap-2 mb-8 sm:mb-10 bg-white p-1.5 sm:p-2 rounded-2xl sm:rounded-[1.5rem] border border-gray-100 shadow-sm w-full sm:w-fit overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-[1.5px] sm:tracking-[2.5px] whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm sm:text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════
            TAB: PAYMENT GATEWAY
        ════════════════════════════════════════════ */}
        {activeTab === 'gateway' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

              {/* Auto-Pay Toggle */}
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl p-6 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Flutterwave Auto-Pay</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Toggle automated payment processing on or off.</p>
                  </div>
                  <button onClick={toggleAutoDeposit} disabled={savingSocial} className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${autoDepositEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${autoDepositEnabled ? 'left-9' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className={`flex items-center gap-3 p-5 rounded-2xl ${autoDepositEnabled ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${autoDepositEnabled ? 'bg-primary' : 'bg-red-500'}`}></div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-[3px] ${autoDepositEnabled ? 'text-primary' : 'text-red-600'}`}>
                      {autoDepositEnabled ? 'ONLINE — Payments are fully automated' : 'OFFLINE — Manual admin approval required'}
                    </p>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Provider</p>
                    <p className="font-black text-gray-900 text-sm">Flutterwave</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    <p className={`font-black text-sm ${autoDepositEnabled ? 'text-primary' : 'text-red-500'}`}>{autoDepositEnabled ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              {/* Flutterwave API Keys */}
              <div className="bg-gray-900 rounded-[2.5rem] border border-white/5 shadow-xl p-10 text-white">
                <h3 className="text-2xl font-black tracking-tight mb-2">API Credentials</h3>
                <p className="text-sm text-gray-400 font-medium mb-8">Connect your Flutterwave account using your dashboard API keys.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Public Key</label>
                    <input
                      type="text"
                      value={flutterwaveConfig.publicKey}
                      onChange={e => setFlutterwaveConfig({ ...flutterwaveConfig, publicKey: e.target.value })}
                      placeholder="FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx-X"
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-secondary/60 font-mono transition-all placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Secret Key</label>
                    <input
                      type="password"
                      value={flutterwaveConfig.secretKey}
                      onChange={e => setFlutterwaveConfig({ ...flutterwaveConfig, secretKey: e.target.value })}
                      placeholder="FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx-X"
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-secondary/60 font-mono transition-all placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Encryption Key / Webhook Hash</label>
                    <input
                      type="password"
                      value={flutterwaveConfig.encryptionKey}
                      onChange={e => setFlutterwaveConfig({ ...flutterwaveConfig, encryptionKey: e.target.value })}
                      placeholder="Your secret hash..."
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-secondary/60 font-mono transition-all placeholder-gray-600"
                    />
                  </div>
                  <button
                    onClick={saveFlutterwaveConfig}
                    disabled={savingSocial}
                    className="w-full py-5 bg-secondary text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {savingSocial ? 'Saving...' : '🔗 Connect Flutterwave API'}
                  </button>
                </div>
              </div>

              {/* USDT Crypto Wallet — full width */}
              <div className="lg:col-span-2 bg-[#0f172a] rounded-[2.5rem] border border-white/5 shadow-xl p-10 text-white">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight mb-1">USDT (TRC-20) Crypto Wallet</h3>
                    <p className="text-sm text-gray-400 font-medium">Users deposit crypto to this address. You verify the transaction hash and approve manually.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[2px]">Enable Crypto Deposits</p>
                    <button onClick={() => setCryptoWallets(w => ({ ...w, enabled: !w.enabled }))} className={`w-14 h-7 rounded-full relative transition-all ${cryptoWallets.enabled ? 'bg-secondary' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${cryptoWallets.enabled ? 'left-8' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400">TRC-20 Wallet Address</label>
                    <input
                      type="text"
                      placeholder="TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={cryptoWallets.trc20}
                      onChange={e => setCryptoWallets(w => ({ ...w, trc20: e.target.value }))}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-secondary/60 font-mono tracking-wide placeholder-gray-600 transition-all"
                    />
                    <button onClick={saveCryptoWallets} disabled={savingSocial} className="px-8 py-4 bg-secondary text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] hover:bg-blue-400 transition-all shadow-lg disabled:opacity-50">
                      {savingSocial ? 'Saving...' : 'Save Crypto Settings'}
                    </button>
                  </div>
                  {cryptoWallets.trc20 && (
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-[9px] font-black uppercase tracking-[4px] text-gray-500">Scan to Deposit</p>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(cryptoWallets.trc20)}&bgcolor=0f172a&color=ffffff&margin=12`} alt="QR Code" className="rounded-2xl border border-white/10 shadow-xl" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: PAYMENT METHODS
        ════════════════════════════════════════════ */}
        {activeTab === 'methods' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

              {/* Add Form */}
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl p-6 sm:p-10">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">Add New Method</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-8 font-medium">Configure a manual payment option for a specific country.</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Method Name</label>
                    <input placeholder="e.g. MTN MoMo, Lumicash..." value={newOpt.name} onChange={e => setNewOpt({ ...newOpt, name: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:border-secondary text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Type</label>
                    <input placeholder="e.g. Mobile Money, Bank Transfer..." value={newOpt.type} onChange={e => setNewOpt({ ...newOpt, type: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:border-secondary text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Account / Phone Number</label>
                    <input placeholder="e.g. +257 61 000 000" value={newOpt.account} onChange={e => setNewOpt({ ...newOpt, account: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-sm outline-none focus:border-secondary transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Logo Image</label>
                    <div className="flex items-center gap-4">
                      {newOpt.logo ? <img src={newOpt.logo} className="w-14 h-12 object-contain rounded-xl border border-gray-200" alt="logo" /> : <div className="w-14 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-[8px] text-gray-400 font-black">NO IMG</div>}
                      <label className="flex-1 cursor-pointer">
                        <input type="file" className="hidden" onChange={e => uploadLogo(e.target.files[0])} />
                        <div className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-center text-[10px] font-black text-gray-400 uppercase tracking-[2px] hover:border-secondary hover:text-secondary transition-all">Upload Logo</div>
                      </label>
                    </div>
                  </div>
                  <button onClick={addOption} disabled={saving} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50">
                    {saving ? 'Saving...' : '+ Add Payment Method'}
                  </button>
                </div>
              </div>

              {/* Methods List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">Active Payment Methods</h3>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/10 text-secondary text-[8px] sm:text-[10px] font-black rounded-full tracking-widest">{options.length} configured</span>
                </div>
                {options.length === 0 ? (
                  <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-gray-100 p-12 sm:p-24 text-center shadow-sm">
                    <p className="text-4xl sm:text-5xl mb-4">💳</p>
                    <p className="text-gray-300 font-black uppercase tracking-[4px] sm:tracking-[6px] text-xs sm:text-sm">No payment methods configured</p>
                    <p className="text-gray-400 text-[10px] sm:text-sm mt-2">Add your first method using the form on the left.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {options.map((opt, idx) => (
                      <div key={idx} className={`bg-white rounded-2xl sm:rounded-[2rem] border shadow-sm transition-all hover:shadow-lg group ${opt.active ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                        <div className="p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="relative shrink-0">
                              {opt.logo ? <img src={opt.logo} className="w-16 h-14 object-contain rounded-2xl border border-gray-100" alt="logo" /> : <div className="w-16 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[8px] font-black text-gray-300">No Logo</div>}
                              <input type="file" onChange={e => uploadLogo(e.target.files[0], idx)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-xl uppercase tracking-tight">{opt.name}</p>
                              <p className="text-[10px] font-black text-secondary tracking-[2px] mt-1">{opt.type}</p>
                              <p className="text-xs font-mono text-gray-400 mt-1">{opt.account}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-4 py-2 rounded-full text-[9px] font-black tracking-[3px] border ${opt.active ? 'bg-green-50 text-primary border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              {opt.active ? 'ACTIVE' : 'DISABLED'}
                            </span>
                            <button onClick={() => toggleActive(idx)} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-all" title={opt.active ? 'Disable' : 'Enable'}>🔌</button>
                            <button onClick={() => deleteOption(idx)} className="p-3 bg-red-50 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Delete">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: COMMISSIONS
        ════════════════════════════════════════════ */}
        {activeTab === 'commissions' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

              {/* Referral Commission Logic */}
              <div className="bg-gray-900 rounded-[2rem] border border-white/5 shadow-xl p-6 sm:p-8 text-white">
                <h3 className="text-lg font-black tracking-tight mb-1">Referral Commissions</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-6 font-medium">Set how much a referrer earns each time someone they invited makes an investment.</p>
                <div className="space-y-5">

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Base reward percentage
                    </label>
                    <p className="text-[10px] text-gray-600 mb-2">The standard commission rate paid to the referrer on every investment by their downline.</p>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <input type="number" value={referralSettings.reward_percentage} onChange={e => setReferralSettings({ ...referralSettings, reward_percentage: e.target.value })} className="flex-1 bg-transparent text-white text-sm outline-none font-mono" />
                      <span className="text-gray-500 text-sm font-black">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      High-value investment threshold
                    </label>
                    <p className="text-[10px] text-gray-600 mb-2">If a referred user's investment exceeds this amount, the bonus commission rate applies instead.</p>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <input type="number" value={referralSettings.high_threshold} onChange={e => setReferralSettings({ ...referralSettings, high_threshold: e.target.value })} className="flex-1 bg-transparent text-white text-sm outline-none font-mono" />
                      <span className="text-gray-500 text-xs font-black">FBu</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Bonus commission for high-value investors
                    </label>
                    <p className="text-[10px] text-gray-600 mb-2">An additional percentage added on top of the base rate when the threshold above is crossed.</p>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <span className="text-gray-500 text-sm font-black">+</span>
                      <input type="number" value={referralSettings.high_bonus} onChange={e => setReferralSettings({ ...referralSettings, high_bonus: e.target.value })} className="flex-1 bg-transparent text-white text-sm outline-none font-mono" />
                      <span className="text-gray-500 text-sm font-black">%</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Summary: Referrers earn <span className="text-secondary font-bold">{referralSettings.reward_percentage}%</span> on all investments. When a referred user invests more than <span className="text-secondary font-bold">{Number(referralSettings.high_threshold).toLocaleString()} FBu</span>, an extra <span className="text-secondary font-bold">+{referralSettings.high_bonus}%</span> is added to their commission.
                    </p>
                  </div>

                  <button onClick={saveReferralSettings} disabled={savingSocial} className="w-full py-4 bg-secondary text-white rounded-xl font-black text-[11px] uppercase tracking-[3px] hover:bg-blue-400 transition-all shadow-lg disabled:opacity-50">
                    {savingSocial ? 'Saving...' : 'Save Commission Settings'}
                  </button>
                </div>
              </div>

              {/* Signup Bonuses */}
              <div className="bg-[#0f172a] rounded-[2rem] border border-white/5 shadow-xl p-6 sm:p-8 text-white">
                <h3 className="text-lg font-black tracking-tight mb-1">Welcome Bonuses</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-6 font-medium">A free credit added to a new user's account as soon as they sign up, based on their country.</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { country: 'Burundi', flag: '🇧🇮' },
                      { country: 'Rwanda',  flag: '🇷🇼' },
                      { country: 'Uganda',  flag: '🇺🇬' },
                      { country: 'Kenya',   flag: '🇰🇪' },
                    ].map(({ country, flag }) => (
                      <div key={country} className="bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{flag}</span>
                          <label className="text-xs font-bold text-gray-300">{country}</label>
                        </div>
                        <input
                          type="number"
                          value={rewards[country]}
                          onChange={e => setRewards({ ...rewards, [country]: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-primary/60 font-mono"
                          placeholder="Amount in FBu"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/10 px-4 py-4 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">🌍</span>
                      <label className="text-xs font-bold text-primary">Referral bonus (all countries)</label>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">Paid to the referrer when the new user registers using their referral link.</p>
                    <input
                      type="number"
                      value={rewards.referral}
                      onChange={e => setRewards({ ...rewards, referral: e.target.value })}
                      className="w-full px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs outline-none focus:border-primary font-mono font-bold"
                      placeholder="Amount in FBu"
                    />
                  </div>

                  <button onClick={saveRewards} disabled={savingSocial} className="w-full py-4 bg-primary text-gray-900 rounded-xl font-black text-[11px] uppercase tracking-[3px] hover:bg-green-400 transition-all shadow-lg disabled:opacity-50">
                    {savingSocial ? 'Saving...' : 'Save Bonus Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: SYSTEM
        ════════════════════════════════════════════ */}
        {activeTab === 'system' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

              {/* Community Links */}
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl p-6 sm:p-10">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">Community Links</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-8 font-medium">These links appear in the user dashboard and help section.</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">WhatsApp Group Link</label>
                    <div className="flex items-center gap-3 bg-green-50/50 border border-green-100 rounded-2xl px-5 py-4 focus-within:border-green-500 focus-within:bg-white transition-all group">
                      <span className="text-xl group-focus-within:scale-110 transition-transform">🟢</span>
                      <input placeholder="https://chat.whatsapp.com/..." value={socialLinks.whatsapp} onChange={e => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} className="flex-1 bg-transparent text-sm font-mono text-green-900 placeholder:text-green-200 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Telegram Group Link</label>
                    <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 rounded-2xl px-5 py-4 focus-within:border-blue-500 focus-within:bg-white transition-all group">
                      <span className="text-xl group-focus-within:scale-110 transition-transform">🔵</span>
                      <input placeholder="https://t.me/..." value={socialLinks.telegram} onChange={e => setSocialLinks({ ...socialLinks, telegram: e.target.value })} className="flex-1 bg-transparent text-sm font-mono text-blue-900 placeholder:text-blue-200 outline-none" />
                    </div>
                  </div>
                  <button onClick={saveSocialLinks} disabled={savingSocial} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] hover:bg-black transition-all shadow-xl disabled:opacity-50">
                    {savingSocial ? 'Saving...' : 'Save Community Links'}
                  </button>
                </div>
              </div>

              {/* Support Email */}
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl p-6 sm:p-10">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">Support Email</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-8 font-medium">This email address is shown to users when they need help...</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-2">Email Address</label>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus-within:border-secondary transition-all">
                      <span className="text-xl">📧</span>
                      <input type="email" placeholder="support@yourplatform.com" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="flex-1 bg-transparent text-sm font-mono text-gray-700 outline-none" />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">ℹ️ Where is this used?</p>
                    <p className="text-xs text-gray-500">This appears in the user dashboard's help section and in automated email notifications sent to users.</p>
                  </div>
                  <button onClick={updateSupportEmail} disabled={savingSocial} className="w-full py-5 bg-secondary text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50">
                    {savingSocial ? 'Saving...' : 'Update Support Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminSettings;