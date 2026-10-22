// Locale files contain data and erasable types; Node >=22.19 loads them directly.
import { ro } from '../src/i18n/locales/ro.ts';
import { en } from '../src/i18n/locales/en.ts';
import { it } from '../src/i18n/locales/it.ts';
import { es } from '../src/i18n/locales/es.ts';
import { fr } from '../src/i18n/locales/fr.ts';
import { de } from '../src/i18n/locales/de.ts';

export const dictionaries = { ro, en, it, es, fr, de };
export { locales } from '../src/i18n/config.ts';
import { locales } from '../src/i18n/config.ts';
export const prefixFor = (locale) => locale === 'ro' ? '' : `${locale}/`;
export const homeFor = (locale) => `/${prefixFor(locale)}`;
export const localeFor = (route) => locales.find((locale) => locale !== 'ro' && route.startsWith(`/${locale}/`)) ?? 'ro';
export const unlocalizedRoute = (route) => localeFor(route) === 'ro' ? route : route.slice(localeFor(route).length + 1);
