import Link from "next/link";

export function Problem({ icon, kicker, title, children }: { icon: React.ReactNode; kicker?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="wrap narrow" style={{ paddingTop: 48 }}>
      <div className="card parchment stack center">
        <div className="problem-icon">{icon}</div>
        {kicker && (
          <p className="kicker" style={{ margin: 0 }}>
            {kicker}
          </p>
        )}
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
