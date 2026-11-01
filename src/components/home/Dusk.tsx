import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { PupStop } from "@/components/motion/PupStop";
import { PhotoWallViewer } from "@/components/ui/PhotoWallViewer";
import { familyPhotos, homeFamilyPhotos } from "@/content/families";
import { TESTIMONIAL } from "@/content/site";
import { Scene } from "./Scene";

type Tape = "center" | "left" | "right" | "corners";

/** The eight prints on the board: tilt, tape colour and placement, and the drop-in delay (P6a). */
const PRINTS: { tilt: string; tape: string; at: Tape; delay: number }[] = [
  { tilt: "-2.2deg", tape: "#f6d79a", at: "center", delay: 330 },
  { tilt: "1.6deg", tape: "#f9cdbf", at: "left", delay: 0 },
  { tilt: "-0.9deg", tape: "#cfe5f6", at: "right", delay: 550 },
  { tilt: "2.4deg", tape: "#f6d79a", at: "corners", delay: 110 },
  { tilt: "-1.5deg", tape: "#e9dcc4", at: "center", delay: 660 },
  { tilt: "0.8deg", tape: "#f6d79a", at: "right", delay: 220 },
  { tilt: "-2.6deg", tape: "#f9cdbf", at: "left", delay: 770 },
  { tilt: "1.2deg", tape: "#cfe5f6", at: "center", delay: 440 },
];

/** Prints Teddy glances at when the pup actor runs (P6b). */
const LOOKS = new Set([1, 4]);

function TapeStrips({ at }: { at: Tape }) {
  if (at === "corners")
    return (
      <>
        <span aria-hidden="true" className="tp-tape tp-tape--tl" />
        <span aria-hidden="true" className="tp-tape tp-tape--tr" />
      </>
    );
  return <span aria-hidden="true" className={`tp-tape tp-tape--${at}`} />;
}

const total = familyPhotos.length;
const SIZES = "(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw";
const wall = homeFamilyPhotos.slice(0, PRINTS.length);

/**
 * Scene 6 · dusk: the testimonial and a board of taped family polaroids above a little shopfront.
 * Each print opens the shared photo viewer over all 64 photos.
 */
export function Dusk() {
  return (
    <Scene name="dusk" section="families" tone="dark" sky={["#a65a30", "#4d2b19"]} labelledBy="dusk-title">
      <div className="tp-dusk__sky gutter">
        <div className="tp-dusk__head">
          <h2 id="dusk-title" className="font-plush text-huge">
            Happy families &amp; puppies
          </h2>
          <p className="text-lede mt-5 max-w-[50ch] text-[var(--ink-soft)]">
            We are truly honored to see our puppies become cherished members of loving families. These heartwarming
            moments have been shared by our valued clients who welcomed a Teddy Pup into their homes and hearts.
          </p>
        </div>
        <figure className="tp-dusk__note">
          <blockquote className="font-plush-text">
            “{TESTIMONIAL.quote}”
          </blockquote>
          <figcaption className="font-scrawl">
            {TESTIMONIAL.name}, {TESTIMONIAL.place}
          </figcaption>
        </figure>
      </div>

      <div className="tp-photowall">
        <div className="tp-photowall__wall">
          <ul className="tp-photowall__prints" aria-label="Photos from TeddyPups families">
            {wall.map((photo, i) => {
              const print = PRINTS[i];
              return (
                <li
                  key={photo.id}
                  data-reveal="true"
                  data-pup-look={LOOKS.has(i) ? "" : undefined}
                  style={{ "--d": `${print.delay}ms` } as CSSProperties}
                >
                  <button
                    type="button"
                    className="tp-photowall__print"
                    data-photo-index={i}
                    aria-label={`Open photo ${i + 1} of ${total}: ${photo.caption}`}
                  >
                    <span
                      className="tp-polaroid"
                      style={{ "--tilt": print.tilt, "--tape": print.tape, "--i": i } as CSSProperties}
                    >
                      <TapeStrips at={print.at} />
                      <span className="tp-polaroid__photo">
                        <Image
                          src={photo.url}
                          alt={photo.alt}
                          width={photo.width}
                          height={photo.height}
                          sizes={SIZES}
                          placeholder={photo.blurDataUrl ? "blur" : "empty"}
                          blurDataURL={photo.blurDataUrl ?? undefined}
                          style={{ width: "100%", height: "auto", backgroundColor: photo.color }}
                        />
                      </span>
                      <span className="tp-polaroid__caption font-scrawl">{photo.caption}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <PhotoWallViewer photos={homeFamilyPhotos} pageSizes={SIZES} />
          <div className="tp-facade__ground">
            <span aria-hidden="true" className="tp-facade__door" />
            <span aria-hidden="true" className="tp-lamp">
              <span className="tp-lamp__light" />
            </span>
            <Link className="btn btn-primary tp-facade__cta" href="/happy-families">
              See every happy family
            </Link>
            <PupStop pose="sit" facing="right" className="tp-dusk__teddy" />
          </div>
        </div>
        <div aria-hidden="true" className="tp-street__pavement" />
      </div>
    </Scene>
  );
}
