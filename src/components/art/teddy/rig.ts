// Teddy, the mascot: one 300×240 rig whose parts are posed by a handful of numbers.
// The geometry and the pose values reproduce the reference's buddies exactly
// (compare with docs/reference/svg/pup-buddy--*.svg). The static <Teddy> renders a
// single frame; the pup actor (P6b) will animate the same frame() over time.

export const RIG_W = 300;
export const RIG_H = 240;

export const INK = "#2a170e";
export const FUR = "#f2be6b";
/** Ears and the far legs, a shade deeper so they read as further away. */
export const FUR_DEEP = "#e4a352";
/** Muzzle and collar tag. */
export const CREAM = "#fbe3b4";
export const COLLAR = "#a24a1a";
export const BLUSH = "#f9b9a6";
export const TONGUE = "#e98c8c";
export const MOUTH = "#6b2a1c";
export const EYE_Y = 98;
const GROUND_Y = 228;

type Point = readonly [number, number];

export const PIVOT = {
  body: [196, 206],
  head: [212, 100],
  shoulderNear: [186, 194],
  shoulderFar: [168, 192],
  hipNear: [110, 194],
  hipFar: [94, 192],
  tailBase: [84, 150],
  earL: [174, 82],
  earR: [250, 82],
} as const satisfies Record<string, Point>;

/** A scalloped, fluffy ellipse: `lobes` quadratic bumps around (cx, cy), rotated by `rotDeg`. */
function fluff(cx: number, cy: number, rx: number, ry: number, lobes: number, bump: number, start = -Math.PI / 2, rotDeg = 0) {
  const rot = (rotDeg * Math.PI) / 180;
  const at = (angle: number, out: number) => {
    const x = Math.cos(angle) * (rx + out);
    const y = Math.sin(angle) * (ry + (ry / rx) * out);
    return `${(cx + x * Math.cos(rot) - y * Math.sin(rot)).toFixed(1)} ${(cy + x * Math.sin(rot) + y * Math.cos(rot)).toFixed(1)}`;
  };
  let d = "";
  for (let i = 0; i < lobes; i++) {
    const from = start + (i / lobes) * Math.PI * 2;
    const to = start + ((i + 1) / lobes) * Math.PI * 2;
    d += `${i === 0 ? `M${at(from, 0)}` : ""}Q${at((from + to) / 2, 2.1 * bump)} ${at(to, 0)}`;
  }
  return `${d}Z`;
}

/** An open leg outline hanging from its pivot: `width` across the top, a rounded paw `length` below. */
function leg(width: number, length: number) {
  const h = width / 2;
  return `M${-h} -14 C${-h} 4 -12 ${length - 18} -12 ${length - 9} C-12 ${length - 2} -7 ${length} 0 ${length} C9 ${length} 13 ${length - 3} 13 ${length - 9} C13 ${length - 18} ${h} 4 ${h} -14`;
}

/** Two toe lines at the bottom of a paw. */
export const toes = (length: number) => `M-3.5 ${length - 7} v5 M4.5 ${length - 7} v5`;

/** Leg length from a hip or shoulder pivot down to the ground line. */
export const legLength = (pivot: Point) => GROUND_Y - pivot[1];

