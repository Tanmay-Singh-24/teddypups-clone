"use server";

import { z } from "zod";
import { allPuppies } from "@/content/puppies";
import { puppyOptionLabel } from "@/lib/puppy-text";

export type EnquiryField = "name" | "phone" | "email" | "area" | "message" | "puppyId";
export type EnquiryState = { ok: boolean; message?: string; errors?: Partial<Record<EnquiryField, string>> };

const optional = (max: number, tooLong: string) =>
  z
    .string()
    .trim()
    .max(max, tooLong)
    .optional()
    .transform((v) => v || undefined);

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(80, "Please keep your name under 80 characters."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]+$/, "Please use digits only, with the country code, e.g. +971 50 123 4567.")
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 20;
    }, "Please add your full number with the country code, e.g. +971 50 123 4567."),
  email: z
    .union([z.literal(""), z.email("That email doesn't look quite right.")])
    .optional()
    .transform((v) => v || undefined),
  area: optional(80, "Please keep your area under 80 characters."),
  message: optional(2000, "Please keep your message under 2,000 characters."),
  puppyId: z
    .string()
    .optional()
    .refine((id) => !id || allPuppies.some((p) => p.id === id), "Please pick a puppy from the list.")
    .transform((v) => v || undefined),
});

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v : undefined;
};

/**
 * The one action behind the puppy enquiry and the contact letter. It validates with zod, drops
 * honeypot submissions while pretending to succeed, and emails the team through Resend when
 * RESEND_API_KEY and CONTACT_TO_EMAIL are set (otherwise it logs the enquiry).
 */
export async function sendEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  if (text(form, "website")) return { ok: true };

  const parsed = schema.safeParse({
    name: text(form, "name") ?? "",
    phone: text(form, "phone") ?? "",
    email: text(form, "email"),
    area: text(form, "area"),
    message: text(form, "message"),
    puppyId: text(form, "puppyId"),
  });
  if (!parsed.success) {
    const errors: EnquiryState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as EnquiryField;
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please check the highlighted details and try again.", errors };
  }

  const enquiry = parsed.data;
  const puppy = enquiry.puppyId ? allPuppies.find((p) => p.id === enquiry.puppyId) : undefined;
  const lines = [
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    enquiry.email && `Email: ${enquiry.email}`,
    enquiry.area && `Area: ${enquiry.area}`,
    `Puppy: ${puppy ? `${puppyOptionLabel(puppy)} (/puppies/${puppy.slug})` : "any puppy (not sure yet)"}`,
    enquiry.message && `\n${enquiry.message}`,
  ].filter(Boolean);

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    console.info("[enquiry]", lines.join("\n"));
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "TeddyPups <onboarding@resend.dev>",
        to: [to],
        reply_to: enquiry.email,
        subject: `New enquiry from ${enquiry.name}${puppy ? ` about ${puppyOptionLabel(puppy)}` : ""}`,
        text: lines.join("\n"),
      }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    return { ok: true };
  } catch (err) {
    console.error("[enquiry] email failed", err);
    return {
      ok: false,
      message: "Sorry, we couldn't send that just now. Please try again, or message us on WhatsApp.",
    };
  }
}
