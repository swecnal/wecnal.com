"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type ChestEntry, readChest, removeFromChest } from "./chest";
import { CopyButton, downloadPng, downloadSvg, QrView } from "./qr-client";

const KIND_NAMES: Record<string, string> = { url: "Link", text: "Text", wifi: "Wi‑Fi", contact: "Contact", email: "Email", sms: "SMS" };

export function ChestList() {
  const [entries, setEntries] = useState<ChestEntry[] | null>(null);
  useEffect(() => setEntries(readChest()), []);

  if (entries === null) return null;
  if (entries.length === 0) {
    return (
      <div className="card stack center">
        <div className="big-emoji" aria-hidden="true">
          🗝️
        </div>
        <h2>Your chest is empty</h2>
        <p className="muted" style={{ margin: 0 }}>
          Codes you create on this device show up here.
        </p>
        <div>
          <Link href="/" className="btn btn-primary">
            Make your first code
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chest">
      {entries.map((e) => {
        const name = e.slug ? `piratecode-${e.slug}` : `piratecode-${e.kind}`;
        return (
          <div key={e.createdAt} className="card chest-item">
            <div className="thumb">
              <QrView text={e.payload} style={{ ...e.style, frame: false }} className="" label={e.title} />
            </div>
            <div className="stack" style={{ gap: 8, minWidth: 0 }}>
              <div className="row" style={{ gap: 6 }}>
                <span className="badge">{KIND_NAMES[e.kind] ?? e.kind}</span>
                {e.slug ? <span className="badge badge-free">DYNAMIC</span> : <span className="badge" style={{ background: "#fff" }}>DIRECT</span>}
                {e.plan === "pro" && <span className="badge badge-pro">CAPTAIN</span>}
              </div>
              <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</strong>
              {e.slug && <span className="dest mono">/{e.slug}</span>}
              <div className="row" style={{ gap: 6 }}>
                <button type="button" className="btn btn-sm btn-teal" onClick={() => downloadPng(e.payload, e.style, name, 1024)}>
                  PNG
                </button>
                <button type="button" className="btn btn-sm btn-cyan" onClick={() => downloadSvg(e.payload, e.style, name)}>
                  SVG
                </button>
                {e.slug && (
                  <span className="btn btn-sm btn-white" style={{ padding: 0 }}>
                    <CopyButton value={`${e.payload}?l`} label="Copy link" />
                  </span>
                )}
              </div>
              <div className="row small" style={{ gap: 12 }}>
                {e.slug && e.locked && <a href={`/${e.slug}/edit`}>Edit</a>}
                {e.slug && e.plan === "pro" && <a href={`/${e.slug}/stats`}>Stats</a>}
                <button
                  type="button"
                  className="small"
                  style={{ background: "none", border: 0, padding: 0, textDecoration: "underline", cursor: "pointer", color: "var(--muted)", font: "inherit" }}
                  onClick={() => {
                    if (!confirm("Remove from this list? The code itself keeps working.")) return;
                    removeFromChest(e.createdAt);
                    setEntries(readChest());
                  }}
                >
                  Remove from list
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
