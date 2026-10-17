import type { Metadata } from "next";
import { Problem } from "@/components/Problem";
import { SLUG_PATTERN } from "@/lib/security";
import { codeStatus } from "@/lib/status";
import { store } from "@/lib/store";

export const metadata: Metadata = { title: "Code unavailable", robots: { index: false } };

export default async function Lost({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const slug = ((await searchParams).c ?? "").toLowerCase();
  const code = SLUG_PATTERN.test(slug) ? await store.getCode(slug) : null;

  if (!code) {
    return (
      <Problem emoji="🏝️" title="Lost at sea">
        This QR code doesn&apos;t exist (anymore). It may have been scuttled by its owner or never existed.
      </Problem>
    );
  }

  const status = codeStatus(code);
  if (status === "paused") {
    return (
      <Problem emoji="⚓" title="Temporarily docked">
        The owner of this code has paused it. Check back soon.
      </Problem>
    );
  }
  if (status === "live") {
    return (
      <Problem emoji="🧭" title="All hands on deck">
        This code is live again. <a href={`/${slug}`}>Follow it →</a>
      </Problem>
    );
  }
  return (
    <Problem emoji="💀" title={status === "capped" ? "Out of scans" : "This code has sailed"}>
      {code.expiredMessage ?? (status === "capped" ? "This code reached its scan limit." : "This code has expired.")}
    </Problem>
  );
}
