// Teddy brought to life: one Puppet drives a rendered <Teddy> SVG by rewriting its `data-p` parts
// every frame. Poses blend, facing turns, ears and bounces are little springs, and the eyes blink
// and follow a point. Used by the pup actor on the homepage and by every live buddy.
import { EYE_Y, frame, PIVOT, POSES, RIG_H, RIG_W, STILL, type Motion, type Pose, type PoseName } from "@/components/art/teddy/rig";

/** [part, attribute, frame key]: everything a frame writes into the SVG. */
const WRITES = [
  ["root", "transform", "root"],
  ["shadow", "transform", "shadow"],
  ["shadow", "opacity", "shadowOpacity"],
  ["body", "transform", "body"],
  ["body", "opacity", "side"],
  ["bf", "transform", "bf"],
  ["bf", "opacity", "backLegs"],
  ["bn", "transform", "bn"],
  ["bn", "opacity", "backLegs"],
  ["ff", "transform", "ff"],
  ["fn", "transform", "fn"],
  ["tail", "transform", "tail"],
  ["haunch", "transform", "haunch"],
  ["haunch", "opacity", "haunchOpacity"],
  ["head", "transform", "head"],
  ["earL", "transform", "earL"],
  ["earR", "transform", "earR"],
  ["eyes", "transform", "eyes"],
  ["open", "opacity", "openEyes"],
  ["blink", "transform", "blink"],
  ["happy", "opacity", "happyEyes"],
  ["shut", "opacity", "shutEyes"],
  ["tongue", "opacity", "tongue"],
  ["mouth", "opacity", "mouth"],
  ["ledge", "opacity", "ledge"],
] as const;

/** Fraction of the way to a target after dt seconds, for a time constant tau. */
const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);
const clamp = (n: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, n));

function blend(a: Pose, b: Pose, k: number): Pose {
  const out = { ...a };
  for (const key of Object.keys(b) as (keyof Pose)[]) out[key] = a[key] + (b[key] - a[key]) * k;
  return out;
}

export type Facing = 1 | -1;
export type PoseInput = PoseName | Pose;
/** Distance along the ground (in rig units) for half a stride. */
const STEP = 46;

export class Puppet {
  facingTarget: Facing;
  private els = new Map<string, Element>();
  private written = new Map<string, string>();
  private pose: Pose;
  private target: Pose;
  private m: Motion = { ...STILL };
  private facing: number;
  private turn = 0.07;
  private strideTarget = 0;
  private wagTarget = 0.35;
  private gazeTarget = { x: 0, y: 0 };
  private tilt = 0;
  private tiltTarget = 0;
  private earV = 0;
  private nextBlink = 1.2;
  private blinkAt = -1;
  private woofUntil = 0;
  private bounce = 0;
  private bounceV = 0;
  private offset = 0;
  private offsetTarget = 0;
  private pet = 0;
  private petTarget = 0;

  constructor(
    private svg: SVGSVGElement,
    pose: PoseName = "sit",
    facing: Facing = 1,
  ) {
    svg.querySelectorAll<SVGElement>("[data-p]").forEach((el) => this.els.set(el.dataset.p!, el));
    this.pose = { ...POSES[pose] };
    this.target = this.pose;
    this.facing = facing;
    this.facingTarget = facing;
  }

