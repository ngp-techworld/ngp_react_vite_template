import { currentLanguage, type Language } from '@/shared/i18n';

/**
 * Dates are stored and sent in UTC (ngp-general §8); convert to the market's zone only for display.
 * Change it per product if the market is not Syria.
 */
export const displayTimeZone = 'Asia/Damascus';

/** A date in the display time zone and the active language: `2026-11-02T09:44:00Z` -> "Nov 2, 2026". */
export function formatDate(isoDate: string, language: Language = currentLanguage()): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeZone: displayTimeZone,
  }).format(new Date(isoDate));
}

/**
 * A number in the active language. The digits (0-9 or ٠-٩) for `ar` come from the browser's
 * locale data; recent versions use 0-9.
 */
export function formatNumber(value: number, language: Language = currentLanguage()): string {
  return new Intl.NumberFormat(language).format(value);
}
