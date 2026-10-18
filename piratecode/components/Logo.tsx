/** Jolly Roger whose eyes are QR finder patterns, on the sunset tile. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <defs>
        <linearGradient id="pc-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a1a" />
          <stop offset="0.45" stopColor="#ff2e93" />
          <stop offset="0.75" stopColor="#8b3dff" />
          <stop offset="1" stopColor="#00c9a7" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="url(#pc-logo)" stroke="#14101f" strokeWidth="3" />
      {/* crossbones */}
      <path d="M7 21.5 25 27.5M25 21.5 7 27.5" stroke="#14101f" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M7 21.5 25 27.5M25 21.5 7 27.5" stroke="#fff4e0" strokeWidth="1.2" strokeLinecap="round" />
      {/* skull */}
      <path
        d="M16 5.2c-4.6 0-7.4 3-7.4 6.9 0 2.4 1.1 4.1 2.7 5.1v3h9.4v-3c1.6-1 2.7-2.7 2.7-5.1 0-3.9-2.8-6.9-7.4-6.9Z"
        fill="#fff4e0"
        stroke="#14101f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* finder-pattern eyes */}
      <g className="logo-eyes">
        <rect x="10.6" y="9.6" width="4.4" height="4.4" fill="#14101f" />
        <rect x="11.6" y="10.6" width="2.4" height="2.4" fill="#fff4e0" />
        <rect x="12.3" y="11.3" width="1" height="1" fill="#14101f" />
        <rect x="17" y="9.6" width="4.4" height="4.4" fill="#14101f" />
        <rect x="18" y="10.6" width="2.4" height="2.4" fill="#fff4e0" />
        <rect x="18.7" y="11.3" width="1" height="1" fill="#14101f" />
      </g>
      <path d="M16 14.6 15 16.4h2Z" fill="#14101f" />
      <path d="M14 20.2v-1.6M16 20.2v-1.6M18 20.2v-1.6" stroke="#14101f" strokeWidth="1" />
    </svg>
  );
}
