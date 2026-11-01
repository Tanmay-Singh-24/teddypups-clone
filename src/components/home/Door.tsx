import type { CSSProperties } from "react";
import Link from "next/link";
import { Paw } from "@/components/art/Paw";
import { Photo } from "@/components/ui/Photo";
import type { Puppy } from "@/content/types";

/** Door woods, cycled along the hallway. */
const WOODS = ["#a24a1a", "#5a3a28", "#d4893f", "#b8644a", "#7a4a2e"];

const STATUS_TAG = { available: "Available", "gone-home": "Gone home" } as const;

/** "Maltipoo, boy, 3 months, with video": the breed only when the name doesn't already say it. */
export function doorMeta(p: Puppy) {
  const video = p.media.some((m) => m.kind === "video");
  return `${p.name ? `${p.breed}, ` : ""}${p.genderLabel.toLowerCase()}${p.age ? `, ${p.age}` : ""}${video ? ", with video" : ""}`;
}

type DoorProps = { pup: Puppy; index: number; sizes: string };

/**
 * An arched door with the puppy waiting in the room behind it. The server renders it open
 * (data-open on the <li>); the pinned hallway (P6a) closes doors and swings each open as it reaches Teddy.
 */
export function DoorLink({ pup, index, sizes }: DoorProps) {
  return (
    <Link
      className="tp-door__link"
      style={{ "--door": WOODS[index % WOODS.length] } as CSSProperties}
      href={`/puppies/${pup.slug}`}
    >
      <span className="tp-door__plate">
        <span className="font-plush tp-door__name">{pup.displayName}</span>
        <span className="tp-door__meta">{doorMeta(pup)}</span>
      </span>
      <span className="tp-door__frame">
        <span className="tp-door__room">
          <Photo media={pup.cover} sizes={sizes} />
        </span>
        <span aria-hidden="true" className="tp-door__way">
          <span className="tp-door__leaf">
            <Paw className="tp-door__peephole" />
            <span className="tp-door__knob" />
          </span>
        </span>
        <span className="tp-door__tag font-scrawl">{STATUS_TAG[pup.status]}</span>
      </span>
    </Link>
  );
}
