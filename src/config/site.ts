import { siteData } from '../data/site';

export const siteConfig = {
  company: siteData.company,
  branding: {
    logo: siteData.media.logo,
    theme: siteData.theme,
  },
  seo: {
    // Keep empty until confirmed; SITE_URL can supply the build-time production origin.
    siteUrl: '',
    title: siteData.seo.ro.title,
    description: siteData.seo.ro.description,
    indexable: siteData.seo.indexable,
  },
};
