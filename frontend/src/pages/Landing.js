import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  useEffect(() => { document.title = "Tracova | Agricultural Yield & Investment"; }, []);
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-primary/95 backdrop-blur-md text-white sticky top-0 z-50 shadow-sm border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img src="/logo.png" className="h-10 w-auto sm:h-12 object-contain" alt="Tracova Logo" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200">
               Tracova
            </h1>
          </div>
          <div className="flex gap-3 sm:gap-4 items-center">
            <Link to="/login" className="text-xs sm:text-sm font-bold text-white/90 hover:text-white transition-colors">Log In</Link>
            <Link to="/register" className="text-xs sm:text-sm font-bold bg-white text-primary px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

 
      {/* Live Activity Feed - Social Proof Marquee */}
      <div className="bg-white border-b border-gray-100 overflow-hidden py-3 shadow-inner relative z-40">
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
            {[
              { u: 'u***1', a: '45,000 FBu', t: '2m ago' },
              { u: 's***p', a: '12,000 KES', t: '5m ago' },
              { u: 'r***a', a: '150,000 RWF', t: '12m ago' },
              { u: 'k***2', a: '8,000 UGX', t: '20m ago' },
              { u: 'm***s', a: '1,200,000 FBu', t: '35m ago' },
              { u: 'a***m', a: '35,000 KES', t: '1h ago' }
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-black text-gray-400 tracking-widest">{p.t}</span>
                  <span className="text-[10px] sm:text-[11px] font-black text-gray-700 tracking-tight uppercase">{p.u} recieved payout</span>
                  <span className="text-[10px] sm:text-[11px] font-black text-green-700 bg-green-50 px-2 sm:px-2.5 py-1 rounded-lg border border-green-100 shadow-sm">+{p.a}</span>
              </div>

            ))}
            {/* Infinite Loop Duplicates */}
            {[
              { u: 'u***1', a: '45,000 FBu', t: '2m ago' },
              { u: 's***p', a: '12,000 KES', t: '5m ago' },
            ].map((p, i) => (
              <div key={i+'loop'} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-black text-gray-400 tracking-widest">{p.t}</span>
                  <span className="text-[10px] sm:text-[11px] font-black text-gray-700 tracking-tight uppercase">{p.u} recieved payout</span>
                  <span className="text-[10px] sm:text-[11px] font-black text-green-700 bg-green-50 px-2 sm:px-2.5 py-1 rounded-lg border border-green-100 shadow-sm">+{p.a}</span>
              </div>

            ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-32 lg:pt-40 min-h-[85vh] sm:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0 text-white">
          <img 
            src="/images/hero-tractor.png" 
            className="w-full h-full object-cover opacity-60 scale-110 blur-[0.5px] transform transition-transform duration-[15000ms] hover:scale-105" 
            alt="Agricultural Tractor Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b] via-[#064e3b]/70 to-[#1F8B4C]/40 text-white"></div>
          <div className="absolute inset-0 bg-[#1F8B4C]/10 mix-blend-multiply text-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 w-full">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Invest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">Agriculture</span>.<br/>Generate Wealth.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-xl md:text-2xl text-green-50 mb-10 font-medium opacity-90 px-2 lg:px-0">
            Earn steady, automated daily income by co-funding heavy agricultural equipment rentals across East Africa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-6 sm:px-0">
            <Link to="/register" className="px-8 py-3.5 sm:py-4 bg-white text-primary hover:bg-gray-50 rounded-2xl font-bold text-base sm:text-lg transition-transform transform hover:scale-105 shadow-[0_0_20px_rgba(31,139,76,0.3)] flex items-center justify-center gap-2">
              Start Earning Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
            <Link to="/machines" className="px-8 py-3.5 sm:py-4 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center justify-center">
              View Verified Plans
            </Link>
          </div>
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center items-center gap-3 sm:gap-8 text-white/70 text-[10px] sm:text-sm font-semibold uppercase tracking-wider px-2">
            <span className="flex items-center justify-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Trusted by 10k+</span>
            <span className="hidden sm:block">•</span>
            <span>Regulated Assets</span>
            <span className="hidden sm:block">•</span>
            <span>Instant Payouts</span>
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">Your Path to Passive Income</h3>
            <p className="mt-4 text-lg text-gray-500 font-medium">Four simple steps to start growing your wealth.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Register', desc: 'Create your secure account in less than a minute.', icon: '🔐' },
              { num: '02', title: 'Fund Wallet', desc: 'Deposit funds instantly via local mobile money.', icon: '📲' },
              { num: '03', title: 'Reserve Asset', desc: 'Select a highly-vetted agricultural equipment plan.', icon: '🚜' },
              { num: '04', title: 'Earn Daily', desc: 'Collect automated daily returns and withdraw anytime.', icon: '📈' }
            ].map((step, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
                <div className="text-4xl mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-3xl font-black text-gray-200">{step.num}</span>
                  <h4 className="font-extrabold text-xl text-gray-900">{step.title}</h4>
                </div>
                <p className="text-gray-600 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50 border-y border-gray-100 pb-28 pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">Why Professionals Choose Us</h3>
            <p className="mt-4 text-lg text-gray-500 font-medium">Industry-leading returns backed by real-world assets.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Automated Daily Yields', desc: 'Smart contracts automatically distribute your rental profits every 24 hours. No waiting for end-of-month.', color: 'from-green-400 to-emerald-500' },
              { title: 'Mobile Focus', desc: 'Native support for MTN, Airtel, and local mobile money providers. Get paid in your local currency instantly.', color: 'from-blue-400 to-indigo-500' },
              { title: 'Zero Hidden Fees', desc: '0% processing limits on deposits. Transparent ROI calculations with no surprise deductions.', color: 'from-yellow-400 to-orange-500' },
              { title: 'Vetted Assets', desc: 'Every tractor and drone is heavily vetted and actively deployed in high-yield farming sectors.', color: 'from-purple-400 to-pink-500' },
              { title: 'Referral Rewards', desc: 'Earn lucrative percentage commissions instantly when your network joins and invests.', color: 'from-red-400 to-rose-500' },
              { title: 'Enterprise Security', desc: 'Your data and funds are encrypted and segregated following strict financial compliance standards.', color: 'from-teal-400 to-cyan-500' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl mb-6 bg-gradient-to-br ${feature.color} shadow-inner`}></div>
                <h4 className="font-extrabold text-xl mb-3 text-gray-900">{feature.title}</h4>
                <p className="text-gray-600 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgogIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h3 className="text-4xl font-black text-white mb-6 tracking-tight">Don't let your money sit idle.</h3>
          <p className="text-xl text-green-50 mb-10 font-medium">Join thousands of smart investors generating reliable, passive income every single day.</p>
          <button onClick={() => navigate('/register')} className="px-10 py-5 bg-white text-primary text-xl rounded-2xl font-black hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2 mx-auto">
            Create Free Account
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" className="h-12 w-auto object-contain" alt="Tracova Logo" />
                <span className="text-2xl font-black text-white">Tracova</span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
                The premier digital platform for agricultural equipment fractional investing in East Africa.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-3 font-medium">
                <li><Link to="/machines" className="text-gray-400 hover:text-green-400 transition">Investment Plans</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-green-400 transition">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-green-400 transition">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-3 font-medium">
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 font-medium text-sm">
              © 2024 Tracova Technologies. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
