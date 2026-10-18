"use client";

import { useActionState } from "react";
import { ChestIcon } from "./PirateIcons";
import { type FormState, unlockAction } from "@/app/actions";

export function UnlockForm({ slug, next }: { slug: string; next: "edit" | "stats" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(unlockAction, null);
  return (
    <form action={action} className="card parchment stack">
      <div className="row" style={{ gap: 14 }}>
        <span className="problem-icon" style={{ width: 72, height: 72, margin: 0 }}>
          <ChestIcon size={48} />
        </span>
        <div>
          <p className="kicker" style={{ margin: 0 }}>
            Locked chest
          </p>
          <h2 style={{ margin: 0 }}>Unlock {slug}</h2>
        </div>
      </div>
      <p className="muted" style={{ margin: 0 }}>
        Speak the passphrase ye set when this code was made. Only its captain knows it.
      </p>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="next" value={next} />
      <label className="field">
        Passphrase
        <input name="passphrase" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {state?.error && <div className="error">{state.error}</div>}
      <button className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Turning the key…" : "Unlock the chest"}
      </button>
      <p className="small muted" style={{ margin: 0 }}>
        Lost the key? There&apos;s no account to reset, so the passphrase can&apos;t be recovered. The code keeps working; make a
        new one if you need to change course.
      </p>
    </form>
  );
}
