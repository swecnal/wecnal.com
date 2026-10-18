// Hero art: a brass porthole looking out on a synthwave sunset with a pirate ship.

const INK = "#14101f";
const BONE = "#fff4e0";

// One wave period is 40 units; paths run wide so the slide animation loops seamlessly.
function wave(y: number, amp: number) {
  let d = `M-80 ${y}`;
  for (let x = -80; x < 560; x += 40) d += ` q10 ${-amp} 20 0 t20 0`;
  return d;
}

export function Porthole() {
  const bolts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    return { cx: 200 + Math.cos(a) * 172, cy: 200 + Math.sin(a) * 172 };
  });

  return (
    <svg className="porthole" viewBox="0 0 400 400" role="img" aria-label="A pirate ship sailing past a striped sunset, seen through a porthole">
      <defs>
        <linearGradient id="ph-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd23f" />
          <stop offset="0.5" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#ff2e93" />
        </linearGradient>
        <linearGradient id="ph-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1650" />
          <stop offset="0.6" stopColor="#8b3dff" />
          <stop offset="1" stopColor="#ff2e93" />
        </linearGradient>
        <linearGradient id="ph-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b21b6" />
          <stop offset="1" stopColor="#00c9a7" />
        </linearGradient>
        <linearGradient id="ph-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#ff7a1a" />
        </linearGradient>
        <clipPath id="ph-glass">
          <circle cx="200" cy="200" r="148" />
        </clipPath>
        <clipPath id="ph-above">
          <rect x="0" y="0" width="400" height="236" />
        </clipPath>
      </defs>

      {/* brass ring */}
      <circle cx="200" cy="200" r="194" fill="url(#ph-brass)" stroke={INK} strokeWidth="6" />
      <circle cx="200" cy="200" r="150" fill="none" stroke={INK} strokeWidth="6" />
      {bolts.map((b, i) => (
        <g key={i}>
          <circle cx={b.cx} cy={b.cy} r="8" fill={BONE} stroke={INK} strokeWidth="3.5" />
          <path d={`M${b.cx - 4} ${b.cy}h8`} stroke={INK} strokeWidth="2.5" />
        </g>
      ))}

      <g clipPath="url(#ph-glass)">
        <rect x="0" y="0" width="400" height="240" fill="url(#ph-sky)" />

        {/* stars */}
        {[
          [110, 80],
          [150, 62],
          [262, 70],
          [300, 96],
          [92, 128],
          [318, 140],
        ].map(([x, y], i) => (
          <path key={i} className="ph-twinkle" style={{ animationDelay: `${i * 0.6}s` }} d={`M${x} ${y - 4}v8M${x - 4} ${y}h8`} stroke={BONE} strokeWidth="2" />
        ))}

        {/* striped sun sinking into the horizon */}
        <g clipPath="url(#ph-above)">
          <circle cx="200" cy="222" r="92" fill="url(#ph-sun)" stroke={INK} strokeWidth="5" />
          {[
            [168, 4],
            [184, 6],
            [199, 8],
            [214, 10],
            [228, 12],
          ].map(([y, h]) => (
            <rect key={y} x="100" y={y} width="200" height={h} fill="#c0247a" />
          ))}
        </g>

        {/* sea */}
        <rect x="0" y="236" width="400" height="170" fill="url(#ph-sea)" />
        <path d="M0 236H400" stroke={INK} strokeWidth="5" />
        {/* sun reflection */}
        {[
          [158, 248, 84],
          [172, 262, 56],
          [184, 276, 32],
        ].map(([x, y, w]) => (
          <rect key={y} x={x} y={y} width={w} height="5" rx="2.5" fill="#ffd23f" opacity="0.85" />
        ))}

        {/* the ship, sailing a little right of the sun so the sun stays visible */}
        <g transform="translate(262 240) scale(0.8) translate(-216 -240)">
        <g className="ph-ship">
          {/* masts */}
          <path d="M178 238V96M232 238V118M150 214 116 196" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          {/* sails */}
          <path d="M184 106h46c8 22 8 46 0 68h-46c6-22 6-46 0-68Z" fill={BONE} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M238 128h34c6 18 6 36 0 54h-34c5-18 5-36 0-54Z" fill={BONE} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M172 112c-14 16-22 40-20 62l20-6Z" fill={BONE} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          {/* skull on the main sail */}
          <g transform="translate(193 120) scale(2.8)">
            <path d="M5 .6C2.4.6.8 2.4.8 4.7c0 1.4.7 2.4 1.7 3V9.4h5V7.7c1-.6 1.7-1.6 1.7-3C9.2 2.4 7.6.6 5 .6Z" fill={INK} />
            <rect x="2.4" y="3.7" width="2" height="2" fill={BONE} />
            <rect x="5.6" y="3.7" width="2" height="2" fill={BONE} />
            <path d="M1 11.6 9 13.6M9 11.6 1 13.6" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
          </g>
          {/* jolly roger flag */}
          <g className="ph-flag">
            <path d="M178 96h26l-5 8 5 8h-26Z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <circle cx="188" cy="102.5" r="3.2" fill={BONE} />
            <path d="M183 108.5l10-2.5M193 108.5l-10-2.5" stroke={BONE} strokeWidth="1.6" strokeLinecap="round" />
          </g>
          {/* hull */}
          <path d="M132 216h168l-6 10c-4 14-16 22-30 22H170c-16 0-30-10-38-32Z" fill={INK} />
          <path d="M268 216v-16h30v16" fill={INK} stroke={INK} strokeWidth="2" />
          <path d="M140 222h156" stroke="#ff7a1a" strokeWidth="3" />
          {[168, 192, 216, 240].map((x) => (
            <circle key={x} cx={x} cy="234" r="4.5" fill="#ffd23f" />
          ))}
        </g>
        </g>

        {/* waves, in front of the hull */}
        <path className="ph-wave ph-wave-a" d={wave(252, 7)} stroke={INK} strokeWidth="4" fill="none" />
        <path className="ph-wave ph-wave-b" d={wave(292, 8)} stroke={BONE} strokeWidth="3" fill="none" opacity="0.8" />
        <path className="ph-wave ph-wave-a" d={wave(330, 9)} stroke={INK} strokeWidth="4" fill="none" />

        {/* gulls */}
        <path d="M112 112q6-6 12 0q6-6 12 0M280 160q4-4 8 0q4-4 8 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* glass glare */}
        <path d="M100 150a110 110 0 0 1 70-78" stroke={BONE} strokeWidth="8" strokeLinecap="round" opacity="0.45" fill="none" />
      </g>
    </svg>
  );
}
