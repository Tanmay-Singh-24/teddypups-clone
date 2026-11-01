import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PupBuddy } from "@/components/art/PupBuddy";
import { Photo } from "@/components/ui/Photo";
import { goneHomePuppies } from "@/content/puppies";
import type { Puppy } from "@/content/types";
import { RevealScope } from "@/components/motion/RevealScope";

export const metadata: Metadata = {
  title: "Gone home",
  description: "TeddyPups puppies who have already joined their families.",
  alternates: { canonical: "/gone-home" },
};

/** Tickets lean alternately, repeating every six. */
const TILTS = [-1.4, 1.1, -0.6, 1.6, -1.1, 0.8];

function Ticket({ puppy, index }: { puppy: Puppy; index: number }) {
  const i = index % TILTS.length;
  const ticket = puppy.ticket!;
  const photo = puppy.media.find((m) => m.url === ticket.imageUrl) ?? puppy.cover;
  return (
    <li className="tp-ticket" data-reveal="true" style={{ "--tilt": `${TILTS[i]}deg`, "--i": i } as CSSProperties}>
      <Link className="tp-ticket__link" href={`/puppies/${puppy.slug}`}>
        <span className="tp-ticket__main">
          <span className="tp-ticket__photo">
            <Photo media={photo} sizes="7rem" alt={ticket.imageAlt} />
          </span>
          <span className="tp-ticket__body">
            <span className="font-scrawl tp-ticket__kicker">one ticket home</span>
            <span className="font-plush tp-ticket__name">{puppy.displayName}</span>
            <span className="tp-ticket__meta">
              {puppy.name ? `${puppy.breed}, ${puppy.genderLabel.toLowerCase()}` : puppy.genderLabel}
            </span>
            <span className="tp-ticket__route">
              <span>{ticket.from}</span>
              <svg viewBox="0 0 60 12" aria-hidden="true">
                <path d="M2 6h46" />
                <path d="M44 2l6 4-6 4" />
              </svg>
              <span>home ♥</span>
            </span>
          </span>
        </span>
        <span aria-hidden="true" className="tp-ticket__stub">
          <span className="font-plush">admit one</span>
        </span>
      </Link>
    </li>
  );
}

export default function GoneHomePage() {
  return (
    <div data-page="gone" className="tp-page">
      <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
        <header className="tp-boothhead">
          <div className="max-w-3xl">
            <h1 className="font-plush text-giant">
              Gone home
              <svg
                viewBox="0 0 48 44"
                className="ml-3 inline-block w-[0.45em] -translate-y-[0.15em] text-toffee"
                aria-hidden="true"
              >
                <path
                  d="M24 40C10 30 4 22 4 14.5 4 8.7 8.6 4 14.3 4c4.1 0 7.6 2.4 9.7 6 2.1-3.6 5.6-6 9.7-6C39.4 4 44 8.7 44 14.5 44 22 38 30 24 40z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h1>
            <p className="text-lede mt-6 text-cocoa-soft">
              Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we&apos;ll help you
              find your match.
            </p>
            <Link className="btn btn-primary mt-8" href="/puppies">
              See available puppies
            </Link>
          </div>
          <div aria-hidden="true" className="tp-booth">
            <PupBuddy pose="peek" className="tp-booth__teddy" />
            <div className="tp-booth__counter">
              <span className="font-plush">tickets home</span>
            </div>
          </div>
        </header>
        <RevealScope>
          <ul className="tp-tickets" aria-label="Puppies who have gone home">
            {goneHomePuppies.map((p, i) => (
              <Ticket key={p.id} puppy={p} index={i} />
            ))}
          </ul>
        </RevealScope>
      </div>
    </div>
  );
}
