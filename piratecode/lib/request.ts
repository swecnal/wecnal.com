import "server-only";
import { headers } from "next/headers";

export async function requestInfo() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "0.0.0.0";
  return { host, origin: baseUrl() ?? `${proto}://${host}`, ip, ua: h.get("user-agent") ?? "", headers: h };
}

/** The origin baked into QR codes. Pin it with NEXT_PUBLIC_BASE_URL once a domain exists. */
export function baseUrl(): string | null {
  const b = process.env.NEXT_PUBLIC_BASE_URL;
  return b ? b.replace(/\/+$/, "") : null;
}
