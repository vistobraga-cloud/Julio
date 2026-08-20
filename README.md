# Aplus Assemblers

Static site for Aplus Assemblers — furniture assembly, fitness equipment
assembly, TV mounting, handyman work, finish carpentry and custom cabinetry
across Massachusetts, Rhode Island and Connecticut.

Astro 5 · React (one island, Phase 3 only) · Tailwind 4 · Zod · Vercel.

```bash
npm install
npm run dev      # localhost:4321
npm run build    # astro build + SEO audit; the audit can fail the build
npm run check    # TypeScript and Astro diagnostics
```

## The rules this repo enforces mechanically

Prose rules rot. Each of these is a build failure, not a checklist item.

| Rule | Enforced by |
|---|---|
| No phone, price, hours or area outside `src/data/` | `src/data/business.ts` is the only source; `lib/contact.ts` builds every link |
| Title ≤ 60 chars, description 120–158 | Zod schemas on the data, re-checked against `dist/` by `scripts/seo-audit.mjs` |
| Meta descriptions never cut mid-word | `truncateAtWord()` in `src/lib/seo.ts`, written before any template |
| Exactly one `<h1>`, absolute canonical | audit script, per built page |
| No two pages target the same keyword | `primaryKeyword` uniqueness in `src/data/index.ts` |
| No broken internal links | related slugs validated against the real collections in `src/data/index.ts` |
| No page duplicates another's copy | 8-word shingle overlap check in the audit script |
| Cross-links are reciprocal (services and brands) | `checkReciprocalLinks` in `src/data/index.ts` |
| Every brand page states its independence | independence-statement check in the audit script |
| No asset is named after a trademark | trademark-token check in the audit script |
| No "official" / "authorized" / "certified installer" on brand pages | affiliation-language check in the audit script |
| No licensure claim (he holds no HIC) | forbidden-phrase check in the audit script |
| No mention of trades he does not offer | out-of-scope trade check in the audit script |
| No `aggregateRating` in JSON-LD | audit script; see below |
| Images always carry width/height and alt | audit script |
| Fonts self-hosted, never Google Fonts | audit script |

## Decisions worth knowing before you change something

**The rating is never marked up.** 4.9 stars from 184 reviews was earned on
Thumbtack. Emitting it as schema.org `aggregateRating` on our own business node
is self-serving review markup over third-party reviews — against Google's
guidelines, ineligible for rich results since 2019, and a manual-action risk.
It appears in visible HTML with the source named. See `src/lib/schema.ts`.

**Scope is stated positively, or not at all.** The site says what Julio does
and what is confirmed about him — insured, background checked, ten years, the
social proof — and nothing else. It makes no claim about standing beyond that,
and it does not deny anything either, because a denial is still a mention.
Pre-emptively disowning a trade he never sold drags a page's relevance toward
queries he cannot serve and reads as defensive. The audit fails the build on
both directions.

**Third-party brands: independent, never endorsed.** Brand pages use registered
marks in their title, heading and URL, which is lawful nominative fair use only
while two things hold. No logo anywhere — brand pages reuse their parent
service's generic photograph, and the audit rejects any asset filename
containing a trademark token. And every brand page carries the independence
statement from `independenceStatement()` in `src/data/brands.ts`, matched
verbatim by the audit. Language is "independent", "I assemble", "experienced
with"; never "official", "authorized", "certified installer" or "partner".

**Publication is gated per page.** Every content entry has `published: boolean`.
Unpublished entries are not emitted to `dist/` at all in a production build, so
they cannot reach the sitemap. In `astro dev` everything renders, so drafts stay
previewable. This exists so 60 pages can go live in waves rather than in one
drop on a new domain.

**`src/data/*.ts` is the only content system.** No Content Collections. The
content here is structured (subcategory lists, FAQ arrays, cross-references),
which is a TypeScript object, not Markdown frontmatter — and it lets Zod
validate relationships across files.

**No street address anywhere.** Service-area business. Only locality and region
are published, in the site and in the Google Business Profile.

**`sameAs` is empty until a profile really exists.** It is built from env vars
(`PUBLIC_GBP_URL`, `PUBLIC_THUMBTACK_URL`); unset means the key is omitted from
the JSON-LD entirely. Never guess a URL.

## Layout

```
src/
  data/          business, handyman, services, staticPages — all Zod-validated
    index.ts     cross-file integrity checks, run on every build
  lib/
    seo.ts       truncateAtWord, canonical, title/description limits
    contact.ts   tel:, sms:, wa.me and mailto hrefs, all derived from business
    schema.ts    schema.org builders
    nav.ts       routes; BOOK_PATH flips to /book in Phase 3
  components/    Header, Footer, StickyBar, Faq, CtaPair, ProofBar, Analytics
  layouts/       BaseLayout — the only place head, canonical and JSON-LD exist
  pages/
scripts/
  seo-audit.mjs           post-build gate
  make-placeholders.mjs   generates src/assets/placeholders/*.jpg
  make-brand-assets.mjs   logo.jpeg / favicon.jpeg → web assets and favicons
```

## Environment

Everything is optional; the site builds with all of it unset. Copy
`.env.example` to `.env`.

- `PUBLIC_GA4_ID` — no analytics script is emitted without it
- `PUBLIC_GSC_VERIFICATION` — fallback only; prefer DNS TXT verification
- `PUBLIC_GBP_URL`, `PUBLIC_THUMBTACK_URL` — become schema.org `sameAs`
- `PUBLIC_GOOGLE_REVIEW_URL` — the review-request short link

## Images

Placeholders are real JPEGs stamped `PLACEHOLDER`, so the astro:assets pipeline
(AVIF + WebP, inferred dimensions, zero layout shift) is genuinely exercised
now. Replacing them with Julio's photos is a file swap at the same path and the
same aspect ratio — no template changes.

## Analytics

`contact_click` fires on every `tel:`, `sms:`, `mailto:` and `wa.me` click, with
`method` and a `placement` naming the control (hero, sticky bar, footer, and so
on). gtag.js loads after idle or on first interaction, so measurement does not
spend the Core Web Vitals budget.

## Roadmap

Done: scaffold, data layer, layout, `/`, `/about`, `/services` + seven service
pages, `/book`, `/contact`, `/privacy-policy`, `/terms`, 404, robots, sitemap,
schema, analytics.

Brands: all 20 published across three categories. 36 pages total.

Then, in order:

1. `problems.ts` + 15 pages — middle of funnel
2. `cityPages.ts` + 10 local pages — last, because they need real local
   research and are the likeliest to come out generic. By then Search Console
   shows which towns actually produce impressions.

Two brand slugs are categories rather than marks — `power-rack-assembly` and
`standing-desk-assembly`. They name Rogue, REP Fitness, Titan and Uplift,
FlexiSpot, Autonomous in the body only, never in a title or a URL: same search
capture, less brand exposure.

Deferred: syncing the scheduler with Julio's Google Calendar. That needs OAuth
and a server, and the front-end flow works without it.

Outside the code, and more important than any of it: create the Google Business
Profile, and start asking every customer for a Google review.
