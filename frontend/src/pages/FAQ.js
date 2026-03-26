import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FAQ() {
  useEffect(() => { document.title = "Help Center | Tracova"; }, []);
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is Tracova exactly?",
      a: "Tracova is an agricultural crowdfunding platform. We source high-quality farming machinery (tractors, drones, etc.) and allow individuals to buy 'shares' or 'plans' in that machinery. The income generated from renting this equipment to farms is then distributed daily to the investors."
    },
    {
      q: "How often do I receive my earnings?",
      a: "Earnings are credited to your Tracova wallet every 24 hours. You can see your balance growing in real-time on your dashboard."
    },
    {
      q: "What is the minimum investment amount?",
      a: "Our entry-level plans start as low as 10,000 FBu, making it accessible for anyone to start building an agricultural portfolio."
    },
    {
      q: "Is my money safe?",
      a: "Yes. All physical assets are fully insured against theft and damage. Furthermore, our platform uses institutional-grade encryption to protect your financial data and transaction history."
    },
    {
      q: "How do I withdraw my profits?",
      a: "You can withdraw directly to your mobile money account (MTN, Airtel, Orange, Lumicash, or Ecocash). Simply go to the 'Withdraw' section in your dashboard. Processing typically takes 12-24 hours."
    },
    {
      q: "Can I have multiple investment plans?",
      a: "Absolutely. You can invest in as many different machines and plans as you like to diversify your income streams."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <header className="bg-primary pt-20 pb-28 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-300 rounded-full opacity-10 blur-[100px]"></div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 relative z-10 tracking-tight">Help Center & FAQ</h1>
        <p className="max-w-xl mx-auto text-lg text-green-50 px-4 opacity-90 relative z-10">
          Everything you need to know about starting your agricultural investment journey.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
           <div className="p-8 md:p-10 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Common Questions</h2>
              <span className="text-[10px] font-black text-primary bg-green-100 px-3 py-1 rounded-full uppercase tracking-widest">{faqs.length} Articles</span>
           </div>
           
           <div className="divide-y divide-gray-100">
              {faqs.map((faq, idx) => (
                <div key={idx} className="group transition-colors hover:bg-gray-50/50">
                   <button 
                     onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                     className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4"
                   >
                      <span className={`text-lg font-extrabold transition-colors ${openIndex === idx ? 'text-primary' : 'text-gray-800'}`}>
                        {faq.q}
                      </span>
                      <span className={`text-2xl transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-primary' : 'text-gray-300'}`}>
                        {openIndex === idx ? '−' : '+'}
                      </span>
                   </button>
                   {openIndex === idx && (
                     <div className="px-6 md:px-8 pb-8 animate-fadeIn">
                        <p className="text-gray-600 leading-relaxed font-medium">
                           {faq.a}
                        </p>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>

        <div className="mt-12 text-center bg-green-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full opacity-20 blur-2xl"></div>
            <h3 className="text-xl font-black mb-2 relative z-10">Still have questions?</h3>
            <p className="text-green-100/70 mb-6 relative z-10 text-sm">We're available 24/7 via email to help with your account.</p>
            <div className="flex justify-center gap-4 relative z-10">
               <Link to="/contact" className="px-6 py-2.5 bg-white text-green-900 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">Contact Support</Link>
               <Link to="/" className="px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all">Back Home</Link>
            </div>
        </div>
      </main>
    </div>
  );
}

export default FAQ;