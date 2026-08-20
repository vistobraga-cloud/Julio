/**
 * Generates the placeholder photography.
 *
 * Julio's real job photos do not exist yet. Rather than ship <div>s that get
 * swapped for <Image /> later — and lose the whole image pipeline in the
 * process — this writes real raster files into src/assets/ so astro:assets is
 * genuinely exercised: AVIF and WebP are emitted, width and height are
 * inferred, and layout shift is zero from day one.
 *
 * Each file is stamped PLACEHOLDER on purpose. A placeholder that looks like a
 * real photo is a placeholder that ships.
 *
 * Replacing them is a file swap: same path, same aspect ratio, real photo.
 * Nothing in any template changes.
 *
 * Run: npm run placeholders
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'src/assets/placeholders');

/** name, width, height, the two gradient stops, and the caption. */
const targets = [
  ['hero', 1600, 1067, '#22262a', '#325c35', 'HERO PHOTO'],
  ['furniture-assembly', 1200, 900, '#14171a', '#2b4a2e', 'FURNITURE ASSEMBLY'],
  ['fitness-equipment-assembly', 1200, 900, '#22262a', '#1c4a63', 'FITNESS EQUIPMENT'],
  ['tv-mounting', 1200, 900, '#14171a', '#1a5878', 'TV MOUNTING'],
  ['handyman-services', 1200, 900, '#22262a', '#33373c', 'HANDYMAN'],
  ['finish-carpentry', 1200, 900, '#14171a', '#325c35', 'FINISH CARPENTRY'],
  ['custom-cabinetry', 1200, 900, '#22262a', '#1c4a63', 'CUSTOM CABINETRY'],
  ['painting', 1200, 900, '#14171a', '#2b4a2e', 'PAINTING'],
  ['julio-portrait', 1000, 1250, '#14171a', '#2b4a2e', 'PORTRAIT'],
];

function svg(width, height, from, to, caption) {
  const titleSize = Math.round(width / 26);
  const noteSize = Math.round(width / 46);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <pattern id="p" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="56" stroke="#ffffff" stroke-opacity="0.05" stroke-width="14"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <rect width="${width}" height="${height}" fill="url(#p)"/>
  <text x="50%" y="47%" fill="#ffffff" fill-opacity="0.92" font-family="sans-serif"
        font-size="${titleSize}" font-weight="700" text-anchor="middle">${caption}</text>
  <text x="50%" y="57%" fill="#6aab6d" fill-opacity="0.95" font-family="sans-serif"
        font-size="${noteSize}" font-weight="600" letter-spacing="4" text-anchor="middle">PLACEHOLDER</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });

for (const [name, width, height, from, to, caption] of targets) {
  const buffer = await sharp(Buffer.from(svg(width, height, from, to, caption)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  await writeFile(resolve(outDir, `${name}.jpg`), buffer);
  console.log(`  ${name}.jpg  ${width}x${height}  ${(buffer.length / 1024).toFixed(0)}KB`);
}

console.log(`\n${targets.length} placeholders written to src/assets/placeholders/`);
