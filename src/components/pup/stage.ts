// Where the pup actor stands for a given scroll position. The homepage's [data-pup-stop] anchors
// become stops; each stop owns a range of scroll ("hold") where Teddy sits at it, and between two
// holds he travels along a curve from one stop to the next as the page scrolls. Pure geometry: the
// director (PupDirector.tsx) turns it into poses, prints and bubbles.
import type { PoseName } from "@/components/art/teddy/rig";

export type Point = { x: number; y: number };
type Box = readonly [left: number, top: number, right: number, bottom: number];
type Safe = { left: number; top: number; right: number; bottom: number };

/** Teddy's feet in rig units: the point that stands on a stop. */
export const FOOT = { x: 150, y: 228 };
/** Where a peeking Teddy rests on a ledge (his chin line). */
const PEEK_FOOT = { x: 150, y: 159 };
/** How far a lane-mode peek sinks below the bar (rig units). */
const SINK = FOOT.y - PEEK_FOOT.y;
/** The drawing's visible bounds per pose, for keeping him on screen. */
const ANY_BOX: Box = [48, 30, 288, 236];
const BOXES: Partial<Record<string, Box>> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};
const boxOf = (pose: string) => BOXES[pose] ?? ANY_BOX;
/** The band of the safe area a stop's middle should sit in while held: phones, desktop. */
const LANE_BAND = [0.6, 0.86] as const;
const BAND = [0.42, 0.78] as const;

type Track =
  | { kind: "page"; top: number }
  | { kind: "screen"; top: number }
  /** Inside a sticky stage: fixed on screen between `from` and `to` scroll. */
  | { kind: "pin"; top: number; from: number; to: number };

export type Stop = { x: number; track: Track; s: number; behind: boolean; sink: number; box: Box };
export type StopMeta = {
  scene: HTMLElement | null;
  pose: PoseName;
  facing: 1 | -1;
  act: string;
  looks: HTMLElement[];
  /** The moving track Teddy walks on the spot against (the Meet hallway). */
  treadmill: HTMLElement | null;
};
export type Stage = {
  lane: boolean;
  stops: Stop[];
  meta: StopMeta[];
  holds: [number, number][];
  blend: number;
  mainTop: number;
};
export type Placement = {
  x: number;
  y: number;
  s: number;
  front: boolean;
  airborne: boolean;
  k: number;
  t: number;
  walked: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** 0 → 1 smoothly as t goes from a to b. */
const ramp = (a: number, b: number, t: number) => (b === a ? +(t >= b) : smooth(clamp01((t - a) / (b - a))));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpBox = (a: Box, b: Box, t: number): Box => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
/** Soft max / min: like Math.max/min, but rounded off over `soft` px so clamping never jerks. */
const softMax = (v: number, lo: number, soft: number) => {
  const s = (v - lo) / soft;
  return s > 20 ? v : lo + soft * Math.log1p(Math.exp(s));
};
const softMin = (v: number, hi: number, soft: number) => -softMax(-v, -hi, soft);
const bezier = (p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * c1.x + c * c2.x + d * p1.x, y: a * p0.y + b * c1.y + c * c2.y + d * p1.y };
};

/** A stop's feet in viewport coordinates at a given scroll position. */
function feet(stop: Stop, scroll: number): Point {
  const t = stop.track;
  const top =
    t.kind === "page"
      ? t.top - scroll
      : t.kind === "screen"
        ? t.top
        : scroll < t.from
          ? t.top - (scroll - t.from)
          : scroll > t.to
            ? t.top - (scroll - t.to)
            : t.top;
  return { x: stop.x + FOOT.x * stop.s, y: top + FOOT.y * stop.s };
}

