import type { MetadataRoute } from "next";
import { allPuppies } from "@/content/puppies";
import { SITE_URL } from "@/content/site";

// Same URL set as the reference's sitemap: main pages, then every puppy profile with its cover image.
const PAGES = ["", "/puppies", "/gone-home", "/happy-families", "/how-it-works", "/faq", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...allPuppies.map((p) => ({
      url: `${SITE_URL}/puppies/${p.slug}`,
      images: [`${SITE_URL}${p.cover.url}`],
    })),
  ];
}
