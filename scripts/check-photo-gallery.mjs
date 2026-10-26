import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { galleryCopy, galleryPhotos } from '../src/data/photoGallery.ts';
import { locales, defaultLocale } from '../src/i18n/config.ts';
import { restaurantAvifWidths, restaurantWebpWidths } from '../src/utils/responsiveImages.ts';

const component = await readFile(new URL('../src/components/PhotoGallery.astro', import.meta.url), 'utf8');
const photoComponent = await readFile(new URL('../src/components/RestaurantPhoto.astro', import.meta.url), 'utf8');
const prefixFor = (locale) => locale === defaultLocale ? '' : `${locale}/`;

assert.equal(galleryPhotos.length, 4, 'The photo gallery and its lightbox should cover all four supplied images');
for (const image of galleryPhotos) {
  const originalPath = new URL(`../public${image}`, import.meta.url);
  const originalStats = await stat(originalPath);
  const originalMetadata = await sharp(fileURLToPath(originalPath)).metadata();
  assert.equal(originalMetadata.width, 2048, `${image}: preserve the original-resolution JPEG fallback`);

  for (const [format, widths] of [['avif', restaurantAvifWidths], ['webp', restaurantWebpWidths]]) {
    for (const width of widths) {
      const variantPath = new URL(`../public${image.replace(/\.jpe?g$/i, '')}-${width}.${format}`, import.meta.url);
      const variantStats = await stat(variantPath);
      const variantMetadata = await sharp(fileURLToPath(variantPath)).metadata();
      assert.equal(variantMetadata.width, width, `${image}: ${format} ${width}px candidate should have its declared width`);
      assert.ok(variantStats.size < originalStats.size, `${image}: ${format} ${width}px candidate should be smaller than the original`);
    }
  }
}

assert.deepEqual(Object.keys(galleryCopy), [...locales], 'The photo gallery needs copy in all supported languages');
assert.match(component, /<dialog class="photo-lightbox" aria-labelledby="photo-lightbox-title">/, 'The enlarged photo needs a labelled native dialog');
assert.match(component, /dialog\.showModal\(\)/, 'The lightbox should use modal dialog behavior');
assert.match(component, /event\.key === 'ArrowLeft'[\s\S]*event\.key === 'ArrowRight'/, 'The lightbox should support previous/next keyboard navigation');
assert.match(component, /lightboxImageWrap\.addEventListener\('pointerdown'[\s\S]*event\.pointerType !== 'touch'[\s\S]*event\.isPrimary/, 'Lightbox swipe navigation should start only with the primary touch pointer');
assert.match(component, /lightboxImageWrap\.addEventListener\('pointerup'[\s\S]*Math\.abs\(deltaX\) < 48[\s\S]*Math\.abs\(deltaX\) <= Math\.abs\(deltaY\) \* 1\.25/, 'Lightbox swipe navigation should require a deliberate, mostly horizontal gesture');
assert.match(component, /lightboxImageWrap\.addEventListener\('pointercancel',[\s\S]*swipeStart = null/, 'Cancelled touch gestures should not trigger lightbox navigation');
assert.match(component, /touch-action: pan-y pinch-zoom/, 'Lightbox swipes should preserve vertical panning and pinch zoom');
assert.match(component, /dialog\.addEventListener\('close',[\s\S]*previousOverflow[\s\S]*opener\?\.focus\(\{ preventScroll: true \}\)/, 'Closing the lightbox should restore page scrolling and focus');
assert.match(component, /dialog\.addEventListener\('click',[\s\S]*event\.target === dialog[\s\S]*dialog\.close\(\)/, 'Clicking the modal backdrop should close the lightbox');
assert.match(component, /<template data-photo-picture>[\s\S]*<noscript>/, 'The original lazy-loaded gallery should remain available without JavaScript');
assert.match(component, /width="2048" height="1366" decoding="async"/, 'The lightbox should retain the original photo dimensions');
assert.match(component, /<RestaurantPhoto \{image\} alt=\{copy\.alts\[index\]\} responsive sizes=\{galleryImageSizes\}/, 'Gallery thumbnails should use responsive image candidates sized for their carousel column');
assert.match(photoComponent, /imageSrcset\(image, restaurantAvifWidths, 'avif'\)/, 'Responsive gallery images should prefer AVIF candidates');
assert.match(photoComponent, /imageSrcset\(image, restaurantWebpWidths, 'webp'\)/, 'Responsive gallery images should provide WebP fallbacks');

for (const locale of locales) {
  const copy = galleryCopy[locale];
  assert.equal(copy.captions.length, galleryPhotos.length, `${locale}: every photo needs a caption`);
  assert.equal(copy.alts.length, galleryPhotos.length, `${locale}: every photo needs descriptive alternative text`);
  for (const label of [copy.previous, copy.next, copy.enlarge, copy.close]) {
    assert.ok(label.trim(), `${locale}: every lightbox control needs a localized label`);
  }

  const html = await readFile(new URL(`../dist/${prefixFor(locale)}index.html`, import.meta.url), 'utf8');
  for (const image of galleryPhotos) {
    const stem = image.replace(/\.jpe?g$/i, '');
    assert.ok(html.includes(`${stem}-640.avif`) && html.includes(`${stem}-1280.avif`), `${locale}: each gallery photo should include responsive AVIF candidates`);
    assert.ok(html.includes(`${stem}-640.webp`) && html.includes(`${stem}-1280.webp`), `${locale}: each gallery photo should include responsive WebP candidates`);
  }
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
