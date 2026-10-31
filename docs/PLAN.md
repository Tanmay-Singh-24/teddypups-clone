# TeddyPups clone: build plan

**Assignment:** clone https://puppy.instabizweb.com (Insta Biz Web technical round)
**Planned:** 2026-11-01 (planning session, Claude Opus, max effort)
**Builder:** Claude Code (Opus, high effort), driven phase by phase with the prompts in `docs/PROMPTS.md`

---

## 0. TL;DR

- **What we're cloning.** A one-brand marketing site for a Dubai puppy seller, "TeddyPups U.A.E.". It is a high-craft storybook: the homepage is a scroll story from sunrise to night across 8 "scenes", a cartoon puppy mascot walks between the scenes leaving paw prints, page transitions use a quilt curtain with a running dog, and the pages are built from playful illustrated components (doors, a passport, a cork board, tickets, polaroids). There are 49 URLs in total: 7 main pages and 42 puppy profiles.
- **Their stack, which we mirror:** Next.js 16.4 (App Router, React 19), Tailwind CSS v4, Lenis 1.3 smooth scroll, Motion (framer-motion) for layout animation, `next/font` (Fraunces, Figtree, Shantell Sans), `next/image` with blur placeholders, Server Actions for the forms, and native `<dialog>`.
- **Our approach.** Rebuild with the same stack and a static, typed content layer extracted from the reference (no CMS). Reuse their media and SVG artwork and write all the code ourselves. Deploy on Vercel from a public GitHub repo.
- **Order of work:** P0 scaffold and deploy a skeleton early → P1 content and media → P2 shell → P3 homepage → P4 puppies pages → P5 other pages and forms → P6 motion → P7 QA and tests → P8 ship, README and Loom. That is about 32–34 focused hours. Target submission is about T+40h, leaving an 8h buffer. The cut lines are in §10.
- **The hardest parts** are the mascot engine (§8.2), the pinned "Meet the pups" hallway (§8.1) and the page curtain (§8.3). Each one is timeboxed and has a fallback.

---

## 1. Assignment, deliverables, deadline

From the Insta Biz Web assignment email (Sat 31 Oct 2026, 11:18):

1. **Live website URL.** The deployed clone, matching the reference's design, layout, responsiveness and functionality as closely as possible.
2. **GitHub repository URL** with the complete source.
3. **Loom video** with screen share covering: development process and project structure; technologies and tools; **AI tools used and the exact prompts provided**; implementation decisions and challenges; testing and deployment.

- **Deadline:** 48 hours from the moment you reply to accept. Planning before you reply is fine. Reply when you're ready to start building, and the same day.
- **Submission:** reply to the same email with all three URLs. The subject must be exactly: `Technical Assignment Submission – [Your Full Name] – Insta Biz Web`. Note the en dashes `–`, not hyphens.
- **AI policy:** any AI tool is allowed, but you must understand your implementation and be able to explain the whole workflow. That's why `docs/PROMPTS.md` exists and every prompt gets logged.

---

## 2. Reference recon (what's actually there)

### 2.1 Reference stack (verified from headers and bundles)

| Layer | Finding |
|---|---|
| Framework | Next.js **16.4.0** (`window.next.version`), App Router, Turbopack build, React 19 (canary bundled by Next) |
| Rendering | Prerendered static pages with ISR (`x-nextjs-prerender: 1`, `s-maxage=86400`). Puppy pages stream their content (Suspense). |
| CSS | Tailwind CSS **v4** (`@layer properties/theme/base/components/utilities`, `--spacing:.25rem`), plus about 400 hand-written `tp-*` component classes |
| Smooth scroll | **Lenis 1.3.26** (`html.lenis`; `data-lenis-prevent` on dialogs) |
| Animation | **Motion** (framer-motion: `data-framer-appear-id`, projection code), CSS keyframes, scroll-driven CSS (`@supports (animation-timeline: view())`), and a custom rAF mascot engine (~38 KB chunk) |
| Forms | React 19 **Server Actions** (`useActionState`, `useFormStatus`), with a honeypot field named `website` |
| Media | `next/image` (`/_next/image?url=/media/...`). Media objects carry width, height, alt, focal point, dominant colour and a webp `blurDataUrl`. The originals came from Wix (`*-mv2.jpg`). |
| Data | A CMS or DB behind it (UUIDs per puppy; `robots.txt` disallows `/admin` and `/api`). **Not cloned.** We use a static typed content layer instead. |
| Edge | Cloudflare: email obfuscation (`/cdn-cgi/l/email-protection`), insights, a strict CSP and security headers |

### 2.2 Routes (49 sitemap URLs + 404)

| Route | Notes |
|---|---|
| `/` | 8-scene scroll story (§5) |
| `/puppies` | Sketchbook grid, 15 **available** puppies, client-side filters synced to the URL, "Already gone home" strip with 10 of them |
| `/puppies/[slug]` | **42 profiles**: 15 available (all "Imported for you") + 27 gone home (15 "Imported for you", 12 "In Dubai"). Two page variants (§6.2). |
| `/gone-home` | 27 "ticket home" cards |
| `/happy-families` | Wall of **64** family photos + lightbox |
| `/how-it-works` | Two journeys with a switch, plus promise, delivery and why sections |
| `/faq` | Cork board of **9** notes, search with highlighting |
| `/contact` | Letter-style form, shopfront, Google Maps link |
| unknown slug / path | Custom "LOST" poster page (title for puppies: "Puppy not found") |

Full URL list: `docs/reference/urls.txt`. Sitemap: `docs/reference/sitemap.xml`.

### 2.3 Design tokens (copy exactly)

**Colours** (Tailwind v4 `@theme` names as in the reference):

| Token | Hex | Use |
|---|---|---|
| `--color-milk` | `#fffdf8` | page bg, light text on dark |
| `--color-honey` | `#f2be6b` | menu bg, footer headings |
| `--color-honey-soft` | `#fbe3b4` | chips |
| `--color-cocoa` | `#2a170e` | ink, outlines, button shadow |
| `--color-cocoa-soft` | `#5a3a28` | secondary text |
| `--color-toffee` | `#c2622b` | accents, kicker ink |
| `--color-toffee-deep` | `#a24a1a` | primary button |
| `--color-toffee-ink` | `#8e3f15` | links |
| `--color-blush` | `#f9cdbf` | blush accents |
| `--color-sky` | `#bfddf5` | sky accents |
| `--color-sky-deep` | `#2f6e9e` | sky ink |
| WhatsApp green (literal) | `#1f7a4d` | `.btn-whatsapp` |

Also `theme-color #fffdf8`.

**Fonts.** All three are Google fonts loaded with `next/font/google`. The **variation axes matter**: without them the type looks wrong.

| Role | Family | Weights | Axes to load | Used as |
|---|---|---|---|---|
| Display | **Fraunces** | 100–900 variable | `SOFT`, `WONK`, `opsz` | `--font-display`. `.font-plush` = `font-variation-settings:"SOFT" 100,"WONK" 1,"opsz" 144; weight 800; letter-spacing -.025em; line-height .92; text-wrap: balance`. `.font-plush-text` = `"SOFT" 100,"WONK" 0,"opsz" 36` |
| Body | **Figtree** | 300–900 variable | none | `--font-sans`. Body is 1.0625rem (17px), line-height 1.6 |
| Hand | **Shantell Sans** | 300–800 variable | `BNCE`, `INFM` | `--font-hand`. `.font-scrawl` = `font-variation-settings:"INFM" 60,"BNCE" 30; weight 500` |