export const SHAPE = {
  body: fluff(140, 170, 64, 36, 15, 3.4, 0.95 * Math.PI),
  chest: fluff(192, 166, 30, 32, 9, 3.2, 0.6 * Math.PI),
  tail: fluff(70, 126, 17, 16, 9, 3.2),
  tailStem: "M86 152 C80 146 76 140 74 136",
  haunch: fluff(110, 204, 30, 24, 10, 3.2, Math.PI),
  haunchPaw: "M112 214 C126 212 142 214 146 221 C148 226 144 229 136 229 L116 229 C108 229 104 224 106 219 Z",
  haunchToes: "M132 222v5M139 222v5",
  head: fluff(212, 100, 51, 46, 16, 3.6),
  topknot: fluff(212, 52, 17, 12, 8, 2.9, Math.PI),
  earL: fluff(170, 112, 19, 34, 10, 3.2, -Math.PI / 2, 12),
  earR: fluff(254, 112, 19, 34, 10, 3.2, -Math.PI / 2, -12),
  muzzle: "M188 120 C188 106 200 100 212 100 C224 100 236 106 236 120 C236 133 225 140 212 140 C199 140 188 133 188 120 Z",
  nose: "M204.5 111.5 Q212 107.2 219.5 111.5 Q218.2 118.4 212 120 Q205.8 118.4 204.5 111.5 Z",
  mouth: "M212 120 V124.5 M212 124.5 Q207.2 129.6 202.8 125.2 M212 124.5 Q216.8 129.6 221.2 125.2",
  mouthOpen: "M203 126 Q212 122 221 126 Q219 138 212 139 Q205 138 203 126 Z",
  mouthTongue: "M206.5 133.5 Q212 130 217.5 133.5 Q215 138 212 138 Q209 138 206.5 133.5 Z",
  tongue: "M207.6 127.4 Q212 136.6 216.4 127.4 Z",
  collar: "M178 146 Q212 162 246 146 L246 154 Q212 170 178 154 Z",
  tag: "M212 160 C212 156 206 155 206 159.4 C206 163 212 166.6 212 168.4 C212 166.6 218 163 218 159.4 C218 155 212 156 212 160 Z",
  eyesHappy: "M186.5 101 Q194 91.5 201.5 101 M222.5 101 Q230 91.5 237.5 101",
  eyesShut: "M186.5 97 Q194 103.5 201.5 97 M222.5 97 Q230 103.5 237.5 97",
  /** Front paws resting on a ledge, for the peek and snug poses. */
  ledgePaws: "M175 159 C175 148 181 142 190 142 C199 142 205 148 205 159 Z M219 159 C219 148 225 142 234 142 C243 142 249 148 249 159 Z",
  ledgeToes: "M186 153 v-4.5 M194 153 v-4.5 M230 153 v-4.5 M238 153 v-4.5",
  legFrontNear: leg(24, legLength(PIVOT.shoulderNear)),
  legFrontFar: leg(22, legLength(PIVOT.shoulderFar)),
  legBackNear: leg(30, legLength(PIVOT.hipNear)),
  legBackFar: leg(28, legLength(PIVOT.hipFar)),
  shadow: { cx: 150, cy: 230, rx: 92, ry: 7 },
};

/**
 * A pose, in degrees and rig units. `sit` swaps the back legs for the haunch, `front` swaps the
 * whole side view for a head peeking over a ledge, and `eyes`/`happy`/`tongue`/`mouth` are 0..1 mixes.
 */
export type Pose = {
  bodyRot: number;
  bodyX: number;
  bodyY: number;
  stretch: number;
  headX: number;
  headY: number;
  headRot: number;
  earL: number;
  earR: number;
  tail: number;
  fn: number;
  ff: number;
  bn: number;
  bf: number;
  sit: number;
  eyes: number;
  happy: number;
  tongue: number;
  mouth: number;
  front: number;
};

const STAND: Pose = {
  bodyRot: 0,
  bodyX: 0,
  bodyY: 0,
  stretch: 1,
  headX: 0,
  headY: 0,
  headRot: 0,
  earL: 0,
  earR: 0,
  tail: 0,
  fn: 0,
  ff: 0,
  bn: 0,
  bf: 0,
  sit: 0,
  eyes: 1,
  happy: 0,
  tongue: 0,
  mouth: 0,
  front: 0,
};

const LYING = { bodyRot: -5, bodyY: 22, fn: -84, ff: -80, sit: 1 };

