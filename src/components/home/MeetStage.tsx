"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cuePup } from "@/components/motion/cue";
import { PupStop } from "@/components/motion/PupStop";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

const WIDE = "(min-width: 1024px)";

type MeetStageProps = {
  /** The heading block above the hall. */
  head: ReactNode;
  /** One server-rendered door per puppy. */
  doors: { id: string; node: ReactNode }[];
};

/**
 * The Meet hallway. Below 1024px, or with reduced motion, it is a grid of open doors. From 1024px
 * the section pins (data-pinned): the range grows by 0.8 × the track's overflow, the stage sticks,
 * and scroll progress (sprung) slides the track left past Teddy, who walks on the spot. Each door
 * swings open once it passes 36% of the viewport, and the floor planks move with the track.
 */
export function MeetStage({ head, doors }: MeetStageProps) {
  const range = useRef<HTMLDivElement>(null);
  const hall = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [overflow, setOverflow] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Size the doors to the viewport and measure how far the track overflows it.
  useLayoutEffect(() => {
    const measure = () => {
      const wide = matchMedia(WIDE).matches;
      setPinned(wide && !reduced);
      const ol = track.current;
      const h = hall.current;
      if (h && ol && wide && !reduced) {
        const stage = h.parentElement!;
        const heading = stage.querySelector<HTMLElement>(".tp-meet__head");
        const plate = Math.max(64, ...[...ol.querySelectorAll<HTMLElement>(".tp-door__plate")].map((p) => p.offsetHeight));
        const floor = h.querySelector<HTMLElement>(".tp-meet__floor")?.offsetHeight ?? 0;
        const room = stage.clientHeight - (heading ? heading.offsetTop + heading.offsetHeight : 0) - floor - plate - 40;
        const w = Math.max(128, Math.min(256, 0.15 * innerWidth, room / 1.3));
        h.style.setProperty("--door-w", `${w.toFixed(0)}px`);
      } else h?.style.removeProperty("--door-w");
      setOverflow(ol ? Math.max(0, ol.scrollWidth - innerWidth) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    if (hall.current?.parentElement) ro.observe(hall.current.parentElement);
    addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", measure);
    };
  }, [reduced]);

  // data-pinned lives on the scene's <section>, which the server renders.
  useLayoutEffect(() => {
    const section = range.current?.closest<HTMLElement>(".tp-meet");
    if (!section) return;
    if (pinned) section.dataset.pinned = "true";
    else delete section.dataset.pinned;
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: range, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 170, damping: 32, mass: 0.35 });
  const x = useTransform(progress, [0, 1], [0, -overflow]);

  useLayoutEffect(() => {
    const ol = track.current;
    if (!pinned || !ol) return;
    const follow = (at: number, moving: boolean) => {
      hall.current?.style.setProperty("--floor-x", `${at.toFixed(1)}px`);
      const edge = 0.36 * innerWidth;
      for (const li of ol.children as HTMLCollectionOf<HTMLElement>) {
        const open = li.offsetLeft + at < edge;
        if ((li.dataset.open === "true") === open) continue;
        li.dataset.open = String(open);
        if (open && moving) cuePup({ look: li, secs: 0.9 });
      }
    };
    follow(x.get(), false);
    return x.on("change", (at) => follow(at, true));
  }, [pinned, x]);

  return (
    <div
      ref={range}
      data-pin-range="true"
      style={{ height: pinned ? `calc(100vh + ${Math.round(0.8 * overflow)}px)` : undefined, "--pinned": +pinned } as CSSProperties}
    >
      <div className="tp-meet__stage">
        {head}
        <div ref={hall} className="tp-meet__hall">
          <motion.ol
            ref={track}
            style={pinned ? { x } : undefined}
            className="tp-meet__track"
            data-treadmill="true"
            aria-label="Puppies looking for a family"
          >
            {doors.map((d) => (
              <li key={d.id} className="tp-door" data-open={pinned ? "false" : "true"}>
                {d.node}
              </li>
            ))}
            <li className="tp-door tp-door--all" data-open="true">
              <Link className="tp-door__link" href="/puppies">
                <span className="tp-door__frame tp-door__frame--all">
                  <span className="font-plush tp-door__all">Meet them all</span>
                </span>
              </Link>
            </li>
          </motion.ol>
          <div aria-hidden="true" className="tp-meet__floor" />
          <PupStop
            pose={pinned ? "walk" : "sit"}
            facing="right"
            act={pinned ? "treadmill" : undefined}
            className="tp-meet__teddy"
          />
        </div>
      </div>
    </div>
  );
}
