import Link from "next/link";
import type { CSSProperties } from "react";
import { PAW_PATH } from "@/components/art/Paw";
import { Photo } from "@/components/ui/Photo";
import type { PuppyCard, PuppyStatus } from "@/content/types";
import { maskImage, sketchFor, type Doodle } from "@/lib/sketch";

export const SKETCH_SIZES = "(min-width: 1536px) 17rem, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw";

const STATUS: Record<PuppyStatus, string> = { available: "Available", "gone-home": "Gone home" };

function DoodleMark({ d }: { d: Doodle }) {
  const stroke = { fill: "none", stroke: d.ink, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <g transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) rotate(${d.rot.toFixed(0)}) scale(${d.size.toFixed(2)})`}>
      <g className="tp-sketch__doodle">
        {d.kind === "sparkle" && (
          <path d="M0 -6c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6z" fill={d.ink} />
        )}
        {d.kind === "heart" && (
          <path
            d="M0 5C-4.6 1.8-6.4-.8-6.4-3.2c0-1.9 1.5-3.3 3.3-3.3 1.3 0 2.4.7 3.1 1.9.7-1.2 1.8-1.9 3.1-1.9 1.8 0 3.3 1.4 3.3 3.3C6.4-.8 4.6 1.8 0 5z"
            {...stroke}
          />
        )}
        {d.kind === "dashes" && <path d="M-5 -5l4 2M-6 0h5M-5 5l4 -2" {...stroke} />}
        {d.kind === "swirl" && (
          <path d="M0 0c1.6-.6 2.4 1.4.8 2.6-2 1.4-4.6-.4-4-3 .7-3 4.8-3.8 6.8-1.2 2.4 3-0.2 7.4-3.8 7.2" {...stroke} />
        )}
        {d.kind === "dots" && (
          <g fill={d.ink}>
            <circle cx="-4" cy="1" r="1.2" />
            <circle cx="0" cy="-2" r="1.2" />
            <circle cx="4" cy="1" r="1.2" />
          </g>
        )}
        {d.kind === "paw" && (
          <path d={PAW_PATH} transform="scale(.17) translate(-32 -34)" fill={d.ink} opacity={0.85} />
        )}
      </g>
    </g>
  );
}

type SketchCardProps = {
  pup: PuppyCard;
  /** Position in its list; staggers the reveal (`--d`). */
  index?: number;
  sizes?: string;
  preload?: boolean;
  /** The gone-home strip's card: no meta line, a "gone home ♥" sticker instead of the status tag. */
  small?: boolean;
};

/** A puppy drawn into Teddy's sketchbook: wash, blob-masked photo, inked ring, doodles and a status sticker. */
export function SketchCard({ pup, index = 0, sizes = SKETCH_SIZES, preload = false, small = false }: SketchCardProps) {
  const sketch = sketchFor(pup.slug);
  const mask = maskImage(sketch.mask);
  const label =
    `${pup.displayName}${pup.name ? `, ${pup.breed}` : ""}, ${pup.genderLabel.toLowerCase()}` +
    `${pup.age ? `, ${pup.age}` : ""}, ${STATUS[pup.status].toLowerCase()}`;
  return (
    <Link
      href={`/puppies/${pup.slug}`}
      className={`tp-sketch${small ? " tp-sketch--small" : ""}`}
      data-reveal="true"
      style={{ "--tilt": `${sketch.tilt.toFixed(2)}deg`, "--d": `${(index % 8) * 70}ms`, "--wash": sketch.wash.color } as CSSProperties}
      aria-label={label}
    >
      <span className="tp-sketch__frame">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="tp-sketch__wash"
          style={{ translate: `${sketch.wash.dx.toFixed(1)}% ${sketch.wash.dy.toFixed(1)}%` }}
        >
          <path d={sketch.wash.d} />
        </svg>
        <span className="tp-sketch__photo" style={{ maskImage: mask, WebkitMaskImage: mask }}>
          <Photo
            media={pup.cover}
            sizes={sizes}
            alt=""
            loading={preload ? "eager" : undefined}
            fetchPriority={preload ? "high" : undefined}
          />
        </span>
        <svg aria-hidden="true" viewBox="0 0 100 100" className="tp-sketch__ink">
          <path d={sketch.outline} pathLength={1} className="tp-sketch__line" />
          <path d={sketch.retrace} pathLength={1} className="tp-sketch__line tp-sketch__line--retrace" />
          {sketch.doodles.map((d, i) => (
            <DoodleMark key={i} d={d} />
          ))}
        </svg>
        {!small && <span className="tp-sketch__sticker font-scrawl">{STATUS[pup.status]}</span>}
        {pup.hasVideo && !small && <span className="tp-sketch__video">▶ video</span>}
        {small && <span className="tp-sketch__sticker tp-sketch__sticker--home font-scrawl">gone home ♥</span>}
      </span>
      <span className="tp-sketch__name font-plush">{pup.displayName}</span>
      {!small && (
        <span className="tp-sketch__meta">
          {pup.name ? `${pup.breed} · ` : ""}
          {pup.genderLabel.toLowerCase()}
          {pup.age ? ` · ${pup.age}` : ""}
        </span>
      )}
    </Link>
  );
}
