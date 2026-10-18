"use client";

import { AnchorIcon, FlagIcon } from "./PirateIcons";
import { DEFAULT_STYLE, type QrStyle, PRESETS, scanWarnings } from "@/lib/qr";

type Props = { style: QrStyle; onChange: (s: QrStyle) => void };

function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function StyleStudio({ style, onChange }: Props) {
  const set = (patch: Partial<QrStyle>) => onChange({ ...style, ...patch });
  const warnings = scanWarnings(style);
  const isPreset = (p: Partial<QrStyle>) => p.fg === style.fg && (p.fg2 ?? null) === style.fg2 && p.eye === style.eye && p.bg === style.bg;

  return (
    <>
      <details className="panel" open>
        <summary>
          <FlagIcon size={26} /> Fly your colors
        </summary>
        <div className="panel-body">
          <div className="presets" role="group" aria-label="Color presets">
            {PRESETS.map((p) => (
              <button key={p.name} type="button" className="preset" aria-pressed={isPreset(p.style)} onClick={() => set(p.style)}>
                <div
                  className="swatch"
                  style={{ background: p.style.fg2 ? `linear-gradient(90deg, ${p.style.fg}, ${p.style.fg2})` : p.style.fg, boxShadow: `inset 0 -8px 0 ${p.style.bg}` }}
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <div className="colors">
            <label>
              Code
              <input type="color" value={style.fg} onChange={(e) => set({ fg: e.target.value })} />
            </label>
            <label>
              Fade to
              <span className="row" style={{ gap: 6 }}>
                <input type="color" value={style.fg2 ?? style.fg} disabled={!style.fg2} onChange={(e) => set({ fg2: e.target.value })} />
                <input type="checkbox" aria-label="Use gradient" checked={Boolean(style.fg2)} onChange={(e) => set({ fg2: e.target.checked ? "#6b21d6" : null })} />
              </span>
            </label>
            <label>
              Eyes
              <input type="color" value={style.eye} onChange={(e) => set({ eye: e.target.value })} />
            </label>
            <label>
              Background
              <input type="color" value={style.bg} onChange={(e) => set({ bg: e.target.value })} />
            </label>
          </div>

          <div className="stack" style={{ gap: 10 }}>
            <div className="row">
              <span className="small" style={{ fontWeight: 700, minWidth: 64 }}>Dots</span>
              <Seg label="Module shape" value={style.shape} onChange={(shape) => set({ shape })} options={[["square", "Square"], ["rounded", "Soft"], ["dots", "Dots"]]} />
            </div>
            <div className="row">
              <span className="small" style={{ fontWeight: 700, minWidth: 64 }}>Eyes</span>
              <Seg label="Eye shape" value={style.eyeShape} onChange={(eyeShape) => set({ eyeShape })} options={[["square", "Square"], ["rounded", "Soft"], ["circle", "Round"]]} />
            </div>
            <div className="row">
              <span className="small" style={{ fontWeight: 700, minWidth: 64 }}>Armor</span>
              <Seg label="Error correction" value={style.ecc} onChange={(ecc) => set({ ecc })} options={[["L", "L 7%"], ["M", "M 15%"], ["Q", "Q 25%"], ["H", "H 30%"]]} />
            </div>
            <p className="small muted" style={{ margin: 0 }}>
              Armor is error correction: higher survives scratches, stickers and bad print, but makes the code denser.
            </p>
          </div>

          <label className="field">
            Margin: {style.margin}
            <input type="range" min={0} max={8} value={style.margin} onChange={(e) => set({ margin: Number(e.target.value) })} />
          </label>

          {warnings.map((w) => (
            <div key={w} className="warn">
              ⚠ {w}
            </div>
          ))}
        </div>
      </details>

      <details className="panel">
        <summary>
          <AnchorIcon size={26} /> Frame &amp; call to action
        </summary>
        <div className="panel-body">
          <label className="check">
            <input type="checkbox" checked={style.frame} onChange={(e) => set({ frame: e.target.checked })} />
            <span>
              Add a frame
              <span className="hint">A bold border with a label. People scan framed codes way more often.</span>
            </span>
          </label>
          {style.frame && (
            <>
              <label className="field">
                Label
                <input type="text" maxLength={24} value={style.frameLabel} onChange={(e) => set({ frameLabel: e.target.value })} />
              </label>
              <div className="row">
                {["SCAN ME", "AHOY! SCAN ME", "X MARKS THE SPOT", "MENU", "WIFI", "PAY HERE", "FOLLOW US"].map((l) => (
                  <button key={l} type="button" className="btn btn-sm btn-white" onClick={() => set({ frameLabel: l })}>
                    {l}
                  </button>
                ))}
              </div>
              <label className="check">
                <input type="checkbox" checked={style.frameSkull} onChange={(e) => set({ frameSkull: e.target.checked })} />
                <span>
                  Fly the Jolly Roger
                  <span className="hint">Little skulls on either side of the label.</span>
                </span>
              </label>
              <div className="colors">
                <label>
                  Frame
                  <input type="color" value={style.frameColor} onChange={(e) => set({ frameColor: e.target.value })} />
                </label>
                <label>
                  Text
                  <input type="color" value={style.frameText} onChange={(e) => set({ frameText: e.target.value })} />
                </label>
              </div>
            </>
          )}
          <button type="button" className="btn btn-sm btn-white" onClick={() => onChange(DEFAULT_STYLE)}>
            Scrub the deck (reset styling)
          </button>
        </div>
      </details>
    </>
  );
}