  get facingDir() {
    return this.facingTarget;
  }
  setPose(p: PoseInput) {
    this.target = typeof p === "string" ? POSES[p] : p;
  }
  face(dir: Facing, turn = 0.07) {
    this.facingTarget = dir;
    this.turn = turn;
  }
  stride(n: number) {
    this.strideTarget = clamp(n, 0, 1);
  }
  /** Sets the walk cycle from the distance walked (rig units). */
  walkedTo(distance: number) {
    this.m.phase = (distance / STEP) * Math.PI;
  }
  wag(n: number) {
    this.wagTarget = clamp(n, 0, 1);
  }
  cock(deg: number) {
    this.tiltTarget = deg;
  }
  /** Turns the eyes (and a little of the head) towards a viewport point, or back to centre. */
  lookAt(point: { x: number; y: number } | null) {
    if (!point) {
      this.gazeTarget = { x: 0, y: 0 };
      return;
    }
    const r = this.svg.getBoundingClientRect();
    const eyeX = this.facingTarget > 0 ? PIVOT.head[0] : RIG_W - PIVOT.head[0];
    const dx = point.x - (r.left + (eyeX / RIG_W) * r.width);
    const dy = point.y - (r.top + (EYE_Y / RIG_H) * r.height);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 160);
    this.gazeTarget = { x: (dx / d) * k * this.facingTarget, y: (dy / d) * k };
  }
  woof(now: number) {
    this.woofUntil = now + 0.34;
    this.bounceV = -150;
    this.earV += 260;
  }
  jolt(n = 1) {
    this.earV += 220 * n;
  }
  hop(n = 1) {
    this.bounceV = -230 * n;
    this.earV += 200 * n;
  }
  yawn(now: number, secs = 0.9) {
    this.woofUntil = now + secs;
  }
  /** Scoots sideways (zoomies), walking the legs as it goes. */
  dash(px: number) {
    this.offsetTarget = px;
  }
  petting(on: boolean) {
    this.petTarget = on ? 1 : 0;
  }
  reset() {
    this.offsetTarget = 0;
    this.tiltTarget = 0;
    this.petTarget = 0;
  }

  /** Advances every spring by dt seconds (now = seconds) and writes the changed parts. */
  tick(dt: number, now: number) {
    dt = Math.min(dt, 0.05);
    const m = this.m;
    m.time = now;
    this.pose = blend(this.pose, this.target, ease(dt, 0.16));
    this.facing += (this.facingTarget - this.facing) * ease(dt, this.turn);
    m.stride += (this.strideTarget - m.stride) * ease(dt, 0.12);
    if (m.stride < 0.012 && this.strideTarget === 0) m.stride = 0;
    m.wag += (this.wagTarget - m.wag) * ease(dt, 0.4);
    m.gazeX += (this.gazeTarget.x - m.gazeX) * ease(dt, 0.07);
    m.gazeY += (this.gazeTarget.y - m.gazeY) * ease(dt, 0.07);
    this.tilt += (this.tiltTarget + 3 * m.gazeX - this.tilt) * ease(dt, 0.18);
    this.earV += (-150 * m.ear - 10 * this.earV) * dt;
    m.ear = clamp(m.ear + this.earV * dt, -28, 28);
    this.bounceV += (-260 * this.bounce - 16 * this.bounceV) * dt;
    this.bounce += this.bounceV * dt;

    const was = this.offset;
    this.offset += (this.offsetTarget - this.offset) * ease(dt, 0.2);
    if (Math.abs(this.offsetTarget - this.offset) < 0.05) this.offset = this.offsetTarget;
    const moved = Math.abs(this.offset - was);
    if (moved) m.phase += (moved / STEP) * Math.PI;
    const dashing = dt > 0 ? Math.min(1, moved / dt / 180) : 0;
    this.pet += (this.petTarget - this.pet) * ease(dt, 0.15);

    if (now > this.nextBlink && this.pose.eyes > 0.6) {
      this.blinkAt = now;
      this.nextBlink = now + 2.2 + 3.8 * Math.random();
      if (Math.random() < 0.18) this.nextBlink = now + 0.32; // a double blink
    }
    const b = (now - this.blinkAt) / 0.15;
    m.blink = b >= 0 && b <= 1 ? Math.sin(b * Math.PI) : 0;

    const pose: Pose = {
      ...this.pose,
      headRot: this.pose.headRot + this.tilt,
      bodyY: this.pose.bodyY + this.bounce,
      headY: this.pose.headY + 1.15 * this.bounce,
      mouth: now < this.woofUntil ? 1 : this.pose.mouth,
      happy: Math.max(this.pose.happy, this.pet),
    };
    const f: Record<string, string | number> = frame(pose, dashing > m.stride ? { ...m, stride: dashing } : m);
    const sx = Math.abs(this.facing) < 0.02 ? 0.02 * Math.sign(this.facing || 1) : this.facing;
    f.root = `translate(${this.offset.toFixed(1)} 0) translate(${RIG_W / 2} 0) scale(${sx.toFixed(3)} 1) translate(${-RIG_W / 2} 0)`;
    for (const [part, attr, key] of WRITES) {
      const el = this.els.get(part);
      if (!el) continue;
      const value = String(f[key]);
      const id = `${part}:${attr}`;
      if (this.written.get(id) === value) continue;
      el.setAttribute(attr, value);
      this.written.set(id, value);
    }
  }
}
