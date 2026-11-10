const phone = '+40 732 901 232';

export const company = {
  name: 'Restaurant Casa Rusu',
  phone,
  phoneHref: `tel:${phone.replace(/[\s()-]/g, '')}`,
  address: {
    street: 'Strada Laterală',
    houseNumber: '42',
  },
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
} as const;

export function formatCompanyAddress(locale: string) {
  const { street, houseNumber } = company.address;

  if (locale === 'ro') return `${street}, nr. ${houseNumber}`;
  if (locale === 'fr') return `${houseNumber} ${street}`;
  return `${street} ${houseNumber}`;
}

export function interpolateSiteData(text: string, locale: string) {
  const values = {
    address: formatCompanyAddress(locale),
    phone: company.phone,
  };

  return text.replace(/\{(address|phone)\}/g, (_, key: keyof typeof values) => values[key]);
}
