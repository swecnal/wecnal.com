import type { Code } from "./store";

export type CodeStatus = "live" | "paused" | "expired" | "capped";

export function codeStatus(code: Code, now = Date.now()): CodeStatus {
  if (code.paused) return "paused";
  if (code.expiresAt && code.expiresAt.getTime() <= now) return "expired";
  if (code.maxScans !== null && code.scanCount >= code.maxScans) return "capped";
  return "live";
}
