"use client";

import { useEffect, useRef } from "react";
import { Paw } from "@/components/art/Paw";
import { NAV } from "@/content/site";
import { NavLink } from "./NavLink";

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type MobileMenuProps = { whatsappHref: string; phoneDisplay: string };

/** The "Menu" pill (under 1024px) and the full-screen honey menu it opens as a modal <dialog>. */
export function MobileMenu({ whatsappHref, phoneDisplay }: MobileMenuProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Plays tp-menu-out before actually closing; falls back to a timer if animationend never fires.
  const close = () => {
    const dialog = ref.current;
    if (!dialog?.open || dialog.dataset.closing) return;
    if (reducedMotion()) return dialog.close();
    dialog.dataset.closing = "true";
    const finish = () => {
      clearTimeout(timer);
      dialog.removeEventListener("animationend", onEnd);
      if (dialog.dataset.closing) dialog.close();
    };
    const onEnd = (e: AnimationEvent) => e.target === dialog && finish();
    const timer = setTimeout(finish, 600);
    dialog.addEventListener("animationend", onEnd);
  };

  // The page curtain (P6b) announces navigations with this event; close instantly under it.
  useEffect(() => {
    const shut = () => ref.current?.close();
    addEventListener("tp:navigate", shut);
    return () => removeEventListener("tp:navigate", shut);
  }, []);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-cocoa bg-milk px-4 text-[0.95rem] font-semibold lg:hidden"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <Paw className="size-4" />
        Menu
      </button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        className="tp-menu m-0 h-dvh max-h-none w-screen max-w-none bg-honey p-0 text-cocoa backdrop:bg-cocoa/40"
        onClick={(e) => e.target === ref.current && close()}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClose={(e) => delete e.currentTarget.dataset.closing}
      >
        <div className="flex h-full flex-col gutter pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
          <div className="flex items-center justify-between">
            <span className="font-scrawl text-lg">where to, friend?</span>
            <button type="button" onClick={close} className="h-11 rounded-full bg-cocoa px-5 font-semibold text-milk">
              Close
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    onNavigate={close}
                    className="tp-menu-link font-plush block py-2 text-[clamp(2.4rem,11vw,3.4rem)]"
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3">
            <a href={whatsappHref} className="btn btn-whatsapp w-full" target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
            <p className="text-center text-sm font-medium">{phoneDisplay}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
