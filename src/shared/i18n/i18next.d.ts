import 'i18next';
import type ar from './locales/ar.json';

// Typed translation keys: `t('items.titel')` is a type error instead of a missing string at runtime.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof ar };
  }
}
