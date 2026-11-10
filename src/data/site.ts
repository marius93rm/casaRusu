import { ro } from '../i18n/locales/ro';
import { en } from '../i18n/locales/en';
import { it } from '../i18n/locales/it';
import { es } from '../i18n/locales/es';
import { fr } from '../i18n/locales/fr';
import { de } from '../i18n/locales/de';
import { company } from './company';

const mapDirectionsUrl = new URL('https://www.google.com/maps/dir/');
mapDirectionsUrl.searchParams.set('api', '1');
mapDirectionsUrl.searchParams.set('destination', `${company.geo.latitude},${company.geo.longitude}`);

export const siteData = {
  company,
  theme: {
    background: '#faf8f4',
    surface: '#f1ede6',
    text: '#332c25',
    muted: '#6d655c',
    primary: '#332c25',
    accent: '#805b36',
    border: '#ddd5c9',
  },
  seo: { indexable: true, ro: ro.seo, en: en.seo, it: it.seo, es: es.seo, fr: fr.seo, de: de.seo },
  links: {
    facebook: 'https://www.facebook.com/people/Restaurant-Casa-Rusu/61594316175166/',
    instagram: 'https://www.instagram.com/restaurant.casarusu/',
    tiktok: 'https://www.tiktok.com/@restaurant.casarusu',
    map: mapDirectionsUrl.toString(),
    googleBusiness: 'https://www.google.com/maps?cid=8243879332869202835',
  },
  media: {
    logo: '/brand/casa-rusu-logo.jpg',
    cover: '/images/casa-rusu-interior.jpg',
    featuredDish: '/images/casa-rusu-preparat.jpg',
    exterior: '/images/casa-rusu-exterior.jpg',
    social: {
      home: '/images/social/home-1200x630.jpg',
      menu: '/images/social/menu-1200x630.jpg',
      dish: '/images/social/dish-1200x630.jpg',
    },
  },
  promotions: {
    cocktailOffer: {
      expiresAt: '2026-12-01T00:00:00+02:00',
      sourceUrl:
        'https://www.facebook.com/restaurantcasarusu/posts/pfbid076PQ5RUYNEQqQE92EEYeNW7tk6h2LCb7Bjd86GgSSz1r54WswqNDhFJ9SkadPdaDl',
    },
  },
  copy: { ro: ro.copy, en: en.copy, it: it.copy, es: es.copy, fr: fr.copy, de: de.copy },
} as const;

export type SiteLocale = keyof typeof siteData.copy;
export type OpeningDay = (typeof siteData.company.openingHours)[number]['daysOfWeek'][number];
