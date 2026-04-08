import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', language);

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,fr', autoDisplay: false },
          'google_translate_element'
        );
      };

      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);

      const style = document.createElement('style');
      style.innerHTML = `
        .goog-te-banner-frame { display: none !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; }
        body { top: 0 !important; }
        #goog-gt-tt { display: none !important; }
        .skiptranslate.goog-te-gadget { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    const applyTranslation = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
         if(select.value !== language) {
           select.value = language;
           select.dispatchEvent(new Event('change'));
         }
      } else {
         setTimeout(applyTranslation, 500);
      }
    };

    applyTranslation();
  }, [language]);

  const t = (key) => {
    // If the widget translates it, it expects English base DOM text.
    // Return the english base key explicitly to avoid double translations by React re-renders overriding the DOM.
    return translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
