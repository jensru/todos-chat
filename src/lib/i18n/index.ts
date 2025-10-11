// src/lib/i18n/index.ts - Translation Helper Functions
import { translations, Language } from './translations';

export function useTranslation(language: Language = 'en') {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found anywhere
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t };
}

export function getTranslation(language: Language, key: string): string {
  const { t } = useTranslation(language);
  return t(key);
}

// Speech Recognition Language Mapping
export const speechLanguageMap: Record<Language, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR'
};

// Date Formatting Locales
export const dateLocaleMap: Record<Language, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR'
};
