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
  /**
   * The region as it should appear in prose. Qualified where the radius only
   * reaches part of a state — "southeastern Massachusetts", not
   * "Massachusetts". An unqualified state name here would be a claim the
   * 50-mile radius does not support.
   */
  name: z.string().min(2),
  /** USPS abbreviation, for compact copy such as "MA, RI & CT". */
  abbr: z.string().length(2),
});

/**
 * The real shape of the service area: a circle, not a list of states.
 *
 * Julio goes to the job, and the job is somewhere different every day — an
 * hour to two hours of driving is a normal working day in this trade. What
 * bounds the business is drive time from Fall River, which is a radius.
 *
 * This matters for more than accuracy. A service-area business that declares
 * three whole states dilutes its own local relevance: the places that
 * actually matter (New Bedford, Taunton, Providence) compete for attention
 * with places Julio will never drive to. Google's local ranking rewards a
 * tight, plausible area, and the Business Profile service area must agree
 * with what the site says. Both now derive from this one circle.
 */
const serviceRadiusSchema = z.object({
  /** Decimal degrees. The centre of the circle, not a published address. */
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  miles: z.number().positive(),
});

/**
 * Counties, grouped by how the work actually schedules.
 *
 * The county is the unit the Google Business Profile wants — it accepts a
 * limited number of service areas, and one county stands in for a hundred
 * towns. It is also how a homeowner confirms "is he coming out to me".
 *
 * `tier` is the honest part. Two of these counties stick out of the circle
 * (Worcester runs to the New Hampshire line, Barnstable is the whole Cape)
 * and one sits just beyond it (New London). Declaring those wholesale would
 * rebuild the three-states problem at a smaller scale, so they carry a
 * qualifier and are excluded from the schema.org claim.
 */
