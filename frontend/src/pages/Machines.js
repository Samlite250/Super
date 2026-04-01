import React, { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Flame, Shield, TrendingUp, Clock, Award } from 'lucide-react';

function Machines() {
  const [machines, setMachines] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investingId, setInvestingId] = useState(null);
  const navigate = useNavigate();

  const [viewType, setViewType] = useState('normal'); // 'normal' or 'hot'

  useEffect(() => { document.title = "Farm Packages | Tracova"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesRes, userRes] = await Promise.all([
          api.get('/machines'),
          api.get('/user/me').catch(() => ({ data: null }))
        ]);
        
        // Ensure results are sorted by price
        const sortedMachines = (Array.isArray(machinesRes.data) ? machinesRes.data : [])
                               .sort((a, b) => parseFloat(a.priceFBu) - parseFloat(b.priceFBu));
        setMachines(sortedMachines);
        if (userRes.data) setUser(userRes.data);
        
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load agricultural plans');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInvest = async (machine) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to invest in ${machine.name} for ${parseFloat(machine.price || machine.priceFBu).toLocaleString()} ${user?.currency || machine.currency || 'FBu'}?`)) {
        return;
    }

    setInvestingId(machine.id);
    try {
      await api.post('/investments', { 
        machineId: machine.id, 
        amount: machine.price || machine.priceFBu 
      });
      alert('🎉 Investment successful! Your agricultural equipment is now active and generating daily returns.');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Investment failed. Please check your balance and try again.');
    } finally {
      setInvestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading Farm Packages...</p>
        </div>
      </div>
    );
  }

  const hotPlans = machines.filter(m => m.type === 'hot');
  const normalPlans = machines.filter(m => m.type !== 'hot');

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      {/* Premium Header matching Deposit.js */}
      <header className="bg-primary text-white pt-8 pb-14 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -tr-translate-x-1/2 -tr-translate-y-1/2 w-64 h-64 bg-green-500 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center relative z-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
              <img src="/logo.png" className="h-10 w-auto object-contain inline-block mr-4 scale-110" alt="Tracova Logo" />
              Farm Investment Packages
            </h1>
                Purchase stakes in high-yield farming equipment. Watch your capital grow daily with our secure agricultural equipment packages.
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 bg-black/10 hover:bg-black/20 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 mb-12 relative z-20">
        
        {error && (
          <div className="bg-red-50 border-[1px] border-red-500 text-red-800 p-4 rounded-xl mb-8 text-sm md:text-base font-medium shadow-sm flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
           <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
              <button
                onClick={() => setViewType('normal')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${viewType === 'normal' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Standard Equipment
              </button>
              <button
                onClick={() => setViewType('hot')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative ${viewType === 'hot' ? 'bg-orange-500 text-white shadow-md shadow-orange-100' : 'text-gray-500 hover:bg-orange-50'}`}
              >
                Hot Short-Time Plans
                {hotPlans.length > 0 && viewType !== 'hot' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
           </div>
        </div>

        {machines.length === 0 && !error ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
            <span className="text-6xl mb-4 block">🚜</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Packages Available</h3>
            <p className="text-gray-500">All our agricultural investment packages are currently filled. Please check back later for new opportunities!</p>
          </div>
        ) : (
          <>
            {viewType === 'hot' ? (
              <div className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active <span className="text-orange-600 uppercase">Flash Sales</span> 🔥</h2>
                </div>
                {hotPlans.length === 0 ? (
                  <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center">
                    <p className="text-4xl mb-4">⏳</p>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active flash plans at the moment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {hotPlans.map((m, idx) => (
                      <HotMachineCard key={m.id} m={m} idx={idx} user={user} investingId={investingId} handleInvest={handleInvest} />
                    ))}
                  </div>

                )}
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Standard <span className="text-primary uppercase">Portfolio</span></h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {normalPlans.map((m, idx) => (
                    <MachineCard key={m.id} m={m} idx={idx} user={user} investingId={investingId} handleInvest={handleInvest} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


// ─── HOT MACHINE CARD (PREMIUM REDESIGN) ───────────────────────────────────
function HotMachineCard({ m, idx, user, investingId, handleInvest }) {
    const price = parseFloat(m.price || m.priceFBu);
    const dailyRate = parseFloat(m.dailyPercent);
    const days = parseInt(m.durationDays, 10);
    const totalProfit = (price * dailyRate * days) / 100;
    const totalReturn = price + totalProfit;

    const fallbackImages = ['/tractor_agro.png', '/drone_agro.png', '/harvester_agro.png', '/heavy_tractor_agro.png'];
    const defaultImg = fallbackImages[idx % fallbackImages.length];
    
    const getMachineImage = (img) => {
      if (!img) return defaultImg;
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      return `${IMAGE_BASE_URL}${img.startsWith('/') ? img : `/${img}`}`;
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="relative group h-full"
      >
        {/* Animated Border Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
        
        <div className="relative bg-[#0F172A] rounded-[2rem] h-full flex flex-col overflow-hidden border border-white/10 shadow-2xl">
          
          {/* Header Image Section */}
          <div className="relative h-44 w-full overflow-hidden">
            <img 
              src={getMachineImage(m.imageUrl)} 
              alt={m.name} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 animate-pulse">
                <Flame size={12} className="fill-white" /> High Demand
              </div>
            </div>
            
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl text-white text-[10px] font-bold flex items-center gap-1.5">
              <Shield size={12} className="text-blue-400" /> Insured Asset
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 pt-2 flex flex-col flex-grow">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-[2px]">Limited Time Plan</span>
              </div>
              <h3 className="text-xl font-black text-white leading-tight group-hover:text-orange-400 transition-colors">{m.name}</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2">Exclusive high-yield opportunity with instant automated distribution at the end of the term.</p>
            </div>

            {/* Financial Metrics - More relevant and clearer labels */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <TrendingUp size={12} className="text-orange-500" /> Final Profit
                </div>
                <p className="text-lg font-black text-white">
                  +{(dailyRate * days).toFixed(0)}%
                </p>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <Clock size={12} className="text-orange-500" /> Wait Time
                </div>
                <p className="text-lg font-black text-white">
                  {m.durationDays} <span className="text-[10px] font-bold text-slate-500 uppercase">Days</span>
                </p>
              </div>
            </div>

            {/* Payout Information */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black text-orange-500/80 uppercase tracking-widest">Total Payout at end</p>
                <Award size={14} className="text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-white">{totalReturn.toLocaleString()}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">{user?.currency || m.currency || 'FBu'}</p>
              </div>
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 w-full animate-progress-fast"></div>
              </div>
            </div>

            {/* Pricing and Action */}
            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Required Capital</p>
                  <p className="text-2xl font-black text-white">
                    {price.toLocaleString()} <span className="text-sm font-bold text-slate-500">{user?.currency || m.currency}</span>
                  </p>
                </div>
              </div>

              <button
                disabled={investingId === m.id}
                onClick={() => handleInvest(m)}
                className="w-full group/btn relative bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 p-4 rounded-xl text-white font-black text-[11px] uppercase tracking-[3px] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-[0_10px_20px_-5px_rgba(234,88,12,0.4)]"
              >
                {investingId === m.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap size={16} className="fill-white" />
                    Secure Your Spot
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
}

// ─── STANDARD MACHINE CARD ──────────────────────────────────────────────────
function MachineCard({ m, idx, user, investingId, handleInvest }) {
    const price = parseFloat(m.price || m.priceFBu);
    const dailyRate = parseFloat(m.dailyPercent);
    const days = parseInt(m.durationDays, 10);
    const totalProfit = (price * dailyRate * days) / 100;
    const totalReturn = price + totalProfit;
    
    const isPremium = m.premium || price > 500000;
    
    const fallbackImages = ['/tractor_agro.png', '/drone_agro.png', '/harvester_agro.png', '/heavy_tractor_agro.png'];
    const defaultImg = fallbackImages[idx % fallbackImages.length];
    const getMachineImage = (img) => {
      if (!img) return defaultImg;
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      return `${IMAGE_BASE_URL}${img.startsWith('/') ? img : `/${img}`}`;
    };

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-green-100 group">
        
        {/* Simple Image Header */}
        <div className="relative h-44 w-full bg-gray-50">
          <img 
             src={getMachineImage(m.imageUrl)} 
             alt={m.name} 
             className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow-sm border border-white/10">
              #{idx + 1}
            </div>
          </div>
          
          {isPremium && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
              ⭐ Premium
            </div>
          )}
        </div>

        {/* Plan Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-4">
            <h2 className="text-xl font-black text-gray-900 mb-1 leading-tight group-hover:text-primary transition-colors">{m.name}</h2>
            <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{m.description || "Fractional agricultural investment package with verified daily returns."}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Yield</p>
              <p className="text-lg font-black text-green-700">
                {m.dailyPercent}%
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
              <p className="text-lg font-black text-gray-900">{m.durationDays} <span className="text-[10px] font-bold text-gray-400 uppercase">Days</span></p>
            </div>
            <div className="col-span-2 p-3 bg-green-50/50 border border-green-100 rounded-2xl flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-0.5">Total Return</p>
                  <p className="text-sm font-black text-gray-900">{totalReturn.toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-0.5">Profit Est.</p>
                  <p className="text-sm font-black text-primary">+{totalProfit.toLocaleString()}</p>
               </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Price</p>
                  <p className="text-2xl font-black text-gray-900 leading-none">
                    {price.toLocaleString()} <span className="text-sm font-bold text-gray-400">{user?.currency || m.currency}</span>
                  </p>
                </div>
             </div>
             
             <button
               disabled={investingId === m.id}
               onClick={() => handleInvest(m)}
               className="w-full py-4 bg-primary hover:bg-green-700 text-white rounded-xl font-black text-[11px] uppercase tracking-[2px] transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-md active:scale-95"
             >
               {investingId === m.id ? 'Processing...' : 'Invest Now'}
             </button>
          </div>
        </div>
      </div>
    );
}


export default Machines;