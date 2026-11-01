# Handover: state of the build

Read this first in every new session, then `CLAUDE.md` and the relevant `docs/PLAN.md` sections.
Update it at the end of each phase.

**Last updated:** Sun 1 Nov 2026, after P3 (homepage scenes session).

## Links
- Live: **https://teddypups-tanmay.vercel.app** (Vercel team `tanmay-164a`, project `teddypups-clone`). Every push to `main` deploys.
- Repo: https://github.com/Tanmay-Singh-24/teddypups-clone (public)
- Reference: https://puppy.instabizweb.com. The offline capture is in `docs/reference/`, which is gitignored and exists only on this Mac.
- ⚠️ `teddypups-clone.vercel.app` is **someone else's** project. Never use or submit it.

## Done
| Phase | What exists |
|---|---|
| P0 | Next.js **16.4.3** with Tailwind v4 and React 19.3. Fonts are set up in `src/app/layout.tsx` (Fraunces with SOFT/WONK/opsz axes, Figtree, Shantell Sans with BNCE/INFM axes) and verified identical to the reference: the h1 measures 99px/800/-2.475px. Tokens, base styles, `.btn*`, `.chip`, `.link-ink`, `.ink`, and `@utility` `font-plush`/`font-plush-text`/`font-scrawl`/`text-giant`/`text-huge`/`text-big`/`gutter` are in `src/app/globals.css`. Also: metadata (noindex), icons, robots, a sitemap of all 49 URLs, and production security headers (`next.config.ts`). |
| P1 | `src/content/data/*.json` holds 15 available + 27 gone-home puppies, 8 breeds, a 5-slug gone strip, 64 family photos in two orderings, and 9 FAQs. Typed accessors live in `src/content/{puppies,families,site,types}.ts`. Wording rules (title, description, form label, option label, enquiry message, WhatsApp text) are in `src/lib/puppy-text.ts`, and `src/lib/whatsapp.ts` builds the links. All 205 media files are in `public/media/` with the same paths as the reference. 129 SVGs are in `docs/reference/svg/` (see `INDEX.md` there), including 13 mascot poses (`pup-buddy--child*.svg`). |
| P2 | **Shell**, mounted in `src/app/layout.tsx`: `src/components/layout/` has `Header` (server) + `HeaderBehavior` (scrolled > 8px, hidden when scrolling down past 220px, shown on focus) + `NavLink` (active = exact path, or prefix for non-home) + `MobileMenu` (`<dialog>`, animated close, closes on `tp:navigate`), `Footer`, `BottomBar`, `SkipLink`. `src/components/motion/` has `LenisProvider` (fine pointer + motion allowed only; same-page hash links; `getLenis()`), `useReducedMotion`, `PawTrail` (cursor prints canvas) and `PupStop`. **Art** in `src/components/art/`: `Paw` (+ `PAW_PATH`), `Hem`, `FooterHill`, `Twinkles` (pass a star list + base size; reuse for the night scene), `Moon`, `BasketBack/Front`, `PupBuddy`, and **Teddy**: `teddy/rig.ts` (geometry, 12 poses, `frame(pose, motion)` → part transforms) + `teddy/Teddy.tsx` (static SVG). The rig reproduces all 13 reference buddies exactly. **Pages:** `not-found.tsx` (LOST poster, `components/pages/LostPoster.tsx`), `error.tsx` (Teddy sits, "oops, a tangled lead"), `global-error.tsx` (inline styles), and **stubs** for every route (real h1, lede and metadata via `components/pages/PageStub.tsx`; `/puppies` and `/gone-home` list profile links; `/how-it-works` has an empty `#delivery` target). CSS: `src/styles/components/{lenis,header,footer,pup,poster}.css`, unlayered. Verified: element boxes and styles identical to the live site at 375/768/1024/1440; server markup of header, footer, basket and bar matches. |
| P3 | **Homepage** (`src/app/page.tsx`): the 8 scenes in `src/components/home/` (`Hero`, `MeetHall` + `Door`, `Paths`, `JourneyChat` + `Clip`, `Passport`, `Dusk`, `Night`, `HomeHouse`), each wrapped by `Scene` (`data-section`, `data-pup-scene`, `data-tone`, sky vars). Shared: `components/ui/Photo` (fill image with blur, focal point and colour backdrop), `components/art/Quilt`. CSS: `src/styles/components/{hero,meet,paths,chat,passport,polaroid,dusk,night,house}.css`. Content: `src/content/home.ts` (showroom photos + clip, extracted into `data/home.json`). **Verified:** every section height and every measured component box equals the live site at 375×812, 768×1024, 1024×768 and 1440×900 (document height 12,823 at 375), except Meet at ≥1024, which the reference pins (P6a; see below). No console errors; production build passes under the CSP and the clip plays. |

