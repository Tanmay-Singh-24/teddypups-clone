import Link from "next/link";
import { availablePuppies } from "@/content/puppies";
import { DoorLink } from "./Door";
import { MeetStage } from "./MeetStage";
import { Scene } from "./Scene";

/**
 * Scene 2 · Meet the pups. A grid of open doors by default (phones, tablets, reduced motion, no JS);
 * from 1024px MeetStage pins it into a hallway that slides past Teddy as you scroll.
 */
export function MeetHall() {
  return (
    <Scene name="meet" tone="light" sky={["#fff1d8", "#fbe3b4"]} labelledBy="meet-title">
      <MeetStage
        head={
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
        }
        doors={availablePuppies.map((p, i) => ({
          id: p.id,
          node: <DoorLink pup={p} index={i} sizes="(min-width: 1024px) 15rem, 44vw" />,
        }))}
      />
    </Scene>
  );
}
