import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-2 right-2 z-[1000] flex items-center bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl scale-90 sm:scale-100 transition-all origin-top-right">
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter transition-all ${language === 'en' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
      >
        EN
      </button>
      <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
      <button 
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter transition-all ${language === 'fr' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
