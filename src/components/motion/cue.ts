/** Asks the pup actor (P6b) to react, e.g. glance at a door as it opens. Harmless when no actor runs. */
export function cuePup(detail: { look?: Element; secs?: number; [key: string]: unknown }) {
  dispatchEvent(new CustomEvent("pup:cue", { detail }));
}
