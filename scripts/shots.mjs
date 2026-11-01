// Full-page screenshots of the reference and our build at 375 and 1440, side by side in docs/shots/,
// plus a rough difference score per page so the fidelity pass knows where to look.
//
//   node scripts/shots.mjs                 main pages, both sites
//   node scripts/shots.mjs --all           every sitemap URL (49 pages)
//   node scripts/shots.mjs --only=ours     one site (ours | ref)
//   node scripts/shots.mjs /faq /contact   just these paths
//
// Ours is read from BASE (default http://localhost:3200, i.e. `npm run build && npm start -- -p 3200`).
// It only loads and scrolls pages; it never clicks or submits anything on the reference.
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const SITES = { ref: "https://puppy.instabizweb.com", ours: process.env.BASE ?? "http://localhost:3200" };
const WIDTHS = [
  { width: 375, height: 812 },
  { width: 1440, height: 900 },
];
const MAIN = [
  "/",
  "/puppies",
  "/puppies/maltipoo-max-male",
  "/puppies/blue-marle-pomeranian",
  "/gone-home",
  "/happy-families",
  "/how-it-works",
  "/faq",
  "/contact",
  "/no-such-page",
];

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7);
const sites = Object.entries(SITES).filter(([name]) => !only || name === only);
let paths = args.filter((a) => a.startsWith("/"));
if (!paths.length && args.includes("--all")) {
  const xml = await (await fetch(`${SITES.ours}/sitemap.xml`)).text();
  paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}
if (!paths.length) paths = MAIN;

const slug = (path) => (path === "/" ? "home" : path.slice(1).replaceAll("/", "__"));
const OUT = new URL("../docs/shots/", import.meta.url);

/** Lets lazy images and scroll reveals play out, then returns to the top. */
async function settle(page) {
  await page.waitForTimeout(2500); // the intro curtain
  // The reference streams its profile pages; finish any pending reveal.
  await page.evaluate(() => {
    try {
      if (typeof $RV === "function" && Array.isArray($RB)) {
        $RV($RB);
        $RB.length = 0;
      }
    } catch {}
  });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch();
const shots = {};
for (const size of WIDTHS) {
  for (const [name, base] of sites) {
    const dir = new URL(`${name}/${size.width}/`, OUT);
    await mkdir(dir, { recursive: true });
    const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const path of paths) {
      try {
        await page.goto(base + path, { waitUntil: "networkidle", timeout: 45_000 });
        await settle(page);
        const file = new URL(`${slug(path)}.jpg`, dir);
        const image = await page.screenshot({ fullPage: true, type: "jpeg", quality: 70 });
        await writeFile(file, image);
        (shots[`${size.width} ${path}`] ??= {})[name] = image.toString("base64");
        console.log(`✓ ${name} ${size.width} ${path}`);
      } catch (err) {
        console.log(`✗ ${name} ${size.width} ${path}: ${err.message.split("\n")[0]}`);
      }
    }
    await context.close();
  }
}

// Difference score: the share of pixels (top-aligned, same width) that differ noticeably,
// and the two page heights. Moving parts (the lineup, live buddies, twinkles) always add a little.
if (sites.length === 2) {
  const page = await browser.newPage();
  console.log("\nwidth  path                                   diff   heights (ref / ours)");
  for (const [key, pair] of Object.entries(shots)) {
    if (!pair.ref || !pair.ours) continue;
    const [diff, refH, oursH] = await page.evaluate(
      async ([a, b]) => {
        const load = (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = `data:image/jpeg;base64,${src}`;
          });
        const [x, y] = await Promise.all([load(a), load(b)]);
        const w = Math.min(x.width, y.width);
        const h = Math.min(x.height, y.height);
        const pixels = (img) => {
          const c = new OffscreenCanvas(w, h);
          const g = c.getContext("2d");
          g.drawImage(img, 0, 0);
          return g.getImageData(0, 0, w, h).data;
        };
        const p = pixels(x);
        const q = pixels(y);
        let off = 0;
        for (let i = 0; i < p.length; i += 4)
          if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 60) off++;
        return [off / (w * h), x.height, y.height];
      },
      [pair.ref, pair.ours],
    );
    const [width, path] = key.split(" ");
    console.log(`${width.padEnd(6)} ${path.padEnd(38)} ${(diff * 100).toFixed(1).padStart(5)}%  ${refH} / ${oursH}`);
  }
}
await browser.close();
