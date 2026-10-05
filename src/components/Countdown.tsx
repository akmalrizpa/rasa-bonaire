"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    seconds: String(total % 60).padStart(2, "0"),
  };
}

export function Countdown({
  closesAt,
  className,
  compact = false,
}: {
  closesAt: string;
  className?: string;
  compact?: boolean;
}) {
  const target = new Date(closesAt).getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    setRemaining(target - Date.now());
    const timer = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const { hours, minutes, seconds } = parts(remaining);

  if (remaining <= 0) {
    return <span className={className}>Preorder closed — the next batch is open</span>;
  }

  if (compact) {
    return (
      <span className={className}>
        closes in {hours}:{minutes}:{seconds}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 tabular-nums ${className ?? ""}`}>
      <span className="rounded-md bg-ink px-1.5 py-0.5 text-xs font-semibold text-sand">{hours}</span>
      <span className="text-muted">:</span>
      <span className="rounded-md bg-ink px-1.5 py-0.5 text-xs font-semibold text-sand">{minutes}</span>
      <span className="text-muted">:</span>
      <span className="rounded-md bg-ink px-1.5 py-0.5 text-xs font-semibold text-sand">{seconds}</span>
    </span>
  );
}
