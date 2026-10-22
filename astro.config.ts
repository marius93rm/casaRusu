import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/config/site';

const siteUrl = process.env.SITE_URL?.trim() || siteConfig.seo.siteUrl;

export default defineConfig({
  output: 'static',
  ...(siteUrl
    ? { site: siteUrl, integrations: [sitemap()] }
    : {}),
});
