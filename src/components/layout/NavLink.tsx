"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Paw } from "@/components/art/Paw";

type NavLinkProps = {
  href: string;
  label: string;
  className: string;
  onNavigate?: () => void;
};

/** A nav link that marks itself active (toffee ink + paw) on its page and the pages below it. */
export function NavLink({ href, label, className, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      data-active={active}
      className={className}
      onNavigate={onNavigate}
    >
      <span>{label}</span>
      <Paw className="tp-nav-link__paw" />
    </Link>
  );
}
