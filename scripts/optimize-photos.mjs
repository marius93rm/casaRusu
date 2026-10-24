import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';

// Preserve the delivered restaurant JPEGs; only the printed menu is re-encoded.
await import('./prepare-restaurant-photos.mjs');

// The cover contains no dish information and can use stronger compression.
for (const width of [480, 800, 1200, 1448]) {
  const output = `public/images/menu/coperta-${width}.avif`;
  await sharp('public/images/menu/coperta.jpg').resize({ width }).avif({ quality: 40, effort: 4 }).toFile(output);
  console.log(`${output}: ${Math.round((await stat(output)).size / 1024)} KiB`);
}

// Keep the printed originals and WebP fallbacks, adding AVIF at a text-friendly quality.
const menuSources = (await readdir('public/images/menu'))
  .filter((name) => name.endsWith('.jpg') && name !== 'coperta.jpg')
  .sort();
for (const name of menuSources) {
  const source = `public/images/menu/${name}`;
  const id = name.slice(0, -'.jpg'.length);
  const metadata = await sharp(source).metadata();
  for (const width of [480, 800, 1200, 1448].filter((candidate) => candidate <= metadata.width)) {
    const output = `public/images/menu/${id}-${width}.avif`;
    await sharp(source).resize({ width }).avif({ quality: 55, effort: 4 }).toFile(output);
    console.log(`${output}: ${Math.round((await stat(output)).size / 1024)} KiB`);
  }
}
