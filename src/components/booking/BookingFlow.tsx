import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';

import { publishedServices } from '@data/services';
import { business } from '@data/business';
import {
  timeWindows,
  itemCountOptions,
  floorOptions,
  accessOptions,
  brandSuggestions,
  CONFIRMATION_PROMISE,
} from '@data/booking';
import { whatsappHref, mailtoHrefWith, telHref, phoneDisplay } from '@lib/contact';

import Calendar from './Calendar';
import {
  emptyBooking,
  fieldErrors,
  stepContactSchema,
  stepDetailsSchema,
  stepScheduleSchema,
  stepServiceSchema,
  type Booking,
} from './schema';
import { buildEmailSubject, buildRequestMessage, formatRequestedDate, windowLabel } from './message';

/**
 * The booking flow — the only React on this site.
 *
 * Front end only, by design. It does not reserve anything, does not hold a
 * slot and has no backend. What it does is collect a complete request in four
 * steps and hand it over as a prefilled WhatsApp message or email, so Julio
 * can quote and confirm without a round of questions.
 *
 * That honesty is on the page: the final screen says the time is *requested*,
 * not booked. Calendar sync is a later phase and needs OAuth and a server.
 */

const STEPS = ['Service', 'Details', 'Date & time', 'Your details'] as const;
type StepIndex = 0 | 1 | 2 | 3;

