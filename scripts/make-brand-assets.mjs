/**
 * Turns the two supplied brand JPEGs into web assets.
 *
 * Both source files are 1772x1772 with a large white margin — logo.jpeg is
 * 63KB for a mark that displays at about 40px tall. Shipping that as-is is
 * precisely the finding from the audited predecessor project: a 10000px image
 * rendered at 32px. So the source is trimmed, keyed off its white background,
 * and written at the size it is actually used, once.
 *
 * Run: npm run brand
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = resolve(root, 'src/assets/brand');
const publicDir = resolve(root, 'public');

/**
 * Replace the white studio background with transparency.
 *
 * Hard cut above `clear`, a linear ramp down to `keep` so anti-aliased glyph
 * edges do not turn into a jagged outline.
 */
async function keyOutWhite(input, { clear = 244, keep = 216 } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (min >= clear) {
      data[i + 3] = 0;
    } else if (min > keep) {
      data[i + 3] = Math.round(((clear - min) / (clear - keep)) * 255);
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

await mkdir(assetsDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

/* ---- horizontal logo, for the header and footer ------------------------- */

const trimmedLogo = await sharp(resolve(root, 'logo.jpeg'))
  .trim({ threshold: 12 })
  .toBuffer();

const logo = await (await keyOutWhite(trimmedLogo))
  .resize({ width: 720 })
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(resolve(assetsDir, 'logo.png'), logo);
const logoMeta = await sharp(logo).metadata();
console.log(`  logo.png  ${logoMeta.width}x${logoMeta.height}  ${(logo.length / 1024).toFixed(0)}KB`);

/* ---- the A+ mark, for favicons and social ------------------------------- */

const trimmedMark = await sharp(resolve(root, 'favicon.jpeg'))
  .trim({ threshold: 12 })
  .toBuffer();

const markMeta = await sharp(trimmedMark).metadata();
const side = Math.round(Math.max(markMeta.width, markMeta.height) * 1.14);

// Square the mark with even breathing room so it does not touch the edge of a
// browser tab or a home-screen icon.
const squareMark = await (await keyOutWhite(trimmedMark))
  .resize({
    width: side,
    height: side,
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await writeFile(resolve(assetsDir, 'mark.png'), await sharp(squareMark).resize(512).png().toBuffer());

for (const size of [16, 32, 192, 512]) {
  const buffer = await sharp(squareMark)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(publicDir, `favicon-${size}.png`), buffer);
  console.log(`  favicon-${size}.png  ${(buffer.length / 1024).toFixed(1)}KB`);
}

// iOS ignores transparency and composites onto black, so this one gets a
// deliberate white plate.
const appleIcon = await sharp(squareMark)
  .resize(180, 180)
  .flatten({ background: '#ffffff' })
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(resolve(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log(`  apple-touch-icon.png  ${(appleIcon.length / 1024).toFixed(1)}KB`);

/* ---- Open Graph card ---------------------------------------------------- */

const ogCard = await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: '#ffffff',
  },
})
  .composite([
    {
      input: await sharp(await (await keyOutWhite(trimmedLogo)).toBuffer())
        .resize({ width: 820 })
        .toBuffer(),
      gravity: 'centre',
    },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toBuffer();

await writeFile(resolve(publicDir, 'og-default.jpg'), ogCard);
console.log(`  og-default.jpg  1200x630  ${(ogCard.length / 1024).toFixed(0)}KB`);

console.log('\nBrand assets written.');
