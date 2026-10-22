import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const menus = await Promise.all(['meniu/index.html', 'en/meniu/index.html'].map(async (file) => ({
  file, html: await readFile(path.join(dist, file), 'utf8'),
})));

let originalItems;
for (const { file, html } of menus) {
  const slides = [...html.matchAll(/<div\b[^>]*id="menu-page-([^"]+)"[^>]*>/g)];
  const transcript = [...html.matchAll(/<li\b[^>]*data-menu-item[^>]*>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
  assert.equal(slides.length, 14, `${file}: all 14 supplied pages must be rendered`);
  assert.equal(new Set(slides.map((match) => match[1])).size, 14, `${file}: page IDs must be unique`);
  assert.equal(transcript.length, 200, `${file}: all 200 printed items must be present in the static HTML`);
  assert.equal((html.match(/<details\b[^>]*id="read-/g) ?? []).length, 13, `${file}: all 13 content pages need a text alternative`);
  assert.match(html, /<search\b[^>]*aria-label="[^"]+"[^>]*hidden[^>]*data-menu-search/, `${file}: search should be available as progressive enhancement`);
  assert.match(html, /<label for="menu-dish-search">[^<]+<\/label>[\s\S]*?<input\b[^>]*type="search"[^>]*aria-controls="menu-transcript-pages"/, `${file}: search needs an associated label and results target`);
  assert.match(html, /data-menu-search-status[^>]*role="status"[^>]*aria-live="polite"/, `${file}: search results must be announced politely`);
  assert.match(html, /<ul lang="ro">/, `${file}: original Romanian content needs its language declared`);
  assert.doesNotMatch(html, /Meniul complet urmează|full menu (?:is )?coming soon/i, `${file}: outdated placeholder`);
  assert.match(html, /href="\/(?:en\/)?preparate\/snitel-cotlet-porc\/?"/, `${file}: keep the special dish page linked`);
  if (originalItems) assert.deepEqual(transcript, originalItems, 'RO and EN must show identical original Romanian menu items and prices');
  originalItems = transcript;
  for (const [, id] of slides) {
    assert.match(html, new RegExp(`href="#menu-page-${id}"`), `${file}: missing index link for ${id}`);
    for (const filename of [`${id}.jpg`, ...[480, 800, 1200, 1448].map((width) => `${id}-${width}.webp`)]) {
      assert.ok((await stat(path.join(dist, 'images/menu', filename))).size > 0, `Missing menu asset: ${filename}`);
    }
  }
  for (const row of transcript) {
    assert.match(row, /<h4>[^<]+<\/h4>/, `${file}: item missing its name`);
    assert.match(row, /class="menu-item-price">[1-9]\d* lei</, `${file}: invalid printed price`);
    assert.match(row, /class="menu-item-quantity">[^<]+</, `${file}: item missing its printed portion`);
  }
}

for (const prefix of ['', 'en/']) {
  const html = await readFile(path.join(dist, prefix, 'index.html'), 'utf8');
  const menuHref = `/${prefix}meniu/`;
  const hero = html.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.ok(hero.includes(`href="${menuHref}"`), `${prefix || 'RO'} home: hero must link to localized menu`);
  assert.match(html, /id="menu-preview-title"/, 'Home needs its visual menu preview');
  assert.ok(html.includes(`href="/${prefix}preparate/snitel-cotlet-porc"`), 'Home must retain the special dish link');
  await stat(path.join(dist, prefix, 'preparate/snitel-cotlet-porc/index.html'));
}
console.log('Controllo menu superato: 14 pagine, 200 voci RO identiche nelle due lingue, ricerca accessibile, asset responsive, collegamenti home e schede speciali.');
