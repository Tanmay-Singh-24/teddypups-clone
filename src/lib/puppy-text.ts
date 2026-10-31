// Wording generated from a puppy record, matching the reference word for word.
// Kept free of runtime imports so scripts/verify-content.mjs can load it with plain Node.
import type { Puppy } from "@/content/types";

type P = Pick<Puppy, "name" | "breed" | "genderLabel" | "age" | "origin" | "status" | "media">;

const hasVideo = (p: P) => p.media.some((m) => m.kind === "video");
const sex = (p: P) => p.genderLabel.toLowerCase();

/** <title> without the site suffix: "Max, Maltipoo puppy" / "Shih Tzu puppy (girl)". */
export const puppyTitle = (p: P) => (p.name ? `${p.name}, ${p.breed} puppy` : `${p.breed} puppy (${sex(p)})`);

export const puppyDescription = (p: P) =>
  `Meet ${p.name ?? `this ${p.breed}`}: ${p.breed}, ${sex(p)}, ${p.age} old, ` +
  `${p.origin.slug === "local" ? "in Dubai" : "imported"}. ` +
  `Real photos${hasVideo(p) ? " and video" : ""} from TeddyPups U.A.E.`;

/** How forms refer to the puppy: "Max (Maltipoo)" / "Shih Tzu". */
export const puppyFormLabel = (p: P) => (p.name ? `${p.name} (${p.breed})` : p.breed);

/** Option text in the contact letter's puppy select: "Max (Maltipoo, boy)" / "Shih Tzu (girl)". */
export const puppyOptionLabel = (p: P) => (p.name ? `${p.name} (${p.breed}, ${sex(p)})` : `${p.breed} (${sex(p)})`);

export const puppyEnquiryMessage = (p: P) => `Hi! I'd love to know more about ${puppyFormLabel(p)}.`;

/** Prefilled WhatsApp text for a puppy, given its absolute URL. */
export function puppyWhatsAppText(p: P, url: string) {
  if (p.status === "gone-home") {
    return `Hi TeddyPups! I loved ${p.name ?? `the ${p.breed}`} (${url}). Do you have a puppy like them?`;
  }
  return p.name
    ? `Hi TeddyPups! I'm interested in ${p.name}, the ${p.breed}: ${url}`
    : `Hi TeddyPups! I'm interested in the ${p.breed} (${sex(p)}): ${url}`;
}
