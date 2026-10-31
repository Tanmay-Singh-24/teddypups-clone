// Business details shared across the site (docs/PLAN.md §4.1).

export const SITE_NAME = "TeddyPups U.A.E.";
export const SITE_TAGLINE = "every puppy is family";
export const SITE_DESCRIPTION =
  "Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.";
export const ABOUT =
  "TeddyPups U.A.E. is a Dubai-based brand specializing in miniature puppies, offering premium services and worldwide shipping.";

/** Absolute origin of this deployment, used in WhatsApp messages, canonicals and JSON-LD. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const PHONE = "+971541676733";
export const PHONE_DISPLAY = "+971 54 167 6733";
export const EMAIL = "teddypupsadmin@gmail.com";
export const ADDRESS = "Downtown Dubai, United Arab Emirates";
export const MAPS_URL = "https://maps.app.goo.gl/ZdJvwHBSQWWZT54s7";

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/teddypups.worldwide/" },
  { label: "TikTok", href: "https://www.tiktok.com/@teddypupsuae" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61567496944539" },
] as const;

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Puppies", href: "/puppies" },
  { label: "Happy families", href: "/happy-families" },
  { label: "How it works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Visit & contact", href: "/contact" },
] as const;

export const FOOTER_NAV = [
  { label: "Available puppies", href: "/puppies" },
  { label: "Gone home", href: "/gone-home" },
  { label: "Happy families", href: "/happy-families" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Delivery & collection", href: "/how-it-works#delivery" },
  { label: "FAQ", href: "/faq" },
  { label: "Visit & contact", href: "/contact" },
] as const;

export const TESTIMONIAL = {
  quote:
    "TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process gave us complete peace of mind.",
  name: "Sarah M.",
  place: "Dubai, UAE",
} as const;
