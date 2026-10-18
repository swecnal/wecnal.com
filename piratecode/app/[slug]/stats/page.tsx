import type { Metadata } from "next";
import Link from "next/link";
import { BarList, DailyBars, HourStrip } from "@/components/Charts";
import { Problem } from "@/components/Problem";
import { IslandIcon, LogbookIcon } from "@/components/PirateIcons";
import { UnlockForm } from "@/components/UnlockForm";
import { SLUG_PATTERN } from "@/lib/security";
import { sessionCode } from "@/lib/session";
import { summarize } from "@/lib/stats";
import { codeStatus } from "@/lib/status";
import { store } from "@/lib/store";

export const metadata: Metadata = { title: "Stats", robots: { index: false } };

const RANGES = [7, 30, 90] as const;
const fmt = new Intl.NumberFormat("en-US");

export default async function StatsPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ d?: string }> }) {
  const slug = (await params).slug.toLowerCase();
  const { d } = await searchParams;
  const range = RANGES.find((r) => String(r) === d) ?? 30;
  const code = SLUG_PATTERN.test(slug) ? await store.getCode(slug) : null;

  if (!code) {
    return (
      <Problem icon={<IslandIcon size={64} />} kicker="Davy Jones' locker" title="No code here">
        We couldn't find a code called <code>{slug}</code>.
      </Problem>
    );
  }
  if (!code.passHash) {
    return (
      <Problem icon={<LogbookIcon size={64} />} kicker="Arr, no key" title="No lock, no logbook">
        Analytics are for Captain codes, which are protected by a passphrase. This one was made without one, so its stats can't
        be shown to anyone.
      </Problem>
    );
  }

  const unlocked = await sessionCode(slug);
  if (!unlocked) {
    return (
      <div className="wrap narrow" style={{ paddingTop: 40 }}>
        <UnlockForm slug={slug} next="stats" />
      </div>
    );
  }

  if (unlocked.plan !== "pro") {
    return (
      <div className="wrap narrow" style={{ paddingTop: 40 }}>
        <div className="card stack">
          <p className="kicker" style={{ margin: 0 }}>
            Captains only
          </p>
          <h1 style={{ fontSize: 34 }}>Scans are being counted</h1>
          <p className="muted" style={{ margin: 0 }}>
            This is a free Deckhand code, so detailed analytics aren&apos;t recorded yet. Upgrade it and every scan from then on shows
            up here: devices, places, trends and more.
          </p>
          <Link href={`/${slug}/edit`} className="btn btn-pink">
            Upgrade on the edit page →
          </Link>
        </div>
      </div>
    );
  }

  const since = new Date(Date.now() - range * 86400_000);
  const s = summarize(await store.listScans(slug, since), range);
  const status = codeStatus(unlocked);

  return (
    <div className="wrap">
      <div className="page-head">
        <div className="row">
          <div>
            <p className="kicker">Captain&apos;s log</p>
            <h1>{unlocked.label ?? slug}</h1>
          </div>
        </div>
        <p className="mono" style={{ wordBreak: "break-all", fontSize: 15 }}>
          {slug} → {unlocked.destination}
        </p>
        <div className="row" style={{ marginTop: 14 }}>
          <div className="seg" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <Link key={r} href={`/${slug}/stats?d=${r}`} aria-current={r === range}>
                {r} days
              </Link>
            ))}
          </div>
          <span className="spacer" />
          <a className="btn btn-sm btn-cyan" href={`/${slug}/stats/csv?d=${range}`}>
            Export CSV
          </a>
          <Link className="btn btn-sm btn-white" href={`/${slug}/edit`}>
            Edit code
          </Link>
        </div>
      </div>

      {status !== "live" && <div className="warn" style={{ marginBottom: 18 }}>This code is currently {status}. Scans are not being redirected.</div>}

      <div className="tiles">
        <div className="tile">
          <div className="label">Scans</div>
          <div className="value">{fmt.format(s.total)}</div>
        </div>
        <div className="tile">
          <div className="label">Crew / day</div>
          <div className="value">{fmt.format(s.unique)}</div>
        </div>
        <div className="tile">
          <div className="label">QR · Link</div>
          <div className="value">
            {fmt.format(s.qr)}
            <span className="muted" style={{ fontSize: "0.55em" }}> · {fmt.format(s.link)}</span>
          </div>
        </div>
        <div className="tile">
          <div className="label">Last 24h</div>
          <div className="value">{fmt.format(s.last24h)}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Scans per day (the ship&apos;s wake)</h3>
        <DailyBars days={s.days} />
        <p className="small muted" style={{ margin: "8px 0 0" }}>
          All-time scans: {fmt.format(unlocked.scanCount)}. Link clicks are visits to the short link with <code>?l</code> on the
          end (what the copy button gives you). Previews from chat apps and bots are never counted.
        </p>
      </div>

      <div className="breakdowns">
        <BarList title="Countries" data={s.countries} total={s.total} />
        <BarList title="Cities" data={s.cities} total={s.total} />
        <BarList title="Devices" data={s.devices} total={s.total} />
        <BarList title="Operating systems" data={s.os} total={s.total} />
        <BarList title="Browsers" data={s.browsers} total={s.total} />
        <BarList title="Referrers" data={s.referrers} total={s.total} />
      </div>
      <div style={{ marginTop: 18 }}>
        <HourStrip hours={s.hours} />
      </div>
    </div>
  );
}
