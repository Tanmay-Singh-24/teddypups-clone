import { PHONE, SITE_URL } from "@/content/site";

const BASE = `https://wa.me/${PHONE.replace(/\D/g, "")}?text=`;

export const waLink = (text: string) => BASE + encodeURIComponent(text);

export const DEFAULT_WA_TEXT = "Hi TeddyPups! I'd love to know more about your puppies.";
export const QUESTION_WA_TEXT = "Hi TeddyPups! I have a question:";

export const defaultWaLink = waLink(DEFAULT_WA_TEXT);
export const questionWaLink = waLink(QUESTION_WA_TEXT);

type PuppyRef = { slug: string; name: string | null; breed: string; sex: string; status: "available" | "gone-home" };

/** Prefilled message for a puppy's "Ask on WhatsApp" button (wording copied from the reference). */
export function puppyWaLink(p: PuppyRef) {
  const url = `${SITE_URL}/puppies/${p.slug}`;
  if (p.status === "gone-home") {
    return waLink(`Hi TeddyPups! I loved ${p.name ?? `the ${p.breed}`} (${url}). Do you have a puppy like them?`);
  }
  return waLink(
    p.name
      ? `Hi TeddyPups! I'm interested in ${p.name}, the ${p.breed}: ${url}`
      : `Hi TeddyPups! I'm interested in the ${p.breed} (${p.sex}): ${url}`,
  );
}
