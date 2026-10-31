import type { ReactNode } from "react";

// Temporary P2 scaffold: the page's real heading and lede so every route and link resolves.
// Each one is replaced by the full page in P4 (puppies, gone home) or P5 (the rest).
export function PageStub({ title, lede, children }: { title: string; lede: string; children?: ReactNode }) {
  return (
    <div className="gutter mx-auto max-w-[110rem] pb-24 pt-16 md:pt-24">
      <h1 className="font-plush text-giant">{title}</h1>
      <p className="text-lede mt-6 max-w-[52ch] text-cocoa-soft">{lede}</p>
      {children}
    </div>
  );
}
