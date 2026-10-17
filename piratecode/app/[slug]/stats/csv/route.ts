import { sessionCode } from "@/lib/session";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote everything and defuse spreadsheet formula injection.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const slug = (await ctx.params).slug.toLowerCase();
  const code = await sessionCode(slug);
  if (!code || code.plan !== "pro") return new Response("Unlock this Captain code first.", { status: 401 });

  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get("d")) || 30));
  const scans = await store.listScans(slug, new Date(Date.now() - days * 86400_000));
  const header = ["time_utc", "source", "device", "os", "browser", "country", "region", "city", "referrer", "visitor"];
  const lines = [header.join(",")];
  for (const s of scans) {
    lines.push([new Date(s.at).toISOString(), s.source, s.device, s.os, s.browser, s.country, s.region, s.city, s.referrer, s.visitor].map(cell).join(","));
  }
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="piratecode-${slug}-${days}d.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
