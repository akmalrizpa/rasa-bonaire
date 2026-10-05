export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60";

export const btnDark =
  "inline-flex items-center justify-center gap-2 rounded-card bg-ink px-4 py-2.5 text-sm font-semibold text-sand transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60";

export const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-card border border-line bg-shell px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60";

export const btnQuiet =
  "inline-flex items-center justify-center gap-2 rounded-card px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-sand hover:text-ink disabled:opacity-60";

// text-base on phones is deliberate: iOS Safari zooms the whole page when a
// field smaller than 16px gets focus.
export const field =
  "w-full rounded-card border border-line bg-shell px-3.5 py-2.5 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent sm:text-sm";

export const label = "block text-xs font-semibold uppercase tracking-[0.14em] text-muted";

export const card = "rounded-card border border-line bg-shell";

export const pill = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold";

export const sectionTitle = "font-display text-2xl sm:text-3xl";

export const pageShell = "mx-auto w-full max-w-6xl px-5";

/** Bottom padding for pages that carry a fixed bar on phones. */
export const mobileBarSpace = "pb-28 lg:pb-0";
