import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Paw } from "@/components/art/Paw";
import { PupBuddy } from "@/components/art/PupBuddy";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { PuppyGallery } from "@/components/puppies/PuppyGallery";
import { StoryRibbon } from "@/components/puppies/StoryRibbon";
import { Photo } from "@/components/ui/Photo";
import { allPuppies, getNeighbours, getPuppy } from "@/content/puppies";
import { ENQUIRY_SUCCESS, SITE_URL } from "@/content/site";
import type { Puppy } from "@/content/types";
import { puppyDescription, puppyFormLabel, puppyTitle } from "@/lib/puppy-text";
import { puppyWaLink } from "@/lib/whatsapp";

// Every puppy is prerendered. An unknown slug renders on request, and `ensureStatic = "navigation"`
// makes that first request wait for the complete render, so notFound() below sets a real 404 (the
// LOST poster, titled "Puppy not found") instead of streaming a 200 shell first.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return allPuppies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/puppies/[slug]">): Promise<Metadata> {
  const puppy = getPuppy((await params).slug);
  if (!puppy) return { title: "Puppy not found" };
  const title = puppyTitle(puppy);
  const description = puppyDescription(puppy);
  const { cover } = puppy;
  const image = { url: `${SITE_URL}${cover.url}`, width: cover.width, height: cover.height, alt: cover.alt };
  return {
    title,
    description,
    alternates: { canonical: `/puppies/${puppy.slug}` },
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

const CHECKLIST = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];

const IMPORT_STEPS = [
  ["Reserve your puppy", "Tell us which puppy has captured your heart."],
  ["Personalized consultation", "We finalize details with you and share updates on your puppy's journey."],
  ["Import and arrival", "We manage health checks, travel arrangements, and documentation."],
  ["Welcome home", "We help your new puppy settle in and ensure a smooth transition into your home."],
];

function Chapter({ n, children }: { n: number; children: ReactNode }) {
  return (
    <p className="tp-chapter">
      <span aria-hidden="true" className="tp-chapter__n font-plush">
        {n}
      </span>
      <span className="font-scrawl">{children}</span>
    </p>
  );
}

function Neighbour({ puppy, rel }: { puppy: Puppy; rel: string }) {
  return (
    <Link
      className="group flex items-center gap-5 rounded-[2rem] border-[3px] border-cocoa bg-milk p-4 transition-transform duration-500 hover:-rotate-1 sm:last:flex-row-reverse sm:last:text-right"
      href={`/puppies/${puppy.slug}`}
    >
      <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[999px_999px_0.6rem_0.6rem] border-[3px] border-cocoa bg-honey-soft">
        <Photo media={puppy.cover} sizes="80px" />
      </span>
      <span>
        <span className="font-scrawl block text-sm text-cocoa-soft">{rel}</span>
        <span className="font-plush text-[1.6rem]">{puppy.displayName}</span>
      </span>
    </Link>
  );
}

