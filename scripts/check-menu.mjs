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
assert.match(gallerySource, /lightboxScroll\.addEventListener\('pointerdown',[\s\S]*event\.pointerType !== 'touch'[\s\S]*!event\.isPrimary[\s\S]*event\.button !== 0/, 'Menu scan swipes should start only from the primary touch pointer');
assert.match(gallerySource, /lightboxScroll\.addEventListener\('pointerup',[\s\S]*start\.pointerId !== event\.pointerId[\s\S]*Math\.abs\(deltaX\) < 48[\s\S]*Math\.abs\(deltaX\) <= Math\.abs\(deltaY\) \* 1\.25[\s\S]*moveLightbox\(current \+ \(deltaX < 0 \? 1 : -1\)\)/, 'Menu scan swipes should require a deliberate horizontal gesture and use the existing page navigation');
assert.match(gallerySource, /lightboxScroll\.addEventListener\('pointercancel',[\s\S]*lightboxSwipeStart = null/, 'Cancelled menu scan gestures should not change the selected page');
assert.match(gallerySource, /lightboxScroll\.style\.touchAction = zoom === 1 \? 'pan-y pinch-zoom' : 'auto'/, 'The menu viewer should reserve horizontal gestures for page navigation only at fit zoom');
assert.match(menuStyles, /\.menu-lightbox-scroll\s*\{[^}]*touch-action:\s*pan-y pinch-zoom;/, 'The menu viewer should preserve native vertical scrolling and pinch zoom at fit size');
assert.match(menuStyles, /\.menu-lightbox-toolbar\s*\{[^}]*min-width:\s*0;/, 'Narrow menu lightboxes should allow their toolbar title to wrap within the dialog');
assert.match(menuStyles, /@media \(max-width:\s*320px\)\s*\{[\s\S]*?\.menu-lightbox-controls,\s*\.menu-lightbox-page-controls,\s*\.menu-zoom-controls\s*\{[^}]*gap:\s*0;/, 'At narrow widths, all six minimum-size menu lightbox controls should fit without gaps');
assert.match(menuStyles, /\.menu-search input\s*\{[^}]*scroll-margin-block-start:\s*3rem;/, 'Direct links to dish search should account for the sticky panel input offset');

const inclusiveSearchCopy = {
  ro: ['Ce cauți în meniu?', 'Caută în meniu', 'Preparat, băutură, ingredient, categorie sau preț', 'Caută după nume, ingredient, categorie sau preț în lei. Poți căuta și băuturi și poți limita prețul maxim.', 'Nu am găsit rezultate potrivite.', 'Un rezultat găsit.', '{count} rezultate găsite.'],
  en: ['What are you looking for?', 'Search the menu', 'Item, drink, ingredient, category, or price', 'Search by name, ingredient, category or price in Romanian lei. Drink names and Romanian menu names are searchable too. You can also set a maximum price.', 'No matching results found.', 'One result found.', '{count} results found.'],
  it: ['Cosa cerchi nel menu?', 'Cerca nel menu', 'Nome, bevanda, ingrediente, categoria o prezzo', 'Cerca per nome, ingrediente, categoria o prezzo in lei. Puoi cercare anche le bevande e le denominazioni romene e impostare un prezzo massimo.', 'Nessun risultato trovato.', 'Un risultato trovato.', '{count} risultati trovati.'],
  es: ['¿Qué buscas en el menú?', 'Buscar en el menú', 'Nombre, bebida, ingrediente, categoría o precio', 'Busca por nombre, ingrediente, categoría o precio en lei. También puedes buscar bebidas y los nombres rumanos del menú y fijar un precio máximo.', 'No se han encontrado resultados.', 'Se ha encontrado un resultado.', 'Se han encontrado {count} resultados.'],
  fr: ['Que recherchez-vous dans le menu ?', 'Rechercher dans le menu', 'Nom, boisson, ingrédient, catégorie ou prix', 'Recherchez par nom, ingrédient, catégorie ou prix en lei. Vous pouvez aussi rechercher des boissons et les intitulés roumains du menu, et définir un prix maximum.', 'Aucun résultat trouvé.', 'Un résultat trouvé.', '{count} résultats trouvés.'],
  de: ['Wonach suchen Sie?', 'Speisekarte durchsuchen', 'Name, Getränk, Zutat, Kategorie oder Preis', 'Suchen Sie nach Namen, Zutaten, Kategorien oder Preisen in Lei. Auch Getränke und rumänische Menübezeichnungen können Sie finden. Sie können einen Höchstpreis festlegen.', 'Keine passenden Ergebnisse gefunden.', 'Ein Ergebnis gefunden.', '{count} Ergebnisse gefunden.'],
};
for (const locale of locales) {
  const menu = dictionaries[locale].menu;
  assert.deepEqual(
    ['searchLabel', 'searchShortcut', 'searchPlaceholder', 'searchHint', 'searchNoResults', 'searchOneResult', 'searchManyResults'].map((key) => menu[key]),
    inclusiveSearchCopy[locale],
    `${locale}: menu search copy should include drinks and use result counts that fit every menu category`,
  );
}

const schnitzelPhotoCopy = {
  ro: {
    body: 'Fotografia arată șnițelul din cotlet de porc cu os alături de cartofi prăjiți cu pătrunjel, parmezan și usturoi.',
    note: 'Meniul tipărit listează șnițelul separat de garnituri. Fotografia îl arată alături de cartofi prăjiți. Sună-ne ca să verifici dacă această servire este disponibilă și care este prețul actual.',
  },
  en: {
    body: 'The photo shows the bone-in pork loin schnitzel with fries topped with parsley, parmesan and garlic.',
    note: 'The printed menu lists the schnitzel separately from side dishes. The photo shows it with fries. Call us to check whether this serving is available and its current price.',
  },
  it: {
    body: 'La foto mostra la cotoletta di lonza di maiale con osso, accompagnata da patatine con prezzemolo, parmigiano e aglio.',
    note: 'Il menu stampato elenca la cotoletta separatamente dai contorni. La foto la mostra con patatine fritte. Chiamaci per verificare se questa porzione è disponibile e qual è il prezzo attuale.',
  },
  es: {
    body: 'La foto muestra el escalope de lomo de cerdo con hueso junto a patatas fritas con perejil, parmesano y ajo.',
    note: 'El menú impreso incluye el escalope por separado de las guarniciones. La foto lo muestra con patatas fritas. Llámanos para comprobar si está disponible esta ración y cuál es su precio actual.',
  },
  fr: {
    body: 'La photo montre l’escalope de longe de porc avec os, accompagnée de frites au persil, au parmesan et à l’ail.',
    note: 'Le menu imprimé présente l’escalope séparément des garnitures. La photo la montre avec des frites. Appelez-nous pour vérifier si cette assiette est disponible et connaître son prix actuel.',
  },
  de: {
    body: 'Das Foto zeigt das panierte Schweinekotelett mit Pommes, Petersilie, Parmesan und Knoblauch.',
    note: 'Die gedruckte Speisekarte führt das Schnitzel getrennt von den Beilagen auf. Auf dem Foto ist es mit Pommes zu sehen. Bitte rufen Sie an, um zu prüfen, ob diese Portion verfügbar ist und welchen aktuellen Preis sie hat.',
  },
};

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
assert.match(transcriptSource, /const shareUrl = window\.location\.href;/, 'The sharing action should capture the current shareable result URL');
assert.match(transcriptSource, /navigator\.clipboard\.writeText\(shareUrl\)/, 'The menu should copy the current shareable result URL when native sharing is unavailable');
assert.match(transcriptSource, /canShareCurrentUrl = \(\) =>[\s\S]*navigator\.canShare\(\{ url: window\.location\.href \}\)/, 'The menu should validate URLs before using the native share sheet');
assert.match(transcriptSource, /navigator\.share\(\{ title: document\.title, url: shareUrl \}\)/, 'The native share action should be triggered directly from the button with the current result URL');
assert.match(transcriptSource, /error\.name === 'AbortError'\) return/, 'Cancelling the native share sheet should not unexpectedly copy the URL');
assert.match(transcriptSource, /shareButton\.hidden = !filtersAreActive \|\| \(!nativeShareAvailable && !copyAvailable\)/, 'The share control should appear only for active filters when a secure sharing method is available');
assert.match(transcriptSource, /shareButton\.textContent = nativeShareAvailable[\s\S]*search\.dataset\.searchShareNativeLabel[\s\S]*search\.dataset\.searchShareLabel/, 'The share control should describe the native action or copy fallback');
assert.match(transcriptSource, /search\.dataset\.searchShareDone/, 'The native share action should provide localized status feedback');
assert.match(transcriptSource, /search\.dataset\.searchShareCopied[\s\S]*search\.dataset\.searchShareFailed/, 'The copy fallback should provide localized success and failure feedback');
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
  assert.ok(html.includes(`<label for="menu-dish-search">${labels.searchLabel}</label>`), `${file}: search field label should be inclusive and localized`);
  assert.ok(html.includes(`placeholder="${labels.searchPlaceholder}"`), `${file}: search suggestions should include drinks and be localized`);
  assert.ok(html.includes(`data-search-no-results="${labels.searchNoResults}"`) && html.includes(`data-search-one-result="${labels.searchOneResult}"`) && html.includes(`data-search-many-results="${labels.searchManyResults}"`), `${file}: accessible result counts should be localized and category-neutral`);
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
  assert.ok(html.includes(labels.searchShare) && html.includes(labels.searchShareNative), `${file}: copy and native share actions should be localized`);
  assert.ok(html.includes(labels.searchShareCopied) && html.includes(labels.searchShareDone) && html.includes(labels.searchShareFailed), `${file}: native share and copy feedback should be localized`);
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
  assert.ok(searchShortcut.includes(labels.searchShortcut), `${file}: menu search shortcut should be localized`);
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
assert.match(menuStyles, /@media \(max-width: 320px\)\s*\{[\s\S]*?\.menu-category-filter summary, \.menu-price-filter summary\s*\{\s*display: grid;[\s\S]*?grid-template-areas: "label arrow" "value arrow";[\s\S]*?\.menu-category-filter summary > span, \.menu-price-filter summary > span\s*\{\s*grid-area: label;[\s\S]*?\.menu-category-filter summary output, \.menu-price-filter summary output\s*\{[\s\S]*?grid-area: value;[\s\S]*?\.menu-category-filter summary::after, \.menu-price-filter summary::after\s*\{\s*grid-area: arrow;/, 'Narrow menu filters should stack labels and values without squeezing either column');

for (const locale of locales) {
  const prefix = prefixFor(locale);
  const html = await readFile(path.join(dist, prefix, 'index.html'), 'utf8');
  const dishDescription = dictionaries[locale].copy.dish.body;
  assert.equal(dishDescription, schnitzelPhotoCopy[locale].body, `${prefix || 'RO'} dish: describe the pictured serving without claiming how the restaurant serves or prices it`);
  assert.ok(html.includes(dishDescription), `${prefix || 'RO'} home: show the localized photo description`);
  const menuHtml = menus.find(({ file }) => file === `${prefix}meniu/index.html`)?.html ?? '';
  assert.ok(menuHtml.includes(dishDescription), `${prefix || 'RO'} menu: show the localized photo description`);
  const menuHref = `/${prefix}meniu/`;
  const hero = html.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.ok(hero.includes(`href="${menuHref}"`), `${prefix || 'RO'} home: hero must link to localized menu`);
  assert.match(html, /id="menu-preview-title"/, 'Home needs its visual menu preview');
  const previewSearch = html.match(/<a\b(?=[^>]*data-menu-home-search-link)[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
  assert.ok(previewSearch.includes(`href="${menuHref}#read-menu"`), `${prefix || 'RO'} home: menu preview should link directly to the visible transcript and search`);
  assert.match(previewSearch, /\shidden(?:="")?(?:\s|>)/, `${prefix || 'RO'} home: hide the search link if JavaScript is unavailable`);
  assert.ok(previewSearch.includes(dictionaries[locale].menu.searchShortcut), `${prefix || 'RO'} home: direct search link should be localized`);
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
  assert.equal(dishCopy.note, schnitzelPhotoCopy[locale].note, `${prefix || 'RO'} dish: identify the fries as pictured and keep availability and current price conditional`);
  assert.ok(dishHtml.includes(dishDescription), `${prefix || 'RO'} dish: show the localized photo description`);
  const dishMenuHref = `/${prefix}meniu/#menu-page-porc`;
  assert.ok(dishHtml.includes(`id="dish-menu-listing-title">${dishCopy.label}</p>`), `${prefix || 'RO'} dish: printed-menu price must be clearly labelled`);
  assert.match(dishHtml, /class="dish-menu-listing-price">\s*<span>300g<\/span>\s*<strong>54 lei<\/strong>/, `${prefix || 'RO'} dish: show the printed schnitzel portion and price`);
  assert.ok(dishHtml.includes(dishCopy.note), `${prefix || 'RO'} dish: distinguish the printed listing from the serving shown here`);
  assert.ok(dishHtml.includes(`href="${dishMenuHref}"`) && dishHtml.includes(dishCopy.action), `${prefix || 'RO'} dish: link directly to the schnitzel menu page`);
}
console.log('Controllo menu superato: 14 pagine, 200 voci tradotte nelle sei lingue con prezzi e quantità identici; ricerca inclusiva per tutte le categorie, filtri e URL condivisibili, asset responsive e collegamenti sincronizzati.');
