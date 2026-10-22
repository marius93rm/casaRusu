import { dictionaries, locales, prefixFor } from './i18n.mjs';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { menuSearchMatches, menuSearchQueryParam, normalizeMenuSearchText, updateMenuSearchUrl } from '../src/utils/menuSearch.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const menus = await Promise.all(locales.map((locale) => `${prefixFor(locale)}meniu/index.html`).map(async (file) => ({
  file, html: await readFile(path.join(dist, file), 'utf8'),
})));
const gallerySource = await readFile(path.join(root, 'src/components/MenuGallery.astro'), 'utf8');
const transcriptSource = await readFile(path.join(root, 'src/components/MenuTranscript.astro'), 'utf8');

assert.match(gallerySource, /window\.history\.pushState/, 'Explicit menu navigation must create a shareable history entry');
assert.match(gallerySource, /window\.history\.replaceState/, 'Swipe navigation must update the shareable page without flooding browser history');
assert.match(gallerySource, /window\.addEventListener\('popstate', followLocation\)/, 'Browser back and forward must restore the selected menu page');
assert.match(gallerySource, /window\.addEventListener\('hashchange', followLocation\)/, 'Menu page fragments must open their matching image');
assert.match(gallerySource, /requestAnimationFrame\(\(\) => \{[\s\S]*window\.scrollTo\(\{ top: Math\.max\(0, top\), behavior: 'instant' \}\)/, 'Direct menu links must reveal the page heading below the sticky header');
assert.match(gallerySource, /data-lightbox-previous[\s\S]*data-lightbox-next/, 'The enlarged menu page needs previous and next controls');
assert.match(gallerySource, /const moveLightbox = \(index: number\) => \{[\s\S]*go\(bounded, false, 'push'\)[\s\S]*showLightboxPage\(bounded\)/, 'Lightbox page navigation must update the gallery, URL, and enlarged image together');
assert.match(gallerySource, /dialog\.addEventListener\('keydown'[\s\S]*ArrowLeft[\s\S]*ArrowRight/, 'The enlarged menu pages must support keyboard navigation');

assert.equal(normalizeMenuSearchText('ȚELINĂ'), 'telina', 'Search normalization must ignore Romanian diacritics and case');
assert.equal(normalizeMenuSearchText('ITALIAN'), 'italian', 'Search normalization must not depend on the browser locale');
assert.notEqual('ITALIAN'.toLocaleLowerCase('tr'), normalizeMenuSearchText('ITALIAN'), 'Locale-neutral normalization should remain stable under Turkish case rules');
const sampleMenuItem = 'Salată „Casa Rusu” · piept de rață afumat, mixt salată · 69 lei · 420g · Salate · Meniul';
assert.ok(menuSearchMatches('SALATA', sampleMenuItem), 'Search should match dish names with case and diacritic differences');
assert.ok(menuSearchMatches('rata afumat', sampleMenuItem), 'Search should match ingredients without Romanian diacritics');
assert.ok(menuSearchMatches('afumat rata', sampleMenuItem), 'Search should match all query terms regardless of order');
assert.ok(menuSearchMatches('  RĂȚĂ   afumat  ', sampleMenuItem), 'Search should ignore extra whitespace and diacritics between terms');
assert.equal(menuSearchMatches('rata missing', sampleMenuItem), false, 'Search should require every query term to match');
assert.ok(menuSearchMatches('Salate', sampleMenuItem), 'Search should match a category');
assert.ok(menuSearchMatches('69 lei', sampleMenuItem), 'Search should match a price');
assert.ok(menuSearchMatches('  ', sampleMenuItem), 'An empty search should keep all menu items');
assert.equal(menuSearchMatches('not in this menu', sampleMenuItem), false, 'Search should reject non-matching text');
const sharedMenuUrl = updateMenuSearchUrl('https://example.test/en/meniu/?lang=en&source=share#menu-page-porc', '  afumat rata  ');
assert.equal(sharedMenuUrl.searchParams.get(menuSearchQueryParam), 'afumat rata', 'Search should normalize surrounding whitespace in its share URL');
assert.equal(sharedMenuUrl.searchParams.get('lang'), 'en', 'Search URL updates should preserve unrelated query parameters');
assert.equal(sharedMenuUrl.hash, '#menu-page-porc', 'Search URL updates should preserve the selected scan');
const clearedMenuUrl = updateMenuSearchUrl(sharedMenuUrl.href, '  ');
assert.equal(clearedMenuUrl.searchParams.has(menuSearchQueryParam), false, 'Clearing search should remove its URL parameter');
assert.equal(clearedMenuUrl.searchParams.get('source'), 'share', 'Clearing search should preserve unrelated query parameters');
assert.equal(clearedMenuUrl.hash, '#menu-page-porc', 'Clearing search should preserve the selected scan');
assert.match(transcriptSource, /searchParams\.get\(menuSearchQueryParam\)/, 'The menu should restore a shared query from its URL');
assert.match(transcriptSource, /history\.replaceState\(window\.history\.state, '', nextUrl\.href\)/, 'Typing or clearing a search should update the current URL without adding history entries');
assert.match(transcriptSource, /if \(initialQuery !== null\) input\.dispatchEvent\(new Event\('input'\)\)/, 'A shared query should immediately restore its filtered results');
assert.match(transcriptSource, /if \(searchShortcut\) searchShortcut\.hidden = false/, 'The menu search shortcut should appear only when the search enhancement is available');

let originalItems;
for (const { file, html } of menus) {
  const slides = [...html.matchAll(/<div\b[^>]*id="menu-page-([^"]+)"[^>]*>/g)];
  const enlargeLinks = [...html.matchAll(/<a\b[^>]*data-menu-enlarge[^>]*>/g)].map(([tag]) => tag);
  const transcriptScanLinks = [...html.matchAll(/<a\b[^>]*class="[^"]*menu-transcript-page-scan[^"]*"[^>]*href="#menu-page-([^"]+)"[^>]*>/g)].map(([, id]) => id);
  const transcript = [...html.matchAll(/<li\b[^>]*data-menu-item[^>]*>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
  assert.equal(slides.length, 14, `${file}: all 14 supplied pages must be rendered`);
  assert.equal(enlargeLinks.length, 14, `${file}: all menu images need a direct fallback link`);
  const locale = locales.find((locale) => file === `${prefixFor(locale)}meniu/index.html`);
  const labels = dictionaries[locale].menu;
  assert.ok(html.includes(`data-lightbox-previous aria-label="${labels.previous}"`), `${file}: enlarged gallery needs a localized previous-page control`);
  assert.ok(html.includes(`data-lightbox-next aria-label="${labels.next}"`), `${file}: enlarged gallery needs a localized next-page control`);
  assert.ok(enlargeLinks.every((tag) => /\bhref="\/images\/menu\/[^\"]+"/.test(tag) && !/\baria-haspopup\s*=/.test(tag)), `${file}: static fallback links must target their image without claiming a dialog`);
  assert.equal(new Set(slides.map((match) => match[1])).size, 14, `${file}: page IDs must be unique`);
  assert.equal(transcript.length, 200, `${file}: all 200 printed items must be present in the static HTML`);
  assert.equal((html.match(/<details\b[^>]*id="read-/g) ?? []).length, 13, `${file}: all 13 content pages need a text alternative`);
  assert.deepEqual(transcriptScanLinks, slides.slice(1).map(([, id]) => id), `${file}: every transcript page needs a link to its matching scan`);
  assert.match(html, /<search\b[^>]*aria-label="[^"]+"[^>]*hidden[^>]*data-menu-search/, `${file}: search should be available as progressive enhancement`);
  assert.match(html, /<label for="menu-dish-search">[^<]+<\/label>[\s\S]*?<input\b[^>]*type="search"[^>]*aria-controls="menu-transcript-pages"/, `${file}: search needs an associated label and results target`);
  const searchShortcut = html.match(/<a\b(?=[^>]*data-menu-search-link)[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
  assert.match(searchShortcut, /href="#menu-dish-search"/, `${file}: the menu gallery should offer a direct route to dish search`);
  assert.match(searchShortcut, /\shidden(?:="")?(?:\s|>)/, `${file}: the search shortcut must stay hidden when scripts are unavailable`);
  assert.ok(searchShortcut.includes(labels.searchLabel), `${file}: dish search shortcut should be localized`);
  assert.match(html, /data-menu-search-status[^>]*role="status"[^>]*aria-live="polite"/, `${file}: search results must be announced politely`);
  assert.ok(html.includes(`<ul lang="${locale}">`), `${file}: translated content needs its language declared`);
  assert.doesNotMatch(html, /Meniul complet urmează|full menu (?:is )?coming soon/i, `${file}: outdated placeholder`);
  assert.match(html, /href="\/(?:(?:en|it|es|fr|de)\/)?preparate\/snitel-cotlet-porc\/?"/, `${file}: keep the special dish page linked`);
  const commercialData = transcript.map((row) => ({
    price: row.match(/class="menu-item-price">([^<]+)/)?.[1],
    quantity: row.match(/class="menu-item-quantity">([^<]+)/)?.[1],
  }));
  if (originalItems) assert.deepEqual(commercialData, originalItems, 'All locales must preserve printed portions, prices and ordering');
  else originalItems = commercialData;
  for (const [, id] of slides) {
    assert.match(html, new RegExp(`href="#menu-page-${id}"`), `${file}: missing index link for ${id}`);
    assert.ok(html.includes(`/images/menu/${id}-480.avif`), `${file}: missing responsive AVIF source for ${id}`);
    for (const filename of [
      `${id}.jpg`,
      ...[480, 800, 1200, 1448].flatMap((width) => [`${id}-${width}.webp`, `${id}-${width}.avif`]),
    ]) {
      assert.ok((await stat(path.join(dist, 'images/menu', filename))).size > 0, `Missing menu asset: ${filename}`);
    }
  }
  for (const row of transcript) {
    assert.match(row, /<h4>[^<]+<\/h4>/, `${file}: item missing its name`);
    assert.match(row, /class="menu-item-price">[1-9]\d* lei</, `${file}: invalid printed price`);
    assert.match(row, /class="menu-item-quantity">[^<]+</, `${file}: item missing its printed portion`);
  }
}

for (const locale of locales) {
  const prefix = prefixFor(locale);
  const html = await readFile(path.join(dist, prefix, 'index.html'), 'utf8');
  const menuHref = `/${prefix}meniu/`;
  const hero = html.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.ok(hero.includes(`href="${menuHref}"`), `${prefix || 'RO'} home: hero must link to localized menu`);
  assert.match(html, /id="menu-preview-title"/, 'Home needs its visual menu preview');
  for (const id of ['coperta', 'aperitive']) {
    assert.ok(html.includes(`/images/menu/${id}-480.avif`), `${prefix || 'RO'} home: menu preview is missing AVIF for ${id}`);
  }
  assert.ok(html.includes(`href="/${prefix}preparate/snitel-cotlet-porc"`), 'Home must retain the special dish link');
  const dishHtml = await readFile(path.join(dist, prefix, 'preparate/snitel-cotlet-porc/index.html'), 'utf8');
  const dishCopy = {
    label: dictionaries[locale].copy.dish.menuListingLabel,
    note: dictionaries[locale].copy.dish.menuListingNote,
    action: dictionaries[locale].copy.dish.menuListingAction,
  };
  const dishMenuHref = `/${prefix}meniu/#menu-page-porc`;
  assert.ok(dishHtml.includes(`id="dish-menu-listing-title">${dishCopy.label}</p>`), `${prefix || 'RO'} dish: printed-menu price must be clearly labelled`);
  assert.match(dishHtml, /class="dish-menu-listing-price">\s*<span>300g<\/span>\s*<strong>54 lei<\/strong>/, `${prefix || 'RO'} dish: show the printed schnitzel portion and price`);
  assert.ok(dishHtml.includes(dishCopy.note), `${prefix || 'RO'} dish: distinguish the printed listing from the serving shown here`);
  assert.ok(dishHtml.includes(`href="${dishMenuHref}"`) && dishHtml.includes(dishCopy.action), `${prefix || 'RO'} dish: link directly to the schnitzel menu page`);
}
console.log('Controllo menu superato: 14 pagine, 200 voci tradotte nelle sei lingue con quantità e prezzi identici, ricerca accessibile e condivisibile, deep link sincronizzati, asset responsive e collegamenti home/schede speciali.');
