import { z } from 'zod';
import { business } from './business';

/**
 * Option data for the /book scheduler.
 *
 * The available days and time windows are DERIVED from business.openingHours.
 * Nothing here restates "Monday to Saturday" or "8am to 8pm" as a literal, so
 * changing the trading hours in one file changes the calendar, the slot list,
 * the footer, the schema.org node and the visible copy together.
 */

/* -------------------------------------------------------------------------- */
/*  Days                                                                       */
/* -------------------------------------------------------------------------- */

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** JS getDay() values the business actually works. Sunday is absent by data. */
export const openDayIndexes: ReadonlySet<number> = new Set(
  business.openingHours.flatMap((slot) =>
    slot.days.map((day) => DAY_INDEX[day]).filter((n): n is number => n !== undefined),
  ),
);

export function isOpenOn(date: Date): boolean {
  return openDayIndexes.has(date.getDay());
}

/** "Closed Sundays." — derived, so it cannot contradict the calendar. */
export const closedDaysLabel: string = (() => {
  const closed = Object.entries(DAY_INDEX)
    .filter(([, index]) => !openDayIndexes.has(index))
    .map(([name]) => `${name}s`);

  if (closed.length === 0) return 'Open every day.';

  const last = closed[closed.length - 1];
  const phrase =
    closed.length > 1 ? `${closed.slice(0, -1).join(', ')} and ${last}` : (last ?? '');

  return `Closed ${phrase}.`;
})();

/* -------------------------------------------------------------------------- */
/*  Arrival windows                                                            */
/* -------------------------------------------------------------------------- */

const timeWindowSchema = z.object({
  /** Machine value, "08:00-10:00". Goes into the request message. */
  value: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/),
  /** What the customer reads, "8:00 – 10:00 am". */
  label: z.string().min(4),
});

export type TimeWindow = z.infer<typeof timeWindowSchema>;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function label12h(minutes: number): { hour: number; meridiem: 'am' | 'pm' } {
  const hour24 = Math.floor(minutes / 60);
  const meridiem = hour24 >= 12 ? 'pm' : 'am';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour, meridiem };
}

/**
 * Two-hour arrival windows across the trading day.
 *
 * Windows rather than exact times, deliberately. A one-person business driving
 * between jobs cannot honestly promise 10:15, and a promise that gets broken
 * costs more than a window that gets kept.
 */
export const timeWindows: TimeWindow[] = z.array(timeWindowSchema).parse(
  (() => {
    const slot = business.openingHours[0];
    if (!slot) return [];

    const start = toMinutes(slot.opens);
    const end = toMinutes(slot.closes);
    const step = 120;
    const windows: TimeWindow[] = [];

    for (let from = start; from + step <= end; from += step) {
      const to = from + step;
      const a = label12h(from);
      const b = label12h(to);

      windows.push({
        value: `${pad(Math.floor(from / 60))}:${pad(from % 60)}-${pad(Math.floor(to / 60))}:${pad(to % 60)}`,
        label:
          a.meridiem === b.meridiem
            ? `${a.hour} – ${b.hour} ${b.meridiem}`
            : `${a.hour} ${a.meridiem} – ${b.hour} ${b.meridiem}`,
      });
    }

    return windows;
  })(),
);

/* -------------------------------------------------------------------------- */
/*  Form options                                                               */
/* -------------------------------------------------------------------------- */

export const itemCountOptions = ['1', '2', '3', '4–6', '7 or more'] as const;

export const floorOptions = [
  'Ground floor',
  '2nd floor',
  '3rd floor or higher',
  'Basement',
  'Garage',
] as const;

export const accessOptions = [
  'Elevator available',
  'Stairs only',
  'Narrow or tight stairs',
  'Not applicable',
] as const;

/**
 * Brand autocomplete source.
 *
 * Phase 5 replaces this with the names from brands.ts, so the twenty brand
 * pages and this field cannot drift apart. Until those pages exist, this is
 * the honest interim: a plain suggestion list, not a fake link target.
 */
export const brandSuggestions: string[] = [
  'IKEA',
  'Wayfair',
  'Ashley Furniture',
  'Pottery Barn',
  'West Elm',
  'Crate & Barrel',
  'Article',
  'Amazon',
  'Peloton',
  'NordicTrack',
  'Bowflex',
  'Sole Fitness',
  'ProForm',
  'Tonal',
  'Concept2',
  'REP Fitness',
  'Backyard Discovery',
  'Lifetime',
  'Weber',
  'Traeger',
  'Uplift',
  'FlexiSpot',
];

/** How far ahead the calendar lets someone request. */
export const BOOKING_HORIZON_DAYS = 60;

/** Shown on the final screen. One place to phrase the promise. */
export const CONFIRMATION_PROMISE =
  "We'll confirm your requested time — usually within a couple of hours.";
