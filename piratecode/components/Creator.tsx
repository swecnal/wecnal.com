"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_STYLE, emailPayload, type QrStyle, smsPayload, vcardPayload, wifiPayload } from "@/lib/qr";
import { applyUtm, normalizeDestination, type Utm } from "@/lib/urls";
import { addToChest, updateChestStyle } from "./chest";
import { DownloadBar, QrView, ShortLink } from "./qr-client";
import { BombIcon, ChestIcon, LogbookIcon, SpyglassIcon } from "./PirateIcons";
import { StyleStudio } from "./StyleStudio";

type Kind = "url" | "text" | "wifi" | "contact" | "email" | "sms";
const KINDS: [Kind, string][] = [
  ["url", "Link"],
  ["text", "Text"],
  ["wifi", "Wi‑Fi"],
  ["contact", "Contact"],
  ["email", "Email"],
  ["sms", "SMS"],
];

type Created = {
  slug: string;
  shortUrl: string;
  plan: "free" | "pro";
  locked: boolean;
  editUrl: string | null;
  statsUrl: string | null;
  upgradeUrl: string | null;
  persistent: boolean;
};

function passProblem(p: string, confirm: string): string | null {
  if (/\s/.test(p)) return "No spaces allowed.";
  if (p.length < 12) return `${12 - p.length} more character${p.length === 11 ? "" : "s"} needed (minimum 12).`;
  if (confirm && confirm !== p) return "The two passphrases don't match.";
  return null;
}

