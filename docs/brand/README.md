# Casa Rusu brand variants

These additive PNG variants were made on 2026-10-13 from the official source image at `public/brand/casa-rusu-logo.jpg` (720×720). The repository JPG is the source of truth and remains byte-for-byte unchanged; `src/data/site.ts` still references `/brand/casa-rusu-logo.jpg`. The official Facebook profile image was visually verified as the same artwork.

Files in `public/brand/variants/`:

- `casa-rusu-logo-full.png` — full source image, decoded to an opaque PNG.
- `casa-rusu-logo-transparent.png` — full 720×720 source canvas with only the paper background made transparent using ImageMagick flood-fill operations. The textured JPEG and anti-aliased edges limit perfect background separation; faint paper-toned edge pixels or speckle may remain, so review on both light and dark backgrounds.
- `casa-rusu-monogram-rule.png` — source crop `328×236+198+154`, including the complete CR oval and its existing horizontal rule.
- `casa-rusu-wordmark-restaurant.png` — source crop `470×188+130+393`, including Casa Rusu, RESTAURANT, existing separators, and flourish.
- `casa-rusu-horizontal-lockup.png` — transparent composition of those same two source crop bounds, placed side by side with a 16 px gap. The lettering is vertically centered; no rescaling was used.

No lettering, fonts, marks, ornaments, colors, or site integration were redrawn or changed. These assets still require restaurant approval before use.
