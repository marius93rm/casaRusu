export const imageSizes = '(max-width: 760px) calc(100vw - 2.5rem), min(44vw, 40rem)';

export function webpSrcset(image: string, widths: number[], format: 'webp' | 'avif' = 'webp'): string {
  const stem = image.replace(/\.jpe?g$/i, '');
  return widths.map((width) => `${stem}-${width}.${format} ${width}w`).join(', ');
}
