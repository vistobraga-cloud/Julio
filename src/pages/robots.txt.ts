import type { APIRoute } from 'astro';
import { business } from '@data/business';

/**
 * robots.txt, generated rather than hand-written so the sitemap URL can never
 * drift from the real origin.
 *
 * Everything is allowed. There is nothing on this site worth hiding from a
 * crawler, and a stray Disallow is a far more common cause of missing pages
 * than crawl budget ever is.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(business.siteUrl)).origin;

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
