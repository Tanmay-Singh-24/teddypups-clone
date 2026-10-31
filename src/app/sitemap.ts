import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/site";

// Puppy profiles are added once the content layer exists (P1).
const PAGES = ["", "/puppies", "/gone-home", "/happy-families", "/how-it-works", "/faq", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: `${SITE_URL}${path}` }));
}
