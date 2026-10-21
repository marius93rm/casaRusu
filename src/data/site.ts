export const siteData = {
  company: {
    name: 'Restaurant Casa Rusu',
    phone: '+40 732 901 232',
    phoneHref: 'tel:+40732901232',
    address: 'Strada Laterală, nr. 42',
    postalCode: '505100',
    city: 'Codlea',
    country: 'România',
    // Based on the printed menu's explicitly traditional and Italian platters.
    cuisines: ['Romanian', 'Italian'],
    geo: {
      latitude: 45.697789,
      longitude: 25.449737,
    },
    openingHours: [
      { daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '11:00', closes: '22:30' },
      { daysOfWeek: ['Saturday', 'Sunday'], opens: '11:00', closes: '23:00' },
    ],
  },
  theme: {
    background: '#faf8f4',
    surface: '#f1ede6',
    text: '#332c25',
    muted: '#6d655c',
    primary: '#332c25',
    accent: '#805b36',
    border: '#ddd5c9',
  },
  seo: {
    indexable: true,
    ro: {
      title: 'Restaurant Casa Rusu în Codlea | Adresă și program',
      description: 'Meniu Casa Rusu în Codlea: ciorbe de la 25 lei, paste de la 33 lei, carne de la 36 lei, pește de la 55 lei și Platoul Boieresc de 2,4 kg pentru patru persoane.',
    },
    en: {
      title: 'Restaurant Casa Rusu in Codlea | Hours & Location',
      description: 'Casa Rusu menu in Codlea: soups from 25 lei, pasta from 33 lei, meat from 36 lei, fish from 55 lei and a 2.4 kg platter for four.',
    },
  },
  links: {
    facebook: 'https://www.facebook.com/people/Restaurant-Casa-Rusu/61594316175166/',
    instagram: 'https://www.instagram.com/restaurant.casarusu/',
    recentFoodPost: 'https://www.facebook.com/reel/1038477139209678/',
    map: 'https://www.google.com/maps/search/?api=1&query=Strada+Lateral%C4%83%2C+nr.+42%2C+Codlea%2C+Romania',
    googleBusiness: 'https://www.google.com/maps?cid=8243879332869202835',
  },
  media: {
    logo: '/brand/casa-rusu-logo.jpg',
    cover: '/images/casa-rusu-interior.jpg',
    featuredDish: '/images/casa-rusu-preparat.jpg',
    exterior: '/images/casa-rusu-exterior.jpg',
  },
  promotions: {
    cocktailOffer: {
      expiresAt: '2026-12-01T00:00:00+02:00',
      sourceUrl: 'https://www.facebook.com/restaurantcasarusu/posts/pfbid076PQ5RUYNEQqQE92EEYeNW7tk6h2LCb7Bjd86GgSSz1r54WswqNDhFJ9SkadPdaDl',
    },
  },
  copy: {
    ro: {
      nav: [
        { label: 'Meniu', href: '/meniu/' },
        { label: 'Despre', href: '/#poveste' },
        { label: 'Din bucătăria noastră', href: '/#preparat' },
        { label: 'Contact', href: '/#vizita' },
      ],
      menu: {
        eyebrow: 'Meniu',
        title: 'Meniu Restaurant Casa Rusu',
        body: 'Răsfoiește meniul nostru, de la aperitive la deserturi și băuturi. Alege o pagină sau citește preparatele și prețurile pe îndelete.',
        seo: {
          title: 'Meniu Restaurant Casa Rusu Codlea | Preparate și prețuri',
          description: 'Descoperă meniul Restaurant Casa Rusu din Codlea: aperitive, paste, pește, preparate la grătar, deserturi și băuturi, cu ingrediente, cantități și prețuri în lei.',
        },
        dishAction: 'Vezi preparatul',
        backAction: 'Înapoi la meniu',
        offer: {
          eyebrow: 'Ofertă publicată · valabilă până la 30 noiembrie 2026',
          title: '3 cocktailuri + 1 din partea casei',
          body: 'Comandă trei cocktailuri din selecție și îl primești gratuit pe al patrulea:',
          cocktails: ['Disaronno Sour', 'PornStar Martini', 'Aperol Vanilla Sour'],
          callAction: 'Sună pentru detalii și rezervare',
          sourceAction: 'Vezi oferta pe Facebook',
        },
      },
      hero: {
        eyebrow: 'Restaurant · Codlea',
        title: 'Restaurant Casa Rusu în Codlea',
        slogan: 'Gusturi care aduc oamenii împreună!',
        description: 'Ne găsești pe Strada Laterală, nr. 42, în Codlea. Sună-ne și hai la masă!',
        primaryAction: 'Sună-ne pentru o rezervare',
        secondaryAction: 'Vezi locația',
        imageAlt: 'Interiorul luminos al Restaurantului Casa Rusu din Codlea, cu mese pregătite și banchete verzi.',
      },
      story: {
        title: 'La masă, cu oameni dragi.',
        body: 'Meniul aduce ciorbe, gustări tradiționale, paste, pinsa, pește, carne și deserturi. Ciorbele pornesc de la 25 lei, pastele de la 33 lei, carnea de la 36 lei și peștele de la 55 lei. Platoul Boieresc Casa Rusu (2,4 kg, pentru patru persoane) costă 340 lei.',
      },
      dish: {
        eyebrow: 'Din bucătăria noastră',
        title: 'Șnițel din cotlet de porc cu os',
        body: 'Îl pregătim cu o porție serioasă de cartofi prăjiți cu pătrunjel, parmezan și usturoi.',
        seo: {
          title: 'Șnițel din cotlet de porc cu os | Casa Rusu, Codlea',
          description: 'Șnițel din cotlet de porc cu os, cu cartofi prăjiți cu pătrunjel, parmezan și usturoi. Sună la Restaurant Casa Rusu din Codlea pentru disponibilitate și preț.',
        },
        note: 'Sună-ne pentru disponibilitate și preț.',
        imageAlt: 'Preparat Casa Rusu cu cotlet de porc, cartofi prăjiți și garnituri.',
        action: 'Descoperă preparatul',
      },
      visit: {
        titleFirst: 'Hai să ne',
        titleSecond: 'întâlnim la masă!',
        body: 'Sună-ne pentru o rezervare. Ne găsești pe Strada Laterală, nr. 42, în Codlea.',
        addressLabel: 'Adresă',
        phoneLabel: 'Telefon',
        imageAlt: 'Firma Restaurantului Casa Rusu pe fațada clădirii, lângă numărul 42.',
        hoursLabel: 'Program',
        mapAction: 'Deschide harta',
        reviewsAction: 'Citește recenziile pe Google',
      },
      footer: {
        location: 'Codlea · România',
        facebook: 'Facebook',
        instagram: 'Instagram',
      },
    },
    en: {
      nav: [
        { label: 'Menu', href: '/en/meniu/' },
        { label: 'About', href: '/en/#poveste' },
        { label: 'From our kitchen', href: '/en/#preparat' },
        { label: 'Contact', href: '/en/#vizita' },
      ],
      menu: {
        eyebrow: 'Menu',
        title: 'Casa Rusu Restaurant Menu',
        body: 'Browse our menu, from starters to desserts and drinks. Choose a page or take your time reading the dishes and prices in the original Romanian menu.',
        seo: {
          title: 'Casa Rusu Restaurant Menu in Codlea | Dishes & Prices',
          description: 'Browse the Casa Rusu menu in Codlea: starters, pasta, fish, grilled dishes, desserts and drinks. Original Romanian menu with ingredients, portions and prices.',
        },
        dishAction: 'See the dish',
        backAction: 'Back to menu',
        offer: {
          eyebrow: 'Published offer · valid through 30 November 2026',
          title: '3 cocktails + 1 on the house',
          body: 'Order three cocktails from this selection and get the fourth free:',
          cocktails: ['Disaronno Sour', 'PornStar Martini', 'Aperol Vanilla Sour'],
          callAction: 'Call for details and reservations',
          sourceAction: 'See the offer on Facebook',
        },
      },
      hero: {
        eyebrow: 'Restaurant · Codlea',
        title: 'Restaurant Casa Rusu in Codlea',
        slogan: 'Flavours that bring people together!',
        description: 'Find us at Strada Laterală 42 in Codlea. Call us and join us at the table!',
        primaryAction: 'Call us to book a table',
        secondaryAction: 'View location',
        imageAlt: 'The bright interior of Restaurant Casa Rusu in Codlea, with set tables and green banquettes.',
      },
      story: {
        title: 'Come for a good meal. Bring your favourite people.',
        body: 'The menu brings together soups, traditional starters, pasta, pinsa, fish, meat dishes and desserts. Soups start at 25 lei, pasta at 33 lei, meat at 36 lei and fish at 55 lei. The Casa Rusu Boieresc platter (2.4 kg, for four) costs 340 lei.',
      },
      dish: {
        eyebrow: 'From our kitchen',
        title: 'Bone-in pork loin schnitzel',
        body: 'We serve it with a hearty portion of fries topped with parsley, parmesan and garlic.',
        seo: {
          title: 'Bone-in Pork Loin Schnitzel | Casa Rusu, Codlea',
          description: 'Bone-in pork loin schnitzel served with fries topped with parsley, parmesan and garlic. Call Restaurant Casa Rusu in Codlea to check availability and price.',
        },
        note: 'Call us to check availability and price.',
        imageAlt: 'Casa Rusu dish with pork loin, fries and garnishes.',
        action: 'Discover the dish',
      },
      visit: {
        titleFirst: 'Let’s meet',
        titleSecond: 'at the table!',
        body: 'Call us to book a table. Find us at Strada Laterală 42 in Codlea.',
        addressLabel: 'Address',
        phoneLabel: 'Phone',
        imageAlt: 'The Casa Rusu restaurant sign on the outside wall beside number 42.',
        hoursLabel: 'Opening hours',
        mapAction: 'Open in Google Maps',
        reviewsAction: 'Read reviews on Google',
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
export type OpeningDay = (typeof siteData.company.openingHours)[number]['daysOfWeek'][number];
