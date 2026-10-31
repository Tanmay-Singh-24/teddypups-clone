import type { CSSProperties } from "react";
import {
  BLUSH,
  COLLAR,
  CREAM,
  EYE_Y,
  FUR,
  FUR_DEEP,
  INK,
  MOUTH,
  PIVOT,
  POSES,
  RIG_H,
  RIG_W,
  SHAPE,
  TONGUE,
  frame,
  legLength,
  toes,
  type PoseName,
} from "./rig";

export type Facing = "left" | "right";

type TeddyProps = {
  pose?: PoseName;
  facing?: Facing;
  /** Accessible name; without one the drawing is hidden from assistive tech. */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

const line = { stroke: INK, strokeWidth: 3.4, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const outline = { ...line, fill: "none" } as const;

type LegProps = { part: string; d: string; length: number; fill: string; transform: string; opacity?: number };

function Leg({ part, d, length, fill, transform, opacity }: LegProps) {
  return (
    <g data-p={part} transform={transform} opacity={opacity}>
      <path d={`${d}Z`} fill={fill} />
      <path d={d} {...outline} />
      <path d={toes(length)} {...outline} strokeWidth={2.4} />
    </g>
  );
}

function Eyes() {
  return (
    <>
      <ellipse cx={194} cy={EYE_Y} rx={7.4} ry={8.6} fill={INK} />
      <ellipse cx={230} cy={EYE_Y} rx={7.4} ry={8.6} fill={INK} />
      <circle cx={196.6} cy={EYE_Y - 3.4} r={2.7} fill="#fff" />
      <circle cx={232.6} cy={EYE_Y - 3.4} r={2.7} fill="#fff" />
      <circle cx={192} cy={EYE_Y + 3.2} r={1.2} fill="#fff" />
      <circle cx={228} cy={EYE_Y + 3.2} r={1.2} fill="#fff" />
    </>
  );
}

/** The mascot drawn in one pose. Every part carries `data-p` so animations can address it. */
export function Teddy({ pose = "sit", facing = "right", label, className, style }: TeddyProps) {
  const f = frame(POSES[pose]);
  return (
    <svg
      viewBox={`0 0 ${RIG_W} ${RIG_H}`}
      className={className}
      style={{ overflow: "visible", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <g data-p="root" transform={facing === "left" ? `translate(${RIG_W} 0) scale(-1 1)` : undefined}>
        <ellipse
          data-p="shadow"
          {...SHAPE.shadow}
          fill={INK}
          opacity={f.shadowOpacity}
          transform={f.shadow}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <g data-p="body" transform={f.body} opacity={f.side}>
          <Leg part="bf" d={SHAPE.legBackFar} length={legLength(PIVOT.hipFar)} fill={FUR_DEEP} transform={f.bf} opacity={f.backLegs} />
          <Leg part="ff" d={SHAPE.legFrontFar} length={legLength(PIVOT.shoulderFar)} fill={FUR_DEEP} transform={f.ff} />
          <g data-p="tail" transform={f.tail}>
            <path d={SHAPE.tailStem} {...outline} strokeWidth={9} />
            <path d={SHAPE.tailStem} stroke={FUR} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d={SHAPE.tail} fill={FUR} {...line} />
          </g>
          <Leg part="bn" d={SHAPE.legBackNear} length={legLength(PIVOT.hipNear)} fill={FUR} transform={f.bn} opacity={f.backLegs} />
          <path d={SHAPE.body} fill={FUR} {...line} />
          <path d={SHAPE.chest} fill={FUR} {...line} />
          <Leg part="fn" d={SHAPE.legFrontNear} length={legLength(PIVOT.shoulderNear)} fill={FUR} transform={f.fn} />
        </g>
        <g data-p="haunch" opacity={f.haunchOpacity} transform={f.haunch}>
          <path d={SHAPE.haunch} fill={FUR} {...line} />
          <path d={SHAPE.haunchPaw} fill={FUR} {...line} />
          <path d={SHAPE.haunchToes} {...outline} strokeWidth={2.4} />
        </g>
        <g data-p="head" transform={f.head}>
          <path d={SHAPE.collar} fill={COLLAR} {...line} strokeWidth={3} />
          <path d={SHAPE.tag} fill={CREAM} {...line} strokeWidth={2.4} />
          <path data-p="earL" d={SHAPE.earL} fill={FUR_DEEP} {...line} transform={f.earL} />
          <path data-p="earR" d={SHAPE.earR} fill={FUR_DEEP} {...line} transform={f.earR} />
          <path d={SHAPE.head} fill={FUR} {...line} />
          <path d={SHAPE.topknot} fill={FUR} {...line} strokeWidth={3} />
          <path d={SHAPE.muzzle} fill={CREAM} />
          <circle cx={181} cy={116} r={7} fill={BLUSH} opacity={0.85} />
          <circle cx={243} cy={116} r={7} fill={BLUSH} opacity={0.85} />
          <g data-p="eyes" transform={f.eyes}>
            <g data-p="open" opacity={f.openEyes}>
              <g data-p="blink" transform={f.blink}>
                <Eyes />
              </g>
            </g>
          </g>
          <path data-p="happy" d={SHAPE.eyesHappy} {...outline} opacity={f.happyEyes} />
          <path data-p="shut" d={SHAPE.eyesShut} {...outline} opacity={f.shutEyes} />
          <path d={SHAPE.nose} fill={INK} />
          <path d={SHAPE.mouth} {...outline} strokeWidth={3} />
          <path data-p="tongue" d={SHAPE.tongue} fill={TONGUE} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" opacity={f.tongue} />
          <g data-p="mouth" opacity={f.mouth}>
            <path d={SHAPE.mouthOpen} fill={MOUTH} {...line} strokeWidth={2.6} />
            <path d={SHAPE.mouthTongue} fill={TONGUE} />
          </g>
        </g>
        <g data-p="ledge" opacity={f.ledge}>
          <path d={SHAPE.ledgePaws} fill={FUR} {...line} />
          <path d={SHAPE.ledgeToes} {...outline} strokeWidth={2.4} />
        </g>
      </g>
    </svg>
  );
}
