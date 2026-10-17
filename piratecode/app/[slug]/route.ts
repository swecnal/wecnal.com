import { after, NextResponse } from "next/server";
import { requestInfo } from "@/lib/request";
import { SLUG_PATTERN, visitorId } from "@/lib/security";
import { codeStatus } from "@/lib/status";
import { store } from "@/lib/store";
import { isBot, parseUa } from "@/lib/ua";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const slug = (await ctx.params).slug.toLowerCase();
  const lost = (reason: string) =>
    NextResponse.redirect(new URL(`/lost?c=${encodeURIComponent(slug)}&r=${reason}`, req.url), { status: 302, headers: noStore });

  if (!SLUG_PATTERN.test(slug)) return lost("missing");
  const code = await store.getCode(slug);
  if (!code) return lost("missing");

  const status = codeStatus(code);
  if (status !== "live") return lost(status);

  const { ip, ua, headers } = await requestInfo();
  const bot = isBot(ua);

  // Link previews and crawlers follow the redirect but never count as scans.
  if (!bot && !(await store.countScan(slug))) return lost("capped");

  const client = parseUa(ua);
  let target = code.destination;
  if (code.plan === "pro") {
    if (client.os === "iOS" && code.iosUrl) target = code.iosUrl;
    else if (client.os === "Android" && code.androidUrl) target = code.androidUrl;
  }

  if (!bot && code.plan === "pro") {
    const url = new URL(req.url);
    const city = headers.get("x-vercel-ip-city");
    const referrer = headers.get("referer");
    after(() =>
      store
        .recordScan({
          slug,
          at: new Date(),
          source: url.searchParams.has("l") ? "link" : "qr",
          ...client,
          country: headers.get("x-vercel-ip-country"),
          region: headers.get("x-vercel-ip-country-region"),
          city: city ? decodeURIComponent(city) : null,
          referrer: referrer ? safeHost(referrer) : null,
          visitor: visitorId(slug, ip, ua),
        })
        .catch((err) => console.error("[piratecode] failed to record scan", err)),
    );
  }

  return NextResponse.redirect(target, { status: 302, headers: noStore });
}

function safeHost(ref: string): string | null {
  try {
    return new URL(ref).hostname;
  } catch {
    return null;
  }
}
