import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center bg-white/90 backdrop-blur-md border border-gray-100 rounded-full px-2 py-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all">
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${language === 'en' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
      >
        EN
      </button>
      <div className="w-[1px] h-3 bg-gray-200 mx-1"></div>
      <button 
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${language === 'fr' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
