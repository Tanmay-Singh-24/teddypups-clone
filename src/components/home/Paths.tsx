import Link from "next/link";
import { Flight } from "@/components/art/Flight";
import { SKYLINE } from "@/components/art/skyline";
import { PupStop } from "@/components/motion/PupStop";
import { optimizedSrc, Photo } from "@/components/ui/Photo";
import { showroomPhotos } from "@/content/home";
import { getPuppy } from "@/content/puppies";
import { Scene } from "./Scene";

/** The puppy flying in, seen through the plane's porthole. */
const passenger = getPuppy("korean-teacup-maltipoo-female")!;

/** Scene 3 · two signposted ways to meet a puppy, forking around Teddy. */
export function Paths() {
  return (
    <Scene name="paths" tone="light" sky={["#fbe3b4", "#f7d18d"]} labelledBy="paths-title">
      <div className="gutter mx-auto max-w-[110rem]">
        <h2 id="paths-title" className="tp-paths__title font-plush text-huge">
          Two ways to meet your puppy
        </h2>
        <div className="tp-fork">
          <div aria-hidden="true" className="tp-fork__post" />
          <article className="tp-way tp-way--left" aria-labelledby="way-local">
            <h3 id="way-local" className="tp-sign tp-sign--left font-plush">
              Puppies in Dubai
            </h3>
            <div className="tp-way__scene" data-pup-look="true">
              <svg viewBox="0 0 300 120" className="tp-way__skyline" aria-hidden="true">
                <path
                  d={SKYLINE}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <figure className="tp-window">
                <span className="tp-window__glass">
                  <Photo media={showroomPhotos[0]} sizes="(min-width: 1024px) 16rem, 60vw" />
                </span>
                <figcaption className="font-scrawl">In our showroom</figcaption>
              </figure>
            </div>
            <p className="tp-way__text">
              See them, love them, take them home. Come meet our locally available puppies before you decide.
            </p>
            <Link className="btn btn-primary" href="/puppies?origin=local">
              Meet local puppies
            </Link>
          </article>
          <article className="tp-way tp-way--right" aria-labelledby="way-imported">
            <h3 id="way-imported" className="tp-sign tp-sign--right font-plush">
              Imported for you
            </h3>
            <div className="tp-way__scene" data-pup-look="true">
              <Flight
                label="A plane bringing a Korean Teacup Maltipoo puppy from Korea to Dubai"
                photo={optimizedSrc(passenger.cover.url, 128)}
              />
            </div>
            <p className="tp-way__text">
              Exclusive Korean teacup puppies, delivered. Order from the world&apos;s most reputable breeders and let us
              handle the import.
            </p>
            <Link className="btn btn-primary" href="/puppies?origin=imported">
              See imported puppies
            </Link>
          </article>
          <PupStop pose="sit" facing="right" className="tp-fork__teddy" />
        </div>
      </div>
    </Scene>
  );
}
