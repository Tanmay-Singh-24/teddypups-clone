// The hand-drawn look of a puppy's sketch card: blob mask, inked outline, a looser retrace stroke, the
// watercolour wash behind it and 2–3 doodles. Everything comes from a PRNG seeded with the slug, so a
// puppy always gets the same drawing (on the server and after a filter re-render) and the path data
// matches the reference's card for card.

type Point = [number, number];

export type DoodleKind = "sparkle" | "heart" | "dashes" | "swirl" | "dots" | "paw";

export type Doodle = { kind: DoodleKind; x: number; y: number; rot: number; size: number; ink: string };

export type Sketch = {
  mask: string;
  outline: string;
  retrace: string;
  wash: { d: string; dx: number; dy: number; color: string };
  tilt: number;
  doodles: Doodle[];
};

const WASHES = ["#f2be6b", "#f9cdbf", "#bfddf5", "#fbe3b4", "#e8c39a"];
const INKS = ["#c2622b", "#a24a1a", "#2a170e", "#d4893f"];
const KINDS: DoodleKind[] = ["sparkle", "heart", "dashes", "swirl", "dots", "paw"];
/** Arcs around the frame (in multiples of π) where doodles may sit: lower right, upper left, right. */
const ARCS: Point[] = [
  [0.86, 1.08],
  [1.16, 1.42],
  [-0.08, 0.16],
];

/** FNV-1a hash of the seed feeding a mulberry32 generator: uniform floats in [0, 1). */
function seededRandom(seed: string) {
  let h = 0x811c9dc5;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 0x1000193);
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

/** Points on a wobbly circle around (50, 50): radius r plus three sine harmonics of amplitude `wobble`. */
function wobblyRing(rand: () => number, r: number, wobble: number, count = 40, start = 0, sweep = 2 * Math.PI) {
  const phase = [6.28 * rand(), 6.28 * rand(), 6.28 * rand()];
  const squash = 1 + (rand() - 0.5) * 0.05;
  const closed = sweep >= 2 * Math.PI;
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const a = start + (i / (closed ? count : count - 1)) * sweep;
    const radius =
      r + wobble * (0.55 * Math.sin(2 * a + phase[0]) + 0.3 * Math.sin(3 * a + phase[1]) + 0.15 * Math.sin(5 * a + phase[2]));
    points.push([50 + Math.cos(a) * radius * squash, 50 + (Math.sin(a) * radius) / squash]);
  }
  return points;
}

const fixed = (n: number) => n.toFixed(2);

/** A smooth Catmull-Rom curve through the points, as cubic Béziers. */
function smoothPath(points: Point[], closed: boolean) {
  const n = points.length;
  const at = (i: number) => points[closed ? (i + n) % n : Math.min(n - 1, Math.max(0, i))];
  let d = `M${fixed(points[0][0])} ${fixed(points[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${fixed(c1[0])} ${fixed(c1[1])} ${fixed(c2[0])} ${fixed(c2[1])} ${fixed(p2[0])} ${fixed(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

export function sketchFor(slug: string): Sketch {
  const rand = seededRandom(slug);
  // The call order below fixes the random stream, so keep it exactly as is.
  const mask = smoothPath(wobblyRing(rand, 45.5, 2.6), true);
  const outline = smoothPath(wobblyRing(rand, 47.8, 3.1), true);
  const start = rand() * Math.PI * 2;
  const sweep = Math.PI * (1.15 + 0.5 * rand());
  const retrace = smoothPath(wobblyRing(rand, 49, 3.4, 30, start, sweep), false);
  const wash = {
    d: smoothPath(wobblyRing(rand, 46.5, 3.6), true),
    dx: (rand() - 0.5) * 9,
    dy: 3 + 4 * rand(),
    color: WASHES[Math.floor(rand() * WASHES.length)],
  };
  const tilt = (rand() - 0.5) * 5;
  const arcs = ARCS.map((arc) => ({ arc, key: rand() }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.arc);
  const count = 2 + Math.floor(2 * rand());
  const used = new Set<DoodleKind>();
  const doodles: Doodle[] = [];
  for (let i = 0; i < count; i++) {
    let kind = KINDS[Math.floor(rand() * KINDS.length)];
    if (used.has(kind)) kind = KINDS.find((k) => !used.has(k))!;
    used.add(kind);
    const [from, to] = arcs[i];
    const angle = Math.PI * (from + rand() * (to - from));
    const distance = 55 + 4 * rand();
    doodles.push({
      kind,
      x: 50 + Math.cos(angle) * distance,
      y: 50 + Math.sin(angle) * distance,
      rot: (rand() - 0.5) * 50,
      size: 0.85 + 0.35 * rand(),
      ink: INKS[Math.floor(rand() * INKS.length)],
    });
  }
  return { mask, outline, retrace, wash, tilt, doodles };
}

/** CSS mask-image for the photo: the blob path as an inline SVG. */
export function maskImage(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
