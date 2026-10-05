import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconBag(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5.8 8h12.4l-1 12.2H6.8L5.8 8Z" />
      <path d="M9.2 8V6.2a2.8 2.8 0 0 1 5.6 0V8" />
    </Base>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="m15.8 15.8 4 4" />
    </Base>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.6 20c1.4-3.4 4.2-5.1 7.4-5.1s6 1.7 7.4 5.1" />
    </Base>
  );
}

export function IconMenuBars(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16M4 12h16M4 17h11" />
    </Base>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Base>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
    </Base>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4.5 12.8 4.8 4.7L19.5 6.5" />
    </Base>
  );
}

export function IconClock(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.4 2" />
    </Base>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 21s7-6.3 7-11.2A7 7 0 0 0 5 9.8C5 14.7 12 21 12 21Z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </Base>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6.2 3.8h3l1.4 3.6-2 1.5a11 11 0 0 0 5 5l1.5-2 3.6 1.4v3c0 1-.9 1.8-1.9 1.7C10.2 17.4 6 13.2 4.5 5.7c-.1-1 .7-1.9 1.7-1.9Z" />
    </Base>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.2" y="5.5" width="17.6" height="13" rx="2" />
      <path d="m4.4 7.4 7.6 5.2 7.6-5.2" />
    </Base>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </Base>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m9.5 6.5 5.5 5.5-5.5 5.5" />
    </Base>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12h15m-5.6-5.6L19 12l-5.6 5.6" />
    </Base>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.5 7h15M9.5 7V4.8h5V7M6.8 7l.9 12.4h8.6L17.2 7" />
    </Base>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 20h4.2L20 8.2 15.8 4 4 15.8V20Z" />
      <path d="m14.4 5.4 4.2 4.2" />
    </Base>
  );
}

export function IconChart(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3.5 20h17M7 20v-8M12 20V5M17 20v-5" />
    </Base>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14.5 4.8H6.2a1.8 1.8 0 0 0-1.8 1.8v10.8a1.8 1.8 0 0 0 1.8 1.8h8.3" />
      <path d="M19.5 12h-9m9 0-3.2-3.2M19.5 12l-3.2 3.2" />
    </Base>
  );
}

export function IconStar({ size = 20, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="m12 3.6 2.6 5.3 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.2s4 4.3 4 8.1a4 4 0 0 1-8 0c0-1.5.6-2.7 1.5-3.6C10.4 6.6 12 5 12 3.2Z" />
    </Base>
  );
}

export function IconBike(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="6.4" cy="16.6" r="2.6" />
      <circle cx="17.6" cy="16.6" r="2.6" />
      <path d="M9 16.6 12.4 7h3.4M9.4 11.2h6.8l1.4 5.4" />
    </Base>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 3.4h12v17.2l-3-1.9-3 1.9-3-1.9-3 1.9V3.4Z" />
      <path d="M9 8.2h6M9 12h6" />
    </Base>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.2 19 6v6.1c0 4.2-2.9 7.5-7 8.7-4.1-1.2-7-4.5-7-8.7V6l7-2.8Z" />
      <path d="m9.2 11.8 2 2 3.6-3.8" />
    </Base>
  );
}

export function IconBox(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3.6 7.6 12 3.2l8.4 4.4v8.8L12 20.8l-8.4-4.4V7.6Z" />
      <path d="M3.6 7.6 12 12l8.4-4.4M12 12v8.8" />
    </Base>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="9.4" cy="8.6" r="3.2" />
      <path d="M3.4 19.4c1.2-3 3.5-4.5 6-4.5s4.8 1.5 6 4.5" />
      <path d="M16.4 6.2a3 3 0 0 1 0 5.8M17.6 15.4c1.6.6 2.7 1.9 3.3 3.6" />
    </Base>
  );
}

export function IconBank(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3.4 9.6 12 4.4l8.6 5.2H3.4Z" />
      <path d="M6 11.2v6.4M12 11.2v6.4M18 11.2v6.4M3.6 19.6h16.8" />
    </Base>
  );
}

export function IconQr(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.6" y="3.6" width="6.4" height="6.4" rx="1.4" />
      <rect x="14" y="3.6" width="6.4" height="6.4" rx="1.4" />
      <rect x="3.6" y="14" width="6.4" height="6.4" rx="1.4" />
      <path d="M14 14h2.6v2.6H14zM17.8 17.8h2.6v2.6h-2.6zM14 20.4h2.2M20.4 14v2.2" />
    </Base>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.4" y="6" width="17.2" height="12.4" rx="2.2" />
      <path d="M3.4 10.4h17.2" />
      <circle cx="16.6" cy="14.6" r="1.1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.4M12 8.2v.2" />
    </Base>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 8h4.5M13 8h7M4 16h8.5M17 16h3" />
      <circle cx="10.8" cy="8" r="2" />
      <circle cx="14.8" cy="16" r="2" />
    </Base>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.8 6.8l2.4 2.4M14.8 14.8l2.4 2.4M17.2 6.8l-2.4 2.4M9.2 14.8l-2.4 2.4" />
    </Base>
  );
}

export function IconSpinner({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={`animate-spin ${className ?? ""}`}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4" />
      <path
        d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
