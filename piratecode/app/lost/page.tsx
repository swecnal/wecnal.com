import type { Metadata } from "next";
import { Problem } from "@/components/Problem";
import { AnchorIcon, ChestIcon, CompassIcon, HourglassIcon, IslandIcon } from "@/components/PirateIcons";
import { SLUG_PATTERN } from "@/lib/security";
import { codeStatus } from "@/lib/status";
import { store } from "@/lib/store";

export const metadata: Metadata = { title: "Code unavailable", robots: { index: false } };

export default async function Lost({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const slug = ((await searchParams).c ?? "").toLowerCase();
  const code = SLUG_PATTERN.test(slug) ? await store.getCode(slug) : null;

  if (!code) {
    return (
      <Problem icon={<IslandIcon size={64} />} kicker="Davy Jones' locker" title="Lost at sea">
        This QR code doesn&apos;t exist (anymore). Its owner may have scuttled it, or it never set sail at all.
      </Problem>
    );
  }

  const status = codeStatus(code);
  if (status === "paused") {
    return (
      <Problem icon={<AnchorIcon size={64} />} kicker="Anchors aweigh... soon" title="Dropped anchor">
        The captain of this code has paused it for now. Check back soon.
      </Problem>
    );
  }
  if (status === "live") {
    return (
      <Problem icon={<CompassIcon size={64} />} kicker="Back on course" title="All hands on deck">
        This code is live again. <a href={`/${slug}`}>Follow it →</a>
      </Problem>
    );
  }
  return (
    <Problem
      icon={status === "capped" ? <ChestIcon size={64} /> : <HourglassIcon size={64} />}
      kicker={status === "capped" ? "The chest be empty" : "Time ran out"}
      title={status === "capped" ? "Out of scans" : "This code has sailed"}
    >
      {code.expiredMessage ?? (status === "capped" ? "This code reached its scan limit." : "This code has expired.")}
    </Problem>
  );
}
