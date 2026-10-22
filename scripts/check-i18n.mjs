import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dictionaries, prefixFor } from './i18n.mjs';
import { locales, defaultLocale, socialLocales } from '../src/i18n/config.ts';
import { getLocaleFromUrl, localizedPath, switchLocalePath, isLocale } from '../src/i18n/paths.ts';

function leaves(value, prefix = '') {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof entry === 'string' ? [[path, entry]] : leaves(entry, path);
  });
}
const base = new Map(leaves(dictionaries[defaultLocale]));
const headerSource = await readFile(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
assert.match(headerSource, /targetUrl\.origin !== window\.location\.origin[\s\S]*targetUrl\.pathname !== window\.location\.pathname[\s\S]*!targetUrl\.hash/, 'Same-page navigation links should be distinguished from route changes');
assert.match(headerSource, /requestAnimationFrame\(\(\) => target\.focus\(\{ preventScroll: true \}\)\)/, 'Same-page navigation should restore keyboard focus to its destination');
assert.deepEqual(Object.keys(dictionaries), [...locales], 'All supported languages need a dictionary');
for (const locale of locales) {
  const dictionary = dictionaries[locale];
  const values = new Map(leaves(dictionary));
  assert.deepEqual([...values.keys()].sort(), [...base.keys()].sort(), `${locale}: incomplete dictionary`);
  for (const [key, value] of values) {
    assert.ok(value.trim(), `${locale}.${key}: empty translation`);
    const placeholders = (text) => [...text.matchAll(/\{\w+\}/g)].map(([token]) => token).sort();
    assert.deepEqual(placeholders(value), placeholders(base.get(key)), `${locale}.${key}: missing interpolation`);
  }
  assert.ok(isLocale(locale));
  for (const route of ['/', '/meniu/', '/preparate/snitel-cotlet-porc/']) {
    const expectedRoute = locale === defaultLocale ? route : `/${locale}${route}`;
    assert.equal(getLocaleFromUrl(new URL(expectedRoute, 'https://example.invalid')), locale);
    assert.equal(localizedPath(route, locale), route === '/' ? expectedRoute : expectedRoute.slice(0, -1));
    for (const from of locales) {
      const fromRoute = from === defaultLocale ? route : `/${from}${route}`;
      const url = new URL(`${fromRoute}?ref=menu#menu-page-porc`, 'https://example.invalid');
      const expected = route === '/' ? expectedRoute : expectedRoute.slice(0, -1);
      assert.equal(switchLocalePath(url, locale), `${expected}?ref=menu#menu-page-porc`, 'Language changes must preserve page, query and fragment');
    }
    const html = await readFile(new URL(`../dist/${prefixFor(locale)}${route.slice(1)}index.html`, import.meta.url), 'utf8');
    assert.ok(html.includes(`<html lang="${locale}">`));
    if (route === '/') {
      for (const id of ['poveste', 'preparat', 'vizita']) {
        assert.match(html, new RegExp(`<section\\b(?=[^>]*\\bid="${id}")(?=[^>]*\\btabindex="-1")[^>]*>`), `${locale}: in-page navigation target ${id} must be programmatically focusable`);
      }
    }
    assert.ok(html.includes(`property="og:locale" content="${socialLocales[locale]}"`));
    const switchers = [...html.matchAll(/<details\b[^>]*data-language-switcher[^>]*>([\s\S]*?)<\/details>/g)];
    assert.equal(switchers.length, 2, 'Header and footer need language selection');
    for (const [, switcher] of switchers) {
      assert.equal((switcher.match(/aria-current="page"/g) ?? []).length, 1, 'Exactly one language must be marked current');
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
for (const invalid of [undefined, '', 'eng', 'ger', 'xx', 'EN']) assert.equal(isLocale(invalid), false);
assert.equal(getLocaleFromUrl(new URL('https://example.invalid/unknown/')), defaultLocale);

// Check future menu edits cannot introduce untranslated terms silently.
const menuTranslations = JSON.parse(await readFile(new URL('../src/i18n/menu-translations.json', import.meta.url), 'utf8'));
for (const section of ['names', 'ingredients', 'headings']) {
  for (const [term, translations] of Object.entries(menuTranslations[section])) {
    assert.deepEqual(Object.keys(translations).sort(), locales.filter((locale) => locale !== 'ro').sort(), `${section}: ${term}`);
    for (const value of Object.values(translations)) assert.ok(value.trim(), `${section}: ${term}`);
  }
}
console.log('Controllo i18n superato: sei dizionari completi, segnaposto, 108 cambi lingua con query/ancora, 18 pagine e copertura delle traduzioni del menu.');
