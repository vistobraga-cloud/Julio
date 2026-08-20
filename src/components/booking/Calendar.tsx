import { useMemo, useState } from 'react';
import { isOpenOn, BOOKING_HORIZON_DAYS, closedDaysLabel } from '@data/booking';
import { startOfToday, toLocalIso } from './schema';

/**
 * Month calendar.
 *
 * Closed days come from business.openingHours via isOpenOn(), so Sunday is
 * blocked by data rather than by a hardcoded `getDay() === 0`. If the trading
 * days ever change, this changes with them.
 */

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  value: string;
  onChange: (iso: string) => void;
}

export default function Calendar({ value, onChange }: Props) {
  const today = useMemo(() => startOfToday(), []);
  const horizon = useMemo(() => {
    const end = new Date(today);
    end.setDate(end.getDate() + BOOKING_HORIZON_DAYS);
    return end;
  }, [today]);

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const canGoBack = cursor > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoForward = cursor < new Date(horizon.getFullYear(), horizon.getMonth(), 1);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const leading = firstOfMonth.getDay();

    const out: (Date | null)[] = Array.from({ length: leading }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      out.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    }
    return out;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const shiftMonth = (delta: number) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="rounded-lg px-3 py-2 text-ink-700 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ←
        </button>

        <p aria-live="polite" className="font-bold text-ink-900">
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoForward}
          aria-label="Next month"
          className="rounded-lg px-3 py-2 text-ink-700 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            aria-hidden="true"
            className="pb-1 text-center text-xs font-semibold text-ink-400"
          >
            {label}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const iso = toLocalIso(date);
          const disabled = date < today || date > horizon || !isOpenOn(date);
          const selected = iso === value;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              onClick={() => onChange(iso)}
              className={[
                'aspect-square rounded-lg text-sm font-medium transition',
                selected
                  ? 'bg-brand-600 text-white'
                  : disabled
                    ? 'cursor-not-allowed text-ink-300'
                    : 'text-ink-800 hover:bg-brand-50 hover:text-brand-800',
              ].join(' ')}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-ink-500">
        {closedDaysLabel} Requested times are confirmed by Julio, not booked automatically.
      </p>
    </div>
  );
}
