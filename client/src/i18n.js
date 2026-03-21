import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import taTranslation from './locales/ta/translation.json';
import teTranslation from './locales/te/translation.json';
import knTranslation from './locales/kn/translation.json';
import mlTranslation from './locales/ml/translation.json';
import hiTranslation from './locales/hi/translation.json';
import bnTranslation from './locales/bn/translation.json';
import mrTranslation from './locales/mr/translation.json';
import guTranslation from './locales/gu/translation.json';
import paTranslation from './locales/pa/translation.json';
import orTranslation from './locales/or/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  ta: {
    translation: taTranslation
  },
  te: {
    translation: teTranslation
  },
  kn: {
    translation: knTranslation
  },
  ml: {
    translation: mlTranslation
  },
  hi: {
    translation: hiTranslation
  },
  bn: {
    translation: bnTranslation
  },
  mr: {
    translation: mrTranslation
  },
  gu: {
    translation: guTranslation
  },
  pa: {
    translation: paTranslation
  },
  or: {
    translation: orTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('selectedLanguage') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
