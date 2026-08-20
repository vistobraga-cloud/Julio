/**
 * SEO text utilities.
 *
 * This module exists before any template that renders a meta description, and
 * that ordering is deliberate. In the audited predecessor project the
 * descriptions were truncated by hand, which produced tags cut mid-word —
 * "Professional furniture assembly serv". Once templates exist, that helper
 * never gets written; it only gets remembered.
 */

/** Google's practical limits. Enforced by the Zod schemas and re-checked in dist. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 120;
export const DESCRIPTION_MAX = 158;

/**
 * Truncate to a maximum length, always breaking on a word boundary.
 *
 * The returned string, ellipsis included, is never longer than `maxLength`.
 * Trailing punctuation left dangling by the cut is removed, so the result
 * reads as a clipped phrase rather than a broken one.
 *
 *   truncateAtWord('Furniture assembly across MA, RI and CT', 20)
 *   // → 'Furniture assembly…'   (not 'Furniture assembly a…')
 *
 * A single word longer than the budget is the only case that cuts mid-word,
 * because there is no boundary to break on.
 */
export function truncateAtWord(input: string, maxLength: number, ellipsis = '…'): string {
  const text = input.replace(/\s+/g, ' ').trim();

  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return text;

  const budget = maxLength - ellipsis.length;
  if (budget <= 0) return ellipsis.slice(0, maxLength);

  // The extra character lets us detect a space sitting exactly on the boundary,
  // so a clean break there is not thrown away.
  const window = text.slice(0, budget + 1);
  const lastSpace = window.lastIndexOf(' ');

  const cut = lastSpace > 0 ? text.slice(0, lastSpace) : text.slice(0, budget);

  return stripTrailingPunctuation(cut) + ellipsis;
}

function stripTrailingPunctuation(value: string): string {
  return value.replace(/[\s,;:.!?–—-]+$/u, '');
}

/**
 * Fit a title to the SERP limit. Prefers dropping the brand suffix whole over
 * clipping it, because "… | Aplus Assem…" is worse than no suffix at all.
 */
export function buildTitle(pageTitle: string, brand: string, separator = ' | '): string {
  const full = `${pageTitle}${separator}${brand}`;
  if (full.length <= TITLE_MAX) return full;
  if (pageTitle.length <= TITLE_MAX) return pageTitle;
  return truncateAtWord(pageTitle, TITLE_MAX);
}

/**
 * Normalise a description into the usable band. Anything already inside the
 * band passes through untouched; anything over is cut on a word boundary.
 *
 * Short descriptions are not padded — there is no honest way to do that — so
 * they surface as an audit failure instead of being silently accepted.
 */
export function buildDescription(input: string): string {
  return truncateAtWord(input.replace(/\s+/g, ' ').trim(), DESCRIPTION_MAX);
}

/**
 * Absolute canonical URL.
 *
 * `origin` always comes from Astro.site, which comes from astro.config.mjs.
 * The domain is never written as a literal in a template.
 */
export function canonical(pathname: string, origin: URL | string): string {
  const base = typeof origin === 'string' ? origin : origin.href;

  // With build.format 'file', Astro.url.pathname carries the emitted filename
  // (/services/tv-mounting.html). Vercel's cleanUrls serves that at the
  // extensionless path, so the canonical must name the extensionless path too
  // — otherwise every page canonicalises to a URL nobody links to.
  const cleaned = pathname
    .replace(/\.html$/i, '')
    .replace(/\/index$/i, '/')
    .replace(/^\/+|\/+$/g, '');

  const path = cleaned === '' ? '/' : `/${cleaned}`;
  return new URL(path, base).href;
}

/** Rough word count of plain text. Used by the content-length audit. */
export function wordCount(text: string): number {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned === '' ? 0 : cleaned.split(' ').length;
}
