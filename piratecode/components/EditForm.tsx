"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { changePassphraseAction, deleteAction, type FormState, lockAction, updateAction, upgradeAction } from "@/app/actions";
import type { QrStyle } from "@/lib/qr";
import type { CodeStatus } from "@/lib/status";
import { updateChestStyle } from "./chest";
import { DownloadBar, QrView, ShortLink } from "./qr-client";
import { StyleStudio } from "./StyleStudio";

type EditableCode = {
  destination: string;
  iosUrl: string | null;
  androidUrl: string | null;
  label: string | null;
  plan: "free" | "pro";
  paused: boolean;
  expiresAt: string | null;
  maxScans: number | null;
  expiredMessage: string | null;
  style: QrStyle;
};

const STATUS_TEXT: Record<CodeStatus, string> = {
  live: "● Live",
  paused: "❚❚ Paused",
  expired: "✕ Expired",
  capped: "✕ Scan cap reached",
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditForm({ slug, shortUrl, code, status, proBeta }: { slug: string; shortUrl: string; code: EditableCode; status: CodeStatus; proBeta: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateAction, null);
  const [passState, passAction, passPending] = useActionState<FormState, FormData>(changePassphraseAction, null);
  const [delState, delAction, delPending] = useActionState<FormState, FormData>(deleteAction, null);
  const [style, setStyle] = useState(code.style);
  const [expires, setExpires] = useState(toLocalInput(code.expiresAt));
  const isPro = code.plan === "pro";

  function changeStyle(s: QrStyle) {
    setStyle(s);
    updateChestStyle(slug, s);
  }

  return (
    <div className="studio">
      <div className="main-col">
        <form action={action} className="card stack">
          <div className="row">
            <span className="card-tag" style={{ marginBottom: 0, background: status === "live" ? "var(--teal)" : "var(--red)" }}>
              {STATUS_TEXT[status]}
            </span>
            <span className={`badge ${isPro ? "badge-pro" : "badge-free"}`}>{isPro ? "CAPTAIN" : "DECKHAND"}</span>
            <span className="spacer" />
            {isPro && (
              <Link href={`/${slug}/stats`} className="btn btn-sm btn-pink">
                Stats →
              </Link>
            )}
          </div>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="style" value={JSON.stringify(style)} />
          <input type="hidden" name="expiresAt" value={expires ? new Date(expires).toISOString() : ""} />

          <label className="field">
            Destination
            <input className="big-input" name="destination" type="url" inputMode="url" defaultValue={code.destination} required />
          </label>
          <label className="field">
            Nickname
            <input name="label" type="text" maxLength={80} defaultValue={code.label ?? ""} />
          </label>

          {isPro && (
            <div className="grid2">
              <label className="field">
                iPhone link <span className="hint">Blank = use destination</span>
                <input name="iosUrl" type="url" inputMode="url" defaultValue={code.iosUrl ?? ""} />
              </label>
              <label className="field">
                Android link <span className="hint">Blank = use destination</span>
                <input name="androidUrl" type="url" inputMode="url" defaultValue={code.androidUrl ?? ""} />
              </label>
            </div>
          )}

          <label className="check">
            <input type="checkbox" name="paused" defaultChecked={code.paused} />
            <span>
              Pause this code
              <span className="hint">Scans land on a “temporarily docked” page until you switch it back on.</span>
            </span>
          </label>

          <div className="grid2">
            <label className="field">
              Expires on
              <input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} />
            </label>
            <label className="field">
              Max scans
              <input name="maxScans" type="number" min={1} inputMode="numeric" placeholder="Unlimited" defaultValue={code.maxScans ?? ""} />
            </label>
          </div>
          <label className="field">
            Message after it dies
            <input name="expiredMessage" type="text" maxLength={280} defaultValue={code.expiredMessage ?? ""} />
          </label>

          {state?.error && <div className="error">{state.error}</div>}
          {state?.ok && <div className="success">{state.message}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="opts-col stack" style={{ gap: 18 }}>
        <StyleStudio style={style} onChange={changeStyle} />

        {!isPro && (
          <form action={upgradeAction} className="card stack" style={{ background: "#ffe8f3" }}>
            <input type="hidden" name="slug" value={slug} />
            <h2>Want the numbers?</h2>
            <p className="muted" style={{ margin: 0 }}>
              Upgrade this code to Captain for scan analytics and iPhone/Android routing. The printed code stays exactly the same.
            </p>
            <button className="btn btn-pink">{proBeta ? "Upgrade free (beta) →" : "Upgrade to Captain →"}</button>
          </form>
        )}

        <form action={passAction} className="card stack">
          <h2>Change passphrase</h2>
          <input type="hidden" name="slug" value={slug} />
          <div className="grid2">
            <label className="field">
              New passphrase
              <input name="passphrase" type="password" autoComplete="new-password" minLength={12} required />
            </label>
            <label className="field">
              Confirm
              <input name="confirm" type="password" autoComplete="new-password" minLength={12} required />
            </label>
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            At least 12 characters, no spaces.
          </p>
          {passState?.error && <div className="error">{passState.error}</div>}
          {passState?.ok && <div className="success">{passState.message}</div>}
          <button className="btn btn-white" disabled={passPending}>
            {passPending ? "Saving…" : "Set new passphrase"}
          </button>
        </form>

        <form action={delAction} className="card stack" style={{ borderStyle: "dashed" }}>
          <h2>Scuttle this code</h2>
          <p className="muted" style={{ margin: 0 }}>
            Deletes the code and all its stats forever. Printed copies will stop working. Type <code>{slug}</code> to confirm.
          </p>
          <input type="hidden" name="slug" value={slug} />
          <input name="confirm" type="text" autoComplete="off" placeholder={slug} />
          {delState?.error && <div className="error">{delState.error}</div>}
          <button className="btn btn-danger" disabled={delPending}>
            Scuttle it
          </button>
        </form>
      </div>

      <aside className="preview-col">
        <section className="card stack">
          <div className="preview">
            <QrView text={shortUrl} style={style} />
          </div>
          <ShortLink url={shortUrl} />
          <DownloadBar text={shortUrl} style={style} name={`piratecode-${slug}`} />
          <form action={lockAction}>
            <input type="hidden" name="slug" value={slug} />
            <button className="btn btn-white btn-block">Lock it back up</button>
          </form>
        </section>
      </aside>
    </div>
  );
}
