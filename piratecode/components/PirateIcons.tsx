// Pirate icon set. 48x48, thick ink outlines to match the neo-brutalist UI.

const INK = "#14101f";
const BONE = "#fff4e0";

type P = { size?: number; className?: string };

function Svg({ size = 48, className, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke={INK}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function SkullIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M9 33 39 44M39 33 9 44" strokeWidth={4} />
      <circle cx="8" cy="32" r="2.6" fill={BONE} />
      <circle cx="40" cy="32" r="2.6" fill={BONE} />
      <circle cx="8" cy="45" r="2.6" fill={BONE} />
      <circle cx="40" cy="45" r="2.6" fill={BONE} />
      <path d="M24 4C14.6 4 9 10.2 9 18c0 5 2.3 8.4 5.5 10.4V35h19v-6.6C36.7 26.4 39 23 39 18 39 10.2 33.4 4 24 4Z" fill={BONE} />
      <rect x="15" y="15" width="7" height="7" rx="1" fill={INK} stroke="none" />
      <rect x="26" y="15" width="7" height="7" rx="1" fill={INK} stroke="none" />
      <path d="M24 24.5 22 28.5h4Z" fill={INK} strokeWidth={2} />
      <path d="M19.5 35v-3.5M24 35v-3.5M28.5 35v-3.5" strokeWidth={2.5} />
    </Svg>
  );
}

export function AnchorIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="24" cy="8.5" r="4.5" fill="#ffd23f" />
      <path d="M24 13v30M15 19h18" />
      <path d="M7 29c0 8 7.5 14 17 14s17-6 17-14" />
      <path d="M3.5 32 7 27.5l4 4M44.5 32 41 27.5l-4 4" />
    </Svg>
  );
}

export function WheelIcon(p: P) {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return { x1: 24 + Math.cos(a) * 5, y1: 24 + Math.sin(a) * 5, x2: 24 + Math.cos(a) * 21, y2: 24 + Math.sin(a) * 21 };
  });
  return (
    <Svg {...p}>
      {spokes.map((s, i) => (
        <line key={i} {...s} strokeWidth={3.5} />
      ))}
      <circle cx="24" cy="24" r="14" fill="none" stroke={INK} strokeWidth={5} />
      <circle cx="24" cy="24" r="14" fill="none" stroke="#ff7a1a" strokeWidth={1.5} />
      <circle cx="24" cy="24" r="5" fill="#ffd23f" />
    </Svg>
  );
}

export function CompassIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="24" cy="24" r="20" fill={BONE} />
      <path d="M24 7v4M24 37v4M7 24h4M37 24h4" strokeWidth={2.5} />
      <path d="M24 12 29 24H19Z" fill="#ff2e93" strokeWidth={2.5} />
      <path d="M24 36 19 24h10Z" fill={INK} strokeWidth={2.5} />
      <circle cx="24" cy="24" r="2.2" fill={BONE} strokeWidth={2} />
    </Svg>
  );
}

export function FlagIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M9 45V4" strokeWidth={3.5} />
      <path d="M9 7c8-3 14 3 22 0s9-2 12-1v20c-3-1-5-2-12 1s-14-3-22 0Z" fill={INK} />
      <circle cx="24" cy="14" r="4.5" fill={BONE} stroke="none" />
      <rect x="21.6" y="17" width="4.8" height="3.4" fill={BONE} stroke="none" />
      <circle cx="22.4" cy="13.8" r="1.2" fill={INK} stroke="none" />
      <circle cx="25.6" cy="13.8" r="1.2" fill={INK} stroke="none" />
      <path d="M17.5 18.5 30.5 24M30.5 18.5 17.5 24" stroke={BONE} strokeWidth={2} />
    </Svg>
  );
}

export function ChestIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="17" cy="13" r="4" fill="#ffd23f" />
      <circle cx="26" cy="11" r="4" fill="#ffd23f" />
      <circle cx="33" cy="14" r="3.5" fill="#ffd23f" />
      <path d="M5 23c0-6 4-9 9-9h20c5 0 9 3 9 9Z" fill="#ff7a1a" />
      <rect x="5" y="23" width="38" height="20" rx="2" fill="#8b3dff" />
      <path d="M14 14v29M34 14v29" />
      <rect x="20" y="20" width="8" height="10" rx="1.5" fill="#ffd23f" />
      <circle cx="24" cy="25" r="1.2" fill={INK} stroke="none" />
    </Svg>
  );
}

export function SpyglassIcon(p: P) {
  return (
    <Svg {...p}>
      <g transform="rotate(-35 24 24)">
        <rect x="3" y="19" width="12" height="10" rx="1.5" fill="#ff7a1a" />
        <rect x="15" y="17.5" width="14" height="13" rx="1.5" fill="#ffd23f" />
        <rect x="29" y="15.5" width="15" height="17" rx="2" fill="#2de2ff" />
        <path d="M33 19v10" stroke={BONE} strokeWidth={2} />
      </g>
    </Svg>
  );
}

