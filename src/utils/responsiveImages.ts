export const imageSizes = '(max-width: 760px) calc(100vw - 2.5rem), min(44vw, 40rem)';
export const restaurantAvifWidths = [640, 768, 960, 1280] as const;
export const restaurantWebpWidths = [640, 960, 1280] as const;

export function imageSrcset(image: string, widths: readonly number[], format: 'webp' | 'avif' = 'webp'): string {
  const stem = image.replace(/\.jpe?g$/i, '');
  return widths.map((width) => `${stem}-${width}.${format} ${width}w`).join(', ');
}
