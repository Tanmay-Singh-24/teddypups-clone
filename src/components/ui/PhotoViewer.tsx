"use client";

import { AnimatePresence, motion, type PanInfo, type Variants } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Media } from "@/content/types";
import { Photo } from "./Photo";

/** Width the full-screen photo can actually show at: the viewport, less the viewer's bars. */
const fitWidth = (m: Media) => Math.ceil(Math.min(innerWidth, Math.max(1, innerHeight - 150) * (m.width / m.height)));

/** A swipe past this many pixels moves to the next or previous photo. */
export const SWIPE_PX = 80;

/** Steps to the neighbour a horizontal drag points at, if it went far enough. */
export function swipeStep(info: PanInfo) {
  return info.offset.x < -SWIPE_PX ? 1 : info.offset.x > SWIPE_PX ? -1 : 0;
}

/**
 * A full-screen photo that appears instantly: the page-sized copy (already cached by the gallery or wall)
 * shows first, and the viewport-sized sharp copy fades in over it once decoded.
 */
export function ViewerImage({ media, pageSizes, quality = 75 }: { media: Media; pageSizes: string; quality?: number }) {
  const [sharp, setSharp] = useState(false);
  return (
    <>
      <Photo
        media={media}
        sizes={pageSizes}
        quality={quality}
        alt=""
        loading="eager"
        className={sharp ? "tp-viewer__first tp-viewer__first--done" : "tp-viewer__first"}
        style={{ objectFit: "contain", objectPosition: "50% 50%", backgroundColor: "transparent" }}
      />
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={`${fitWidth(media)}px`}
        quality={quality}
        loading="eager"
        className="tp-viewer__sharp object-contain"
        data-sharp={sharp || undefined}
        onLoad={(e) => {
          e.currentTarget
            .decode()
            .catch(() => {})
            .then(() => setSharp(true));
        }}
      />
    </>
  );
}

/** Warms the sharp copies of the photos either side of `at`, so stepping through feels instant. */
export function ViewerPreload({ photos, at, quality = 75 }: { photos: Media[]; at: number; quality?: number }) {
  const n = photos.length;
  if (n < 2) return null;
  const around = [...new Set([(at - 1 + n) % n, (at + 1) % n])].filter((i) => photos[i].kind === "image");
  return (
    <span aria-hidden="true" className="sr-only">
      {around.map((i) => (
        <Image
          key={photos[i].id}
          src={photos[i].url}
          alt=""
          fill
          sizes={`${fitWidth(photos[i])}px`}
          quality={quality}
          loading="eager"
        />
      ))}
    </span>
  );
}

const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 70 * dir, rotate: 5 * dir, scale: 0.92 }),
  center: { opacity: 1, x: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 26 } },
  exit: (dir: number) => ({ opacity: 0, x: -70 * dir, rotate: -5 * dir, scale: 0.92, transition: { duration: 0.22 } }),
};

/**
 * The shared photo viewer (happy-families wall, homepage dusk wall): a `<dialog>` with ←/→, Esc,
 * swipe, a counter with the caption, and the photos either side preloaded. Render `viewer` once and
 * call `open(i)` from the photo buttons.
 */
export function usePhotoViewer(photos: Media[], pageSizes: string) {
  const ref = useRef<HTMLDialogElement>(null);
  const [at, setAt] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const n = photos.length;
  const go = useCallback(
    (i: number, d: number) => {
      setDir(d);
      setAt(((i % n) + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(at + 1, 1);
      if (e.key === "ArrowLeft") go(at - 1, -1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [at, go]);

  const photo = at === null ? null : photos[at];
  const viewer = (
    <dialog
      ref={ref}
      aria-label="Photo viewer"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
      onClose={() => setAt(null)}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      data-lenis-prevent="true"
    >
      {photo && at !== null && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="font-scrawl text-lg">
              {at + 1} / {n}
              {photo.caption ? ` — ${photo.caption}` : ""}
            </p>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
            >
              Close
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={photo.id}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 touch-pan-y"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  const step = swipeStep(info);
                  if (step) go(at + step, step);
                }}
              >
                <ViewerImage media={photo} pageSizes={pageSizes} />
              </motion.div>
            </AnimatePresence>
            <ViewerPreload photos={photos} at={at} />
          </div>
          <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
            <button type="button" onClick={() => go(at - 1, -1)} className="h-12 rounded-full border-2 border-milk px-6 font-semibold">
              Previous
            </button>
            <button type="button" onClick={() => go(at + 1, 1)} className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa">
              Next
            </button>
          </div>
        </div>
      )}
    </dialog>
  );

  const open = (i: number) => {
    setDir(1);
    setAt(i);
    ref.current?.showModal();
  };
  return { open, viewer };
}