## Not done yet
- **P4:** puppies pages (replace the `/puppies`, `/puppies/[slug]` and `/gone-home` stubs)
- **P5:** other pages and forms (replace the `/happy-families`, `/how-it-works`, `/faq` and `/contact` stubs)
- **P6a:** scroll motion. P3 left the homepage in its static end state with every hook in place (see "Homepage hooks" below).
- **P6b:** curtain and pup actor. Also the reference's *live* buddies (click tricks, petting, gaze; `data-live`), which P2 left static.
- **P7:** tests and CI
- **P8:** README, Loom, submission

## Commands
- `npm run dev`. Or use the preview config **`teddypups`** in `~/VSCode/.claude/launch.json` (port 3100).
- If another chat's `next dev` already holds this folder, a second one refuses to start, and the old one may serve stale CSS. Either stop it, or `npm run build` and use the preview config **`teddypups-prod`** (`next start`, port 3102); restart it after each build.
- `npm run lint`, `npm run typecheck`, `npm run build`. Run all three before every commit; all pass today.
- `npm run content:extract`, `npm run content:media`, `npm run content:svgs`, `npm run content:verify`. Verify checks every generated string against all 42 reference profiles; keep it green.

## Things learned the hard way (read before coding)
- **Next 16.4 defaults:** `cacheComponents` and `partialPrefetching` are on.
  - `useSearchParams` must sit inside `<Suspense>`.
  - Dynamic routes need a non-empty `generateStaticParams`.
  - **`export const dynamicParams` fails the build.** Unknown slugs render on request, so the page must call `notFound()` itself. `/puppies/[slug]` does; its `generateMetadata` returns "Puppy not found". On the first hit of an unknown slug our response is **200** (the shell streams before `notFound()`), later hits 404. The reference returns 404 with the title in `<head>`. P4 should fix this when it rebuilds the page (likely: read params inside `<Suspense>` as the migration guide describes, then check the status).
  - Prerendered server code can't call `new Date()`. The footer year uses a `"use cache"` component with `cacheLife("days")`, so every route revalidates daily (the reference sends `s-maxage=86400`).
  - `next typegen` regenerates the `PageProps<"/route">` / `LayoutProps` types after adding routes; `npm run typecheck` fails on new routes until it (or dev/build) has run.
  - Navigation keeps recently visited routes **mounted but hidden** (React `<Activity>`), and effects re-run when a route hides or reappears. Matters for Lenis, dialogs, the curtain and the pup director.
  - Read `node_modules/next/dist/docs/` before using an API you're unsure of. `AGENTS.md` (imported by `CLAUDE.md`) says the same.
- `package.json` has `"type": "module"`. Scripts are ESM, and `scripts/verify-content.mjs` imports `src/lib/puppy-text.ts` directly through Node's type stripping. Keep that file free of runtime `@/` imports; type-only imports are fine.
- ESLint ignores `docs/reference/**`, which holds minified third-party code.
- **Puppy filters**, read from the reference JS (`docs/reference/js/05_bi2sw5g1xo.js`, `PuppyBrowser`):
  - URL params: `origin` (`local` | `imported`), `breed` (breed slug), `gender` (`male` | `female`), `collection` (`korean-teacup`).
  - A puppy with `gender: "male-female"` matches both Boys and Girls.
  - Clicking an active chip clears it. "Everywhere" clears `origin` and `collection`.
  - The "In Dubai" chip only renders when some available puppy is local, and none are today. "Korean Teacup" only renders when some puppy has that collection.
  - Breed chips only list breeds that have available puppies.
  - Updates go through `window.history.replaceState`, not the router.
  - Count text is "15 puppies looking for a home" or "N puppies match".
