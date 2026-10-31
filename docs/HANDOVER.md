# Handover: state of the build

Read this first in every new session, then `CLAUDE.md` and the relevant `docs/PLAN.md` sections.
Update it at the end of each phase.

**Last updated:** Sun 1 Nov 2026, after P2 (global shell session).

## Links
- Live: **https://teddypups-tanmay.vercel.app** (Vercel team `tanmay-164a`, project `teddypups-clone`). Every push to `main` deploys.
- Repo: https://github.com/Tanmay-Singh-24/teddypups-clone (public)
- Reference: https://puppy.instabizweb.com. The offline capture is in `docs/reference/`, which is gitignored and exists only on this Mac.
- ⚠️ `teddypups-clone.vercel.app` is **someone else's** project. Never use or submit it.

## Done
| Phase | What exists |
|---|---|
| P0 | Next.js **16.4.3** with Tailwind v4 and React 19.3. Fonts are set up in `src/app/layout.tsx` (Fraunces with SOFT/WONK/opsz axes, Figtree, Shantell Sans with BNCE/INFM axes) and verified identical to the reference: the h1 measures 99px/800/-2.475px. Tokens, base styles, `.btn*`, `.chip`, `.link-ink`, `.ink`, and `@utility` `font-plush`/`font-plush-text`/`font-scrawl`/`text-giant`/`text-huge`/`text-big`/`gutter` are in `src/app/globals.css`. Also: metadata (noindex), icons, robots, a sitemap of all 49 URLs, and production security headers (`next.config.ts`). `src/app/page.tsx` is a **temporary** hero. |
| P1 | `src/content/data/*.json` holds 15 available + 27 gone-home puppies, 8 breeds, a 5-slug gone strip, 64 family photos in two orderings, and 9 FAQs. Typed accessors live in `src/content/{puppies,families,site,types}.ts`. Wording rules (title, description, form label, option label, enquiry message, WhatsApp text) are in `src/lib/puppy-text.ts`, and `src/lib/whatsapp.ts` builds the links. All 205 media files are in `public/media/` with the same paths as the reference. 129 SVGs are in `docs/reference/svg/` (see `INDEX.md` there), including 13 mascot poses (`pup-buddy--child*.svg`). |
| P2 | **Shell**, mounted in `src/app/layout.tsx`: `src/components/layout/` has `Header` (server) + `HeaderBehavior` (scrolled > 8px, hidden when scrolling down past 220px, shown on focus) + `NavLink` (active = exact path, or prefix for non-home) + `MobileMenu` (`<dialog>`, animated close, closes on `tp:navigate`), `Footer`, `BottomBar`, `SkipLink`. `src/components/motion/` has `LenisProvider` (fine pointer + motion allowed only; same-page hash links; `getLenis()`), `useReducedMotion`, `PawTrail` (cursor prints canvas) and `PupStop`. **Art** in `src/components/art/`: `Paw` (+ `PAW_PATH`), `Hem`, `FooterHill`, `Twinkles` (pass a star list + base size; reuse for the night scene), `Moon`, `BasketBack/Front`, `PupBuddy`, and **Teddy**: `teddy/rig.ts` (geometry, 12 poses, `frame(pose, motion)` → part transforms) + `teddy/Teddy.tsx` (static SVG). The rig reproduces all 13 reference buddies exactly. **Pages:** `not-found.tsx` (LOST poster, `components/pages/LostPoster.tsx`), `error.tsx` (Teddy sits, "oops, a tangled lead"), `global-error.tsx` (inline styles), and **stubs** for every route (real h1, lede and metadata via `components/pages/PageStub.tsx`; `/puppies` and `/gone-home` list profile links; `/how-it-works` has an empty `#delivery` target). CSS: `src/styles/components/{lenis,header,footer,pup,poster}.css`, unlayered. Verified: element boxes and styles identical to the live site at 375/768/1024/1440; server markup of header, footer, basket and bar matches. |

## Not done yet
- **P3:** homepage scenes (replace the temporary hero in `src/app/page.tsx`)
- **P4:** puppies pages (replace the `/puppies`, `/puppies/[slug]` and `/gone-home` stubs)
- **P5:** other pages and forms (replace the `/happy-families`, `/how-it-works`, `/faq` and `/contact` stubs)
- **P6a:** scroll motion
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
- Measuring beats eyeballing: compare `getBoundingClientRect()` and computed styles of the same selectors in both tabs at each width. The reference plays an intro curtain on first load; wait about 2s before measuring.

## Conventions
- Small conventional commits, **no Co-Authored-By trailer**, push to `main` when green.
- Log every prompt verbatim in `docs/PROMPTS.md`, and update this file when a phase finishes.
- Use component CSS in `src/styles/components/<name>.css`, imported from `globals.css`. Keep the `tp-*` class names so values cross-check against `docs/reference/css/main.pretty.css`.
