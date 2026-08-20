import { z } from 'zod';
import { TITLE_MAX, DESCRIPTION_MAX, DESCRIPTION_MIN } from '@lib/seo';

/**
 * Titles, descriptions and prefilled WhatsApp text for the pages that are not
 * part of a generated collection.
 *
 * These live in data rather than inside each .astro file for one reason: the
 * uniqueness check in data/index.ts can only compare keywords it can see. Meta
 * strings scattered through templates are exactly how two pages end up
 * competing for the same query without anyone noticing.
 */

const staticSeoSchema = z.object({
  title: z.string().min(10).max(TITLE_MAX),
  description: z.string().min(DESCRIPTION_MIN).max(DESCRIPTION_MAX),
  /** Absent on pages that are not meant to rank, such as /terms and 404. */
  primaryKeyword: z.string().min(3).optional(),
});

const staticPageSchema = z.object({
  route: z.string().startsWith('/'),
  seo: staticSeoSchema,
  h1: z.string().min(8),
  whatsappMessage: z.string().min(20),
});

export type StaticPage = z.infer<typeof staticPageSchema>;

const raw = {
  home: {
    route: '/',
    seo: {
      title: 'Aplus Assemblers | Furniture Assembly & TV Mounting',
      description:
        'Furniture and gym equipment assembled, TVs mounted, handyman work done right. Ten years, one person, every job. Serving MA, RI and CT.',
      primaryKeyword: 'furniture assembly and handyman ma ri ct',
    },
    h1: 'Furniture Assembly, TV Mounting and Handyman Work in MA, RI and CT',
    whatsappMessage: 'Hi Julio, I found your site. Here is what I need help with:',
  },

  about: {
    route: '/about',
    seo: {
      title: 'About Julio Oliveira | Aplus Assemblers',
      description:
        'Ten years, 325 jobs and a 4.9 rating from 184 reviews. Meet the one person who quotes your job, shows up and does the work himself.',
      primaryKeyword: 'julio oliveira aplus assemblers',
    },
    h1: 'The Person Who Quotes Your Job Is the Person Who Does It',
    whatsappMessage: 'Hi Julio, I read your about page and I have a project for you:',
  },

  services: {
    route: '/services',
    seo: {
      title: 'Services | Assembly, TV Mounting & Painting | Aplus',
      description:
        'Seven services, one person, one number: furniture and gym assembly, TV mounting, handyman work, carpentry, cabinetry and painting.',
      primaryKeyword: 'assembly and handyman services list',
    },
    h1: 'What I Do',
    whatsappMessage: 'Hi Julio, I was looking at your services page. I need:',
  },

  brands: {
    route: '/brands',
    seo: {
      title: 'Brands I Assemble in MA, RI & CT | Aplus',
      description:
        'IKEA, Peloton, Wayfair and more, assembled by an independent installer with ten years on the job. Massachusetts, Rhode Island and Connecticut.',
      primaryKeyword: 'furniture and equipment brands assembled',
    },
    h1: 'Brands I Assemble',
    whatsappMessage: 'Hi Julio, I have a specific brand I need assembled:',
  },

  book: {
    route: '/book',
    seo: {
      title: 'Book Furniture Assembly & Handyman Work | Aplus',
      description:
        'Pick your service, tell me what you have and choose a time. Four steps, no account, no waiting on hold. Monday to Saturday, 8am to 8pm.',
      primaryKeyword: 'book handyman appointment',
    },
    h1: 'Book a Job in Four Steps',
    whatsappMessage: 'Hi Julio, I would like to book a job:',
  },

  contact: {
    route: '/contact',
    seo: {
      title: 'Contact Aplus Assemblers | MA, RI & CT',
      description:
        'Call, text or WhatsApp Julio directly. Monday to Saturday, 8am to 8pm. Tell him what you bought and where it is going, and get a real answer.',
      primaryKeyword: 'contact aplus assemblers',
    },
    h1: 'Get in Touch',
    whatsappMessage: 'Hi Julio, I would like to book a job. Here are the details:',
  },

  privacy: {
    route: '/privacy-policy',
    seo: {
      title: 'Privacy Policy | Aplus Assemblers',
      description:
        'What Aplus Assemblers collects when you contact us or use the site, how it is used, how long it is kept, and how to ask for it to be deleted.',
    },
    h1: 'Privacy Policy',
    whatsappMessage: 'Hi Julio, I have a question about your privacy policy:',
  },

  terms: {
    route: '/terms',
    seo: {
      title: 'Terms of Service | Aplus Assemblers',
      description:
        'The terms that apply to work booked with Aplus Assemblers: quotes, scheduling, cancellation, site conditions, payment and limits of liability.',
    },
    h1: 'Terms of Service',
    whatsappMessage: 'Hi Julio, I have a question about your terms:',
  },

  sitemap: {
    route: '/sitemap',
    seo: {
      title: 'Sitemap | Aplus Assemblers',
      description:
        'Every page on this site in one place: services, brands by category and the essentials, for anyone who would rather browse than search.',
    },
    h1: 'Every Page on This Site',
    whatsappMessage: 'Hi Julio, I was browsing your site and I need:',
  },

  search: {
    route: '/search',
    seo: {
      title: 'Search | Aplus Assemblers',
      description:
        'Search the site for a brand, a service or a specific problem. Results are pulled from every page, not just the ones already easy to find.',
    },
    h1: 'Search This Site',
    whatsappMessage: 'Hi Julio, I searched your site and found what I need:',
  },

  notFound: {
    route: '/404',
    seo: {
      title: 'Page Not Found | Aplus Assemblers',
      description:
        'That page does not exist. Head back to the services list, or call or message Julio directly and tell him what you were looking for.',
    },
    h1: 'That Page Does Not Exist',
    whatsappMessage: 'Hi Julio, I could not find what I was looking for on your site:',
  },
} satisfies Record<string, unknown>;

export const staticPages = z.record(z.string(), staticPageSchema).parse(raw) as Record<
  keyof typeof raw,
  StaticPage
>;
