import { locales, prefixFor, homeFor, localeFor, unlocalizedRoute } from './i18n.mjs';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist');
const errors = [];
const localOrigin = 'http://casa-rusu.local';

function report(file, message) {
  errors.push(`${file}: ${message}`);
}

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (code[0] === '#') {
      const numeric = code[1].toLowerCase() === 'x'
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(numeric) && numeric <= 0x10ffff
        ? String.fromCodePoint(numeric)
        : entity;
    }

    return {
      amp: '&',
      quot: '"',
      apos: "'",
      lt: '<',
      gt: '>',
    }[code.toLowerCase()];
  });
}

function parseAttributes(source) {
  const attributes = {};
  const expression = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;

  while ((match = expression.exec(source))) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

function openingTags(html, names) {
  const expression = new RegExp(`<(${names})\\b([^>]*)>`, 'gi');
  const tags = [];
  let match;

  while ((match = expression.exec(html))) {
    tags.push({ name: match[1].toLowerCase(), attributes: parseAttributes(match[2]) });
  }

  return tags;
}

function routeFromFile(relativeFile) {
  const normalized = relativeFile.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -'index.html'.length)}`;
  return `/${normalized.slice(0, -'.html'.length)}`;
}

async function findHtmlFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = path.join(prefix, entry.name);
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(fullPath, relative));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(relative);
  }

  return files;
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function resolveOutputPath(urlPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    return undefined;
  }

  const candidate = path.resolve(outputDirectory, `.${decodedPath}`);
  if (!candidate.startsWith(`${outputDirectory}${path.sep}`) && candidate !== outputDirectory) return undefined;

  const candidates = decodedPath.endsWith('/')
    ? [path.join(candidate, 'index.html')]
    : [candidate, path.join(candidate, 'index.html'), `${candidate}.html`];

  for (const filePath of candidates) {
    if (await fileExists(filePath)) return filePath;
  }

  return undefined;
}

function normalizedText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

async function getConfiguredSiteUrl() {
  const environmentSiteUrl = process.env.SITE_URL?.trim();
  if (environmentSiteUrl) return environmentSiteUrl;

  const source = await readFile(path.join(projectRoot, 'src/config/site.ts'), 'utf8');
  const match = source.match(/\bsiteUrl\s*:\s*(['"])(.*?)\1/s);
  if (!match) throw new Error('Non riesco a leggere siteConfig.seo.siteUrl come stringa letterale in src/config/site.ts.');
  return match[2].trim();
}

function parseUrl(value, base) {
  try {
    return new URL(value, base);
  } catch {
    return undefined;
  }
}

function singleMetaContent(page, attribute, key) {
  const matches = page.metaTags.filter((tag) => tag[attribute]?.toLowerCase() === key);
  if (matches.length !== 1) {
    report(page.relativeFile, `atteso un solo meta ${key}, trovati ${matches.length}.`);
    return undefined;
  }

  const content = matches[0].content?.trim();
  if (!content) report(page.relativeFile, `meta ${key} senza contenuto.`);
  return content;
}

function sourceCandidates(srcset) {
  return srcset.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]).filter(Boolean);
}

function responsiveCandidates(image, format) {
  const stem = image.replace(/\.jpe?g$/i, '');
  const widths = format === 'avif' ? [640, 768, 960, 1280] : [640, 960, 1280];
  return widths.map((width) => `${stem}-${width}.${format} ${width}w`).join(', ');
}

async function main() {
  if (!(await fileExists(path.join(outputDirectory, 'index.html')))) {
    throw new Error('dist/index.html non esiste: esegui prima `npm run build`.');
  }

  const configuredSiteUrl = await getConfiguredSiteUrl();
  let productionOrigin;
  if (configuredSiteUrl) {
    const configuredUrl = parseUrl(configuredSiteUrl);
    if (!configuredUrl) throw new Error(`seo.siteUrl non è un URL valido: ${configuredSiteUrl}`);
    if (configuredUrl.protocol !== 'https:') report('src/config/site.ts', 'seo.siteUrl deve usare HTTPS.');
    if (configuredUrl.pathname !== '/' || configuredUrl.search || configuredUrl.hash) {
      report('src/config/site.ts', 'seo.siteUrl deve contenere solo l’origine, senza percorso, query o fragment.');
    }
    productionOrigin = configuredUrl.origin;
  }

  const relativeFiles = (await findHtmlFiles(outputDirectory)).sort();
  if (relativeFiles.length === 0) throw new Error('Nessun file HTML trovato in dist/.');

  const pages = [];
  const restaurantEntities = [];
  for (const relativeFile of relativeFiles) {
    const fullPath = path.join(outputDirectory, relativeFile);
    const html = await readFile(fullPath, 'utf8');
    const route = routeFromFile(relativeFile);
    const isNotFound = route === '/404';
    const htmlTag = openingTags(html, 'html')[0];
    const expectedLanguage = localeFor(route);
    const metaTags = openingTags(html, 'meta').map((tag) => tag.attributes);
    const linkTags = openingTags(html, 'link').map((tag) => tag.attributes);
    const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
    const titles = titleMatches.map((match) => normalizedText(match[1])).filter(Boolean);
    const metadata = {
      title: titles[0] ?? '',
      description: metaTags.find((tag) => tag.name?.toLowerCase() === 'description')?.content?.trim() ?? '',
      ogTitle: metaTags.find((tag) => tag.property?.toLowerCase() === 'og:title')?.content?.trim() ?? '',
      ogDescription: metaTags.find((tag) => tag.property?.toLowerCase() === 'og:description')?.content?.trim() ?? '',
      twitterTitle: metaTags.find((tag) => tag.name?.toLowerCase() === 'twitter:title')?.content?.trim() ?? '',
      twitterDescription: metaTags.find((tag) => tag.name?.toLowerCase() === 'twitter:description')?.content?.trim() ?? '',
    };

    const robotsTags = metaTags.filter((tag) => tag.name?.toLowerCase() === 'robots');
    if (isNotFound) {
      if (robotsTags.length !== 1 || robotsTags[0].content?.toLowerCase() !== 'noindex,nofollow') {
        report(relativeFile, 'la pagina 404 deve avere un solo meta robots noindex,nofollow.');
      }
    } else if (productionOrigin) {
      if (robotsTags.length > 0) report(relativeFile, 'le pagine di produzione non devono avere meta robots noindex.');
    } else if (robotsTags.length !== 1 || robotsTags[0].content?.toLowerCase() !== 'noindex,nofollow') {
      report(relativeFile, 'le pagine senza SITE_URL devono dichiarare meta robots noindex,nofollow.');
    }

    if (!htmlTag?.attributes.lang?.trim()) report(relativeFile, 'attributo lang mancante su <html>.');
    else if (htmlTag.attributes.lang.toLowerCase() !== expectedLanguage) {
      report(relativeFile, `lang="${htmlTag.attributes.lang}" non corrisponde alla lingua attesa "${expectedLanguage}".`);
    }

    const primaryNavigationMatch = html.match(/<nav\b(?=[^>]*\bid=["']main-navigation["'])[^>]*>\s*<ul>([\s\S]*?)<\/ul>/i);
    if (isNotFound) {
      if (linkTags.some((tag) => tag.rel?.toLowerCase().split(/\s+/).includes('canonical') || tag.hreflang)) {
        report(relativeFile, 'la pagina 404 non deve dichiarare canonical o hreflang.');
      }
      if (metaTags.some((tag) => tag.property?.toLowerCase() === 'og:url') || /data-language-detection/i.test(html)) {
        report(relativeFile, 'la pagina 404 non deve pubblicare una URL canonica social né attivare il redirect della lingua.');
      }
    } else if (!primaryNavigationMatch) {
      report(relativeFile, 'lista della navigazione principale mancante.');
    } else {
      const primaryLinks = [...primaryNavigationMatch[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)]
        .map(([, rawAttributes]) => parseAttributes(rawAttributes));
      const expectedMenuPath = `/${prefixFor(expectedLanguage)}meniu/`;
      const menuLink = primaryLinks.find((attributes) => attributes.href === expectedMenuPath);
      const shouldMarkMenuCurrent = route === expectedMenuPath;

      if (!menuLink) report(relativeFile, `link ${expectedMenuPath} mancante nella navigazione principale.`);
      else if ((menuLink['aria-current'] === 'page') !== shouldMarkMenuCurrent) {
        report(relativeFile, `aria-current del link ${expectedMenuPath} non corrisponde alla rotta ${route}.`);
      }

      const currentPages = primaryLinks.filter((attributes) => attributes['aria-current'] === 'page');
      if (currentPages.length !== Number(shouldMarkMenuCurrent)) {
        report(relativeFile, `atteso ${Number(shouldMarkMenuCurrent)} link corrente nella navigazione principale, trovati ${currentPages.length}.`);
      }
    }

    if (titleMatches.length !== 1 || !metadata.title) report(relativeFile, `atteso un solo <title> non vuoto, trovati ${titleMatches.length}.`);
    for (const [name, value] of Object.entries(metadata).slice(1)) {
      const isOpenGraph = name === 'ogTitle' || name === 'ogDescription';
      const attribute = isOpenGraph ? 'property' : 'name';
      const key = name.replace(/[A-Z]/g, (letter) => `:${letter.toLowerCase()}`).toLowerCase();
      const matches = metaTags.filter((tag) => tag[attribute]?.toLowerCase() === key);
      if (matches.length !== 1 || !value) report(relativeFile, `atteso un solo meta ${key} non vuoto, trovati ${matches.length}.`);
    }

    const descriptionTags = metaTags.filter((tag) => tag.name?.toLowerCase() === 'description');
    if (descriptionTags.length !== 1 || !metadata.description) {
      report(relativeFile, `atteso un solo meta description non vuoto, trovati ${descriptionTags.length}.`);
    }

    const ids = new Set();
    const htmlWithoutRawText = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
    const idExpression = /<[a-z][a-z\d:-]*\b([^>]*)>/gi;
    let idMatch;
    while ((idMatch = idExpression.exec(htmlWithoutRawText))) {
      const id = parseAttributes(idMatch[1]).id;
      if (id) ids.add(id);
    }

    const jsonLd = [];
    const parsedJsonLd = [];
    const scriptExpression = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptExpression.exec(html))) {
      const attributes = parseAttributes(scriptMatch[1]);
      if (attributes.type?.toLowerCase() === 'application/ld+json') jsonLd.push(scriptMatch[2].trim());
    }
    for (const [index, block] of jsonLd.entries()) {
      try {
        const parsed = JSON.parse(block);
        if (!parsed || typeof parsed !== 'object') throw new Error('il valore JSON non è un oggetto o un array');
        parsedJsonLd.push(parsed);
      } catch (error) {
        report(relativeFile, `JSON-LD ${index + 1} non valido: ${error.message}.`);
      }
    }

    if (route === homeFor(expectedLanguage)) {
      const directionsLinks = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)]
        .map(([, rawAttributes, innerHtml]) => ({ attributes: parseAttributes(rawAttributes), label: normalizedText(innerHtml) }))
        .filter(({ attributes }) => Object.hasOwn(attributes, 'data-map-directions'));
      const expectedDirectionsLabels = {
        ro: 'Cum ajungi la noi',
        en: 'Get directions',
        it: 'Indicazioni stradali',
        es: 'Cómo llegar',
        fr: 'Itinéraire',
        de: 'Route planen',
      };
      if (directionsLinks.length !== 1) {
        report(relativeFile, `atteso un solo link per le indicazioni Google Maps, trovati ${directionsLinks.length}.`);
      } else {
        const [{ attributes, label }] = directionsLinks;
        const directionsUrl = parseUrl(attributes.href);
        if (!directionsUrl || directionsUrl.protocol !== 'https:' || directionsUrl.hostname !== 'www.google.com'
          || directionsUrl.pathname !== '/maps/dir/' || directionsUrl.searchParams.get('api') !== '1'
          || directionsUrl.searchParams.get('destination') !== '45.697789,25.449737') {
          report(relativeFile, 'Il link visita deve aprire Google Maps Directions con il pin verificato di Casa Rusu come destinazione.');
        }
        if (label !== expectedDirectionsLabels[expectedLanguage]) {
          report(relativeFile, `Il link alle indicazioni deve essere localizzato: atteso "${expectedDirectionsLabels[expectedLanguage]}".`);
        }
      }

      const restaurant = parsedJsonLd.find((entry) => entry['@type'] === 'Restaurant');
      if (!restaurant) {
        report(relativeFile, 'JSON-LD Restaurant mancante sulla homepage.');
      } else {
        restaurantEntities.push({ route, relativeFile, restaurant });

        if (restaurant['@context'] !== 'https://schema.org') {
          report(relativeFile, 'JSON-LD Restaurant.@context deve essere https://schema.org.');
        }

        if (typeof restaurant.name !== 'string' || !restaurant.name.trim()) {
          report(relativeFile, 'JSON-LD Restaurant.name deve essere valorizzato.');
        }

        const normalizeTelephone = (value) => typeof value === 'string'
          ? value.replace(/[^\d+]/g, '')
          : '';
        const phoneDigits = normalizeTelephone(restaurant.telephone);
        if (!/^\+[1-9]\d{7,14}$/.test(phoneDigits)) {
          report(relativeFile, 'JSON-LD Restaurant.telephone deve includere un prefisso internazionale e un numero valido.');
        }

        const telephoneLinks = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)]
          .map(([, rawAttributes, innerHtml]) => {
            const href = parseAttributes(rawAttributes).href ?? '';
            return href.toLowerCase().startsWith('tel:')
              ? { number: normalizeTelephone(href.slice(4)), text: normalizedText(innerHtml) }
              : undefined;
          })
          .filter(Boolean);
        if (telephoneLinks.length === 0 || telephoneLinks.some((link) => link.number !== phoneDigits)) {
          report(relativeFile, 'JSON-LD Restaurant.telephone deve corrispondere a tutti i link telefonici della homepage.');
        }
        if (!telephoneLinks.some((link) => link.number === phoneDigits && normalizeTelephone(link.text) === phoneDigits)) {
          report(relativeFile, 'JSON-LD Restaurant.telephone deve essere visibile nel testo di un link telefonico della homepage.');
        }

        const address = restaurant.address;
        if (!address || address['@type'] !== 'PostalAddress') {
          report(relativeFile, 'JSON-LD Restaurant.address deve usare PostalAddress.');
        } else {
          for (const field of ['streetAddress', 'addressLocality', 'postalCode', 'addressCountry']) {
            if (typeof address[field] !== 'string' || !address[field].trim()) {
              report(relativeFile, `JSON-LD Restaurant.address.${field} deve essere valorizzato.`);
            }
          }
        }

        const openingHours = Array.isArray(restaurant.openingHoursSpecification)
          ? restaurant.openingHoursSpecification
          : restaurant.openingHoursSpecification ? [restaurant.openingHoursSpecification] : [];
        const daysOfWeek = new Set([
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
        ].map((day) => `https://schema.org/${day}`));
        if (openingHours.length === 0) {
          report(relativeFile, 'JSON-LD Restaurant.openingHoursSpecification deve contenere almeno un gruppo orario.');
        }
        for (const hours of openingHours) {
          const validObject = hours && typeof hours === 'object';
          const days = validObject
            ? Array.isArray(hours.dayOfWeek) ? hours.dayOfWeek : [hours.dayOfWeek]
            : [];
          if (!validObject || hours['@type'] !== 'OpeningHoursSpecification' || days.length === 0
            || days.some((day) => !daysOfWeek.has(day))
            || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hours.opens)
            || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hours.closes)) {
            report(relativeFile, 'Ogni gruppo di openingHoursSpecification deve contenere giorni Schema.org e orari HH:mm validi.');
          }
        }

        if (restaurant.acceptsReservations !== true) {
          report(relativeFile, 'JSON-LD Restaurant.acceptsReservations deve riflettere la prenotazione telefonica dichiarata sul sito.');
        }

        const expectedCuisines = ['Romanian', 'Italian'];
        if (!Array.isArray(restaurant.servesCuisine)
          || restaurant.servesCuisine.length !== expectedCuisines.length
          || expectedCuisines.some((cuisine) => !restaurant.servesCuisine.includes(cuisine))) {
          report(relativeFile, 'JSON-LD Restaurant.servesCuisine deve includere i tipi di cucina documentati nel menu.');
        }

        if (restaurant.priceRange !== '2–340 lei' || restaurant.priceRange.length >= 100) {
          report(relativeFile, 'JSON-LD Restaurant.priceRange deve riflettere l’intero intervallo del menu fornito e restare sotto 100 caratteri.');
        }

        const geo = restaurant.geo;
        if (!geo || geo['@type'] !== 'GeoCoordinates') {
          report(relativeFile, 'JSON-LD Restaurant senza geo GeoCoordinates.');
        } else {
          for (const [coordinate, minimum, maximum] of [
            ['latitude', -90, 90],
            ['longitude', -180, 180],
          ]) {
            const value = geo[coordinate];
            const precision = typeof value === 'number' ? String(value).split('.')[1]?.length ?? 0 : 0;
            if (!Number.isFinite(value) || value < minimum || value > maximum || precision < 5) {
              report(relativeFile, `JSON-LD Restaurant.geo.${coordinate} deve essere un numero valido con almeno 5 decimali.`);
            }
          }
        }

        if (!Array.isArray(restaurant.sameAs) || restaurant.sameAs.length < 3) {
          report(relativeFile, 'JSON-LD Restaurant.sameAs deve includere Facebook, Instagram e Google Maps.');
        } else {
          const profiles = restaurant.sameAs.map((value) => parseUrl(value));
          if (profiles.some((profile) => !profile || profile.protocol !== 'https:')) {
            report(relativeFile, 'JSON-LD Restaurant.sameAs deve contenere URL HTTPS assoluti.');
          }
          const hosts = new Set(profiles.filter(Boolean).map((profile) => profile.hostname));
          if (!hosts.has('www.facebook.com')) report(relativeFile, 'JSON-LD Restaurant.sameAs non include il profilo Facebook.');
          if (!hosts.has('www.instagram.com')) report(relativeFile, 'JSON-LD Restaurant.sameAs non include il profilo Instagram.');
          if (!profiles.some((profile) => profile?.hostname === 'www.google.com'
            && profile.pathname === '/maps' && profile.searchParams.has('cid'))) {
            report(relativeFile, 'JSON-LD Restaurant.sameAs non include la scheda Google Maps con CID.');
          }
          if (new Set(profiles.filter(Boolean).map((profile) => profile.href)).size !== restaurant.sameAs.length) {
            report(relativeFile, 'JSON-LD Restaurant.sameAs contiene URL duplicati.');
          }
        }

        const mapUrl = parseUrl(restaurant.hasMap);
        if (!mapUrl || mapUrl.protocol !== 'https:' || mapUrl.hostname !== 'www.google.com'
          || mapUrl.pathname !== '/maps' || !mapUrl.searchParams.has('cid')
          || !Array.isArray(restaurant.sameAs) || !restaurant.sameAs.includes(restaurant.hasMap)) {
          report(relativeFile, 'JSON-LD Restaurant.hasMap deve puntare alla scheda Google Maps HTTPS verificata inclusa in sameAs.');
        }

        if (productionOrigin) {
          const expectedRestaurantId = new URL('/#restaurant', productionOrigin).toString();
          if (restaurant['@id'] !== expectedRestaurantId) {
            report(relativeFile, `JSON-LD Restaurant.@id deve essere ${expectedRestaurantId}.`);
          }

          const expectedRestaurantUrl = new URL('/', productionOrigin).toString();
          if (restaurant.url !== expectedRestaurantUrl) {
            report(relativeFile, `JSON-LD Restaurant.url deve essere ${expectedRestaurantUrl}.`);
          }

          const restaurantImages = Array.isArray(restaurant.image) ? restaurant.image : [];
          if (restaurantImages.length < 3) {
            report(relativeFile, 'JSON-LD Restaurant.image deve contenere almeno tre immagini.');
          }
          for (const imageValue of restaurantImages) {
            const imageUrl = parseUrl(imageValue);
            if (!imageUrl || imageUrl.origin !== productionOrigin || imageUrl.search || imageUrl.hash) {
              report(relativeFile, 'JSON-LD Restaurant.image deve contenere URL assoluti senza query o fragment sull’origine di produzione.');
            } else if (!(await resolveOutputPath(imageUrl.pathname))) {
              report(relativeFile, `JSON-LD Restaurant.image non punta a un asset generato: ${imageUrl.pathname}.`);
            }
          }

          const logoUrl = parseUrl(restaurant.logo);
          if (!logoUrl || logoUrl.origin !== productionOrigin || logoUrl.search || logoUrl.hash) {
            report(relativeFile, 'JSON-LD Restaurant.logo deve essere un URL assoluto sull’origine di produzione.');
          } else if (!(await resolveOutputPath(logoUrl.pathname))) {
            report(relativeFile, `JSON-LD Restaurant.logo non punta a un asset generato: ${logoUrl.pathname}.`);
          }

          const expectedMenuPath = `/${prefixFor(expectedLanguage)}meniu/`;
          const menuUrl = parseUrl(restaurant.menu);
          if (!menuUrl || menuUrl.origin !== productionOrigin || menuUrl.pathname !== expectedMenuPath
            || menuUrl.search || menuUrl.hash) {
            report(relativeFile, `JSON-LD Restaurant.menu deve puntare a ${productionOrigin}${expectedMenuPath}.`);
          } else if (!(await resolveOutputPath(menuUrl.pathname))) {
            report(relativeFile, `JSON-LD Restaurant.menu non punta a una pagina HTML generata: ${menuUrl.pathname}.`);
          }
        }
      }
    }

    pages.push({ relativeFile, fullPath, html, route, expectedLanguage, metadata, ids, metaTags, linkTags });
  }

  const romanianRestaurant = restaurantEntities.find((entry) => entry.route === '/');
  for (const translatedRestaurant of restaurantEntities.filter((entry) => entry.route !== '/')) {
    if (!romanianRestaurant) continue;
    // These fields identify the same physical business in both locales. `menu`
    // is intentionally excluded because it points to a localized page.
    for (const field of [
      '@context', '@type', '@id', 'name', 'url', 'telephone', 'acceptsReservations', 'servesCuisine', 'priceRange',
      'address', 'geo', 'hasMap', 'openingHoursSpecification', 'sameAs', 'image', 'logo',
    ]) {
      if (JSON.stringify(romanianRestaurant.restaurant[field]) !== JSON.stringify(translatedRestaurant.restaurant[field])) {
        report(translatedRestaurant.relativeFile, `JSON-LD Restaurant.${field} deve essere uguale alla homepage rumena per la stessa attività.`);
      }
    }
  }

  for (const field of ['title', 'description']) {
    const seen = new Map();
    for (const page of pages) {
      const value = page.metadata[field].replace(/\s+/g, ' ').trim().toLocaleLowerCase();
      if (!value) continue;
      if (seen.has(value)) report(page.relativeFile, `${field} duplicato anche in ${seen.get(value)}.`);
      else seen.set(value, page.relativeFile);
    }
  }

  for (const locale of locales) {
    for (const suffix of ['', 'meniu/', 'preparate/snitel-cotlet-porc/']) {
      const expected = `${homeFor(locale)}${suffix}`;
      if (!pages.some((page) => page.route === expected)) report('dist/', `pagina localizzata mancante: ${expected}.`);
    }
  }

  const pagesByFile = new Map(pages.map((page) => [path.resolve(page.fullPath), page]));
  const baseOrigin = productionOrigin ?? localOrigin;
  for (const page of pages) {
    const base = new URL(page.route, baseOrigin);
    const contentRoute = unlocalizedRoute(page.route);
    const expectedResponsivePhotoCount = contentRoute === '/'
      ? 3
      : ['/meniu/', '/preparate/snitel-cotlet-porc/'].includes(contentRoute) ? 1 : 0;
    const responsivePictures = [...page.html.matchAll(/<picture\b(?=[^>]*\bdata-responsive-photo=["']true["'])[^>]*>[\s\S]*?<\/picture\s*>/gi)];
    if (responsivePictures.length !== expectedResponsivePhotoCount) {
      report(page.relativeFile, `attese ${expectedResponsivePhotoCount} foto del ristorante responsive, trovate ${responsivePictures.length}.`);
    }

    for (const [index, [markup]] of responsivePictures.entries()) {
      const sources = openingTags(markup, 'source').map((tag) => tag.attributes);
      const image = openingTags(markup, 'img')[0]?.attributes;
      const expectedImage = image?.src;
      const expectedTypes = ['image/avif', 'image/webp'];
      if (sources.length !== expectedTypes.length || sources.some((source, sourceIndex) => source.type !== expectedTypes[sourceIndex])) {
        report(page.relativeFile, `foto responsive ${index + 1}: attese le alternative AVIF e WebP nell’ordine previsto.`);
      }
      if (!expectedImage?.startsWith('/images/') || !expectedImage.endsWith('.jpg') || image.width !== '2048' || image.height !== '1366') {
        report(page.relativeFile, `foto responsive ${index + 1}: deve mantenere il JPEG originale da 2048×1366 come fallback e dimensione intrinseca.`);
      }

      for (const [sourceIndex, source] of sources.entries()) {
        const format = sourceIndex === 0 ? 'avif' : 'webp';
        if (source.srcset !== responsiveCandidates(expectedImage ?? '', format)) {
          report(page.relativeFile, `foto responsive ${index + 1}: srcset ${format.toUpperCase()} non corrispondente alle varianti generate.`);
        }
        if (source.sizes !== '(max-width: 760px) calc(100vw - 2.5rem), min(44vw, 40rem)') {
          report(page.relativeFile, `foto responsive ${index + 1}: dimensione visualizzata non sincronizzata con il layout.`);
        }
      }

      const shouldPreload = ['/','/preparate/snitel-cotlet-porc/'].includes(contentRoute) && index === 0;
      if (shouldPreload) {
        const preload = page.linkTags.find((tag) => tag.rel?.toLowerCase().split(/\s+/).includes('preload')
          && tag.as?.toLowerCase() === 'image' && tag.type === 'image/avif');
        if (!preload || preload.imagesrcset !== sources[0]?.srcset || preload.imagesizes !== sources[0]?.sizes) {
          report(page.relativeFile, `preload responsive ${index + 1}: deve corrispondere all’alternativa AVIF e alle sue sizes.`);
        }
      }
    }

    const tags = openingTags(page.html, 'a|area|link|img|source|script|iframe|video|audio|track|embed|object');
    for (const meta of page.metaTags) {
      if (['og:url', 'og:image'].includes(meta.property?.toLowerCase()) || meta.name?.toLowerCase() === 'twitter:image') {
        if (meta.content) tags.push({ name: 'meta', attributes: { content: meta.content } });
      }
    }
    for (const tag of tags) {
      const attributes = tag.attributes;
      const refs = [];
      if ((tag.name === 'a' || tag.name === 'area' || tag.name === 'link') && attributes.href) refs.push(attributes.href);
      if (['img', 'source', 'script', 'iframe', 'video', 'audio', 'track', 'embed'].includes(tag.name) && attributes.src) refs.push(attributes.src);
      if (tag.name === 'object' && attributes.data) refs.push(attributes.data);
      if (tag.name === 'meta' && attributes.content) refs.push(attributes.content);
      if ((tag.name === 'img' || tag.name === 'source') && attributes.srcset) refs.push(...sourceCandidates(attributes.srcset));

      for (const reference of refs) {
        if (/^(?:data:|mailto:|tel:|javascript:|blob:)/i.test(reference)) continue;
        const url = parseUrl(reference, base);
        if (!url) {
          report(page.relativeFile, `URL interno non valido: ${reference}`);
          continue;
        }
        if (url.origin !== baseOrigin) continue;

        const targetFile = await resolveOutputPath(url.pathname);
        if (!targetFile) {
          report(page.relativeFile, `destinazione interna inesistente: ${reference}`);
          continue;
        }
        if (url.hash) {
          const targetPage = pagesByFile.get(path.resolve(targetFile));
          let fragment;
          try {
            fragment = decodeURIComponent(url.hash.slice(1));
          } catch {
            fragment = url.hash.slice(1);
          }
          if (targetPage && !targetPage.ids.has(fragment)) {
            report(page.relativeFile, `fragment #${fragment} non trovato in ${targetPage.relativeFile}.`);
          }
        }
      }
    }
  }

  if (productionOrigin) {
    const pagesByRoute = new Map(pages.map((page) => [page.route, page]));
    const pagesByCanonical = new Map();
    for (const page of pages) {
      if (page.route === '/404') continue;
      const contentRoute = unlocalizedRoute(page.route);
      const expectedSocialImage = contentRoute === '/'
        ? { path: '/images/casa-rusu-interior.jpg', width: '2048', height: '1366' }
        : contentRoute === '/meniu/'
          ? { path: '/images/menu/coperta.jpg', width: '1448', height: '2048' }
          : { path: '/images/casa-rusu-preparat.jpg', width: '2048', height: '1366' };
      const socialImage = singleMetaContent(page, 'property', 'og:image');
      const twitterImage = singleMetaContent(page, 'name', 'twitter:image');
      const socialImageAlt = singleMetaContent(page, 'property', 'og:image:alt');
      const twitterImageAlt = singleMetaContent(page, 'name', 'twitter:image:alt');
      const socialImageWidth = singleMetaContent(page, 'property', 'og:image:width');
      const socialImageHeight = singleMetaContent(page, 'property', 'og:image:height');
      const socialImageUrl = socialImage ? parseUrl(socialImage) : undefined;

      if (!socialImageUrl || socialImageUrl.origin !== productionOrigin) {
        report(page.relativeFile, `og:image deve essere un URL assoluto su ${productionOrigin}.`);
      } else {
        if (socialImageUrl.pathname !== expectedSocialImage.path) {
          report(page.relativeFile, `og:image attesa ${expectedSocialImage.path}, trovata ${socialImageUrl.pathname}.`);
        }
        if (!(await resolveOutputPath(socialImageUrl.pathname))) {
          report(page.relativeFile, `asset og:image inesistente: ${socialImageUrl.pathname}.`);
        }
      }
      if (twitterImage !== socialImage) report(page.relativeFile, 'twitter:image deve corrispondere a og:image.');
      if (!socialImageAlt) report(page.relativeFile, 'og:image:alt deve descrivere l’immagine social.');
      if (socialImageAlt && twitterImageAlt !== socialImageAlt) {
        report(page.relativeFile, 'twitter:image:alt deve corrispondere a og:image:alt.');
      }
      if (socialImageWidth !== expectedSocialImage.width || socialImageHeight !== expectedSocialImage.height) {
        report(page.relativeFile, `dimensioni social attese: ${expectedSocialImage.width}×${expectedSocialImage.height}.`);
      }

      const canonicalTags = page.linkTags.filter((tag) => tag.rel?.toLowerCase().split(/\s+/).includes('canonical'));
      if (canonicalTags.length !== 1) {
        report(page.relativeFile, `atteso un canonical, trovati ${canonicalTags.length}.`);
        continue;
      }

      const canonical = parseUrl(canonicalTags[0].href ?? '');
      const expectedCanonical = `${productionOrigin}${page.route}`;
      if (!canonical || canonical.href !== expectedCanonical) {
        report(page.relativeFile, `canonical atteso ${expectedCanonical}, trovato ${canonicalTags[0].href ?? '(assente)'}.`);
      } else if (pagesByCanonical.has(canonical.href)) {
        report(page.relativeFile, `canonical duplicato anche in ${pagesByCanonical.get(canonical.href)}.`);
      } else {
        pagesByCanonical.set(canonical.href, page.relativeFile);
      }

      const alternateTags = page.linkTags.filter((tag) => tag.rel?.toLowerCase().split(/\s+/).includes('alternate') && tag.hreflang);
      const alternates = new Map();
      for (const alternate of alternateTags) {
        const language = alternate.hreflang.toLowerCase();
        if (alternates.has(language)) report(page.relativeFile, `hreflang duplicato: ${alternate.hreflang}.`);
        alternates.set(language, alternate.href);
      }

      const romanianRoute = unlocalizedRoute(page.route);
      const expectedAlternates = Object.fromEntries(locales.map((locale) => [
        locale === 'ro' ? 'ro-ro' : locale,
        `${productionOrigin}${locale === 'ro' ? romanianRoute : `/${locale}${romanianRoute}`}`,
      ]));
      expectedAlternates['x-default'] = `${productionOrigin}${romanianRoute}`;
      for (const [language, expectedHref] of Object.entries(expectedAlternates)) {
        if (alternates.get(language) !== expectedHref) {
          report(page.relativeFile, `hreflang ${language} atteso ${expectedHref}, trovato ${alternates.get(language) ?? '(assente)'}.`);
        }
        const targetRoute = new URL(expectedHref).pathname;
        if (!pagesByRoute.has(targetRoute)) report(page.relativeFile, `pagina hreflang mancante per ${language}: ${targetRoute}.`);
      }
      for (const language of alternates.keys()) {
        if (!(language in expectedAlternates)) report(page.relativeFile, `hreflang non previsto: ${language}.`);
      }
    }

    const sitemapIndexPath = path.join(outputDirectory, 'sitemap-index.xml');
    if (!(await fileExists(sitemapIndexPath))) {
      report('dist/', 'sitemap-index.xml assente nonostante seo.siteUrl configurato.');
    } else {
      const sitemapIndex = await readFile(sitemapIndexPath, 'utf8');
      const sitemapUrls = [...sitemapIndex.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeEntities(match[1].trim()));
      if (!/<sitemapindex\b/i.test(sitemapIndex) || sitemapUrls.length === 0) {
        report('dist/sitemap-index.xml', 'indice sitemap vuoto o malformato.');
      }

      const indexedPageUrls = new Set();
      for (const sitemapUrl of sitemapUrls) {
        const url = parseUrl(sitemapUrl);
        if (!url || url.origin !== productionOrigin) {
          report('dist/sitemap-index.xml', `URL sitemap non appartenente all’origine configurata: ${sitemapUrl}.`);
          continue;
        }
        const sitemapPath = await resolveOutputPath(url.pathname);
        if (!sitemapPath || !sitemapPath.endsWith('.xml')) {
          report('dist/sitemap-index.xml', `file sitemap figlio mancante: ${sitemapUrl}.`);
          continue;
        }
        const sitemap = await readFile(sitemapPath, 'utf8');
        if (!/<urlset\b/i.test(sitemap)) {
          report(path.relative(projectRoot, sitemapPath), 'sitemap figlio senza elemento <urlset>.');
          continue;
        }
        for (const match of sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
          const pageUrl = decodeEntities(match[1].trim());
          if (indexedPageUrls.has(pageUrl)) report(path.relative(projectRoot, sitemapPath), `URL sitemap duplicato: ${pageUrl}.`);
          indexedPageUrls.add(pageUrl);
        }
      }

      if ([...indexedPageUrls].some((pageUrl) => ['/404', '/404/'].includes(new URL(pageUrl).pathname))) {
        report('dist/sitemap-index.xml', 'la pagina 404 noindex non deve essere inclusa nella sitemap.');
      }

      for (const page of pages) {
        if (page.route === '/404') continue;
        const expectedUrl = `${productionOrigin}${page.route}`;
        if (!indexedPageUrls.has(expectedUrl)) report('dist/sitemap-index.xml', `URL pagina mancante nella sitemap: ${expectedUrl}.`);
      }
    }
  }

  if (errors.length) {
    console.error(`Controllo SEO non superato (${errors.length} problemi):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  const mode = productionOrigin ? `origine ${productionOrigin}, canonical/hreflang/sitemap attivi` : 'modalità locale, SEO di produzione in attesa di seo.siteUrl';
  console.log(`Controllo SEO superato: ${pages.length} pagine HTML, metadati distinti, lingue, link/asset interni e JSON-LD validi; ${mode}.`);
}

main().catch((error) => {
  console.error(`Controllo SEO non eseguito: ${error.message}`);
  process.exitCode = 1;
});
