// Helpers for reading the generated content layer from scripts.
import { readFileSync } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(import.meta.dirname, "../../src/content/data");

export const loadData = (file) => JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8"));

/** Every /media/… URL referenced by the content JSON (images, videos and video posters). */
export function mediaUrlsInContent() {
  const urls = new Set();
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object") Object.values(node).forEach(walk);
    else if (typeof node === "string" && node.startsWith("/media/")) urls.add(node);
  };
  ["puppies.json", "families.json"].forEach((f) => walk(loadData(f)));
  return [...urls];
}
