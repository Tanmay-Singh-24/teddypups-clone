// Shapes of the generated content in src/content/data (see scripts/extract-content.mjs).

export type Media = {
  id: string;
  url: string;
  kind: "image" | "video";
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Focal point, 0..1 — maps to object-position. */
  focalX: number;
  focalY: number;
  /** Dominant colour; tints puppy pages. */
  color: string;
  blurDataUrl: string | null;
  durationS: number | null;
  poster: Media | null;
};

export type Slugged = { slug: string; name: string };

export type Gender = "male" | "female" | "male-female";

export type PuppyStatus = "available" | "gone-home";

export type Puppy = {
  /** Reference UUID, posted by the enquiry forms as puppyId. */
  id: string;
  slug: string;
  name: string | null;
  displayName: string;
  breed: string;
  gender: Gender;
  genderLabel: string;
  age: string;
  /** Shown as a "Colour" fact when set. */
  colour: string | null;
  /** Shown under the facts when set, e.g. "Maltipoo (Left) & Cavapoo (Right)." */
  description: string | null;
  status: PuppyStatus;
  origin: Slugged & { slug: "local" | "imported" };
  collections: Slugged[];
  breeds: Slugged[];
  cover: Media;
  media: Media[];
  ticket?: { from: string; imageUrl: string; imageAlt: string };
};

export type Faq = { id: string; question: string; answer: string };
