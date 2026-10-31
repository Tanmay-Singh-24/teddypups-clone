"use client";

import { useSyncExternalStore } from "react";

export const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Live prefers-reduced-motion; assumes reduced on the server so nothing animates before hydration. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED).matches, () => true);
}
