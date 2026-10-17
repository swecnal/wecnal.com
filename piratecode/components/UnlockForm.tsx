"use client";

import { useActionState } from "react";
import { type FormState, unlockAction } from "@/app/actions";

export function UnlockForm({ slug, next }: { slug: string; next: "edit" | "stats" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(unlockAction, null);
  return (
    <form action={action} className="card stack">
      <span className="card-tag">LOCKED</span>
      <h2>Unlock {slug}</h2>
      <p className="muted" style={{ margin: 0 }}>
        Enter the passphrase you set when you made this code.
      </p>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="next" value={next} />
      <label className="field">
        Passphrase
        <input name="passphrase" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {state?.error && <div className="error">{state.error}</div>}
      <button className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Checking…" : "Unlock"}
      </button>
      <p className="small muted" style={{ margin: 0 }}>
        Forgot it? There's no account to reset, so the passphrase can't be recovered. The code keeps working; make a new one if
        you need to change it.
      </p>
    </form>
  );
}
