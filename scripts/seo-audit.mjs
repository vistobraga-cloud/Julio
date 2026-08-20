/**
 * Post-build SEO audit. Runs against dist/, the HTML that actually ships.
 *
 * Every check here corresponds to a finding from the audit of the predecessor
 * project. Those findings were not caused by carelessness — they were caused
 * by nothing checking. Prose rules rot; a non-zero exit code does not.
 *
 * Failures block the build. Warnings are printed and allowed through.
 *
 * Run: npm run audit   (or automatically as part of npm run build)
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(root, 'dist');

const TITLE_MAX = 60;
const DESCRIPTION_MIN = 120;
const DESCRIPTION_MAX = 158;

/** Minimum body word count, by route shape. */
const WORD_MINIMUMS = [
  { match: /^\/services\/[^/]+-(boston|quincy|brockton|new-bedford|providence|cranston|warwick|new-london)$/, min: 450 },
  { match: /^\/services\/[^/]+$/, min: 450 },
  { match: /^\/brands\/[^/]+$/, min: 400 },
  { match: /^\/problems\/[^/]+$/, min: 400 },
];

/**
 * Credential claims Julio cannot make. He holds no Massachusetts Home
 * Improvement Contractor registration, and the site must never imply one.
 * A bare mention of "licensed" is only warned about, because legitimately
 * saying "that needs a licensed electrician" is honest and useful.
 */
