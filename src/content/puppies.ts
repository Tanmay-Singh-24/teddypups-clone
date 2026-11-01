import data from "./data/puppies.json";
import type { Puppy, PuppyCard, Slugged } from "./types";

/** Available puppies, in the reference's order (/puppies grid, homepage doors and lineup). */
export const availablePuppies = data.available as Puppy[];

/** Puppies that have gone home, in /gone-home ticket order. */
export const goneHomePuppies = data.goneHome as Puppy[];

export const allPuppies: Puppy[] = [...availablePuppies, ...goneHomePuppies];

/** Gone-home puppies shown in the strip under the /puppies grid. */
export const goneStripPuppies = data.goneStrip.map((slug) => getPuppy(slug)!);

/** Every breed in the catalogue; filters only offer those with available puppies. */
export const allBreeds = data.breeds as Slugged[];

export function getPuppy(slug: string): Puppy | undefined {
  return allPuppies.find((p) => p.slug === slug);
}

/** Neighbours within the puppy's own list (available or gone home), wrapping around. */
export function getNeighbours(p: Puppy) {
  const list = p.status === "available" ? availablePuppies : goneHomePuppies;
  const i = list.findIndex((x) => x.slug === p.slug);
  return {
    previous: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

export function toCard(p: Puppy): PuppyCard {
  const { id, slug, name, displayName, breed, gender, genderLabel, age, status, origin, collections, breeds, cover } = p;
  const hasVideo = p.media.some((m) => m.kind === "video");
  return { id, slug, name, displayName, breed, gender, genderLabel, age, status, origin, collections, breeds, cover, hasVideo };
}
