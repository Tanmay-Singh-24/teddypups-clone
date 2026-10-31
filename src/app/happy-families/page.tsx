import type { Metadata } from "next";
import { PageStub } from "@/components/pages/PageStub";

export const metadata: Metadata = {
  title: "Happy families",
  description: "Real photos shared by TeddyPups families after welcoming their new puppy home.",
  alternates: { canonical: "/happy-families" },
};

export default function HappyFamiliesPage() {
  return (
    <PageStub
      title="Happy families"
      lede="Nothing makes us happier than seeing our puppies in loving homes! Here are some beautiful moments shared by our amazing clients after welcoming their furry friends."
    />
  );
}
