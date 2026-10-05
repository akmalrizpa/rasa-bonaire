import Link from "next/link";
import { DishArt } from "@/components/DishArt";
import { btnPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24 text-center">
      <DishArt art="soup" className="h-32 w-32 rounded-card" />
      <h1 className="mt-6 font-display text-3xl">That page left the kitchen</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        We looked in the walk-in, behind the wok and under the counter. Nothing. The dish may have
        been renamed, or the link was copied wrong.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/menu" className={btnPrimary}>
          Back to the menu
        </Link>
        <Link
          href="/"
          className="inline-flex items-center rounded-card border border-line bg-shell px-4 py-2.5 text-sm font-semibold"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