export const POSES = {
  stand: STAND,
  walk: { ...STAND, tail: -6, tongue: 1 },
  sit: { ...STAND, bodyRot: -24, bodyY: -2, headX: -10, headY: -6, tail: 34, sit: 1, tongue: 1 },
  peek: { ...STAND, headY: 4, earL: -6, earR: 6, tail: -20, front: 1, tongue: 1 },
  snug: { ...STAND, headY: 9, headRot: 4, earL: 3, earR: -3, tail: -20, front: 1 },
  lie: { ...STAND, ...LYING, headX: 12, headY: 40, headRot: 3, tail: 58 },
  sleep: { ...STAND, ...LYING, headX: 14, headY: 44, headRot: -8, tail: 64, eyes: 0, earL: 4, earR: -4 },
  settle: { ...STAND, ...LYING, headX: 10, headY: 16, tail: 40, tongue: 1 },
  hop: { ...STAND, bodyRot: -9, stretch: 1.06, headY: -6, fn: -42, ff: -32, bn: 40, bf: 30, earL: -26, earR: 26, tail: -24, tongue: 1 },
  sniff: { ...STAND, bodyRot: 7, headX: 16, headY: 32, headRot: 9, tail: -14, fn: 6, ff: 4 },
  bow: { ...STAND, bodyRot: 15, bodyY: 2, headX: 14, headY: 30, fn: -58, ff: -52, tail: -32, happy: 1, tongue: 1 },
  beg: { ...STAND, bodyRot: -36, bodyY: -6, headX: -18, headY: -18, sit: 1, fn: -70, ff: -64, tail: 30, happy: 1, tongue: 1 },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

/** What changes from moment to moment on top of a pose: walk cycle, wag, gaze, blink, ear flick. */
export type Motion = {
  /** Walk-cycle angle in radians. */
  phase: number;
  /** 0 standing still … 1 full trot. */
  stride: number;
  /** Seconds, drives breathing and the wag. */
  time: number;
  wag: number;
  gazeX: number;
  gazeY: number;
  blink: number;
  ear: number;
};

export const STILL: Motion = { phase: 0, stride: 0, time: 0, wag: 0, gazeX: 0, gazeY: 0, blink: 0, ear: 0 };

const r2 = (n: number) => Math.round(n * 100) / 100;
const rotate = (deg: number, [x, y]: Point) => `rotate(${r2(deg)} ${x} ${y})`;
const place = ([x, y]: Point, deg: number) => `translate(${x} ${y}) rotate(${r2(deg)})`;

/** Resolves a pose (plus motion) into the transform and opacity of every named part. */
export function frame(p: Pose, m: Motion = STILL) {
  const moving = m.stride > 0.01 ? 1 : 0;
  const swing = Math.sin(m.phase);
  const counter = Math.sin(m.phase + Math.PI);
  const reach = (20 + 10 * m.stride) * moving;
  const bob = (1 - Math.cos(2 * m.phase)) / 2;
  const breath = Math.sin(2.4 * m.time) * (1 - moving);
  const bodyY = p.bodyY - bob * (2.5 + 4 * m.stride) * moving + 0.6 * breath;
  const bodyRot = p.bodyRot + 1.6 * swing * moving;
  // Front legs counter-rotate so they stay upright when the body tilts.
  const upright = -p.bodyRot;
  const wagSwing = 5 + 17 * m.wag;
  const wagHz = 1.2 + 2.6 * m.wag;
  const tail = p.tail + Math.sin(m.time * wagHz * Math.PI * 2) * wagSwing;
  const nod = (-(1 - Math.cos(2 * m.phase - 0.7)) / 2) * (2 + 3 * m.stride) * moving + 0.9 * breath;
  const earFlop = 4 * Math.sin(2 * m.phase) * moving;
  const [bx] = PIVOT.body;

  return {
    body: `translate(${r2(p.bodyX)} ${r2(bodyY)}) ${rotate(bodyRot, PIVOT.body)} translate(${bx} 0) scale(${r2(p.stretch)} 1) translate(${-bx} 0)`,
    fn: place(PIVOT.shoulderNear, p.fn + upright + swing * reach),
    ff: place(PIVOT.shoulderFar, p.ff + upright + counter * reach),
    bn: place(PIVOT.hipNear, p.bn + counter * reach),
    bf: place(PIVOT.hipFar, p.bf + swing * reach),
    tail: rotate(tail, PIVOT.tailBase),
    haunch: `translate(0 ${r2(-(0.06 * p.bodyRot))})`,
    head: `translate(${r2(p.headX)} ${r2(p.headY + nod)}) ${rotate(p.headRot + 1.4 * swing * moving, PIVOT.head)}`,
    earL: rotate(p.earL + m.ear + earFlop, PIVOT.earL),
    earR: rotate(p.earR - m.ear - earFlop, PIVOT.earR),
    eyes: `translate(${r2(3.4 * m.gazeX)} ${r2(2.6 * m.gazeY)})`,
    blink: `translate(0 ${r2(EYE_Y * m.blink * 0.92)}) scale(1 ${r2(1 - 0.92 * m.blink)})`,
    openEyes: r2(Math.max(0, p.eyes - p.happy)),
    happyEyes: r2(Math.min(p.happy, p.eyes)),
    shutEyes: r2(1 - p.eyes),
    tongue: r2(p.tongue * (1 - p.mouth)),
    mouth: r2(p.mouth),
    backLegs: r2(1 - p.sit),
    haunchOpacity: r2(p.sit * (1 - p.front)),
    side: r2(1 - p.front),
    ledge: r2(p.front),
    shadow: `translate(${r2(0.6 * p.bodyX)} 0) scale(${r2(1 - 0.05 * bob * moving)} 1)`,
    shadowOpacity: r2(0.12 * (1 - p.front)),
  };
}

export type Frame = ReturnType<typeof frame>;
