import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { locales, defaultLocale, languagePreferenceKey } from '../src/i18n/config.ts';

const source = await readFile(new URL('../src/i18n/detect-language.js', import.meta.url), 'utf8');
const origin = 'https://example.invalid';
function detect(options = {}) {
  const { path = '/', saved = null, blocked = false } = options;
  const languages = 'languages' in options ? options.languages : ['it-IT'];
  const language = 'language' in options ? options.language : 'it-IT';
  const redirects = [];
  const context = {
    URL,
    document: { currentScript: { dataset: { locales: JSON.stringify(locales), defaultLocale, preferenceKey: languagePreferenceKey } } },
    navigator: { languages, language },
    window: {
      location: { href: `${origin}${path}`, replace: (url) => redirects.push(url) },
      get localStorage() {
        if (blocked) throw new Error('Storage denied');
        return { getItem: (key) => { assert.equal(key, languagePreferenceKey); return saved; } };
      },
    },
  };
  vm.runInNewContext(source, context);
  assert.ok(redirects.length <= 1, 'No repeated redirects');
  return redirects[0] ?? null;
}

for (const locale of locales) {
  const suffix = '?source=menu#menu-page-porc';
  for (const path of ['/', '/meniu/', '/preparate/snitel-cotlet-porc/']) {
    const expected = locale === defaultLocale ? null : `${origin}/${locale}${path}${suffix}`;
    assert.equal(detect({ path: `${path}${suffix}`, languages: [`${locale.toUpperCase()}-XX`] }), expected);
    assert.equal(detect({ path: `${path}${suffix}`, saved: locale, languages: ['fr-CA'] }), expected, 'A manual preference wins');
  }
  if (locale !== defaultLocale) {
    for (const saved of locales) {
      assert.equal(detect({ path: `/${locale}/meniu/?source=menu#menu-page-porc`, saved }), null, 'An explicit locale URL must remain shareable');
    }
  }
}
assert.equal(detect({ languages: ['nl-NL', 'fr-CA', 'de-DE'] }), `${origin}/fr/`, 'Respect browser language order');
assert.equal(detect({ languages: ['ro-RO', 'it-IT'] }), null, 'The first supported language may be the default');
assert.equal(detect({ languages: ['nl-NL', 'pt-BR'] }), null, 'Unsupported languages fall back to Romanian');
assert.equal(detect({ languages: [], language: 'es-MX' }), `${origin}/es/`, 'Support navigator.language fallback');
assert.equal(detect({ languages: undefined, language: 'de-DE' }), `${origin}/de/`);
assert.equal(detect({ languages: [], language: undefined }), null);
assert.equal(detect({ languages: ['en_US'] }), `${origin}/en/`);
assert.equal(detect({ saved: 'invalid', languages: ['de-DE'] }), `${origin}/de/`, 'Ignore an invalid saved preference');
assert.equal(detect({ blocked: true }), `${origin}/it/`, 'Detection works with blocked storage');
assert.equal(detect({ blocked: true, path: '/fr/meniu/' }), null, 'Explicit URLs work with blocked storage');
assert.equal(detect({ blocked: true, path: '/meniu/?lang=ro#read-menu' }), null, 'An explicit Romanian choice survives blocked storage');
assert.equal(detect({ path: '/?lang=invalid', languages: ['en-GB'] }), `${origin}/en/?lang=invalid`);
const redirect = detect({ path: '/meniu/?source=qr#menu-page-porc' });
assert.equal(detect({ path: new URL(redirect).pathname + new URL(redirect).search + new URL(redirect).hash }), null, 'A redirected page cannot loop');

// Test the script as emitted, including the configuration passed by Astro.
for (const prefix of ['', 'en/', 'it/', 'es/', 'fr/', 'de/']) {
  for (const route of ['', 'meniu/', 'preparate/snitel-cotlet-porc/']) {
    const html = await readFile(new URL(`../dist/${prefix}${route}index.html`, import.meta.url), 'utf8');
    const script = html.match(/<script\b([^>]*data-language-detection[^>]*)>([\s\S]*?)<\/script>/);
    assert.ok(script, 'Every page needs automatic language detection');
    assert.ok(html.indexOf('data-language-detection') < html.indexOf('</head>'), 'Detect before rendering the body');
    assert.ok(!/\btype="module"/.test(script[1]), 'Language detection must execute immediately');
    assert.ok(script[1].includes(`data-preference-key="${languagePreferenceKey}"`));
    assert.ok(script[1].includes(`data-default-locale="${defaultLocale}"`));
    assert.equal(script[2].trim(), source.trim(), 'The tested script must match the shipped script');
  }
}

