"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { REDUCED } from "@/components/motion/useReducedMotion";
import { Photo } from "@/components/ui/Photo";
import type { Puppy } from "@/content/types";

export type Friend = Pick<Puppy, "id" | "slug" | "displayName" | "breed" | "cover">;
type SeatState = "duck" | "pop" | undefined;

/** The six arches: centre x (%), width (rem), how much of the photo peeks over the quilt, tilt (deg). */
const SEATS = [
  [9, 8.6, 0.62, -5],
  [22.5, 10.4, 0.8, 3],
  [35, 9.2, 0.7, -2],
  [65, 9.4, 0.74, 3],
  [77.5, 10.6, 0.82, -3],
  [91, 8.4, 0.6, 4],
] as const;
/** Pauses between swaps (ms), cycled so the rhythm never feels mechanical. */
const BEATS = [1900, 2500, 1700, 2300, 2000, 2800, 1800];

const seatStyle = (i: number) => {
  const [x, w, peek, tilt] = SEATS[i];
  return { "--x": `${x}%`, "--w": `${w}rem`, "--peek": peek, "--tilt": `${tilt}deg`, "--i": i } as CSSProperties;
};

function shuffle<T>(items: T[]) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The hero's arches. After the opening peek, one seat at a time ducks behind the quilt and pops back
 * up, swapped for the puppy waiting (preloaded) in the wings, with its name tag. It pauses while the
 * hero is off screen, the tab is hidden, or the visitor is scrolling or pointing; reduced motion
 * keeps the first six still. Hovering or focusing a puppy shows its name.
 */
export function HeroLineup({ friends }: { friends: Friend[] }) {
  const n = Math.min(SEATS.length, friends.length);
  const [seated, setSeated] = useState(() => friends.slice(0, n).map((_, i) => i));
  const [states, setStates] = useState<Record<number, SeatState>>({});
  const [popped, setPopped] = useState<number | null>(null);
  const [pointed, setPointed] = useState<number | null>(null);
  const [wings, setWings] = useState<number | null>(friends.length > n ? n : null);
  const list = useRef<HTMLUListElement>(null);
  const wingsRef = useRef<HTMLSpanElement>(null);
  const seatedRef = useRef(seated);

  useEffect(() => {
    seatedRef.current = seated;
  }, [seated]);

  useEffect(() => {
    const ul = list.current;
    if (!ul || !n || matchMedia(REDUCED).matches) return;
    const swapping = friends.length > n;
    const scene = ul.closest<HTMLElement>("[data-pup-scene]");
    let visible = true;
    let quietUntil = 0;
    let alive = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.35 });
    io.observe(ul);
    const hush = () => (quietUntil = performance.now() + 1200);
    addEventListener("scroll", hush, { passive: true });
    addEventListener("pointerdown", hush, { passive: true });
    ul.addEventListener("pointerover", hush, { passive: true });

    const offstage = () => friends.map((_, i) => i).filter((i) => !seatedRef.current.includes(i));
    const first = offstage();
    // The understudy already preloaded in the wings goes first.
    let queue = first.includes(n) ? [n, ...shuffle(first.filter((i) => i !== n))] : shuffle(first);
    let seats: number[] = [];
    let last = -1;
    let beat = 0;
    let tries = 0;
    let timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const tick = (): void => {
      if (document.hidden || !visible || performance.now() <= quietUntil || scene?.dataset.here === "false") {
        later(tick, 900);
        return;
      }
      if (!swapping) return swap();
      if (!queue.length) queue = shuffle(offstage());
      const wing = wingsRef.current;
      const img = wing?.dataset.for === String(queue[0]) ? wing.querySelector("img") : null;
      if (!img || !img.complete || !img.naturalWidth) {
        // Wait for the understudy's photo; after a few tries, send in the next one instead.
        if (++tries < 15) return void later(tick, 400);
        queue.push(queue.shift()!);
        setWings(queue[0] ?? null);
        tries = 0;
        return void later(tick, 800);
      }
      tries = 0;
      img.decode().then(swap, swap);
    };

    const swap = () => {
      if (!seats.length)
        seats = shuffle(
          [...ul.children].map((li, i) => (li.getClientRects().length ? i : -1)).filter((i) => i >= 0),
        ).filter((s, k, all) => !(k === 0 && s === last && all.length > 1));
      const seat = seats.shift();
      if (seat === undefined) return void later(tick, 2000);
      last = seat;
      const incoming = swapping ? queue.shift()! : seatedRef.current[seat];
      setStates((s) => ({ ...s, [seat]: "duck" }));
      later(() => {
        if (swapping) {
          const outgoing = seatedRef.current[seat];
          setSeated((cur) => cur.map((f, i) => (i === seat ? incoming : f)));
          queue.push(outgoing);
          setWings(queue[0] ?? null);
        }
        setStates((s) => ({ ...s, [seat]: "pop" }));
        setPopped(seat);
        later(() => setPopped((p) => (p === seat ? null : p)), 1800);
        later(() => setStates((s) => ({ ...s, [seat]: undefined })), 700);
      }, 360);
      later(tick, BEATS[beat++ % BEATS.length]);
    };

    if (swapping) later(() => setWings(queue[0] ?? null), 0);
    // Start once the opening peek has finished.
    const peeks = [...ul.querySelectorAll(".tp-lineup__pup")]
      .flatMap((el) => el.getAnimations())
      .filter((a) => (a as CSSAnimation).animationName === "tp-peek");
    const start = () => {
      if (alive) later(tick, 250);
    };
    Promise.all(peeks.map((a) => a.finished)).then(start, start);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      timers = [];
      io.disconnect();
      removeEventListener("scroll", hush);
      removeEventListener("pointerdown", hush);
      ul.removeEventListener("pointerover", hush);
    };
  }, [friends, n]);

  if (!n) return null;
  const leave = (i: number) => () => setPointed((p) => (p === i ? null : p));

  return (
    <>
      <ul ref={list} className="tp-lineup" aria-label="Some of the puppies in our showroom">
        {seated.map((f, i) => {
          const p = friends[f];
          return (
            <li key={i} className="tp-lineup__seat" style={seatStyle(i)}>
              <Link
                href={`/puppies/${p.slug}`}
                className="tp-lineup__pup"
                data-pup-friend="true"
                data-state={states[i]}
                aria-label={`Meet ${p.displayName}, ${p.breed}`}
                onPointerEnter={() => setPointed(i)}
                onPointerLeave={leave(i)}
                onFocus={() => setPointed(i)}
                onBlur={leave(i)}
              >
                <span className="tp-lineup__photo">
                  <Photo key={p.id} media={p.cover} sizes="11rem" loading="eager" fetchPriority={i < 2 ? "high" : undefined} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
        {seated.map((f, i) => (
          <li key={i} className="tp-lineup__seat" style={seatStyle(i)}>
            <span
              className="tp-lineup__ghost"
              data-state={states[i]}
              data-tag={popped === i || pointed === i ? "show" : undefined}
            >
              <span className="tp-lineup__name font-scrawl">{friends[f].displayName}</span>
            </span>
          </li>
        ))}
      </ul>
      {wings !== null && (
        <span ref={wingsRef} aria-hidden="true" className="tp-lineup__wings" data-for={wings}>
          <Photo media={friends[wings].cover} alt="" sizes="11rem" loading="eager" />
        </span>
      )}
    </>
  );
}
