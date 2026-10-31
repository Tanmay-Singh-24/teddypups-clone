import type { Metadata } from "next";
import { PageStub } from "@/components/pages/PageStub";

export const metadata: Metadata = {
  title: "Visit & contact",
  description: "Visit TeddyPups in Downtown Dubai or get in touch on WhatsApp, by phone or email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageStub
      title="Get in touch with us"
      lede="Have questions about our puppies or adoption process? Fill out the form, and our team will get back to you promptly. Whether ready to adopt or just seeking info, we'd love to hear from you!"
    />
  );
}
