import { defaultLocale, locales, type Locale } from './config.ts';

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
  return `${localizedPath(path, targetLocale)}${url.search}${url.hash}`;
}
