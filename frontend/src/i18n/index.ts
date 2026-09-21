import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { he } from './locales/he';

export const LANGUAGE_STORAGE_KEY = 'mbd-language';

export type AppLanguage = 'he' | 'en';

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === 'he' || value === 'en';
}

export function readStoredLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isAppLanguage(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access errors and fall back to Hebrew.
  }
  return 'he';
}

export function directionForLanguage(language: string): 'rtl' | 'ltr' {
  return language.startsWith('en') ? 'ltr' : 'rtl';
}

export function applyDocumentDirection(language: string) {
  const normalized: AppLanguage = language.startsWith('en') ? 'en' : 'he';
  document.documentElement.lang = normalized;
  document.documentElement.dir = directionForLanguage(normalized);
  document.title =
    normalized === 'he' ? he.app.documentTitle : en.app.documentTitle;
}

function persistLanguage(language: string) {
  const normalized: AppLanguage = language.startsWith('en') ? 'en' : 'he';
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    // Persistence is best-effort.
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    he: { translation: he },
    en: { translation: en },
  },
  lng: readStoredLanguage(),
  fallbackLng: 'he',
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentDirection(i18n.language);
i18n.on('languageChanged', (language) => {
  persistLanguage(language);
  applyDocumentDirection(language);
});

export default i18n;