const FORBIDDEN_CLAIMS = [
  { pattern: /\bHIC\b/g, why: 'HIC registration is claimed or referenced' },
  { pattern: /licen[cs]ed\s+(and|&)\s+insured/gi, why: '"licensed and insured" claim' },
  { pattern: /fully\s+licen[cs]ed/gi, why: '"fully licensed" claim' },
  { pattern: /\b(we|i)\s+(are|am)\s+licen[cs]ed/gi, why: 'direct licensure claim' },
  { pattern: /licen[cs]e\s*(#|no\.?|number)/gi, why: 'a licence number is shown' },
  { pattern: /registered\s+contractor/gi, why: '"registered contractor" claim' },
];

const SOFT_FLAGS = [{ pattern: /licen[cs]/gi, why: 'mentions licensing' }];

/**
 * Trades the business does not offer and never has.
 *
 * Claiming a credential he lacks is one failure mode. Pre-emptively denying a
 * trade he never sold is the mirror image of it, and it costs real money: it
 * drops "electrical" and "plumbing" into a page about hanging pictures, pulls
 * the page's semantic relevance toward queries he cannot serve, and brings in
 * visitors who bounce immediately. It also reads as defensive.
 *
 * Scope is stated positively, or not at all. Both directions are errors.
 */
const OUT_OF_SCOPE_TRADES = [
  { pattern: /\belectricians?\b/gi, why: 'electrical work' },
  { pattern: /\belectrical\s+(work|services?|jobs?|contractor)\b/gi, why: 'electrical work' },
  { pattern: /\bplumbers?\b/gi, why: 'plumbing' },
  { pattern: /\bplumbing\b/gi, why: 'plumbing' },
  { pattern: /\b(hvac|roofing|roofers?)\b/gi, why: 'a trade outside the service list' },
];

/*
 * Deliberately NOT matched: bare "wiring", "cable" or "outlet". A treadmill
 * console has wiring and a TV needs an outlet nearby — describing the product
 * in front of him is not the same as advertising, or disowning, a trade. The
 * rule targets the trade nouns, not every electrical-adjacent word.
 */

/* -------------------------------------------------------------------------- */
/*  Trademark rules for /brands/*                                              */
/* -------------------------------------------------------------------------- */

/**
 * Twenty pages will use third-party registered marks in their title, heading
 * and URL. That is lawful nominative fair use, and it stays lawful only while
 * the page carries no logo and states its independence plainly.
 *
 * Note this does NOT contradict the out-of-scope-trade rule above. They are
 * opposite situations: denying a service he never sold is noise, while
 * declaring non-affiliation with a mark used commercially is a requirement.
 */
const INDEPENDENCE_ANCHOR =
  'is an independent assembly service and is not affiliated with, authorized by, or endorsed by';

/** Language that implies an endorsement relationship that does not exist. */
const AFFILIATION_CLAIMS = [
  { pattern: /\bofficial\b/gi, why: '"official"' },
  { pattern: /\bcertified\s+(installer|assembler|technician|partner)\b/gi, why: '"certified …"' },
  { pattern: /\b(authorized|authorised)\s+(dealer|installer|service|retailer|partner)\b/gi, why: '"authorized …"' },
  { pattern: /\b(brand|retail|official)\s+partner\b/gi, why: '"partner"' },
];

/**
 * Trademark tokens, read straight out of brands.ts so the two cannot drift.
 * No asset filename may contain one — a file called `peloton-hero.jpg` is a
 * brand logo waiting to happen, and a logo implies endorsement.
 */
/**
 * Category words that appear inside multi-word trademarks but carry no brand
 * identity of their own. "REP Fitness" must not make `fitness` a banned token,
 * or the generic `fitness-equipment-assembly.jpg` that every fitness brand page
 * legitimately reuses gets flagged as a logo.
 */
const GENERIC_TRADEMARK_WORDS = new Set([
  'fitness',
  'furniture',
  'assembly',
  'equipment',
  'discount',
  'services',
  'installation',
  'home',
  'group',
  'company',
  'brands',
]);

async function trademarkTokens() {
  let source;
  try {
    source = await readFile(resolve(root, 'src/data/brands.ts'), 'utf8');
  } catch {
    return [];
  }

  const tokens = new Set();
  for (const block of source.matchAll(/trademarks:\s*\[([^\]]*)\]/g)) {
    for (const quoted of block[1].matchAll(/['"]([^'"]+)['"]/g)) {
      for (const word of quoted[1].toLowerCase().split(/[^a-z0-9]+/)) {
        if (word.length >= 4 && !GENERIC_TRADEMARK_WORDS.has(word)) tokens.add(word);
      }
    }
  }
  return [...tokens];
}

const TRADEMARK_TOKENS = await trademarkTokens();

const errors = [];
const warnings = [];

function fail(route, message) {
  errors.push(`${route}\n      ${message}`);
}
function warn(route, message) {
  warnings.push(`${route}\n      ${message}`);
}

/* -------------------------------------------------------------------------- */
/*  helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full)));
    else if (extname(entry.name) === '.html') found.push(full);
  }
  return found;
}

function routeOf(file) {
  const rel = relative(distDir, file).replace(/\\/g, '/');
  const route = `/${rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '')}`;
  return route === '/' ? '/' : route.replace(/\/$/, '') || '/';
}

/**
 * Read an attribute value, matching the closing quote to the opening one.
 *
 * The naive form — content=["']([^"']*)["'] — silently truncates at the first
 * apostrophe inside a double-quoted value, so a description mentioning
 * "Bob's Discount Furniture" was reported as 102 characters when it was 140.
 * That is a false failure, and a false failure erodes trust in every other
 * check in this file.
 */
const attr = (html, pattern, name) => {
  const re = new RegExp(`<${pattern}[^>]*\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i');
  return html.match(re)?.[2] ?? null;
};

function bodyText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Word shingles, for detecting two pages that say the same thing. */
function shingles(text, size = 8) {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean);
  const out = new Set();
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(' '));
  return out;
}

/* -------------------------------------------------------------------------- */
/*  checks                                                                     */
/* -------------------------------------------------------------------------- */

let files;
try {
  await stat(distDir);
  files = await walk(distDir);
} catch {
  console.error('\n  dist/ not found. Run `astro build` first.\n');
  process.exit(1);
}

const pages = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();

for (const file of files) {
  const route = routeOf(file);
  const html = await readFile(file, 'utf8');
  const text = bodyText(html);

  /* --- title ----------------------------------------------------------- */
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  if (!title) fail(route, 'no <title>');
  else if (title.length > TITLE_MAX)
    fail(route, `title is ${title.length} chars (max ${TITLE_MAX}): "${title}"`);

  if (title) {
    const previous = seenTitles.get(title);
    if (previous) fail(route, `duplicate <title>, shared with ${previous}`);
    else seenTitles.set(title, route);
  }

  /* --- description ------------------------------------------------------ */
  const description = attr(html, 'meta[^>]*name=["\']description["\']', 'content') ?? '';

  if (!description) {
    fail(route, 'no meta description');
  } else {
    if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX)
      fail(
        route,
        `description is ${description.length} chars (want ${DESCRIPTION_MIN}-${DESCRIPTION_MAX})`,
      );

    // The predecessor's signature bug: a description cut mid-word.
    if (/[a-z]…$/i.test(description) && !/\s\S{1,3}…$/.test(description))
      warn(route, `description may end mid-word: "…${description.slice(-40)}"`);

    const previous = seenDescriptions.get(description);
    if (previous) fail(route, `duplicate meta description, shared with ${previous}`);
    else seenDescriptions.set(description, route);
  }

  /* --- headings --------------------------------------------------------- */
  const h1s = html.match(/<h1\b[^>]*>/gi) ?? [];
  if (h1s.length === 0) fail(route, 'no <h1>');
  else if (h1s.length > 1) fail(route, `${h1s.length} <h1> elements, expected exactly 1`);

  /* --- canonical -------------------------------------------------------- */
  const canonical = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
  )?.[1];

  if (!canonical) fail(route, 'no canonical link');
  else if (!/^https:\/\//.test(canonical))
    fail(route, `canonical is not absolute: "${canonical}"`);
  else {
    const previous = seenCanonicals.get(canonical);
    if (previous) fail(route, `canonical "${canonical}" also claimed by ${previous}`);
    else seenCanonicals.set(canonical, route);
  }

  /* --- images ----------------------------------------------------------- */
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag))
      fail(route, `<img> without width/height (layout shift): ${tag.slice(0, 110)}`);
    if (!/\balt\s*=/.test(tag))
      fail(route, `<img> without alt: ${tag.slice(0, 110)}`);
  }

  /* --- no external font or stylesheet hosts ----------------------------- */
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html))
    fail(route, 'links to Google Fonts — fonts must be self-hosted');

  /* --- credential claims ------------------------------------------------ */
  for (const rule of FORBIDDEN_CLAIMS) {
    if (rule.pattern.test(text)) fail(route, `forbidden credential claim: ${rule.why}`);
    rule.pattern.lastIndex = 0;
  }
  for (const rule of SOFT_FLAGS) {
    if (rule.pattern.test(text)) warn(route, `${rule.why} — confirm the wording is a denial`);
    rule.pattern.lastIndex = 0;
  }

  /* --- trades the business does not offer ------------------------------- */
  for (const rule of OUT_OF_SCOPE_TRADES) {
    const hit = text.match(rule.pattern);
    rule.pattern.lastIndex = 0;
    if (hit)
      fail(
        route,
        `mentions ${rule.why} ("${hit[0]}"). He does not offer it, so there is nothing ` +
          `to disclaim — the mention only pulls relevance toward queries he cannot serve. ` +
          `State the scope positively instead.`,
      );
  }

  /* --- trademark position on brand pages -------------------------------- */
  if (route.startsWith('/brands/')) {
    if (!text.includes(INDEPENDENCE_ANCHOR)) {
      fail(
        route,
        'brand page with no independence statement. Using a third-party mark in the ' +
          'title, heading and URL is nominative fair use only while the page states ' +
          'plainly that it is not affiliated. Render <BrandDisclaimer>.',
      );
    }

    // The disclaimer itself contains "authorized by" — strip it before looking
    // for affiliation language, or the required text would fail its own check.
    const prose = text.split(INDEPENDENCE_ANCHOR).join(' ');

    for (const rule of AFFILIATION_CLAIMS) {
      const hit = prose.match(rule.pattern);
      rule.pattern.lastIndex = 0;
      if (hit)
        fail(
          route,
          `uses ${rule.why} ("${hit[0]}"), which implies an endorsement relationship ` +
            `that does not exist. Use "independent", "I assemble" or "experienced with".`,
        );
    }
  }

  /* --- no asset may be named after a brand ------------------------------ */
  if (TRADEMARK_TOKENS.length > 0) {
    const assetUrls = [
      ...[...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => m[1]),
      ...[...html.matchAll(/\bsrcset=["']([^"']+)["']/gi)].map((m) => m[1]),
      ...[...html.matchAll(/<link[^>]*\brel=["'](?:icon|apple-touch-icon)["'][^>]*\bhref=["']([^"']+)["']/gi)].map((m) => m[1]),
      ...[...html.matchAll(/<meta[^>]*\bproperty=["']og:image["'][^>]*\bcontent=["']([^"']+)["']/gi)].map((m) => m[1]),
    ].join(' ').toLowerCase();

    for (const token of TRADEMARK_TOKENS) {
      if (assetUrls.includes(token))
        fail(
          route,
          `an image asset is named after the trademark "${token}". Brand logos are never ` +
            `used on this site — a logo implies endorsement. Brand pages reuse their ` +
            `parent service's generic photograph.`,
        );
    }
  }

  /* --- self-serving review markup --------------------------------------- */
  if (/"aggregateRating"/.test(html))
    fail(
      route,
      'aggregateRating in JSON-LD. The reviews were earned on Thumbtack; marking them ' +
        'up here is self-serving review markup and against Google policy.',
    );

  /* --- word count ------------------------------------------------------- */
  const words = text ? text.split(' ').length : 0;
  const rule = WORD_MINIMUMS.find((r) => r.match.test(route));
  if (rule && words < rule.min)
    fail(route, `${words} words of body copy, minimum ${rule.min} for this page type`);

  pages.push({ route, words, text });
}

