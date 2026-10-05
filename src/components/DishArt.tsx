const CREAM = "#fffdf8";
const LINE = "#e7dfd1";
const GOLD = "#d9a441";
const DEEP = "#7a4a2a";
const GREEN = "#4f7a4a";
const RED = "#bc3a24";
const SEA = "#10495a";
const SHELL = "#f2ebe0";

const plate = (
  <>
    <circle cx="48" cy="49" r="31" fill={CREAM} stroke={LINE} />
    <circle cx="48" cy="49" r="24" fill="none" stroke={LINE} strokeOpacity="0.7" />
  </>
);

function shape(art: string) {
  switch (art) {
    case "plate":
      return (
        <>
          {plate}
          <path d="M31 53c0-9 7.6-15 17-15s17 6 17 15Z" fill={CREAM} stroke={LINE} />
          <ellipse cx="37" cy="58" rx="8" ry="4.6" fill={DEEP} />
          <ellipse cx="59" cy="59" rx="8" ry="4.6" fill={GOLD} />
          <circle cx="48" cy="38" r="3.4" fill={RED} />
        </>
      );
    case "salad":
      return (
        <>
          {plate}
          <circle cx="40" cy="50" r="10" fill={GREEN} />
          <circle cx="57" cy="52" r="8.6" fill="#6b9a5e" />
          <circle cx="48" cy="61" r="7" fill={GOLD} />
          <path d="M33 43c9-4 21-4 30 0" stroke={DEEP} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    case "stew":
      return (
        <>
          {plate}
          <path d="M25 45h46a23 23 0 0 1-46 0Z" fill={DEEP} />
          <circle cx="41" cy="52" r="5.4" fill="#5d3520" />
          <circle cx="55" cy="55" r="6.2" fill="#8a5730" />
          <circle cx="48" cy="46" r="4.4" fill="#5d3520" />
        </>
      );
    case "noodles":
      return (
        <>
          {plate}
          <path d="M29 46c6 7 12-7 18 0s12 7 18 0" stroke={GOLD} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M29 55c6 7 12-7 18 0s12 7 18 0" stroke="#e0b45f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <circle cx="48" cy="36" r="6" fill={CREAM} stroke={LINE} />
          <circle cx="48" cy="36" r="2.6" fill={GOLD} />
        </>
      );
    case "soup":
      return (
        <>
          <path d="M22 47h52a26 26 0 0 1-52 0Z" fill={CREAM} stroke={LINE} />
          <path d="M31 47c3.6-6 9.4-9 17-9s13.4 3 17 9Z" fill={GOLD} opacity="0.75" />
          <circle cx="42" cy="43" r="4.6" fill={CREAM} stroke={LINE} />
          <path d="M41 30c2 3 4 4 4 6.4M52 28c2 3 4 4.4 4 7" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      );
    case "skewer":
      return (
        <g transform="rotate(-18 48 48)">
          <path d="M26 40h44M26 50h44M26 60h44" stroke={LINE} strokeWidth="2" />
          <circle cx="36" cy="40" r="6" fill={DEEP} />
          <circle cx="50" cy="40" r="6" fill="#8a5730" />
          <circle cx="64" cy="40" r="6" fill={DEEP} />
          <circle cx="40" cy="50" r="6" fill="#8a5730" />
          <circle cx="54" cy="50" r="6" fill={DEEP} />
          <circle cx="44" cy="60" r="6" fill={DEEP} />
          <circle cx="58" cy="60" r="6" fill="#8a5730" />
        </g>
      );
    case "fritter":
      return (
        <>
          <circle cx="37" cy="50" r="12" fill={GOLD} />
          <circle cx="57" cy="55" r="11" fill="#e0b45f" />
          <circle cx="34" cy="47" r="1.6" fill={CREAM} />
          <circle cx="40" cy="54" r="1.6" fill={CREAM} />
          <circle cx="59" cy="51" r="1.6" fill={CREAM} />
          <circle cx="53" cy="59" r="1.6" fill={CREAM} />
        </>
      );
    case "pastry":
      return (
        <>
          <path d="M22 58a14 14 0 0 1 28 0Z" fill={GOLD} stroke="#c08a2e" />
          <path d="M46 62a13 13 0 0 1 26 0Z" fill="#e0b45f" stroke="#c08a2e" />
          <path d="M28 58c2-5 6-8 8-8s6 3 8 8" stroke="#c08a2e" strokeWidth="1.6" fill="none" />
        </>
      );
    case "cheese":
      return (
        <>
          <path d="M27 62a21 21 0 0 1 42 0Z" fill={GOLD} />
          <path d="M33 62a15 15 0 0 1 30 0Z" fill="#c98f3c" opacity="0.7" />
          <circle cx="42" cy="55" r="2.6" fill="#5d3520" />
          <circle cx="53" cy="57" r="2.6" fill="#5d3520" />
          <circle cx="48" cy="51" r="2.2" fill="#f2ebe0" />
        </>
      );
    case "funchi":
      return (
        <>
          <g transform="rotate(-8 48 50)">
            <rect x="26" y="44" width="22" height="11" rx="3" fill={GOLD} />
            <rect x="30" y="57" width="22" height="11" rx="3" fill="#e0b45f" />
          </g>
          <circle cx="63" cy="50" r="11" fill={CREAM} stroke={LINE} />
          <circle cx="63" cy="50" r="4.6" fill={GOLD} />
        </>
      );
    case "sweet":
      return (
        <>
          <circle cx="38" cy="53" r="11" fill={GOLD} />
          <circle cx="56" cy="49" r="9.6" fill="#e0b45f" />
          <circle cx="51" cy="62" r="7.4" fill="#c98f3c" />
          <path d="M33 41c4 4 10 5 16 3" stroke={DEEP} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      );
    case "drink":
      return (
        <>
          <path d="M36 32h24l-3.4 36H39.4L36 32Z" fill="#e6eff1" stroke="#cfdcdf" />
          <path d="M38.6 50h18.8l-2 18H40.6l-2-18Z" fill={GOLD} opacity="0.55" />
          <path d="M57 30l-4 20" stroke={RED} strokeWidth="3" strokeLinecap="round" />
          <rect x="41" y="40" width="9" height="8" rx="2" fill={CREAM} opacity="0.8" />
        </>
      );
    case "coffee":
      return (
        <>
          <path d="M30 40h30v12a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12V40Z" fill={CREAM} stroke={LINE} />
          <path d="M60 44h4a6 6 0 0 1 0 12h-4" fill="none" stroke={LINE} strokeWidth="2.4" />
          <ellipse cx="45" cy="68" rx="20" ry="4" fill={LINE} />
          <path d="M40 30c2 2.6 3.6 3.6 3.6 5.6M50 28c2 2.6 3.6 3.6 3.6 5.6" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          {plate}
          <circle cx="48" cy="49" r="10" fill={GOLD} />
        </>
      );
  }
}

export function DishArt({ art, className }: { art: string; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-hidden="true">
      <rect width="96" height="96" fill={SHELL} />
      <circle cx="50" cy="20" r="30" fill={SEA} opacity="0.05" />
      {shape(art)}
    </svg>
  );
}
