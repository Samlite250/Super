import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Contact() {
  const [supportEmail, setSupportEmail] = React.useState('support@tracova.com');
  
  useEffect(() => { 
    document.title = "Contact Us | Tracova";
    async function getSettings() {
      try {
        const res = await api.get('/settings');
        if (res.data && res.data.supportEmail) {
          setSupportEmail(res.data.supportEmail);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    getSettings();
  }, []);

  return (

    <div className="min-h-screen bg-gray-50 font-sans selection:bg-primary selection:text-white">
      {/* Friendly Header */}
      <header className="bg-primary pt-16 pb-32 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400 rounded-full opacity-10 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <span className="w-2 h-2 bg-green-300 rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-green-50">Support Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-lg text-green-50 font-medium max-w-2xl mx-auto opacity-90 leading-relaxed">
            Have questions about your investment or need technical support? Our friendly team is here to help you 24/7.
          </p>
        </div>
      </header>

      {/* Spacing added with mt-16 and -mt-12 */}
      <main className="max-w-6xl mx-auto px-6 mt-16 pb-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Support Channels - Smaller Cards */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Card: Email */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Email Support</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase mb-3">Replies in ~2 hours</p>
              <a href={`mailto:${supportEmail}`} className="text-sm font-bold text-primary hover:underline transition-colors break-words">{supportEmail}</a>
            </div>

            {/* Card: Locations */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Our Offices</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase mb-3">East Africa Hubs</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Visit us in Bujumbura, Kigali, Kampala, or Nairobi.</p>
            </div>

            {/* Card: Telegram */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Telegram Community</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">Chat with other investors and stay updated.</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-400 uppercase">
                Available Soon
              </div>
            </div>
          </div>

          {/* Contact Form - More Balanced */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-lg border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gray-900 px-8 py-10 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-1">Send a Message</h2>
                  <p className="text-gray-400 font-medium text-sm">Fill out the form below and we will get back to you shortly.</p>
               </div>
            </div>

            <div className="p-8 md:p-12 flex-1">
               <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks! Your message has been simulated. Please use support@tracova.com for real inquiries.")}}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase ml-1">Your Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Samuel" 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-semibold text-gray-900 outline-none" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="you@example.com" 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-semibold text-gray-900 outline-none" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1">Subject</label>
                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-bold text-gray-900 outline-none appearance-none cursor-pointer">
                       <option>General Support</option>
                       <option>Deposit or Withdrawal Help</option>
                       <option>Investment Questions</option>
                       <option>Report a Problem</option>
                       <option>Business Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase ml-1">Your Message</label>
                    <textarea 
                      rows="5" 
                      placeholder="How can we help you today?" 
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-gray-800 outline-none resize-none" 
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-5 bg-primary hover:bg-green-700 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-green-500/10 transition-all"
                  >
                    Send Message
                  </button>
               </form>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
            <Link to="/" className="text-sm font-bold text-gray-400 hover:text-primary transition-all">
               ← Back Home
            </Link>
        </div>
      </main>

      <footer className="py-8 bg-white border-t border-gray-100 text-center">
         <p className="text-gray-400 text-xs font-bold uppercase tracking-widest px-4 mb-2">
            Contact us: <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a>
         </p>
         <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest px-4">
            Security: We will never ask for your password or pin via email.
         </p>
         <Link to="/auth/admin-secure-v2" className="mt-4 inline-block text-[9px] font-black text-gray-200 hover:text-primary transition-all uppercase tracking-[4px]">Admin Portal</Link>
      </footer>
    </div>
  );
}

export default Contact;