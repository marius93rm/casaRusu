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
console.log('Rilevamento lingua superato: preferenze browser e varianti regionali, scelta salvata, URL espliciti, query/ancore, storage bloccato e assenza di loop.');
