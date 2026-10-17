import { NextResponse } from "next/server";
import { proCheckout } from "@/lib/plans";
import { sanitizeStyle } from "@/lib/qr";
import { requestInfo } from "@/lib/request";
import { hashPassphrase, newSlug, passphraseProblem } from "@/lib/security";
import { store } from "@/lib/store";
import { blockedHosts, normalizeDestination } from "@/lib/urls";
import { rateLimited } from "@/lib/ratelimit";

type Body = {
  destination?: string;
  iosUrl?: string;
  androidUrl?: string;
  label?: string;
  passphrase?: string;
  pro?: boolean;
  expiresAt?: string;
  maxScans?: number | string;
  expiredMessage?: string;
  style?: unknown;
  website?: string; // honeypot
};

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const { host, origin, ip } = await requestInfo();
  if (rateLimited(`create:${ip}`, 30, 60_000)) return bad("Slow down, captain. Try again in a minute.", 429);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request.");
  }
  if (body.website) return bad("Invalid request.");

  const opts = { ownHost: host, blockedHosts: blockedHosts() };
  const dest = normalizeDestination(body.destination ?? "", opts);
  if ("error" in dest) return bad(dest.error);

  const wantsPro = body.pro === true;
  const passphrase = body.passphrase ?? "";
  if (wantsPro && !passphrase) return bad("Captain codes need a passphrase so only you can see the stats.");
  if (passphrase) {
    const problem = passphraseProblem(passphrase);
    if (problem) return bad(problem);
  }

  const alt = (raw?: string) => {
    if (!wantsPro || !raw?.trim()) return { url: null as string | null };
    return normalizeDestination(raw, opts);
  };
  const ios = alt(body.iosUrl);
  if ("error" in ios) return bad(`iOS link: ${ios.error}`);
  const android = alt(body.androidUrl);
  if ("error" in android) return bad(`Android link: ${android.error}`);

  let expiresAt: Date | null = null;
  if (body.expiresAt) {
    expiresAt = new Date(body.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) return bad("That expiry date is invalid.");
    if (expiresAt.getTime() < Date.now()) return bad("The expiry date is already in the past.");
  }
  let maxScans: number | null = null;
  if (body.maxScans !== undefined && body.maxScans !== "" && body.maxScans !== null) {
    maxScans = Math.floor(Number(body.maxScans));
    if (!Number.isFinite(maxScans) || maxScans < 1 || maxScans > 100_000_000) return bad("Scan cap must be a positive number.");
  }

  const checkout = wantsPro ? proCheckout("") : null;
  const plan = checkout && "granted" in checkout ? "pro" : "free";

  const base = {
    destination: dest.url,
    iosUrl: ios.url,
    androidUrl: android.url,
    label: body.label?.trim().slice(0, 80) || null,
    plan,
    passHash: passphrase ? await hashPassphrase(passphrase) : null,
    expiresAt,
    maxScans,
    expiredMessage: body.expiredMessage?.trim().slice(0, 280) || null,
    style: sanitizeStyle(body.style),
  } as const;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = newSlug(attempt < 3 ? 6 : 7);
    if (await store.createCode({ slug, ...base })) {
      const shortUrl = `${origin}/${slug}`;
      return NextResponse.json({
        slug,
        shortUrl,
        plan,
        locked: Boolean(base.passHash),
        editUrl: base.passHash ? `${shortUrl}/edit` : null,
        statsUrl: plan === "pro" ? `${shortUrl}/stats` : null,
        upgradeUrl: checkout && "redirect" in checkout ? `${origin}/pro?code=${slug}` : null,
        persistent: store.persistent,
      });
    }
  }
  return bad("Couldn't find a free slug. Try again.", 500);
}
