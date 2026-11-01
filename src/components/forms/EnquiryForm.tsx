"use client";

import { useId, type InputHTMLAttributes } from "react";

/** Per-field messages and a form-level message, as the enquiry action will return them (P5). */
export type EnquiryErrors = Partial<Record<"name" | "phone" | "email" | "area" | "message", string>>;

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: string };

function Field({ label, name, error, hint, ...input }: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[0.95rem] font-semibold">
        {label}
        {input.required ? (
          <span className="text-toffee-ink"> *</span>
        ) : (
          <span className="font-normal text-cocoa-soft"> (optional)</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className="mt-1.5 h-12 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 text-base outline-none transition-[border-color,box-shadow] focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)] aria-[invalid=true]:border-[#b3261e]"
        {...input}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-cocoa-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

type EnquiryFormProps = {
  /** The puppy being asked about: posts its id and prefills the message. */
  puppy?: { id: string; label: string };
  /** The contact letter's puppy select instead (P5). */
  puppies?: { id: string; label: string }[];
  /** Stacks the four fields (contact letter). */
  compact?: boolean;
  errors?: EnquiryErrors;
  message?: string;
  pending?: boolean;
};

/**
 * The enquiry fields shared by puppy profiles and the contact letter. P4 renders the form only;
 * P5 wires it to the server action. Until then a submit does nothing (it must never fall back to a
 * GET that would put personal details in the URL).
 */
export function EnquiryForm({ puppy, puppies, compact = false, errors, message, pending = false }: EnquiryFormProps) {
  const selectId = useId();
  const messageId = useId();
  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-5">
      {message && (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 font-semibold">
          {message}
        </p>
      )}
      <div className={compact ? "space-y-5" : "grid gap-5 sm:grid-cols-2"}>
        <Field label="Your name" name="name" autoComplete="name" required minLength={2} maxLength={80} error={errors?.name} />
        <Field
          label="Phone or WhatsApp"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          error={errors?.phone}
          hint="With country code, e.g. +971 50 123 4567"
        />
        <Field label="Email" name="email" type="email" autoComplete="email" error={errors?.email} />
        <Field
          label="Your area"
          name="area"
          autoComplete="address-level2"
          maxLength={80}
          error={errors?.area}
          hint="e.g. Dubai Marina"
        />
      </div>
      {puppy ? (
        <input type="hidden" name="puppyId" value={puppy.id} />
      ) : (
        puppies && (
          <div>
            <label htmlFor={selectId} className="block text-[0.95rem] font-semibold">
              Puppy you&apos;re interested in <span className="font-normal text-cocoa-soft">(optional)</span>
            </label>
            <select
              id={selectId}
              name="puppyId"
              className="mt-1.5 h-12 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 text-base"
              defaultValue=""
            >
              <option value="">Not sure yet</option>
              {puppies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )
      )}
      <div>
        <label htmlFor={messageId} className="block text-[0.95rem] font-semibold">
          Message <span className="font-normal text-cocoa-soft">(optional)</span>
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={compact ? 3 : 4}
          maxLength={2000}
          className="mt-1.5 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 py-3 text-base outline-none focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)]"
          defaultValue={puppy ? `Hi! I'd love to know more about ${puppy.label}.` : ""}
        />
        {errors?.message && <p className="mt-1 text-sm font-semibold text-[#b3261e]">{errors.message}</p>}
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
