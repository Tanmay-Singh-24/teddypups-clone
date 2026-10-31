import Link from "next/link";
import type { Puppy } from "@/content/types";
import { puppyTitle } from "@/lib/puppy-text";

/** Temporary P2 list of profile links, so every puppy page is reachable before the real grids land. */
export function PuppyLinks({ puppies }: { puppies: Puppy[] }) {
  return (
    <ul className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {puppies.map((p) => (
        <li key={p.slug}>
          <Link className="link-ink font-semibold" href={`/puppies/${p.slug}`}>
            {puppyTitle(p)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
