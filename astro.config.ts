import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { locales, defaultLocale } from './src/i18n/config';
import { siteConfig } from './src/config/site';

const siteUrl = process.env.SITE_URL?.trim() || siteConfig.seo.siteUrl;

export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'always' },
  ...(siteUrl
    ? { site: siteUrl, integrations: [sitemap({ i18n: { defaultLocale, locales: Object.fromEntries(locales.map((locale) => [locale, locale === 'ro' ? 'ro-RO' : locale])) } })] }
    : {}),
});