export function Creator({ proBeta, baseUrl, scuttled }: { proBeta: boolean; baseUrl: string | null; scuttled?: string }) {
  const [origin, setOrigin] = useState(baseUrl ?? "");
  useEffect(() => {
    if (!baseUrl) setOrigin(window.location.origin);
  }, [baseUrl]);

  const [kind, setKind] = useState<Kind>("url");
  const [style, setStyle] = useState<QrStyle>(DEFAULT_STYLE);

  // Link
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<"dynamic" | "static">("dynamic");
  const [label, setLabel] = useState("");
  const [utm, setUtm] = useState<Utm>({});
  // Lock
  const [lock, setLock] = useState(false);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  // Limits
  const [expiresAt, setExpiresAt] = useState("");
  const [maxScans, setMaxScans] = useState("");
  const [expiredMessage, setExpiredMessage] = useState("");
  // Pro
  const [pro, setPro] = useState(false);
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");
  // Static types
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState({ ssid: "", password: "", security: "WPA" as "WPA" | "WEP" | "nopass", hidden: false });
  const [contact, setContact] = useState({ first: "", last: "", org: "", title: "", phone: "", email: "", url: "" });
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [sms, setSms] = useState({ number: "", message: "" });

  const [created, setCreated] = useState<Created | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const finalUrl = useMemo(() => {
    const n = normalizeDestination(destination);
    return "url" in n ? applyUtm(n.url, utm) : "";
  }, [destination, utm]);

  const dynamic = kind === "url" && mode === "dynamic";

  const payload = useMemo(() => {
    switch (kind) {
      case "url":
        if (mode === "static") return finalUrl;
        return created ? created.shortUrl : `${origin || "https://piratecode.app"}/xxxxxx`;
      case "text":
        return text;
      case "wifi":
        return wifi.ssid ? wifiPayload(wifi.ssid, wifi.password, wifi.security, wifi.hidden) : "";
      case "contact":
        return contact.first || contact.last || contact.phone || contact.email ? vcardPayload(contact) : "";
      case "email":
        return email.to ? emailPayload(email.to, email.subject, email.body) : "";
      case "sms":
        return sms.number ? smsPayload(sms.number, sms.message) : "";
    }
  }, [kind, mode, finalUrl, created, origin, text, wifi, contact, email, sms]);

  const ready = dynamic ? Boolean(created) : Boolean(payload);
  const passIssue = lock ? passProblem(pass, confirm) : null;

  useEffect(() => {
    if (created) updateChestStyle(created.slug, style);
  }, [created, style]);

  function chooseKind(k: Kind) {
    setKind(k);
    setError(null);
  }

  function togglePro(on: boolean) {
    setPro(on);
    if (on) setLock(true);
  }

  async function forge() {
    setError(null);
    if (!finalUrl) return setError("Drop in a valid link first.");
    if (lock && (passIssue || !confirm)) return setError(passIssue ?? "Confirm your passphrase.");
    setBusy(true);
    try {
      const res = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: finalUrl,
          label,
          passphrase: lock ? pass : undefined,
          pro,
          iosUrl: pro ? iosUrl : undefined,
          androidUrl: pro ? androidUrl : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          maxScans: maxScans || undefined,
          expiredMessage: expiredMessage || undefined,
          style,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setCreated(data);
      setPass("");
      setConfirm("");
      addToChest({
        slug: data.slug,
        kind: "url",
        title: label || finalUrl.replace(/^https?:\/\//, ""),
        payload: data.shortUrl,
        destination: finalUrl,
        locked: data.locked,
        plan: data.plan,
        style,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function saveStatic() {
    if (!payload) return;
    const titles: Record<Kind, string> = {
      url: finalUrl.replace(/^https?:\/\//, ""),
      text: text.slice(0, 40),
      wifi: `Wi‑Fi: ${wifi.ssid}`,
      contact: `${contact.first} ${contact.last}`.trim() || "Contact",
      email: `Email ${email.to}`,
      sms: `SMS ${sms.number}`,
    };
    addToChest({
      slug: null,
      kind,
      title: label || titles[kind],
      payload,
      destination: kind === "url" ? finalUrl : null,
      locked: false,
      plan: null,
      style,
      createdAt: new Date().toISOString(),
    });
  }

  function reset() {
    setCreated(null);
    setDestination("");
    setLabel("");
    setUtm({});
    setLock(false);
    setPro(false);
    setIosUrl("");
    setAndroidUrl("");
    setExpiresAt("");
    setMaxScans("");
    setExpiredMessage("");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const fileName = created ? `piratecode-${created.slug}` : `piratecode-${kind}`;
  const locked = Boolean(created);

  return (
    <div className="studio">
      <div className="main-col stack" style={{ gap: 18 }}>
        {scuttled && <div className="success">Code {scuttled} was scuttled and sent to Davy Jones&apos; locker. It no longer works.</div>}

        <section className="card">
          <div className="tabs" role="tablist" aria-label="What should the code do?">
            {KINDS.map(([k, name]) => (
              <button key={k} type="button" role="tab" className="tab" aria-selected={kind === k} disabled={locked && k !== kind} onClick={() => chooseKind(k)}>
                {name}
              </button>
            ))}
          </div>

          {kind === "url" && (
            <div className="stack" style={{ marginTop: 10 }}>
              <label className="field">
                <span className="visually-hidden">Destination link</span>
                <input
                  className="big-input"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="paste-your-link.com"
                  value={destination}
                  disabled={locked}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && dynamic && !locked && forge()}
                />
              </label>
              <div className="row">
                <div className="seg" role="group" aria-label="Code type">
                  <button type="button" aria-pressed={mode === "dynamic"} disabled={locked} onClick={() => setMode("dynamic")}>
                    Dynamic
                  </button>
                  <button type="button" aria-pressed={mode === "static"} disabled={locked} onClick={() => setMode("static")}>
                    Direct
                  </button>
                </div>
                <span className="small muted" style={{ flex: "1 1 220px" }}>
                  {mode === "dynamic"
                    ? "Short link in the code: editable later, can pause, expire and track scans."
                    : "Your link baked straight into the code. Can never change, never tracked, works forever."}
                </span>
              </div>
              {destination && !finalUrl && <div className="warn">That doesn't look like a link yet.</div>}
            </div>
          )}

          {kind === "text" && (
            <label className="field" style={{ marginTop: 10 }}>
              Text
              <textarea maxLength={1200} placeholder="Ahoy! Anything you type here pops up when scanned." value={text} onChange={(e) => setText(e.target.value)} />
            </label>
          )}

          {kind === "wifi" && (
            <div className="stack" style={{ marginTop: 10 }}>
              <div className="grid2">
                <label className="field">
                  Network name
                  <input type="text" value={wifi.ssid} onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })} />
                </label>
                <label className="field">
                  Password
                  <input type="text" value={wifi.password} disabled={wifi.security === "nopass"} onChange={(e) => setWifi({ ...wifi, password: e.target.value })} />
                </label>
              </div>
              <div className="row">
                <div className="seg" role="group" aria-label="Security">
                  {(["WPA", "WEP", "nopass"] as const).map((s) => (
                    <button key={s} type="button" aria-pressed={wifi.security === s} onClick={() => setWifi({ ...wifi, security: s })}>
                      {s === "nopass" ? "Open" : s}
                    </button>
                  ))}
                </div>
                <label className="check">
                  <input type="checkbox" checked={wifi.hidden} onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })} />
                  Hidden network
                </label>
              </div>
              <p className="small muted" style={{ margin: 0 }}>
                Wi‑Fi details never leave your device. The code is generated right here in your browser.
              </p>
            </div>
          )}

          {kind === "contact" && (
            <div className="grid2" style={{ marginTop: 10 }}>
              {(
                [
                  ["first", "First name", "text"],
                  ["last", "Last name", "text"],
                  ["phone", "Phone", "tel"],
                  ["email", "Email", "email"],
                  ["org", "Company", "text"],
                  ["title", "Job title", "text"],
                  ["url", "Website", "url"],
                ] as const
              ).map(([key, name, type]) => (
                <label key={key} className="field">
                  {name}
                  <input type={type} value={contact[key]} onChange={(e) => setContact({ ...contact, [key]: e.target.value })} />
                </label>
              ))}
            </div>
          )}

          {kind === "email" && (
            <div className="stack" style={{ marginTop: 10 }}>
              <label className="field">
                To
                <input type="email" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} />
              </label>
              <label className="field">
                Subject
                <input type="text" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} />
              </label>
              <label className="field">
                Message
                <textarea value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} />
              </label>
            </div>
          )}

          {kind === "sms" && (
            <div className="stack" style={{ marginTop: 10 }}>
              <label className="field">
                Phone number
                <input type="tel" value={sms.number} onChange={(e) => setSms({ ...sms, number: e.target.value })} />
              </label>
              <label className="field">
                Message
                <textarea value={sms.message} onChange={(e) => setSms({ ...sms, message: e.target.value })} />
              </label>
            </div>
          )}
        </section>
      </div>

      <div className="opts-col stack" style={{ gap: 18 }}>
        {kind === "url" && !locked && (
          <div>
            <details className="panel">
              <summary>
                <SpyglassIcon size={26} /> Name &amp; campaign tags
              </summary>
              <div className="panel-body">
                <label className="field">
                  Nickname <span className="hint">Only for you, shows up in My codes.</span>
                  <input type="text" maxLength={80} placeholder="Spring flyer" value={label} onChange={(e) => setLabel(e.target.value)} />
                </label>
                <div className="grid2">
                  {(["source", "medium", "campaign", "content"] as const).map((k) => (
                    <label key={k} className="field">
                      utm_{k}
                      <input
                        type="text"
                        placeholder={{ source: "flyer", medium: "qr", campaign: "spring-sale", content: "front-door" }[k]}
                        value={utm[k] ?? ""}
                        onChange={(e) => setUtm({ ...utm, [k]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
                {finalUrl && Object.values(utm).some(Boolean) && (
                  <p className="small mono" style={{ margin: 0, wordBreak: "break-all" }}>
                    → {finalUrl}
                  </p>
                )}
              </div>
            </details>

            {mode === "dynamic" && (
              <>
                <details className="panel" open={lock}>
                  <summary>
                    <ChestIcon size={26} /> Lock &amp; edit later <span className="badge badge-free">FREE</span>
                  </summary>
                  <div className="panel-body">
                    <label className="check">
                      <input type="checkbox" checked={lock} disabled={pro} onChange={(e) => setLock(e.target.checked)} />
                      <span>
                        Let me change where this code points
                        <span className="hint">Set a passphrase. Go to your-link/edit any time, unlock it, and swap the destination. No account.</span>
                      </span>
                    </label>
                    {lock && (
                      <>
                        <div className="grid2">
                          <label className="field">
                            Passphrase
                            <input
                              type={showPass ? "text" : "password"}
                              autoComplete="new-password"
                              value={pass}
                              onChange={(e) => setPass(e.target.value.replace(/\s/g, ""))}
                            />
                          </label>
                          <label className="field">
                            Confirm
                            <input type={showPass ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\s/g, ""))} />
                          </label>
                        </div>
                        <label className="check small">
                          <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)} />
                          Show passphrase
                        </label>
                        <div className={passIssue ? "warn" : "success"}>
                          {passIssue ?? "Solid. Write it down: we can't recover it, there's no account to reset."}
                        </div>
                      </>
                    )}
                  </div>
                </details>

                <details className="panel" style={{ marginTop: 14 }}>
                  <summary>
                    <BombIcon size={26} /> Self-destruct <span className="badge badge-free">FREE</span>
                  </summary>
                  <div className="panel-body">
                    <div className="grid2">
                      <label className="field">
                        Expires on
                        <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                      </label>
                      <label className="field">
                        Max scans
                        <input type="number" min={1} inputMode="numeric" placeholder="Unlimited" value={maxScans} onChange={(e) => setMaxScans(e.target.value)} />
                      </label>
                    </div>
                    <label className="field">
                      Message after it dies
                      <input type="text" maxLength={280} placeholder="This offer sailed away. Catch the next one!" value={expiredMessage} onChange={(e) => setExpiredMessage(e.target.value)} />
                    </label>
                  </div>
                </details>

                <details className="panel" style={{ marginTop: 14 }} open={pro}>
                  <summary>
                    <LogbookIcon size={26} /> Captain&apos;s log <span className="badge badge-pro">PRO</span>
                  </summary>
                  <div className="panel-body">
                    <label className="check">
                      <input type="checkbox" checked={pro} onChange={(e) => togglePro(e.target.checked)} />
                      <span>
                        Track scans and route by device
                        <span className="hint">
                          Scans, unique visitors, countries, cities, devices, QR vs link clicks, CSV export. Needs a passphrase so only you see the numbers.
                          {proBeta ? " Free during the beta." : ""}
                        </span>
                      </span>
                    </label>
                    {pro && (
                      <div className="grid2">
                        <label className="field">
                          iPhone link <span className="hint">Optional. e.g. App Store</span>
                          <input type="url" inputMode="url" value={iosUrl} onChange={(e) => setIosUrl(e.target.value)} />
                        </label>
                        <label className="field">
                          Android link <span className="hint">Optional. e.g. Play Store</span>
                          <input type="url" inputMode="url" value={androidUrl} onChange={(e) => setAndroidUrl(e.target.value)} />
                        </label>
                      </div>
                    )}
                  </div>
                </details>
              </>
            )}
          </div>
        )}

        <StyleStudio style={style} onChange={setStyle} />
      </div>

      <aside className="preview-col">
        <section className="card stack">
          <div className="preview">
            {!ready && <span className="ribbon">PREVIEW</span>}
            {payload ? <QrView text={payload} style={style} /> : <p className="muted center">Fill in the details and yer code surfaces here.</p>}
          </div>

          <input className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

          {error && <div className="error">{error}</div>}

          {dynamic && !created && (
            <button type="button" className="btn btn-primary btn-lg btn-block" disabled={busy || !finalUrl} onClick={forge}>
              {busy ? "Hoisting the colors…" : "Hoist my code\u00a0⚑"}
            </button>
          )}

          {created && (
            <div className="stack">
              <div className="success">
                Ahoy! Yer code is live.{" "}
                {created.locked ? "Steer it somewhere new any time from the edit page." : "Stashed in My codes on this device."}
              </div>
              {!created.persistent && <div className="warn">Demo mode: this server has no database, so this code may disappear.</div>}
              <ShortLink url={created.shortUrl} />
              <div className="row">
                {created.editUrl && (
                  <a className="btn btn-sm btn-white" href={created.editUrl}>
                    Edit page
                  </a>
                )}
                {created.statsUrl && (
                  <a className="btn btn-sm btn-pink" href={created.statsUrl}>
                    Stats
                  </a>
                )}
                {created.upgradeUrl && (
                  <a className="btn btn-sm btn-pink" href={created.upgradeUrl}>
                    Finish upgrade
                  </a>
                )}
              </div>
            </div>
          )}

          <DownloadBar text={payload} style={style} name={fileName} disabled={!ready} />

          {!dynamic && ready && (
            <button type="button" className="btn btn-white btn-block" onClick={saveStatic}>
              Stash in My codes
            </button>
          )}
          {created && (
            <button type="button" className="btn btn-white btn-block" onClick={reset}>
              Make another
            </button>
          )}
          <p className="small muted center" style={{ margin: 0 }}>
            Yer <Link href="/chest">treasure chest</Link> lives on this device. No account, ever.
          </p>
        </section>
      </aside>
    </div>
  );
}
