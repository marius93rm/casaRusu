import sharp from 'sharp';
import { stat } from 'node:fs/promises';

// Keep every source and WebP fallback; AVIF is an additional delivery format.
for (const name of ['interior', 'preparat', 'exterior']) {
  const source = `public/images/casa-rusu-${name}.jpg`;
  const metadata = await sharp(source).metadata();
  for (const width of [640, 960, 1280, 1600, 1920].filter(width => width <= metadata.width)) {
    const output = `public/images/casa-rusu-${name}-${width}.avif`;
    await sharp(source).resize({ width }).avif({ quality: 55, effort: 6 }).toFile(output);
    console.log(`${output}: ${Math.round((await stat(output)).size / 1024)} KiB`);
  }
}
