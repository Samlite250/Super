import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

// Custom SVG Icons for a premium look
const Icons = {
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
  ),
  Key: () => (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
  ),
  Mail: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
  ),
  Whatsapp: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
  ),
  Login: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
  )
};

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: Select Method, 3: OTP
  const [emailHint, setEmailHint] = useState('');
  const [chosenMethod, setChosenMethod] = useState('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Nexus Gateway | Security Control"; }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { loginIdentifier: username, password });
      if (res.data.otpRequired) {
        setEmailHint(res.data.emailHint);
        // Exclusively Email Protocol
        setChosenMethod('email');
        setStep(3); // Go straight to OTP entry
        setCountdown(60); 
        // Note: OTP is already sent by the login endpoint if it's the first time? 
        // Wait, the backend login only returns the hint. 
        // I should call requestOtp implicitly OR the backend should send it.
        // Actually, my backend login did NOT send the OTP, it waited for request-otp.
        // I need to trigger it.
        await requestOtp('email');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('adminMode', 'true');
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied. Secondary protocol mismatch.');
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (method) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/resend-admin-otp', { username, method: 'email' });
      setChosenMethod('email');
      setStep(3);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification relay failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    try {
      await api.post('/auth/resend-admin-otp', { username, method: chosenMethod });
      toast.success('New security code successfully re-issued');
      setCountdown(60);
    } catch (err) {
      toast.error('Re-dispatch failed. Encryption unstable.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-admin-otp', { username, otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('adminMode', 'true');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Token verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 font-sans p-4 relative overflow-hidden">
      
      {/* Deep Institutional Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/heavy_tractor_agro.png" 
            className="absolute top-0 left-0 w-full h-full object-cover scale-110 animate-slow-zoom select-none blur-[1px] opacity-30" 
            alt="Asset" 
          />
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#4285F4]/10 via-transparent to-[#115D33]/30"></div>
      </div>

      <div className="w-full max-w-sm relative z-20">
        
        {/* Refined Header */}
        <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-block relative mb-4">
                <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                    <img src="/logo.png" className="h-12 w-auto object-contain" alt="Logo" />
                </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Login</h1>
            <div className="h-1 w-8 bg-[#115D33] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Emerald Institutional Card (#115D33) */}
        <div className="bg-[#115D33] p-8 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden ring-1 ring-white/10">
          
          <div className="absolute top-0 right-0 p-6 opacity-[0.05] text-white">
              <Icons.Shield />
          </div>

          {error && (
            <div className="bg-red-500 border border-red-400 text-white p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake shadow-lg text-[11px] font-bold uppercase tracking-wider">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1 opacity-70">Username</label>
                <div className="relative group/input">
                    <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within/input:text-[#115D33] transition-colors z-10">
                        <Icons.Key />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-xl focus:ring-4 focus:ring-[#115D33]/30 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-300 font-bold"
                      required
                    />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1 opacity-70">Password</label>
                <div className="relative group/input">
                    <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within/input:text-[#115D33] transition-colors z-10">
                        <Icons.Lock />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-xl focus:ring-4 focus:ring-[#115D33]/30 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-300 font-bold"
                      required
                    />
                </div>
              </div>

              <button disabled={loading} className="w-full py-4 bg-gray-900 hover:bg-black active:scale-[0.98] text-white rounded-xl font-black text-xs uppercase tracking-[4px] shadow-xl transition-all flex justify-center items-center gap-3 disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Login Now"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fadeIn text-white">
              
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm text-[#115D33]">
                          <Icons.Mail />
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <h3 className="text-[10px] font-black uppercase tracking-wider mb-0.5">Verification Sent</h3>
                          <p className="text-[10px] opacity-50 truncate">{emailHint}</p>
                      </div>
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1 opacity-70">Verification Code</label>
                <div className="relative group/otp">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="0-0-0-0"
                      maxLength={4}
                      className="w-full py-5 bg-white border-0 rounded-2xl focus:ring-4 focus:ring-black/20 outline-none transition-all font-black text-4xl tracking-[12px] text-center text-gray-900 placeholder:text-gray-100"
                      required
                      autoFocus
                    />
                </div>
              </div>

              <div className="flex justify-between items-center px-1">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${countdown > 0 ? 'bg-white' : 'bg-red-400'} animate-pulse`}></div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{countdown > 0 ? `Valid for ${countdown}s` : 'Expired'}</p>
                 </div>
                 <button type="button" disabled={countdown > 0 || resendLoading} onClick={handleResendOtp} className="text-[9px] font-black hover:text-white transition-all uppercase tracking-widest border-b border-white/30 pb-0.5 text-white/40">
                   {resendLoading ? 'Sending...' : 'Resend'}
                 </button>
              </div>

              <button disabled={loading} className="w-full py-4 bg-gray-900 hover:bg-black active:scale-[0.98] text-white rounded-xl font-black text-xs uppercase tracking-[4px] shadow-xl transition-all flex justify-center items-center gap-3 disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Verify Code"}
              </button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-white/10 pt-4">
            <Link to="/" className="text-[9px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[3px]">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center opacity-10">
            <p className="text-[9px] font-black text-white uppercase tracking-[4px]">Institutional Security Shield</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;