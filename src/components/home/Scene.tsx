import type { CSSProperties, ReactNode } from "react";

type SceneProps = {
  /** The scene's tp-* name, also used for data-section. */
  name: string;
  /** data-section on the wrapper, when it differs from the scene name (the reference's section keys). */
  section?: string;
  tone: "light" | "dark";
  sky: readonly [top: string, bottom: string];
  labelledBy: string;
  /** Extra custom properties, e.g. the hero's quilt colour. */
  vars?: Record<`--${string}`, string>;
  className?: string;
  children: ReactNode;
};

/**
 * One homepage scene (docs/PLAN.md §5). Each paints its slice of the day-to-night sky, and its
 * bottom colour is the next scene's top. data-pup-scene marks it for the pup director (P6b).
 */
export function Scene({ name, section = name, tone, sky, labelledBy, vars, className = "", children }: SceneProps) {
  const style = { "--sky-top": sky[0], "--sky-bottom": sky[1], ...vars } as CSSProperties;
  return (
    <div data-section={section}>
      <section
        data-pup-scene="true"
        data-tone={tone}
        className={`tp-scene tp-${name} ${className}`}
        style={style}
        aria-labelledby={labelledBy}
      >
        {children}
      </section>
    </div>
  );
}
