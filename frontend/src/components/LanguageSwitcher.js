import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-2 right-2 sm:top-3 sm:right-3 z-[9999] flex items-center bg-white/90 backdrop-blur-sm border border-white/40 rounded-lg p-0.5 shadow-lg opacity-80 hover:opacity-100 transition-all origin-top-right transform scale-90 sm:scale-100">
      <button 
        onClick={() => setLanguage('en')}
        className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
      >
        EN
      </button>
      <button 
        onClick={() => setLanguage('fr')}
        className={`ml-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${language === 'fr' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