- **Gone-home strip:** 5 unique puppies. The server HTML holds 10 small cards, probably the list duplicated for a looping marquee. Confirm visually.
- Form success copy, the same for both forms: "Message received!" / "Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp." **Never submit forms on the live reference**, because it would message a real business.
- `NEXT_PUBLIC_SITE_URL` is set on Vercel (Production). Locally it falls back to `http://localhost:3000`.
- **Shell contracts for later phases:**
  - Dispatch `window.dispatchEvent(new Event("tp:navigate"))` when the curtain starts a navigation: the menu closes and Lenis resyncs.
  - Lenis skips `dialog` and `[data-lenis-prevent]`, and pauses while `<html>` has `overflow-y: hidden` (the curtain's `tp-hold-still`).
  - `<PupStop pose facing act behind lane label>` renders the static anchor; under 768px only stops with `lane` stay visible (`pup.css`). `html[data-pup]` hides static buddies once an actor runs.
  - The reference's not-found title for unknown paths is the default home title; only puppy pages say "Puppy not found".
  - The footer email is a plain `mailto:` (the reference's Cloudflare obfuscation is skipped on purpose).
- **Component CSS is unlayered** (as in the reference), so it beats Tailwind utilities on the same element. Keep it that way so values cross-check 1:1.
- **A selector's rules can be scattered** across `main.pretty.css`: `.tp-flight > svg` sits near line 5042 and `.tp-flight { width: 86% }` (under 640px) near line 6981, far from the main block. Grep the whole file before assuming you've seen every rule.
- When measuring the reference in a background tab, its load animations may not have run yet (stuck at the first frame). Check `el.getAnimations()` or re-measure before "fixing" a difference.
- Measuring beats eyeballing: compare `getBoundingClientRect()` and computed styles of the same selectors in both tabs at each width. The reference plays an intro curtain on first load; wait about 2s before measuring.

## Homepage hooks for P6 (left by P3)
Everything renders in its **final state** on the server, which is also what phones, reduced motion and no-JS show. P6 resets and animates it. The keyframes already exist in the scene CSS; the `@supports (animation-timeline: view())` wiring does not.
- **Meet hallway** (`MeetHall.tsx`, `meet.css`). Read from the reference JS (`docs/reference/js/1wa3jfz4v5w2v.js`, `Meet`):
  - It pins only at **≥1024px** and motion allowed (the P6a prompt says 768; the reference says 1024). Below that, or with reduced motion, it stays the grid of open doors.
  - When pinned: `data-pinned` on `section.tp-meet`; `[data-pin-range]` gets `height: calc(100vh + round(0.8 × (track.scrollWidth − innerWidth))px)` and `--pinned: 1`; `.tp-meet__hall` gets `--door-w = max(128, min(256, 0.15 × innerWidth, (stage.clientHeight − (head.offsetTop + head.offsetHeight) − floorHeight − tallestPlate − 40) / 1.3))` px. Recompute on resize and with a ResizeObserver on the track and stage.
  - Track `x`: Motion `useScroll({ target: pinRange, offset: ["start start", "end end"] })` → `useSpring({ stiffness: 170, damping: 32, mass: 0.35 })` → map [0, 1] to [0, −overflow]. On every change set `--floor-x` on the hall, and set each door's `data-open` to `door.offsetLeft + x < 0.36 × innerWidth` (cue the pup to look at a door as it opens).
  - Checked by hand: with `--door-w: 216px` and `calc(3226px + 100vh)` at 1440×900, our section is exactly 4126px and the stage, head, floor, Teddy and doors land where the reference's do.
  - The doors' grid open/close on scroll: `.tp-door__leaf { animation: tp-door-open linear both; animation-timeline: view(); animation-range: entry 55% cover 48% }`, `animation: none` when pinned and under reduced motion.
- **Hero lineup:** `.tp-lineup__pup[data-state="duck" | "pop"]`, `.tp-lineup__ghost[data-tag="show"]`, the understudy in `.tp-lineup__wings[data-for="6"]` (the 7th available puppy), and `.tp-hero[data-here="false"]` sinks the lineup when scrolled away.
- **Journey chat:** the server shows steps 1–2 `data-done`, step 3 `data-active`, all three `.tp-msg-group[data-show="true"]`, `.tp-typing[data-show="false"]`. The reference only replays it at ≥1024px with motion (`reduced || !desktop` → static).
- **Passport:** `.tp-stamp` uses `tp-stamp-in` with `animation-range: entry calc(55% + var(--i) * 9%) cover calc(42% + var(--i) * 6%)`; `.tp-horizon__sun` uses `tp-sun-set` with `entry exit 30%`. Both `none` under reduced motion.
- **Dusk photo wall:** each `li` carries `data-reveal` and `--d` (stagger); P6a adds `data-armed`, then `data-revealed` (CSS for both states is in `dusk.css`). The 8 buttons carry `data-photo-index` (index into `homeFamilyPhotos`); **P5 must mount the shared photo viewer** in the dusk scene (reference: `<dialog aria-label="Photo viewer" data-lenis-prevent>`) and wire them. They do nothing yet.
- **House:** the door is open by default; `html[data-pup]` shuts it until `.tp-home[data-visited="true"]` (P6b). Without the actor: `tp-house-open`, `animation-range: entry 80% cover 52%`.
- **Pup stops** (all static buddies): hero `peek` + `peekaboo`, `behind`, `lane`; meet, paths, chat, passport, dusk `sit`; night `sit` + `tilt`; home `bow`. The reference's server HTML has the Meet stop as `sit` (PLAN §5 says walk/treadmill; the track carries `data-treadmill`). Phone lane-mode rules are mirrored (`.tp-chat__side`, `.tp-book__page--left` padding, `.tp-night__pup` hidden).

## Conventions
- Small conventional commits, **no Co-Authored-By trailer**, push to `main` when green.
- Log every prompt verbatim in `docs/PROMPTS.md`, and update this file when a phase finishes.
- Use component CSS in `src/styles/components/<name>.css`, imported from `globals.css`. Keep the `tp-*` class names so values cross-check against `docs/reference/css/main.pretty.css`.
