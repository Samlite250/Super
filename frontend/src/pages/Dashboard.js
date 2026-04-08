import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, X, ExternalLink, Zap, Award, LayoutDashboard, Wallet, Users, History, Settings, Banknote, Smartphone, Coins, TrendingUp, Globe, Sprout, AtSign, Gem } from 'lucide-react';


function Dashboard() {
  const { language, setLanguage, t } = useLanguage();
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
  const [showHotPopup, setShowHotPopup] = useState(false);
  const [hotPlansCount, setHotPlansCount] = useState(0);
  const [stats, setStats] = useState({ totalInvested: 0, totalEarned: 0 });
  const [systemSettings, setSystemSettings] = useState({});
  const [allMachines, setAllMachines] = useState([]);
  const [showReinvestModal, setShowReinvestModal] = useState(false);
  const [reinvestingId, setReinvestingId] = useState(null);
  const navigate = useNavigate();

  const getReferralLadder = () => {
    const c = user?.currency || 'FBu';
    let rawLadder = '';
    if (c === 'RWF') rawLadder = systemSettings['referral_ladder_Rwanda'];
    else if (c === 'KES') rawLadder = systemSettings['referral_ladder_Kenya'];
    else if (c === 'UGX') rawLadder = systemSettings['referral_ladder_Uganda'];
    else if (c === 'FBu' || c === 'BIF') rawLadder = systemSettings['referral_ladder_Burundi'];
    else rawLadder = systemSettings['referral_ladder_Global'];
    if (rawLadder) {
      try { return rawLadder.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)); } catch (e) {}
    }
    if (c === 'RWF') return [150000, 200000, 300000, 400000, 500000, 700000, 900000, 1100000, 1300000, 1500000];
    if (c === 'KES') return [36132, 43229, 50325, 57421, 64518, 71614, 78711, 85807, 92904, 100000];
    if (c === 'UGX') return [600000, 800000, 1200000, 1600000, 2000000, 2800000, 3600000, 4400000, 5200000, 6000000];
    if (c === 'FBu' || c === 'BIF') return [500000, 600000, 700000, 800000, 900000, 1000000, 1200000, 1500000, 1700000, 2000000];
    return [450000, 600000, 900000, 1200000, 1500000, 2100000, 2700000, 3300000, 3900000, 4500000];
  };

  const referralCommissionRate = systemSettings['referral_reward_percentage']
    ? parseFloat(systemSettings['referral_reward_percentage']) / 100
    : 0.1;


  useEffect(() => { document.title = "Dashboard | Tracova"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Critical: User Identity
        const meRes = await api.get('/user/me').catch(err => {
           console.error('Critical Auth Failure:', err);
           navigate('/login');
           return null;
        });
        if (!meRes) return;
        setUser(meRes.data);

        // Non-Critical: All other data should not break the dashboard
        const fetchSilently = async (url, setter) => {
          try {
            const res = await api.get(url);
            setter(res.data);
          } catch (e) {
            console.warn(`Soft error fetching ${url}:`, e.message);
          }
        };

        fetchSilently('/user/stats', setStats);
        fetchSilently('/user/history', setHistory);
        fetchSilently('/investments/me', setInvestments);
        fetchSilently('/referrals/me', setReferrals);
        fetchSilently('/settings', setSystemSettings);
        fetchSilently('/settings/social-links', (data) => setSocialLinks(data || { whatsapp: '', telegram: '' }));

        // Machines (for hot popup + reinvest)
        try {
          const machinesRes = await api.get('/machines');
          const allM = machinesRes.data || [];
          setAllMachines(allM.sort((a, b) => parseFloat(a.priceFBu || a.price) - parseFloat(b.priceFBu || b.price)));
          const hot = allM.filter(m => m.type === 'hot');
          setHotPlansCount(hot.length);
          if (hot.length > 0 && !sessionStorage.getItem('hotOfferSeen')) {
            setShowHotPopup(true);
          }
        } catch (e) {
          console.warn('Machine fetch soft-fail:', e.message);
        }

      } catch (err) {
        console.error('Dashboard logic error:', err);
        // Only redirect on actual auth error or logic crash
        if (err.response?.status === 401) {
           navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);



  useEffect(() => {
    let timer;
    if (showHotPopup) {
      timer = setTimeout(() => {
        setShowHotPopup(false);
      }, 30000); // 30 seconds
    }
    return () => clearTimeout(timer);
  }, [showHotPopup]);


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

  const handleReinvest = async (machine) => {
    if (!window.confirm(`Re-invest ${parseFloat(machine.price || machine.priceFBu).toLocaleString()} ${user.currency} into "${machine.name}"? This will be deducted from your current balance.`)) return;
    setReinvestingId(machine.id);
    try {
      await api.post('/investments', { machineId: machine.id, amount: machine.price || machine.priceFBu, isReinvest: true });
      // Refresh user balance
      const meRes = await api.get('/user/me');
      setUser(meRes.data);
      alert(`✅ Re-investment successful! "${machine.name}" is now active and generating returns.`);
      setShowReinvestModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Re-investment failed. Please try again.');
    } finally {
      setReinvestingId(null);
    }
  };

  // Plans the user can currently afford
  const affordablePlans = allMachines.filter(m => parseFloat(user?.balance || 0) >= parseFloat(m.price || m.priceFBu));

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
      
      {/* Hot Flash Sale Banner */}
      {hotPlansCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-1.5 sm:py-2 px-4 shadow-sm relative z-[60] overflow-hidden pr-24">
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none"></div>
          <div className="max-w-6xl mx-auto flex items-center justify-start gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[3px] truncate">
             <Zap size={14} className="fill-white animate-bounce shrink-0" />
             <span className="truncate">Hot Flash Sales!</span>
             <button onClick={() => navigate('/machines')} className="bg-white text-orange-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-orange-50 transition-colors tracking-widest flex items-center gap-1 shrink-0">
               View <ExternalLink size={10} className="hidden sm:block" />
             </button>
             <Zap size={14} className="fill-white animate-bounce hidden sm:block shrink-0" />
          </div>
        </div>
      )}

      {/* ── Re-invest Notification Banner (Sleek Text Only) ── */}
      {affordablePlans.length > 0 && (
        <div className="bg-gradient-to-r from-primary/90 to-green-700 text-white py-2 px-4 relative z-[59] shadow-inner text-center">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <TrendingUp size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[2px]">
              Smart Portfolio Tip: You have enough earnings to activate {affordablePlans.length} new plan{affordablePlans.length > 1 ? 's' : ''}!
            </span>
            <TrendingUp size={14} className="animate-pulse" />
          </div>
        </div>
      )}

      {/* Motivational Popup Modal */}
      <AnimatePresence>
        {showHotPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-[320px] overflow-hidden shadow-2xl relative border-4 border-primary"
            >
              <div className="p-8 sm:p-10 text-center">
                 <div className="text-5xl sm:text-6xl mb-6 scale-110 drop-shadow-lg flex justify-center text-primary">
                    <Tractor size={60} strokeWidth={2.5} />
                 </div>
                 <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter mb-3 uppercase leading-none">{t('motiveTitle')}</h2>
                 <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest leading-relaxed mb-8 px-2">
                    {t('motiveText')}
                 </p>

                 
                 <button 
                  onClick={() => { setShowHotPopup(false); navigate('/machines'); }}
                  className="w-full py-4.5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(31,139,76,0.5)] active:scale-95 transition-all"
                 >
                    {t('motiveAction')}
                 </button>
                 <button 
                  onClick={() => setShowHotPopup(false)}
                  className="mt-6 text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors"
                 >
                    NOT NOW
                 </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* ── Re-invest Modal ── */}
      <AnimatePresence>
        {showReinvestModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm" onClick={() => setShowReinvestModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-primary px-8 pt-8 pb-6 text-white relative">
                <button onClick={() => setShowReinvestModal(false)} className="absolute top-5 right-5 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">✕</button>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={22} />
                  <h2 className="text-xl font-black tracking-tight">Re-invest Earnings</h2>
                </div>
                <p className="text-white/70 text-xs font-medium">Your available balance: <span className="text-white font-black">{parseFloat(user.balance).toLocaleString()} {user.currency}</span></p>
                <p className="text-white/60 text-[10px] mt-1">Select a plan below to activate using your current balance.</p>
              </div>

              {/* Plans List */}
              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                {affordablePlans.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm font-bold">No plans available for your current balance.</p>
                  </div>
                ) : (
                  affordablePlans.map(m => {
                    const price = parseFloat(m.price || m.priceFBu);
                    const dailyReturn = (price * parseFloat(m.dailyPercent)) / 100;
                    const totalReturn = price + (dailyReturn * parseInt(m.durationDays, 10));
                    const canAfford = parseFloat(user.balance) >= price;
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-sm truncate">{m.name}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{m.dailyPercent}% / day</span>
                            <span className="text-[10px] font-bold text-gray-500">{m.durationDays} days</span>
                            <span className="text-[10px] font-bold text-gray-400">→ {totalReturn.toLocaleString()} {user.currency}</span>
                          </div>
                          <p className="text-[11px] font-black text-gray-700 mt-1.5">Cost: {price.toLocaleString()} {user.currency}</p>
                        </div>
                        <button
                          disabled={!canAfford || reinvestingId === m.id}
                          onClick={() => handleReinvest(m)}
                          className={`shrink-0 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all ${
                            reinvestingId === m.id
                              ? 'bg-gray-200 text-gray-400 cursor-wait'
                              : 'bg-primary text-white hover:bg-green-700 shadow-md shadow-green-500/20 active:scale-95'
                          }`}
                        >
                          {reinvestingId === m.id ? '...' : 'Activate'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-6 pb-6">
                <button onClick={() => setShowReinvestModal(false)} className="w-full py-3.5 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:border-gray-200 hover:text-gray-600 transition-all">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Header */}
      <header className="bg-primary text-white pt-8 pb-14 px-6 shadow-md relative overflow-hidden">

        <div className="absolute top-0 right-0 -tr-translate-x-1/2 -tr-translate-y-1/2 w-64 h-64 bg-green-500 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center relative z-10 gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <img src="/logo.png" className="h-10 w-auto object-contain" alt="Tracova Logo" />
              <div className="h-6 w-[1px] bg-white/20"></div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
               {t('welcome')}, {user.username || user.email.split('@')[0]}
            </h1>
            <p className="text-green-50 font-medium opacity-90 max-w-xl">
              Track your daily yields, manage agricultural assets and withdraw your earnings directly to mobile money.
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
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-primary"><Coins size={24} /></div>
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
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><TrendingUp size={24} /></div>
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
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500"><Users size={24} /></div>
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
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500"><Globe size={24} /></div>
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
              { id: 'overview', icon: <LayoutDashboard size={14} />, label: t('dashboard'), key: 'dashboard' },
              { id: 'investments', icon: <Tractor size={14} />, label: t('myAssets'), key: 'myAssets' },
              { id: 'wallet', icon: <Wallet size={14} />, label: t('wallet'), key: 'wallet' },
              { id: 'referrals', icon: <Users size={14} />, label: t('myTeam'), key: 'myTeam' },
              { id: 'history', icon: <History size={14} />, label: t('history'), key: 'history' },
              { id: 'settings', icon: <Settings size={14} />, label: t('settings'), key: 'settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] px-6 py-4 font-bold text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-primary text-primary bg-green-50/30' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>


          {/* Tab Content */}
          <div className="p-6 md:p-8 min-h-[400px]">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (

              <div className="animate-fadeIn">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{t('dashboard')}</h2>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('welcome')}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <Banknote size={18} /> {t('deposit')}
                      </button>
                      {/* Redesigned Re-invest Button - Indigo Gradient for better balance */}
                      <button
                        onClick={() => setShowReinvestModal(true)}
                        className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-black text-[12px] uppercase tracking-[2px] shadow-[0_4px_14px_0_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 ${affordablePlans.length > 0 ? 'animate-bounce-subtle' : ''}`}
                      >
                        <Coins size={18} className="fill-white" /> {t('reinvest')}
                      </button>

                      <button
                        onClick={() => navigate('/withdraw')}
                        className="w-full bg-primary hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transition-all flex items-center justify-center gap-2"
                      >
                        <Smartphone size={18} /> {t('withdraw')}
                      </button>
                      <button
                        onClick={() => navigate('/machines')}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Tractor size={18} /> Explore Plans
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
                        <span className="text-gray-500 font-medium">Account Total</span>
                        <span className="font-bold text-gray-900">{parseFloat(user.balance || 0).toLocaleString()} {user.currency}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Status</span>
                        <span className="bg-green-100 text-green-800 text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold">Verified</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 font-medium">Member Since</span>
                        <span className="font-bold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Join Us Section */}
                {(socialLinks.whatsapp || socialLinks.telegram) && (
                  <div className="mt-8 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shadow-inner">
                           <AtSign size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 tracking-tight">Community Hub</h3>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Connect with official registry streams</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        {socialLinks.whatsapp && (
                          <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="bg-green-50 hover:bg-green-500 text-green-600 hover:text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">WhatsApp</a>
                        )}
                        {socialLinks.telegram && (
                          <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Telegram</a>
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
                    <h2 className="text-2xl font-black text-gray-900 mb-1 leading-none">{t('myAssets')}</h2>
                  </div>
                </div>

                {investments.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-10 text-center">
                    <div className="flex justify-center text-green-200 mb-4"><Sprout size={48} /></div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No active assets</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">You haven't purchased any investment plans yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{t('myAssets')}</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{t('totalInvested')}</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ROI %</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((i, idx) => (
                          <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <span className="font-extrabold text-gray-800">{i.Machine?.name || 'Asset'}</span>
                            </td>
                            <td className="p-4 font-black text-gray-900">{parseFloat(i.amount).toLocaleString()} <span className="text-xs text-gray-500">{user.currency}</span></td>
                            <td className="p-4 text-green-600 font-bold">{i.Machine?.dailyPercent || '0'}%</td>
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
                  <h2 className="text-2xl font-black text-gray-900 mb-1 leading-none">{t('wallet')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-950 rounded-2xl p-8 relative overflow-hidden flex flex-col shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                    <p className="text-gray-400 font-medium text-sm mb-1 relative z-10">{t('totalBalance')}</p>
                    <h3 className="text-4xl font-black text-white mb-6 relative z-10">
                      {Math.max(0, parseFloat(user.balance)).toLocaleString()} <span className="text-xl text-gray-500">{user.currency}</span>
                    </h3>
                  </div>

                  <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm border-l-4 border-l-green-500">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('dailyEarnings')}</p>
                    <p className="text-3xl font-black text-green-700">{investments.reduce((sum, inv) => sum + (parseFloat(inv.amount) * (parseFloat(inv.Machine?.dailyPercent) || 0) / 100), 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">{user.currency}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div className="animate-fadeIn">
                <div className="mb-8 text-center md:text-left px-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">Invite Partners & Earn</h2>
                  <p className="text-primary font-bold text-[10px] sm:text-xs uppercase tracking-[2px] sm:tracking-[3px]">Invite users with high capital to earn more commission</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10">
                   {/* Top Investor Guide Card */}
                   <div className="bg-gradient-to-br from-primary via-green-800 to-green-950 p-6 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-3xl group relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                         <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-inner border border-white/20">💎</div>
                         <div>
                            <h4 className="text-white font-black text-lg uppercase tracking-tight mb-1 sm:mb-2">Top Investor Rewards</h4>
                            <p className="text-green-100/70 text-xs leading-relaxed font-bold">
                               Target users with <span className="text-white underline underline-offset-4 font-black">{(getReferralLadder()[getReferralLadder().length - 1] || 0).toLocaleString()} {user?.currency}+</span>. 
                               Earn an <span className="text-yellow-400 font-black text-sm">INSTANT {systemSettings['referral_reward_percentage'] || '10'}% BONUS</span> on every activation.
                            </p>
                         </div>
                      </div>
                   </div>
                   
                   {/* Clean Referral Link Section - Same Line Focus */}
                   <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col justify-center relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest sm:tracking-[4px] mb-4 sm:mb-6">Your Invitation Link</p>
                     <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100 items-center gap-2 shadow-inner overflow-hidden">
                        <span className="text-[10px] sm:text-[11px] font-mono text-gray-500 truncate px-4 sm:px-6 flex-1">.../reg?ref={user.referralCode}</span>
                        <button 
                          onClick={copyReferralLink}
                          className="bg-gray-950 text-white px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl hover:bg-black whitespace-nowrap flex items-center gap-1"
                        >
                          {copySuccess ? <><X size={12} className="rotate-45" /> COPIED</> : 'COPY LINK'}
                        </button>
                     </div>
                   </div>
                </div>


                {/* Simplified Referral Earnings Table */}
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-12">
                   <div className="bg-primary text-white p-6 sm:p-8">
                      <h3 className="text-base sm:text-lg font-black tracking-tight mb-1 uppercase">Commission Scale</h3>
                      <p className="text-white/60 text-[10px] uppercase font-bold tracking-[3px]">Earn {systemSettings['referral_reward_percentage'] || '10'}% instant bonus on every capital deployment</p>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                               <th className="p-6 font-black text-gray-500 uppercase text-[10px] tracking-widest">Target Capital</th>
                               <th className="p-6 font-black text-gray-500 uppercase text-[10px] tracking-widest text-right">Your Instant Yield</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {getReferralLadder().map(amt => (
                               <tr key={amt} className="hover:bg-indigo-50/30 transition-colors group">
                                  <td className="p-6 font-bold text-gray-700">
                                     {amt.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold ml-1">{user.currency}</span>
                                  </td>
                                  <td className="p-6 text-right font-black text-primary group-hover:scale-105 transition-transform origin-right">
                                     + {(amt * (parseFloat(systemSettings['referral_reward_percentage']) / 100 || 0.1)).toLocaleString()} <span className="text-[10px] text-green-800/40 font-bold ml-1">{user.currency}</span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>

                      </table>
                   </div>
                </div>

                {/* Downline Structure */}
                <div className="mb-20">
                  <div className="flex items-center justify-between mb-6 px-4">
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Your Team Members ({referrals.length})</h3>
                    <span className="text-[10px] font-black text-primary bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">Live</span>
                  </div>
                  {referrals.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-16 text-center text-gray-300 font-black uppercase text-xs tracking-widest">
                      No team members found. Share your link to start building your network.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-md">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                          <tr>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Name</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Join Date</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Commission Earned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {referrals.map((ref) => (
                            <tr key={ref.id} className="hover:bg-gray-50/50">
                              <td className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-gray-950 text-white flex items-center justify-center font-black text-sm">
                                    {(ref.referredUser?.username || 'U')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-black text-gray-900 text-sm leading-none mb-1">{ref.referredUser?.username || 'Unknown User'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{ref.referredUser?.country || 'Global'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-6 text-xs text-gray-500 font-bold">{new Date(ref.createdAt).toLocaleDateString()}</td>
                              <td className="p-6 text-right">
                                <span className="font-black text-primary bg-green-50 px-4 py-2 rounded-xl border border-green-100 inline-block font-sans">
                                  + {parseFloat(ref.commission || 0).toLocaleString()} <span className="text-[10px] opacity-60 ml-0.5">{user.currency}</span>
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
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Money History</h2>
                  <p className="text-sm text-gray-500 font-medium">Detailed and clear record of all your incoming and outgoing transactions.</p>
                </div>

                <div className="space-y-8">
                  {/* Deposits & Withdrawals Status */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Deposits Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">💰 Your Deposits</h4>
                        <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-1 rounded">Live</span>
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
                          <div className="p-10 text-center text-gray-300 font-bold text-xs">No deposits yet.</div>
                        )}
                      </div>
                    </div>

                    {/* Withdrawals Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">🏦 Payout Requests</h4>
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded">Live</span>
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
                          <div className="p-10 text-center text-gray-300 font-bold text-xs">No payouts yet.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unified Transaction Ledger */}
                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl">
                    <div className="bg-gray-900 text-white px-8 py-6">
                       <h3 className="font-black text-xl tracking-tight">ALL TRANSACTIONS</h3>
                       <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[3px] mt-1">Full statement of your activity</p>
                    </div>
                    <div>
                      {history.transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
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
                           <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No transactions found.</p>
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
              <img src="/logo.png" className="h-10 w-auto object-contain scale-110" alt="Tracova Logo" />
              <span className="text-lg font-black text-primary tracking-tight">Tracova</span>
            </div>
            
            <div className="flex gap-6 text-sm font-medium">
              <Link to="/about" className="text-gray-500 hover:text-primary transition">About</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-primary transition">Privacy Policy</Link>
              <Link to="/contact" className="text-gray-500 hover:text-primary transition">Support</Link>
            </div>

            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <p className="text-gray-400 font-medium text-xs">
                © 2024 Tracova Technologies.
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