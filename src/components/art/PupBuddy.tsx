"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Puppet } from "@/components/pup/puppet";
import { hearts, nextTrick, TRICKS, type Beat, type TrickContext, type TrickName } from "@/components/pup/tricks";
import { Teddy, type Facing } from "./teddy/Teddy";
import { POSES, type PoseName } from "./teddy/rig";

type PupBuddyProps = {
  pose?: PoseName;
  facing?: Facing;
  /** "tilt" cocks the head now and then. */
  act?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  /** Inside a homepage stop: stays still while the pup actor (html[data-pup]) has taken over. */
  asStop?: boolean;
};

const PEEK_TRICKS: TrickName[] = ["peekaboo", "woof", "tilt", "sneeze"];
const SNUG_TRICKS: TrickName[] = ["tilt", "love", "sneeze", "woof"];

/**
 * Teddy with a speech bubble. The server draws him still; with motion allowed he comes alive while
 * on screen (data-live): he blinks, breathes, wags, follows the mouse, purrs (happy eyes) while
 * hovered and does a trick on every click, with zoomies after four quick clicks.
 */
export function PupBuddy({ pose = "sit", facing = "right", act, label, className = "", style, asStop = false }: PupBuddyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = ref.current;
    const say = bubble.current;
    const svg = host?.querySelector("svg");
    if (reduced || !host || !say || !svg) return;
    const dir = facing === "left" ? -1 : 1;
    const d = new Puppet(svg, pose, dir);
    d.wag(0.6);
    let beats: Beat[] = [];
    let last = performance.now() / 1000;
    let idleAt = last;
    let sayUntil = 0;
    let mouse: { x: number; y: number; t: number } | null = null;
    let lastTrick: TrickName | null = null;
    let clicks = 0;
    let clickAt = 0;
    let playingUntil = 0;
    let playing = false;
    let raf = 0;
    let running = false;
    const ctx: TrickContext = {
      d,
      rest: POSES[pose],
      facing: dir,
      say: (text, secs = 1.4) => {
        say.textContent = text;
        say.dataset.show = "true";
        sayUntil = performance.now() / 1000 + secs;
      },
      hearts: () => hearts(host, host.clientWidth * (dir > 0 ? 0.7 : 0.3), 0.25 * host.clientHeight),
    };

    const tick = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - last);
      last = now;
      while (beats.length && beats[0][0] <= now) beats.shift()![1](now);
      if (playing !== now < playingUntil) {
        playing = !playing;
        host.toggleAttribute("data-playing", playing);
      }
      d.lookAt(mouse && now - mouse.t < 3 ? mouse : null);
      if (act === "tilt" && !beats.length) {
        const s = Math.sin(0.9 * now);
        d.cock(s > 0.35 ? 13 : s < -0.35 ? -10 : 0);
      }
      if (!beats.length && now - idleAt > 9) {
        idleAt = now;
        beats =
          Math.random() < 0.5
            ? TRICKS.tilt(ctx, now)
            : [
                [now, () => d.wag(1)],
                [now + 2.2, () => d.wag(0.6)],
              ];
      }
      if (say.dataset.show === "true" && now > sayUntil) say.dataset.show = "false";
      d.tick(dt, now);
      raf = requestAnimationFrame(tick);
    };

    const run = (on: boolean) => {
      if (asStop && document.documentElement.dataset.pup) on = false;
      if (on === running) return;
      running = on;
      if (on) {
        last = performance.now() / 1000;
        raf = requestAnimationFrame(tick);
      } else cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    io.observe(host);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mouse = { x: e.clientX, y: e.clientY, t: performance.now() / 1000 };
    };
    const onClick = () => {
      const now = performance.now() / 1000;
      clicks = now - clickAt < 0.7 ? clicks + 1 : 1;
      clickAt = now;
      const pool = pose === "peek" ? PEEK_TRICKS : pose === "snug" ? SNUG_TRICKS : null;
      const options = pool?.filter((t) => t !== lastTrick) ?? [];
      const trick = pool ? options[Math.floor(Math.random() * options.length)] : nextTrick(lastTrick, clicks);
      lastTrick = trick;
      d.reset();
      beats = TRICKS[trick](ctx, now);
      playingUntil = beats[beats.length - 1][0] + 0.4;
      idleAt = now;
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      d.petting(true);
      d.wag(1);
    };
    const onLeave = () => {
      d.petting(false);
      d.wag(0.6);
    };
    addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("click", onClick);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      run(false);
      host.removeAttribute("data-playing");
      io.disconnect();
      removeEventListener("pointermove", onMove);
      host.removeEventListener("click", onClick);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, pose, facing, act, asStop]);

  return (
    <div ref={ref} className={`pup-buddy ${className}`} style={style} data-live={reduced ? undefined : ""} data-facing={facing}>
      {/* Remounted when motion turns on or off, so the puppet starts from a clean drawing. */}
      <Teddy key={String(reduced)} pose={pose} facing={facing} label={label} />
      <span ref={bubble} aria-hidden="true" className="pup-bubble" data-show="false" />
    </div>
  );
}