/** Keeps the drawing (its pose box at scale s) inside the safe area, softly. */
function keepInside(x: number, y: number, s: number, box: Box, safe: Safe, soft = 8): Point {
  const left = (FOOT.x - box[0]) * s;
  const right = (box[2] - FOOT.x) * s;
  const above = (FOOT.y - box[1]) * s;
  const below = (box[3] - FOOT.y) * s;
  return {
    x:
      safe.right - safe.left > left + right
        ? softMin(softMax(x, safe.left + left, soft), safe.right - right, soft)
        : (safe.left + safe.right) / 2 - (right - left) / 2,
    y:
      safe.bottom - safe.top > above + below
        ? softMin(softMax(y, safe.top + above, soft), safe.bottom - below, soft)
        : safe.bottom - below,
  };
}

/** Which segment the scroll position is in: holding at stop k (t = 0), or t of the way to k + 1. */
export function segment(holds: [number, number][], scroll: number) {
  if (!holds.length || scroll <= holds[0][1]) return { k: 0, t: 0 };
  for (let k = 0; k < holds.length - 1; k++) {
    const leave = holds[k][1];
    const arrive = holds[k + 1][0];
    if (scroll < arrive) return { k, t: clamp01((scroll - leave) / Math.max(1, arrive - leave)) };
    if (scroll <= holds[k + 1][1]) return { k: k + 1, t: 0 };
  }
  return { k: holds.length - 1, t: 0 };
}

const LANE_QUERY = "(max-width: 767px), (pointer: coarse) and (max-height: 519px)";
const headerHeight = () => document.getElementById("site-header")?.offsetHeight ?? 76;
const bar = () => {
  const el = document.querySelector<HTMLElement>("[data-whatsapp-bar]");
  return el?.getClientRects().length ? el.getBoundingClientRect() : null;
};
/** The top of the phone's bottom bar (or the viewport bottom). */
export const barTop = () => {
  const r = bar();
  return r && r.height ? r.top : innerHeight - 6;
};

/** A stop inside a sticky element stays put on screen while that element is stuck. */
function trackOf(el: HTMLElement, rect: DOMRect): Track {
  let sticky: HTMLElement | null = null;
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement)
    if (getComputedStyle(p).position === "sticky") {
      sticky = p;
      break;
    }
  if (!sticky) return { kind: "page", top: rect.top + scrollY };
  const stickTop = parseFloat(getComputedStyle(sticky).top) || 0;
  const offset = rect.top - sticky.getBoundingClientRect().top;
  // Measure where the sticky element would sit unstuck.
  const was = sticky.style.position;
  sticky.style.position = "relative";
  const natural = sticky.getBoundingClientRect();
  const parent = sticky.parentElement!;
  const end = parent.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(parent).paddingBottom) || 0);
  sticky.style.position = was;
  const from = natural.top + scrollY - stickTop;
  const to = end + scrollY - natural.height - stickTop;
  return to <= from ? { kind: "page", top: natural.top + scrollY + offset } : { kind: "pin", top: stickTop + offset, from, to };
}

/** The scroll range over which a stop is held: while its middle is inside the band. */
function holdRange(stop: Stop, safe: Safe, band: readonly [number, number]): [number, number] {
  if (stop.track.kind === "pin") return [stop.track.from, stop.track.to];
  const top = stop.track.top;
  const head = top + stop.box[1] * stop.s;
  const toes = top + stop.box[3] * stop.s;
  const mid = (head + toes) / 2;
  const h = safe.bottom - safe.top;
  let from = mid - (safe.top + band[1] * h);
  let to = mid - (safe.top + band[0] * h);
  from = Math.max(from, toes - safe.bottom);
  to = Math.min(to, head - safe.top);
  if (from > to) from = to = mid - (safe.top + h / 2);
  return [from, to];
}

/**
 * Makes the holds cover the whole page in order: the first starts at -∞ and the last ends at +∞,
 * overlaps are split, and each gap is stretched to at least `gaps[k]` px of scroll so a long walk
 * gets enough room.
 */
