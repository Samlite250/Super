import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Privacy() {
  useEffect(() => { document.title = "Privacy Policy | Super Cash"; }, []);
  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="bg-gray-50 py-16 text-center border-b border-gray-100">
         <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
         <p className="max-w-xl mx-auto text-gray-400 font-bold uppercase tracking-[4px] text-xs px-4">
            Last Updated: January 2024
         </p>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 text-gray-600 leading-relaxed">
         <div className="space-y-10">
            <section>
               <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">1. Information We Collect</h2>
               <p className="mb-4">
                  When you register on Super Cash, we collect your full name, email address, phone number, and regional location. This information is required to establish your legal investment account and process withdrawals to your local mobile money provider.
               </p>
               <p>
                  We also collect technical data such as IP addresses and device information to ensure the security of your account and prevent fraudulent login attempts.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">2. How We Use Your Data</h2>
               <p className="mb-3 font-bold text-gray-900">Your data is primarily used to:</p>
               <ul className="list-disc pl-6 space-y-2">
                  <li>Verify your identity and comply with financial regulations.</li>
                  <li>Calculate and distribute your daily investment yields accurately.</li>
                  <li>Facilitate instant deposits and 24-hour withdrawal processing.</li>
                  <li>Send critical system notifications regarding your assets.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">3. Data Protection & Security</h2>
               <p className="mb-4">
                  We implement industry-standard AES-256 encryption for all sensitive data stored on our servers. Your password is never stored in plain text; it is hashed using secure cryptographic algorithms.
               </p>
               <p>
                  Access to our internal databases is strictly limited to authorized personnel and is monitored 24/7 for unauthorized patterns.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">4. Sharing with Third Parties</h2>
               <p>
                  Super Cash does not sell, trade, or rent your personal data to advertisers. We only share necessary data with our verified payment processing partners (MTN, Airtel, Orange, etc.) specifically to execute the transactions you request.
               </p>
            </section>

            <section className="bg-green-50 p-8 rounded-3xl border border-green-100">
               <h2 className="text-lg font-black text-primary mb-2">Questions?</h2>
               <p className="text-sm font-medium text-green-800 mb-4">If you have any concerns regarding how your data is handled, please reach out directly.</p>
               <Link to="/contact" className="text-primary font-bold hover:underline">Contact Security Team →</Link>
            </section>
         </div>

         <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-400">
            <Link to="/" className="hover:text-primary transition-colors">← Homepage</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service →</Link>
         </div>
      </main>
    </div>
  );
}

export default Privacy;