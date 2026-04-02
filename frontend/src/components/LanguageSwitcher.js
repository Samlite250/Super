import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 flex justify-end items-center px-4 py-1 relative z-[9999] text-xs">
      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mr-3 hidden sm:inline-block">Language</span>
      <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${language === 'en' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('fr')}
          className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${language === 'fr' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          FR
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
