import { services, type Service } from './services';
import { brands, type Brand } from './brands';
import { staticPages } from './staticPages';

export { business, areaAbbrList, areaNameList, type Business } from './business';
export { handyman, ratingLine, type Handyman } from './handyman';
export { staticPages, type StaticPage } from './staticPages';
export {
  services,
  publishedServices,
  getService,
  type Service,
  type Faq,
  type Seo,
} from './services';
export {
  brands,
  publishedBrands,
  getBrand,
  brandsForService,
  brandsByCategory,
  brandCategories,
  independenceStatement,
  type Brand,
  type BrandCategory,
} from './brands';

/**
 * Cross-file integrity checks.
 *
 * The brief's rules about keyword overlap and internal linking are written as
 * prose, and prose rots. These turn them into build failures.
 *
 * This module is imported by the base layout, so every build evaluates it and
 * a violation stops `astro build` rather than shipping.
 */

type PageRef = {
  /** Where the page lives, for the error message. */
  source: string;
  route: string;
  primaryKeyword: string;
};

/**
 * Every routable content page, in one list. Phases 3 and 4 append problems and
 * city pages here; the checks below then cover them for free.
 */
function collectPages(): PageRef[] {
  const pages: PageRef[] = [];

  for (const [key, page] of Object.entries(staticPages)) {
    // Pages with no keyword (terms, privacy, 404) are not competing for
    // anything and are excluded from the uniqueness check by design.
    if (!page.seo.primaryKeyword) continue;
    pages.push({
      source: `staticPages.ts › ${key}`,
      route: page.route,
      primaryKeyword: page.seo.primaryKeyword,
    });
  }

  for (const service of services) {
    pages.push({
      source: `services.ts › ${service.slug}`,
      route: `/services/${service.slug}`,
      primaryKeyword: service.seo.primaryKeyword,
    });
  }

  for (const brand of brands) {
    pages.push({
      source: `brands.ts › ${brand.slug}`,
      route: `/brands/${brand.slug}`,
      primaryKeyword: brand.seo.primaryKeyword,
    });
  }

  return pages;
}

/** Slugs that a related* array is allowed to point at, by collection. */
function knownSlugs(): { brands: Set<string>; problems: Set<string> } {
  // Problems arrive in Phase 3. Until then every relatedProblemSlugs array
  // must be empty, which is exactly what we want enforced right now.
  return {
    brands: new Set(brands.map((b) => b.slug)),
    problems: new Set<string>(),
  };
}

function checkKeywordsAreUnique(pages: PageRef[], errors: string[]): void {
  const seen = new Map<string, PageRef>();

  for (const page of pages) {
    const key = page.primaryKeyword.trim().toLowerCase();
    const previous = seen.get(key);

    if (previous) {
      errors.push(
        `Two pages target the same primary keyword "${page.primaryKeyword}":\n` +
          `    ${previous.route}  (${previous.source})\n` +
          `    ${page.route}  (${page.source})\n` +
          `  They will cannibalise each other. Give one of them a distinct angle.`,
      );
      continue;
    }

    seen.set(key, page);
  }
}

/**
 * Reciprocal-link check, shared by services and brands.
 *
 * A one-way cross-link is nearly always an editing slip, and it quietly fails
 * to pass equity in the direction that was intended.
 */
function checkReciprocalLinks<T extends { slug: string; published: boolean }>(
  items: T[],
  links: (item: T) => string[],
  source: string,
  errors: string[],
): void {
  const bySlug = new Map(items.map((item) => [item.slug, item]));

  for (const item of items) {
    for (const slug of links(item)) {
      if (slug === item.slug) {
        errors.push(`${source} › ${item.slug} lists itself as related.`);
        continue;
      }

      const target = bySlug.get(slug);
      if (!target) {
        errors.push(`${source} › ${item.slug} links to "${slug}", which does not exist.`);
        continue;
      }

      if (!links(target).includes(item.slug)) {
        errors.push(
          `${source} › ${item.slug} links to "${slug}", but "${slug}" does not link back. ` +
            `Cross-links must be reciprocal — add "${item.slug}" to ${slug}, or drop the link.`,
        );
      }

      if (item.published && !target.published) {
        errors.push(
          `${source} › published "${item.slug}" links to unpublished "${slug}". ` +
            `That link would 404 in a production build.`,
        );
      }
    }
  }
}

