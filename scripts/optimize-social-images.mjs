import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const width = 1200;
const height = 630;
const images = [
  {
    name: 'home',
    source: 'public/images/casa-rusu-interior.jpg',
    output: 'public/images/social/home-1200x630.jpg',
    position: 'north',
  },
  {
    name: 'menu',
    source: 'public/images/menu/coperta.jpg',
    output: 'public/images/social/menu-1200x630.jpg',
    position: 'centre',
  },
  {
    name: 'dish',
    source: 'public/images/casa-rusu-preparat.jpg',
    output: 'public/images/social/dish-1200x630.jpg',
    position: 'centre',
  },
];

for (const image of images) {
  const sourcePath = path.join(projectRoot, image.source);
  const outputPath = path.join(projectRoot, image.output);
  const metadata = await sharp(sourcePath).metadata();
  const scale = Math.max(width / (metadata.width ?? 0), height / (metadata.height ?? 0));
  if (!metadata.width || !metadata.height || !Number.isFinite(scale) || scale > 1) {
    throw new Error(`${image.source} is too small for a crisp ${width}×${height} social image.`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  const output = await sharp(sourcePath)
    .rotate()
    .resize(width, height, { fit: 'cover', position: image.position, kernel: 'lanczos3' })
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4', progressive: true, mozjpeg: true })
    .toFile(outputPath);

  if (output.width !== width || output.height !== height) {
    throw new Error(`${image.output} was generated at ${output.width}×${output.height}, expected ${width}×${height}.`);
  }

  console.log(`${image.output}: ${output.width}×${output.height}, ${Math.round(output.size / 1024)} KiB`);
}
