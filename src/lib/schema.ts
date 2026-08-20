import {
  business,
  radiusDisplay,
  schemaCounties,
  serviceRadiusMeters,
} from '@data/business';
import { handyman } from '@data/handyman';
import type { Faq } from '@data/services';

/**
 * schema.org builders.
 *
 * Two rules hold everywhere in this file:
 *
 * 1. Every value comes from src/data. Nothing is retyped. The predecessor
 *    project had the phone number pasted into seven JSON-LD blocks and three
 *    had drifted.
 *
 * 2. No aggregateRating, ever. The 4.9 stars were earned on Thumbtack, not
 *    here. Marking up third-party reviews on our own business node is
 *    self-serving review markup, ineligible for rich results since 2019 and a
 *    manual-action risk. The rating lives in visible HTML with its source
 *    named. See handyman.ts › socialProof.emitAsAggregateRating.
 *
 * There is also no mention of licensing anywhere in this file. Julio holds no
 * HIC registration and the site never implies otherwise.
 */

type Json = Record<string, unknown>;

/** Stable node id so every Service can point back at one business entity. */
export const businessId = `${business.siteUrl}/#business`;
export const websiteId = `${business.siteUrl}/#website`;
const personId = `${business.siteUrl}/about#julio`;

/** Mo–Sa 08:00–20:00, expressed once, from the data. */
function openingHours(): Json[] {
  return business.openingHours.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: slot.days,
    opens: slot.opens,
    closes: slot.closes,
  }));
}

/**
 * The service area, as a circle plus the counties inside it.
 *
 * This used to emit three `State` nodes — Massachusetts, Rhode Island and
 * Connecticut, whole. That was a claim on Pittsfield and Greenwich, 160 and
 * 140 miles out, which Julio will never drive to. An inflated area is not a
 * free bet: local ranking rewards a tight, plausible radius, and the Google
 * Business Profile service area has to agree with what the site declares.
 *
 * `GeoCircle` is the type that exists for a business that travels to the
 * customer, so it leads. The counties follow it because that is the unit a
 * person recognises and the unit the Business Profile accepts — but only the
 * core and regular tiers. The three edge counties are partly or entirely
 * outside the circle and are honest only with a caveat attached, and there is
 * nowhere to put a caveat in a machine-readable claim, so they stay in prose.
 */
function areaServed(): Json[] {
  return [
    {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: business.serviceRadius.lat,
        longitude: business.serviceRadius.lng,
        address: {
          '@type': 'PostalAddress',
          addressLocality: business.base.locality,
          addressRegion: business.base.region,
          addressCountry: 'US',
        },
      },
      geoRadius: serviceRadiusMeters,
      description: `Within ${radiusDisplay} of ${business.base.locality}, ${business.base.region}.`,
    },
    ...schemaCounties.map((county) => ({
      '@type': 'AdministrativeArea',
      name: `${county.name}, ${county.state}`,
    })),
  ];
}

export function homeAndConstructionBusiness(): Json {
  const node: Json = {
    '@type': 'HomeAndConstructionBusiness',
    '@id': businessId,
    name: business.name,
    description: business.tagline,
    url: business.siteUrl,
    telephone: business.phone.e164,
    email: business.email,
    priceRange: business.priceRange,
    paymentAccepted: business.paymentAccepted.join(', '),
    currenciesAccepted: 'USD',
    areaServed: areaServed(),
    openingHoursSpecification: openingHours(),
    // Service-area business: locality and region only. The street address is
    // never published, on the site or in the Google Business Profile.
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.base.locality,
      addressRegion: business.base.region,
      addressCountry: 'US',
    },
    founder: { '@id': personId },
    employee: { '@id': personId },
  };

  // Emitted only when a real profile URL exists. An empty env yields no key
  // at all, so the site can never publish a guessed Google Business Profile URL.
  if (business.sameAs.length > 0) {
    node['sameAs'] = business.sameAs;
  }

  return node;
}

export function person(): Json {
  return {
    '@type': 'Person',
    '@id': personId,
    name: handyman.name,
    jobTitle: handyman.jobTitle,
    description: handyman.shortBio,
    worksFor: { '@id': businessId },
    knowsAbout: handyman.specialties,
  };
}

export function website(): Json {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: business.siteUrl,
    name: business.name,
    publisher: { '@id': businessId },
    inLanguage: 'en-US',
  };
}

export function service(input: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}): Json {
  return {
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.serviceType ?? input.name,
    provider: { '@id': businessId },
    areaServed: areaServed(),
  };
}

/**
 * FAQPage. The answers passed in are the same strings the page renders inside
 * its <details> elements — the markup never carries an answer the visitor
 * cannot read on the page.
 */
export function faqPage(faqs: Faq[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, business.siteUrl).href,
    })),
  };
}

/** Wrap nodes into one @graph so the page emits a single script tag. */
export function graph(nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
