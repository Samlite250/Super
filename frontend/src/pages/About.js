import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function About() {
  useEffect(() => { document.title = "About Us | Tracova"; }, []);
  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="bg-secondary py-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-3xl"></div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 relative z-10 tracking-tight">About Tracova</h1>
        <p className="max-w-2xl mx-auto text-lg text-green-50 px-4 opacity-90 relative z-10 leading-relaxed">
          Empowering African agriculture through fractional asset investment and co-funding technology.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <section className="mb-16">
           <h2 className="text-2xl font-black text-gray-900 mb-6 border-b-4 border-secondary w-max pb-1">Our Mission</h2>
           <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Tracova was born out of a vision to bridge the gap between large-scale agricultural potential and individual capital. 
              In many regions across East Africa, smallholders and community farms lack access to high-efficiency machinery like heavy tractors, drones, and harvesters.
           </p>
           <p className="text-gray-600 text-lg leading-relaxed">
              We leverage the power of decentralized co-funding to allow thousands of individual investors to co-own and rent out these high-yield assets, 
              simultaneously creating passive income for investors and modernizing local farm infrastructure.
           </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
           <div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-4">Regional Reach</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                 Our operations currently span across <strong>Burundi, Rwanda, Uganda, and Kenya</strong>. We work with local fleet managers and agricultural co-operatives to ensure every machine in our portfolio is actively generating value every day.
              </p>
              <div className="flex gap-4 items-center">
                 <span className="px-3 py-1 bg-green-50 text-primary font-bold rounded-lg text-xs uppercase border border-green-100 italic">4 Countries</span>
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-xs uppercase border border-blue-100 italic">10K+ Investors</span>
              </div>
           </div>
           <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900 mb-4">Commitment to Security</h3>
              <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-gray-600 text-sm italic">
                    <span className="text-primary font-bold">✓</span> Every asset is fully insured against theft and mechanical failure.
                 </li>
                 <li className="flex items-start gap-2 text-gray-600 text-sm italic">
                    <span className="text-primary font-bold">✓</span> Direct integration with major mobile money providers.
                 </li>
                 <li className="flex items-start gap-2 text-gray-600 text-sm italic">
                    <span className="text-primary font-bold">✓</span> Transparent daily ROI calculations with instant visibility.
                 </li>
              </ul>
           </div>
        </section>

        <div className="text-center bg-gray-900 py-12 px-6 rounded-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary rounded-full opacity-20 blur-3xl"></div>
           <h3 className="text-2xl font-black text-white mb-4 relative z-10 tracking-tight">Ready to join the movement?</h3>
           <p className="text-gray-400 mb-8 relative z-10 max-w-sm mx-auto">Start co-funding verified agricultural assets and earn daily yields starting today.</p>
           <div className="flex justify-center gap-4 relative z-10">
              <Link to="/register" className="px-8 py-3 bg-white text-secondary rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">Get Started</Link>
              <Link to="/" className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all">Back Home</Link>
           </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-gray-100 mt-12">
         <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-loose">
            © 2024 Tracova Technologies • Feeding the Future, Funding the People
         </p>
      </footer>
    </div>
  );
}

export default About;