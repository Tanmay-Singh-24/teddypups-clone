import data from "./data/families.json";
import faqData from "./data/faq.json";
import type { Faq, Media } from "./types";

/** The 64 family photos in /happy-families order. */
export const familyPhotos = data.wall as Media[];

/** The same photos in the homepage photo wall's order (with captions). */
export const homeFamilyPhotos = data.homeWall as Media[];

export const faqs = faqData as Faq[];
