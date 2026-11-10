import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { locales, defaultLocale } from './src/i18n/config';
import { siteConfig } from './src/config/site';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const siteUrl = process.env.SITE_URL?.trim() || env.SITE_URL?.trim() || siteConfig.seo.siteUrl;

export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'always' },
  ...(siteUrl
    ? { site: siteUrl, integrations: [sitemap({ i18n: { defaultLocale, locales: Object.fromEntries(locales.map((locale) => [locale, locale === 'ro' ? 'ro-RO' : locale])) } })] }
    : {}),
});