/* --- cross-page duplication ---------------------------------------------- */
/* The brief's approval test, mechanised: if swapping two pages' subjects would
   leave the text making sense, they are too similar. */

const indexed = pages
  .filter((p) => p.words > 250)
  .map((p) => ({ route: p.route, grams: shingles(p.text) }));

for (let i = 0; i < indexed.length; i++) {
  for (let j = i + 1; j < indexed.length; j++) {
    const a = indexed[i];
    const b = indexed[j];
    const smaller = a.grams.size < b.grams.size ? a.grams : b.grams;
    const larger = smaller === a.grams ? b.grams : a.grams;
    if (smaller.size === 0) continue;

    let shared = 0;
    for (const gram of smaller) if (larger.has(gram)) shared++;
    const overlap = shared / smaller.size;

    if (overlap > 0.5)
      errors.push(
        `${a.route} vs ${b.route}\n      ${(overlap * 100).toFixed(0)}% of body copy is shared. ` +
          `These read as the same page with a noun swapped — rewrite one.`,
      );
    else if (overlap > 0.3)
      warnings.push(
        `${a.route} vs ${b.route}\n      ${(overlap * 100).toFixed(0)}% shared body copy.`,
      );
  }
}

/* --- endpoints ------------------------------------------------------------ */

for (const required of ['robots.txt', 'sitemap-index.xml', '404.html']) {
  try {
    await stat(resolve(distDir, required));
  } catch {
    errors.push(`dist/${required}\n      missing from the build output`);
  }
}

/* --- config consistency --------------------------------------------------- */

const config = await readFile(resolve(root, 'astro.config.mjs'), 'utf8');
const configSite = config.match(/const SITE = '([^']+)'/)?.[1];
const businessFile = await readFile(resolve(root, 'src/data/business.ts'), 'utf8');
const dataSite = businessFile.match(/siteUrl:\s*'([^']+)'/)?.[1];

if (configSite && dataSite && configSite !== dataSite)
  errors.push(
    `origin mismatch\n      astro.config.mjs says ${configSite}, business.ts says ${dataSite}`,
  );

/* -------------------------------------------------------------------------- */
/*  report                                                                     */
/* -------------------------------------------------------------------------- */

console.log(`\n  SEO audit — ${pages.length} pages\n`);

if (warnings.length) {
  console.log(`  ${warnings.length} warning${warnings.length === 1 ? '' : 's'}:`);
  for (const w of warnings) console.log(`    ! ${w}`);
  console.log('');
}

if (errors.length) {
  console.log(`  ${errors.length} error${errors.length === 1 ? '' : 's'}:`);
  for (const e of errors) console.log(`    x ${e}`);
  console.log('\n  Build rejected.\n');
  process.exit(1);
}

console.log('  All checks passed.\n');