function settleHolds(ranges: [number, number][], gaps: number[], maxScroll: number) {
  const out = ranges.map(([a, b]): [number, number] => (a <= b ? [a, b] : [(a + b) / 2, (a + b) / 2]));
  if (!out.length) return out;
  out[0][0] = -Infinity;
  const last = out[out.length - 1];
  last[1] = Infinity;
  last[0] = Math.min(last[0], maxScroll - 1);
  for (let k = 0; k < out.length - 1; k++) {
    const cur = out[k];
    const next = out[k + 1];
    if (next[0] < cur[1]) {
      const mid = (cur[1] + next[0]) / 2;
      cur[1] = Math.max(cur[0], mid);
      next[0] = Math.min(next[1], mid);
      if (next[0] < cur[1]) next[0] = cur[1];
    }
    let need = (gaps[k] ?? 0) - (next[0] - cur[1]);
    if (need > 0) {
      const a = Math.min(need / 2, cur[1] - cur[0]);
      const b = Math.min(need / 2, next[1] - next[0]);
      cur[1] -= a;
      next[0] += b;
      need -= a + b;
      const more = Math.min(need, next[1] - next[0]);
      next[0] += more;
      need -= more;
      if (need > 0) cur[1] -= Math.min(need, cur[1] - cur[0]);
    }
  }
  for (const r of out) if (r[1] < r[0]) r[1] = r[0];
  return out;
}

/** Reads every visible stop off the page. `probe` is a fixed 100svh element (the stable viewport). */
export function measure(probe: HTMLElement): Stage {
  const lane = matchMedia(LANE_QUERY).matches;
  const width = document.documentElement.clientWidth;
  const vh = probe.getBoundingClientRect().height || innerHeight;
  const b = bar();
  const safe: Safe = { left: 10, top: headerHeight() + 10, right: width - 10, bottom: vh - 10 - (b ? b.height : 0) };
  const stops: Stop[] = [];
  const meta: StopMeta[] = [];
  const ranges: [number, number][] = [];

  const add = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pose = (el.dataset.pose || "sit") as PoseName;
    const act = el.dataset.act ?? "";
    const fit = rect.width / 300;
    // The actor is drawn a touch bigger than the static buddy, except in the basket and on phones.
    const s = act === "basket" || lane ? fit : 1.12 * fit;
    const anchor = pose === "peek" ? PEEK_FOOT : FOOT;
    const track = trackOf(el, rect);
    if (track.kind !== "screen") track.top += anchor.y * (fit - s);
    const stop: Stop = { x: rect.left + anchor.x * (fit - s), track, s, behind: el.dataset.behind === "true", sink: 0, box: boxOf(pose) };
    const scene = el.closest<HTMLElement>("[data-pup-scene]");
    stops.push(stop);
    meta.push({
      scene,
      pose,
      facing: el.dataset.facing === "left" ? -1 : 1,
      act,
      looks: scene ? [...scene.querySelectorAll<HTMLElement>("[data-pup-look]")] : [],
      treadmill: act === "treadmill" ? (scene?.querySelector<HTMLElement>("[data-treadmill]") ?? null) : null,
    });
    let range = holdRange(stop, safe, lane ? LANE_BAND : BAND);
    // Arrive early in a scene: start holding by the time the scene's top is near the top.
    if (!lane && scene && track.kind === "page" && act !== "basket" && act !== "peekaboo") {
      const h = safe.bottom - safe.top;
      const sceneIn = scene.getBoundingClientRect().top + scrollY - safe.top + 0.08 * h;
      const toesIn = track.top + stop.box[3] * stop.s - safe.bottom;
      if (range[1] > sceneIn) {
        const end = Math.max(sceneIn, toesIn + 0.12 * h);
        range = [Math.max(toesIn, end - Math.max(range[1] - range[0], 0.2 * h)), end];
      }
    }
    ranges.push(range);
  };

  const all = [...document.querySelectorAll<HTMLElement>("[data-pup-stop]")].filter((el) => el.getClientRects().length);
  if (lane) {
    // Phones: the hero and the basket, and in between a small Teddy peeking up from the bottom
    // edge, alternating sides, once per scene.
    const laneStops = all.filter((el) => el.dataset.lane === "true");
    const first = laneStops[0];
    const last = laneStops.length > 1 ? laneStops[laneStops.length - 1] : undefined;
    if (first) add(first);
    const firstScene = meta[0]?.scene ?? null;
    const scenes = [...document.querySelectorAll<HTMLElement>("#main [data-pup-scene]")].filter(
      (sc) => sc !== firstScene && sc.getClientRects().length,
    );
    const s = Math.min(0.62, Math.max(0.5, width / 650));
    const box = boxOf("peek");
    scenes.forEach((scene, i) => {
      const left = i % 2 === 0;
      stops.push({
        x: left ? safe.left + 2 - box[0] * s : safe.right - 2 - box[2] * s,
        track: { kind: "screen", top: 0 },
        s,
        behind: false,
        sink: SINK,
        box,
      });
      meta.push({ scene, pose: "peek", facing: left ? 1 : -1, act: "lane", looks: [], treadmill: null });
      const r = scene.getBoundingClientRect();
      const from = r.top + scrollY - 0.42 * vh;
      const to = r.bottom + scrollY - 0.58 * vh;
      ranges.push(from <= to ? [from, to] : [(from + to) / 2, (from + to) / 2]);
    });
    if (last) add(last);
  } else all.forEach(add);

  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const gaps = stops.slice(1).map((next, k) => {
    const prev = stops[k];
    const dx = Math.abs(next.x + FOOT.x * next.s - (prev.x + FOOT.x * prev.s));
    return Math.min(1.4 * vh, Math.max((lane ? 0.32 : 0.5) * vh, 1.15 * Math.hypot(dx, (BAND[1] - BAND[0]) * vh)));
  });
  const main = document.getElementById("main");
  return {
    lane,
    stops,
    meta,
    holds: settleHolds(ranges, gaps, maxScroll),
    blend: 0.12 * vh,
    mainTop: main ? main.getBoundingClientRect().top + scrollY : 0,
  };
}

