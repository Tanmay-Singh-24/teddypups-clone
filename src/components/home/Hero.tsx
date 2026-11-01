import type { CSSProperties } from "react";
import Link from "next/link";
import { Quilt } from "@/components/art/Quilt";
import { PupStop } from "@/components/motion/PupStop";
import { Photo } from "@/components/ui/Photo";
import { availablePuppies } from "@/content/puppies";
import { SITE_TAGLINE } from "@/content/site";
import { defaultWaLink } from "@/lib/whatsapp";
import { Scene } from "./Scene";

/** The six arches: centre x, width, how much of the photo peeks over the quilt, tilt. */
const SEATS = [
  { x: "9%", w: "8.6rem", peek: 0.62, tilt: "-5deg" },
  { x: "22.5%", w: "10.4rem", peek: 0.8, tilt: "3deg" },
  { x: "35%", w: "9.2rem", peek: 0.7, tilt: "-2deg" },
  { x: "65%", w: "9.4rem", peek: 0.74, tilt: "3deg" },
  { x: "77.5%", w: "10.6rem", peek: 0.82, tilt: "-3deg" },
  { x: "91%", w: "8.4rem", peek: 0.6, tilt: "4deg" },
] as const;

const seatStyle = (i: number) => {
  const s = SEATS[i];
  return { "--x": s.x, "--w": s.w, "--peek": s.peek, "--tilt": s.tilt, "--i": i } as CSSProperties;
};

const lineup = availablePuppies.slice(0, SEATS.length);
/** The next puppy waits in the wings, preloaded, for the swap cycle (P6a). */
const understudy = availablePuppies[SEATS.length];

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
        <ul className="tp-lineup" aria-label="Some of the puppies in our showroom">
          {lineup.map((p, i) => (
            <li key={p.slug} className="tp-lineup__seat" style={seatStyle(i)}>
              <Link
                className="tp-lineup__pup"
                data-pup-friend="true"
                aria-label={`Meet ${p.displayName}, ${p.breed}`}
                href={`/puppies/${p.slug}`}
              >
                <span className="tp-lineup__photo">
                  <Photo media={p.cover} sizes="11rem" loading="eager" fetchPriority={i < 2 ? "high" : undefined} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {/* Name tags ride above the quilt; P6a pops one at a time with data-tag="show". */}
        <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
          {lineup.map((p, i) => (
            <li key={p.slug} className="tp-lineup__seat" style={seatStyle(i)}>
              <span className="tp-lineup__ghost">
                <span className="tp-lineup__name font-scrawl">{p.displayName}</span>
              </span>
            </li>
          ))}
        </ul>
        {understudy && (
          <span aria-hidden="true" className="tp-lineup__wings" data-for={SEATS.length}>
            <Photo media={understudy.cover} alt="" sizes="11rem" loading="eager" />
          </span>
        )}
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
