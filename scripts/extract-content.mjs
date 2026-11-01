// Builds the typed content layer (src/content/data/*.json) from the offline reference capture.
// Run: node scripts/extract-content.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { clean, flight, jsonAfterKey, locateJsonAfterKey, parsePage, readPage } from "./lib/reference.mjs";

const OUT_DIR = path.resolve(import.meta.dirname, "../src/content/data");

const slugFromHref = (href) => href.replace(/^\/puppies\//, "").replace(/[?#].*$/, "");

// ── Available puppies: full records from the /puppies PuppyBrowser props ──────────
const puppiesFlight = flight(readPage("puppies"));
// PuppyBrowser props are { puppies: […], breeds: […], whatsappHref }; the breed list follows the puppies array.
const puppiesAt = locateJsonAfterKey(puppiesFlight, "puppies");
const available = JSON.parse(puppiesFlight.slice(puppiesAt.start, puppiesAt.end)).map(toPuppy);
const breeds = jsonAfterKey(puppiesFlight, "breeds", puppiesAt.end);

function toPuppy(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name || null,
    displayName: p.displayName,
    breed: p.breed,
    gender: p.gender,
    genderLabel: p.genderLabel,
    age: p.age,
    status: p.status,
    origin: p.origin,
    collections: p.collections,
    breeds: p.breeds,
    cover: p.cover,
    media: p.media,
  };
}

// ── Gone-home puppies: order + ticket details from /gone-home, the rest from each profile ──
const goneRoot = parsePage("gone-home");
const tickets = goneRoot.querySelectorAll("a.tp-ticket__link").map((a) => {
  const img = a.querySelector("img");
  const from = a.querySelector(".tp-ticket__route")?.querySelector("span, b, strong");
  return {
    slug: slugFromHref(a.getAttribute("href")),
    ticketFrom: clean(from?.text ?? ""),
    ticketMeta: clean(a.querySelector(".tp-ticket__meta")?.text ?? ""),
    imageAlt: img?.getAttribute("alt") ?? "",
    imageUrl: decodeURIComponent((img?.getAttribute("src") ?? "").match(/url=([^&]+)/)?.[1] ?? ""),
  };
});

const ORIGINS = {
  "In Dubai": { slug: "local", name: "In Dubai" },
  "Imported for you": { slug: "imported", name: "Imported" },
};
const GENDERS = { Boy: "male", Girl: "female", "Boy & girl": "male-female" };

function profileFacts(root) {
  const facts = {};
  for (const dt of root.querySelectorAll("dt")) facts[clean(dt.text)] = clean(dt.nextElementSibling?.text ?? "");
  return facts;
}

function breedsFor(breedText) {
  const lower = breedText.toLowerCase();
  return breeds.filter((b) => lower.includes(b.name.toLowerCase()) || lower.includes(b.slug.replace("-", " ")));
}

const goneHome = tickets.map((t) => {
  const page = `puppies__${t.slug}`;
  const html = readPage(page);
  const root = parsePage(page);
  const payload = flight(html);
  const facts = profileFacts(root);
  const title = clean(root.querySelector("title").text).replace(/ \| TeddyPups U\.A\.E\.$/, "");
  const named = title.match(/^(.+?), (.+) puppy$/);
  const form = jsonAfterKey(payload, "puppy");
  const media = jsonAfterKey(payload, "media");
  const breed = facts["Breed"];
  return {
    id: form.id,
    slug: t.slug,
    name: named ? named[1] : null,
    displayName: clean(root.querySelector("h1").text),
    breed,
    gender: GENDERS[facts["Boy or girl"]],
    genderLabel: facts["Boy or girl"],
    age: facts["Age"],
    status: "gone-home",
    origin: ORIGINS[facts["Where"]],
    collections: [],
    breeds: breedsFor(breed),
    cover: media.find((m) => m.url === t.imageUrl) ?? media[0],
    media,
    ticket: { from: t.ticketFrom, imageUrl: t.imageUrl, imageAlt: t.imageAlt },
  };
});

// ── Lists that only exist as ordering on other pages ───────────────────────────────
const goneStrip = parsePage("puppies")
  .querySelectorAll(".tp-gone-strip a.tp-sketch")
  .map((a) => slugFromHref(a.getAttribute("href")));

// ── Families (two orderings of the same 64 photos) and FAQs ────────────────────────
const familiesWall = jsonAfterKey(flight(readPage("happy-families")), "photos");
const homeFlight = flight(readPage("home"));
const homeWall = jsonAfterKey(homeFlight, "photos");
// The showroom photos and clip shared by the paths window and the journey phone (4 photos + 1 video).
const showroom = jsonAfterKey(homeFlight, "media", homeFlight.indexOf('"key":"journey"'));
const faqs = jsonAfterKey(flight(readPage("faq")), "faqs").map(({ id, question, answer }) => ({ id, question, answer }));

// ── Write ─────────────────────────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });
const write = (file, data) => {
  writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote src/content/data/${file}`);
};
write("puppies.json", { available, goneHome, goneStrip, breeds });
write("families.json", { wall: familiesWall, homeWall });
write("faq.json", faqs);
write("home.json", { showroom });

console.log(
  `\n${available.length} available · ${goneHome.length} gone home · ${goneStrip.length} in strip · ` +
    `${breeds.length} breeds · ${familiesWall.length}/${homeWall.length} family photos · ${faqs.length} FAQs · ` +
    `${showroom.length} showroom media`,
);
