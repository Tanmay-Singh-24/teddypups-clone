import Link from "next/link";
import { Twinkles, type Star } from "@/components/art/Twinkles";
import { PupStop } from "@/components/motion/PupStop";
import { faqs } from "@/content/families";
import { Scene } from "./Scene";

const STAR_PATH = "M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z";

const STARS: Star[] = [
  [8, 12, 1.8],
  [22, 30, 1],
  [41, 8, 1.4],
  [57, 22, 0.9],
  [72, 6, 1.6],
  [88, 18, 1.2],
  [95, 42, 1],
  [4, 58, 1.2],
  [34, 70, 0.8],
  [63, 84, 1.1],
  [83, 66, 1.4],
];

/** Questions Teddy glances at when the pup actor runs (P6b). */
const LOOKS = 2;

/** Scene 7 · night: the first three FAQs under the stars, with a puzzled Teddy. */
export function Night() {
  return (
    <Scene name="night" section="questions" tone="dark" sky={["#4d2b19", "#2f1a10"]} labelledBy="questions-title">
      <Twinkles stars={STARS} size={9} className="pointer-events-none tp-night__stars" />
      <div className="tp-night__grid gutter">
        <div className="tp-night__intro">
          <h2 id="questions-title" className="font-plush text-huge">
            Questions, answered
          </h2>
          <Link className="btn btn-ghost tp-night__cta" href="/faq">
            Read all questions
          </Link>
          <div className="tp-night__pup">
            <span aria-hidden="true" className="tp-night__wonder font-plush">
              ?
            </span>
            <PupStop pose="sit" facing="right" act="tilt" className="tp-night__teddy" />
          </div>
        </div>
        <dl className="tp-night__list">
          {faqs.slice(0, 3).map((f, i) => (
            <div key={f.id} className="tp-qa" data-pup-look={i < LOOKS ? "" : undefined}>
              <dt className="font-plush tp-qa__q">
                <svg viewBox="0 0 40 40" className="tp-qa__star" aria-hidden="true">
                  <path d={STAR_PATH} fill="currentColor" />
                </svg>
                {f.question}
              </dt>
              <dd className="tp-qa__a">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Scene>
  );
}
