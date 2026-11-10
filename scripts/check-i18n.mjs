import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dictionaries, prefixFor } from './i18n.mjs';
import { locales, defaultLocale, socialLocales } from '../src/i18n/config.ts';
import { getLocaleFromUrl, localizedPath, switchLocalePath, isLocale } from '../src/i18n/paths.ts';
import { company, formatCompanyAddress, interpolateSiteData } from '../src/data/company.ts';

function leaves(value, prefix = '') {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof entry === 'string' ? [[path, entry]] : leaves(entry, path);
  });
}
const base = new Map(leaves(dictionaries[defaultLocale]));
const addressStreet = company.address.street;
const addressNumber = company.address.houseNumber;
const phoneDigits = company.phone.replace(/\D/g, '');
const headerSource = await readFile(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
const homeSource = await readFile(new URL('../src/components/HomePage.astro', import.meta.url), 'utf8');
const shellSource = await readFile(new URL('../src/components/SiteShell.astro', import.meta.url), 'utf8');
const layoutSource = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const styleSource = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const notFoundComponentSource = await readFile(new URL('../src/pages/404.astro', import.meta.url), 'utf8');
const notFoundSource = await readFile(new URL('../dist/404.html', import.meta.url), 'utf8');
assert.match(
  headerSource,
  /targetUrl\.origin !== window\.location\.origin[\s\S]*targetUrl\.pathname !== window\.location\.pathname[\s\S]*!targetUrl\.hash/,
  'Same-page navigation links should be distinguished from route changes',
);
assert.match(
  headerSource,
  /requestAnimationFrame\(\(\) => target\.focus\(\{ preventScroll: true \}\)\)/,
  'Same-page navigation should restore keyboard focus to its destination',
);
assert.match(homeSource, /data-booking-primary/, 'The home page needs a primary booking action to observe');
assert.match(homeSource, /bookingMode="contextual"/, 'The home page should opt into contextual booking visibility');
assert.match(homeSource, /<SiteShell/, 'The home page should use the shared page shell');
assert.match(
  shellSource,
  /data-mobile-booking[\s\S]*hidden=\{bookingMode === 'contextual'\}/,
  'The shared shell should start its contextual booking bar hidden',
);
assert.match(
  shellSource,
  /getBoundingClientRect\(\)/,
  'The shared controller should measure the booking bar and its overlap targets',
);
assert.match(
  shellSource,
  /\.visit-details a, \.visit-details button/,
  'The mobile booking bar should account for every visit action',
);
assert.match(
  shellSource,
  /actionRect\.bottom > bookingBarTop[\s\S]*actionRect\.top < bookingBarBottom[\s\S]*actionRect\.right > 0[\s\S]*actionRect\.left < window\.innerWidth/,
  'Visit action overlap should include the offset booking bar and horizontal viewport boundaries',
);
assert.match(
  shellSource,
  /hideForContent = \(visibleAboveBookingBar \|\| visitPhotoOverlapsBookingBar \|\| visitActionOverlapsBookingBar\)/,
  'Visit actions that overlap the mobile booking bar should hide it',
);
assert.match(
  shellSource,
  /requestAnimationFrame/,
  'The mobile booking position check should be coalesced to animation frames',
);
assert.match(
  shellSource,
  /document\.addEventListener\('keydown', \(\) => scheduleSync\(\)\)/,
  'Keyboard navigation should refresh the mobile booking visibility',
);
assert.match(
  shellSource,
  /!mobileBooking\.contains\(document\.activeElement\)/,
  'A focused mobile booking action must not be hidden',
);
assert.match(shellSource, /--mobile-booking-height/, 'The mobile page should reserve the rendered booking CTA height');
assert.match(
  shellSource,
  /iframe\[title="Powered by Netlify"\]/,
  'The mobile booking bar should recognize the Netlify badge',
);
assert.match(
  shellSource,
  /iframe\[title="Netlify Drawer"\]/,
  'The mobile booking bar should recognize the Netlify Deploy Preview drawer',
);
assert.match(
  shellSource,
  /--mobile-booking-bottom-offset/,
  'The mobile booking bar should reserve space above a viewport-pinned Netlify overlay',
);
assert.match(shellSource, /ResizeObserver/, 'The mobile booking reserve should track CTA size changes');
assert.equal(
  (shellSource.match(/cloneNode\(true\)/g) ?? []).length,
  1,
  'The shared controller should keep a single fallback measurement',
);
assert.doesNotMatch(
  layoutSource,
  /mobile-booking-height|mobile-booking-bottom-offset/,
  'Mobile booking behavior should have one controller in the shared shell',
);
assert.match(
  styleSource,
  /bottom: var\(--mobile-booking-bottom-offset/,
  'The mobile booking CTA should sit above an injected preview badge',
);
const mobileBookingBodyRule =
  styleSource.match(/@media\s*\(max-width:\s*760px\)[\s\S]*?\n\s*body\s*\{([^}]+)\}/)?.[1] ?? '';
assert.match(
  mobileBookingBodyRule,
  /padding-bottom:\s*calc\([\s\S]*--mobile-booking-bottom-offset/,
  'The mobile page should reserve space below the raised booking CTA',
);
const mobileBookingHtmlRule =
  styleSource.match(/@media\s*\(max-width:\s*760px\)[\s\S]*?\n\s*html\s*\{([^}]+)\}/)?.[1] ?? '';
assert.match(
  mobileBookingHtmlRule,
  /scroll-padding-bottom:\s*calc\([\s\S]*--mobile-booking-bottom-offset/,
  'Focused controls should scroll clear of the raised booking CTA',
);
assert.doesNotMatch(
  notFoundComponentSource,
  /not-found-number/,
  'The 404 page should not repeat its error code as text behind the message',
);
assert.deepEqual(Object.keys(dictionaries), [...locales], 'All supported languages need a dictionary');
for (const locale of locales) {
  const dictionary = dictionaries[locale];
  const values = new Map(leaves(dictionary));
  assert.deepEqual([...values.keys()].sort(), [...base.keys()].sort(), `${locale}: incomplete dictionary`);
  for (const [key, value] of values) {
    assert.ok(value.trim(), `${locale}.${key}: empty translation`);
    const placeholders = (text) => [...text.matchAll(/\{\w+\}/g)].map(([token]) => token).sort();
    assert.deepEqual(placeholders(value), placeholders(base.get(key)), `${locale}.${key}: missing interpolation`);
    assert.ok(
      !value.toLocaleLowerCase().includes(addressStreet.toLocaleLowerCase()),
      `${locale}.${key}: street address must come from siteData`,
    );
    assert.ok(
      !value.replace(/\D/g, '').includes(phoneDigits),
      `${locale}.${key}: phone number must come from siteData`,
    );
  }
  assert.match(
    dictionary.copy.hero.description,
    /\{address\}/,
    `${locale}: hero address must use the siteData placeholder`,
  );
  assert.match(dictionary.copy.visit.body, /\{address\}/, `${locale}: visit address must use the siteData placeholder`);
  assert.doesNotMatch(
    dictionary.copy.visit.imageAlt,
    new RegExp(`\\b${addressNumber}\\b`),
    `${locale}: address number must not be hardcoded in image text`,
  );
  assert.equal(
    interpolateSiteData('{address}', locale),
    formatCompanyAddress(locale),
    `${locale}: address placeholder must use siteData and locale formatting`,
  );
  assert.equal(interpolateSiteData('{phone}', locale), company.phone, `${locale}: phone placeholder must use siteData`);
  assert.ok(isLocale(locale));
  for (const route of ['/', '/meniu/', '/preparate/snitel-cotlet-porc/']) {
    const expectedRoute = locale === defaultLocale ? route : `/${locale}${route}`;
    assert.equal(getLocaleFromUrl(new URL(expectedRoute, 'https://example.invalid')), locale);
    assert.equal(localizedPath(route, locale), route === '/' ? expectedRoute : expectedRoute.slice(0, -1));
    for (const from of locales) {
      const fromRoute = from === defaultLocale ? route : `/${from}${route}`;
      const url = new URL(`${fromRoute}?ref=menu#menu-page-porc`, 'https://example.invalid');
      const expected = route === '/' ? expectedRoute : expectedRoute.slice(0, -1);
      assert.equal(
        switchLocalePath(url, locale),
        `${expected}?ref=menu#menu-page-porc`,
        'Language changes must preserve page, query and fragment',
      );
    }
    const html = await readFile(
      new URL(`../dist/${prefixFor(locale)}${route.slice(1)}index.html`, import.meta.url),
      'utf8',
    );
    assert.ok(html.includes(`<html lang="${locale}">`));
    if (route === '/') {
      assert.ok(
        html.includes(formatCompanyAddress(locale)),
        `${locale}: generated home page must contain the formatted siteData address`,
      );
      assert.doesNotMatch(
        html,
        /\{(?:address|phone)\}/,
        `${locale}: siteData placeholders must be rendered at build time`,
      );
    }
    const mobileBookingBars = [
      ...html.matchAll(/<aside\b(?=[^>]*class="mobile-booking")(?=[^>]*data-mobile-booking)[^>]*>/g),
    ].map(([tag]) => tag);
    assert.equal(mobileBookingBars.length, 1, `${locale} ${route}: page should render one shared mobile booking bar`);
    assert.equal(
      mobileBookingBars[0].includes('hidden'),
      route === '/',
      `${locale} ${route}: only the home booking bar should start hidden`,
    );
    const siteHeader = html.match(/<header\b(?=[^>]*class="site-header")[\s\S]*?<\/header>/)?.[0] ?? '';
    assert.ok(
      siteHeader.includes(
        `<span id="external-link-new-tab" class="visually-hidden">${dictionary.ui.opensInNewTab}</span>`,
      ),
      `${locale}: external-link description should be inside the shared header landmark`,
    );
    const newTabLinks = [...html.matchAll(/<a\b(?=[^>]*\btarget="_blank")[^>]*>/g)].map(([tag]) => tag);
    assert.ok(
      newTabLinks.every((tag) => tag.includes('aria-describedby="external-link-new-tab"')),
      `${locale}: links opening a new tab should reference the localized description`,
    );
    if (route === '/') {
      for (const id of ['poveste', 'preparat', 'vizita']) {
        assert.match(
          html,
          new RegExp(`<section\\b(?=[^>]*\\bid="${id}")(?=[^>]*\\btabindex="-1")[^>]*>`),
          `${locale}: in-page navigation target ${id} must be programmatically focusable`,
        );
      }
      assert.match(
        html,
        /<a\b(?=[^>]*data-booking-primary)[^>]*>/,
        `${locale}: home primary booking action must be identifiable`,
      );
      assert.match(
        html,
        /<aside\b(?=[^>]*data-mode="contextual")(?=[^>]*\bhidden)[^>]*>/,
        `${locale}: contextual home booking bar must be hidden until needed`,
      );
    }
    assert.ok(html.includes(`property="og:locale" content="${socialLocales[locale]}"`));
    const switchers = [...html.matchAll(/<details\b[^>]*data-language-switcher[^>]*>([\s\S]*?)<\/details>/g)];
    assert.equal(switchers.length, 2, 'Header and footer need language selection');
    for (const [, switcher] of switchers) {
      assert.equal(
        (switcher.match(/aria-current="page"/g) ?? []).length,
        1,
        'Exactly one language must be marked current',
      );
      for (const target of locales) {
        const link = [...switcher.matchAll(/<a\b([^>]*)>/g)].find(([, attrs]) => attrs.includes(`lang="${target}"`));
        assert.ok(link, `${locale}: missing ${target} language link`);
        const href = link[1].match(/href="([^"]+)"/)?.[1];
        const expected = localizedPath(route, target);
        assert.equal(href, expected, `${locale}: language switch must retain the current page`);
        assert.equal(link[1].includes('aria-current="page"'), target === locale);
      }
    }
    assert.ok(html.includes(dictionary.ui.skipToContent), `${locale}: localized skip link missing`);
  }
}

const germanNotFoundCopy = dictionaries.de.ui.notFound;
assert.match(germanNotFoundCopy.description, /\bKehren Sie\b/, 'German 404 copy should use the formal register');
assert.match(germanNotFoundCopy.body, /\bIhnen\b/, 'German 404 body should address visitors formally');
assert.doesNotMatch(
  `${germanNotFoundCopy.description} ${germanNotFoundCopy.body}`,
  /\b(?:du|dir|dich)\b/i,
  'German 404 copy should not mix informal and formal address',
);

assert.match(notFoundSource, /<html lang="ro">/);
assert.match(notFoundSource, /<meta name="robots" content="noindex,nofollow"\s*\/?\s*>/i);
assert.doesNotMatch(notFoundSource, /<link\b(?=[^>]*\brel="canonical")[^>]*>/i);
assert.doesNotMatch(notFoundSource, /<link\b(?=[^>]*\brel="alternate")(?=[^>]*\bhreflang=)[^>]*>/i);
assert.doesNotMatch(notFoundSource, /data-language-detection/);
const notFoundScript = notFoundSource.match(
  /<script\b(?=[^>]*\bid="not-found-messages")[^>]*>([\s\S]*?)<\/script\s*>/i,
);
assert.ok(notFoundScript, '404 page needs its localized copy map');
const notFoundMessages = JSON.parse(notFoundScript[1]);
assert.deepEqual(Object.keys(notFoundMessages), [...locales]);
for (const locale of locales) {
  assert.deepEqual(
    notFoundMessages[locale],
    {
      ...dictionaries[locale].ui.notFound,
      skipToContent: dictionaries[locale].ui.skipToContent,
      socialLocale: socialLocales[locale],
      imageAlt: dictionaries[locale].copy.hero.imageAlt,
    },
    `${locale}: 404 copy must match the localized dictionary`,
  );
}
for (const invalid of [undefined, '', 'eng', 'ger', 'xx', 'EN']) assert.equal(isLocale(invalid), false);
assert.equal(getLocaleFromUrl(new URL('https://example.invalid/unknown/')), defaultLocale);

// Check future menu edits cannot introduce untranslated terms silently.
const menuTranslations = JSON.parse(
  await readFile(new URL('../src/i18n/menu-translations.json', import.meta.url), 'utf8'),
);
for (const section of ['names', 'ingredients', 'headings']) {
  for (const [term, translations] of Object.entries(menuTranslations[section])) {
    assert.deepEqual(
      Object.keys(translations).sort(),
      locales.filter((locale) => locale !== 'ro').sort(),
      `${section}: ${term}`,
    );
    for (const value of Object.values(translations)) assert.ok(value.trim(), `${section}: ${term}`);
  }
}
console.log(
  'Controllo i18n superato: sei dizionari completi, 108 cambi lingua con query/ancora, 18 pagine, 404 localizzata nelle sei lingue e copertura delle traduzioni del menu.',
);
