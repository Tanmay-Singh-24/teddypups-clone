# Prompt log

The assignment asks for the **exact prompts** given to AI tools. Each prompt is recorded here verbatim, in order, with the tool, the model and the time.

- **Planning:** Claude Code (desktop app), Claude Opus, effort **max**.
- **Building:** Claude Code, Claude Opus, effort **high**. One fresh session per phase, started in `~/VSCode/teddypups-clone`.
- Prompts P0–P8 were drafted during the planning session (#1) and pasted verbatim.
- Follow-up messages you send inside a phase session go under that phase, also verbatim.
- Full transcripts stay in Claude Code's history and can be exported for the Loom.

---

## #1 Planning: Sun 1 Nov 2026, ~00:20 IST, Claude Code, Opus (max)

> *[Pasted first: the full assignment email from Insta Biz Web (Sat 31 Oct 2026, 11:18). Its requirements are summarised in PLAN.md §1. The email itself is left out of this public repo.]*
>
> i am working on this assignment this is very important for me just plan out things im using opus on max for this just to plan and then ill be using opus high for the coding work
> get started with the work

**Output:** reference recon (49 pages, CSS, fonts, JS, behaviours, screenshots) → `docs/PLAN.md`, `docs/CLAUDE.root.md`, this file, and `docs/reference/` (local only).

## #2 Build kick-off: Sun 1 Nov 2026, ~01:10 IST, same session (Claude Code, Opus)

> get started with the build

**Output:** phases **P0 and P1** done in this same session instead of fresh ones:
- **P0:** Next.js 16.4.3 scaffold, fonts with variation axes (computed styles match the reference exactly), design tokens, metadata (noindex), robots and sitemap, production security headers.
- **P1:** content extracted from the reference payloads (15 + 27 puppies, 64 photos, 9 FAQs), 205 media files downloaded (69 MB), every generated string verified against all 42 profile pages, and 129 SVGs dumped to `docs/reference/svg/`.

The next phase prompt to paste is **P2**. The repo isn't on GitHub yet: creating the public repo was left for your go-ahead.

---

## Phase prompts (paste one per fresh session)

### P0: scaffold and skeleton deploy · done in #2 (GitHub push pending)

```text
I'm building a faithful clone of https://puppy.instabizweb.com ("TeddyPups U.A.E.") for a 48-hour hiring assignment from Insta Biz Web. The repo folder is ~/VSCode/teddypups-clone. Before anything else, read docs/PLAN.md end to end and docs/CLAUDE.root.md — they are the spec and the rules. The reference site is captured offline in docs/reference/ (every page's HTML, the compiled CSS pretty-printed, JS chunks, outlines, screenshots).

Do phase P0 (PLAN.md §9):
1. Scaffold Next.js (latest 16.x, App Router, TypeScript, Tailwind CSS v4, ESLint, src/ directory, npm) in this folder without touching docs/. If create-next-app refuses because the folder isn't empty, scaffold in a temp folder and move the files in.
2. Move docs/CLAUDE.root.md to ./CLAUDE.md.
3. Install lenis, motion and zod, and @playwright/test as a dev dependency.
4. Set up the three fonts with next/font/google exactly as §2.3 says (Fraunces with the SOFT, WONK and opsz axes; Figtree; Shantell Sans with the BNCE and INFM axes) and all the design tokens, base styles and shared utilities from §2.3 in globals.css.
5. Root layout and metadata per §2.5 (title template, description, Open Graph, theme colour, the two icons downloaded from the reference, noindex), placeholder robots.ts and sitemap.ts, and the production security headers in next.config.ts.
6. A temporary home page with the hero heading "Premium teacup / puppies in Dubai" using .font-plush and .tp-hero__title sizing, so I can compare the type with docs/reference/screens/02-home-hero-1440.jpg. Check in the browser that the computed font-variation-settings are right.
7. Create the public GitHub repo Tanmay-Singh-24/teddypups-clone with gh, commit, and push main.

Then stop and give me the exact clicks to import the repo into Vercel so I get a live URL.
```

**Follow-ups:**

### P1: content, media, artwork · done in #2

```text
Read CLAUDE.md and docs/PLAN.md (§4 and §9 P1). Do phase P1:
- scripts/extract-content.mjs: build typed content in src/content/ (puppies, families, faq, site + types.ts) from docs/reference/html/*.html. The structured data is in the inline Next.js flight payload (self.__next_f.push([1,"..."]) chunks, JSON-decoded and concatenated) — e.g. "media":[...] arrays and the puppy UUIDs — and the visible fields come from the rendered HTML. Keep the reference's ordering for /puppies, /gone-home and prev/next.
- scripts/fetch-media.mjs: download every media file the content references (cross-check docs/reference/media-urls.txt) into public/media/ with the same paths, plus /brand/logo.png. Concurrency 4, retries, skip existing files, print totals.
- scripts/extract-svgs.mjs: dump each distinct inline SVG from the reference HTML to docs/reference/svg/, named after its nearest tp-* class, so we can turn the artwork into components.
- scripts/verify-content.mjs: assert 42 puppies (15 available, 27 gone home), 64 family photos and 9 FAQs, and that every referenced media file exists on disk.
Run everything, show me the verify output, then commit.
```

**Follow-ups:**

### P2: global shell · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§2.4, §6.8 and §9 P2). Build the global shell so it matches the reference at 375, 768, 1024 and 1440 px: the header (desktop nav with the active paw, WhatsApp pill, scrolled/hidden states, the transparent home variant vs inner pages with the scalloped hem), the mobile menu <dialog>, the footer (night sky, basket mascot, Explore and Say hello columns, socials, bottom row), the mobile bottom bar, the skip link, a Lenis smooth-scroll provider, the "LOST" not-found page, the global error page, and stub pages for every route in §2.2 so every link works. Turn the SVG artwork you need into components in src/components/art/. Compare against docs/reference/screens/ and the live site in the browser side by side, fix differences, then commit.
```

**Follow-ups:**

### P3: homepage, static layout · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§5 and §9 P3). Build the 8 homepage scenes (hero → home) with the exact copy, artwork, sky gradients and quilt bands, fully responsive at 375/768/1024/1440 — without the scroll choreography yet (that's P6), but with every hook P6 needs: the .pup-stop anchors with their pose data and static buddy mascots, doors/stamps/house in their initial and final states, the sticky stage markup for the Meet hallway. On mobile the Meet section is the 2-column grid of open doors. Match the section heights in §5 within about 10%. Check every scene side by side with the live reference and docs/reference/screens/, then commit (one commit per scene or two is fine).
```

**Follow-ups:**

### P4: puppies pages · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§6.1–6.3, §7 and §9 P4). First click every filter chip on the live /puppies page and note the exact URL parameter names, values, count texts and the empty state (open /puppies?origin=local). Then build:
- /puppies: sketchbook header, filter panel synced to the URL, count line, sketch cards with Motion layout animation, the gone-home strip.
- /puppies/[slug] for all 42 puppies with generateStaticParams and dynamicParams = false: both variants (available and gone home), the gallery with the full-screen viewer (keyboard, swipe, video), the facts card, checklist, way-home steps, the enquiry letter form UI (the server action comes in P5), prev/next, metadata and BreadcrumbList JSON-LD.
- /gone-home with the 27 tickets.
Compare with the reference at 375 and 1440, then commit.
```

**Follow-ups:**

### P5: other pages and forms · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§6.4–6.7, §7 and §9 P5). Build /happy-families (wall of 64 + the shared photo viewer), /how-it-works (anchor chips, the In Dubai / Imported switch with both journeys, promise stamps, delivery, why, board), /faq (cork-board accordion, search with <mark> highlighting and auto-expand, counts, empty state, FAQPage JSON-LD) and /contact (the fill-in-the-blanks letter form with the puppy select, contact column, shopfront with the Google Maps link). Then wire both forms (contact letter + puppy enquiry) to one Server Action as §7 describes: zod validation, honeypot, inline field errors, pending state, the reference's success states and the post-box animation, email through Resend only when RESEND_API_KEY is set (otherwise log). Never submit forms on the live reference site. Commit.
```

**Follow-ups:**

### P6a: scroll motion · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§8.1, §8.4 and §9 P6a). Add the scroll choreography: header hide/show, the hero lineup pop-up cycling with name tags and the "hm?" bubble, the pinned Meet hallway (≥768 px; track translateX from scroll progress, doors opening as they reach the pup, moving floor), the journey phone sequence (active step, typing dots, messages per step, video play), passport stamps and the sunset, night twinkles, the house door opening, footer basket idles, and the micro-interactions checklist in §8.4. Use the keyframes and timings in docs/reference/css/main.pretty.css as the spec. Everything must degrade cleanly with prefers-reduced-motion and in browsers without animation-timeline (test Safari via the fallback path). Commit.
```

**Follow-ups:**

### P6b: page curtain and pup actor · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§8.2, §8.3, §9 P6b and §10). Build (1) the page-transition curtain — the quilt rises, the runner dog crosses with paw prints and "every puppy is family", and it lifts once the new route has rendered — used by every internal link; and (2) the pup actor: one fixed-layer mascot that travels between the homepage .pup-stop anchors as the user scrolls, with walk/sit/peek/bow/treadmill poses, facing, blink/ear/tail idles, speech bubbles and paw prints stamped along its path, plus the "lane" mode under 768 px. Read docs/reference/js/_PUP-ENGINE.js only to understand the behaviour and timings, and write our own typed implementation. Timebox the pup to about 4 hours: if it isn't convincing by then, stop, tell me, and ship the static mascots with idle animations (cut line 1). Commit.
```

**Follow-ups:**

### P7: QA and tests · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§11 and §9 P7). Add Playwright e2e tests in e2e/ for everything listed in §11, an npm script test:e2e, and a GitHub Actions workflow (install, lint, typecheck, build, Playwright chromium; upload the report on failure). Add scripts/shots.mjs to capture every page at 375 and 1440 for both the reference and our build into docs/shots/. Then do a fidelity pass page by page using those shots and fix every visible difference, run Lighthouse (desktop + mobile) and fix accessibility/performance issues, and check reduced motion and keyboard-only navigation. Commit and push; make sure CI is green.
```

**Follow-ups:**

### P8: ship · sent: ☐ ____

```text
Read CLAUDE.md and docs/PLAN.md (§12 and §13). Confirm the production deployment on Vercel is green and click through every route, a filter, a gallery, the FAQ search and both forms on the live URL in the browser. Write README.md as §13 describes (live URL, screenshots, stack, structure, how to run, how it was built, decisions and challenges, testing, deployment, AI usage linking docs/PROMPTS.md, credits/disclaimer). Make sure docs/PROMPTS.md has every prompt I sent. Then give me a short checklist for recording the Loom following §13's outline, with the files and URLs to have open, and draft the submission email with the exact subject line.
```

**Follow-ups:**
