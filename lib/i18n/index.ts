import sr from './sr';
import sq from './sq';

export type Locale = 'sr' | 'sq';
export const defaultLocale: Locale = 'sr';
export const locales: Locale[] = ['sr', 'sq'];

export const localeNames: Record<Locale, string> = {
  sr: 'Srpski',
  sq: 'Shqip',
};

const translations = { sr, sq };

export type TranslationKeys = typeof sr;

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations[defaultLocale];
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
