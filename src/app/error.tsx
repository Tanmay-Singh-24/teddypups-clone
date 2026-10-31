"use client";

import { useEffect } from "react";
import { PupBuddy } from "@/components/art/PupBuddy";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <div className="gutter mx-auto grid min-h-[70vh] max-w-[110rem] items-center gap-10 py-16 md:grid-cols-2">
      <div>
        <p className="font-scrawl text-lg text-toffee-ink">oops, a tangled lead</p>
        <h1 className="font-plush text-huge mt-3">This page tripped on its way to you.</h1>
        <p className="text-lede mt-6 max-w-[40ch] text-cocoa-soft">
          Something on our side did not load. Give it a moment and try again.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => retry()} className="btn btn-primary">
            Try again
          </button>
          {/* A full page load, in case the client router itself is what broke. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="btn btn-ghost">
            Go home
          </a>
        </div>
        {digest && <p className="mt-6 text-sm text-cocoa-soft">Reference: {digest}</p>}
      </div>
      <div className="relative mx-auto w-full max-w-md">
        <PupBuddy pose="sit" facing="left" className="w-full" label="Teddy, waiting patiently" />
      </div>
    </div>
  );
}
