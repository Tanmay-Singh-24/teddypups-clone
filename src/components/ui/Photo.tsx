import Image from "next/image";
import type { Media } from "@/content/types";

type PhotoProps = {
  media: Media;
  sizes: string;
  /** Overrides the media's own alt text, e.g. "Max, waiting inside". */
  alt?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
};

export const focalPosition = (m: Media) => `${(m.focalX * 100).toFixed(1)}% ${(m.focalY * 100).toFixed(1)}%`;

/**
 * A content photo that fills its positioned parent: blur placeholder, dominant-colour backdrop and the
 * focal point mapped to object-position, as the reference renders its media.
 */
export function Photo({ media, sizes, alt = media.alt, loading, fetchPriority, className }: PhotoProps) {
  const position = focalPosition(media);
  return (
    <Image
      src={media.url}
      alt={alt}
      fill
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      placeholder={media.blurDataUrl ? "blur" : "empty"}
      blurDataURL={media.blurDataUrl ?? undefined}
      className={className}
      style={{ objectFit: "cover", objectPosition: position, backgroundColor: media.color, backgroundPosition: position }}
    />
  );
}
