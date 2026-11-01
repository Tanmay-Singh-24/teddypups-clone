import type { CSSProperties } from "react";
import Link from "next/link";
import { PupStop } from "@/components/motion/PupStop";
import { availablePuppies } from "@/content/puppies";
import { DoorLink } from "./Door";
import { Scene } from "./Scene";

/**
 * Scene 2 · Meet the pups. A grid of open doors by default (phones, tablets, reduced motion, no JS).
 * From 1024px P6a sets data-pinned on the section and a height on [data-pin-range]; the stage then
 * sticks for the whole range while the track slides sideways past Teddy.
 */
export function MeetHall() {
  return (
    <Scene name="meet" tone="light" sky={["#fff1d8", "#fbe3b4"]} labelledBy="meet-title">
      <div data-pin-range="true" style={{ "--pinned": 0 } as CSSProperties}>
        <div className="tp-meet__stage">
          <header className="tp-meet__head gutter">
            <div>
              <h2 id="meet-title" className="font-plush text-huge">
                Meet the pups
              </h2>
              <p className="text-lede mt-3 max-w-[44ch] text-[var(--ink-soft)]">
                Real puppies, real photos, looking for their families right now.
              </p>
            </div>
            <Link className="btn btn-primary shrink-0" href="/puppies">
              See all available puppies
            </Link>
          </header>
          <div className="tp-meet__hall">
            <ol className="tp-meet__track" data-treadmill="true" aria-label="Puppies looking for a family">
              {availablePuppies.map((p, i) => (
                <li key={p.slug} className="tp-door" data-open="true">
                  <DoorLink pup={p} index={i} sizes="(min-width: 1024px) 15rem, 44vw" />
                </li>
              ))}
              <li className="tp-door tp-door--all" data-open="true">
                <Link className="tp-door__link" href="/puppies">
                  <span className="tp-door__frame tp-door__frame--all">
                    <span className="font-plush tp-door__all">Meet them all</span>
                  </span>
                </Link>
              </li>
            </ol>
            <div aria-hidden="true" className="tp-meet__floor" />
            <PupStop pose="sit" facing="right" className="tp-meet__teddy" />
          </div>
        </div>
      </div>
    </Scene>
  );
}
