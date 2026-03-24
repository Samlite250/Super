import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, X, ExternalLink, Zap } from 'lucide-react';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [showAd, setShowAd] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [history, setHistory] = useState({ transactions: [], deposits: [], withdrawals: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '' });
  const navigate = useNavigate();


  useEffect(() => { document.title = "Dashboard | Super Cash"; }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/user/me');
        setUser(res.data);
        const invRes = await api.get('/investments/me');
        setInvestments(invRes.data);
        const refRes = await api.get('/referrals/me');
        setReferrals(refRes.data);
        const histRes = await api.get('/user/history');
        setHistory(histRes.data);
        const socRes = await api.get('/settings/social-links');
        setSocialLinks(socRes.data || { whatsapp: '', telegram: '' });

      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    setPassLoading(true);
    setPassMessage({ text: '', type: '' });
    try {
      await api.post('/user/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassMessage({ text: 'Password updated successfully!', type: 'success' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMessage({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading your workspace...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      {/* Premium Header */}
      <header className="bg-primary text-white pt-8 pb-14 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -tr-translate-x-1/2 -tr-translate-y-1/2 w-64 h-64 bg-green-500 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center relative z-10 gap-4">
          <div>
            <img src="/logo.png" className="w-10 h-10 object-contain" alt="Super Cash Logo" />
            <h1 className="text-3xl font-extrabold tracking-tight">
               Welcome, {user.username || user.email.split('@')[0]}
            </h1>
            <p className="text-green-50 font-medium opacity-90 max-w-xl">
              Manage your agricultural assets, track your daily yields, and withdraw your earnings directly to your mobile money account.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/machines')} 
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-sm"
            >
              ⭐ New Investment
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 bg-black/10 hover:bg-black/20 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
 
      {/* Live Activity Feed - Dashboard Marquee */}
      <div className="bg-white border-b border-gray-100 overflow-hidden py-2.5 shadow-sm relative z-30">
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
            {[
              { u: 'u***1', a: '45,000 FBu', t: '2m ago' },
              { u: 's***p', a: '12,000 KES', t: '5m ago' },
              { u: 'r***a', a: '150,000 RWF', t: '12m ago' },
              { u: 'k***2', a: '8,000 UGX', t: '20m ago' },
              { u: 'm***s', a: '1,200,000 FBu', t: '35m ago' },
              { u: 'a***m', a: '35,000 KES', t: '1h ago' }
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)] animate-pulse"></div>
                  <span className="text-[9px] uppercase font-black text-gray-300 tracking-[1.5px]">{p.t}</span>
                  <span className="text-[10px] font-black text-slate-700 tracking-tight uppercase leading-none">{p.u} recieved payout</span>
                  <span className="text-[11px] font-black text-green-700 bg-green-50/50 px-2 py-0.5 rounded-md border border-green-100/50">+{p.a}</span>
              </div>
            ))}
            {/* Loop Duplicates */}
            {[
              { u: 'u***1', a: '45,000 FBu', t: '2m ago' },
              { u: 's***p', a: '12,000 KES', t: '5m ago' },
            ].map((p, i) => (
              <div key={i+'loop'} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)] animate-pulse"></div>
                  <span className="text-[9px] uppercase font-black text-gray-300 tracking-[1.5px]">{p.t}</span>
                  <span className="text-[10px] font-black text-slate-700 tracking-tight uppercase leading-none">{p.u} recieved payout</span>
                  <span className="text-[11px] font-black text-green-700 bg-green-50/50 px-2 py-0.5 rounded-md border border-green-100/50">+{p.a}</span>
              </div>
            ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 mb-16 relative z-20"
      >
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Internal Ad / Promotion Banner - Professional & Closable */}
          <AnimatePresence>
            {showAd && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="lg:col-span-4 bg-gradient-to-r from-primary via-green-700 to-green-900 p-4 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden group mb-4"
              >
                <div className="absolute inset-0 bg-white/5 opacity-50"></div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-[80px]"></div>
                
                <button 
                  onClick={() => setShowAd(false)}
                  className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors z-30 bg-black/10 hover:bg-black/20 p-1.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 px-2 py-1">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                        <Tractor className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase rounded shadow-sm">
                            <Zap className="w-2.5 h-2.5 fill-yellow-900" /> EXCLUSIVE
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight flex items-center gap-2">
                           Season Rewards: <span className="text-yellow-400">+15% Return Rate</span>
                        </h3>
                        <p className="text-white/70 text-[11px] font-bold mt-0.5 uppercase tracking-wider">Invest in new agricultural assets today.</p>
                      </div>
                   </div>

                   <button 
                    onClick={() => navigate('/machines')} 
                    className="bg-white text-primary hover:bg-yellow-400 hover:text-yellow-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[2px] shadow-lg transition-all active:scale-95 flex items-center gap-2"
                   >
                     Claim Rewards <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl text-primary">💰</div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Available Balance</p>
              <p className="text-xl font-black text-gray-900">{Math.max(0, parseFloat(user.balance)).toLocaleString()} <span className="text-sm text-gray-500 font-bold">{user.currency}</span></p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl text-blue-500">📈</div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Active Assets</p>
              <p className="text-xl font-black text-gray-900">{investments.length} <span className="text-sm text-gray-500 font-bold">Plans</span></p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl text-purple-500">👥</div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Your Network</p>
              <p className="text-xl font-black text-gray-900">{referrals.length} <span className="text-sm text-gray-500 font-bold">Referrals</span></p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl text-yellow-500">🌍</div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Account Region</p>
              <p className="text-xl font-black text-gray-900">{user.country}</p>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'investments', label: '🚜 My Assets' },
              { id: 'wallet', label: '💳 Wallet & Cashier' },
              { id: 'referrals', label: '👥 My Team' },
              { id: 'history', label: '📜 Activity Log' },
              { id: 'settings', label: '⚙️ Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-primary text-primary bg-green-50/30' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8 min-h-[400px]">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fadeIn">
                <br />
                <br />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Action Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8 rounded-2xl border border-green-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-xl"></div>
                    <h3 className="font-extrabold text-xl text-green-900 mb-2 relative z-10">Quick Actions</h3>
                    <p className="text-sm text-green-700 font-medium mb-6 relative z-10">Manage your money and expand your portfolio.</p>
                    
                    <div className="space-y-3 relative z-10">
                      <button
                        onClick={() => navigate('/deposit')}
                        className="w-full bg-white hover:bg-blue-50 text-secondary border-2 border-secondary/20 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        💵 Deposit Funds
                      </button>
                      <button
                        onClick={() => navigate('/withdraw')}
                        className="w-full bg-primary hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transition-all flex items-center justify-center gap-2"
                      >
                        📱 Withdraw Earnings
                      </button>
                      <button
                        onClick={() => navigate('/machines')}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        🚜 Explore New Plans
                      </button>
                    </div>
                  </div>

                  {/* Profile Card */}
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                    <h3 className="font-extrabold text-xl text-gray-900 mb-2 relative z-10">Account Settings</h3>
                    <p className="text-sm text-gray-500 font-medium mb-6 relative z-10">Your verified identity and status.</p>
                    
                    <div className="space-y-4 text-sm flex-1 relative z-10">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Email Address</span>
                        <span className="font-bold text-gray-900">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Phone Number</span>
                        <span className="font-bold text-gray-900">{user.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Registered Country</span>
                        <span className="font-bold text-gray-900">{user.country}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Account Status</span>
                        <span className="bg-green-100 text-green-800 text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold">Verified</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Invited By</span>
                        <span className="font-bold text-gray-900">{user.upline?.fullName || 'Community'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 font-medium">Member Since</span>
                        <span className="font-bold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Join Us Section - Refined & Compact */}
                {(socialLinks.whatsapp || socialLinks.telegram) && (
                  <div className="mt-8 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-inner italic font-serif text-gray-400">@</div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 tracking-tight">Community Hub</h3>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Connect with official registry streams</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        {socialLinks.whatsapp && (
                          <a 
                            href={socialLinks.whatsapp} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2.5 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-green-100"
                          >
                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            WhatsApp
                          </a>
                        )}
                        {socialLinks.telegram && (
                          <a 
                            href={socialLinks.telegram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2.5 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-blue-100"
                          >
                            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.131.583-2.483 10.581-2.483 10.581-.131.583-.583.743-1.066.425l-3.812-2.825-1.841 1.774c-.159.159-.265.265-.477.265l.265-3.864 7.025-6.345c.318-.265-.053-.425-.477-.159l-8.683 5.464-3.759-1.166c-.848-.265-.848-.848.159-1.219l14.654-5.669c.689-.265 1.272.159.159.743z"/>
                            </svg>
                            Telegram
                          </a>
                        )}

                     </div>
                  </div>
                )}
              </div>
            )}



            {/* Investments Tab */}
            {activeTab === 'investments' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1">Your Portfolio</h2>
                    <p className="text-sm text-gray-500 font-medium">Track the performance of your fractional agricultural assets.</p>
                  </div>
                </div>

                {investments.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No active assets</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">You haven't purchased any investment plans yet. Start earning daily returns today.</p>
                    <button
                      onClick={() => navigate('/machines')}
                      className="bg-secondary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all inline-flex items-center gap-2"
                    >
                      Browse Plans <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Asset Plan</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Invested Amount</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Daily ROI</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Start Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((i, idx) => (
                          <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                                <span className="font-extrabold text-gray-800">{i.Machine?.name || 'Unknown Asset'}</span>
                              </div>
                            </td>
                            <td className="p-4 font-black text-gray-900">{parseFloat(i.amount).toLocaleString()} <span className="text-xs text-gray-500">{user.currency}</span></td>
                            <td className="p-4"><span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">{i.Machine?.dailyReturn || '0'}%</span></td>
                            <td className="p-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full w-max">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active
                              </span>
                            </td>
                            <td className="p-4 text-right text-gray-500 font-medium text-sm">{new Date(i.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Cashier</h2>
                  <p className="text-sm text-gray-500 font-medium">Manage your funds securely and withdraw instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Balance Hero Card */}
                  <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 relative overflow-hidden flex flex-col shadow-xl">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-green-500 rounded-full opacity-20 blur-2xl"></div>
                    <p className="text-gray-400 font-medium text-sm mb-1 relative z-10">Total Withdrawable Balance</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">
                      {Math.max(0, parseFloat(user.balance)).toLocaleString()} <span className="text-xl md:text-2xl text-gray-500">{user.currency}</span>
                    </h3>
                    <div className="flex gap-3 mt-auto relative z-10">
                      <button onClick={() => navigate('/deposit')} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors">
                        Deposit +
                      </button>
                      <button onClick={() => navigate('/withdraw')} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-colors">
                        Withdraw
                      </button>
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  <div className="flex flex-col gap-4">
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex-1 flex flex-col justify-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Asset Value</p>
                      <p className="text-xl font-black text-gray-800">{investments.reduce((a, b) => a + parseFloat(b.amount), 0).toLocaleString()} <span className="text-sm font-bold text-gray-500">{user.currency}</span></p>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex-1 flex flex-col justify-center border-l-4 border-l-purple-500">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Referral Rewards</p>
                      <p className="text-xl font-black text-purple-700">{parseFloat(user.referralEarnings || 0).toLocaleString()} <span className="text-sm font-bold text-purple-400">{user.currency}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Team Management</h2>
                  <p className="text-sm text-gray-500 font-medium">Monitor your downline activity and track network performance.</p>
                </div>

                <div className="bg-green-50 border border-green-100 p-6 md:p-8 rounded-2xl mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div>
                    <h4 className="font-bold text-green-900 text-lg mb-2">Share your exclusive link</h4>
                    <p className="text-sm text-green-700 font-medium max-w-md">Anyone who registers using your link automatically gets placed in your downline structure.</p>
                  </div>
                  <div className="w-full md:w-auto flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider ml-1">Your Referral Link</p>
                    <div className="flex items-center gap-2 p-1.5 bg-white border border-green-200 rounded-xl shadow-sm">
                      <input
                        type="text"
                        value={`${window.location.origin}/register?ref=${user.referralCode}`}
                        readOnly
                        className="bg-transparent text-sm font-bold text-gray-700 px-3 py-2 w-full md:w-64 outline-none"
                      />
                      <button
                        onClick={copyReferralLink}
                        className="bg-secondary hover:bg-blue-700 text-white min-w-[100px] py-2 px-4 rounded-lg font-bold text-sm transition-colors shadow-sm"
                      >
                        {copySuccess ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-4">Downline Structure ({referrals.length})</h3>
                  {referrals.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500 font-medium">
                      No team members yet. Copy your link above to get started!
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                          <tr>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Member Details</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Join Date</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Commission Earned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referrals.map((ref, idx) => (
                            <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                    {(ref.referredUser?.username || ref.referredUser?.email || 'U')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-800">{ref.referredUser?.username || 'Unknown User'}</p>
                                    <p className="text-xs text-gray-500">{ref.referredUser?.email || 'Hidden Email'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600 font-medium">{new Date(ref.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-right">
                                <span className="font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                  + {parseFloat(ref.commission || 0).toLocaleString()} <span className="text-xs">{user.currency}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Financial Ledger</h2>
                  <p className="text-sm text-gray-500 font-medium">Clear record of all your incoming and outgoing protocol movements.</p>
                </div>

                <div className="space-y-8">
                  {/* Deposits & Withdrawals Status */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Deposits Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">💰 Deposit Requests</h4>
                        <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-1 rounded">Real-time</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {history.deposits.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {history.deposits.map(d => (
                              <div key={d.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                  <p className="font-black text-gray-900 text-sm">{parseFloat(d.amount).toLocaleString()} {d.currency}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                  d.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                  d.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                  'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  {d.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-10 text-center text-gray-300 font-bold text-xs">No deposit data available.</div>
                        )}
                      </div>
                    </div>

                    {/* Withdrawals Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">🏦 Payout Requests</h4>
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded">Real-time</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {history.withdrawals.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {history.withdrawals.map(w => (
                              <div key={w.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                  <p className="font-black text-gray-900 text-sm">{parseFloat(w.amount).toLocaleString()} {user.currency}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(w.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                  w.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                  w.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                  'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  {w.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-10 text-center text-gray-300 font-bold text-xs">No withdrawal data available.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unified Transaction Ledger */}
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl">
                    <div className="bg-gray-900 text-white px-8 py-6">
                       <h3 className="font-black text-xl tracking-tight">System Ledger Entries</h3>
                       <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[3px] mt-1">Immutable Verification Stream</p>
                    </div>
                    <div>
                      {history.transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Type</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Logic</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Magnitude</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {history.transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="p-6">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                                      t.type === 'deposit' ? 'bg-green-50 text-green-600 border-green-100' :
                                      t.type === 'withdrawal' ? 'bg-red-50 text-red-600 border-red-100' :
                                      'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                      {t.type}
                                    </span>
                                  </td>
                                  <td className="p-6">
                                    <p className="text-sm font-bold text-gray-800">{t.description}</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{new Date(t.createdAt).toLocaleString()}</p>
                                  </td>
                                  <td className="p-6 text-right">
                                    <p className={`font-black text-lg tracking-tighter ${
                                      t.type === 'deposit' ? 'text-green-600' : 
                                      t.type === 'withdrawal' ? 'text-red-600' : 
                                      'text-gray-900'
                                    }`}>
                                      {parseFloat(t.amount).toLocaleString()} {user.currency}
                                    </p>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-20 text-center">
                           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl opacity-20">📑</span>
                           </div>
                           <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No verified ledger entries found.</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="animate-fadeIn max-w-2xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Account Settings</h2>
                  <p className="text-sm text-gray-500 font-medium">Update your security preferences and account details.</p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-secondary">🔐</span> Change Password
                  </h3>
                  
                  {passMessage.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 ${
                      passMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {passMessage.type === 'success' ? '✅' : '⚠️'} {passMessage.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={passForm.currentPassword}
                        onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">New Password (Min 6 characters)</label>
                      <input 
                        type="password" 
                        required
                        minLength="6"
                        value={passForm.newPassword}
                        onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passForm.confirmPassword}
                        onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={passLoading}
                      className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {passLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" className="w-8 h-8 object-contain" alt="Super Cash Logo" />
              <span className="text-lg font-black text-primary tracking-tight">Super Cash</span>
            </div>
            
            <div className="flex gap-6 text-sm font-medium">
              <Link to="/about" className="text-gray-500 hover:text-primary transition">About</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-primary transition">Privacy Policy</Link>
              <Link to="/contact" className="text-gray-500 hover:text-primary transition">Support</Link>
            </div>

            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <p className="text-gray-400 font-medium text-xs">
                © 2024 Super Cash Technologies.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-white shadow-sm px-2.5 py-1 rounded-md border border-gray-200 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Secure
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;