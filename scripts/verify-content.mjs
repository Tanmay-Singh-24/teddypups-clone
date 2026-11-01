// Checks the generated content layer against the reference capture:
// counts, media files on disk, and every generated string (titles, descriptions, form labels,
// WhatsApp messages, prev/next order, contact select) for all 42 puppy pages.
// Run: node scripts/verify-content.mjs
import { existsSync } from "node:fs";
import path from "node:path";
import { flight, jsonAfterKey, parsePage, readPage } from "./lib/reference.mjs";
import { loadData, mediaUrlsInContent } from "./lib/content.mjs";
import {
  puppyDescription,
  puppyEnquiryMessage,
  puppyFormLabel,
  puppyOptionLabel,
  puppyTitle,
  puppyWhatsAppText,
} from "../src/lib/puppy-text.ts";

const REF_ORIGIN = "https://puppy.instabizweb.com";
const PUBLIC_DIR = path.resolve(import.meta.dirname, "../public");
const failures = [];
const check = (ok, message) => ok || failures.push(message);
const expectEqual = (actual, expected, what) =>
  check(actual === expected, `${what}\n    expected: ${expected}\n    actual:   ${actual}`);

const { available, goneHome, goneStrip } = loadData("puppies.json");
const { wall, homeWall } = loadData("families.json");
const faqs = loadData("faq.json");
const { showroom } = loadData("home.json");

// Counts
expectEqual(available.length, 15, "available puppies");
expectEqual(goneHome.length, 27, "gone-home puppies");
expectEqual(goneStrip.length, 5, "gone-home strip");
expectEqual(wall.length, 64, "family photos (wall)");
expectEqual(homeWall.length, 64, "family photos (home)");
expectEqual(faqs.length, 9, "FAQs");
expectEqual(showroom.map((m) => m.kind).join(","), "image,image,image,image,video", "homepage showroom media");

// Media on disk
const media = mediaUrlsInContent();
for (const url of media) check(existsSync(path.join(PUBLIC_DIR, url)), `missing media file public${url}`);

// Per-puppy strings against each captured profile page
for (const [list, label] of [
  [available, "available"],
  [goneHome, "gone-home"],
]) {
  list.forEach((p, i) => {
    const page = `puppies__${p.slug}`;
    const root = parsePage(page);
    const payload = flight(readPage(page));
    const where = `${label} ${p.slug}`;

    expectEqual(puppyTitle(p), root.querySelector("title").text.replace(/ \| TeddyPups U\.A\.E\.$/, ""), `${where}: title`);
    expectEqual(puppyDescription(p), root.querySelector('meta[name="description"]').getAttribute("content"), `${where}: description`);

    const form = jsonAfterKey(payload, "puppy");
    expectEqual(p.id, form.id, `${where}: id`);
    expectEqual(puppyFormLabel(p), form.label, `${where}: form label`);
    expectEqual(puppyEnquiryMessage(p), root.querySelector("textarea")?.text, `${where}: enquiry message`);

    const wa = [...root.querySelectorAll('a[href^="https://wa.me/"]')]
      .map((a) => decodeURIComponent(a.getAttribute("href").split("?text=")[1]))
      .find((text) => text.includes("/puppies/"));
    const url = `${REF_ORIGIN}/puppies/${p.slug}`;
    expectEqual(puppyWhatsAppText(p, url), wa, `${where}: WhatsApp text`);

    const nav = root.querySelector('nav[aria-label="More puppies"]');
    const [prevHref, nextHref] = nav.querySelectorAll("a").map((a) => a.getAttribute("href"));
    const prev = list[(i - 1 + list.length) % list.length].slug;
    const next = list[(i + 1) % list.length].slug;
    expectEqual(`/puppies/${prev} → /puppies/${next}`, `${prevHref} → ${nextHref}`, `${where}: previous/next`);
  });
}

// Contact letter's puppy select = available puppies, in order
const options = parsePage("contact")
  .querySelectorAll('select[name="puppyId"] option')
  .filter((o) => o.getAttribute("value"))
  .map((o) => `${o.getAttribute("value")} ${o.text.trim()}`);
expectEqual(
  available.map((p) => `${p.id} ${puppyOptionLabel(p)}`).join("\n"),
  options.join("\n"),
  "contact select options",
);

console.log(
  `${available.length} available · ${goneHome.length} gone home · ${wall.length} family photos · ` +
    `${faqs.length} FAQs · ${media.length} media files checked`,
);
if (failures.length) {
  console.error(`\n✗ ${failures.length} problem(s):\n  ` + failures.join("\n  "));
  process.exit(1);
}
console.log("✓ content matches the reference");
