import { PupBuddy } from "@/components/art/PupBuddy";
import type { Facing } from "@/components/art/teddy/Teddy";
import type { PoseName } from "@/components/art/teddy/rig";

type PupStopProps = {
  pose: PoseName;
  facing: Facing;
  /** A scripted bit the pup actor plays at this stop (P6b), e.g. "basket". */
  act?: string;
  /** The actor renders behind the scene layer here. */
  behind?: boolean;
  /** Still visited by the pup in the narrow "lane" mode under 768px. */
  lane?: boolean;
  label?: string;
  className?: string;
};

/**
 * An anchor the pup actor walks to (docs/PLAN.md §8.2). It holds a static buddy so the scene
 * looks right with no JavaScript or with reduced motion; the actor hides it once it takes over.
 */
export function PupStop({ pose, facing, act, behind, lane, label, className = "" }: PupStopProps) {
  return (
    <div
      data-pup-stop="true"
      data-pose={pose}
      data-facing={facing}
      data-act={act}
      data-behind={behind || undefined}
      data-lane={lane || undefined}
      className={`pup-stop ${className}`}
    >
      <PupBuddy pose={pose} facing={facing} label={label} />
    </div>
  );
}
