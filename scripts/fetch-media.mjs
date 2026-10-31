// Downloads every media file the site uses from the reference into public/media/ (same paths).
// Sources: the generated content JSON plus docs/reference/media-urls.txt (page-only media such as
// showroom photos and the chat video). Polite: 4 at a time, retries, skips files already on disk.
// Run: node scripts/fetch-media.mjs
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { REF_DIR } from "./lib/reference.mjs";
import { mediaUrlsInContent } from "./lib/content.mjs";

const ORIGIN = "https://puppy.instabizweb.com";
const PUBLIC_DIR = path.resolve(import.meta.dirname, "../public");
const CONCURRENCY = 4;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const fromPages = readFileSync(path.join(REF_DIR, "media-urls.txt"), "utf8").split("\n").filter(Boolean);
const urls = [...new Set([...mediaUrlsInContent(), ...fromPages])].filter((u) => u.startsWith("/media/")).sort();

let downloaded = 0;
let skipped = 0;
let bytes = 0;
const failed = [];

async function fetchOne(url) {
  const dest = path.join(PUBLIC_DIR, url);
  if (existsSync(dest) && statSync(dest).size > 0) {
    skipped++;
    return;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(ORIGIN + url, { headers: { "user-agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      mkdirSync(path.dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      downloaded++;
      bytes += buf.length;
      return;
    } catch (err) {
      if (attempt === 3) failed.push(`${url} (${err.message})`);
      else await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}

const queue = [...urls];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      await fetchOne(queue.shift());
      const done = downloaded + skipped + failed.length;
      if (done % 25 === 0) console.log(`… ${done}/${urls.length}`);
    }
  }),
);

console.log(
  `\n${urls.length} media files: ${downloaded} downloaded (${(bytes / 1048576).toFixed(1)} MB), ${skipped} already present, ${failed.length} failed`,
);
if (failed.length) {
  console.error(failed.join("\n"));
  process.exit(1);
}
