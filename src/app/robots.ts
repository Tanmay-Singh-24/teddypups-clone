import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/site";

// Same rules as the reference. Pages themselves carry noindex (see layout.tsx).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
