"use client";

import { useActionState } from "react";
import { type FormState, reportAction } from "@/app/actions";

export function ReportForm({ initial }: { initial: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(reportAction, null);
  if (state?.ok) return <div className="success">{state.message}</div>;
  return (
    <form action={action} className="card stack">
      <label className="field">
        Code link or slug
        <input name="slug" type="text" required defaultValue={initial} placeholder="tt7ube" />
      </label>
      <label className="field">
        What's wrong?
        <select name="reason" required defaultValue="">
          <option value="" disabled>
            Pick one
          </option>
          <option value="phishing">Phishing or scam</option>
          <option value="malware">Malware or virus</option>
          <option value="spam">Spam</option>
          <option value="illegal">Illegal content</option>
          <option value="other">Something else</option>
        </select>
      </label>
      <label className="field">
        Details <span className="hint">Optional</span>
        <textarea name="details" maxLength={2000} />
      </label>
      {state?.error && <div className="error">{state.error}</div>}
      <button className="btn btn-danger" disabled={pending}>
        {pending ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
