/** Faint treasure-map compass rose that sits behind the page. */
export function CompassRose() {
  const ticks = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r1 = i % 4 === 0 ? 84 : 90;
    return { x1: 100 + Math.cos(a) * r1, y1: 100 + Math.sin(a) * r1, x2: 100 + Math.cos(a) * 96, y2: 100 + Math.sin(a) * 96 };
  });
  return (
    <svg className="compass-rose" viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="#14101f" strokeWidth="2">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="80" strokeDasharray="4 5" />
        {ticks.map((t, i) => (
          <line key={i} {...t} />
        ))}
      </g>
      <g stroke="#14101f" strokeWidth="2" strokeLinejoin="round">
        <path d="M100 12 112 100 100 188 88 100Z" fill="#14101f" />
        <path d="M12 100 100 88 188 100 100 112Z" fill="#14101f" />
        <path d="M100 12 112 100H88Z M188 100 100 112V88Z" fill="#fff4e0" />
        <path d="M38 38 106 94 162 162 94 106Z M162 38 106 106 38 162 94 94Z" fill="#fff4e0" />
      </g>
      <text x="100" y="9" textAnchor="middle" fontFamily="serif" fontWeight="700" fontSize="14" fill="#14101f">
        N
      </text>
    </svg>
  );
}
