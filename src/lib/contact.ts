import { business } from '@data/business';

/**
 * Every outbound contact link on the site is built here, from business.ts.
 * No template writes a phone number, and no template writes a wa.me URL.
 */

/** tel: link. The primary CTA — plenty of customers here will not use WhatsApp. */
export const telHref = `tel:${business.phone.e164}`;

/** SMS. Quietly the highest-converting option for a US trades audience. */
export function smsHref(message?: string): string {
  const base = `sms:${business.phone.e164}`;
  if (!message) return base;
  // `?&body=` is the form that works on both iOS and Android.
  return `${base}?&body=${encodeURIComponent(message)}`;
}

/**
 * WhatsApp with a prefilled message.
 *
 * The message is contextual per page — a visitor on the TV mounting page must
 * not open a chat that says "furniture". Callers pass the page's own text from
 * its data entry.
 */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${business.phone.whatsappId}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const mailtoHref = `mailto:${business.email}`;

/** Email with a prefilled subject and body — used by the booking flow. */
export function mailtoHrefWith(subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  // URLSearchParams encodes spaces as "+", which mail clients render literally.
  return `mailto:${business.email}?${params.toString().replace(/\+/g, '%20')}`;
}

/** Display form, for the visible label on a link. */
export const phoneDisplay = business.phone.display;
