import type { Metadata } from "next";
import { PageStub } from "@/components/pages/PageStub";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Meet a local puppy in our Downtown Dubai showroom or reserve a premium teacup breed imported for you — every step, from choosing to coming home.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <PageStub
      title="How it works"
      lede="Whether you choose to visit us locally or order a premium breed from overseas, TeddyPups is here to make the experience unforgettable."
    >
      {/* Target of the footer's "Delivery & collection" link; the real section comes in P5. */}
      <section id="delivery" aria-label="Delivery" />
    </PageStub>
  );
}