export default async function PuppyPage({ params }: PageProps<"/puppies/[slug]">) {
  const puppy = getPuppy((await params).slug);
  if (!puppy) notFound();

  const { slug, name, displayName, breed } = puppy;
  const home = puppy.status === "gone-home";
  const imported = puppy.origin.slug === "imported";
  const wayHome = !home && imported;
  const letterChapter = wayHome ? 4 : 3;
  const { previous, next } = getNeighbours(puppy);
  const facts: [string, string][] = [
    ["Breed", breed],
    ["Boy or girl", puppy.genderLabel],
    ["Age", puppy.age],
    ...(puppy.colour ? [["Colour", puppy.colour] as [string, string]] : []),
    ["Where", imported ? "Imported for you" : "In Dubai"],
  ];
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Puppies", item: `${SITE_URL}/puppies` },
      { "@type": "ListItem", position: 2, name: displayName, item: `${SITE_URL}/puppies/${slug}` },
    ],
  };

  return (
    <div data-page="pup" className="tp-page">
      <article
        className="tp-storybook"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${puppy.media[0].color} 24%, var(--color-milk)) 0, var(--color-milk) 85%)`,
        }}
      >
        <StoryRibbon />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
        />
        <div className="gutter mx-auto max-w-[110rem] pb-20 pt-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="text-[0.95rem] font-semibold text-cocoa-soft">
            <Link className="link-ink" href={home ? "/gone-home" : "/puppies"}>
              {home ? "Gone home" : "Available puppies"}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{displayName}</span>
          </nav>
          <Chapter n={1}>{home ? "the day they went home" : "hello, it's me"}</Chapter>
          <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-7">
              <PuppyGallery name={displayName} media={puppy.media} />
            </div>
            <div className="min-w-0 lg:col-span-5">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+5.5rem)]">
                <div
                  className="tp-tag tp-board mt-16 !rounded-[2.2rem_2.2rem_2.2rem_0.6rem] !p-7 md:!p-9 lg:mt-20"
                  data-reveal="true"
                >
                  <span aria-hidden="true" className="tp-tag__ring" />
                  <PupBuddy
                    pose="peek"
                    className="absolute -top-[4.8rem] right-6 w-[9.5rem]"
                    label={`Teddy, peeking over ${displayName}'s tag`}
                  />
                  {home ? (
                    <span className="inline-grid place-items-center rounded-full border-[3px] border-current px-3 py-1 font-scrawl text-sm uppercase tracking-wide -rotate-6 text-toffee-deep">
                      Gone home ♥
                    </span>
                  ) : (
                    <span className="chip">
                      <Paw className="size-4 text-toffee" />
                      Available
                    </span>
                  )}
                  <h1 className="font-plush mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">{displayName}</h1>
                  {name && <p className="mt-2 text-lg font-semibold text-cocoa-soft">{breed}</p>}
                  <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                    {facts.map(([term, value]) => (
                      <div key={term}>
                        <dt className="font-scrawl text-sm text-cocoa-soft">{term}</dt>
                        <dd className="mt-0.5 text-[1.05rem] font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {puppy.description && <p className="mt-6 whitespace-pre-line text-cocoa-soft">{puppy.description}</p>}
                  <div className="mt-8 flex flex-col gap-3">
                    <a href={puppyWaLink(puppy)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                      {home ? "Ask about a puppy like this" : `Ask about ${name ?? "this puppy"} on WhatsApp`}
                    </a>
                    <a href={`#enquire-${slug}`} className="btn btn-ghost">
                      Send an enquiry
                    </a>
                  </div>
                </div>
                <div className="tp-paper mt-8 -rotate-1">
                  <Chapter n={2}>what comes with {name ?? `this ${breed}`}</Chapter>
                  <h2 className="font-plush mt-1 text-[1.9rem]">Every Teddy Pup comes</h2>
                  <ul className="mt-4 space-y-2.5">
                    {CHECKLIST.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-semibold">
                        <svg viewBox="0 0 32 32" className="mt-0.5 size-6 shrink-0 text-toffee-deep" aria-hidden="true">
                          <path
                            d="M5 17l7 7L27 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {wayHome && (
            <section aria-labelledby={`home-steps-${slug}`} className="mt-20">
              <Chapter n={3}>the way home</Chapter>
              <h2 id={`home-steps-${slug}`} className="font-plush text-big mt-3">
                Coming home from abroad
              </h2>
              <ol className="tp-trail tp-trail--row tp-trail--paws mt-10">
                {IMPORT_STEPS.map(([title, text], i) => (
                  <li key={title}>
                    <span aria-hidden="true" className="tp-trail__num font-plush">
                      {i + 1}
                    </span>
                    <h3 className="font-plush-text text-xl font-bold leading-tight">{title}</h3>
                    <p className="mt-2 max-w-[38ch] text-cocoa-soft">{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section
            id={`enquire-${slug}`}
            aria-labelledby={`enquire-title-${slug}`}
            className="tp-letter mt-20 grid gap-10 lg:grid-cols-12"
          >
            <span aria-hidden="true" className="tp-letter__stamp">
              <Paw className="size-9" />
            </span>
            <div className="lg:col-span-4">
              <Chapter n={letterChapter}>dear TeddyPups…</Chapter>
              <h2 id={`enquire-title-${slug}`} className="font-plush text-big mt-2">
                {home ? "Looking for a puppy like this?" : `Ask about ${name ?? "this puppy"}`}
              </h2>
              <p className="mt-4 text-cocoa-soft">
                Leave your details and our team will get back to you promptly — or message us on WhatsApp for the quickest
                reply.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <EnquiryForm
                puppy={{ id: puppy.id, label: puppyFormLabel(puppy) }}
                success={ENQUIRY_SUCCESS}
                whatsappHref={puppyWaLink(puppy)}
              />
            </div>
          </section>
          <nav aria-label="More puppies" className="mt-16 grid gap-4 sm:grid-cols-2">
            <Neighbour puppy={previous} rel="Previous pup" />
            <Neighbour puppy={next} rel="Next pup" />
          </nav>
        </div>
      </article>
    </div>
  );
}
