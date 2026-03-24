import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Terms() {
  useEffect(() => { document.title = "Service Terms | Super Cash"; }, []);
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-gray-900 py-20 text-center text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full opacity-10 blur-[100px]"></div>
         <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Terms of Service</h1>
         <p className="max-w-xl mx-auto text-gray-500 font-bold uppercase tracking-[4px] text-xs px-4">
            Governing the Super Cash Ecosystem
         </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
         <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-14 text-gray-600 leading-relaxed shadow-green-900/5">
            
            <div className="space-y-12">
               <section>
                  <h2 className="text-2xl font-black text-gray-900 mb-5 tracking-tight flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">01</span>
                     Eligibility
                  </h2>
                  <p>
                     By accessing Super Cash, you warrant that you are at least 18 years of age and reside in one of our operational regions (Burundi, Rwanda, Uganda, Kenya). You are responsible for ensuring that your use of the platform complies with all local laws and regulations.
                  </p>
               </section>

               <section>
                  <h2 className="text-2xl font-black text-gray-900 mb-5 tracking-tight flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">02</span>
                     Investment Risks
                  </h2>
                  <p className="mb-4">
                     All investments carry risk. While Super Cash ensures all agricultural assets are insured and professionally managed, market fluctuations in rental demand can affect daily ROIs. 
                  </p>
                  <p className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm font-medium text-yellow-800 italic">
                     Past performance is not as guarantee of future results. Co-funding assets involves active participation in a rental fleet model.
                  </p>
               </section>

               <section>
                  <h2 className="text-2xl font-black text-gray-900 mb-5 tracking-tight flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">03</span>
                     Withdrawal & Fees
                  </h2>
                  <p>
                     You may request a withdrawal of your earned yields at any time, provided you meet the minimum threshold of 10,000 FBu (or equivalent). A standard network fee of 2% is deducted to cover mobile money processing costs. Withdrawals are typically processed within 24 hours.
                  </p>
               </section>

               <section>
                  <h2 className="text-2xl font-black text-gray-900 mb-5 tracking-tight flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs">04</span>
                     Prohibited Conduct
                  </h2>
                  <p>
                     Users are strictly prohibited from creating multiple accounts to manipulate referral commissions, attempting to exploit system vulnerabilities, or providing fraudulent identification info. Violators will have their accounts permanently locked and funds forfeited.
                  </p>
               </section>

               <section className="pt-10 border-t border-gray-100 flex flex-col items-center text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">
                     By clicking "Accept" or using the platform, you agree to these terms in full.
                  </p>
                  <div className="flex gap-4">
                     <Link to="/register" className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">Agree & Get Started</Link>
                     <Link to="/" className="px-10 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">Back Home</Link>
                  </div>
               </section>
            </div>
            
         </div>

         <div className="mt-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            Governed by the digital asset laws of the East African Community.
         </div>
      </main>
    </div>
  );
}

export default Terms;