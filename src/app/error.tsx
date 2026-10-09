"use client";

import Link from "next/link";
import { btnOutline, btnPrimary } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Kitchen failure
      </p>
      <h1 className="mt-3 font-display text-3xl">Something burned in the pass</h1>
      <p className="mt-3 text-sm text-muted">
        The page could not finish loading. It is usually the connection to the database. Try again,
        and if it keeps failing call the kitchen on +599 717 0240 — we can take the order by phone.
      </p>
      <p className="mt-3 text-xs text-muted/70">
        {error.message}
        {error.digest ? ` (ref: ${error.digest})` : ""}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={btnPrimary}>
          Try again
        </button>
        <Link href="/" className={btnOutline}>
          Back to the shop
        </Link>
      </div>
    </div>
  );
}
