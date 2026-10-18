import Link from "next/link";
import { Creator } from "@/components/Creator";
import {
  AnchorIcon,
  BombIcon,
  BottleIcon,
  ChestIcon,
  CompassIcon,
  FlagIcon,
  LogbookIcon,
  MapIcon,
  SkullBullet,
  SpyglassIcon,
  WheelIcon,
} from "@/components/PirateIcons";
import { Porthole } from "@/components/Porthole";
import { proBetaOpen } from "@/lib/plans";
import { baseUrl } from "@/lib/request";

const FEATURES = [
  [BottleIcon, "Six code types", "Links, plain text, Wi‑Fi logins, contact cards, emails and texts. A message in a bottle, minus the bottle."],
  [WheelIcon, "Change course any time", "Lock a code with a passphrase and steer it somewhere new at /edit. The printed code never changes."],
  [FlagIcon, "Fly your colors", "80s presets, gradients, dot and eye shapes, error correction armor and a live scannability check."],
  [AnchorIcon, "Frames that hook", "Wrap the code in a bold frame with SCAN ME, AHOY or your own call to action. Add a Jolly Roger if ye dare."],
  [MapIcon, "Print‑ready loot", "Crisp SVG plus PNG up to 4096px. Straight to the printer, no watermark, no ransom."],
  [BombIcon, "Self‑destruct", "Expiry dates and scan caps with your own goodbye message. Drop anchor (pause) and set sail again any time."],
  [SpyglassIcon, "Campaign tags", "Built‑in UTM builder so Google Analytics knows which flyer brought the crew aboard."],
  [ChestIcon, "Treasure chest", "Every code you make is stashed on this device. No account, no email, no tracking cookies."],
  [CompassIcon, "Smart routing", "Captain: send iPhones to the App Store and Androids to Google Play from one code."],
  [LogbookIcon, "Captain's log", "Captain: scans, uniques, countries, cities, devices, QR vs link clicks and CSV export."],
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ scuttled?: string }> }) {
  const { scuttled } = await searchParams;
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="porthole-wrap">
            <Porthole />
          </div>
          <p className="kicker" style={{ position: "relative", zIndex: 1 }}>Ahoy, matey</p>
          <h1>
            QR codes. <span className="glow">No strings.</span>
          </h1>
          <p className="lede">Paste a link, style it, download it. No signup, no watermark, no trial. Analytics only if ye want &apos;em.</p>
          <div className="chips">
            {["No login", "Editable links", "SVG + PNG", "Free forever"].map((c) => (
              <span key={c} className="chip">
                <SkullBullet /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        <Creator proBeta={proBetaOpen()} baseUrl={baseUrl()} scuttled={scuttled?.replace(/[^a-z0-9]/g, "").slice(0, 32)} />

        <p className="kicker" style={{ marginTop: 56 }}>
          The armory
        </p>
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Everything on deck
        </h2>
        <div className="feature-grid">
          {FEATURES.map(([Icon, title, text]) => (
            <div key={title} className="card feature">
              <span className="feature-icon">
                <Icon size={40} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <div className="card captain-cta">
          <div>
            <p className="kicker" style={{ margin: 0 }}>
              Captain&apos;s log
            </p>
            <h2 style={{ marginBottom: 6 }}>Need the numbers?</h2>
            <p className="muted" style={{ margin: 0 }}>
              Captain codes show ye who scanned, where, and on what.
            </p>
          </div>
          <Link href="/pro" className="btn btn-pink btn-lg">
            See Captain →
          </Link>
        </div>
      </div>
    </>
  );
}
