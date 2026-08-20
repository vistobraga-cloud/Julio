/**
 * The one place icon names map to Phosphor's Iconify set.
 *
 * Before this file, the phone glyph was drawn by hand three times (Header,
 * ContactButtons, StickyBar) and the WhatsApp glyph twice, each a raw <path>
 * copy-pasted between components. astro-icon compiles these to static <svg>
 * at build time — zero runtime JS, same as the hand-drawn version, but one
 * definition instead of five.
 */
export const icons = {
  phone: 'ph:phone-fill',
  whatsapp: 'ph:whatsapp-logo-fill',
  chevronDown: 'ph:caret-down-bold',
  check: 'ph:check-bold',
  arrowRight: 'ph:arrow-right',
  search: 'ph:magnifying-glass-bold',
} as const;

export type IconName = keyof typeof icons;