CSS variables to expose: `--font-fraunces`, `--font-figtree`, `--font-shantell`. The display font stack is `var(--font-fraunces), ui-serif, Georgia, serif`; the hand stack is `var(--font-shantell), ui-rounded, "Comic Sans MS", cursive`.

**Type scale:** `.text-giant` `clamp(3.1rem,9.4vw,9.75rem)`, `.text-huge` `clamp(2.6rem,6.4vw,6.25rem)`, `.text-big` `clamp(2rem,4.2vw,4rem)`. The hero title is `clamp(2.6rem,min(9.2vw,11vh),8.4rem)` with max-width 15ch, which gives 99px at 1440×900.

**Easings:** `--ease-pounce: cubic-bezier(.34,1.56,.64,1)`, `--ease-silk: cubic-bezier(.22,1,.36,1)`, `--ease-snap: cubic-bezier(.7,0,.2,1)`.

**Layout variables:**
- `--gutter: clamp(1rem,4vw,3.5rem)` (`.gutter` = padding-inline)
- `--header-h`: 4.75rem, or 4rem below 768px
- `--bar-h`: 0, or `calc(4rem + env(safe-area-inset-bottom))` below 768px
- `--quilt-h: clamp(4.5rem,12vh,8rem)`
- radii: xl .75rem, 2xl 1rem, 3xl 1.5rem

**Breakpoints used:** 640 (sm), 768 (md), 900, 1024 (lg), 1100, 1280 (xl), 1680. Mobile and desktop switch the nav at 1024 and the bottom bar at 768.

**Shared components:**
- `.btn`: min-height 3.25rem, pill, padding .85rem 1.6rem, 1.0625rem, weight 650, `transition: transform .35s var(--ease-pounce), background-color .25s, box-shadow .35s var(--ease-silk)`.
- `.btn-primary`: bg toffee-deep, text milk, `box-shadow: 0 .5rem 0 -.15rem var(--color-cocoa)` (the "3D lip").
- `.btn-ghost`: 2px cocoa border, transparent.
- `.btn-whatsapp`: `#1f7a4d`, same lip.
- `.chip`: honey-soft pill, .875rem/600.
- `.link-ink`: toffee-ink, 2px underline in `#c2622b8c`.
- **Scenes** (`.tp-scene`) paint `linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))` and set `--ink`. Each scene passes its own sky pair inline (listed in §5).
- **Quilt band** (`.tp-quilt`): two 45° and −45° repeating-linear-gradients (`#2a170e12`, 46px/48px) over `var(--quilt)`, with a scalloped stitched edge SVG.

**Base:**
- `html`: `scrollbar-gutter: stable; scroll-padding-top: calc(var(--header-h) + 1rem); overflow-x: clip`.
- `body`: milk background, cocoa text, Figtree, antialiased, `overflow-x: clip`.

### 2.4 Global shell (every page)

- **Skip link** ("Skip to content" → `#main`). `main#main` has `padding-top: var(--header-h)`.
- **Header** (`#site-header.tp-header`, fixed, z-50; `data-home`, `data-scrolled`, `data-hidden`):
  - Brand: round logo (`/brand/logo.png`) plus "TeddyPups" in Fraunces.
  - Desktop nav (≥1024): Home · Puppies · Happy families · How it works · FAQ · Visit & contact. The active link is toffee with a small **paw icon** under it. On the right is a green "WhatsApp us" pill.
  - Under 1024: a "Menu" pill with a paw icon opens the menu dialog.
  - State: `data-hidden=true` slides the header up while scrolling down and it reappears on scroll up. `data-scrolled` or a non-home page shows the milk background (`::before`) and the **scalloped hem** SVG under the bar. On the home page at the top it's transparent.
- **Mobile menu:** `<dialog class="tp-menu">` with `showModal()`, full screen, honey background, backdrop `cocoa/40`. It has the kicker "where to, friend?", a "Close" button, staggered links with paws (`tp-menu-link` keyframes), and a full-width WhatsApp button showing "+971 54 167 6733". Animations are `tp-menu-in`, `tp-menu-out` and `tp-menu-backdrop-out`.
- **Footer** (`.tp-footer`, dark night):
  - A hill SVG on top, twinkling stars and a crescent moon.
  - "Home, at last." with "TeddyPups U.A.E. is a Dubai-based brand specializing in miniature puppies, offering premium services and worldwide shipping."
  - The mascot in a woven **basket** (back and front layers).
  - **Explore:** Available puppies, Gone home, Happy families, How it works, Delivery & collection (`/how-it-works#delivery`), FAQ, Visit & contact.
  - **Say hello:** WhatsApp +971 54 167 6733, `teddypupsadmin@gmail.com` (plain `mailto:`; no Cloudflare obfuscation needed), "Downtown Dubai, United Arab Emirates", and social pills for Instagram, TikTok and Facebook (URLs in §4.1).
  - Bottom row: logo, "© {year} TeddyPups U.A.E." and "every puppy is family" in hand font, honey colour. The footer's bottom padding includes `--bar-h`.
- **Mobile bottom bar** (<768, `md:hidden`, `data-whatsapp-bar`): fixed at the bottom, z-40, milk background with a 2px cocoa top border. It holds "WhatsApp us" (flex-1, `!min-h-12`) and "Call" (`tel:+971541676733`), with bottom padding `calc(.6rem + env(safe-area-inset-bottom))`. The "Menu" button is `lg:hidden`, so it shows below 1024.
- **Pup layer** (§8.2) and **page curtain** (§8.3) live in the root layout.

### 2.5 SEO, meta and security (cheap wins; match them)

- **Titles** use the template `%s | TeddyPups U.A.E.`. The home page title is `TeddyPups U.A.E. — Premium teacup puppies in Dubai`. Puppy pages:
  - named: `Max, Maltipoo puppy`
  - unnamed: `Korean Teacup Maltipoo puppy (girl)`
  - unknown: `Puppy not found`
- **Descriptions:** copy each page's from `docs/reference/html/<page>.html`. Puppy pages follow this pattern: `Meet Max: Maltipoo, boy, 3 months old, imported. Real photos and video from TeddyPups U.A.E.` Drop "and video" when the puppy has no video. Unnamed puppies start `Meet this Korean Teacup Maltipoo: …`.
- **OG/Twitter:** `summary_large_image`, image `/brand/logo.png`, plus a canonical per page. Use our own domain through `NEXT_PUBLIC_SITE_URL`.
- **JSON-LD:**
  - `PetStore` on the home page (name, description, url, logo, telephone, email, address).
  - `FAQPage` on `/faq`.
  - `BreadcrumbList` on puppy pages (Puppies → name).
