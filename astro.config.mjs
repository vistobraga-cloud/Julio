// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// The canonical origin. Every canonical URL, the sitemap and the robots.txt
// derive from this single value — there is no other place a domain is written.
const SITE = 'https://aplusassemblers.com';

export default defineConfig({
  site: SITE,
  output: 'static',

  // Apex domain, no trailing slash, paired with `cleanUrls` in vercel.json.
  // Astro, the sitemap and every internal <a> then agree on one URL shape,
  // which is what keeps duplicate-URL canonicals from appearing at all.
  trailingSlash: 'never',
  build: { format: 'file' },

  // ~1KB of JS, no framework. Warms the next document on hover/tap-intent.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  integrations: [
    // React is loaded for exactly one island: the /book scheduler (Phase 3).
    // No content page ships a byte of it.
    react(),
    // Icons compile to inline <svg> at build time — zero runtime JS. This
    // replaces hand-drawn icon paths that were duplicated across Header,
    // ContactButtons and StickyBar with one Phosphor-backed <Icon> component.
    icon(),
    sitemap({
      changefreq: 'monthly',
      lastmod: new Date(),
      // Unpublished pages are never emitted to dist at all (see the `published`
      // flag in src/data), so the sitemap cannot drift out of sync with what
      // actually exists. The only exclusions here are legal boilerplate.
      filter: (page) =>
        !page.endsWith('/privacy-policy') && !page.endsWith('/terms'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    // AVIF first, WebP fallback, original last — handled per <Image /> call.
    responsiveStyles: true,
    layout: 'constrained',
  },
});
