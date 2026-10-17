/** A QR finder eye with crossed bones behind it. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="pc-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a1a" />
          <stop offset="0.5" stopColor="#8b3dff" />
          <stop offset="1" stopColor="#00c9a7" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="url(#pc-logo)" stroke="#14101f" strokeWidth="3" />
      <path d="M7 7 25 25M25 7 7 25" stroke="#14101f" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="10" y="10" width="12" height="12" rx="2" fill="#fff" stroke="#14101f" strokeWidth="3" />
      <rect x="14" y="14" width="4" height="4" fill="#14101f" />
    </svg>
  );
}
