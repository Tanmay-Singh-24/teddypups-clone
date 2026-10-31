// Temporary P0 page: checks the display type against docs/reference/screens/02-home-hero-1440.jpg.
// Replaced by the real homepage scenes in P3.
export default function Home() {
  return (
    <main id="main" className="gutter pt-[var(--header-h)] text-center">
      <p className="font-scrawl text-toffee text-[1.35rem]">every puppy is family</p>
      <h1
        id="hero-title"
        className="font-plush mx-auto mt-[clamp(.5rem,1.6vh,1.1rem)] max-w-[15ch] text-[clamp(2.6rem,min(9.2vw,11vh),8.4rem)]"
      >
        <span className="block">Premium teacup</span>
        <span className="block">puppies in Dubai</span>
      </h1>
      <p className="text-cocoa-soft mx-auto mt-4 max-w-xl">
        Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders
        worldwide.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/puppies" className="btn btn-primary">
          View available puppies
        </a>
        <a href="#" className="btn btn-ghost">
          Enquire on WhatsApp
        </a>
      </div>
    </main>
  );
}
