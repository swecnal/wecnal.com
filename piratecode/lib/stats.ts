import type { Scan } from "./store";

export type Breakdown = { name: string; count: number }[];

export type Summary = {
  total: number;
  unique: number;
  qr: number;
  link: number;
  last24h: number;
  days: { day: string; count: number }[];
  hours: number[];
  countries: Breakdown;
  cities: Breakdown;
  devices: Breakdown;
  os: Breakdown;
  browsers: Breakdown;
  referrers: Breakdown;
};

function tally(scans: Scan[], key: (s: Scan) => string | null, limit = 8): Breakdown {
  const m = new Map<string, number>();
  for (const s of scans) {
    const k = key(s) || "Unknown";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, limit).map(([name, count]) => ({ name, count }));
  const rest = sorted.slice(limit).reduce((n, [, c]) => n + c, 0);
  if (rest) top.push({ name: "Other", count: rest });
  return top;
}

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

export function countryName(code: string | null): string | null {
  if (!code) return null;
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

export function summarize(scans: Scan[], rangeDays: number, now = new Date()): Summary {
  const days: { day: string; count: number }[] = [];
  const index = new Map<string, number>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400_000).toISOString().slice(0, 10);
    index.set(d, days.length);
    days.push({ day: d, count: 0 });
  }
  const hours = new Array(24).fill(0);
  const visitors = new Set<string>();
  let qr = 0;
  let last24h = 0;
  for (const s of scans) {
    const at = new Date(s.at);
    const i = index.get(at.toISOString().slice(0, 10));
    if (i !== undefined) days[i].count++;
    hours[at.getUTCHours()]++;
    visitors.add(s.visitor);
    if (s.source === "qr") qr++;
    if (now.getTime() - at.getTime() < 86400_000) last24h++;
  }
  return {
    total: scans.length,
    unique: visitors.size,
    qr,
    link: scans.length - qr,
    last24h,
    days,
    hours,
    countries: tally(scans, (s) => countryName(s.country)),
    cities: tally(scans, (s) => (s.city ? `${s.city}${s.country ? `, ${s.country}` : ""}` : null)),
    devices: tally(scans, (s) => s.device),
    os: tally(scans, (s) => s.os),
    browsers: tally(scans, (s) => s.browser),
    referrers: tally(scans, (s) => s.referrer ?? "Direct / camera"),
  };
}
