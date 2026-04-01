import React, { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '../services/api';

import { useNavigate } from 'react-router-dom';

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {hotPlans.map((m, idx) => (
                      <MachineCard key={m.id} m={m} idx={idx} user={user} investingId={investingId} handleInvest={handleInvest} isHot={true} />
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

// Sub-component for Machine Card to avoid repetitive code
function MachineCard({ m, idx, user, investingId, handleInvest, isHot = false }) {
    // Calculate Total Return Estimation
    const price = parseFloat(m.price || m.priceFBu);
    const dailyRate = parseFloat(m.dailyPercent);
    const days = parseInt(m.durationDays, 10);
    const dailyProfit = (price * dailyRate) / 100;
    const totalProfit = dailyProfit * days;
    const totalReturn = price + totalProfit;
    
    const isPremium = m.premium || price > 50000;
    
    const fallbackImages = [
      '/tractor_agro.png', 
      '/drone_agro.png', 
      '/harvester_agro.png', 
      '/heavy_tractor_agro.png'
    ];
    const defaultImg = fallbackImages[idx % fallbackImages.length];
    const getMachineImage = (img) => {
      if (!img) return defaultImg;
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      const path = img.startsWith('/') ? img : `/${img}`;
      return `${IMAGE_BASE_URL}${path}`;
    };

    return (
      <div className={`rounded-2xl shadow-sm border transition-all duration-300 flex flex-col overflow-hidden group ${isHot ? 'border-orange-200 bg-orange-50/10 hover:shadow-orange-200 shadow-orange-100' : 'border-gray-100 bg-white hover:shadow-xl'}`}>
        
        {/* Image Header */}
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          <img 
             src={getMachineImage(m.imageUrl)} 
             alt={m.name} 
             className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Numbering and Reserved Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-sm flex items-center justify-center border border-white/20">
              #{idx + 1}
            </div>
            <div className="bg-white/90 backdrop-blur-md border border-white/50 px-2.5 py-1 rounded-lg text-[11px] font-bold text-primary shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Verified
            </div>
          </div>
          
          {(isPremium || isHot) && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${isHot ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900'}`}>
              {isHot ? '🔥 HOT PLAN' : '⭐ Premium'}
            </div>
          )}
        </div>

        {/* Plan Content */}
        <div className="p-6 flex flex-col flex-grow">
          
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">{m.name}</h2>
            <p className="text-sm text-gray-500 line-clamp-2">{m.description || "Short-term high-yield agricultural investment package."}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{isHot ? 'Total Return' : 'Daily ROI'}</p>
              <p className={`text-lg font-bold ${isHot ? 'text-orange-600' : 'text-green-600'}`}>
                {isHot ? `${(dailyRate * days).toFixed(1)}%` : `${m.dailyPercent}%`}
              </p>
            </div>
            <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Cycle</p>
              <p className="text-lg font-bold text-gray-800">{m.durationDays} <span className="text-sm font-semibold text-gray-500">Days</span></p>
            </div>
            <div className={`col-span-2 p-3 rounded-xl flex justify-between items-center border ${isHot ? 'bg-orange-50 border-orange-100' : 'bg-green-50/30 border-green-100'}`}>
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isHot ? 'text-orange-700' : 'text-green-700'}`}>Maturation Payout</p>
                <p className={`text-sm font-bold ${isHot ? 'text-orange-900' : 'text-green-800'}`}>{totalReturn.toLocaleString()} {user?.currency || m.currency || 'FBu'}</p>
              </div>
              <div className="text-right">
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isHot ? 'text-orange-700' : 'text-green-700'}`}>Est. Profit</p>
                <p className={`text-sm font-bold ${isHot ? 'text-orange-600' : 'text-primary'}`}>+{totalProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
             <div className="flex items-end justify-between mb-4">
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Required Capital</p>
                 <p className="text-2xl font-black text-gray-900 leading-none">
                   {price.toLocaleString()} <span className="text-base text-gray-500 font-bold">{user?.currency || m.currency || 'FBu'}</span>
                 </p>
               </div>
             </div>
             
             <button
               disabled={investingId === m.id}
               onClick={() => handleInvest(m)}
               className={`w-full py-3.5 active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100 shadow-md ${isHot ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-200' : 'bg-primary hover:bg-green-700 shadow-green-200'}`}
             >
               {investingId === m.id ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Processing...
                 </>
               ) : (
                 <>
                   {isHot ? 'Secure Spot Now' : 'Reserve Plan Now'}
                   <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                 </>
               )}
             </button>
          </div>
        </div>
      </div>
    );
}

export default Machines;