import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { galleryPhotos } from '../src/data/photoGallery.ts';
import { restaurantAvifWidths, restaurantWebpWidths } from '../src/utils/responsiveImages.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputs = [
  { format: 'avif', widths: restaurantAvifWidths, encode: (pipeline) => pipeline.avif({ quality: 62, effort: 5 }) },
  { format: 'webp', widths: restaurantWebpWidths, encode: (pipeline) => pipeline.webp({ quality: 82, effort: 5 }) },
];

for (const image of galleryPhotos) {
  const source = path.join(root, 'public', image);
  const sourceMetadata = await sharp(source).metadata();
  if (!sourceMetadata.width || sourceMetadata.width < Math.max(...restaurantAvifWidths)) {
    throw new Error(`Gallery source is too small for the declared candidates: ${image}`);
  }

  const stem = image.replace(/\.jpe?g$/i, '');
  for (const { format, widths, encode } of outputs) {
    for (const width of widths.filter((candidate) => candidate <= sourceMetadata.width)) {
      const destination = path.join(root, 'public', `${stem}-${width}.${format}`);
      await encode(sharp(source).resize({ width, withoutEnlargement: true })).toFile(destination);
      const size = (await stat(destination)).size;
      console.log(`${image} → ${path.relative(root, destination)}: ${Math.round(size / 1024)} KiB`);
    }
  }
}
