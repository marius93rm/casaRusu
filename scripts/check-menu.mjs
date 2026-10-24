import { dictionaries, locales, prefixFor } from './i18n.mjs';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { menuCategoryQueryParam, menuPriceLimitQueryParam, menuSearchMatches, menuSearchQueryParam, normalizeMenuSearchText, parseMenuCategory, parseMenuPriceLimit, updateMenuSearchUrl } from '../src/utils/menuSearch.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const menus = await Promise.all(locales.map((locale) => `${prefixFor(locale)}meniu/index.html`).map(async (file) => ({
  file, html: await readFile(path.join(dist, file), 'utf8'),
})));
const gallerySource = await readFile(path.join(root, 'src/components/MenuGallery.astro'), 'utf8');
const transcriptSource = await readFile(path.join(root, 'src/components/MenuTranscript.astro'), 'utf8');
const menuStyles = await readFile(path.join(root, 'src/styles/menu.css'), 'utf8');
const globalStyles = await readFile(path.join(root, 'src/styles/global.css'), 'utf8');
assert.match(globalStyles, /\.button-outline\s*\{[^}]*background:\s*transparent;/, 'Outline buttons should not inherit low-contrast browser button-face backgrounds');
assert.match(menuStyles, /\.menu-gallery\[data-enhanced\] \.menu-gallery-track\s*\{[^}]*overflow-x:\s*auto;/, 'The gallery must remain natively horizontally scrollable');
assert.match(menuStyles, /@media \(max-width: 760px\)\s*\{[\s\S]*?\.menu-gallery\[data-enhanced\] \.menu-gallery-track\s*\{[^}]*scrollbar-width:\s*none;/, 'Mobile gallery may hide its visual scrollbar while keeping native scroll enabled');
assert.match(menuStyles, /\.menu-gallery\[data-enhanced\] \.menu-gallery-track::-webkit-scrollbar\s*\{[^}]*display:\s*none;/, 'WebKit mobile fallback should hide the gallery scrollbar');
assert.match(transcriptSource, /searchParams\.get\(menuPriceLimitQueryParam\)/, 'The menu should restore a shared price limit from its URL');
assert.match(transcriptSource, /setAttribute\('aria-valuetext', priceLimitOutput\.textContent\)/, 'Screen readers should hear the localized price and currency for the range value');

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
assert.equal(parseMenuPriceLimit(null, 340), 340, 'Missing price limits should include every price');
assert.equal(parseMenuPriceLimit('55', 340), 55, 'A shared price limit should be restored');
assert.equal(parseMenuPriceLimit('-5', 340), 0, 'Negative price limits should clamp to zero');
assert.equal(parseMenuPriceLimit('500', 340), 340, 'Price limits above the menu maximum should clamp to its maximum');
assert.equal(parseMenuPriceLimit('invalid', 340), 340, 'Invalid shared price limits should fall back to all prices');
const validCategories = new Set(['aperitive-1', 'paste-peste-2']);
assert.equal(parseMenuCategory('aperitive-1', validCategories), 'aperitive-1', 'A shared category should be restored when it matches an available menu section');
assert.equal(parseMenuCategory('unknown-section', validCategories), '', 'Unknown shared categories should not filter the menu');
assert.equal(parseMenuCategory(null, validCategories), '', 'A missing category should include every section');
const sharedMenuUrl = updateMenuSearchUrl('https://example.test/en/meniu/?lang=en&source=share#menu-page-porc', '  afumat rata  ', 55, 340, 'aperitive-1');
assert.equal(sharedMenuUrl.searchParams.get(menuSearchQueryParam), 'afumat rata', 'Search should normalize surrounding whitespace in its share URL');
assert.equal(sharedMenuUrl.searchParams.get(menuPriceLimitQueryParam), '55', 'A selected price limit should be shareable');
assert.equal(sharedMenuUrl.searchParams.get(menuCategoryQueryParam), 'aperitive-1', 'A selected category should be shareable');
assert.equal(sharedMenuUrl.searchParams.get('lang'), 'en', 'Search URL updates should preserve unrelated query parameters');
assert.equal(sharedMenuUrl.hash, '#menu-page-porc', 'Search URL updates should preserve the selected scan');
const clearedMenuUrl = updateMenuSearchUrl(sharedMenuUrl.href, '  ', 55, 340, 'aperitive-1');
assert.equal(clearedMenuUrl.searchParams.has(menuSearchQueryParam), false, 'Clearing search should remove its URL parameter');
assert.equal(clearedMenuUrl.searchParams.get(menuPriceLimitQueryParam), '55', 'Clearing search should preserve the price limit');
assert.equal(clearedMenuUrl.searchParams.get(menuCategoryQueryParam), 'aperitive-1', 'Clearing search should preserve the selected category');
assert.equal(clearedMenuUrl.searchParams.get('source'), 'share', 'Clearing search should preserve unrelated query parameters');
assert.equal(clearedMenuUrl.hash, '#menu-page-porc', 'Clearing search should preserve the selected scan');
const resetMenuUrl = updateMenuSearchUrl(clearedMenuUrl.href, '', 340, 340, '');
assert.equal(resetMenuUrl.searchParams.has(menuPriceLimitQueryParam), false, 'Resetting the price limit should remove its URL parameter');
assert.equal(resetMenuUrl.searchParams.has(menuCategoryQueryParam), false, 'Resetting the category should remove its URL parameter');
assert.match(transcriptSource, /searchParams\.get\(menuSearchQueryParam\)/, 'The menu should restore a shared query from its URL');
assert.match(transcriptSource, /searchParams\.get\(menuPriceLimitQueryParam\)/, 'The menu should restore a shared price limit from its URL');
assert.match(transcriptSource, /searchParams\.get\(menuCategoryQueryParam\)/, 'The menu should restore a shared category from its URL');
assert.match(transcriptSource, /categoryMatches = !selectedCategory \|\| item\.dataset\.menuCategory === selectedCategory/, 'The selected category should constrain menu results');
assert.match(transcriptSource, /updateMenuSearchUrl\(currentUrl, input\.value, priceLimit\.value, maximumMenuPrice, categoryFilter\.value\)/, 'The selected category should be included in the share URL');
assert.match(transcriptSource, /navigator\.clipboard\.writeText\(window\.location\.href\)/, 'The menu should copy the current shareable result URL');
assert.match(transcriptSource, /shareButton\.hidden = !filtersAreActive \|\| !window\.isSecureContext \|\| !navigator\.clipboard\?\.writeText/, 'The copy control should be available only for active filters in a secure context with Clipboard API support');
assert.match(transcriptSource, /searchActions\.hidden = !filtersAreActive/, 'Sharing and reset controls should stay out of the layout until filters are active');
assert.match(transcriptSource, /searchShareCopied[\s\S]*searchShareFailed/, 'The copy action should provide localized success and permission failure feedback');
assert.match(transcriptSource, /history\.replaceState\(window\.history\.state, '', nextUrl\.href\)/, 'Typing or clearing a search should update the current URL without adding history entries');
assert.match(transcriptSource, /if \(\(initialQuery\?\.trim\(\) \|\| initialCategory \|\| initialPriceLimit < maximumMenuPrice\) && !window\.location\.hash\) \{\s*search\.scrollIntoView\(\{ block: 'start' \}\);\s*\}/, 'Shared search filters should restore their results and bring them into view unless a fragment points elsewhere');
assert.match(transcriptSource, /document\.querySelectorAll<HTMLAnchorElement>\('\[data-menu-search-link\]'\)\.forEach\(\(link\) => \{\s*link\.hidden = false;/, 'Menu search shortcuts should appear only when the search enhancement is available');

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
  assert.match(html, new RegExp(`<button\\b(?=[^>]*data-menu-print)(?=[^>]*hidden)[^>]*>${labels.printMenu}<\\/button>`), `${file}: print action should be localized and hidden until its behavior is available`);
  const transcriptPrices = [...html.matchAll(/<li\b[^>]*data-menu-item[^>]*data-menu-price="(\d+)"[^>]*>([\s\S]*?)<\/li>/g)];
  assert.equal(transcriptPrices.length, 200, 'All printed prices should be available to the filter');
  assert.match(html, /<details class="menu-category-filter"[^>]*data-menu-category-filter-details/, `${file}: category filter should be collapsible`);
  assert.match(html, new RegExp(`<label class="visually-hidden" for="menu-category-filter">${labels.categoryFilter}<\\/label>`), `${file}: category select should have a localized label`);
  const categoryOptions = [...html.matchAll(/<option\b[^>]*data-menu-category-option[^>]*>/g)].map(([tag]) => tag.match(/\bvalue="([^"]+)"/)?.[1]);
  const itemCategories = [...html.matchAll(/<li\b[^>]*data-menu-item[^>]*data-menu-category="([^"]+)"/g)].map(([, category]) => category);
  assert.equal(categoryOptions.length, 33, `${file}: all 33 printed menu sections should be selectable`);
  assert.equal(new Set(categoryOptions).size, 33, `${file}: category values should uniquely identify each printed section`);
  assert.deepEqual([...new Set(itemCategories)].sort(), [...categoryOptions].sort(), `${file}: every menu item should belong to one selectable section`);
  assert.ok(html.includes(labels.categoryFilter) && html.includes(labels.categoryAll), `${file}: category filter labels should be localized`);
  assert.match(html, /<details class="menu-price-filter"[^>]*data-price-limit-filter/, 'The maximum price filter should be progressively enhanced and collapsible');
  assert.match(html, /<label class="visually-hidden" for="menu-price-limit">[^<]+<\/label>[\s\S]*?<input\b(?=[^>]*type="range")(?=[^>]*data-menu-price-limit)[^>]*>/, 'The price range should have an accessible label');
  assert.ok(html.includes(labels.priceLimit) && html.includes(labels.priceLimitAll) && html.includes(labels.priceLimitUpTo), 'Price filter labels should be localized');
  assert.match(html, /<div\b(?=[^>]*class="menu-search-actions")(?=[^>]*data-menu-search-actions)(?=[^>]*hidden)[^>]*>/, `${file}: search actions should remain hidden until filters are active`);
  assert.match(html, new RegExp(`<button class="menu-search-reset"[^>]*data-menu-search-reset[^>]*hidden[^>]*>${labels.searchReset}</button>`), `${file}: reset filters should be localized and hidden until filters are active`);
  assert.match(html, new RegExp(`<button class="menu-search-share"[^>]*data-menu-search-share[^>]*hidden[^>]*>${labels.searchShare}</button>`), `${file}: sharing current results should be localized and hidden until filters are active`);
  assert.ok(html.includes(labels.searchShareCopied) && html.includes(labels.searchShareFailed), `${file}: copy feedback should be localized`);
  for (const [, filterPrice, row] of transcriptPrices) {
    assert.equal(Number(filterPrice), Number(row.match(/class="menu-item-price">(\d+) lei/)?.[1]), 'Filter prices must match the printed menu prices');
  }
  assert.ok(html.includes(`data-lightbox-previous aria-label="${labels.previous}"`), `${file}: enlarged gallery needs a localized previous-page control`);
  assert.ok(html.includes(`data-lightbox-next aria-label="${labels.next}"`), `${file}: enlarged gallery needs a localized next-page control`);
  assert.ok(html.includes(`data-menu-next aria-label="${labels.next}"`), `${file}: the native gallery needs a localized next-page control when its scrollbar is hidden`);
  assert.match(html, /class="menu-counter"[^>]*>[\s\S]*?data-menu-count/, `${file}: the native gallery needs a visible page counter when its scrollbar is hidden`);
  assert.ok(enlargeLinks.every((tag) => /\bhref="\/images\/menu\/[^\"]+"/.test(tag) && !/\baria-haspopup\s*=/.test(tag)), `${file}: static fallback links must target their image without claiming a dialog`);
  assert.equal(new Set(slides.map((match) => match[1])).size, 14, `${file}: page IDs must be unique`);
  assert.equal(transcript.length, 200, `${file}: all 200 printed items must be present in the static HTML`);
  assert.equal((html.match(/<details\b[^>]*id="read-/g) ?? []).length, 13, `${file}: all 13 content pages need a text alternative`);
  assert.deepEqual(transcriptScanLinks, slides.slice(1).map(([, id]) => id), `${file}: every transcript page needs a link to its matching scan`);
  const transcriptReturnLinks = [...html.matchAll(/<a\b[^>]*class="[^"]*menu-transcript-return[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(([link]) => link);
  assert.equal(transcriptReturnLinks.length, 13, `${file}: each content page should offer a return link to the filters`);
  assert.ok(transcriptReturnLinks.every((link) => link.includes('href="#menu-dish-search"') && /\shidden(?:="")?(?:\s|>)/.test(link) && link.includes(labels.searchReturn)), `${file}: return links should be localized, point to search, and stay hidden without JavaScript`);
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

assert.match(transcriptSource, /resetButton\.addEventListener\('click',[\s\S]*?input\.value = ''[\s\S]*?categoryFilter\.value = ''[\s\S]*?priceLimit\.value = String\(maximumMenuPrice\)[\s\S]*?priceLimitFilter\.open = false[\s\S]*?syncSearchUrl\(\)[\s\S]*?updateResults\(\)[\s\S]*?input\.focus\(\{ preventScroll: true \}\)/, 'Reset should clear text, category, and price filters, restore the share URL, and return focus to search');
assert.match(transcriptSource, /window\.addEventListener\('beforeprint'[\s\S]*?input\.value = ''[\s\S]*?categoryFilter\.value = ''[\s\S]*?priceLimit\.value = String\(maximumMenuPrice\)[\s\S]*?page\.open = true/, 'Print should temporarily include the full menu even when filters are active');
assert.match(transcriptSource, /window\.addEventListener\('afterprint'[\s\S]*?input\.value = previousState\.query[\s\S]*?categoryFilter\.value = previousState\.category[\s\S]*?priceLimit\.value = previousState\.priceLimit[\s\S]*?page\.open = previousState\.pagesOpen\[index\][\s\S]*?syncSearchUrl\(\)/, 'Closing print preview should restore the filters, expanded sections, and share URL');
assert.match(menuStyles, /@media print\s*\{[\s\S]*?\.menu-gallery[\s\S]*?\.menu-transcript-return[\s\S]*?\.menu-transcript-pages[\s\S]*?\[data-menu-item\]\[hidden\]/, 'Print styles should focus on the readable transcript, hide navigation links, and include filtered items');

for (const locale of locales) {
  const prefix = prefixFor(locale);
  const html = await readFile(path.join(dist, prefix, 'index.html'), 'utf8');
  const menuHref = `/${prefix}meniu/`;
  const hero = html.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.ok(hero.includes(`href="${menuHref}"`), `${prefix || 'RO'} home: hero must link to localized menu`);
  assert.match(html, /id="menu-preview-title"/, 'Home needs its visual menu preview');
  const previewSearch = html.match(/<a\b(?=[^>]*data-menu-home-search-link)[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
  assert.ok(previewSearch.includes(`href="${menuHref}#read-menu"`), `${prefix || 'RO'} home: menu preview should link directly to the visible transcript and search`);
  assert.match(previewSearch, /\shidden(?:="")?(?:\s|>)/, `${prefix || 'RO'} home: hide the search link if JavaScript is unavailable`);
  assert.ok(previewSearch.includes(dictionaries[locale].menu.searchLabel), `${prefix || 'RO'} home: direct search link should be localized`);
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
console.log('Controllo menu superato: 14 pagine, 200 voci tradotte nelle sei lingue con quantità e prezzi identici, ricerca testuale e filtri categoria/prezzo accessibili e condivisibili, deep link sincronizzati, asset responsive e collegamenti home/schede speciali.');