- **Icons:** `src/app/icon.png` (512) and `apple-icon.png` (180), downloaded from the reference.
- **Security headers** in `next.config.ts`, mirroring the reference, production only:
  - CSP: `default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`
  - `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - If the CSP breaks something, loosen that one directive rather than dropping the policy.
- **Clone hygiene (deliberate deviation):** the root metadata is `robots: { index: false, follow: false }`, so the clone of a real business never shows up in search. Keep `robots.ts` and `sitemap.ts` (with our domain) for parity. This is invisible to visitors. Mention it in the README.

---

## 3. Our stack, structure and ground rules

### 3.1 Stack (and why)

| Choice | Why |
|---|---|
| **Next.js 16 (App Router) + React 19 + TypeScript** | The same framework as the reference, so routing, metadata, `next/font`, `next/image` and Server Actions behave identically. SSG for all 42 puppy pages. |
| **Tailwind CSS v4** | Same as the reference. Tokens go in `@theme`. Component CSS files (one per illustrated component) keep the art-heavy CSS readable. |
| **Lenis** (`lenis`, `lenis/react`) | Same smooth-scroll feel as the reference |
| **Motion** (`motion/react`) | Layout animations for filter grids and the FAQ board, as in the reference |
| **zod** | Server-side form validation |
| **Playwright** + GitHub Actions | E2E smoke tests and CI. Good to show in the Loom. |
| **Vercel (Hobby)** | First-class support for Next 16 (Server Actions, image optimisation). Git-push deploys and PR previews. |
| *(optional)* **Resend** | Lets form submissions really arrive in your inbox when `RESEND_API_KEY` is set. Otherwise they're logged. |

No CMS, DB or auth: the content is static and typed. The reference's `/admin` is out of scope; say so in the README.

### 3.2 Project structure

```
teddypups-clone/
├─ CLAUDE.md                      # standing instructions (from docs/CLAUDE.root.md)
├─ README.md
├─ docs/
│  ├─ PLAN.md  PROMPTS.md
│  └─ reference/                  # gitignored offline capture of the reference
├─ scripts/                       # extract-content, fetch-media, extract-svgs, verify-content
├─ public/
│  ├─ brand/logo.png
│  └─ media/<id>/<hash>/<file>    # same paths as the reference
├─ e2e/                           # Playwright specs
└─ src/
   ├─ app/
   │  ├─ layout.tsx  globals.css  not-found.tsx  icon.png  apple-icon.png  robots.ts  sitemap.ts
   │  ├─ page.tsx                               # home
   │  ├─ puppies/page.tsx  puppies/[slug]/page.tsx  puppies/[slug]/not-found.tsx
   │  ├─ gone-home/  happy-families/  how-it-works/  faq/  contact/
   │  └─ actions/enquiry.ts                     # 'use server' — both forms
   ├─ components/
   │  ├─ layout/   Header, MobileMenu, Footer, BottomBar, SkipLink, PageCurtain, TransitionLink
   │  ├─ home/     Hero, Lineup, MeetHall, Door, TwoWays, JourneyChat, Phone, Passport, Stamp, Horizon,
   │  │            Dusk, PhotoWall, Night, HomeHouse
   │  ├─ puppies/  SketchCard, Filters, GoneStrip, Gallery, FactCard, Checklist, WayHome, EnquiryLetter, PrevNext, Ticket
   │  ├─ pages/    MemoriesWall, Journeys(+Switch), Promise, Delivery, Why, Board, NotesBoard, Note, LetterForm, Shopfront, LostPoster
   │  ├─ art/      Teddy (rig), Paw, Quilt, Hem, Squiggle, Twinkle, Moon, Sun, Skyline, CityHorizon, Basket, Runner, …
   │  ├─ motion/   LenisProvider, PupDirector, PupStop, usePinnedProgress, useInView, Reveal
   │  └─ ui/       Button, Chip, Kicker, PhotoViewer (dialog), Tag
   ├─ content/     puppies.ts  families.ts  faq.ts  site.ts  types.ts   (generated + hand-tuned)
   ├─ lib/         whatsapp.ts  puppies.ts (queries/filters)  seo.ts  format.ts
   └─ styles/components/*.css    # one file per tp-* component family
```

### 3.3 Ground rules

These are also in `CLAUDE.md`:
- Copy is verbatim.
- Reuse the reference's media and art; write every line of code ourselves.
- Use the compiled CSS as a spec only.
- Keep the `tp-*` vocabulary.
- Support reduced motion everywhere.
- Small commits, with no Co-Authored-By trailer.
- Run lint and build before each commit.
- Log prompts in `docs/PROMPTS.md`.

---

## 4. Content and assets

### 4.1 Content model (`src/content/types.ts`)

```ts
type Media = {
  id: string; url: string; kind: 'image' | 'video';
  width: number; height: number; alt: string; caption: string;
  focalX: number; focalY: number;      // 0..1 → object-position
  color: string;                        // dominant colour → page tint (§6.2)
  blurDataUrl: string;                  // webp data URL → next/image placeholder
  durationS: number | null; poster: string | null;
};
type Puppy = {
  id: string;                 // reference UUID (used as the forms' puppyId)
  slug: string;
  name: string | null;        // "Max" | null (listed by breed)
  breed: string;              // "Korean Teacup Maltipoo", "Maltipoo & Cavapoo", …
  breedKey: string;           // filter key: maltipoo | pomeranian | poodle | cavapoo | shih-tzu | … (verify)
  sex: 'boy' | 'girl' | 'boy & girl';
  age: string;                // "2 months", "2.5 months", "3 months Maltipoo & 2 months Cavapoo"
  origin: 'imported' | 'local'; originLabel: 'Imported for you' | 'In Dubai';
  status: 'available' | 'gone-home';
  hasVideo: boolean;
  ticketFrom?: string;        // gone-home ticket "from" line: "TeddyPups" | "Dubai showroom"
  media: Media[];
};
type FamilyPhoto = { media: Media; caption?: string };   // 64; captions such as "Lulu 🧸 with her new mummy ❤️"
type Faq = { q: string; a: string };                    // 9
```

**Site constants** (`src/content/site.ts`):

| Constant | Value |
|---|---|
| Phone | `+971541676733`, displayed as `+971 54 167 6733` |
| WhatsApp base | `https://wa.me/971541676733?text=` |
| Email | `teddypupsadmin@gmail.com` |
| Address | Downtown Dubai, United Arab Emirates |
| Maps | `https://maps.app.goo.gl/ZdJvwHBSQWWZT54s7` |
| Instagram | `https://www.instagram.com/teddypups.worldwide/` |
| TikTok | `https://www.tiktok.com/@teddypupsuae` |
| Facebook | `https://www.facebook.com/profile.php?id=61567496944539` |
| Testimonial | "TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process gave us complete peace of mind." — Sarah M., Dubai, UAE |

**WhatsApp message templates** (`lib/whatsapp.ts`; `{url}` = our absolute puppy URL):

| Where it's used | Message |
|---|---|
| default | `Hi TeddyPups! I'd love to know more about your puppies.` |
| available, named | `Hi TeddyPups! I'm interested in Max, the Maltipoo: {url}` |
| available, unnamed | `Hi TeddyPups! I'm interested in the Korean Teacup Maltipoo (girl): {url}` |
| gone home | `Hi TeddyPups! I loved Ace ({url}). Do you have a puppy like them?` |
| FAQ "Ask your own question" | `Hi TeddyPups! I have a question:` |

### 4.2 Where the data lives (pointers for P1's extractor)

- Each page's inline **Next.js flight payload** is `self.__next_f.push([1,"…"])`. JSON-decode each chunk with `JSON.parse('"' + chunk + '"')` and concatenate the results.
- Detail pages contain `"media":[{…}]` arrays. These are valid JSON arrays: slice them out with bracket matching and `JSON.parse` them. They also contain the form props: `{"puppy":{"id":"<uuid>","label":"Korean Teacup Maltipoo"},"success":{"heading":"Message received!","body":"Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp."}}`.
- Visible fields come from the rendered HTML: name, breed, sex, age, "Where", status, order on `/puppies` and `/gone-home`, captions, FAQ text and ticket "from". `docs/reference/outlines/*.txt` shows the structure.
- `/contact`'s `<select name="puppyId">` lists the 15 available puppies with their UUIDs and labels, such as `Max (Maltipoo, boy)`.
- Order: `/puppies` order = available order (also the homepage doors order). `/gone-home` order = the tickets order. Prev/next on detail pages follows those lists. Verify against the "Previous pup"/"Next pup" links.

### 4.3 Media

- **205 unique files** in `docs/reference/media-urls.txt`: 106 jpg, 76 avif, 14 jpeg, 7 mp4, 1 webp, 1 png. Download them from `https://puppy.instabizweb.com<path>` into `public/media/` keeping the same paths, plus `/brand/logo.png`, `/icon.png` and `/apple-icon.png`.
- The videos are 720p MP4s of about 4–6 MB each; expect roughly 60–100 MB in total. That's fine for GitHub (every file is under 100 MB) and Vercel.
- Be polite while downloading: concurrency 4, retry with backoff, skip files that already exist.
- **`sizes` values to mirror:**

| Component | `sizes` |
|---|---|
| Hero lineup | `11rem` |
| Meet doors | `(min-width: 1024px) 15rem, 44vw` |
| Two-ways window | `(min-width: 1024px) 16rem, 60vw` |
| Phone photos | `9rem` |
| Sketch cards | `(min-width: 1536px) 17rem, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw` |
| Gone strip | `9rem` |
| Gallery main | `(min-width: 1024px) 55vw, 92vw` |
| Thumbnails | `96px` |
| Prev/next | `80px` |
| Tickets | `7rem` |
| Home photowall | `(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw` |
| Families wall | as in `happy-families.html` |
| House | `16rem` |

### 4.4 Artwork

- Every illustration is **inline SVG** in the server HTML, keyed by `tp-*` class: doors, house, skyline, city horizon, stamps' icons, paw, quilt edge, header hem, footer hill, basket, runner dog, twinkles, moon, the flight/plane/postcard art, and so on.
- The mascot rig (`viewBox 0 0 300 240`) has named parts (`data-p`): `root, shadow, body, bf, ff, tail, bn, fn, haunch, head, earL, earR, eyes(open, blink), happy, shut, tongue, mouth, ledge`. A static copy sits in every `.pup-stop > .pup-buddy`.
- P1 dumps each distinct SVG to `docs/reference/svg/`. P2 and P3 turn them into components in `src/components/art/`. Keep the path data, swap colours for tokens or `currentColor` where useful, and keep `aria-hidden`.

---

## 5. Homepage scene spec (`/`)

The **sky gradient** is the backbone: each scene's `--sky-bottom` equals the next scene's `--sky-top`, so the page reads as one continuous day-to-night sky.

**Measured section heights** (fidelity targets, ±10%):
- At 1440×900: hero 824 · meet **4126** (pinned) · paths 1107 · chat 1697 · passport 922 · dusk 1584 · night 636 · home 1021 · footer 701. Document height **12,694 px**.
- At 375×812: hero 748 · meet 3036 · paths 1281 · chat 1516 · passport 1258 · dusk 1695 · night 954 · home 967. Document height 12,823.

Verbatim copy is in `docs/reference/outlines/home.txt`. Screens 01–13 are in `docs/reference/screens/`.

| # | Scene (`.tp-*`) | Sky (top → bottom) | Content | Pup stop |
|---|---|---|---|---|
| 1 | **hero** | `#fffdf8 → #fff1d8` (quilt `#fff1d8`) | See below the table | `peek`, act `peekaboo`, `behind`, `lane` |
| 2 | **meet** | `#fff1d8 → #fbe3b4` | See below the table | `walk`, act `treadmill` |
| 3 | **paths** | `#fbe3b4 → #f7d18d` | See below the table | fork: `sit` |
| 4 | **chat** | `#f7d18d → #f0b866` | See below the table | `sit` by the phone |
| 5 | **passport** | `#f0b866 → #a65a30` | See below the table | book: `sit` |
| 6 | **dusk** (dark) | `#a65a30 → #4d2b19` | See below the table | `sit` |
| 7 | **night** (dark) | `#4d2b19 → #2f1a10` | See below the table | `sit`, act `tilt` |
| 8 | **home** (dark) | `#2f1a10 → #24130b` | See below the table | house: `bow` |

**1. Hero**
- Kicker "every puppy is family" in hand font with a squiggle SVG.
- h1 "Premium teacup / puppies in Dubai" (`.tp-hero__title`).
- Lede: "Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders worldwide."
- Buttons: **View available puppies** (primary → `/puppies`) and **Enquire on WhatsApp** (ghost).
- **Lineup:** 6 arched photo windows of different heights. The links read "Meet {name}, {breed}". A hidden-by-default name-tag row (`tp-lineup--tags`) and a centre **seat** for the mascot ("hm?" bubble). Puppies **pop up and swap** over time (§8.1).
- A quilt band at the bottom.

**2. Meet**
- h2 "Meet the pups"; "Real puppies, real photos, looking for their families right now."; **See all available puppies**.
- A **hallway** of 15 arched **doors** plus a "Meet them all" door. Each door has a wood colour, paw plate, knob, peephole and hanging "Available" tag. Above each door: name / breed, sex, age, ", with video".
- A wooden floor.
- Desktop: the stage is **pinned** and the track scrolls sideways; doors open as they pass the pup.
- Mobile: a 2-column grid with the doors already open.

**3. Paths**
- h2 "Two ways to meet your puppy".
- Left way: sign **Puppies in Dubai**, skyline SVG, window photo captioned "In our showroom", copy, then **Meet local puppies** → `/puppies?origin=local`.
- Right way: sign **Imported for you**, flight art (660×300), copy, then **See imported puppies** → `/puppies?origin=imported`.
- A fork signpost.

**4. Chat**
- h2 "Your puppy journey" plus its lede.
- 3 numbered steps: Choose your breed / Get photos & details / Secure & safe delivery. A "How it works" link.
- A **sticky phone**: header with avatar, "TeddyPups U.A.E.", "online"; a paw-pattern background; my bubble "Hi TeddyPups! I'd love to know more about your puppies."; reply bubbles = the step texts.
- Breed **chips** (aria-label "Breeds we have now"): Maltipoo, Pomeranian, Poodle, Cavapoo, Shih Tzu → `/puppies?breed=…`.
- 4 showroom photos plus a **video clip** with a play button.
- A route SVG and a compose bar, "Say hello on WhatsApp".

**5. Passport**
- An open **book**. Left page: kicker "puppy passport", h2 "Why families trust TeddyPups". Right page: 4 **stamps** in different shapes and inks (round, ticket, oval, scallop):
  - Vet-checked & healthy
  - Korea to Dubai, safely
  - Support 24/7
  - Trusted by families worldwide
- A ribbon bookmark.
- The **Dubai skyline horizon** (1440×160) with a **setting sun**.

**6. Dusk** (dark)
- h2 "Happy families & puppies" plus its lede.
- The testimonial note (Sarah M.).
- A **photo wall** on a wooden board: 8 taped polaroids with hand-font captions. Each is a button labelled "Open photo N of 64: {caption}" that opens the **Photo viewer** dialog over all 64 photos.
- **See every happy family** → `/happy-families`.

**7. Night** (dark)
- 11 twinkles.
- h2 "Questions, answered" and a **Read all questions** link → `/faq`.
- The first 3 FAQs with star bullets.
- A "?" bubble.

**8. Home** (dark)
- h2 "Ready to meet your new best friend?" plus its lede.
- A **house** facade: plank wall, a door that **opens** to show Max ("Max, waiting inside"), lamps, potted plants, a "welcome home" mat and a peephole.
- **Enquire on WhatsApp** and **Visit & contact** (ghost → `/contact`).

Then the footer (§2.4).

---

## 6. Inner pages spec

Copy is in `docs/reference/outlines/<page>.txt`; structure is in `docs/reference/html/<page>.html`.

### 6.1 `/puppies` (screens 16–17)

- **Header** (`.tp-sketchbook`): kicker "from Teddy's sketchbook"; h1 "Available puppies" with a brush-stroke underline SVG; lede "Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about them on WhatsApp."; the mascot "self-portrait" in a round sticker frame; a dot-grid paper background.
- **Filter panel.** This is a client component, so it isn't in the server HTML. It's a bordered card with tape. Rows of toggle chips use `aria-pressed`, with one selection per row:
  - **where**: Everywhere · Imported · Korean Teacup (options come from the available puppies)
  - **breed**: Maltipoo · Pomeranian · Poodle · Cavapoo · Shih Tzu
  - **boy or girl**: Boys · Girls
  - A "Clear filters" link appears when anything is set.
- **URL sync** uses `router.replace` with no reload, e.g. `?breed=shih-tzu`. The homepage links use `?origin=local|imported`.
  - **Before building, click every chip on the live site** and record the exact parameter names and values.
  - Also open `/puppies?origin=local`. There are 0 local available puppies, so it shows the empty state; copy it.
- **Count line:** "15 puppies looking for a home" with no filters, "N puppies match" otherwise. Add an `aria-live` region.
- **Grid** (`.tp-sketches`) of **sketch cards** (`.tp-sketch`): a watercolour wash blob SVG, a circular photo, a hand-inked ring SVG, the hanging "Available" tag, a "▶ video" badge, doodles (heart, sparkle, paw), then name, breed, sex and age. The link's aria-label is "Max, Maltipoo, boy, 3 months, available". When filtering, the grid re-flows with a Motion layout animation.
- **"Already gone home" strip:** h2, "These puppies have found their families.", 10 small sketches with "gone home ♥", and a **See the puppies who've gone home** button.

### 6.2 `/puppies/[slug]` (42 pages, SSG; screens 20–21)

- `generateStaticParams` over all 42 puppies with `dynamicParams = false`; anything else hits the "LOST" page with the title "Puppy not found".
- **Background tint:** `linear-gradient(180deg, color-mix(in oklab, {media[0].color} 24%, var(--color-milk)) 0, …)`. Copy the full gradient from the HTML.
- **Breadcrumb:** Available puppies (or **Gone home**) / {label}.
- **Chapters** are numbered circles with a hand-font title.
  1. **"hello, it's me"** (gone home: "the day they went home").
     - **Gallery:** a big photo on a stacked-paper card with ‹ › buttons and a counter "1 / 11". The main photo is a button that opens the full-screen dialog ("Open {label}, photo 1 of 11 full screen"). A thumbnail strip with ▶ on video items. The **full-screen viewer** `<dialog>` supports arrows, Esc and swipe, and plays video.
     - **Sticky info card:** pin, status tag ("Available" or "Gone home ♥"), h1 (`text-[clamp(2.6rem,5vw,4.6rem)]`), and a facts `dl`: Breed / Boy or girl / Age / Where.
     - Buttons: **Ask about this puppy on WhatsApp** (gone home: "Ask about a puppy like this") and **Send an enquiry** → `#enquire-{slug}`. The mascot peeks over the card.
  2. **"what comes with" this {breed or name}:** h2 "Every Teddy Pup comes" and a 4-item checklist: Vaccinated / Dewormed / Verified health certificate from licensed vets / Thoroughly checked before joining your family.
  3. **"the way home"** (available only): h2 "Coming home from abroad" for imported puppies, with 4 steps joined by a dotted paw trail: Reserve your puppy / Personalized consultation / Import and arrival / Welcome home. The local variant comes from the "In Dubai" journey on `/how-it-works`; check the reference.
  4. **"dear TeddyPups…"** (chapter 3 on gone-home pages): an **enquiry letter** (`.tp-letter`) with a paw stamp.
     - h2 "Ask about this puppy" (gone home: "Looking for a puppy like this?") plus a lede.
     - Fields: Your name\*, Phone or WhatsApp\* ("With country code, e.g. +971 50 123 4567"), Email (optional), Your area (optional, "e.g. Dubai Marina"), Message (optional, prefilled "Hi! I'd love to know more about {label}."), hidden `puppyId`, honeypot `website`.
     - Button **Send enquiry**. The success state is "Message received!" plus its body text.
- **More puppies** nav: Previous pup / Next pup cards with an 80px photo.
- JSON-LD `BreadcrumbList` and the metadata from §2.5.

### 6.3 `/gone-home`

- **Booth header:** h1 "Gone home" with a heart SVG; lede "Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we'll help you find your match."; **See available puppies**; the mascot in a booth with the sign "tickets home".
- **27 tickets** (`.tp-ticket`), each with a photo, "one ticket home", name, "{breed}, {sex}", a from-label ("TeddyPups" or "Dubai showroom"), a route SVG, "home ♥" and an "admit one" stub. They animate in (`tp-stamp-in`).

### 6.4 `/happy-families`

- **Header:** kicker "our wall of happy endings"; h1 "Happy families" with a heart; lede; the counter "64 / moments and counting".
- The testimonial note.
- A **wall of 64 prints** (`.tp-wall__print` buttons, "Open photo N of 64", with paw SVGs), which opens the shared **PhotoViewer**.

### 6.5 `/how-it-works`

- Scene sky `#fffbf3 → #f6cc85`. h1 "How it works" plus its lede.
- An "On this page" chip nav: 1 Two ways home (`#two-ways`), 2 Our premium puppy promise (`#promise`), 3 Delivery & collection (`#delivery`), 4 Why choose us (`#why`).
- **Two ways home** (`.tp-journeys`): kicker "choose your way". A **switch** (`.tp-switch`) with two tabs, "In Dubai / meet in person" and "Imported / order upon request". Use tablist semantics and an animated thumb. It swaps the journey panels:
  - **In Dubai:** postcard with city art and "Downtown Dubai"; "Meet your puppy in person"; 4 steps (Explore our puppies / Choose your puppy / Meet before you choose / Pick-up or delivery).
  - **Imported:** postcard with route and plane, "Europe · Korea" → "Dubai"; "Order upon request" plus 2 paragraphs; 4 steps (Reserve / Personalized consultation / Import and arrival / Welcome home).
  - Each step has an icon and the label "Step N".
- **Promise** (`.tp-paper`, `#promise`): kicker "puppy passport", h2, and 3 stamps: Hand-selected breeders / Full transparency / Safe, stress-free delivery.
- **Delivery** (`#delivery`): h2 "Delivery & collection" plus its lede; 4 items (same-day, delivery within Dubai, safe international cargo, worldwide delivery); flight art.
- **Why** (`#why`): h2 plus copy; 3 items with icons (International cargo / Support 24/7 / Health guarantee).
- **Board** CTA (`.tp-board`): "Unique and high quality puppies" plus its paragraph; **Ask us on WhatsApp** and **See available puppies**; the mascot.

### 6.6 `/faq` (screens 18–19)

- A dark scene, `#a95e32 → #331c11`. h1 "Questions & answers" (Fraunces's swash "&" comes from the WONK/SOFT axes). Lede: "Can't find what you're looking for? Message us on WhatsApp — our team is available 24/7."
- **Side panel:**
  - Kicker "sniff out a question".
  - Search input with a lens icon, placeholder "delivery, Korea, vaccinated…", and a clear ×.
  - Count: "9 notes on the board", "1 note found" or "N notes found".
  - The mascot with "?" and "!" bubbles.
  - **Ask your own question** (WhatsApp, FAQ template).
- **Cork board:** 9 **pinned notes** (`.tp-note`) with coloured push-pins, slight rotations, a flap and a chevron. Each question is an `h2 > button[aria-expanded]` that toggles its answer.
- **Search:** filters the notes, **auto-expands matches**, wraps matched text in `<mark>`, and has an empty state (`.tp-note--empty`). Notes animate in and out (Motion).
- JSON-LD `FAQPage`.

### 6.7 `/contact`

- Scene sky `#fff9ee → #f9dca4`. h1 "Get in touch with us" plus its lede.
- **Letter form** (`.tp-letterform`), written as a fill-in-the-blanks letter: "Dear TeddyPups, my name is [name\*], and you can reach me on [phone\*, placeholder +971 50 123 4567] or by email at [email, placeholder "optional"]. I live in [area, placeholder "e.g. Dubai Marina"], and I'm curious about [select puppyId: 'any puppy (not sure yet)' + the 15 available, e.g. 'Max (Maltipoo, boy)']."
  - Then a "Your message (optional)" textarea with placeholder "Anything else you'd like to tell us…", the honeypot, the sign-off "with love, a future puppy parent", and **Post my letter**.
  - Success plays the **post box** animation (`.tp-post__*`: the envelope goes in, the flag goes up, "sent").
- **Contact column:** WhatsApp button with the number, "call us" with `tel:`, and "email" with `mailto:`.
- **Shopfront** (`.tp-shopfront`): "Visit us in Downtown Dubai" plus its text, the address with a pin icon, **Open in Google Maps**, and the visit photo.

### 6.8 Not-found (screen 23)

A taped **"LOST" poster** (`.tp-poster`):
- Kicker "have you seen this page?", the title "LOST", and the subtitle "this page has wandered off".
- The mascot standing in a dashed photo frame.
- "One page, last seen wandering off. It answers to the address you typed, but it isn't here any more. Teddy is on the case."
- "if found, take a tab:" with **tear-off tabs** linking to Home, Puppies, How it works, Questions and Contact.

**Global error page** (`src/app/global-error.tsx`, from the reference JS): the title is "Something went wrong | TeddyPups U.A.E." and the h1 is "This page tripped on its way to you." It is a simple centred page on milk with inline styles and a system font.

---

## 7. Forms and functionality

- **One Server Action** (`src/app/actions/enquiry.ts`) serves the puppy enquiry and the contact letter, used through `useActionState`.
  - **zod** schema: name required (≤80); phone required (allow +, spaces and digits; 7–20 digits); email optional but valid; area, message and puppyId optional.
  - **Honeypot:** if `website` is non-empty, pretend success and drop the submission.
  - Return per-field errors in friendly copy next to the fields, and keep the entered values.
  - Disable the submit button while pending (`useFormStatus`), with the `disabled:opacity-70` style.
  - **Success:** both forms use the same copy from the flight payload: "Message received!" / "Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp." plus a WhatsApp link. The contact form also plays the post box animation (`tp-post__box--sent`, `tp-post__sent`).
  - **Never submit the forms on the live reference.** That would message a real business. Rebuild the success visuals from the CSS and the payload instead.
  - **Delivery:** if `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are set, send an email through Resend (from `onboarding@resend.dev`). Otherwise `console.info` the payload. Never echo personal data in the URL.
- **WhatsApp links:** built by `lib/whatsapp.ts` from the §4.1 templates and `NEXT_PUBLIC_SITE_URL`. External links use `target="_blank" rel="noopener"` only where the reference does; check the HTML.
- **Filters** (§6.1), **FAQ search** (§6.6), **gallery and viewers** (§6.2/§6.4: one `PhotoViewer` with focus trap via `<dialog>`, keyboard ←/→/Esc, swipe, counter, captions, `data-lenis-prevent`), **how-it-works switch** (§6.5), **menu dialog** (§2.4), **video play/pause** (phone clip, gallery videos).
- **Accessibility parity:** reuse the reference's aria-labels (they're descriptive). `prefers-reduced-motion` turns off Lenis smoothing, the pinned track (doors render open in a grid), the actor (static mascots) and the curtain (instant).

---

## 8. Motion spec

The **specs live in `docs/reference/css/main.pretty.css`**. Grep the keyframe names below for durations, easings and transforms. Hover effects sit behind `@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)`.

### 8.1 Scroll systems (P6a)

| System | Behaviour | Reference hooks |
|---|---|---|
| Lenis | Root smooth scroll (`autoRaf`). Dialogs carry `data-lenis-prevent`. Off for reduced motion. | `html.lenis` |
| Header | Hide on scroll down, show on scroll up; set `data-scrolled` after a few px | `.tp-header[data-hidden]`, `[data-scrolled]` |
| Hero lineup | Puppies pop up and swap in the arches in turn; name tags pop; the mascot "seat" with an "hm?" bubble | `tp-pop-up`, `tp-peek`, `tp-hold-still`, `.tp-lineup__*` |
| **Meet hallway** | Section is about 4.6× viewport height. Stage `position: sticky; top: 0; height: 100vh`. JS sets `data-pinned` on the section when wide enough and motion is allowed. Track `translateX` maps scroll progress to `-(trackWidth - viewport)`. Doors swing open (rotateY with perspective) when they cross the pup's x. The floor planks move. | `.tp-meet[data-pinned]`, `.tp-meet__stage`, `.tp-meet__track`, `tp-door-open` |
| Journey chat | The active step is full opacity, others dimmed. The phone is sticky. Per step: typing dots, then message bubbles in. Step 1 chips, step 2 photos and video, step 3 route. | `tp-msg-in`, `tp-dot`, `.tp-msg--me/--them`, `.tp-typing` |
| Passport | Stamps thump in on enter; the sun sets with scroll; the ribbon sways | `tp-stamp-thump`, `tp-sun-set`, `tp-sunrise` |
| Night and footer | Stars twinkle, the moon floats, the basket mascot breathes, blinks and twitches an ear | `tp-twinkle`, `tp-float`, `tp-breathe`, `tp-blink-open/shut`, `tp-ear-twitch` |
| Home | The door opens on enter; lamps glow | `tp-house-open` |
| Misc | Card doodles hop on hover, tickets stamp in, menu link stagger, FAQ notes in and out | `tp-doodle-hop`, `tp-stamp-in`, `tp-menu-*` |

- Where the reference uses `animation-timeline: view()`, implement it with `@supports` exactly as they do. Then add a light JS fallback (IntersectionObserver plus a CSS variable for progress) so Safari and Firefox still get the effect, or at least land on the final frame.

### 8.2 The pup actor (P6b; the signature feature)

- **Static first.** Each scene has a `.pup-stop` anchor holding a server-rendered **static buddy** SVG with `data-pose`, `data-facing` and optional `data-act`, `data-behind` and `data-lane` (values in §5). That alone looks right with no JS or with reduced motion.
- **Live.** When the director boots, set `html[data-pup="live"]` (desktop) or `"lane"` (under 768px) and hide the static buddies (`html[data-pup] .pup-stop > .pup-buddy { visibility: hidden }`).
  - A fixed `.pup-layer` (z-15, `pointer-events: none`) holds one `.pup-actor` (translate3d) → `.pup-actor__body` (scale to the stop's size) → the rig SVG.
  - Speech bubbles (`.pup-bubble[data-show]`): "hm?", "peekaboo!", "?".
- **Director loop** (rAF, reading Lenis scroll):
  1. Measure the stops' rects on resize and scroll.
  2. The **active stop** is the one nearest a focus line (about 55–60% of the viewport height).
  3. **Target** = the active stop's rect, centred bottom. A spring moves the actor toward it, critically damped with a slight hop arc on vertical jumps.
  4. While moving: **walk cycle**. The four legs (`bf`, `ff`, `bn`, `fn`) swing in alternation, the body bobs and the tail wags. Flip facing by the sign of dx.
  5. On arrival: blend into the stop's **pose** (sit, peek with `ledge` paws, bow, or walk-in-place for `treadmill`) and run **idles** (blink every 3–6 s, ear twitch, breathe, tail wag) plus the stop's act (peekaboo bubble, head tilt with "?").
  6. **Paw prints:** every ~40–60 px of travel, stamp a paw SVG into the absolute `.pup-prints` layer (z-5, the full page height) at the actor's feet, alternating left and right, rotated along the path. Fade them out, or keep a short trail.
- Read `docs/reference/js/_PUP-ENGINE.js` **only to understand** timings, poses and the lane mode. Write our own typed implementation: `PupDirector.tsx` + `pup/rig.ts` + `pup/poses.ts`.
- **Timebox 4h.** If it isn't convincing by then, take the cut line (§10).

### 8.3 Page curtain (P6b)

- `TransitionLink` wraps every internal link. On a plain left-click to a different path:
  1. `preventDefault`.
  2. The curtain **covers**: the quilt panel with its scalloped stitched edges rises from the bottom (`tp-curtain-cover`, `--ease-snap`).
  3. A **runner dog** (`.tp-runner`, legs `tp-runner-leg-a/b`, `tp-runner-bob`, `tp-runner-wag`, `tp-runner-ear`) runs across (`tp-runner-x`), stamping prints (`tp-print-step`), with the note "every puppy is family".
  4. `router.push`.
  5. When `usePathname` changes and the next frame paints, it **lifts** (`tp-curtain-lift`). `tp-curtain-rest` covers the hold.
- Scroll to the top while covered. Respect modifier keys, `target=_blank` and hash links. Reduced motion means an instant swap.

### 8.4 Micro-interactions checklist (P6a)

Before calling P6a done, tick each of these against the live site:

- [ ] nav paw on hover and active
- [ ] button lift and press
- [ ] chip states
- [ ] door hover peek
- [ ] sketch-card ring retrace and doodle hop
- [ ] polaroid hover tilt
- [ ] ticket hover
- [ ] note pin wiggle
- [ ] tape and paper shadows
- [ ] gallery thumbnail active ring
- [ ] focus-visible rings everywhere

---

## 9. Phases (each is a separate prompt in `docs/PROMPTS.md`)

| Phase | Scope | Time box | Done when |
|---|---|---|---|
| **P0** Scaffold & skeleton deploy | create-next-app (Next 16, TS, Tailwind v4, ESLint, `src/`, npm); move `CLAUDE.md`; deps (lenis, motion, zod, @playwright/test); fonts with axes (§2.3); tokens, base and shared utilities in `globals.css`; root metadata, noindex, icons, headers (§2.5); temporary hero h1; public GitHub repo `Tanmay-Singh-24/teddypups-clone`; **Vercel import by you** | 1.5h | lint and build pass; computed `font-variation-settings` on the h1 is `"SOFT" 100, "WONK" 1, "opsz" 144`; **live Vercel URL** |
| **P1** Content, media, art | `scripts/extract-content.mjs` → `src/content/*`; `fetch-media.mjs` → `public/media/**`; `extract-svgs.mjs` → `docs/reference/svg/`; `verify-content.mjs` | 2.5h | verify: 42 puppies (15 available / 27 gone home), 64 family photos, 9 FAQs, and every media path exists |
| **P2** Global shell | Header (states), menu dialog, footer, bottom bar, skip link, Lenis provider, LOST not-found, **stub pages for every route** | 3h | all links route; header and menu behave like the reference at 375/1024/1440; footer matches screen 13 |
| **P3** Homepage (static) | 8 scenes with exact copy, art, skies, quilts; responsive; hooks for P6 (`.pup-stop` anchors, door, stamp and house states) | 6h | side by side with the reference at 375/768/1024/1440; section heights within ±10% of §5 |
| **P4** Puppies pages | `/puppies` (filters + URL), `/puppies/[slug]` ×42 (both variants, gallery and viewer, letter form UI, prev/next, metadata, JSON-LD), `/gone-home` | 5h | 42 pages prerender; filters match the live param names and counts; gallery keyboard and swipe work |
| **P5** Other pages + forms | `/happy-families`, `/how-it-works`, `/faq`, `/contact`; Server Action (zod, honeypot, success states, optional Resend) | 5h | all pages match; both forms validate and show success; FAQ search highlights and auto-expands |
| **P6a** Scroll motion | §8.1 + §8.4 | 3h | effects match the reference in Chrome; graceful in Safari; reduced-motion clean |
| **P6b** Curtain + pup actor | §8.2 + §8.3 | 4h | the curtain plays on every internal navigation; the pup travels the homepage stops with poses and prints — **or** the cut line was taken on purpose |
| **P7** QA & tests | Playwright e2e + GitHub Actions CI (§11); fidelity pass on all pages; Lighthouse; real-phone check | 2.5h | CI green; no console errors; Lighthouse a11y ≥ 95 and perf ≥ 85 (desktop) |
| **P8** Ship | production check on the live URL; README; Loom checklist; submission email | 2.5h | §13 checklist all ticked |

**Optional parallel tracks** to save wall-clock time:
- After P2, run **P3 ∥ P4** in two Claude Code sessions on separate git worktrees.
- Later, run **P5 ∥ P6a**.
- They touch different component and style files. Merge each branch into `main` after a quick review. Only `globals.css` imports and `src/content` are shared, so expect a trivial merge at most.

---

## 10. Priorities and cut lines

- **Never cut:**
  - every route and all copy
  - responsive layout at 375–1440
  - header, menu, footer and bottom bar
  - puppies filters, gallery and photo viewers
  - FAQ search and accordion
  - the how-it-works switch
  - both forms
  - the sky gradients, quilt and illustrated components (static)
  - not-found, metadata and the live deploy
- **Cut in this order if behind:**
  1. **Pup actor** → static buddies at every stop with CSS idles (blink, tail, breathe). This keeps about 90% of the look.
  2. **Paw-print trail.**
  3. **Curtain** → a simple 250 ms milk fade.
  4. **Journey phone sequencing** → all messages visible, with a simple fade-in on enter.
  5. **Hero lineup cycling** → a static lineup with the name tags.
  - Keep the **Meet pinned hallway** if at all possible; it's the first thing the reviewers will scroll into.

---

## 11. Testing (for the Loom's "testing" segment)

- **Static:** `npm run lint`, `tsc --noEmit`, `npm run build`. The build prerenders all 49 pages, which is itself a test.
- **Content:** `node scripts/verify-content.mjs` checks the counts and that every media file exists.
- **E2E (Playwright, Chromium):** `e2e/*.spec.ts` runs against `next start`:
  1. every sitemap route returns 200, has one h1 and logs no console errors;
  2. desktop nav and the mobile menu dialog (open, Esc, link closes);
  3. `/puppies`: clicking a chip updates the URL and the count, and Clear resets them;
  4. FAQ: search for "deliver" leaves 1 note, expanded, with a mark; clearing restores 9;
  5. puppy page: next/prev and the counter, opening the viewer, Esc closes it;
  6. enquiry form: required errors, then success (no Resend key, so it logs);
  7. contact letter: success state;
  8. unknown slug shows the LOST page;
  9. at 375px the bottom bar is visible and the header shows the Menu button.
- **CI:** GitHub Actions on push and PR runs install, lint, typecheck, build and Playwright (chromium), uploading the report on failure.
- **Visual fidelity:** a small `scripts/shots.mjs` (Playwright) captures every page at 375 and 1440 for both the reference and the clone into `docs/shots/`. Use them for the fix pass and a side-by-side in the README and Loom.
- **Manual:** a real iPhone in Safari (sticky and pinned hallway, bottom-bar safe area, video), reduced-motion on, keyboard-only pass, Lighthouse.

## 12. Deployment

1. **GitHub:** a public repo, `gh repo create Tanmay-Singh-24/teddypups-clone --public --source . --push`.
2. **Vercel:** you do this once, in the browser. Go to vercel.com → Add New → Project → Import `teddypups-clone` → Framework: Next.js (auto) → Deploy. Every push to `main` then deploys to production and PRs get preview URLs.
3. **Env vars** (Vercel → Settings → Environment Variables):

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | the production URL, e.g. `https://teddypups-clone.vercel.app` |
| `RESEND_API_KEY` | optional | your Resend key |
| `CONTACT_TO_EMAIL` | optional | the address that receives submissions |

4. **Check after every deploy:** open the live URL in the browser and click through every route, a filter, the gallery, the FAQ search, and both forms.
5. **Vercel Hobby image optimisation** is metered. Keep `sizes` tight (§4.3) and don't loop through hundreds of widths. If quota ever becomes an issue, switch the already-small `.avif` files to `unoptimized`.

## 13. Deliverables checklist

**README.md must cover:**
- the live URL, plus 2–4 screenshots (desktop and mobile)
- the stack and why
- the project structure
- how to run it (`npm i`, `npm run dev`, scripts)
- how the clone was built (recon → spec → phases)
- implementation decisions and challenges: pup engine, pinned hallway, page curtain, Safari fallbacks, static content layer instead of a CMS, forms
- testing: commands, CI badge
- deployment
- an **AI usage** section: the tools, the model and effort, and a link to `docs/PROMPTS.md`
- credits and disclaimer: "Educational clone of puppy.instabizweb.com built for the Insta Biz Web technical assignment. All media, artwork and brand content belong to their owners. The site is noindexed."

**Loom outline (aim for 10–12 min).** Speak in your own words; these are the beats, not a script:

| Time | Beat |
|---|---|
| 0:00 | **Demo:** live site, homepage scroll (sky, hallway, phone, passport, night), filters, a puppy page and gallery, FAQ search, contact form, mobile view in DevTools |
| 2:30 | **Process:** how you analysed the reference (DevTools, captured HTML, CSS and fonts, the 49-URL sitemap, the measured sections) → `docs/PLAN.md` → phases |
| 4:00 | **Structure:** walk the repo tree (§3.2), content layer, components per scene, styles per component |
| 5:30 | **Tech:** Next 16 App Router, Tailwind v4, Lenis, Motion, Server Actions, Vercel, and why each one matches the reference |
| 6:30 | **AI tools + exact prompts:** open `docs/PROMPTS.md`; the planning prompt (Opus, max) and the phase prompts (Opus, high); show one session transcript and how you reviewed and steered the output |
| 8:00 | **Decisions and challenges:** mascot engine (or why you took the cut line), pinned hallway maths, curtain timing with the App Router, Safari without scroll timelines, image volume, honeypot and validation |
| 10:00 | **Testing and deployment:** run `npm run test:e2e` or show CI green, Lighthouse, Vercel deploys from `main` |
| 11:30 | Wrap-up |

**Emails:**
- **Accept.** Reply to the assignment email when you start, something like: "Hi [name], thank you for shortlisting me. I accept the assignment and the 48-hour submission deadline, and will send the live URL, GitHub repository and Loom video before [day, time IST]. Best regards, [Full name]". Use your own words.
- **Submit.** Subject exactly: `Technical Assignment Submission – [Your Full Name] – Insta Biz Web`. The body lists the Live URL, the GitHub URL and the Loom URL (with "anyone with the link can view" set), plus one line on the stack.

## 14. Risks

| Risk | Mitigation |
|---|---|
| Mascot engine eats the schedule | 4h timebox; static buddies are already built in P3 (cut line 1) |
| Pinned hallway jank or wrong maths on resize | Compute from measured widths in a `ResizeObserver`; `will-change: transform`; disable under 768px or with reduced motion (grid fallback) |
| Lenis vs sticky, dialogs or anchors | Lenis keeps native scroll (sticky still works). `data-lenis-prevent` on dialogs. Use `lenis.scrollTo` for hash links with a header offset. |
| Safari/Firefox lack `animation-timeline` | `@supports` plus an IntersectionObserver fallback; always a good final frame |
| Font axes missing, so the type looks "off" | Load the SOFT/WONK/opsz and BNCE/INFM axes in `next/font`; verify computed styles in P0 |
| Flight-payload extraction is fiddly | Prefer bracket-matched JSON slices (`"media":[…]`) plus rendered HTML; verify counts in a script |
| Image or video weight on Vercel and GitHub | Tight `sizes`; videos `preload="none"` with posters; total under 100 MB |
| Server Actions or CSP break forms in production | Test the forms on the live URL in P8; relax the CSP directive if needed |
| Running out of time | §10 cut order; parallel tracks (§9); deploy skeleton in P0 so shipping never blocks |
| Cloning a real business | noindex, README disclaimer, no claim to be TeddyPups |

## 15. Schedule (T0 = your acceptance reply)

| Window | Work |
|---|---|
| T+0 → T+1.5 | P0, live skeleton URL ✅ |
| T+1.5 → T+4 | P1 |
| T+4 → T+7 | P2 |
| T+7 → T+13 | P3 (∥ P4 if running two sessions) |
| T+13 → T+20 | **Sleep** |
| T+20 → T+25 | P4 (or P5 if P4 ran in parallel) |
| T+25 → T+30 | P5 ∥ P6a |
| T+30 → T+34 | P6b |
| T+34 → T+36.5 | P7 |
| T+36.5 → T+39 | P8: README, record the Loom (do a dry run first), send |
| T+39 → T+48 | **Buffer.** Don't plan to use it. |
