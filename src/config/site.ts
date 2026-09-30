import { siteData } from '../data/site';

export const siteConfig = {
  company: siteData.company,
  branding: {
    logo: siteData.media.logo,
    theme: siteData.theme,
  },
  seo: {
    // Fill with the production origin to enable absolute SEO URLs and sitemap generation.
    siteUrl: '',
    title: siteData.seo.ro.title,
    description: siteData.seo.ro.description,
    indexable: siteData.seo.indexable,
  },
  contactForm: {
    endpoint: '',
  },
};
