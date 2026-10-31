import { PHONE, SITE_URL } from "@/content/site";
import type { Puppy } from "@/content/types";
import { puppyWhatsAppText } from "./puppy-text";

const BASE = `https://wa.me/${PHONE.replace(/\D/g, "")}?text=`;

export const waLink = (text: string) => BASE + encodeURIComponent(text);

export const DEFAULT_WA_TEXT = "Hi TeddyPups! I'd love to know more about your puppies.";
export const QUESTION_WA_TEXT = "Hi TeddyPups! I have a question:";

export const defaultWaLink = waLink(DEFAULT_WA_TEXT);
export const questionWaLink = waLink(QUESTION_WA_TEXT);

export const puppyWaLink = (p: Puppy) => waLink(puppyWhatsAppText(p, `${SITE_URL}/puppies/${p.slug}`));
