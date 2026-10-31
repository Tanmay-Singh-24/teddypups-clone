"use client";

import Lenis from "lenis";
import { cancelFrame, frame, type FrameData } from "motion";
import { useEffect } from "react";
import { REDUCED, useReducedMotion } from "./useReducedMotion";

let lenis: Lenis | null = null;

/** The running Lenis instance, or null (touch devices, reduced motion, before mount). */
export const getLenis = () => lenis;

function scrollToHashTarget(e: MouseEvent) {
  if (e.defaultPrevented || e.detail === 0 || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href*='#']");
  if (!link || (link.target && link.target !== "_self")) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || url.hash.length < 2)
    return;
  // Hidden (Activity-parked) routes keep their DOM, so pick the copy that is actually laid out.
  const id = decodeURIComponent(url.hash.slice(1));
  const target = [...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)].find((el) => el.getClientRects().length);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target);
  else target.scrollIntoView({ behavior: matchMedia(REDUCED).matches ? "instant" : "smooth" });
  history.pushState(null, "", url.hash);
}

/**
 * Root smooth scrolling (docs/PLAN.md §8.1). Lenis only runs with a fine pointer and motion allowed;
 * it skips dialogs and [data-lenis-prevent], and pauses while the page is locked (overflow hidden).
 */
export function LenisProvider() {
  const reduced = useReducedMotion();

  useEffect(() => {
    addEventListener("click", scrollToHashTarget);
    return () => removeEventListener("click", scrollToHashTarget);
  }, []);

  useEffect(() => {
    if (reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 0.85,
      prevent: (node) => !!node.closest?.("dialog, [data-lenis-prevent]"),
      virtualScroll: () => getComputedStyle(root).overflowY !== "hidden",
    });
    lenis = instance;
    // After a route change or history jump, drop any leftover smoothing at the new position.
    const settle = () => instance.scrollTo(instance.actualScroll, { immediate: true });
    addEventListener("tp:navigate", settle);
    addEventListener("popstate", settle);
    // Share Motion's frame loop so smooth scroll and animations tick together.
    const tick = (data: FrameData) => instance.raf(data.timestamp);
    frame.read(tick, true);
    return () => {
      cancelFrame(tick);
      removeEventListener("tp:navigate", settle);
      removeEventListener("popstate", settle);
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);

  return null;
}
