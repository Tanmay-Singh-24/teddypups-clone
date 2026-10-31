import type { CSSProperties } from "react";
import { Teddy, type Facing } from "./teddy/Teddy";
import type { PoseName } from "./teddy/rig";

type PupBuddyProps = {
  pose?: PoseName;
  facing?: Facing;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/** A static Teddy with an (empty) speech bubble, as server-rendered in every .pup-stop. */
export function PupBuddy({ pose = "sit", facing = "right", label, className = "", style }: PupBuddyProps) {
  return (
    <div className={`pup-buddy ${className}`} style={style} data-facing={facing}>
      <Teddy pose={pose} facing={facing} label={label} />
      <span aria-hidden="true" className="pup-bubble" data-show="false" />
    </div>
  );
}
