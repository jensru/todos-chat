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

// Speech Recognition Language Mapping - ALL BROWSER SUPPORTED LANGUAGES
export const speechLanguageMap: Record<string, string> = {
  // Major Languages
  en: 'en-US',
  de: 'de-DE', 
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-BR',
  ru: 'ru-RU',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ar: 'ar-SA',
  hi: 'hi-IN',
  nl: 'nl-NL',
  sv: 'sv-SE',
  da: 'da-DK',
  no: 'no-NO',
  fi: 'fi-FI',
  pl: 'pl-PL',
  tr: 'tr-TR',
  he: 'he-IL',
  th: 'th-TH',
  vi: 'vi-VN',
  id: 'id-ID',
  ms: 'ms-MY',
  tl: 'tl-PH',
  cs: 'cs-CZ',
  sk: 'sk-SK',
  hu: 'hu-HU',
  ro: 'ro-RO',
  bg: 'bg-BG',
  hr: 'hr-HR',
  sl: 'sl-SI',
  et: 'et-EE',
  lv: 'lv-LV',
  lt: 'lt-LT',
  uk: 'uk-UA',
  be: 'be-BY',
  ka: 'ka-GE',
  hy: 'hy-AM',
  az: 'az-AZ',
  kk: 'kk-KZ',
  ky: 'ky-KG',
  uz: 'uz-UZ',
  mn: 'mn-MN',
  ne: 'ne-NP',
  si: 'si-LK',
  my: 'my-MM',
  km: 'km-KH',
  lo: 'lo-LA',
  bn: 'bn-BD',
  gu: 'gu-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
  ur: 'ur-PK',
  fa: 'fa-IR',
  ps: 'ps-AF',
  sw: 'sw-KE',
  am: 'am-ET',
  ti: 'ti-ET',
  so: 'so-SO',
  ha: 'ha-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
  zu: 'zu-ZA',
  xh: 'xh-ZA',
  af: 'af-ZA',
  is: 'is-IS',
  ga: 'ga-IE',
  cy: 'cy-GB',
  eu: 'eu-ES',
  ca: 'ca-ES',
  gl: 'gl-ES',
  mt: 'mt-MT',
  mk: 'mk-MK',
  sq: 'sq-AL',
  sr: 'sr-RS',
  bs: 'bs-BA',
  me: 'me-ME'
};

// Get speech language from browser locale
export function getSpeechLanguage(browserLocale: string): string {
  const lang = browserLocale.split('-')[0]; // 'en-US' → 'en'
  return speechLanguageMap[lang] || 'en-US'; // Fallback to English
}

// Date Formatting Locales
export const dateLocaleMap: Record<Language, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR'
};
