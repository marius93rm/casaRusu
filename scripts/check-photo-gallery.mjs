import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { galleryCopy, galleryPhotos } from '../src/data/photoGallery.ts';
import { locales, defaultLocale } from '../src/i18n/config.ts';

const component = await readFile(new URL('../src/components/PhotoGallery.astro', import.meta.url), 'utf8');
const prefixFor = (locale) => locale === defaultLocale ? '' : `${locale}/`;

assert.equal(galleryPhotos.length, 4, 'The photo gallery and its lightbox should cover all four supplied images');
for (const image of galleryPhotos) {
  await stat(new URL(`../public${image}`, import.meta.url));
}

assert.deepEqual(Object.keys(galleryCopy), [...locales], 'The photo gallery needs copy in all supported languages');
assert.match(component, /<dialog class="photo-lightbox" aria-labelledby="photo-lightbox-title">/, 'The enlarged photo needs a labelled native dialog');
assert.match(component, /dialog\.showModal\(\)/, 'The lightbox should use modal dialog behavior');
assert.match(component, /event\.key === 'ArrowLeft'[\s\S]*event\.key === 'ArrowRight'/, 'The lightbox should support previous/next keyboard navigation');
assert.match(component, /dialog\.addEventListener\('close',[\s\S]*previousOverflow[\s\S]*opener\?\.focus\(\{ preventScroll: true \}\)/, 'Closing the lightbox should restore page scrolling and focus');
assert.match(component, /dialog\.addEventListener\('click',[\s\S]*event\.target === dialog[\s\S]*dialog\.close\(\)/, 'Clicking the modal backdrop should close the lightbox');
assert.match(component, /<template data-photo-picture>[\s\S]*<noscript>/, 'The original lazy-loaded gallery should remain available without JavaScript');
assert.match(component, /width="2048" height="1366" decoding="async"/, 'The lightbox should retain the original photo dimensions');

for (const locale of locales) {
  const copy = galleryCopy[locale];
  assert.equal(copy.captions.length, galleryPhotos.length, `${locale}: every photo needs a caption`);
  assert.equal(copy.alts.length, galleryPhotos.length, `${locale}: every photo needs descriptive alternative text`);
  for (const label of [copy.previous, copy.next, copy.enlarge, copy.close]) {
    assert.ok(label.trim(), `${locale}: every lightbox control needs a localized label`);
  }

  const html = await readFile(new URL(`../dist/${prefixFor(locale)}index.html`, import.meta.url), 'utf8');
  const controls = [...html.matchAll(/<button\b(?=[^>]*data-photo-open)[^>]*>/g)].map(([tag]) => tag);
  assert.equal(controls.length, galleryPhotos.length, `${locale}: each gallery photo needs one progressive lightbox control`);
  for (let index = 0; index < controls.length; index += 1) {
    assert.ok(controls[index].includes(`aria-label="${copy.enlarge}: ${copy.captions[index]}"`), `${locale}: photo ${index + 1} needs a descriptive localized label`);
    assert.match(controls[index], /\shidden(?:="")?(?:\s|>)/, `${locale}: lightbox controls must stay hidden without JavaScript`);
  }
  assert.ok(html.includes(`aria-label="${copy.close}"`), `${locale}: the dialog needs a localized close control`);
  assert.ok(html.includes(`aria-label="${copy.previous}"`) && html.includes(`aria-label="${copy.next}"`), `${locale}: the dialog needs localized photo navigation`);
  const dialogTitle = html.match(/<h2\b[^>]*id="photo-lightbox-title"[^>]*>([^<]*)<\/h2>/)?.[1];
  assert.equal(dialogTitle, copy.title, `${locale}: the dialog title should match the page language`);
}

console.log(`Controllo galleria superato: ${galleryPhotos.length} immagini originali, didascalie e alt in ${locales.length} lingue, dialogo accessibile con navigazione e ripristino focus.`);
