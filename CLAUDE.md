# TeddyPups clone — standing instructions

@AGENTS.md

**Next.js 16.4 notes for this repo:**
- `cacheComponents` and `partialPrefetching` are on, as in the reference. Pages are prerendered static shells. `useSearchParams` and other dynamic reads must sit inside `<Suspense>`. Dynamic routes need a non-empty `generateStaticParams`.
- With Cache Components, navigation keeps recently visited routes mounted but hidden (React `<Activity>`). Effects clean up and re-run when a route hides or reappears. Never assume a page's effects only run once (relevant for Lenis, the pup director, dialogs and the curtain).
- Read the bundled docs in `node_modules/next/dist/docs/` before using an API you're unsure of.

**Goal:** a faithful clone of https://puppy.instabizweb.com ("TeddyPups U.A.E."), matching its design, layout, responsiveness and functionality, built for the Insta Biz Web technical assignment (48-hour deadline). Deliverables: live URL (Vercel), public GitHub repo, Loom walkthrough.

## Source of truth
- `docs/PLAN.md` is the plan and the spec. Section numbers (§) in prompts refer to it.
- `docs/reference/` is an offline capture of the reference site. It is **gitignored**, so never commit or publish it.
  - `html/`: server HTML of all 49 sitemap pages, plus filter-query variants and the 404s.
  - `css/main.pretty.css`: the reference's compiled CSS, pretty-printed. Use it as the styling spec for values, keyframes and timings. Grep it, e.g. `grep -n "tp-door" docs/reference/css/main.pretty.css`.
  - `js/`: minified JS chunks. `_PUP-ENGINE.js` is the mascot engine.
  - `outlines/`: readable structure and verbatim copy for each page.
  - `screens/`: reference screenshots, numbered.
  - `svg/`: per-component SVG dumps (created in P1).
  - `tools/outline.py` (`python3 -I tools/outline.py <in.html> <out.txt>`) and `tools/css_pretty.py`.
- When in doubt, open the live reference in the browser and compare side by side at 375, 768, 1024 and 1440 px wide.

## Rules
- All copy must match the reference word for word, including punctuation, emoji and capitalisation.
- Reuse the reference's **media** (photos, videos, logo, icons) and **SVG artwork path data**. Write **all code** yourself: components, layout, CSS and behaviour. Treat the compiled CSS and the minified JS as specs to read, and never paste them in wholesale.
- Keep the reference's `tp-*` component vocabulary so values are easy to cross-check. Use Tailwind utilities for layout and spacing. Put component CSS in `src/styles/components/<name>.css`, imported from `src/app/globals.css`.
- Every animation respects `prefers-reduced-motion`. Every scroll-driven effect still looks right without `animation-timeline` (Safari and Firefox), either through a JS fallback or a good static end state.
- Accessibility: use semantic landmarks, build dialogs on `<dialog>` with `showModal()`, keep visible focus states, and copy the reference's aria-labels.
- Use real `next/image` with `blurDataURL` placeholders and the `sizes` values from the plan. Map focal points to `object-position`.
- Commits are small, with conventional messages such as `feat(home): meet hall doors`. **Never add a `Co-Authored-By` trailer.**
- Don't add dependencies beyond the plan without saying why.
- Run `npm run lint && npm run build` before every commit.
- Log every prompt the user sends in `docs/PROMPTS.md` (append verbatim, with date and time) at the start of each session.

## Commands
- `npm run dev` / `npm run build` / `npm start` / `npm run lint`
- `npm run test:e2e` (Playwright, added in P7)
- `node scripts/extract-content.mjs`, `node scripts/fetch-media.mjs`, `node scripts/verify-content.mjs` (added in P1)
