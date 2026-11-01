"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { curtainDown } from "./curtain";
import { REDUCED } from "./useReducedMotion";

/**
 * Plays the entrance of every `[data-reveal]` inside it. The server renders each one in its final
 * state; on mount, those already on screen stay put and those below the fold get `data-armed` (their
 * start frame) and then `data-revealed` as they scroll in. Elements added later (filters, search)
 * are picked up too. Reduced motion reveals everything at once.
 */
export function RevealScope({ children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const pending = () => root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])");

    if (matchMedia(REDUCED).matches) {
      const revealAll = () => pending().forEach((el) => (el.dataset.revealed = "true"));
      revealAll();
      const watch = new MutationObserver(revealAll);
      watch.observe(root, { childList: true, subtree: true });
      return () => watch.disconnect();
    }

    // Held back while the curtain is down, then revealed together when it lifts.
    const held = new Set<HTMLElement>();
    const reveal = (el: HTMLElement) => {
      el.dataset.revealed = "true";
      io.unobserve(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (curtainDown()) held.add(el);
          else reveal(el);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    const arm = (el: HTMLElement) => {
      if (el.dataset.armed) return io.observe(el);
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && !curtainDown()) {
        el.dataset.revealed = "true";
        return;
      }
      el.dataset.armed = "true";
      io.observe(el);
    };
    pending().forEach(arm);
    const watch = new MutationObserver(() => pending().forEach(arm));
    watch.observe(root, { childList: true, subtree: true });

    const release = () => {
      held.forEach(reveal);
      held.clear();
    };
    addEventListener("tp:arrived", release);
    // A fallback in case the arrival event never comes.
    let timer = 0;
    const check = () => {
      if (curtainDown()) timer = window.setTimeout(check, 400);
      else release();
    };
    timer = window.setTimeout(check, 1600);

    return () => {
      clearTimeout(timer);
      io.disconnect();
      watch.disconnect();
      removeEventListener("tp:arrived", release);
    };
  }, []);

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