const notFoundHtml = await readFile(new URL('../dist/404.html', import.meta.url), 'utf8');
const htmlScripts = [...notFoundHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
const messagesScript = htmlScripts.find(([, attributes]) => attributes.includes('id="not-found-messages"'));
const notFoundScript = htmlScripts.find(([, , body]) => body.includes("document.querySelector('#not-found-messages')"));
assert.ok(messagesScript && notFoundScript, 'The built 404 needs its message map and language resolver');
const notFoundMessages = JSON.parse(messagesScript[2]);
const notFoundResolver = notFoundScript[2];

class TestElement {
  constructor() { this.attributes = new Map(); this.dataset = {}; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
}
class TestHTMLElement extends TestElement {}
class TestScriptElement extends TestHTMLElement {
  constructor(textContent) { super(); this.textContent = textContent; }
}
class TestMetaElement extends TestHTMLElement {
  constructor() { super(); this.content = ''; }
}
class TestAnchorElement extends TestHTMLElement {
  constructor(href = '') { super(); this.href = href; }
}

function resolveNotFound({ path = '/missing/', search = '', saved = null, blocked = false, languages = ['ro-RO'], language = 'ro-RO' } = {}) {
  const pageUrl = new URL(`${path}${search}`, origin);
  const copyElements = Object.fromEntries(
    ['skipToContent', 'eyebrow', 'title', 'description', 'body', 'homeAction', 'menuAction', 'callAction']
      .map((key) => [key, Object.assign(new TestHTMLElement(), { dataset: { copy: key }, textContent: '' })]),
  );
  const metas = new Map([
    'meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]',
    'meta[property="og:locale"]', 'meta[property="og:image:alt"]', 'meta[name="twitter:title"]',
    'meta[name="twitter:description"]', 'meta[name="twitter:image:alt"]',
  ].map((selector) => [selector, new TestMetaElement()]));
  const home = new TestAnchorElement('/');
  const menu = new TestAnchorElement('/meniu/');
  const brand = new TestAnchorElement('/');
  const languageNav = new TestHTMLElement();
  const languageLinks = locales.map((locale) => Object.assign(new TestAnchorElement(), { dataset: { locale } }));
  const state = { saved };
  const document = {
    title: 'Pagina nu a fost găsită | Restaurant Casa Rusu',
    documentElement: { lang: 'ro' },
    querySelector(selector) {
      if (selector === '#not-found-messages') return new TestScriptElement(JSON.stringify(notFoundMessages));
      if (selector === '.not-found-screen') return new TestHTMLElement();
      if (selector === '#not-found-home') return home;
      if (selector === '#not-found-menu') return menu;
      if (selector === '.not-found-header .brand') return brand;
      if (selector === '.not-found-languages') return languageNav;
      return metas.get(selector) ?? null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-copy]') return Object.values(copyElements);
      if (selector === '.not-found-languages [data-locale]') return languageLinks;
      return [];
    },
  };
  const window = {
    location: { pathname: pageUrl.pathname, search: pageUrl.search },
  };
  Object.defineProperty(window, 'localStorage', {
    get() {
      if (blocked) throw new Error('Storage denied');
      return {
        getItem: (key) => { assert.equal(key, languagePreferenceKey); return state.saved; },
        setItem: (key, value) => { assert.equal(key, languagePreferenceKey); state.saved = value; },
      };
    },
  });
  vm.runInNewContext(notFoundResolver, {
    document, window, navigator: { languages, language }, URLSearchParams,
    HTMLScriptElement: TestScriptElement,
    HTMLElement: TestHTMLElement,
    HTMLMetaElement: TestMetaElement,
    HTMLAnchorElement: TestAnchorElement,
  });
  return { locale: document.documentElement.lang, title: document.title, home, menu, brand, languageNav, languageLinks, copyElements, state };
}

for (const locale of locales) {
  const route = `/${locale}/missing/`;
  const pageLocale = resolveNotFound({ path: route, saved: 'en', languages: ['de-DE'] });
  assert.equal(pageLocale.locale, locale, `${locale}: an explicit 404 path should outrank a saved/browser language`);
  assert.equal(pageLocale.home.href, locale === defaultLocale ? '/' : `/${locale}/`);
  assert.equal(pageLocale.menu.href, locale === defaultLocale ? '/meniu/' : `/${locale}/meniu/`);
  assert.equal(pageLocale.brand.href, pageLocale.home.href);
  assert.equal(pageLocale.title, notFoundMessages[locale].metaTitle);
  assert.equal(pageLocale.copyElements.title.textContent, notFoundMessages[locale].title);
  assert.equal(pageLocale.languageNav.attributes.get('aria-label'), notFoundMessages[locale].language);
  assert.deepEqual(pageLocale.languageLinks.filter((link) => link.attributes.get('aria-current') === 'page').map((link) => link.dataset.locale), [locale]);

  const queryLocale = resolveNotFound({ path: '/it/missing/', search: `?lang=${locale}`, saved: 'en', languages: ['de-DE'] });
  assert.equal(queryLocale.locale, locale, `${locale}: a valid language query should outrank the URL prefix`);
  const savedLocale = resolveNotFound({ path: '/missing/', search: '?lang=invalid', saved: locale, languages: ['de-DE'] });
  assert.equal(savedLocale.locale, locale, `${locale}: the saved choice should be used without a supported URL locale`);
  const browserLocale = resolveNotFound({ path: '/missing/', saved: 'invalid', languages: ['nl-NL', `${locale.toUpperCase()}-XX`] });
  assert.equal(browserLocale.locale, locale, `${locale}: browser language is the final fallback`);
}

assert.equal(resolveNotFound({ path: '/fr/missing/', search: '?lang=de', saved: 'en', blocked: true }).locale, 'de', 'A query choice should work when storage is blocked');
assert.equal(resolveNotFound({ path: '/fr/missing/', saved: 'en', blocked: true, languages: ['de-DE'] }).locale, 'fr', 'An explicit path should work when storage is blocked');
assert.equal(resolveNotFound({ path: '/missing/', saved: 'en', blocked: true, languages: ['es-ES'] }).locale, 'es', 'Browser fallback should work when storage is blocked');
console.log('Rilevamento lingua superato: pagine normali e 404, precedenza query/percorso/preferenza/browser, sei lingue, storage bloccato e link di recupero localizzati.');
