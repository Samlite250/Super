import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Forgot Password | Tracova"; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'If an account exists, a new password has been sent.');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary rounded-full opacity-10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:scale-105 transition-all">
            <img src="/logo.jpeg" className="h-[70px] w-auto object-contain mx-auto mb-2 drop-shadow-lg" alt="Tracova Logo" />
          </Link>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Reset Password</h2>
          <p className="text-sm font-medium text-gray-500">
            {submitted 
              ? "Check your inbox for a temporary access token." 
              : "Enter your institutional email to sync a new password."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@example.com"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-all font-medium text-gray-900 outline-none"
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 mt-4 bg-primary hover:bg-green-700 active:scale-[0.98] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(31,139,76,0.39)] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Dispatch Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl animate-bounce">
              📧
            </div>
            <p className="text-gray-600 mb-8 font-medium">We've sent a temporary password to your email. Please check your inbox and spam folder.</p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg transition-all"
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link to="/login" className="text-sm font-bold text-primary hover:text-green-700 transition flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to institutional login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
