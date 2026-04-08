import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-2 right-2 sm:top-3 sm:right-4 z-[9999] flex items-center gap-2">
      <button 
        onClick={() => setLanguage('en')}
        className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${language === 'en' ? 'text-white drop-shadow-md border-b-2 border-white' : 'text-white/60 hover:text-white'}`}
      >
        EN
      </button>
      <span className="text-white/40 text-[10px]">|</span>
      <button 
        onClick={() => setLanguage('fr')}
        className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${language === 'fr' ? 'text-white drop-shadow-md border-b-2 border-white' : 'text-white/60 hover:text-white'}`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
