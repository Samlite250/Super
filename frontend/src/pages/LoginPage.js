import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Login | Tracova"; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { loginIdentifier, password });
      
      if (res.data.otpRequired) {
        toast.success("MFA: Administrative Security Required");
        navigate('/auth/admin-secure-v2');
        return;
      }

      const { token, user } = res.data;
      toast.success(`Welcome back, ${user.username}!`);
      localStorage.setItem('token', token);
      
      if (user.role === 'admin') {
        localStorage.setItem('adminMode', 'true');
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login technical failure:', err);
      const msg = err.response?.data?.message || 'Access denied: Check credentials or network sync.';
      toast.error(msg);
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary rounded-full opacity-10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-100 relative z-10 transition-all mx-2">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1 mb-6 hover:scale-105 transition-transform group">
            <img src="/logo.png" className="h-[70px] w-auto object-contain mx-auto drop-shadow-lg" alt="Tracova Logo" />
            <span className="text-xl font-black text-primary tracking-[0.2em] uppercase mt-1 group-hover:text-green-700 transition-colors">Tracova</span>
          </Link>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
          <p className="text-sm font-medium text-gray-500">Log in to view your agricultural yields.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Username or Email</label>
            <input
              type="text"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              placeholder="Username or email"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-medium text-gray-900 outline-none"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:text-green-700 transition">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-medium text-gray-900 outline-none"
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 mt-6 bg-primary hover:bg-green-700 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Secure Login"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-green-700 hover:underline transition">
              Create one now
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;