export default function BookingFlow() {
  const [step, setStep] = useState<StepIndex>(0);
  const [booking, setBooking] = useState<Booking>(emptyBooking);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const service = useMemo(
    () => publishedServices.find((s) => s.slug === booking.serviceSlug),
    [booking.serviceSlug],
  );

  const set = <K extends keyof Booking>(key: K, value: Booking[K]) => {
    setBooking((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  const validators = [
    stepServiceSchema,
    stepDetailsSchema,
    stepScheduleSchema,
    stepContactSchema,
  ] as const;

  const next = () => {
    const result = validators[step].safeParse(booking);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    setErrors({});
    if (step < 3) setStep((step + 1) as StepIndex);
  };

  const back = () => {
    setErrors({});
    if (step > 0) setStep((step - 1) as StepIndex);
  };

  const message = useMemo(() => buildRequestMessage(booking), [booking]);
  const ready = stepContactSchema.safeParse(booking).success;

  if (sent) {
    return <Confirmation booking={booking} onReset={() => { setBooking(emptyBooking); setStep(0); setSent(false); }} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Progress step={step} />

      <div className="mt-8">
        {step === 0 && (
          <Fieldset legend="What do you need done?" error={errors['serviceSlug']}>
            <div className="grid gap-3 sm:grid-cols-2">
              {publishedServices.map((entry) => (
                <button
                  key={entry.slug}
                  type="button"
                  aria-pressed={booking.serviceSlug === entry.slug}
                  onClick={() => {
                    set('serviceSlug', entry.slug);
                    set('subcategory', '');
                  }}
                  className={[
                    'rounded-xl border-2 p-4 text-left transition',
                    booking.serviceSlug === entry.slug
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-ink-200 bg-white hover:border-marine-300',
                  ].join(' ')}
                >
                  <span className="block font-bold text-ink-900">{entry.name}</span>
                  <span className="mt-1 block text-sm text-ink-600">
                    {entry.subcategories
                      .slice(0, 3)
                      .map((s) => s.name)
                      .join(' · ')}
                  </span>
                </button>
              ))}
            </div>

            {service && (
              <div className="mt-6">
                <label htmlFor="subcategory" className="block text-sm font-semibold text-ink-900">
                  Anything more specific? <span className="font-normal text-ink-500">(optional)</span>
                </label>
                <select
                  id="subcategory"
                  value={booking.subcategory}
                  onChange={(event) => set('subcategory', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                >
                  <option value="">Not sure yet</option>
                  {service.subcategories.map((sub) => (
                    <option key={sub.name} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Fieldset>
        )}

        {step === 1 && (
          <Fieldset legend="Tell me about the job">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="How many items?" error={errors['itemCount']} htmlFor="itemCount">
                <select
                  id="itemCount"
                  value={booking.itemCount}
                  onChange={(event) => set('itemCount', event.target.value)}
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                >
                  <option value="">Choose…</option>
                  {itemCountOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Brand or model"
                hint="Optional, but it makes the quote firm"
                htmlFor="brand"
              >
                <input
                  id="brand"
                  list="brand-suggestions"
                  value={booking.brand}
                  onChange={(event) => set('brand', event.target.value)}
                  placeholder="IKEA PAX, Peloton Bike+…"
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                />
                <datalist id="brand-suggestions">
                  {brandSuggestions.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </Field>

              <Field label="Which floor?" error={errors['floor']} htmlFor="floor">
                <select
                  id="floor"
                  value={booking.floor}
                  onChange={(event) => set('floor', event.target.value)}
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                >
                  <option value="">Choose…</option>
                  {floorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Getting it up there" htmlFor="access">
                <select
                  id="access"
                  value={booking.access}
                  onChange={(event) => set('access', event.target.value)}
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                >
                  <option value="">Choose…</option>
                  {accessOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Your town"
                error={errors['city']}
                htmlFor="city"
                className="sm:col-span-2"
              >
                <input
                  id="city"
                  value={booking.city}
                  onChange={(event) => set('city', event.target.value)}
                  placeholder="Providence, RI"
                  autoComplete="address-level2"
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                />
              </Field>
            </div>
          </Fieldset>
        )}

        {step === 2 && (
          <Fieldset legend="When suits you?">
            {errors['date'] && <ErrorText>{errors['date']}</ErrorText>}
            <Calendar value={booking.date} onChange={(iso) => set('date', iso)} />

            <div className="mt-6">
              <p className="text-sm font-semibold text-ink-900">Arrival window</p>
              {errors['window'] && <ErrorText>{errors['window']}</ErrorText>}

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {timeWindows.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    aria-pressed={booking.window === slot.value}
                    onClick={() => set('window', slot.value)}
                    className={[
                      'rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition',
                      booking.window === slot.value
                        ? 'border-brand-600 bg-brand-50 text-brand-800'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-marine-300',
                    ].join(' ')}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </Fieldset>
        )}

        {step === 3 && (
          <Fieldset legend="How do I reach you?">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" error={errors['name']} htmlFor="name">
                <input
                  id="name"
                  value={booking.name}
                  onChange={(event) => set('name', event.target.value)}
                  autoComplete="name"
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                />
              </Field>

              <Field label="Phone" error={errors['phone']} htmlFor="phone">
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={booking.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                />
              </Field>

              <Field
                label="Email"
                hint="Optional"
                error={errors['email']}
                htmlFor="email"
                className="sm:col-span-2"
              >
                <input
                  id="email"
                  type="email"
                  value={booking.email}
                  onChange={(event) => set('email', event.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                />
              </Field>

              <Field
                label="Address"
                hint="Optional now — needed before I come out"
                htmlFor="address"
                className="sm:col-span-2"
              >
                <input
                  id="address"
                  value={booking.address}
                  onChange={(event) => set('address', event.target.value)}
                  autoComplete="street-address"
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                />
              </Field>

              <Field
                label="Anything else I should know?"
                hint="Narrow stairs, parking, a delivery date — whatever matters"
                htmlFor="notes"
                className="sm:col-span-2"
              >
                <textarea
                  id="notes"
                  rows={3}
                  value={booking.notes}
                  onChange={(event) => set('notes', event.target.value)}
                  className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-ink-900"
                />
              </Field>
            </div>

            <Summary booking={booking} serviceName={service?.name ?? ''} />

            <div className="mt-6">
              <p className="text-sm font-semibold text-ink-900">Send it whichever way you prefer</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <a
                  href={ready ? whatsappHref(message) : undefined}
                  data-cta-placement="booking-submit"
                  rel="noopener"
                  aria-disabled={!ready}
                  onClick={(event) => {
                    if (!ready) {
                      event.preventDefault();
                      const result = stepContactSchema.safeParse(booking);
                      if (!result.success) setErrors(fieldErrors(result.error));
                      return;
                    }
                    setSent(true);
                  }}
                  className={[
                    'inline-flex items-center justify-center rounded-lg px-6 py-3.5 font-semibold transition',
                    ready
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'cursor-not-allowed bg-ink-200 text-ink-500',
                  ].join(' ')}
                >
                  Send on WhatsApp
                </a>

                <a
                  href={ready ? mailtoHrefWith(buildEmailSubject(booking), message) : undefined}
                  data-cta-placement="booking-submit"
                  aria-disabled={!ready}
                  onClick={(event) => {
                    if (!ready) {
                      event.preventDefault();
                      const result = stepContactSchema.safeParse(booking);
                      if (!result.success) setErrors(fieldErrors(result.error));
                      return;
                    }
                    setSent(true);
                  }}
                  className={[
                    'inline-flex items-center justify-center rounded-lg border-2 px-6 py-3.5 font-semibold transition',
                    ready
                      ? 'border-marine-700 text-marine-700 hover:bg-marine-700 hover:text-white'
                      : 'cursor-not-allowed border-ink-200 text-ink-400',
                  ].join(' ')}
                >
                  Send by email
                </a>
              </div>

              <p className="mt-3 text-sm text-ink-500">
                Nothing is submitted to a server. Both buttons open your own app with the request
                already written out, so you can read it before it goes.
              </p>
            </div>
          </Fieldset>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-ink-200 pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-lg px-4 py-2.5 font-semibold text-ink-700 transition hover:bg-ink-100 disabled:invisible"
        >
          ← Back
        </button>

        {step < 3 && (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-ink-900 px-6 py-3 font-semibold text-white transition hover:bg-ink-800"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                     */
/* -------------------------------------------------------------------------- */

function Progress({ step }: { step: StepIndex }) {
  return (
    <ol className="flex flex-wrap gap-x-2 gap-y-2 text-sm">
      {STEPS.map((label, index) => (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-current={index === step ? 'step' : undefined}
            className={[
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold',
              index === step
                ? 'bg-brand-600 text-white'
                : index < step
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-ink-100 text-ink-500',
            ].join(' ')}
          >
            <span className="tabular-nums">{index + 1}</span>
            <span className="hidden sm:inline">{label}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Fieldset({
  legend,
  error,
  children,
}: {
  legend: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-2xl font-bold tracking-tight text-ink-900">{legend}</legend>
      {error && <ErrorText>{error}</ErrorText>}
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  className = '',
  children,
}: {
  label: string;
  hint?: string;
  error?: string | undefined;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-900">
        {label}
        {hint && <span className="ml-1 font-normal text-ink-500">({hint})</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-sm font-medium text-red-700">
      {children}
    </p>
  );
}

function Summary({ booking, serviceName }: { booking: Booking; serviceName: string }) {
  if (!booking.date || !booking.window) return null;

  return (
    <div className="mt-8 rounded-xl bg-ink-50 p-5">
      <p className="text-sm font-semibold text-ink-900">What you are requesting</p>
      <dl className="mt-3 space-y-1.5 text-sm text-ink-700">
        <div className="flex gap-2">
          <dt className="font-medium text-ink-500">Service</dt>
          <dd>{serviceName}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-ink-500">Date</dt>
          <dd>{formatRequestedDate(booking.date)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-ink-500">Window</dt>
          <dd>{windowLabel(booking.window)}</dd>
        </div>
        {booking.city && (
          <div className="flex gap-2">
            <dt className="font-medium text-ink-500">Town</dt>
            <dd>{booking.city}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function Confirmation({ booking, onReset }: { booking: Booking; onReset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
        <CheckIcon weight="bold" className="h-7 w-7 text-brand-700" aria-hidden="true" />
      </div>

      <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        Request sent
      </h2>

      <p className="mt-4 text-lg leading-relaxed text-ink-700">{CONFIRMATION_PROMISE}</p>

      <p className="mt-4 leading-relaxed text-ink-600">
        You asked for {formatRequestedDate(booking.date)}, {windowLabel(booking.window)}. That time
        is not locked in until Julio replies — he schedules his own work, so the confirmation comes
        from him directly.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={telHref}
          data-cta-placement="booking-confirmation"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3.5 font-semibold text-white transition hover:bg-brand-700"
        >
          Call {phoneDisplay}
        </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-lg border-2 border-ink-300 px-6 py-3.5 font-semibold text-ink-700 transition hover:border-ink-400"
        >
          Book another job
        </button>
      </div>

      <p className="mt-8 text-sm text-ink-500">{business.hoursDisplay}</p>
    </div>
  );
}