/** The safe area right now (the header above, the phone bar below). */
function safeArea(stage: Stage): Safe {
  const width = document.documentElement.clientWidth;
  const top = headerHeight() + 10;
  if (stage.lane) return { left: 10, top, right: width - 10, bottom: barTop() + 40 };
  const r = bar();
  return { left: 10, top, right: width - 10, bottom: Math.min(innerHeight, r ? r.top : innerHeight) - 10 };
}

/** Where Teddy is (feet, viewport px), how big, and how far along his walk, at a scroll position. */
export function place(stage: Stage, scroll: number): Placement {
  if (stage.lane) {
    const top = barTop();
    for (const stop of stage.stops) if (stop.track.kind === "screen") stop.track.top = top - PEEK_FOOT.y * stop.s;
  }
  const safe = safeArea(stage);
  const { stops, holds } = stage;
  const { k, t } = segment(holds, scroll);
  if (t <= 0 || k >= stops.length - 1) {
    const stop = stops[k];
    const at = feet(stop, scroll);
    const p = keepInside(at.x, at.y, stop.s, stop.box, safe);
    return { x: p.x, y: p.y, s: stop.s, front: !stop.behind, airborne: false, k, t: 0, walked: 0 };
  }

  const a = stops[k];
  const b = stops[k + 1];
  const leave = holds[k][1];
  const arrive = holds[k + 1][0];
  const span = Math.max(1, arrive - leave);
  const v = clamp01((scroll - leave) / span);
  const start = feet(a, leave);
  const end = feet(b, arrive);
  const curve = path({ x: start.x, y: start.y - a.sink * a.s }, { x: end.x, y: end.y - b.sink * b.s }, safe);
  const w = v * v * v * (v * (6 * v - 15) + 10);
  const p = bezier(curve.p0, curve.c1, curve.c2, curve.p1, w);
  const s = lerp(a.s, b.s, smooth(clamp01(v / 0.65)));
  // Near each end, follow that stop as the page scrolls.
  const edge = Math.min(0.3, Math.max(0.06, stage.blend / span));
  let y = p.y + (1 - ramp(0, edge, v)) * (feet(a, scroll).y - start.y) + ramp(1 - edge, 1, v) * (feet(b, scroll).y - end.y);
  y += a.sink * a.s * (1 - ramp(0, 0.22, v)) + b.sink * b.s * ramp(0.78, 1, v);
  let airborne = false;
  // Hop out of (and into) stops he hides behind.
  if (a.behind && v < 0.36) {
    y -= Math.sin((v / 0.36) * Math.PI) * Math.min(64 * a.s, 72);
    airborne = v < 0.32;
  }
  if (b.behind && v > 0.68) {
    y -= Math.sin(((v - 0.68) / 0.32) * Math.PI) * Math.min(56 * b.s, 60);
    airborne = true;
  }
  if (a.sink && v < 0.2) airborne = true;
  const front = !((a.behind && v < 0.12) || (b.behind && v > 0.92));
  const box =
    v < 0.5
      ? lerpBox(a.box, ANY_BOX, ramp(0, a.sink ? 0.22 : a.behind ? 0.36 : 0.06, v))
      : lerpBox(ANY_BOX, b.box, ramp(b.sink ? 0.78 : b.behind ? 0.68 : 0.94, 1, v));
  const q = keepInside(p.x, y, s, box, safe);
  return { x: q.x, y: q.y, s, front, airborne, k, t: v, walked: arcLength(curve, w) };
}

