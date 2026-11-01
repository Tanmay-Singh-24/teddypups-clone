import type { Puppy } from "@/content/types";

/** The Downtown Dubai skyline line art (viewBox 300×120). */
export const SKYLINE =
  "M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28";

/**
 * A plane on a dotted route from Korea to Dubai (viewBox 660×300). With a `passenger`, the puppy
 * looks out of the porthole (homepage); without one it is the empty plane (/how-it-works).
 */
export function Flight({ label, passenger }: { label: string; passenger?: Puppy }) {
  const porthole = passenger && `/_next/image?url=${encodeURIComponent(passenger.cover.url)}&w=128&q=75`;
  return (
    <div className="tp-flight">
      <svg viewBox="0 0 660 300" role="img" aria-label={label}>
        <defs>
          <clipPath id="tp-flight-porthole">
            <circle r="25" />
          </clipPath>
        </defs>
        <path d="M40 250 C 170 40, 470 20, 620 168" className="tp-flight__route" />
        <circle cx="40" cy="250" r="7" className="tp-flight__dot" />
        <circle cx="620" cy="168" r="7" className="tp-flight__dot" />
        <text x="40" y="284" textAnchor="middle" className="tp-flight__label">
          Korea
        </text>
        <text x="620" y="202" textAnchor="middle" className="tp-flight__label">
          Dubai
        </text>
        <g transform="translate(410 70)">
          <g transform="translate(-126 -78)">
            <path d="M28 60 L8 26 L34 26 L60 54 Z" className="tp-flight__wing" />
            <path d="M108 112 L142 156 L172 156 L158 112 Z" className="tp-flight__wing tp-flight__wing--far" />
            <path
              d="M20 80 C20 52 52 44 80 44 L168 44 C200 44 224 60 232 80 C224 100 200 112 168 112 L80 112 C52 112 20 104 20 80 Z"
              className="tp-flight__body"
            />
            <path d="M104 44 L138 2 L168 2 L154 44 Z" className="tp-flight__wing" />
            <path d="M206 64 C215 67 221 73 224 80" className="tp-flight__line" />
          </g>
          {porthole && (
            <g transform="translate(10 2)">
              <image
                href={porthole}
                x="-25"
                y="-25"
                width="50"
                height="50"
                clipPath="url(#tp-flight-porthole)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle r="25" className="tp-flight__porthole" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
