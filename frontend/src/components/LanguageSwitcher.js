import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-3 sm:top-5 right-3 sm:right-5 z-[9999] flex items-center bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-1 shadow-2xl hover:bg-white/90 transition-all border-b-2 border-b-gray-100">
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest transition-all ${language === 'en' ? 'bg-primary text-white shadow-[0_5px_15px_-3px_rgba(31,139,76,0.3)]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
      >
        English
      </button>
      <button 
        onClick={() => setLanguage('fr')}
        className={`ml-1 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest transition-all ${language === 'fr' ? 'bg-primary text-white shadow-[0_5px_15px_-3px_rgba(31,139,76,0.3)]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
      >
        Français
      </button>
    </div>

  );
};

export default LanguageSwitcher;
