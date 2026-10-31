import type { Metadata } from "next";
import { PageStub } from "@/components/pages/PageStub";
import { PuppyLinks } from "@/components/pages/PuppyLinks";
import { goneHomePuppies } from "@/content/puppies";

export const metadata: Metadata = {
  title: "Gone home",
  description: "TeddyPups puppies who have already joined their families.",
  alternates: { canonical: "/gone-home" },
};

export default function GoneHomePage() {
  return (
    <PageStub
      title="Gone home"
      lede="Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we'll help you find your match."
    >
      <PuppyLinks puppies={goneHomePuppies} />
    </PageStub>
  );
}
