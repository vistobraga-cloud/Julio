import { z } from 'zod';

/**
 * The single source of truth for every fact about the business.
 *
 * Nothing in this file may be duplicated anywhere else in the repo. No phone
 * number, no service area, no price range, no opening hour may appear as a
 * string literal in a template, a component or a JSON-LD block. The audit
 * script in scripts/seo-audit.mjs fails the build if it finds one.
 *
 * This exists because the audited predecessor project had the phone number
 * hardcoded into seven separate JSON-LD blocks, three of which were wrong.
 */

/* -------------------------------------------------------------------------- */
/*  Schemas                                                                    */
/* -------------------------------------------------------------------------- */

const phoneSchema = z
  .object({
    /** North American 10-digit subscriber number, digits only. */
    digits: z.string().regex(/^\d{10}$/, 'phone.digits must be 10 digits'),
    /** Country calling code without the plus sign. */
    countryCode: z.string().regex(/^\d{1,3}$/),
  })
  .transform((p) => ({
    ...p,
    /** Human-facing form. Used verbatim in visible copy and in NAP citations. */
    display: `(${p.digits.slice(0, 3)}) ${p.digits.slice(3, 6)}-${p.digits.slice(6)}`,
    /** schema.org / tel: form. */
    e164: `+${p.countryCode}${p.digits}`,
    /** wa.me expects the international number with no plus and no separators. */
    whatsappId: `${p.countryCode}${p.digits}`,
  }));

const openingHoursSchema = z
  .object({
    days: z
      .array(
        z.enum([
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ]),
      )
      .min(1),
    /** 24h "HH:MM". */
    opens: z.string().regex(/^\d{2}:\d{2}$/),
    closes: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .refine((h) => h.opens < h.closes, 'opening hours must open before they close');

const areaServedSchema = z.object({
  /** Full state name, as it should appear in prose and in schema.org. */
  name: z.string().min(2),
  /** USPS abbreviation, for compact copy such as "MA, RI & CT". */
  abbr: z.string().length(2),
});

const businessSchema = z.object({
  name: z.string().min(1),
  /** Apex origin, no trailing slash. Must equal `site` in astro.config.mjs — */
  /** the audit script asserts the two agree. */
  siteUrl: z.url().refine((u) => !u.endsWith('/'), 'siteUrl must not end in /'),
  tagline: z.string().min(1),

  phone: phoneSchema,
  email: z.email(),

  /**
   * Service-area business. The street address is deliberately absent: Julio
   * works out of his home in Fall River and the address must not be published,
   * on the site or in the Google Business Profile. Only the base locality and
   * region are ever exposed, and only as context.
   */
  base: z.object({
    locality: z.string().min(1),
    region: z.string().length(2),
  }),

  areaServed: z.array(areaServedSchema).min(1),
  openingHours: z.array(openingHoursSchema).min(1),
  /** Human phrasing of the same hours, for visible copy. */
  hoursDisplay: z.string().min(1),

  /** schema.org priceRange. A closed decision: "$$". */
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
  paymentAccepted: z.array(z.string().min(1)).min(1),

  /**
   * Only what is confirmed. The site states these and nothing else about
   * standing — it neither claims nor denies anything beyond them, because a
   * denial is still a mention. scripts/seo-audit.mjs fails the build on any
   * claim the site is not entitled to make.
   */
  credentials: z.object({
    insured: z.literal(true),
    backgroundChecked: z.literal(true),
  }),

  /**
   * schema.org sameAs. Emitted only when non-empty, so an unverified Google
   * Business Profile never produces a fabricated URL. Values arrive from env
   * (see .env.example) precisely so that an empty env means an empty array.
   */
  sameAs: z.array(z.url()),
});

export type Business = z.infer<typeof businessSchema>;

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

/** Only real, verified profile URLs. An unset variable yields no sameAs entry. */
const sameAs = [
  import.meta.env.PUBLIC_GBP_URL,
  import.meta.env.PUBLIC_THUMBTACK_URL,
].filter((url): url is string => typeof url === 'string' && url.startsWith('http'));

export const business: Business = businessSchema.parse({
  name: 'Aplus Assemblers',
  siteUrl: 'https://aplusassemblers.com',
  tagline: 'Furniture assembly, TV mounting and handyman work across MA, RI and CT.',

  phone: { digits: '7745598157', countryCode: '1' },
  email: 'hello@aplusassemblers.com',

  base: { locality: 'Fall River', region: 'MA' },

  areaServed: [
    { name: 'Massachusetts', abbr: 'MA' },
    { name: 'Rhode Island', abbr: 'RI' },
    { name: 'Connecticut', abbr: 'CT' },
  ],

  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
  hoursDisplay: 'Monday to Saturday, 8am to 8pm. Closed Sunday.',

  priceRange: '$$',
  paymentAccepted: ['Cash', 'Check', 'Venmo', 'Zelle'],

  credentials: {
    insured: true,
    backgroundChecked: true,
  },

  sameAs,
});

/* -------------------------------------------------------------------------- */
/*  Derived, read-only conveniences                                            */
/* -------------------------------------------------------------------------- */

/** "MA, RI & CT" — the compact form used in titles and headings. */
export const areaAbbrList: string = (() => {
  const abbrs = business.areaServed.map((a) => a.abbr);
  const last = abbrs[abbrs.length - 1];
  return abbrs.length > 1 ? `${abbrs.slice(0, -1).join(', ')} & ${last}` : (last ?? '');
})();

/** "Massachusetts, Rhode Island and Connecticut" — the prose form. */
export const areaNameList: string = (() => {
  const names = business.areaServed.map((a) => a.name);
  const last = names[names.length - 1];
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${last}` : (last ?? '');
})();
