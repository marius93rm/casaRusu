import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/config/site';

export default defineConfig({
  output: 'static',
  ...(siteConfig.seo.siteUrl
    ? { site: siteConfig.seo.siteUrl, integrations: [sitemap()] }
    : {}),
});
