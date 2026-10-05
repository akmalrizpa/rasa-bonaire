import Link from "next/link";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Rasa Bonaire">
      <circle cx="24" cy="24" r="24" fill="#bc3a24" />
      <circle cx="24" cy="25" r="15.5" fill="none" stroke="#faf6ef" strokeOpacity="0.32" strokeWidth="1.5" />
      <path
        d="M10.5 27.6c3.3 0 4.7-2.5 8-2.5s4.7 2.5 8 2.5 4.7-2.5 8-2.5"
        stroke="#faf6ef"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13.4 33.6c2.6 0 3.7-1.9 6.3-1.9s3.7 1.9 6.3 1.9 3.7-1.9 6.3-1.9"
        stroke="#faf6ef"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 9.6c1.5 2.1 2.2 3.7 2.2 5.3a2.2 2.2 0 0 1-4.4 0c0-1.6.7-3.2 2.2-5.3Z"
        fill="#faf6ef"
      />
    </svg>
  );
}

export function Logo({
  size = 34,
  subtitle = true,
  href = "/",
}: {
  size?: number;
  subtitle?: boolean;
  href?: string | null;
}) {
  const content = (
    <span className="flex items-center gap-3">
      <LogoMark size={size} />
      <span className="flex flex-col">
        <span className="font-display text-[1.35rem] leading-[1.05] tracking-tight">
          Rasa <span className="text-accent">Bonaire</span>
        </span>
        {subtitle ? (
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted">
            Indonesian kitchen · Bonaire
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="shrink-0">
      {content}
    </Link>
  );
}
