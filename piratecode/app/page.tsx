import Link from "next/link";
import { Creator } from "@/components/Creator";
import { proBetaOpen } from "@/lib/plans";
import { baseUrl } from "@/lib/request";

const FEATURES = [
  ["Six code types", "Links, plain text, Wi‑Fi logins, contact cards, emails and texts."],
  ["Edit any time", "Lock a code with a passphrase and change its destination at /edit. The printed code never changes."],
  ["Style studio", "80s presets, gradients, dot and eye shapes, error correction armor and a live scannability check."],
  ["Frames that sell", "Wrap the code in a bold frame with SCAN ME, MENU or your own call to action."],
  ["Print‑ready files", "Crisp SVG plus PNG up to 4096px. Straight to the printer, no watermark."],
  ["Self‑destruct", "Expiry dates and scan caps with your own goodbye message. Pause and resume with one tap."],
  ["Campaign tags", "Built‑in UTM builder so Google Analytics knows which flyer did the work."],
  ["My codes", "Every code you make is kept on this device. No account, no email, no tracking cookies."],
  ["Smart routing", "Captain: send iPhones to the App Store and Androids to Google Play from one code."],
  ["Real analytics", "Captain: scans, uniques, countries, cities, devices, QR vs link clicks and CSV export."],
];

export default async function Home({ searchParams }: { searchParams: Promise<{ scuttled?: string }> }) {
  const { scuttled } = await searchParams;
  return (
    <>
      <section className="hero">
        <div className="sun" aria-hidden="true" />
        <div className="wrap">
          <h1>
            QR codes. <span className="glow">No strings.</span>
          </h1>
          <p>Paste a link, style it, download it. No signup, no watermark, no trial. Add analytics only if you want them.</p>
          <div className="chips">
            <span className="chip">✦ No login</span>
            <span className="chip">✦ Editable links</span>
            <span className="chip">✦ SVG + PNG</span>
            <span className="chip">✦ Free forever</span>
          </div>
        </div>
      </section>

      <div className="wrap">
        <Creator proBeta={proBetaOpen()} baseUrl={baseUrl()} scuttled={scuttled?.replace(/[^a-z0-9]/g, "").slice(0, 32)} />

        <h2 className="section-title">Everything on deck</h2>
        <div className="feature-grid">
          {FEATURES.map(([title, text]) => (
            <div key={title} className="card">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ marginBottom: 6 }}>Need the numbers?</h2>
            <p className="muted" style={{ margin: 0 }}>
              Captain codes show you who scanned, where and on what.
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
