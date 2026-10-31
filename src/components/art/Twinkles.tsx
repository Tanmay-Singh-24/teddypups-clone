// A field of four-pointed stars that twinkle in turn.
const STAR = "M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z";

/** [left %, top %, size multiplier] */
export type Star = readonly [left: number, top: number, scale: number];

type TwinklesProps = {
  stars: readonly Star[];
  /** Base star width in px, multiplied per star. */
  size: number;
  className?: string;
};

export function Twinkles({ stars, size, className = "pointer-events-none absolute inset-0" }: TwinklesProps) {
  return (
    <div aria-hidden="true" className={className}>
      {stars.map(([left, top, scale], i) => (
        <svg
          key={i}
          viewBox="0 0 40 40"
          className="tp-twinkle absolute text-honey"
          style={{ left: `${left}%`, top: `${top}%`, width: `${size * scale}px`, animationDelay: `${(i * 0.4).toFixed(2)}s` }}
          aria-hidden="true"
        >
          <path d={STAR} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
