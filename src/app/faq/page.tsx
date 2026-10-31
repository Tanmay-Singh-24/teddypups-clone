import type { Metadata } from "next";
import { PageStub } from "@/components/pages/PageStub";

export const metadata: Metadata = {
  title: "Questions & answers",
  description:
    "Answers about TeddyPups puppies: health checks and vaccinations, meeting local puppies, imported teacup breeds and delivery.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <PageStub
      title="Questions & answers"
      lede="Can't find what you're looking for? Message us on WhatsApp — our team is available 24/7."
    />
  );
}
