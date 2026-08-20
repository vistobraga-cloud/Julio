import { z } from 'zod';
import { services } from '@data/services';
import { timeWindows, isOpenOn, BOOKING_HORIZON_DAYS } from '@data/booking';

/**
 * Validation for the booking flow, one schema per step.
 *
 * Nothing is submitted to a server — the flow ends by handing the customer a
 * prefilled WhatsApp message or email. Validation still matters: it is what
 * stops a request arriving without a town or a phone number, which is the
 * difference between a booking and a round of chasing.
 */

const serviceSlugs = services.map((s) => s.slug);

export const stepServiceSchema = z.object({
  serviceSlug: z
    .string()
    .refine((slug) => serviceSlugs.includes(slug), 'Choose a service to continue'),
  subcategory: z.string(),
});

export const stepDetailsSchema = z.object({
  itemCount: z.string().min(1, 'Tell me roughly how many items'),
  brand: z.string(),
  floor: z.string().min(1, 'Which floor is it going to?'),
  access: z.string(),
  city: z.string().min(2, 'Which town are you in?'),
});

export const stepScheduleSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date')
    .refine((value) => {
      const date = parseLocalDate(value);
      if (!date) return false;
      if (!isOpenOn(date)) return false;

      const today = startOfToday();
      const horizon = new Date(today);
      horizon.setDate(horizon.getDate() + BOOKING_HORIZON_DAYS);

      return date >= today && date <= horizon;
    }, 'That date is not available'),
  window: z
    .string()
    .refine((value) => timeWindows.some((w) => w.value === value), 'Pick an arrival window'),
});

export const stepContactSchema = z.object({
  name: z.string().min(2, 'Your name, so I know who I am talking to'),
  phone: z
    .string()
    .refine((value) => value.replace(/\D/g, '').length >= 10, 'A 10-digit phone number'),
  // Optional, but validated when present: a typo here is worse than a blank.
  email: z.union([z.literal(''), z.email('That email address looks wrong')]),
  address: z.string(),
  notes: z.string(),
});

export type StepService = z.infer<typeof stepServiceSchema>;
export type StepDetails = z.infer<typeof stepDetailsSchema>;
export type StepSchedule = z.infer<typeof stepScheduleSchema>;
export type StepContact = z.infer<typeof stepContactSchema>;

export type Booking = StepService & StepDetails & StepSchedule & StepContact;

export const emptyBooking: Booking = {
  serviceSlug: '',
  subcategory: '',
  itemCount: '',
  brand: '',
  floor: '',
  access: '',
  city: '',
  date: '',
  window: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Parse "yyyy-mm-dd" in the LOCAL timezone.
 *
 * `new Date('2026-08-25')` is parsed as UTC midnight, which in US timezones is
 * the previous day. That silently shifts every date the customer picks, and it
 * is the single most common bug in a date picker.
 */
export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Extract the first error message per field from a Zod failure. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
