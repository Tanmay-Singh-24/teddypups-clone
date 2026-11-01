import type { CSSProperties, ReactNode } from "react";
import { ChatDots, HeartPulse, PlaneTrail, stroke } from "@/components/art/StampIcons";
import { PupStop } from "@/components/motion/PupStop";
import { Scene } from "./Scene";


type Stamp = { title: string; text: string; shape: "round" | "ticket" | "oval" | "scallop"; ink: string; tilt: string; icon: ReactNode };

const STAMPS: Stamp[] = [
  {
    title: "Vet-checked & healthy",
    text: "Every puppy comes vaccinated, dewormed, and with a verified health certificate.",
    shape: "round",
    ink: "#a24a1a",
    tilt: "-8deg",
    icon: <HeartPulse />,
  },
  {
    title: "Korea to Dubai, safely",
    text: "Trusted breeders, safe travel, and premium care from start to finish.",
    shape: "ticket",
    ink: "#1f6b45",
    tilt: "5deg",
    icon: <PlaneTrail />,
  },
  {
    title: "Support 24/7",
    text: "Always here to help, from choosing your puppy to post-delivery support.",
    shape: "oval",
    ink: "#5a3a28",
    tilt: "-4deg",
    icon: <ChatDots />,
  },
  {
    title: "Trusted by families worldwide",
    text: "Puppies delivered to loving homes all around the world.",
    shape: "scallop",
    ink: "#c2622b",
    tilt: "7deg",
    icon: (
      <>
        <circle cx="32" cy="32" r="22" {...stroke} />
        <path d="M10 32h44M32 10c-8 8-8 36 0 44M32 10c8 8 8 36 0 44" {...stroke} />
      </>
    ),
  },
];

const CITY =
  "M0 160V118h34v-14h22v-22h30v34h18V96h26v30h22v-18h16v-30h34v40h20V70h28v56h24V98h18v-26h30v54h20v-38h26v-40l14-6 14 6v40h22v46h18V84h26v-30h22v50h24V76h36v50h20V96h18v-58h30v44h14V96h22v-30h16v22h26v-52l6-8v-24l4-6v-30l3-18 3 18v30l4 6v24l6 8v52h26v30h22V82h30v-20h24v48h20V90h28v-36h26v56h18V74h30v36h22V94h26v-24h30v62h20V102h26v20h34v38z";

/**
 * The Dubai skyline in silhouette against the setting sun. Painted in the scene's bottom colour,
 * so it merges into the dusk scene below.
 */
function Horizon() {
  return (
    <div aria-hidden="true" className="tp-horizon">
      <span className="tp-horizon__sun" />
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tp-horizon__city">
        <path d={CITY} />
      </svg>
    </div>
  );
}

/**
 * Scene 5 · an open puppy passport. The stamps render inked (their final state); P6a thumps them in
 * on scroll with tp-stamp-in, staggered by --i.
 */
export function Passport() {
  return (
    <Scene name="passport" section="trust" tone="light" sky={["#f0b866", "#a65a30"]} labelledBy="trust-title">
      <div className="gutter mx-auto max-w-[96rem]">
        <div className="tp-book">
          <div className="tp-book__page tp-book__page--left">
            <p aria-hidden="true" className="tp-book__kicker font-scrawl">
              puppy passport
            </p>
            <h2 id="trust-title" className="font-plush tp-book__title">
              Why families trust TeddyPups
            </h2>
            <PupStop pose="sit" facing="right" className="tp-book__teddy" />
          </div>
          <ul className="tp-book__page tp-book__page--right">
            {STAMPS.map((s, i) => (
              <li
                key={s.title}
                className="tp-entry"
                style={{ "--ink-stamp": s.ink, "--tilt": s.tilt, "--i": i } as CSSProperties}
              >
                <span className={`tp-stamp tp-stamp--${s.shape}`}>
                  <svg viewBox="0 0 64 64" className="tp-stamp__icon" aria-hidden="true">
                    {s.icon}
                  </svg>
                  <span className="tp-stamp__title font-plush">{s.title}</span>
                </span>
                <p className="tp-entry__text">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Horizon />
    </Scene>
  );
}
