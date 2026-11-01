"use client";

import { useEffect, useRef } from "react";
import { cuePup } from "@/components/motion/cue";
import { useMediaQuery, useReducedMotion } from "@/components/motion/useReducedMotion";

const SAYS = [undefined, "ooh, photos!", "home soon!"];

/**
 * Replays the journey chat as its steps scroll through a band near the top third of the screen
 * (desktop, motion allowed). Each step forward shows "typing…" and the dots for 750ms, then that
 * step's messages. Otherwise, and on unmount, the server's finished conversation stays as it is.
 * It drives the server-rendered markup in its parent through data attributes.
 */
export function ChatPlayer() {
  const anchor = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const still = reduced || !desktop;

  useEffect(() => {
    const root = anchor.current?.parentElement;
    if (still || !root) return;
    const steps = [...root.querySelectorAll<HTMLElement>(".tp-chat__step")];
    const groups = [...root.querySelectorAll<HTMLElement>(".tp-msg-group")];
    const dots = root.querySelector<HTMLElement>(".tp-typing");
    const status = root.querySelector<HTMLElement>(".tp-phone__status");
    let at = -1;
    let typing = false;
    let timer = 0;

    const paint = (active: number, isTyping: boolean) => {
      steps.forEach((s, i) => {
        s.toggleAttribute("data-active", i === active);
        s.toggleAttribute("data-done", i < active);
      });
      groups.forEach((g, i) => (g.dataset.show = String(i < active || (i === active && !isTyping))));
      if (dots) dots.dataset.show = String(isTyping);
      if (status) status.textContent = isTyping ? "typing…" : "online";
    };

    const go = (next: number) => {
      const forward = next > at;
      at = next;
      clearTimeout(timer);
      typing = forward;
      if (forward)
        timer = window.setTimeout(() => {
          typing = false;
          paint(at, false);
          const group = groups[at];
          if (group) cuePup({ look: group, secs: 1.4, say: SAYS[at] });
        }, 750);
      paint(at, typing);
    };

    paint(-1, false);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) go(steps.indexOf(e.target as HTMLElement));
      },
      { rootMargin: "-28% 0px -62% 0px" },
    );
    steps.forEach((s) => io.observe(s));

    return () => {
      io.disconnect();
      clearTimeout(timer);
      paint(steps.length - 1, false);
    };
  }, [still]);

  return <span ref={anchor} hidden />;
}
