"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { PupBuddy } from "@/components/art/PupBuddy";
import type { PuppyCard, Slugged } from "@/content/types";
import { SketchCard } from "./SketchCard";

const KEYS = ["origin", "breed", "gender", "collection"] as const;
type Key = (typeof KEYS)[number];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="tp-sticker-chip">
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">{label}</span>
      {children}
    </div>
  );
}

type PuppyBrowserProps = { puppies: PuppyCard[]; breeds: Slugged[]; whatsappHref: string };

/**
 * The /puppies filters, count and grid. The filters live in the URL (?origin, ?breed, ?gender,
 * ?collection) and change through history.replaceState, which Next keeps useSearchParams in sync with.
 */
export function PuppyBrowser({ puppies, breeds, whatsappHref }: PuppyBrowserProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const f: Record<Key, string> = {
    origin: params.get("origin") ?? "",
    breed: params.get("breed") ?? "",
    gender: params.get("gender") ?? "",
    collection: params.get("collection") ?? "",
  };

  /** Sets a filter, or clears it when its chip is already on. */
  const toggle = (key: Key, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && f[key] !== value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };
  const clear = () => window.history.replaceState(null, "", pathname);

  const shown = puppies.filter(
    (p) =>
      (!f.origin || p.origin.slug === f.origin) &&
      (!f.breed || p.breeds.some((b) => b.slug === f.breed)) &&
      (!f.gender || p.gender === f.gender || p.gender === "male-female") &&
      (!f.collection || p.collections.some((c) => c.slug === f.collection)),
  );
  const filtered = KEYS.some((k) => f[k]);
  const breedChips = breeds.filter((b) => puppies.some((p) => p.breeds.some((x) => x.slug === b.slug)));
  const hasTeacups = puppies.some((p) => p.collections.some((c) => c.slug === "korean-teacup"));
  const hasLocal = puppies.some((p) => p.origin.slug === "local");

  return (
    <MotionConfig reducedMotion="user">
      <div>
      <div role="group" aria-label="Filter puppies" className="tp-sketchpad flex flex-col gap-4">
        <Row label="where">
          <Chip active={!f.origin && !f.collection} onClick={clear}>
            Everywhere
          </Chip>
          {hasLocal && (
            <Chip active={f.origin === "local"} onClick={() => toggle("origin", "local")}>
              In Dubai
            </Chip>
          )}
          <Chip active={f.origin === "imported"} onClick={() => toggle("origin", "imported")}>
            Imported
          </Chip>
          {hasTeacups && (
            <Chip active={f.collection === "korean-teacup"} onClick={() => toggle("collection", "korean-teacup")}>
              Korean Teacup
            </Chip>
          )}
        </Row>
        <Row label="breed">
          {breedChips.map((b) => (
            <Chip key={b.slug} active={f.breed === b.slug} onClick={() => toggle("breed", b.slug)}>
              {b.name}
            </Chip>
          ))}
        </Row>
        <Row label="boy or girl">
          <Chip active={f.gender === "male"} onClick={() => toggle("gender", "male")}>
            Boys
          </Chip>
          <Chip active={f.gender === "female"} onClick={() => toggle("gender", "female")}>
            Girls
          </Chip>
          {filtered && (
            <button type="button" onClick={clear} className="link-ink ml-auto text-[0.95rem] font-semibold">
              Clear filters
            </button>
          )}
        </Row>
      </div>
      <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">
        {shown.length === 1 ? "1 puppy" : `${shown.length} puppies`} {filtered ? "match" : "looking for a home"}
      </p>
      {shown.length ? (
        <div>
          <motion.ul layout className="tp-sketches mt-8">
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.86, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <SketchCard pup={p} index={i} preload={i < 3} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <PupBuddy pose="sit" className="mx-auto w-44 md:w-52" label="Teddy, tilting his head" />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="mt-3 max-w-[48ch] text-cocoa-soft">
              Tell us what you&apos;re hoping for and we&apos;ll let you know what&apos;s in our showroom or what we can bring
              in for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                Ask on WhatsApp
              </a>
              <button type="button" onClick={clear} className="btn btn-ghost">
                Show all puppies
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </MotionConfig>
  );
}
