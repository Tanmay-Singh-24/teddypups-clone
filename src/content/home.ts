import data from "./data/home.json";
import type { Media } from "./types";

/** Showroom photos (4) and clip (1) used by the paths window and the journey phone. */
export const showroomMedia = data.showroom as Media[];
export const showroomPhotos = showroomMedia.filter((m) => m.kind === "image");
export const showroomClip = showroomMedia.find((m) => m.kind === "video")!;
