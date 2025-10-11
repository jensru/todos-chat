// src/hooks/useLocale.ts - Browser Locale Detection Hook with User Settings
'use client';

import { useState, useEffect } from 'react';
import { useUserSettings } from './useUserSettings';

export function useLocale(): {
  language: string;
  locale: string;
  isReady: boolean;
} {
  const { settings, isReady: settingsReady } = useUserSettings();
  const [language, setLanguage] = useState<string>('en'); // Default: English
  const [locale, setLocale] = useState<string>('en-US');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && settingsReady) {
      // Use user's saved UI language preference, or detect from browser
      if (settings.uiLanguage && settings.uiLanguage !== 'auto') {
        setLanguage(settings.uiLanguage);
        setLocale(settings.uiLanguage === 'en' ? 'en-US' : 
                 settings.uiLanguage === 'de' ? 'de-DE' : 
                 settings.uiLanguage === 'fr' ? 'fr-FR' : 'en-US');
      } else {
        // Auto-detect from browser
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
      }
      
      setIsReady(true);
      console.log('useLocale - Language:', language, 'locale:', locale, 'from settings:', settings.uiLanguage);
    }
  }, [settings.uiLanguage, settingsReady]);

  return {
    language,
    locale,
    isReady
  };
}
