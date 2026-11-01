import { Dusk } from "@/components/home/Dusk";
import { Hero } from "@/components/home/Hero";
import { HomeHouse } from "@/components/home/HomeHouse";
import { JourneyChat } from "@/components/home/JourneyChat";
import { MeetHall } from "@/components/home/MeetHall";
import { Night } from "@/components/home/Night";
import { Passport } from "@/components/home/Passport";
import { Paths } from "@/components/home/Paths";
import { PupDirector } from "@/components/pup/PupDirector";
import { ABOUT, ADDRESS, EMAIL, PHONE, SITE_NAME, SITE_URL, SOCIALS } from "@/content/site";

const petStore = {
  "@context": "https://schema.org",
  "@type": "PetStore",
  name: SITE_NAME,
  description: ABOUT,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  image: `${SITE_URL}/brand/logo.png`,
  telephone: PHONE,
  email: EMAIL,
  address: { "@type": "PostalAddress", streetAddress: ADDRESS, addressLocality: "Dubai", addressCountry: "AE" },
  sameAs: SOCIALS.map((s) => s.href),
};

/** The homepage: one scroll story from sunrise to night in eight scenes (docs/PLAN.md §5). */
export default function Home() {
  return (
    <>
      <div data-page="home" className="tp-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(petStore) }} />
        <Hero />
        <MeetHall />
        <Paths />
        <JourneyChat />
        <Passport />
        <Dusk />
        <Night />
        <HomeHouse />
      </div>
      <PupDirector />
    </>
  );
}
