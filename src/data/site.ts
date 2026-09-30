export const siteData = {
  company: {
    name: 'Restaurant Casa Rusu',
    phone: '+40 732 901 232',
    phoneHref: 'tel:+40732901232',
    address: 'Strada Laterală, nr. 42',
    city: 'Codlea',
    country: 'România',
  },
  theme: {
    background: '#f3ecdf',
    surface: '#fbf7ee',
    text: '#30231b',
    muted: '#75695f',
    primary: '#3b281f',
    accent: '#855b2b',
    border: '#d7c7ae',
  },
  seo: {
    indexable: false,
    ro: {
      title: 'Restaurant Casa Rusu | Codlea',
      description: 'Restaurant Casa Rusu, Strada Laterală nr. 42, Codlea. Gusturi care aduc oamenii împreună.',
    },
    en: {
      title: 'Restaurant Casa Rusu | Codlea',
      description: 'Find Restaurant Casa Rusu at Strada Laterală 42, Codlea. Flavours that bring people together.',
    },
  },
  links: {
    facebook: 'https://www.facebook.com/people/Restaurant-Casa-Rusu/61594316175166/',
    instagram: 'https://www.instagram.com/restaurant.casarusu/',
    map: 'https://www.google.com/maps/search/?api=1&query=Strada+Lateral%C4%83%2C+nr.+42%2C+Codlea%2C+Romania',
  },
  media: {
    logo: '/brand/casa-rusu-logo.jpg',
    cover: '/images/casa-rusu-interior.jpg',
    featuredDish: '/images/casa-rusu-preparat.jpg',
  },
  copy: {
    ro: {
      nav: [
        { label: 'Despre', href: '#poveste' },
        { label: 'Preparat recent', href: '#preparat' },
        { label: 'Contact', href: '#vizita' },
      ],
      hero: {
        eyebrow: 'Restaurant · Codlea',
        titleFirst: 'Gusturi care aduc',
        titleSecond: 'oamenii împreună.',
        description: 'Descoperă Restaurant Casa Rusu și vino să ne găsești pe Strada Laterală, în Codlea.',
        primaryAction: 'Sună pentru rezervare',
        secondaryAction: 'Vezi locația',
        imageAlt: 'Interiorul luminos al Restaurantului Casa Rusu din Codlea, cu mese pregătite și banchete verzi.',
      },
      story: {
        title: 'Un loc pentru gusturi bune și timp împreună.',
        body: '„Gusturi care aduc oamenii împreună” este mesajul Casei Rusu. Te așteptăm în Codlea, la o masă cu oamenii dragi.',
      },
      dish: {
        eyebrow: 'Dintr-o postare recentă',
        title: 'Șnițel din cotlet de porc cu os',
        body: 'O porție generoasă de cartofi prăjiți, pătrunjel, parmezan și usturoi, preparatul prezentat recent de Casa Rusu.',
        note: 'Disponibilitatea și prețul se confirmă direct la restaurant.',
        imageAlt: 'Preparat Casa Rusu cu cotlet de porc, cartofi prăjiți și garnituri.',
        action: 'Vezi pagina oficială',
      },
      visit: {
        titleFirst: 'Hai să ne',
        titleSecond: 'întâlnim la masă.',
        body: 'Sună pentru informații și rezervări, sau deschide harta pentru a ajunge la noi.',
        addressLabel: 'Adresă',
        phoneLabel: 'Telefon',
        mapAction: 'Deschide harta',
      },
      footer: {
        location: 'Codlea · România',
        facebook: 'Facebook',
        instagram: 'Instagram',
      },
    },
    en: {
      nav: [
        { label: 'About', href: '#poveste' },
        { label: 'Recent dish', href: '#preparat' },
        { label: 'Contact', href: '#vizita' },
      ],
      hero: {
        eyebrow: 'Restaurant · Codlea',
        titleFirst: 'Flavours that bring',
        titleSecond: 'people together.',
        description: 'Discover Restaurant Casa Rusu and find us on Strada Laterală in Codlea.',
        primaryAction: 'Call to reserve',
        secondaryAction: 'View location',
        imageAlt: 'The bright interior of Restaurant Casa Rusu in Codlea, with set tables and green banquettes.',
      },
      story: {
        title: 'A place for good food and time together.',
        body: '“Flavours that bring people together” is Casa Rusu’s message. Join us in Codlea for a meal with your favourite people.',
      },
      dish: {
        eyebrow: 'Recently featured',
        title: 'Bone-in pork loin schnitzel',
        body: 'A generous serving of fries with parsley, parmesan and garlic, a dish recently featured by Casa Rusu.',
        note: 'Please call the restaurant to confirm availability and price.',
        imageAlt: 'Casa Rusu dish with pork loin, fries and garnishes.',
        action: 'Visit the official page',
      },
      visit: {
        titleFirst: 'Let’s meet',
        titleSecond: 'around the table.',
        body: 'Call for information or reservations, or open the map for directions.',
        addressLabel: 'Address',
        phoneLabel: 'Phone',
        mapAction: 'Open in Google Maps',
      },
      footer: {
        location: 'Codlea · Romania',
        facebook: 'Facebook',
        instagram: 'Instagram',
      },
    },
  },
} as const;

export type SiteLocale = keyof typeof siteData.copy;
