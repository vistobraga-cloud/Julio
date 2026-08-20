import { z } from 'zod';

/**
 * The person behind the business. This is the E-E-A-T payload: a real named
 * human with a verifiable track record, not an anonymous "our team".
 *
 * Every number in `socialProof` is a snapshot of a third-party profile and
 * carries the date it was read. Numbers without a date rot silently.
 */

const socialProofSchema = z.object({
  /** Where the numbers come from. Named in visible copy — never laundered. */
  platform: z.string().min(1),
  jobsCompleted: z.number().int().positive(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().positive(),
  topProSince: z.number().int().min(2000).max(2100),
  backgroundChecked: z.literal(true),
  /** ISO year-month the figures were last verified against the live profile. */
  asOf: z.string().regex(/^\d{4}-\d{2}$/),

  /**
   * Hard "no" on marking these up.
   *
   * The rating and review count were earned on Thumbtack, not on this site.
   * Emitting them as schema.org `aggregateRating` on our own business node is
   * self-serving review markup over third-party reviews — against Google's
   * structured data guidelines, and ineligible for rich results anyway since
   * the 2019 self-serving review restriction. Zero upside, real manual-action
   * risk. They belong in visible HTML with the source named, and nowhere else.
   */
  emitAsAggregateRating: z.literal(false),
});

const handymanSchema = z.object({
  name: z.string().min(1),
  jobTitle: z.string().min(1),
  yearsInBusiness: z.number().int().positive(),
  /** One-person operation. Drives the "you work directly with me" angle. */
  soloOperator: z.literal(true),

  /** Paragraphs, in order. Used on /about and, trimmed, on the home page. */
  bio: z.array(z.string().min(40)).min(1),

  /** Short first-person line for cards and the footer. */
  shortBio: z.string().min(40),

  /** What he actually does, for the /about capability list. */
  specialties: z.array(z.string().min(3)).min(3),

  socialProof: socialProofSchema,
});

export type Handyman = z.infer<typeof handymanSchema>;

export const handyman: Handyman = handymanSchema.parse({
  name: 'Julio Oliveira',
  jobTitle: 'Owner and Installer',
  yearsInBusiness: 10,
  soloOperator: true,

  bio: [
    'With 10 years in business as a one-person pro, I personally handle every project from start to finish. I offer expert furniture and fitness equipment assembly, TV mounting, handyman services, finish carpentry, and custom cabinetry.',
    'From beds, wardrobes, and shelves to complex gym equipment and TV installations, I focus on precision, safety, and clean, reliable work. I also provide detailed carpentry finishes and custom cabinet solutions that are both functional and visually appealing.',
    "You'll work directly with me, so communication is clear and your project gets the attention it deserves. My goal is to deliver customized, high-quality results that fit your space and your needs.",
    'Reach out today to discuss your project and get a straightforward plan for getting it done right.',
  ],

  shortBio:
    'Julio Oliveira has spent 10 years assembling furniture and gym equipment, mounting TVs and doing carpentry across southeastern New England. He runs the business alone, so the person who quotes your job is the person who does it.',

  specialties: [
    'Furniture assembly',
    'Fitness equipment assembly',
    'TV mounting, including brick and concrete',
    'General handyman work',
    'Finish carpentry',
    'Custom cabinetry',
  ],

  socialProof: {
    platform: 'Thumbtack',
    jobsCompleted: 325,
    rating: 4.9,
    reviewCount: 184,
    topProSince: 2019,
    backgroundChecked: true,
    asOf: '2026-08',
    emitAsAggregateRating: false,
  },
});

/** "4.9 stars from 184 reviews" — one place to phrase it, used everywhere. */
export const ratingLine = `${handyman.socialProof.rating} stars from ${handyman.socialProof.reviewCount} reviews`;
