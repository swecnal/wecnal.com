"use client";

import { useEffect, useMemo, useState } from "react";
import { type QrStyle, renderQrSvg } from "@/lib/qr";

export function QrView({ text, style, className = "qr", label }: { text: string; style: QrStyle; className?: string; label?: string }) {
  const svg = useMemo(() => {
    try {
      return renderQrSvg(text, style);
    } catch {
      return null; // payload too large for a QR code
    }
  }, [text, style]);
  if (!svg) return <div className="warn">That's too much data for one QR code. Trim it down.</div>;
  // renderQrSvg sanitizes every color and escapes the label, so this markup is safe.
  return <div className={className} role="img" aria-label={label ?? "QR code"} dangerouslySetInnerHTML={{ __html: svg }} />;
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(text: string, style: QrStyle, name: string) {
  save(new Blob([renderQrSvg(text, style)], { type: "image/svg+xml" }), `${name}.svg`);
}

export async function downloadPng(text: string, style: QrStyle, name: string, width: number) {
  const svg = renderQrSvg(text, style);
  const [, , vw, vh] = (svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 1 1").split(" ").map(Number);
  const height = Math.round((width * vh) / vw);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(url);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (blob) save(blob, `${name}-${width}.png`);
}

export function DownloadBar({ text, style, name, disabled }: { text: string; style: QrStyle; name: string; disabled?: boolean }) {
  const [size, setSize] = useState(1024);
  return (
    <div className="stack">
      <div className="row">
        <span className="small" style={{ fontWeight: 700 }}>
          PNG size
        </span>
        <div className="seg" role="group" aria-label="PNG size">
          {[512, 1024, 2048, 4096].map((s) => (
            <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="grid2">
        <button type="button" className="btn btn-teal" disabled={disabled} onClick={() => downloadPng(text, style, name, size)}>
          Download PNG
        </button>
        <button type="button" className="btn btn-cyan" disabled={disabled} onClick={() => downloadSvg(text, style, name)}>
          Download SVG
        </button>
      </div>
    </div>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1400);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
        } catch {
          window.prompt("Copy this:", value);
        }
      }}
    >
      {done ? "Copied!" : label}
    </button>
  );
}

export function ShortLink({ url }: { url: string }) {
  return (
    <div className="shortlink">
      <code>{url.replace(/^https?:\/\//, "")}</code>
      {/* ?l marks the visit as a link click rather than a QR scan in analytics */}
      <CopyButton value={`${url}?l`} />
    </div>
  );
}