function checkProblemLinks(
  items: { slug: string; relatedProblemSlugs: string[] }[],
  source: string,
  errors: string[],
): void {
  const { problems } = knownSlugs();

  for (const item of items) {
    for (const slug of item.relatedProblemSlugs) {
      if (!problems.has(slug)) {
        errors.push(
          `${source} › ${item.slug} links to problem "${slug}", which does not exist. ` +
            `A broken internal link would ship as a 404.`,
        );
      }
    }
  }
}

/**
 * Every brand must hang off a real, published service. A brand page whose
 * parent is missing is an orphan — nothing links down to it from the site's
 * main navigation path, which is the whole reason these pages get built.
 */
function checkBrandParents(all: Brand[], errors: string[]): void {
  const serviceSlugs = new Map(services.map((s) => [s.slug, s]));

  for (const brand of all) {
    const parent = serviceSlugs.get(brand.parentServiceSlug);

    if (!parent) {
      errors.push(
        `brands.ts › ${brand.slug} names parent service "${brand.parentServiceSlug}", ` +
          `which does not exist in services.ts.`,
      );
      continue;
    }

    if (brand.published && !parent.published) {
      errors.push(
        `brands.ts › published brand "${brand.slug}" hangs off unpublished service ` +
          `"${parent.slug}". Its breadcrumb and parent link would both 404.`,
      );
    }
  }
}

/**
 * Trademark hygiene, checked at the data layer as well as in the built HTML.
 *
 * A brand page names someone else's registered mark in its title, heading and
 * URL. That is lawful nominative fair use only while the page stays clearly
 * independent, so a page with no declared trademarks cannot render its
 * independence statement and must not exist.
 */
function checkBrandTrademarks(all: Brand[], errors: string[]): void {
  const banned = /\b(official|authoriz|authoris|certified|partner)\b/i;

  for (const brand of all) {
    if (brand.trademarks.length === 0) {
      errors.push(
        `brands.ts › ${brand.slug} declares no trademarks, so no independence ` +
          `statement can be generated for it.`,
      );
    }

    const prose = [brand.h1, brand.seo.title, brand.seo.description, ...brand.intro].join(' ');
    const hit = banned.exec(prose);
    if (hit) {
      errors.push(
        `brands.ts › ${brand.slug} uses "${hit[0]}" in its title, heading or opening. ` +
          `That language implies an endorsement relationship that does not exist. ` +
          `Use "independent", "I assemble" or "experienced with".`,
      );
    }
  }
}

function checkAtLeastOnePublished(all: Service[], errors: string[]): void {
  if (!all.some((s) => s.published)) {
    errors.push('services.ts has no published entries — /services would render empty.');
  }
}

export function validateDataIntegrity(): void {
  const errors: string[] = [];
  const pages = collectPages();

  checkKeywordsAreUnique(pages, errors);

  checkReciprocalLinks(services, (s) => s.relatedServiceSlugs, 'services.ts', errors);
  checkReciprocalLinks(brands, (b) => b.relatedBrandSlugs, 'brands.ts', errors);

  checkProblemLinks(services, 'services.ts', errors);
  checkProblemLinks(brands, 'brands.ts', errors);

  checkBrandParents(brands, errors);
  checkBrandTrademarks(brands, errors);
  checkAtLeastOnePublished(services, errors);

  if (errors.length > 0) {
    throw new Error(
      `\n\nData integrity check failed (${errors.length} problem${errors.length === 1 ? '' : 's'}):\n\n` +
        errors.map((e) => `  • ${e}`).join('\n\n') +
        '\n',
    );
  }
}

// Evaluated on import. Any violation fails the build at the first page render.
validateDataIntegrity();
