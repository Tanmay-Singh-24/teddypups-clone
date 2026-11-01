import Image from "next/image";
import Link from "next/link";
import { PAW_PATH } from "@/components/art/Paw";
import { PupStop } from "@/components/motion/PupStop";
import { Photo } from "@/components/ui/Photo";
import { showroomClip, showroomPhotos } from "@/content/home";
import { SITE_NAME } from "@/content/site";
import { DEFAULT_WA_TEXT, defaultWaLink } from "@/lib/whatsapp";
import { ChatPlayer } from "./ChatPlayer";
import { Clip } from "./Clip";
import { Scene } from "./Scene";

const STEPS = [
  {
    title: "Choose your breed",
    text: "Select your preferred breed or tell us what you're looking for. We'll guide you based on availability and your lifestyle.",
  },
  {
    title: "Get photos & details",
    text: "Our team will share real photos, health details, and all necessary information directly on WhatsApp.",
  },
  {
    title: "Secure & safe delivery",
    text: "Once confirmed, we handle everything professionally and ensure your puppy reaches you safely and stress-free.",
  },
] as const;

const BREED_CHIPS = [
  { label: "Maltipoo", slug: "maltipoo" },
  { label: "Pomeranian", slug: "pomeranian" },
  { label: "Poodle", slug: "poodle" },
  { label: "Cavapoo", slug: "cavapoo" },
  { label: "Shih Tzu", slug: "shih-tzu" },
] as const;

const LAST = STEPS.length - 1;

function Route() {
  return (
    <svg viewBox="0 0 220 70" className="tp-route" aria-hidden="true">
      <path d="M14 52 C 60 6, 120 70, 170 28" className="tp-route__line" />
      <circle cx="14" cy="52" r="5" className="tp-route__dot" />
      <path d="M164 32 l12 -12 l12 12 v14 h-24 z" className="tp-route__home" />
      <path d="M176 42 c-2-3-7-2-6 2c1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2z" className="tp-route__heart" />
      <path d={PAW_PATH} transform="translate(70 22) scale(.3) rotate(70 32 32)" className="tp-route__paw" />
      <path d={PAW_PATH} transform="translate(104 38) scale(.3) rotate(100 32 32)" className="tp-route__paw" />
    </svg>
  );
}

/**
 * Scene 4 · the puppy journey, told as a WhatsApp chat on a sticky phone.
 *
 * The server renders the finished conversation (every step done, the last one active, every message
 * shown), which is also what phones and reduced motion see. On desktop ChatPlayer resets it and
 * replays it step by step as the steps scroll past: data-active / data-done on steps, data-show on
 * groups and the typing dots.
 */
export function JourneyChat() {
  return (
    <Scene name="chat" section="journey" tone="light" sky={["#f7d18d", "#f0b866"]} labelledBy="journey-title">
      <div className="tp-chat__grid gutter" data-pin-range="true">
        <div className="tp-chat__story">
          <h2 id="journey-title" className="font-plush text-huge">
            Your puppy journey
          </h2>
          <p className="text-lede mt-5 max-w-[42ch] text-[var(--ink-soft)]">
            A premium, step-by-step concierge experience. We make adoption simple, secure, and purely joyful.
          </p>
          <ol className="tp-chat__steps">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="tp-chat__step"
                data-done={i < LAST ? "true" : undefined}
                data-active={i === LAST ? "true" : undefined}
              >
                <span className="tp-chat__num font-plush" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="font-plush tp-chat__title">{s.title}</h3>
                <p className="tp-chat__text">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link className="btn btn-ghost tp-chat__cta" href="/how-it-works">
            How it works
          </Link>
        </div>

        <div className="tp-chat__side">
          <div className="tp-phone" aria-label={`A WhatsApp conversation with ${SITE_NAME}`} role="group">
            <div className="tp-phone__bar">
              <Image src="/brand/logo.png" alt="" width={40} height={40} className="tp-phone__avatar" />
              <span>
                <span className="tp-phone__name">{SITE_NAME}</span>
                <span className="tp-phone__status">online</span>
              </span>
            </div>
            <div className="tp-phone__screen">
              <p className="tp-msg tp-msg--me">{DEFAULT_WA_TEXT}</p>
              <div className="tp-msg-group" data-step="0" data-show="true">
                <div className="tp-msg tp-msg--them">
                  <p>{STEPS[0].text}</p>
                  <ul className="tp-chips" aria-label="Breeds we have now">
                    {BREED_CHIPS.map((b) => (
                      <li key={b.slug}>
                        <Link href={`/puppies?breed=${b.slug}`}>{b.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="tp-msg-group" data-step="1" data-show="true">
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <div className="tp-snaps">
                    {showroomPhotos.map((m) => (
                      <span key={m.id} className="tp-snaps__one">
                        <Photo media={m} sizes="9rem" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <Clip video={showroomClip} />
                </div>
                <p className="tp-msg tp-msg--them">{STEPS[1].text}</p>
              </div>
              <div className="tp-msg-group" data-step="2" data-show="true">
                <div className="tp-msg tp-msg--them">
                  <p>{STEPS[2].text}</p>
                  <Route />
                </div>
              </div>
              <p className="tp-typing" data-show="false" aria-hidden="true">
                <span />
                <span />
                <span />
              </p>
            </div>
            <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="tp-phone__compose">
              <span>Say hello on WhatsApp</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </a>
          </div>
          <PupStop pose="sit" facing="right" className="tp-chat__teddy" />
        </div>
        <ChatPlayer />
      </div>
    </Scene>
  );
}
