import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en.json';

const resources = {
  en: {
    translation: enTranslation,
  },
};

export const availableLanguages = ['en'];
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

// eslint-disable-next-line import/no-named-as-default-member
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