export function MapIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 9 17 5l14 4 13-4v34l-13 4-14-4-13 4Z" fill={BONE} />
      <path d="M17 5v34M31 9v34" strokeWidth={2} />
      <path d="M8 34c4-2 5-8 10-9s8 4 12 1 2-9 6-11" strokeDasharray="3 3.5" strokeWidth={2.5} stroke="#ff2e93" />
      <path d="M33 11.5l6 6M39 11.5l-6 6" strokeWidth={3.5} stroke="#d62828" />
    </Svg>
  );
}

export function BombIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="21" cy="29" r="15" fill={INK} />
      <path d="M14 23a8 8 0 0 1 6-5" stroke={BONE} strokeWidth={2.5} />
      <rect x="27" y="10" width="8" height="7" rx="1" transform="rotate(35 31 13.5)" fill="#8b3dff" />
      <path d="M34 9c2-3 5-3 6-1" strokeWidth={2.5} />
      <path d="M42 6l2-2M43.5 10h3M41 3V0" stroke="#ff7a1a" strokeWidth={2.5} />
    </Svg>
  );
}

export function BottleIcon(p: P) {
  return (
    <Svg {...p}>
      <g transform="rotate(35 24 24)">
        <path d="M20 4h8v3h-1v6c5 2 7 6 7 11v17a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V24c0-5 2-9 7-11V7h-1Z" fill="#00c9a7" />
        <rect x="19.5" y="1" width="9" height="5" rx="1" fill="#ff7a1a" />
        <rect x="18" y="22" width="12" height="15" rx="1" fill={BONE} strokeWidth={2.5} />
        <path d="M21 26.5h6M21 30.5h6M21 34h4" strokeWidth={1.8} />
      </g>
    </Svg>
  );
}

export function LogbookIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M24 10c-5-3-12-3-19-1v31c7-2 14-2 19 1 5-3 12-3 19-1V9c-7-2-14-2-19 1Z" fill={BONE} />
      <path d="M24 10v31" />
      <path d="M10 30l3-5 3 2 4-7" stroke="#8b3dff" strokeWidth={2.5} />
      <path d="M28 18h10M28 23h10M28 28h7" strokeWidth={2} />
    </Svg>
  );
}

export function HourglassIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M10 4h28M10 44h28" strokeWidth={4} />
      <path d="M13 4c0 10 9 13 9 20s-9 10-9 20h22c0-10-9-13-9-20s9-10 9-20Z" fill={BONE} />
      <path d="M17 42c2-5 5-6 7-6s5 1 7 6Z" fill="#ff7a1a" strokeWidth={2} />
      <path d="M18 11h12l-6 7Z" fill="#ff7a1a" strokeWidth={2} />
    </Svg>
  );
}

export function IslandIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M2 40c4-2 7-2 11 0s7 2 11 0 7-2 11 0 7 2 11 0" stroke="#00c9a7" strokeWidth={3} />
      <path d="M8 38c3-7 10-9 16-9s13 2 16 9Z" fill="#ffd23f" />
      <path d="M24 30c0-9 1-15 4-20" strokeWidth={3.5} />
      <path d="M28 10c-6-3-12-1-15 4 5-1 9-1 15-4ZM28 10c5-4 11-3 14 1-5 0-9 0-14-1ZM28 10c1 5-1 10-5 12 0-4 2-8 5-12ZM28 10c4 2 7 6 7 11-3-3-6-6-7-11Z" fill="#00c9a7" strokeWidth={2.5} />
    </Svg>
  );
}

export function CoinIcon(p: P) {
  return (
    <Svg {...p}>
      <ellipse cx="24" cy="36" rx="16" ry="6" fill="#ff7a1a" />
      <ellipse cx="24" cy="29" rx="16" ry="6" fill="#ffd23f" />
      <ellipse cx="24" cy="21" rx="16" ry="6" fill="#ffd23f" />
      <circle cx="24" cy="14" r="10" fill="#ffd23f" />
      <path d="M21 10.5l6 7M27 10.5l-6 7" strokeWidth={2.5} />
    </Svg>
  );
}

/** Tiny inline skull used as a bullet. */
export function SkullBullet({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 .6C2.4.6.8 2.4.8 4.7c0 1.4.7 2.4 1.7 3V9.4h5V7.7c1-.6 1.7-1.6 1.7-3C9.2 2.4 7.6.6 5 .6Z" fill={INK} />
      <rect x="2.4" y="3.7" width="2" height="2" fill={BONE} />
      <rect x="5.6" y="3.7" width="2" height="2" fill={BONE} />
      <path d="M5 6.2 4.4 7.3h1.2Z" fill={BONE} />
    </svg>
  );
}
