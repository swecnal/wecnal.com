import Link from "next/link";

export function Problem({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="wrap narrow" style={{ paddingTop: 48 }}>
      <div className="card stack center">
        <div className="big-emoji" aria-hidden="true">
          {emoji}
        </div>
        <h1 style={{ fontSize: 34 }}>{title}</h1>
        <div className="muted">{children}</div>
        <div>
          <Link href="/" className="btn btn-primary">
            Make a new code
          </Link>
        </div>
      </div>
    </div>
  );
}
