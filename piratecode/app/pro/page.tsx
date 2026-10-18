import type { Metadata } from "next";
import Link from "next/link";
import { CoinIcon, SkullIcon } from "@/components/PirateIcons";
import { PLANS, proBetaOpen } from "@/lib/plans";

export const metadata: Metadata = { title: "Pricing" };

const FAQ = [
  ["Do I need an account?", "No. Ever. Codes are protected by a passphrase you choose, not a login."],
  ["What happens to free codes?", "They keep working. Free codes never expire unless you set an expiry yourself."],
  ["Can I upgrade a code I already printed?", "Yes. Unlock it at your-link/edit and upgrade. The printed code stays the same; stats start from that moment."],
  ["What do you track?", "Only Captain codes are logged: time, rough location from the network, device type, OS and browser. No raw IP addresses are stored."],
  ["I lost my passphrase.", "There's no account to reset, so it can't be recovered. The code keeps working; you just can't edit it."],
];

export default async function Pro({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const beta = proBetaOpen();
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="kicker">Join the crew</p>
        <h1>Pick your rank</h1>
        <p>Free does almost everything. Captain adds the numbers.</p>
      </div>

      {code && !beta && (
        <div className="warn" style={{ marginBottom: 18 }}>
          Checkout for <code>{code}</code> is not open yet. Your code works as a free code in the meantime.
        </div>
      )}

      <div className="plans">
        <div className="card plan parchment">
          <div className="wanted">
            <div className="w">Wanted</div>
            <div className="sub">FREE OR ALIVE</div>
          </div>
          <div className="poster-head">
            <SkullIcon size={56} />
            <div>
              <span className="badge badge-free">FREE</span>
              <h2 style={{ marginTop: 6 }}>{PLANS.free.name}</h2>
            </div>
          </div>
          <div className="reward">REWARD</div>
          <div className="price">{PLANS.free.price}</div>
          <ul>
            {PLANS.free.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Link href="/" className="btn btn-white btn-block">
            Make a code
          </Link>
        </div>
        <div className="card plan plan-pro">
          <div className="wanted">
            <div className="w">Wanted</div>
            <div className="sub">DEAD OR ALIVE</div>
          </div>
          <div className="poster-head">
            <CoinIcon size={56} />
            <div>
              <span className="badge badge-pro">PRO</span>
              <h2 style={{ marginTop: 6 }}>{PLANS.pro.name}</h2>
            </div>
          </div>
          <div className="reward">REWARD</div>
          <div className="price">
            {beta ? (
              <>
                <s className="muted" style={{ fontSize: "0.6em" }}>
                  {PLANS.pro.price}
                </s>{" "}
                Free in beta
              </>
            ) : (
              PLANS.pro.price
            )}
          </div>
          <ul>
            {PLANS.pro.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Link href="/" className="btn btn-pink btn-block">
            Make a Captain code
          </Link>
        </div>
      </div>

      <p className="kicker" style={{ marginTop: 56 }}>Parley</p>
      <h2 className="section-title" style={{ marginTop: 0 }}>Questions</h2>
      <div className="stack" style={{ marginTop: 18 }}>
        {FAQ.map(([q, a]) => (
          <details key={q} className="panel">
            <summary>{q}</summary>
            <div className="panel-body">{a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
