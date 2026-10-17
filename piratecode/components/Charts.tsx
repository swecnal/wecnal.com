import type { Breakdown } from "@/lib/stats";

const fmt = new Intl.NumberFormat("en-US");

/** Single-series daily bar chart. Native <title> gives every bar a hover tooltip. */
export function DailyBars({ days }: { days: { day: string; count: number }[] }) {
  const W = 720;
  const H = 220;
  const pad = { l: 34, r: 6, t: 12, b: 26 };
  const max = Math.max(1, ...days.map((d) => d.count));
  const nice = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const bw = (W - pad.l - pad.r) / days.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / nice);
  const ticks = [0, nice / 2, nice];
  const labelEvery = Math.ceil(days.length / 6);

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Scans per day">
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">
              {fmt.format(t)}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const h = y(0) - y(d.count);
          const x = pad.l + i * bw + 1;
          const w = Math.max(1, bw - 2);
          return (
            <g key={d.day}>
              {/* oversized invisible hit target so thin bars are easy to hover */}
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent">
                <title>{`${d.day}: ${fmt.format(d.count)} scan${d.count === 1 ? "" : "s"}`}</title>
              </rect>
              {d.count > 0 && (
                <path
                  className="bar"
                  pointerEvents="none"
                  d={`M${x},${y(0)} v${-Math.max(0, h - 4)} q0,-4 4,-4 h${Math.max(0, w - 8)} q4,0 4,4 v${Math.max(0, h - 4)} z`}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={x + w / 2} y={H - 8} textAnchor="middle">
                  {d.day.slice(5)}
                </text>
              )}
            </g>
          );
        })}
        <line className="axis" x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} />
      </svg>
    </div>
  );
}

export function BarList({ title, data, total }: { title: string; data: Breakdown; total: number }) {
  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      {data.length === 0 ? (
        <p className="muted small" style={{ margin: 0 }}>
          No scans yet.
        </p>
      ) : (
        <ul className="bars">
          {data.map((d) => (
            <li key={d.name} title={`${d.name}: ${fmt.format(d.count)}`}>
              <span className="name">{d.name}</span>
              <span className="mono">
                {fmt.format(d.count)} <span className="muted">· {Math.round((d.count / Math.max(1, total)) * 100)}%</span>
              </span>
              <span className="track">
                <span className="fill" style={{ display: "block", width: `${(d.count / Math.max(1, total)) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HourStrip({ hours }: { hours: number[] }) {
  const max = Math.max(1, ...hours);
  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>Time of day (UTC)</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 2 }}>
        {hours.map((h, i) => (
          <div
            key={i}
            title={`${String(i).padStart(2, "0")}:00 UTC: ${fmt.format(h)} scans`}
            style={{
              height: 40,
              border: "2px solid var(--ink)",
              borderRadius: 3,
              background: h ? `color-mix(in oklab, var(--teal) ${Math.round(15 + (h / max) * 85)}%, white)` : "#f3ead8",
            }}
          />
        ))}
      </div>
      <div className="row small muted mono" style={{ justifyContent: "space-between", marginTop: 6 }}>
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  );
}
