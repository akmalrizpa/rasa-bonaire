import { pageShell } from "@/components/ui";

function Bar({ className }: { className: string }) {
  return <div className={`skeleton rounded-card ${className}`} />;
}

export default function Loading() {
  return (
    <div className={`${pageShell} py-12 sm:py-16`} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the kitchen board. The tiles below fill in as the menu arrives.</span>

      <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
        <div className="lg:pt-4">
          <Bar className="h-4 w-56" />
          <Bar className="mt-6 h-12 w-full max-w-xl" />
          <Bar className="mt-3 h-12 w-full max-w-md" />
          <Bar className="mt-7 h-4 w-full max-w-lg" />
          <Bar className="mt-3 h-4 w-full max-w-md" />
          <div className="mt-8 flex flex-wrap gap-3">
            <Bar className="h-11 w-48" />
            <Bar className="h-11 w-40" />
          </div>
          <Bar className="mt-8 h-14 w-full max-w-lg" />
          <div className="mt-8 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
            <Bar className="h-14 w-full" />
            <Bar className="h-14 w-full" />
            <Bar className="h-14 w-full" />
          </div>
        </div>

        <div className="lg:pt-16">
          <div className="rounded-card border border-line bg-shell p-6">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
              <div className="flex-1">
                <Bar className="h-3.5 w-32" />
                <Bar className="mt-3 h-7 w-40" />
                <Bar className="mt-3 h-3 w-52" />
              </div>
              <Bar className="size-11 rounded-full" />
            </div>
            <div className="grid gap-2 pt-5 sm:grid-cols-2">
              <Bar className="h-10 w-full" />
              <Bar className="h-10 w-full" />
              <Bar className="h-10 w-full" />
              <Bar className="h-10 w-full" />
            </div>
            <div className="mt-6 flex items-end gap-3 border-t border-line pt-6">
              <Bar className="aspect-square w-1/3 translate-y-2" />
              <Bar className="aspect-square w-1/3 -translate-y-2" />
              <Bar className="aspect-square w-1/3 translate-y-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-9 w-32 rounded-full" />
        ))}
      </div>

      <div className="mt-16">
        <Bar className="h-8 w-64" />
        <Bar className="mt-3 h-4 w-80" />
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-card border border-line bg-shell">
              <div className="skeleton aspect-[4/3] w-full" />
              <div className="p-4">
                <Bar className="h-3 w-40" />
                <Bar className="mt-3 h-5 w-52" />
                <Bar className="mt-3 h-4 w-full" />
                <div className="mt-5 flex items-end justify-between gap-3">
                  <Bar className="h-8 w-24" />
                  <Bar className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