/** The walk between two stops: an S-curve, bowed out sideways when the stops are nearly stacked. */
function path(p0: Point, p1: Point, safe: Safe) {
  const dx = p1.x - p0.x;
  const width = safe.right - safe.left;
  const reach = 0.45 * Math.abs(dx);
  const dir = dx >= 0 ? 1 : -1;
  let c1 = { x: p0.x + dir * reach, y: p0.y };
  let c2 = { x: p1.x - dir * reach, y: p1.y };
  const min = 0.14 * width;
  if (Math.abs(dx) < min) {
    const side = ((p0.x + p1.x) / 2 < (safe.left + safe.right) / 2 ? 1 : -1) * (min - Math.abs(dx)) * 0.9;
    c1 = { x: c1.x + side, y: lerp(p0.y, p1.y, 0.2) };
    c2 = { x: c2.x + side, y: lerp(p0.y, p1.y, 0.8) };
  }
  const inside = (p: Point) => ({ x: Math.min(safe.right, Math.max(safe.left, p.x)), y: Math.min(safe.bottom, Math.max(safe.top, p.y)) });
  return { p0, c1: inside(c1), c2: inside(c2), p1 };
}

function arcLength(c: ReturnType<typeof path>, upTo: number) {
  let length = 0;
  let prev = c.p0;
  const n = Math.max(1, Math.ceil(32 * clamp01(upTo)));
  for (let i = 1; i <= n; i++) {
    const p = bezier(c.p0, c.c1, c.c2, c.p1, (i / n) * clamp01(upTo));
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return length;
}

/**
 * Once scrolling stops, never leave Teddy frozen mid-hop: if the scroll rests in the hop out of (or
 * into) a stop, treat it as the nearer end of that hop.
 */
export function restingScroll(stage: Stage, scroll: number) {
  const { k, t } = segment(stage.holds, scroll);
  if (t <= 0 || k >= stage.stops.length - 1) return scroll;
  const a = stage.stops[k];
  const b = stage.stops[k + 1];
  const out = a.sink ? 0.22 : a.behind ? 0.36 : 0;
  const into = b.sink ? 0.78 : b.behind ? 0.68 : 1;
  let rest = t;
  if (t < out) rest = t < out / 2 ? 0 : out;
  else if (t > into) rest = t > (1 + into) / 2 ? 1 : into;
  return rest === t ? scroll : stage.holds[k][1] + rest * (stage.holds[k + 1][0] - stage.holds[k][1]);
}
