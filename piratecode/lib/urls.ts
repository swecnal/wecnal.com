export const MAX_URL_LENGTH = 2048;

/** Accepts "example.com/x" or a full http(s) URL. Returns a normalized URL or an error. */
export function normalizeDestination(
  raw: string,
  opts: { ownHost?: string | null; blockedHosts?: string[] } = {},
): { url: string } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Drop in a link first." };
  if (trimmed.length > MAX_URL_LENGTH) return { error: "That link is too long." };

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { error: "That doesn't look like a link." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "Only http and https links can be dynamic codes." };
  }
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") && host !== "localhost") return { error: "That link is missing a domain." };
  if (opts.ownHost && host === opts.ownHost.toLowerCase().split(":")[0]) {
    return { error: "A code can't point back at PirateCode itself." };
  }
  if (opts.blockedHosts?.some((b) => b && (host === b || host.endsWith(`.${b}`)))) {
    return { error: "That destination is not allowed." };
  }
  return { url: url.toString() };
}

export function blockedHosts(): string[] {
  return (process.env.BLOCKED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export type Utm = { source?: string; medium?: string; campaign?: string; term?: string; content?: string };

export function applyUtm(url: string, utm: Utm): string {
  try {
    const u = new URL(url);
    for (const [k, v] of Object.entries(utm)) {
      if (v && v.trim()) u.searchParams.set(`utm_${k}`, v.trim());
    }
    return u.toString();
  } catch {
    return url;
  }
}
