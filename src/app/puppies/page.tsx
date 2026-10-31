import type { Metadata } from "next";
import { PageStub } from "@/components/pages/PageStub";
import { PuppyLinks } from "@/components/pages/PuppyLinks";
import { availablePuppies } from "@/content/puppies";

export const metadata: Metadata = {
  title: "Available puppies",
  description:
    "Teacup and teddy bear puppies available now in Dubai and imported from trusted breeders — every listing shows real photos of the puppy.",
  alternates: { canonical: "/puppies" },
};

export default function PuppiesPage() {
  return (
    <PageStub
      title="Available puppies"
      lede="Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about them on WhatsApp."
    >
      <PuppyLinks puppies={availablePuppies} />
    </PageStub>
  );
}
