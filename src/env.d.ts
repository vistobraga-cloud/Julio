/// <reference types="astro/client" />

/**
 * Typed public environment.
 *
 * Every one of these is optional. The site builds and runs with all of them
 * unset — analytics no-ops and schema.org sameAs stays empty rather than
 * publishing a guessed URL.
 *
 * Note: always read these with dot notation. The Astro compiler mis-parses
 * `import.meta.env['KEY']` inside .astro frontmatter, and Vite can only
 * statically replace the dotted form anyway.
 */
interface ImportMetaEnv {
  /** GA4 measurement ID, "G-XXXXXXXXXX". */
  readonly PUBLIC_GA4_ID?: string;
  /** Search Console HTML meta token. DNS TXT verification is preferred. */
  readonly PUBLIC_GSC_VERIFICATION?: string;
  /** Verified Thumbtack profile URL. Becomes a schema.org sameAs entry. */
  readonly PUBLIC_THUMBTACK_URL?: string;
  /** Verified Google Business Profile URL. Becomes a schema.org sameAs entry. */
  readonly PUBLIC_GBP_URL?: string;
  /** Google review short link, for the review-request CTA. */
  readonly PUBLIC_GOOGLE_REVIEW_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
