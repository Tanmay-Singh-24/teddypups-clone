import Link from "next/link";
import { PupStop } from "@/components/motion/PupStop";
import { Photo } from "@/components/ui/Photo";
import { getPuppy } from "@/content/puppies";
import { defaultWaLink } from "@/lib/whatsapp";
import { Scene } from "./Scene";

const max = getPuppy("maltipoo-max-male")!;

/**
 * Scene 8 · home: a lamplit house whose door stands open on Max. The door renders open (its final
 * state); once the pup actor runs, `html[data-pup]` closes it until Teddy arrives (data-visited, P6b),
 * and P6a swings it open on scroll otherwise.
 */
export function HomeHouse() {
  return (
    <Scene name="home" section="cta" tone="dark" sky={["#2f1a10", "#24130b"]} labelledBy="cta-title">
      <div className="tp-home__copy gutter">
        <h2 id="cta-title" className="font-plush text-huge">
          Ready to meet your new best friend?
        </h2>
        <p className="tp-home__lede">
          Bring home a healthy, happy teacup or designer puppy with expert guidance every step of the way. We help you
          find the right match and ensure a smooth, safe delivery across the UAE.
        </p>
      </div>
      <div className="tp-house">
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--left" />
        <span aria-hidden="true" className="tp-house__lamp" />
        <div className="tp-house__doorway">
          <span className="tp-house__inside">
            <Photo media={max.cover} alt="Max, waiting inside" sizes="16rem" />
          </span>
          <span aria-hidden="true" className="tp-house__door">
            <span className="tp-house__peep" />
            <span className="tp-house__knob" />
          </span>
        </div>
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--right" />
        <span aria-hidden="true" className="tp-house__mat font-scrawl">
          welcome home
        </span>
        <PupStop pose="bow" facing="right" className="tp-house__teddy" />
      </div>
      <div className="tp-home__actions gutter">
        <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          Enquire on WhatsApp
        </a>
        <Link className="btn btn-ghost tp-home__ghost" href="/contact">
          Visit &amp; contact
        </Link>
      </div>
    </Scene>
  );
}
