"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * The fixed header shell. Sets data-scrolled after a few pixels, hides the bar while scrolling down
 * (past 220px) and brings it back on scroll up or when something inside it takes focus.
 */
export function HeaderBehavior({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const isHome = usePathname() === "/";

  useEffect(() => {
    const header = ref.current!;
    let lastY = scrollY;
    let queued = false;
    const update = () => {
      const y = scrollY;
      header.dataset.scrolled = y > 8 ? "true" : "false";
      if (Math.abs(y - lastY) > 6) {
        header.dataset.hidden = y > lastY && y > 220 ? "true" : "false";
        lastY = y;
      }
      queued = false;
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    const reveal = () => (header.dataset.hidden = "false");
    update();
    addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", reveal);
    return () => {
      removeEventListener("scroll", onScroll);
      header.removeEventListener("focusin", reveal);
    };
  }, []);

  return (
    <header
      ref={ref}
      id="site-header"
      data-scrolled="false"
      data-hidden="false"
      data-home={isHome || undefined}
      className="tp-header fixed inset-x-0 top-0 z-50"
    >
      {children}
    </header>
  );
}