const countySchema = z.object({
  name: z.string().min(3),
  state: z.string().length(2),
  /**
   * core    — inside roughly 35 miles, schedules fastest
   * regular — 35 to 55 miles, a normal working trip
   * edge    — partly outside the radius, or beyond it; needs the qualifier
   */
  tier: z.enum(['core', 'regular', 'edge']),
  /** Representative towns. Not exhaustive — the radius is the real boundary. */
  towns: z.array(z.string().min(2)).min(2),
  /** Required on `edge`: what makes this one different. */
  note: z.string().min(20).optional(),
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
  serviceRadius: serviceRadiusSchema,
  serviceCounties: z
    .array(countySchema)
    .min(1)
    .refine(
      (list) => list.every((c) => c.tier !== 'edge' || typeof c.note === 'string'),
      'every edge county needs a note saying what makes it an edge case',
    ),
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
  tagline:
    'Furniture assembly, fitness equipment, TV mounting and handyman work within 50 miles of Fall River, MA.',

  phone: { digits: '7745598157', countryCode: '1' },
  email: 'hello@aplusassemblers.com',

  base: { locality: 'Fall River', region: 'MA' },

  // Qualified on purpose. The 50-mile circle covers Rhode Island almost
  // entirely, the southeastern third of Massachusetts, and only the
  // southeastern corner of Connecticut. Saying "Massachusetts" flat would
  // claim Pittsfield, 160 miles away.
  areaServed: [
    { name: 'Rhode Island', abbr: 'RI' },
    { name: 'southeastern Massachusetts', abbr: 'MA' },
    { name: 'eastern Connecticut', abbr: 'CT' },
  ],

  // Fall River, MA. The centre of the circle — never a street address.
  serviceRadius: { lat: 41.7015, lng: -71.155, miles: 50 },

  serviceCounties: [
    {
      name: 'Bristol County',
      state: 'MA',
      tier: 'core',
      towns: [
        'Fall River',
        'New Bedford',
        'Taunton',
        'Attleboro',
        'Dartmouth',
        'Somerset',
        'Swansea',
        'Westport',
        'Fairhaven',
        'Seekonk',
      ],
    },
    {
      name: 'Providence County',
      state: 'RI',
      tier: 'core',
      towns: [
        'Providence',
        'Cranston',
        'Pawtucket',
        'East Providence',
        'Woonsocket',
        'Cumberland',
        'Johnston',
        'North Providence',
      ],
    },
    {
      name: 'Bristol County',
      state: 'RI',
      tier: 'core',
      towns: ['Bristol', 'Warren', 'Barrington'],
    },
    {
      name: 'Newport County',
      state: 'RI',
      tier: 'core',
      towns: ['Newport', 'Middletown', 'Portsmouth', 'Tiverton', 'Jamestown', 'Little Compton'],
    },
    {
      name: 'Kent County',
      state: 'RI',
      tier: 'core',
      towns: ['Warwick', 'West Warwick', 'Coventry', 'East Greenwich'],
    },
    {
      name: 'Plymouth County',
      state: 'MA',
      tier: 'regular',
      towns: [
        'Brockton',
        'Plymouth',
        'Bridgewater',
        'Middleborough',
        'Wareham',
        'Mattapoisett',
        'Marion',
        'Lakeville',
      ],
    },
    {
      name: 'Norfolk County',
      state: 'MA',
      tier: 'regular',
      towns: ['Quincy', 'Braintree', 'Franklin', 'Foxborough', 'Sharon', 'Canton', 'Milton'],
    },
    {
      name: 'Washington County',
      state: 'RI',
      tier: 'regular',
      towns: ['North Kingstown', 'South Kingstown', 'Narragansett', 'Westerly', 'Charlestown'],
    },
    {
      name: 'Suffolk County',
      state: 'MA',
      tier: 'regular',
      towns: ['Boston', 'Dorchester', 'South Boston', 'Charlestown', 'Roxbury'],
    },
    {
      name: 'Worcester County',
      state: 'MA',
      tier: 'edge',
      towns: ['Milford', 'Uxbridge', 'Northbridge', 'Grafton', 'Sutton', 'Worcester'],
      note: 'The eastern half only. The county runs to the New Hampshire line, which is well past where I go.',
    },
    {
      name: 'Barnstable County',
      state: 'MA',
      tier: 'edge',
      towns: ['Bourne', 'Sandwich', 'Falmouth', 'Mashpee', 'Barnstable'],
      note: 'Cape Cod, up to about Hyannis. The bridge is the real cost, not the mileage, so these get booked early in the day.',
    },
    {
      name: 'New London County',
      state: 'CT',
      tier: 'edge',
      towns: ['New London', 'Norwich', 'Groton', 'Stonington', 'Mystic'],
      note: 'Just past the 50-mile line. Still worth doing, but it carries a travel charge and usually needs a full day booked around it.',
    },
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

/** 50 → 80467. schema.org GeoCircle wants metres. */
export const serviceRadiusMeters: number = Math.round(business.serviceRadius.miles * 1609.344);

/** "50 miles" — the phrase used in visible copy, derived so it cannot drift. */
export const radiusDisplay = `${business.serviceRadius.miles} miles`;

/** Counties split by how the work actually schedules. */
export const countiesByTier = {
  core: business.serviceCounties.filter((c) => c.tier === 'core'),
  regular: business.serviceCounties.filter((c) => c.tier === 'regular'),
  edge: business.serviceCounties.filter((c) => c.tier === 'edge'),
} as const;

/**
 * The counties the schema.org node is entitled to claim outright.
 *
 * `edge` is excluded by construction: those three are partly or wholly
 * outside the circle, and a machine-readable claim has no room for the
 * qualifier that makes them honest. They appear in prose, where the caveat
 * can travel with them.
 */
export const schemaCounties = [...countiesByTier.core, ...countiesByTier.regular];

/** Every town named anywhere in the county table, deduped and sorted. */
export const servedTowns: string[] = [
  ...new Set(business.serviceCounties.flatMap((c) => c.towns)),
].sort((a, b) => a.localeCompare(b));
