import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import deTranslation from './locales/de.json';
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import frTranslation from './locales/fr.json';
import ptBrTranslation from './locales/pt-br.json';
import trTranslation from './locales/tr.json';
import vnTranslation from './locales/vn.json';
import zhTranslation from './locales/zh.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  de: {
    translation: deTranslation,
  },
  tr: {
    translation: trTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
  es: {
    translation: esTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  pt: {
    translation: ptBrTranslation,
  },
  vn: {
    translation: vnTranslation,
  },
};

export const availableLanguages = ['en', 'de', 'tr', 'zh', 'es', 'fr', 'pt-br', 'vn'];
export const defaultLocale = 'en';

const determineLngFn = (code: string): string => {
  if (!code || code.length === 0) {
    return (i18next.language = defaultLocale);
  }

  // Full locale match
  if (availableLanguages.includes(code.toLowerCase())) {
    return (i18next.language = code.toLowerCase());
  }

  // Base locale match
  const codeBase = code.split('-')[0].toLowerCase();
  if (availableLanguages.includes(codeBase)) {
    return (i18next.language = codeBase);
  }

  // Fallback
  return (i18next.language = defaultLocale);
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    react: {
      useSuspense: true,
    },
    load: 'languageOnly',
    lowerCaseLng: true,
    fallbackLng: determineLngFn,
    preload: [defaultLocale],
    keySeparator: '.',
    interpolation: { escapeValue: false },
  });

export default i18next;
