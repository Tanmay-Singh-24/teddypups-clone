"use client";

import { motion } from "motion/react";
import { useId, type InputHTMLAttributes } from "react";
import { useEnquiry } from "./useEnquiry";

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
  /** A puppy select instead. */
  puppies?: { id: string; label: string }[];
  /** Stacks the four fields. */
  compact?: boolean;
  success: { heading: string; body: string };
  whatsappHref: string;
};

/**
 * The puppy enquiry form, posted to the shared enquiry action. On success it flips into the
 * "Message received!" envelope card. method="post" keeps details out of the URL even before hydration.
 */
export function EnquiryForm({ puppy, puppies, compact = false, success, whatsappHref }: EnquiryFormProps) {
  const { state, pending, onSubmit, ref } = useEnquiry();
  const selectId = useId();
  const messageId = useId();
  const errors = state.errors;
  const message = state.message;
  if (state.ok)
    return (
      <motion.div
        role="status"
        initial={{ rotateX: -80, opacity: 0, y: -10 }}
        animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
        className="tp-sent rounded-[2rem] border-[3px] border-cocoa bg-honey p-8 text-center"
      >
        <svg viewBox="0 0 120 84" className="tp-envelope mx-auto w-32" aria-hidden="true">
          <path d="M6 10h108v68H6z" fill="#fffdf8" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
          <path d="M6 10l54 40 54-40" fill="none" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="94" cy="62" r="12" fill="#c2622b" stroke="#2a170e" strokeWidth="2.5" />
        </svg>
        <p className="font-plush mt-4 text-[2rem]">{success.heading}</p>
        <p className="mx-auto mt-2 max-w-[38ch] text-cocoa-soft">{success.body}</p>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">
          WhatsApp us
        </a>
      </motion.div>
    );
  return (
    <form ref={ref} method="post" onSubmit={onSubmit} noValidate className="space-y-5">
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
