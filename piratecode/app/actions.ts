"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { proCheckout } from "@/lib/plans";
import { rateLimited } from "@/lib/ratelimit";
import { requestInfo } from "@/lib/request";
import {
  createSessionToken,
  hashPassphrase,
  LOCK_MINUTES,
  MAX_ATTEMPTS,
  passphraseProblem,
  SESSION_HOURS,
  sessionCookieName,
  SLUG_PATTERN,
  verifyPassphrase,
} from "@/lib/security";
import { sessionCode } from "@/lib/session";
import { store } from "@/lib/store";
import { sanitizeStyle } from "@/lib/qr";
import { blockedHosts, normalizeDestination } from "@/lib/urls";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

async function setSession(slug: string, passHash: string) {
  (await cookies()).set(sessionCookieName(slug), createSessionToken(slug, passHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/${slug}`,
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function unlockAction(_prev: FormState, form: FormData): Promise<FormState> {
  const slug = String(form.get("slug") ?? "");
  const next = form.get("next") === "stats" ? "stats" : "edit";
  const passphrase = String(form.get("passphrase") ?? "");
  const { ip } = await requestInfo();
  if (rateLimited(`unlock:${ip}`, 20, 60_000)) return { error: "Too many attempts. Wait a minute." };

  const code = SLUG_PATTERN.test(slug) ? await store.getCode(slug) : null;
  if (!code?.passHash) return { error: "This code has no passphrase." };

  if (code.lockedUntil && code.lockedUntil.getTime() > Date.now()) {
    const mins = Math.ceil((code.lockedUntil.getTime() - Date.now()) / 60_000);
    return { error: `Too many wrong guesses. This chest is sealed for ${mins} more minute${mins === 1 ? "" : "s"}.` };
  }

  if (!(await verifyPassphrase(passphrase, code.passHash))) {
    const attempts = code.failedAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await store.updateCode(slug, { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) });
      return { error: `Wrong passphrase. Sealed for ${LOCK_MINUTES} minutes after ${MAX_ATTEMPTS} misses.` };
    }
    await store.updateCode(slug, { failedAttempts: attempts });
    const left = MAX_ATTEMPTS - attempts;
    return { error: `Wrong passphrase. ${left} tr${left === 1 ? "y" : "ies"} left before a ${LOCK_MINUTES} minute lockout.` };
  }

  if (code.failedAttempts || code.lockedUntil) await store.updateCode(slug, { failedAttempts: 0, lockedUntil: null });
  await setSession(slug, code.passHash);
  redirect(`/${slug}/${next}`);
}

export async function lockAction(form: FormData) {
  const slug = String(form.get("slug") ?? "");
  if (!SLUG_PATTERN.test(slug)) return;
  (await cookies()).delete({ name: sessionCookieName(slug), path: `/${slug}` });
  redirect(`/${slug}/edit`);
}

export async function updateAction(_prev: FormState, form: FormData): Promise<FormState> {
  const slug = String(form.get("slug") ?? "");
  const code = await sessionCode(slug);
  if (!code) return { error: "Your session expired. Reload and unlock again." };

  const { host } = await requestInfo();
  const opts = { ownHost: host, blockedHosts: blockedHosts() };
  const dest = normalizeDestination(String(form.get("destination") ?? ""), opts);
  if ("error" in dest) return { error: dest.error };

  // Device routing is a Captain feature; free codes keep whatever they had.
  const altUrl = (key: "iosUrl" | "androidUrl"): { url: string | null } | { error: string } => {
    if (code.plan !== "pro") return { url: code[key] };
    const raw = String(form.get(key) ?? "").trim();
    return raw ? normalizeDestination(raw, opts) : { url: null };
  };
  const ios = altUrl("iosUrl");
  if ("error" in ios) return { error: `iOS link: ${ios.error}` };
  const android = altUrl("androidUrl");
  if ("error" in android) return { error: `Android link: ${android.error}` };

  const expiresRaw = String(form.get("expiresAt") ?? "");
  let expiresAt: Date | null = null;
  if (expiresRaw) {
    expiresAt = new Date(expiresRaw);
    if (Number.isNaN(expiresAt.getTime())) return { error: "That expiry date is invalid." };
  }
  const capRaw = String(form.get("maxScans") ?? "").trim();
  let maxScans: number | null = null;
  if (capRaw) {
    maxScans = Math.floor(Number(capRaw));
    if (!Number.isFinite(maxScans) || maxScans < 1) return { error: "Scan cap must be a positive number." };
  }

  const styleRaw = form.get("style");
  let style = code.style;
  if (typeof styleRaw === "string" && styleRaw) {
    try {
      style = sanitizeStyle(JSON.parse(styleRaw));
    } catch {
      /* keep the old style */
    }
  }

  await store.updateCode(slug, {
    destination: dest.url,
    iosUrl: ios.url,
    androidUrl: android.url,
    label: String(form.get("label") ?? "").trim().slice(0, 80) || null,
    paused: form.get("paused") === "on",
    expiresAt,
    maxScans,
    expiredMessage: String(form.get("expiredMessage") ?? "").trim().slice(0, 280) || null,
    style,
  });
  return { ok: true, message: "Saved. Your code now points to the new destination." };
}

export async function changePassphraseAction(_prev: FormState, form: FormData): Promise<FormState> {
  const slug = String(form.get("slug") ?? "");
  const code = await sessionCode(slug);
  if (!code) return { error: "Your session expired. Reload and unlock again." };
  const next = String(form.get("passphrase") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two passphrases don't match." };
  const problem = passphraseProblem(next);
  if (problem) return { error: problem };
  const passHash = await hashPassphrase(next);
  await store.updateCode(slug, { passHash });
  await setSession(slug, passHash);
  return { ok: true, message: "New passphrase set. Every other open session was logged out." };
}

export async function upgradeAction(form: FormData) {
  const slug = String(form.get("slug") ?? "");
  const code = await sessionCode(slug);
  if (!code) redirect(`/${slug}/edit`);
  const checkout = proCheckout(slug);
  if ("redirect" in checkout) redirect(checkout.redirect);
  await store.updateCode(slug, { plan: "pro" });
  redirect(`/${slug}/stats`);
}

export async function deleteAction(_prev: FormState, form: FormData): Promise<FormState> {
  const slug = String(form.get("slug") ?? "");
  const code = await sessionCode(slug);
  if (!code) return { error: "Your session expired. Reload and unlock again." };
  if (String(form.get("confirm") ?? "").trim().toLowerCase() !== slug) {
    return { error: `Type ${slug} to confirm.` };
  }
  await store.deleteCode(slug);
  (await cookies()).delete({ name: sessionCookieName(slug), path: `/${slug}` });
  redirect(`/?scuttled=${slug}`);
}

export async function reportAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { ip } = await requestInfo();
  if (rateLimited(`report:${ip}`, 5, 60_000)) return { error: "Too many reports. Wait a minute." };
  const raw = String(form.get("slug") ?? "").trim();
  // Accept a full short link or just the slug.
  const slug = raw.split("/").filter(Boolean).pop()?.toLowerCase() ?? "";
  const reason = String(form.get("reason") ?? "");
  if (!SLUG_PATTERN.test(slug)) return { error: "Enter the code's link or slug." };
  if (!["phishing", "malware", "spam", "illegal", "other"].includes(reason)) return { error: "Pick a reason." };
  await store.addReport({
    slug,
    reason,
    details: String(form.get("details") ?? "").trim().slice(0, 2000) || null,
    reporterIp: ip,
  });
  return { ok: true, message: "Thanks. A human will look at it and sink it if it's bad." };
}
