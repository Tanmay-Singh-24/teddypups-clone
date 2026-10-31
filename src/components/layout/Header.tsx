import Image from "next/image";
import Link from "next/link";
import { Hem } from "@/components/art/Hem";
import { NAV, PHONE_DISPLAY, SITE_NAME } from "@/content/site";
import { defaultWaLink } from "@/lib/whatsapp";
import { HeaderBehavior } from "./HeaderBehavior";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    <HeaderBehavior>
      <div className="tp-header__bar gutter">
        <Link className="tp-header__brand" aria-label={`${SITE_NAME} — home`} href="/">
          <Image src="/brand/logo.png" alt="" width={56} height={56} className="tp-header__logo" preload />
          <span className="font-plush tp-header__name">TeddyPups</span>
        </Link>
        <nav aria-label="Main" className="tp-header__nav">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} label={item.label} className="tp-nav-link" />
              </li>
            ))}
          </ul>
        </nav>
        <div className="tp-header__end">
          <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp tp-header__wa">
            WhatsApp us
          </a>
          <MobileMenu whatsappHref={defaultWaLink} phoneDisplay={PHONE_DISPLAY} />
        </div>
      </div>
      <Hem />
    </HeaderBehavior>
  );
}
