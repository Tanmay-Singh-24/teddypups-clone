import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPuppy, allPuppies } from "@/content/puppies";
import { puppyDescription, puppyTitle } from "@/lib/puppy-text";

// Every puppy is prerendered. Unknown slugs render on request and hit notFound() below, which
// (as on the reference) gives the LOST poster under the title "Puppy not found".
export function generateStaticParams() {
  return allPuppies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/puppies/[slug]">): Promise<Metadata> {
  const puppy = getPuppy((await params).slug);
  if (!puppy) return { title: "Puppy not found" };
  return {
    title: puppyTitle(puppy),
    description: puppyDescription(puppy),
    alternates: { canonical: `/puppies/${puppy.slug}` },
  };
}

// Temporary P2 profile: name and breed only. The full page (gallery, facts, letter form) is P4.
export default async function PuppyPage({ params }: PageProps<"/puppies/[slug]">) {
  const puppy = getPuppy((await params).slug);
  if (!puppy) notFound();
  return (
    <div className="gutter mx-auto max-w-[110rem] pb-24 pt-16 md:pt-24">
      <h1 className="font-plush text-[clamp(2.6rem,5vw,4.6rem)]">{puppy.name ?? puppy.breed}</h1>
      <p className="mt-2 text-lg font-semibold text-cocoa-soft">{puppy.breed}</p>
    </div>
  );
}
