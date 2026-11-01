"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { Paw } from "@/components/art/Paw";
import { usePhotoViewer } from "@/components/ui/PhotoViewer";
import type { Media } from "@/content/types";

const SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw";

/** Tilts repeat every 8 prints, tape colours every 5, tape placement every 8. */
const TILTS = ["-2.2deg", "1.6deg", "-0.9deg", "2.4deg", "-1.5deg", "0.8deg", "-2.6deg", "1.2deg"];
const TAPES = ["#f6d79a", "#f9cdbf", "#cfe5f6", "#f6d79a", "#e9dcc4"];
const AT = ["center", "left", "right", "corners", "center", "right", "left", "center"] as const;

function TapeStrips({ at }: { at: (typeof AT)[number] }) {
  if (at === "corners")
    return (
      <>
        <span aria-hidden="true" className="tp-tape tp-tape--tl" />
        <span aria-hidden="true" className="tp-tape tp-tape--tr" />
      </>
    );
  return <span aria-hidden="true" className={`tp-tape tp-tape--${at}`} />;
}

/** The /happy-families wall: 64 taped prints in columns, each opening the shared photo viewer. */
export function FamilyWall({ photos }: { photos: Media[] }) {
  const { open, viewer } = usePhotoViewer(photos, SIZES);
  const n = photos.length;
  return (
    <div>
      <ul className="tp-wall" aria-label="Photos from TeddyPups families">
        {photos.map((photo, i) => (
          <li key={photo.id} className="tp-wall__item" data-reveal="true" style={{ "--d": `${(i % 4) * 60}ms` } as CSSProperties}>
            <button type="button" className="tp-wall__print" aria-label={`Open photo ${i + 1} of ${n}`} onClick={() => open(i)}>
              <span
                className="tp-polaroid"
                style={{ "--tilt": TILTS[i % 8], "--tape": TAPES[i % 5], "--i": i } as CSSProperties}
              >
                <TapeStrips at={AT[i % 8]} />
                <span className="tp-polaroid__photo">
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes={SIZES}
                    loading={i < 2 ? "eager" : "lazy"}
                    fetchPriority={i < 2 ? "high" : undefined}
                    placeholder={photo.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={photo.blurDataUrl ?? undefined}
                    style={{ width: "100%", height: "auto", backgroundColor: photo.color }}
                  />
                </span>
                <span className="tp-polaroid__caption font-scrawl" />
              </span>
              <Paw className="tp-wall__paw" />
            </button>
          </li>
        ))}
      </ul>
      {viewer}
    </div>
  );
}
