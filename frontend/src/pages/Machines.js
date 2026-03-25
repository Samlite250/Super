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

  useEffect(() => { document.title = "Agro Plans | Super Cash"; }, []);

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
    
    // Check if user has enough balance roughly (if we had user state here), 
    // but the backend will validate it anyway.
    
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
            <p className="text-gray-600 font-semibold">Loading Agricultural Plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      {/* Premium Header matching Deposit.js */}
      <header className="bg-primary text-white pt-8 pb-14 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -tr-translate-x-1/2 -tr-translate-y-1/2 w-64 h-64 bg-green-500 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center relative z-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
              <img src="/logo.png" className="w-10 h-10 object-contain inline-block mr-2" alt="Super Cash Logo" />
              Agricultural Investment Plans
            </h1>
            <p className="text-green-50 font-medium opacity-90 max-w-xl">
              Purchase stakes in high-yield farming equipment. Watch your capital grow daily with our secure agricultural pools.
            </p>
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

        {machines.length === 0 && !error ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
            <span className="text-6xl mb-4 block">🚜</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Plans Available</h3>
            <p className="text-gray-500">All our agricultural investment pools are currently filled. Please check back later for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {machines.map((m, idx) => {
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
                <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                  
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
                    
                    {isPremium && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                        ⭐ Premium
                      </div>
                    )}
                  </div>

                  {/* Plan Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    
                    <div className="mb-4">
                      <h2 className="text-xl font-extrabold text-gray-800 mb-1">{m.name}</h2>
                      <p className="text-sm text-gray-500 line-clamp-2">{m.description || "High-yield agricultural equipment leasing pool. Generate passive income daily."}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Daily Return</p>
                        <p className="text-lg font-bold text-green-600">{m.dailyPercent}%</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Duration</p>
                        <p className="text-lg font-bold text-gray-800">{m.durationDays} <span className="text-sm font-semibold text-gray-500">Days</span></p>
                      </div>
                      <div className="col-span-2 bg-green-50/50 border border-green-100 p-3 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Total Expected Est.</p>
                          <p className="text-sm font-bold text-green-800">{totalReturn.toLocaleString()} {user?.currency || m.currency || 'FBu'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Profit</p>
                          <p className="text-sm font-bold text-primary">+{totalProfit.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Investment Amount</p>
                          <p className="text-2xl font-black text-gray-900 leading-none">
                            {price.toLocaleString()} <span className="text-base text-gray-500 font-bold">{user?.currency || m.currency || 'FBu'}</span>
                          </p>
                        </div>
                      </div>
                      
                      <button
                        disabled={investingId === m.id}
                        onClick={() => handleInvest(m)}
                        className="w-full py-3.5 bg-primary hover:bg-green-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100"
                      >
                        {investingId === m.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Reserve Plan Now
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          </>
                        )}
                      </button>
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Machines;