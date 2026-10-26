export const imageSizes = '(max-width: 760px) calc(100vw - 2.5rem), min(44vw, 40rem)';
export const galleryImageSizes = '(max-width: 760px) calc(86vw - 2.15rem), (max-width: 1024px) calc(50vw - 2.75rem), (max-width: 1440px) calc(50vw - 3.75rem), 41.25rem';
export const restaurantAvifWidths = [640, 768, 960, 1280] as const;
export const restaurantWebpWidths = [640, 960, 1280] as const;

export function imageSrcset(image: string, widths: readonly number[], format: 'webp' | 'avif' = 'webp'): string {
  const stem = image.replace(/\.jpe?g$/i, '');
  return widths.map((width) => `${stem}-${width}.${format} ${width}w`).join(', ');
}
