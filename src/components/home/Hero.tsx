import Link from "next/link";
import { Quilt } from "@/components/art/Quilt";
import { PupStop } from "@/components/motion/PupStop";
import { availablePuppies } from "@/content/puppies";
import { SITE_TAGLINE } from "@/content/site";
import { defaultWaLink } from "@/lib/whatsapp";
import { HeroLineup, type Friend } from "./HeroLineup";
import { Scene } from "./Scene";

/** Every available puppy takes a turn in the arches; the first six start seated. */
const friends: Friend[] = availablePuppies.map(({ id, slug, displayName, breed, cover }) => ({ id, slug, displayName, breed, cover }));

export function Hero() {
  return (
    <Scene name="hero" tone="light" sky={["#fffdf8", "#fff1d8"]} vars={{ "--quilt": "#fff1d8" }} labelledBy="hero-title">
      <span aria-hidden="true" className="tp-hero__sun" />

      <div className="tp-hero__copy gutter">
        <p className="tp-hero__note font-scrawl">
          {SITE_TAGLINE}
          <svg
            viewBox="0 0 220 24"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-3 w-full text-toffee"
            aria-hidden="true"
          >
            <path
              d="M4 14c18-10 30 8 48-1s28-9 46 0 30 8 48-1 30-9 48 0 18 2 22 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
        <h1 id="hero-title" className="tp-hero__title font-plush">
          <span className="tp-hero__line">Premium teacup</span>
          <span className="tp-hero__line tp-hero__line--2">puppies in Dubai</span>
        </h1>
        <p className="tp-hero__lede">
          Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders
          worldwide.
        </p>
        <div className="tp-hero__actions">
          <Link className="btn btn-primary" href="/puppies">
            View available puppies
          </Link>
          <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Enquire on WhatsApp
          </a>
        </div>
      </div>

      <div className="tp-hero__stage">
        <HeroLineup friends={friends} />
        <PupStop
          pose="peek"
          facing="right"
          act="peekaboo"
          behind
          lane
          label="Teddy, the TeddyPups puppy, peeking over the quilt"
          className="tp-hero__teddy"
        />
        <Quilt />
      </div>
    </Scene>
  );
}
