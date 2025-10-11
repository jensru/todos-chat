// src/hooks/useLocale.ts - Browser Locale Detection Hook
'use client';

import { useState, useEffect } from 'react';

export function useLocale(): {
  language: string;
  locale: string;
  isReady: boolean;
} {
  const [language, setLanguage] = useState<string>('en'); // Default: English
  const [locale, setLocale] = useState<string>('en-US');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getBrowserLanguage = (): string => {
        const lang = navigator.language || navigator.languages?.[0] || 'en';
        return lang.split('-')[0]; // 'en-US' → 'en'
      };

      const getBrowserLocale = (): string => {
        return navigator.language || navigator.languages?.[0] || 'en-US';
      };

      const detectedLanguage = getBrowserLanguage();
      const detectedLocale = getBrowserLocale();

      // Map supported languages
      const supportedLanguages = ['en', 'de', 'fr'];
      const finalLanguage = supportedLanguages.includes(detectedLanguage) 
        ? detectedLanguage 
        : 'en'; // Fallback to English

      setLanguage(finalLanguage);
      setLocale(detectedLocale);
      setIsReady(true);

      console.log('useLocale - Detected language:', finalLanguage, 'locale:', detectedLocale);
    }
  }, []);

  return {
    language,
    locale,
    isReady
  };
}
