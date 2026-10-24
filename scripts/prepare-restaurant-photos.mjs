import sharp from 'sharp';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'public/images');
const sources = {
  'casa-rusu-interior': '825351537_122111652627477205_7436696873175223231_n.jpg',
  'casa-rusu-preparat': '828127944_122112035511477205_8911503988203820180_n.jpg',
  'casa-rusu-exterior': '830029935_122112035265477205_3283460473353573239_n.jpg',
  'casa-rusu-platou-branzeturi': '828539155_122112035535477205_5159938828364923453_n.jpg',
  'casa-rusu-servire-platouri': '830941838_122112034545477205_1067938577646299983_n.jpg',
  'casa-rusu-servire-bere': '828572950_122112035469477205_6869721508804937931_n.jpg',
  'casa-rusu-atmosfera-sala': '830393366_122112034389477205_7760583851855976779_n.jpg',
};

// Quality takes priority: preserve the delivered JPEGs byte for byte.
// The files are already only 100–250 KiB at 2048px. Delivery uses the originals,
// high-priority preload for the lead photo, and lazy loading for the other photos.
const importDirectory = process.argv[2];
const inventory = [];
for (const [name, originalName] of Object.entries(sources)) {
  const source = path.join(directory, `${name}.jpg`);
  if (importDirectory) await copyFile(path.join(importDirectory, originalName), source);
  const bytes = await readFile(source);
  const metadata = await sharp(bytes).metadata();
  if (metadata.width !== 2048 || metadata.height !== 1366) throw new Error(`Unexpected source dimensions: ${source}`);
  inventory.push({ source: `${name}.jpg`, originalName, width: metadata.width, height: metadata.height, sourceBytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), delivery: 'original-jpeg-unchanged' });
  console.log(`${name}: original 2048 × 1366, ${Math.round(bytes.length / 1024)} KiB, no re-encoding`);
}
await mkdir(path.join(root, 'docs/photos'), { recursive: true });
await writeFile(path.join(root, 'docs/photos/inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`);
