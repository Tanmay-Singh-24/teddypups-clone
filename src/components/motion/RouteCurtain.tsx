"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { PAW_PATH } from "@/components/art/Paw";
import { Runner } from "@/components/art/teddy/Runner";
import { introTime } from "./curtain";
import { REDUCED } from "./useReducedMotion";

type State = "intro" | "idle" | "covering" | "covered" | "snap" | "lifting";

/** Paw prints the runner leaves: left %, top px, rotation. */
const PRINTS = [
  [18, 6, -76],
  [27, -4, -84],
  [36, 7, -72],
  [45, -3, -86],
  [54, 6, -74],
] as const;

/**
 * The quilted page curtain. On first load it plays the intro (already covering, then lifting). On
 * every plain left-click to another internal page it rises from the bottom, Teddy gallops across
 * stamping prints, the route changes underneath, and it lifts once the new path has rendered.
 * Back/forward snap it shut briefly. Modified clicks, new tabs, downloads, same-page hashes,
 * `data-no-curtain` links and reduced motion navigate normally.
 */
export function RouteCurtain() {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const coveredAt = useRef(0);
  const timers = useRef<number[]>([]);
  const lastPath = useRef(pathname);
  const byKeyboard = useRef(false);
  const lift = useRef(() => {});

  useEffect(() => {
    const el = ref.current!;
    const html = document.documentElement;
    const set = (s: State) => {
      el.dataset.state = s;
      if (s === "idle") delete html.dataset.curtain;
      else html.dataset.curtain = s;
    };
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

    const doLift = () => {
      const s = el.dataset.state;
      if (s === "idle" || s === "lifting") return;
      clear();
      pending.current = null;
      set("lifting");
      dispatchEvent(new Event("tp:arrived"));
      if (byKeyboard.current) {
        byKeyboard.current = false;
        document.getElementById("main")?.focus({ preventScroll: true });
      }
      later(() => set("idle"), 460);
    };

    const go = (href: string) => {
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.search === location.search) {
        pending.current = null;
        scrollTo({ top: 0, behavior: "instant" });
        later(doLift, 120);
        return;
      }
      router.push(url.pathname + url.search + url.hash);
      later(doLift, 6000); // never leave the page covered
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noCurtain !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /^\/(admin|api|media|_next)(\/|$)/.test(url.pathname)) return;
      // A hash on the same page scrolls instead.
      if (url.pathname === location.pathname && (url.hash || url.search !== location.search)) return;
      if (matchMedia(REDUCED).matches) return;
      e.preventDefault();
      e.stopPropagation();
      byKeyboard.current = e.detail === 0;
      router.prefetch(url.pathname + url.search);
      dispatchEvent(new Event("tp:navigate"));
      pending.current = url.href;
      const s = el.dataset.state as State;
      if (s === "covered" || s === "snap") return go(url.href);
      if (s === "covering") return;
      clear();
      if (s === "intro" && introTime() < 1080) {
        set("covered");
        coveredAt.current = performance.now();
        go(url.href);
        return;
      }
      set("covering");
      later(() => {
        set("covered");
        coveredAt.current = performance.now();
        if (pending.current) go(pending.current);
      }, 300);
    };

    const onPopState = () => {
      if (matchMedia(REDUCED).matches || location.pathname === lastPath.current) return;
      clear();
      set("snap");
      coveredAt.current = performance.now();
      later(doLift, 1400);
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      clear();
      set("idle");
    };

    if (el.dataset.state === "intro") {
      const t = introTime();
      later(() => dispatchEvent(new Event("tp:arrived")), Math.max(0, 560 - t));
      later(() => el.dataset.state === "intro" && set("idle"), Math.max(0, 1080 - t));
    }
    if (matchMedia(REDUCED).matches) set("idle");
    addEventListener("click", onClick, true);
    addEventListener("popstate", onPopState);
    addEventListener("pageshow", onPageShow);
    lift.current = doLift;
    return () => {
      clear();
      delete html.dataset.curtain;
      removeEventListener("click", onClick, true);
      removeEventListener("popstate", onPopState);
      removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  // The new route has rendered: lift on the next frame (after the cover has fully closed).
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const s = ref.current?.dataset.state;
    if (s !== "covered" && s !== "snap" && s !== "covering") return;
    const wait = s === "covering" ? 340 : Math.max(0, 140 - (performance.now() - coveredAt.current));
    const t = setTimeout(() => requestAnimationFrame(() => lift.current()), wait);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div ref={ref} className="tp-curtain" data-state="intro" aria-hidden="true">
      <div className="tp-curtain__blanket">
        <svg className="tp-curtain__edge tp-curtain__edge--top" width="100%" height="40" preserveAspectRatio="none">
          <defs>
            <pattern id="tp-curtain-scallop" width="76" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V27A38 25 0 0 1 76 27V40Z" fill="#fbe3b4" />
              <path d="M0 27A38 25 0 0 1 76 27" fill="none" stroke="#2a170e" strokeWidth="3" />
              <path
                d="M11 33A27 19 0 0 1 65 33"
                fill="none"
                stroke="#2a170e"
                strokeWidth="1.6"
                strokeDasharray="3.5 5.5"
                strokeLinecap="round"
                opacity=".42"
              />
            </pattern>
          </defs>
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
        <div className="tp-curtain__stage">
          <div className="tp-curtain__prints">
            {PRINTS.map(([left, top, rot], i) => (
              <svg
                key={i}
                viewBox="0 0 64 64"
                className="tp-curtain__print"
                style={{ left: `${left}%`, top: `${top}px`, rotate: `${rot + 90}deg`, animationDelay: `${0.16 + 0.12 * i}s` }}
              >
                <path d={PAW_PATH} />
              </svg>
            ))}
          </div>
          <div className="tp-curtain__runner">
            <Runner />
          </div>
          <p className="tp-curtain__note font-scrawl">every puppy is family</p>
        </div>
        <svg className="tp-curtain__edge tp-curtain__edge--bottom" width="100%" height="40" preserveAspectRatio="none">
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
      </div>
    </div>
  );
}
