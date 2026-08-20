/**
 * Route constants and navigation.
 *
 * BOOK_PATH is the single definition behind every "Book Now" control — the
 * sticky mobile bar, the nav and any CTA that points at the scheduler.
 */
export const BOOK_PATH = '/book';

export type NavItem = { label: string; href: string };

export const primaryNav: NavItem[] = [
  { label: 'Services', href: '/services' },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Book', href: BOOK_PATH },
  { label: 'Contact', href: '/contact' },
];

/** Hubs that do not exist yet are added here as their phase lands. */
export const footerNav: NavItem[] = [
  { label: 'All services', href: '/services' },
  { label: 'Brands I assemble', href: '/brands' },
  { label: 'About Julio', href: '/about' },
  { label: 'Book a job', href: BOOK_PATH },
  { label: 'Contact', href: '/contact' },
];

export function isCurrent(href: string, pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  const target = href.split('#')[0]?.replace(/\/+$/, '') || '/';
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}
