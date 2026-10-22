"""Generate delivery subsets without changing the original licensed font files.

Requires fonttools[woff] (tested with fontTools 4.67.0 and brotli 1.2.0).
Run from the repository root: python scripts/optimize-fonts.py
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

source = Path('public/fonts')
destination = source / 'optimized'
destination.mkdir(exist_ok=True)
romanian = set(map(ord, 'ĂăȘșȚțŞşŢţ'))
latin = set(range(0x20, 0x100)) | set(range(0x2000, 0x2070)) | {0x131, 0x152, 0x153, 0x2BB, 0x2BC, 0x2C6, 0x2DA, 0x2DC, 0x304, 0x308, 0x329, 0x20AC, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215, 0xFEFF, 0xFFFD}
for name in ['dm-sans', 'cormorant-garamond', 'cormorant-garamond-italic']:
    for suffix, characters in [('latin', latin), ('latin-ext', romanian)]:
        original = source / f'{name}-{suffix}.woff2'
        font = TTFont(original, recalcTimestamp=False)
        options = subset.Options()
        options.flavor = 'woff2'
        options.recalc_timestamp = False
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=characters)
        subsetter.subset(font)
        if 'fvar' in font:
            instantiateVariableFont(font, {'wght': (400, 700) if name == 'dm-sans' else (400, 500)}, inplace=True)
        output = destination / original.name
        font.save(output)
        print(f'{output}: {original.stat().st_size} → {output.stat().st_size} bytes')
