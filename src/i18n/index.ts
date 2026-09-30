import { en } from './locales/en';
import { ro } from './locales/ro';
import { siteData, type SiteLocale } from '../data/site';

export const locales = Object.keys(siteData.copy) as SiteLocale[];
export type Locale = SiteLocale;
export const defaultLocale: Locale = 'ro';

const dictionaries = { ro, en } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && locales.includes(value as Locale);
}

export function getLocaleFromUrl(url: URL): Locale {
  const [firstSegment] = url.pathname.split('/').filter(Boolean);
  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return locale === defaultLocale ? `${normalized || '/'}` : `/${locale}${normalized || '/'}`;
}

export function switchLocalePath(url: URL, targetLocale: Locale): string {
  const segments = url.pathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  const path = segments.join('/');
  return localizedPath(path, targetLocale);
}
