import { en } from './locales/en';
import { ro } from './locales/ro';
import { it } from './locales/it';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import type { Locale } from './config';
import type { Translation } from './types';

export { locales, defaultLocale, socialLocales, type Locale } from './config';
export { isLocale, getLocaleFromUrl, localizedPath, switchLocalePath } from './paths';

const dictionaries = { ro, en, it, es, fr, de } as const satisfies Record<Locale, Translation>;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
