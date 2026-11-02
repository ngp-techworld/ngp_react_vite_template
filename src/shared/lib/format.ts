import { currentLanguage, type Language } from '@/shared/i18n';

/**
 * Dates are stored and sent in UTC (ngp-general §8); convert to the market's zone only for display.
 * Change it per product if the market is not Syria.
 */
export const displayTimeZone = 'Asia/Damascus';

/** `2026-11-02T09:44:00Z` -> "٢ نوفمبر ٢٠٢٦" (ar) / "Nov 2, 2026" (en). */
export function formatDate(isoDate: string, language: Language = currentLanguage()): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeZone: displayTimeZone,
  }).format(new Date(isoDate));
}

/** Numbers in the digits of the active language. */
export function formatNumber(value: number, language: Language = currentLanguage()): string {
  return new Intl.NumberFormat(language).format(value);
}
