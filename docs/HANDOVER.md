# Handover: state of the build

Read this first in every new session, then `CLAUDE.md` and the relevant `docs/PLAN.md` sections.
Update it at the end of each phase.

**Last updated:** Sun 1 Nov 2026, after P0 + P1 (planning session).

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

## Not done yet
- **P2:** global shell (header, mobile menu, footer, bottom bar, skip link, Lenis, the LOST not-found page, the global error page, stub routes)
- **P3:** homepage scenes
- **P4:** puppies pages
- **P5:** other pages and forms
- **P6a:** scroll motion
- **P6b:** curtain and pup actor
- **P7:** tests and CI
- **P8:** README, Loom, submission

## Commands
- `npm run dev`. Or use the preview config **`teddypups`** in `~/VSCode/.claude/launch.json` (port 3100).
- `npm run lint`, `npm run typecheck`, `npm run build`. Run all three before every commit; all pass today.
- `npm run content:extract`, `npm run content:media`, `npm run content:svgs`, `npm run content:verify`. Verify checks every generated string against all 42 reference profiles; keep it green.

## Things learned the hard way (read before coding)
- **Next 16.4 defaults:** `cacheComponents` and `partialPrefetching` are on.
  - `useSearchParams` must sit inside `<Suspense>`.
  - Dynamic routes need a non-empty `generateStaticParams`.
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

## Conventions
- Small conventional commits, **no Co-Authored-By trailer**, push to `main` when green.
- Log every prompt verbatim in `docs/PROMPTS.md`, and update this file when a phase finishes.
- Use component CSS in `src/styles/components/<name>.css`, imported from `globals.css`. Keep the `tp-*` class names so values cross-check against `docs/reference/css/main.pretty.css`.
