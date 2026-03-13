import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Nexus Gateway | Admin"; }, []);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { loginIdentifier: username, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('adminMode', 'true');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied. Security clearance insufficient.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 font-sans p-6 relative overflow-hidden">
      
      {/* Cinematic Background Scenery */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full opacity-[0.07] blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-primary rounded-full opacity-[0.05] blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[480px] relative z-20">
        
        {/* Logo/Branding Header */}
        <div className="text-center mb-10 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] mb-6 transition-transform hover:scale-110">
               <img src="/logo.png" className="w-12 h-12 object-contain" alt="Super Cash Logo" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Nexus Node Access</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[5px]">Restricted Administrative Gateway</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl p-10 md:p-14 rounded-[3.5rem] border border-white/10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] animate-scaleUp">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl mb-8 flex items-center gap-4 animate-fadeIn">
              <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-black text-[10px] shrink-0">!</div>
              <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handle} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[4px] ml-1">Credential Index</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ADMINISTRATOR_EMAIL"
                className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm text-white placeholder:text-gray-700"
                required
              />
            </div>

            <div className="space-y-2">
               <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[4px] ml-1">Security Directive</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm text-white placeholder:text-gray-700"
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-primary hover:bg-green-400 active:scale-95 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-[5px] shadow-[0_15px_40px_-5px_rgba(34,197,94,0.3)] transition-all flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                 <div className="w-4 h-4 border-2 border-gray-950/20 border-t-gray-950 rounded-full animate-spin"></div>
              ) : "AUTHENTICATE_CLEARANCE"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <Link to="/" className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[3px] flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              ABORT_TO_PUBLIC_CLUSTER
            </Link>
          </div>
        </div>
      </div>
      
      {/* Terminal Accents */}
      <div className="absolute bottom-10 left-10 text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden lg:block opacity-20">
         [LOG_STATE: RESTRICTED]<br/>
         [AUTH_PROTOCOL: NEXUS_V4]<br/>
         [NODE: BURUNDI_PRIMARY]
      </div>
      
      <div className="absolute top-10 right-10 text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden lg:block opacity-20 text-right">
         LATENCY: {Math.floor(Math.random() * 50)}ms<br/>
         UPTIME: 99.98%<br/>
         ENCRYPTION: AES-256-GCM
      </div>
    </div>
  );
}

export default AdminLogin;