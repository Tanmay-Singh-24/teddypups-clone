"use client";

import { useEffect, useRef } from "react";
import { PAW_PATH } from "@/components/art/Paw";
import { Teddy } from "@/components/art/teddy/Teddy";
import { POSES, RIG_W } from "@/components/art/teddy/rig";
import { REDUCED } from "@/components/motion/useReducedMotion";
import { Puppet } from "./puppet";
import { barTop, FOOT, measure, place, restingScroll, type Placement, type Stage, type StopMeta } from "./stage";
import { hearts, nextTrick, TRICKS, type Beat, type TrickContext, type TrickName } from "./tricks";

const PRINTS = 24;
type Look = { el: Element; until: number };
type Cue = { look?: Element; secs?: number; say?: string };
type TravelTrick = "jump" | "woof" | "love" | "sneeze";
const TRAVEL_TRICKS: TravelTrick[] = ["jump", "woof", "love", "sneeze"];
const pick = <T,>(options: T[], not: T | null) => {
  const pool = options.filter((o) => o !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

/** Only one director runs at a time (routes stay mounted while hidden). */
let stopCurrent: (() => void) | null = null;

/**
 * The homepage's pup actor: one Teddy on a fixed layer who walks from stop to stop as the page
 * scrolls, sits, peeks or walks on the spot at each, leaves paw prints, talks in bubbles and does
 * tricks when clicked. On phones ("lane" mode) he peeks up from the bottom edge, scene by scene.
 * While he runs, html[data-pup] hides the static buddies. Reduced motion keeps the static ones.
 */
export function PupDirector() {
  const layerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const bubbleAtRef = useRef<HTMLSpanElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stopCurrent?.();
    const layer = layerRef.current!;
    const actor = actorRef.current!;
    const body = bodyRef.current!;
    const bubble = bubbleRef.current!;
    const bubbleAt = bubbleAtRef.current!;
    const probe = probeRef.current!;
    const svg = body.querySelector("svg")!;
    const html = document.documentElement;
    const prints = [...printsRef.current!.children] as SVGElement[];
    const now = () => performance.now() / 1000;

    let stage: Stage | null = null;
    let d: Puppet | null = null;
    let running = false;
    let raf = 0;
    let resizeTimer = 0;
    let printAt = 0;
    let sayUntil = 0;
    const say = (text: string, at: number, secs = 1.4) => {
      bubble.textContent = text;
      bubble.dataset.show = "true";
      sayUntil = at + secs;
    };

    let mouse: { x: number; y: number; t: number } | null = null;
    let look: Look | null = null;
    let last = now();
    let lastScroll = scrollY;
    let prev: { x: number; y: number } | null = null;
    let current: Placement | null = null;
    /** Offset that eases out after a re-measure or a snap, so Teddy never teleports. */
    const drift = { x: 0, y: 0, s: 0 };
    let held = -1;
    let heldAt = 0;
    let idleAt = 0;
    let beats: Beat[] = [];
    let lookAt = 0;
    let lookIndex = -1;
    let treadmillX: number | null = null;
    let treadmillStill = 0;
    let basketAt = 0;
    let stillFor = 0;
    let scrolledAt = now();
    let scrollDir = 1;
    let snapped = false;
    let chase: { x: number; y: number } | null = null;
    let barY = 0;
    let laneWalked = 0;
    let anchorTop = 0;
    let printSeg = -1;
    let printStep = 0;

    const context = (m: StopMeta): TrickContext => ({
      d: d!,
      rest: POSES[m.pose],
      facing: m.facing,
      say: (text, secs) => say(text, now(), secs),
      hearts: () =>
        current &&
        hearts(
          layer,
          current.x - FOOT.x * current.s + (d!.facingDir > 0 ? 212 : RIG_W - 212) * current.s,
          current.y - (FOOT.y - 40) * current.s - anchorTop,
        ),
    });

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mouse = { x: e.clientX, y: e.clientY, t: now() };
    };
    // Other components ask Teddy to glance at something in his scene (and maybe say a line).
    const onCue = (e: Event) => {
      const cue = (e as CustomEvent<Cue>).detail;
      const scene = held >= 0 ? stage?.meta[held]?.scene : null;
      if (!scene || (cue.look && !scene.contains(cue.look))) return;
      const t = now();
      if (cue.look) look = { el: cue.look, until: t + (cue.secs ?? 1.6) };
      if (cue.say) say(cue.say, t);
    };
    // He watches whatever the keyboard focuses.
    const onFocus = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement && el.matches("a, button, input, textarea, select, summary"))
        look = { el, until: now() + 1.4 };
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!stage || !d) return;
      const t = now();
      const dt = Math.min(0.05, t - last);
      last = t;
      const scroll = scrollY;
      const scrolled = scroll - lastScroll;
      lastScroll = scroll;
      if (Math.abs(scrolled) > 0.5) {
        scrolledAt = t;
        scrollDir = scrolled > 0 ? 1 : -1;
      }
      while (beats.length && beats[0][0] <= t) beats.shift()![1](t);

      const effective = t - scrolledAt > 0.25 ? restingScroll(stage, scroll) : scroll;
      const p = place(stage, effective);
      const laneHop =
        stage.lane &&
        stage.stops[p.k].track.kind === "screen" &&
        (p.t > 0 ? stage.stops[p.k + 1] : stage.stops[p.k])?.track.kind === "screen";

      const fade = Math.exp(-dt / 0.28);
      drift.x *= fade;
      drift.y *= fade;
      drift.s *= fade;
      if (Math.abs(drift.x) < 0.05 && Math.abs(drift.y) < 0.05) drift.x = drift.y = 0;
      const isSnapped = effective !== scroll;
      if (isSnapped !== snapped && prev && !laneHop) {
        drift.x = prev.x - p.x;
        drift.y = prev.y - p.y;
      }
      snapped = isSnapped;

      const s = p.s + drift.s;
      let x = p.x + drift.x;
      let y = p.y + drift.y;
      const base = stage.lane ? barTop() : 0;
      let arrived = true;
      if (laneHop) {
        // Between two edge peeks on a phone, scurry along the bar instead of following the scroll.
        chase ??= prev ? { x: prev.x, y: prev.y - barY } : { x, y: y - base };
        const k = 1 - Math.exp(-dt / 0.14);
        chase.x += (x - chase.x) * k;
        chase.y += (y - base - chase.y) * k;
        arrived = Math.hypot(x - chase.x, y - base - chase.y) < 1.5;
        x = chase.x;
        y = base + chase.y;
      } else if (chase) {
        drift.x = (prev?.x ?? x) - p.x;
        drift.y = (prev?.y ?? y) - p.y;
        x = p.x + drift.x;
        y = p.y + drift.y;
        chase = null;
      }
      barY = base;
      current = { ...p, x, y, s };
      layer.dataset.anchor = laneHop ? "bottom" : "top";
      anchorTop = laneHop ? layer.getBoundingClientRect().top : 0;

      const holding = p.t === 0 && arrived;
      const k = p.k;
      if (holding) {
        const m = stage.meta[k];
        if (held !== k) {
          beats = [];
          look = null;
          held = k;
          heldAt = t;
          idleAt = t;
          treadmillX = null;
          d.reset();
          d.setPose(m.pose);
          d.face(m.facing, 0.14);
          d.stride(0);
          d.wag(m.act === "basket" ? 0.3 : 0.7);
          d.jolt(0.4);
          basketAt = t + 2.4;
        }
        if (m.treadmill && !beats.length) {
          // Walk on the spot as the hallway slides past, in step with it.
          const left = m.treadmill.getBoundingClientRect().left;
          const moved = treadmillX === null ? 0 : left - treadmillX;
          treadmillX = left;
          d.walkedTo(-left / s);
          if (Math.abs(moved) > 0.15) {
            treadmillStill = 0;
            d.setPose("walk");
            d.stride(1);
            d.face(moved < 0 ? 1 : -1, 0.16);
          } else if ((treadmillStill += dt) > 0.25) {
            d.setPose("stand");
            d.stride(0);
          }
        }
        if (m.act === "tilt" && !beats.length && t - heldAt > 1.2) {
          const w = Math.sin(0.9 * t);
          d.cock(w > 0.35 ? 13 : w < -0.35 ? -10 : 0);
        }
        if (m.act === "basket" && !beats.length && t > basketAt) {
          basketAt = t + 4.5 + 3 * Math.random();
          if (Math.random() < 0.7) d.jolt(0.55);
          else d.yawn(t, 0.7);
        }
        // Glance at the scene's things in turn, unless something else has his attention.
        const busy = (look && look.until > t) || (mouse && t - mouse.t < 2.5);
        if (m.looks.length && !busy && t - heldAt > 0.8 && t - lookAt > 1.7) {
          lookAt = t;
          lookIndex = (lookIndex + 1) % (m.looks.length + 1);
          if (lookIndex < m.looks.length) look = { el: m.looks[lookIndex], until: t + 1.4 };
        }
        if (Math.abs(scrolled) > 0.5) idleAt = t;
        if (!beats.length && !m.treadmill && m.act !== "basket" && t - idleAt > 9) {
          idleAt = t;
          beats =
            Math.random() < 0.55
              ? TRICKS.tilt(context(m), t)
              : [
                  [t, () => d!.wag(1)],
                  [t + 2.4, () => d!.wag(0.7)],
                ];
        }
      } else {
        if (held !== -1) {
          held = -1;
          beats = [];
          d.reset();
        }
        const step = prev ? Math.hypot(x - prev.x, y - prev.y) : 0;
        stillFor = step > 0.25 ? 0 : stillFor + dt;
        let airborne = p.airborne;
        if (stage.lane && p.t > 0) {
          const a = stage.stops[k];
          const b = stage.stops[k + 1];
          if (a.sink && p.t < 0.22) airborne = scrollDir > 0;
          else if (b?.sink && p.t > 0.78) airborne = scrollDir < 0;
        }
        if (airborne) {
          d.setPose("hop");
          d.stride(0);
        } else if (stillFor > 0.3) {
          d.setPose("stand");
          d.stride(0);
          if (stillFor > 2.6 && stillFor - dt <= 2.6) say("coming?", t);
        } else {
          d.setPose("walk");
          d.stride(1);
        }
        d.walkedTo((laneHop ? (laneWalked += step) : p.walked) / Math.max(0.05, s));
        if (prev) {
          const dx = x - prev.x;
          if (Math.abs(dx) > 0.6 && Math.abs(dx) > 0.35 * Math.abs(y - prev.y)) d.face(dx > 0 ? 1 : -1, 0.16);
        }
        if (!stage.lane) stampPrint(p, x, y, s, scrolled, k);
      }

      prev = { x, y };
      const visitedTo = p.t;
      stage.meta.forEach((m, i) => {
        if (!m.scene) return;
        setData(m.scene, "here", String(holding && i === k));
        setData(m.scene, "visited", String(i <= k || (i === k + 1 && visitedTo > 0.92)));
      });

      if (look && look.until > t) {
        const r = look.el.getBoundingClientRect();
        d.lookAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      } else d.lookAt(mouse && t - mouse.t < 2.5 ? mouse : null);

      actor.style.transform = `translate3d(${(x - FOOT.x * s).toFixed(2)}px, ${(y - FOOT.y * s - anchorTop).toFixed(2)}px, 0)`;
      body.style.transform = `scale(${s.toFixed(4)})`;
      setData(layer, "front", String(p.front));
      setData(actor, "holding", String(holding));
      if (bubble.dataset.show === "true") {
        if (t > sayUntil) bubble.dataset.show = "false";
        const bx = (d.facingDir > 0 ? 214 : RIG_W - 214) * s;
        bubbleAt.style.transform = `translate(${bx.toFixed(1)}px, ${(30 * s).toFixed(1)}px)`;
      }
      d.tick(dt, t);
    };

    /** Every ~34 rig units of walking, a paw print at the stepping foot, turned along the path. */
    const stampPrint = (p: Placement, x: number, y: number, s: number, scrolled: number, k: number) => {
      const step = Math.floor(p.walked / (34 * s));
      if (printSeg === k && step !== printStep && !p.airborne && prev && d && stage) {
        const front = step & 1;
        const footX = front ? 186 : 110;
        const left = x - FOOT.x * s + (d.facingDir > 0 ? footX : RIG_W - footX) * s;
        const top = y - FOOT.y * s + 226 * s + scrollY - stage.mainTop + (front ? -4 : 4) * s;
        const angle = Math.atan2(y - prev.y + scrolled, x - prev.x) + Math.PI / 2;
        const size = 14 * Math.max(0.75, 1.5 * s);
        const print = prints[printAt++ % prints.length];
        print.style.transform = `translate(${(left - size / 2).toFixed(1)}px, ${(top - size / 2).toFixed(1)}px) rotate(${angle.toFixed(3)}rad)`;
        print.style.width = print.style.height = `${size.toFixed(1)}px`;
        print.animate([{ opacity: 0 }, { opacity: 0.45, offset: 0.08 }, { opacity: 0.45, offset: 0.5 }, { opacity: 0 }], {
          duration: 2600,
          easing: "ease-out",
        });
      }
      printSeg = k;
      printStep = step;
    };

    // Clicks: a trick (on the move, a quick one), with zoomies after four quick clicks at a stop.
    let clicks = 0;
    let clickAt = 0;
    let lastTrick: TrickName | TravelTrick | null = null;
    const onClick = () => {
      if (!d || !stage) return;
      const t = now();
      clicks = t - clickAt < 0.7 ? clicks + 1 : 1;
      clickAt = t;
      idleAt = t;
      const dd = d;
      if (held < 0) {
        const m = stage.meta[Math.max(0, current?.k ?? 0)];
        const trick = pick(TRAVEL_TRICKS, lastTrick as TravelTrick | null);
        lastTrick = trick;
        const c = context(m);
        beats =
          trick === "jump"
            ? [
                [t, () => (dd.hop(1.35), c.say(pick(["wheee!", "boing!", "yip!"], null)))],
                [t + 0.5, () => dd.hop(0.7)],
              ]
            : trick === "woof"
              ? [
                  [t, (n) => (dd.woof(n), c.say("woof!"))],
                  [t + 0.4, (n) => dd.woof(n)],
                ]
              : trick === "love"
                ? [[t, () => (dd.wag(1), dd.hop(0.5), c.hearts(), c.say("I like you!"))]]
                : [[t, (n) => (dd.jolt(1.4), dd.hop(0.4), dd.yawn(n, 0.22), c.say("achoo!"))]];
        return;
      }
      const m = stage.meta[held];
      let trick: TrickName;
      if (m.treadmill) trick = pick<TrickName>(["woof", "hop", "love"], lastTrick as TrickName);
      else if (m.act === "basket") trick = pick<TrickName>(["tilt", "love", "sneeze", "woof"], lastTrick as TrickName);
      else if (m.pose === "peek") trick = pick<TrickName>(["peekaboo", "woof", "tilt", "sneeze"], lastTrick as TrickName);
      else {
        trick = nextTrick(lastTrick as TrickName, clicks);
        if (trick === "zoomies") trick = "spin";
      }
      if (trick === "peekaboo" && beats.length) return;
      lastTrick = trick;
      d.reset();
      beats = TRICKS[trick](context(m), t);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !d || held < 0) return;
      d.petting(true);
      d.wag(1);
    };
    const onLeave = () => {
      if (!d) return;
      d.petting(false);
      if (held >= 0) d.wag(stage?.meta[held]?.act === "basket" ? 0.3 : 0.7);
    };

    const start = () => {
      if (running || matchMedia(REDUCED).matches) return;
      const s = measure(probe);
      if (s.stops.length < 2) return;
      stage = s;
      running = true;
      html.dataset.pup = s.lane ? "lane" : "live";
      layer.hidden = false;
      const first = s.meta[0];
      d = new Puppet(svg, first.pose, first.facing);
      lastScroll = scrollY;
      prev = null;
      scrolledAt = last = now();
      snapped = false;
      chase = null;
      const t = last;
      const at = place(s, scrollY);
      if (at.k === 0 && at.t === 0 && first.act === "peekaboo") {
        // The opening: duck down, pop up with "peekaboo!", glance along the lineup, wag.
        held = 0;
        heldAt = t;
        const friends = first.scene?.querySelectorAll("[data-pup-friend]") ?? [];
        const a = friends[0];
        const z = friends[friends.length - 1];
        const dd = d;
        beats = [
          [t + 0.1, () => dd.setPose({ ...POSES.peek, headY: 120 })],
          [t + 0.7, (n) => (dd.setPose("peek"), dd.jolt(1.2), say("peekaboo!", n, 1.6))],
          [t + 1.5, (n) => a && (look = { el: a, until: n + 0.8 })],
          [t + 2.3, (n) => z && (look = { el: z, until: n + 0.8 })],
          [t + 3.1, () => ((look = null), dd.wag(1))],
        ];
      } else held = -1;
      addEventListener("pointermove", onPointerMove, { passive: true });
      addEventListener("pup:cue", onCue);
      addEventListener("focusin", onFocus);
      actor.addEventListener("click", onClick);
      actor.addEventListener("pointerenter", onEnter);
      actor.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      delete html.dataset.pup;
      layer.hidden = true;
      delete layer.dataset.anchor;
      anchorTop = 0;
      stage?.meta.forEach((m) => {
        if (!m.scene) return;
        delete m.scene.dataset.here;
        delete m.scene.dataset.visited;
      });
      stage = null;
      d = null;
      held = -1;
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pup:cue", onCue);
      removeEventListener("focusin", onFocus);
      actor.removeEventListener("click", onClick);
      actor.removeEventListener("pointerenter", onEnter);
      actor.removeEventListener("pointerleave", onLeave);
    };

    // Re-measure after layout changes; ease from where he was to where he now belongs.
    const remeasure = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!running || !stage) return;
        const s = measure(probe);
        if (s.stops.length < 2) return stop();
        const was = current;
        const switched = s.lane !== stage.lane;
        stage = s;
        html.dataset.pup = s.lane ? "lane" : "live";
        if (switched) held = -1;
        if (was) {
          const p = place(s, scrollY);
          drift.x = was.x - p.x;
          drift.y = was.y - p.y;
          drift.s = was.s - p.s;
        }
      }, 120);
    };
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    addEventListener("resize", remeasure);
    addEventListener("load", remeasure);
    const reduced = matchMedia(REDUCED);
    const onMotionPref = () => (reduced.matches ? stop() : start());
    reduced.addEventListener("change", onMotionPref);
    start();
    document.fonts?.ready.then(remeasure);

    const cleanup = () => {
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      removeEventListener("resize", remeasure);
      removeEventListener("load", remeasure);
      reduced.removeEventListener("change", onMotionPref);
      if (stopCurrent === cleanup) stopCurrent = null;
    };
    stopCurrent = cleanup;
    return cleanup;
  }, []);

  return (
    <>
      <div ref={probeRef} aria-hidden="true" className="pup-probe" />
      <div ref={printsRef} aria-hidden="true" className="pup-prints">
        {Array.from({ length: PRINTS }, (_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={PAW_PATH} />
          </svg>
        ))}
      </div>
      <div ref={layerRef} aria-hidden="true" className="pup-layer" hidden data-front="true">
        <div ref={actorRef} className="pup-actor">
          <div ref={bodyRef} className="pup-actor__body">
            <Teddy pose="peek" />
          </div>
          <span ref={bubbleAtRef} className="pup-bubble-at">
            <span ref={bubbleRef} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  );
}

function setData(el: HTMLElement, key: string, value: string) {
  if (el.dataset[key] !== value) el.dataset[key] = value;
}

