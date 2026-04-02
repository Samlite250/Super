import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-6 sm:bottom-8 right-4 sm:right-6 z-[9999] flex items-center bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-1 shadow-2xl hover:bg-white/95 transition-all border-b-2 border-b-gray-100">
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${language === 'en' ? 'bg-primary text-white shadow-[0_5px_15px_-3px_rgba(31,139,76,0.3)]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
      >
        EN
      </button>
      <button 
        onClick={() => setLanguage('fr')}
        className={`ml-1 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${language === 'fr' ? 'bg-primary text-white shadow-[0_5px_15px_-3px_rgba(31,139,76,0.3)]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
