import { BLUSH, COLLAR, CREAM, FUR, FUR_DEEP, INK, legLength, PIVOT, RIG_H, RIG_W, SHAPE, toes, TONGUE } from "./rig";

const line = { stroke: INK, strokeWidth: 3.4, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const outline = { ...line, fill: "none" } as const;
const GROUND = 228;

type RunnerLegProps = { cls: string; at: readonly [number, number]; d: string; fill: string };

/** A leg hung from its pivot; the curtain CSS swings it (transform-box: view-box). */
function RunnerLeg({ cls, at, d, fill }: RunnerLegProps) {
  return (
    <g className={`tp-runner__leg ${cls}`} style={{ transformOrigin: `${at[0]}px ${at[1]}px` }}>
      <g transform={`translate(${at[0]} ${at[1]})`}>
        <path d={`${d}Z`} fill={fill} />
        <path d={d} {...outline} />
        <path d={toes(legLength(at))} {...outline} strokeWidth={2.4} />
      </g>
    </g>
  );
}

/** Teddy mid-gallop for the page curtain: the same drawing as the rig, animated purely in CSS. */
export function Runner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${RIG_W} ${RIG_H}`}
      className={`tp-runner ${className}`}
      aria-hidden="true"
      focusable="false"
      style={{ overflow: "visible" }}
    >
      <ellipse cx={150} cy={GROUND + 2} rx={86} ry={7} fill={INK} opacity={0.12} className="tp-runner__shadow" />
      <g className="tp-runner__body">
        <RunnerLeg cls="tp-runner__leg--bf" at={PIVOT.hipFar} d={SHAPE.legBackFar} fill={FUR_DEEP} />
        <RunnerLeg cls="tp-runner__leg--ff" at={PIVOT.shoulderFar} d={SHAPE.legFrontFar} fill={FUR_DEEP} />
        <g className="tp-runner__tail" style={{ transformOrigin: `${PIVOT.tailBase[0]}px ${PIVOT.tailBase[1]}px` }}>
          <path d={SHAPE.tailStem} {...outline} strokeWidth={9} />
          <path d={SHAPE.tailStem} stroke={FUR} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={SHAPE.tail} fill={FUR} {...line} />
        </g>
        <RunnerLeg cls="tp-runner__leg--bn" at={PIVOT.hipNear} d={SHAPE.legBackNear} fill={FUR} />
        <path d={SHAPE.body} fill={FUR} {...line} />
        <path d={SHAPE.chest} fill={FUR} {...line} />
        <RunnerLeg cls="tp-runner__leg--fn" at={PIVOT.shoulderNear} d={SHAPE.legFrontNear} fill={FUR} />
        <g className="tp-runner__head">
          <path d={SHAPE.collar} fill={COLLAR} {...line} strokeWidth={3} />
          <path d={SHAPE.tag} fill={CREAM} {...line} strokeWidth={2.4} />
          <path d={SHAPE.earL} fill={FUR_DEEP} {...line} className="tp-runner__ear" style={{ transformOrigin: "174px 82px" }} />
          <path
            d={SHAPE.earR}
            fill={FUR_DEEP}
            {...line}
            className="tp-runner__ear tp-runner__ear--r"
            style={{ transformOrigin: "250px 82px" }}
          />
          <path d={SHAPE.head} fill={FUR} {...line} />
          <path d={SHAPE.topknot} fill={FUR} {...line} strokeWidth={3} />
          <path d={SHAPE.muzzle} fill={CREAM} />
          <circle cx={181} cy={116} r={7} fill={BLUSH} opacity={0.85} />
          <circle cx={243} cy={116} r={7} fill={BLUSH} opacity={0.85} />
          <path d={SHAPE.eyesHappy} {...outline} />
          <path d={SHAPE.nose} fill={INK} />
          <path d={SHAPE.mouth} {...outline} strokeWidth={3} />
          <path d={SHAPE.tongue} fill={TONGUE} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}
