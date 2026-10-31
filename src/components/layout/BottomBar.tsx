import { PHONE } from "@/content/site";
import { defaultWaLink } from "@/lib/whatsapp";

/** Phones only (under 768px): a fixed WhatsApp / Call bar along the bottom edge. */
export function BottomBar() {
  return (
    <div
      data-whatsapp-bar="true"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-cocoa bg-milk px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 md:hidden"
    >
      <div className="mx-auto flex max-w-md gap-2">
        <a href={defaultWaLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !min-h-12 flex-1 !shadow-none">
          WhatsApp us
        </a>
        <a href={`tel:${PHONE}`} className="btn btn-ghost !min-h-12 !px-5">
          Call
        </a>
      </div>
    </div>
  );
}
