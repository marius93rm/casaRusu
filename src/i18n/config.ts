export const locales = ['ro', 'en', 'it', 'es', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ro';
export const socialLocales: Record<Locale, string> = {
  ro: 'ro_RO', en: 'en_GB', it: 'it_IT', es: 'es_ES', fr: 'fr_FR', de: 'de_DE',
};
