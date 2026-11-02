import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const languages = ['ar', 'en'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'ar';

const storageKey = 'language';

export const resources = {
  ar: { translation: ar },
  // `satisfies` makes `npm run typecheck` fail when en.json misses a key that ar.json has.
  en: { translation: en satisfies typeof ar },
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

/** The active language, always one of `languages`. */
export function currentLanguage(): Language {
  return isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : defaultLanguage;
}

function readSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey);
    return isLanguage(saved) ? saved : defaultLanguage;
  } catch {
    // Storage can be blocked (private mode, strict settings); fall back to the default.
    return defaultLanguage;
  }
}

// Keep <html lang dir> in sync: the browser, screen readers and Tailwind `rtl:` variants read it.
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    // Not saving the choice is fine; the app still works in the current language.
  }
});

void i18n.use(initReactI18next).init({
  resources,
  lng: readSavedLanguage(),
  fallbackLng: defaultLanguage,
  supportedLngs: languages,
  interpolation: { escapeValue: false }, // React already escapes rendered strings.
  initAsync: false, // Resources are bundled, so init synchronously and avoid a first empty render.
});

export { i18n };
