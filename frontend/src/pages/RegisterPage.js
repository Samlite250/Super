import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', username: '', phone: '', email: '', password: '', country: '', referralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { document.title = "Register | Tracova"; }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setForm(prev => ({ ...prev, referralCode: ref }));
    }
  }, [location.search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('🎉 Institutional Account Registered! Welcome to the family.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Check network or email format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-2 sm:p-4 md:p-6 relative overflow-hidden py-10">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary rounded-full opacity-10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400 rounded-full opacity-10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 border border-gray-100 relative z-10 mx-2">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:scale-105 transition-transform">
            <img src="/logo.png" className="w-10 h-10 object-contain" alt="Tracova Logo" />
            <span className="text-2xl font-black text-primary tracking-tight">Tracova</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Create your account</h2>
          <p className="text-sm font-medium text-gray-500">Join thousands earning daily yields from agriculture.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Legal Name</label>
              <input 
                name="fullName" 
                onChange={handleChange} 
                value={form.fullName} 
                placeholder="John Doe" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Username</label>
              <input 
                name="username" 
                onChange={handleChange} 
                value={form.username} 
                placeholder="johninvestor" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900 outline-none" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                name="email" 
                onChange={handleChange} 
                value={form.email} 
                type="email" 
                placeholder="john@example.com" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input 
                name="phone" 
                onChange={handleChange} 
                value={form.phone} 
                placeholder="+257..." 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900 outline-none" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Base Country</label>
              <select 
                name="country" 
                value={form.country} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900 cursor-pointer outline-none" 
                required
              >
                <option value="">Choose Country</option>
                <option value="Burundi">Burundi</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Uganda">Uganda</option>
                <option value="Kenya">Kenya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Secure Password</label>
              <input 
                name="password" 
                onChange={handleChange} 
                value={form.password} 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900 outline-none" 
                required 
              />
            </div>
          </div>

          {/* Referral Field */}
          <div className="pt-2 border-t border-gray-100 relative">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
               <span>Referred By</span>
               {form.referralCode && (
                 <span className="text-[10px] bg-green-100 text-primary px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                   Inviter Detected
                 </span>
               )}
             </label>
             <input 
               name="referralCode" 
               readOnly
               value={form.referralCode} 
               placeholder="No inviter detected" 
               className="w-full px-4 py-2.5 bg-gray-50 border border-dashed border-gray-200 rounded-xl transition-all font-bold text-gray-500 text-sm cursor-default" 
             />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 mt-6 bg-primary hover:bg-green-700 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "🚀 Create Free Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500 font-medium mb-3">
             By registering, you agree to our <Link to="/terms" className="text-gray-700 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-gray-700 font-bold hover:underline">Privacy Policy</Link>.
          </p>
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="font-medium text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-green-700 hover:underline transition">
                Log in instantly
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;