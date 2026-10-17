import type { Metadata } from "next";
import { Problem } from "@/components/Problem";
import { EditForm } from "@/components/EditForm";
import { UnlockForm } from "@/components/UnlockForm";
import { proBetaOpen } from "@/lib/plans";
import { requestInfo } from "@/lib/request";
import { SLUG_PATTERN } from "@/lib/security";
import { sessionCode } from "@/lib/session";
import { codeStatus } from "@/lib/status";
import { DEFAULT_STYLE } from "@/lib/qr";
import { store } from "@/lib/store";

export const metadata: Metadata = { title: "Edit code", robots: { index: false } };

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug.toLowerCase();
  const code = SLUG_PATTERN.test(slug) ? await store.getCode(slug) : null;

  if (!code) {
    return (
      <Problem emoji="🏝️" title="No code here">
        We couldn't find a code called <code>{slug}</code>. Double check the link.
      </Problem>
    );
  }

  if (!code.passHash) {
    return (
      <Problem emoji="🔓" title="This chest has no lock">
        <p>
          The code <code>{slug}</code> was made without a passphrase, so nobody can edit it. That's a feature: nobody can
          hijack it either.
        </p>
        <p>Next time, switch on &ldquo;Lock &amp; edit later&rdquo; when you create a code.</p>
      </Problem>
    );
  }

  const unlocked = await sessionCode(slug);
  const { origin } = await requestInfo();

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Edit {slug}</h1>
        <p>Change where your code points without reprinting it.</p>
      </div>
      {unlocked ? (
        <EditForm
          slug={slug}
          shortUrl={`${origin}/${slug}`}
          status={codeStatus(unlocked)}
          proBeta={proBetaOpen()}
          code={{
            destination: unlocked.destination,
            iosUrl: unlocked.iosUrl,
            androidUrl: unlocked.androidUrl,
            label: unlocked.label,
            plan: unlocked.plan,
            paused: unlocked.paused,
            expiresAt: unlocked.expiresAt?.toISOString() ?? null,
            maxScans: unlocked.maxScans,
            expiredMessage: unlocked.expiredMessage,
            style: unlocked.style ?? DEFAULT_STYLE,
          }}
        />
      ) : (
        <div className="narrow">
          <UnlockForm slug={slug} next="edit" />
        </div>
      )}
    </div>
  );
}
