"use client";

import { useScroll } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

const ROUTE = "M40 250 C 170 40, 470 20, 620 168";

/**
 * A plane on a dotted route from Korea to Dubai (viewBox 660×300). As the drawing scrolls through
 * the viewport the plane flies along the route, turning with the curve, and fades in just after
 * take-off. With a `photo`, a puppy looks out of the porthole (homepage). The server draws it
 * mid-route; reduced motion parks it at 62% of the way.
 */
export function Flight({ label, photo }: { label: string; photo?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();
  const clipId = useId();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start 95%", "end 25%"] });

  useEffect(() => {
    const fly = (progress: number) => {
      const path = route.current;
      const g = plane.current;
      if (!path || !g) return;
      const length = path.getTotalLength();
      const at = Math.min(length, Math.max(0, progress * length));
      const p = path.getPointAtLength(at);
      const ahead = path.getPointAtLength(Math.min(length, at + 1));
      const behind = path.getPointAtLength(Math.max(0, at - 1));
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      g.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
      g.style.opacity = String(Math.min(1, Math.max(0, (progress - 0.11) / 0.06)));
    };
    fly(reduced ? 0.62 : scrollYProgress.get());
    if (reduced) return;
    return scrollYProgress.on("change", fly);
  }, [reduced, scrollYProgress]);

  return (
    <div ref={box} className="tp-flight">
      <svg viewBox="0 0 660 300" role="img" aria-label={label}>
        <defs>
          <clipPath id={clipId}>
            <circle r="25" />
          </clipPath>
        </defs>
        <path ref={route} d={ROUTE} className="tp-flight__route" />
        <circle cx="40" cy="250" r="7" className="tp-flight__dot" />
        <circle cx="620" cy="168" r="7" className="tp-flight__dot" />
        <text x="40" y="284" textAnchor="middle" className="tp-flight__label">
          Korea
        </text>
        <text x="620" y="202" textAnchor="middle" className="tp-flight__label">
          Dubai
        </text>
        <g ref={plane} transform="translate(410 70)">
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
          {photo && (
            <g transform="translate(10 2)">
              <image
                href={photo}
                x="-25"
                y="-25"
                width="50"
                height="50"
                clipPath={`url(#${clipId})`}
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
