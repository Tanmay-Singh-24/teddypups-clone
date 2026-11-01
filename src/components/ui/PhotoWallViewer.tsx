"use client";

import { useEffect, useRef } from "react";
import type { Media } from "@/content/types";
import { usePhotoViewer } from "./PhotoViewer";

/**
 * Mounts the shared photo viewer inside a server-rendered wall: any `[data-photo-index]` button in the
 * same parent element opens the viewer at that index, so the prints themselves stay server markup.
 */
export function PhotoWallViewer({ photos, pageSizes }: { photos: Media[]; pageSizes: string }) {
  const { open, viewer } = usePhotoViewer(photos, pageSizes);
  const anchor = useRef<HTMLSpanElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    const root = anchor.current?.parentElement;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element).closest<HTMLElement>("[data-photo-index]");
      if (button && root.contains(button)) openRef.current(Number(button.dataset.photoIndex));
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <span ref={anchor} hidden />
      {viewer}
    </>
  );
}
