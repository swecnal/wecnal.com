// "My codes": a per-device list of the codes you made, kept in localStorage.
// No account needed; clearing site data clears the list (the codes keep working).

import type { QrStyle } from "@/lib/qr";

export type ChestEntry = {
  slug: string | null; // null for static codes
  kind: string;
  title: string;
  payload: string; // what the QR encodes
  destination: string | null;
  locked: boolean;
  plan: "free" | "pro" | null;
  style: QrStyle;
  createdAt: string;
};

const KEY = "piratecode:chest";

export function readChest(): ChestEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ChestEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: ChestEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 200)));
  } catch {
    /* storage full or blocked: the chest is a convenience, not a source of truth */
  }
}

export function addToChest(entry: ChestEntry) {
  write([entry, ...readChest().filter((e) => !(entry.slug && e.slug === entry.slug))]);
}

export function removeFromChest(createdAt: string) {
  write(readChest().filter((e) => e.createdAt !== createdAt));
}

export function updateChestStyle(slug: string, style: QrStyle) {
  write(readChest().map((e) => (e.slug === slug ? { ...e, style } : e)));
}
