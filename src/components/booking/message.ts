import { services } from '@data/services';
import { timeWindows } from '@data/booking';
import { business } from '@data/business';
import type { Booking } from './schema';
import { parseLocalDate } from './schema';

/**
 * Turns a completed booking into the message that actually gets sent.
 *
 * There is no backend. This text IS the booking — it lands in Julio's WhatsApp
 * or inbox and he replies to confirm. So it has to be complete enough to quote
 * from without a follow-up call, and readable on a phone.
 */

export function formatRequestedDate(iso: string): string {
  const date = parseLocalDate(iso);
  if (!date) return iso;

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function windowLabel(value: string): string {
  return timeWindows.find((w) => w.value === value)?.label ?? value;
}

export function buildRequestMessage(booking: Booking): string {
  const service = services.find((s) => s.slug === booking.serviceSlug);

  const lines: string[] = [`New booking request — ${business.name}`, ''];

  const add = (label: string, value: string) => {
    if (value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  add('Service', service?.name ?? booking.serviceSlug);
  add('Type of work', booking.subcategory);
  add('Items', booking.itemCount);
  add('Brand or model', booking.brand);
  add('Floor', booking.floor);
  add('Access', booking.access);
  add('Town', booking.city);

  lines.push('');
  add('Requested date', formatRequestedDate(booking.date));
  add('Arrival window', windowLabel(booking.window));

  lines.push('');
  add('Name', booking.name);
  add('Phone', booking.phone);
  add('Email', booking.email);
  add('Address', booking.address);
  add('Notes', booking.notes);

  return lines.join('\n');
}

export function buildEmailSubject(booking: Booking): string {
  const service = services.find((s) => s.slug === booking.serviceSlug);
  const name = booking.name.trim();
  const who = name ? ` — ${name}` : '';
  return `Booking request: ${service?.name ?? 'Job'}${who}`;
}
