import "server-only";
import postgres from "postgres";
import type { QrStyle } from "./qr";

export type Plan = "free" | "pro";

export type Code = {
  slug: string;
  destination: string;
  iosUrl: string | null;
  androidUrl: string | null;
  label: string | null;
  plan: Plan;
  passHash: string | null;
  paused: boolean;
  expiresAt: Date | null;
  maxScans: number | null;
  expiredMessage: string | null;
  scanCount: number;
  style: QrStyle | null;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewCode = Pick<
  Code,
  | "slug"
  | "destination"
  | "iosUrl"
  | "androidUrl"
  | "label"
  | "plan"
  | "passHash"
  | "expiresAt"
  | "maxScans"
  | "expiredMessage"
  | "style"
>;

export type CodePatch = Partial<
  Pick<
    Code,
    | "destination"
    | "iosUrl"
    | "androidUrl"
    | "label"
    | "plan"
    | "passHash"
    | "paused"
    | "expiresAt"
    | "maxScans"
    | "expiredMessage"
    | "style"
    | "failedAttempts"
    | "lockedUntil"
  >
>;

export type Scan = {
  slug: string;
  at: Date;
  source: "qr" | "link";
  device: string;
  os: string;
  browser: string;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  visitor: string;
};

export type Report = { slug: string; reason: string; details: string | null; reporterIp: string | null };

export interface Store {
  readonly persistent: boolean;
  createCode(code: NewCode): Promise<boolean>;
  getCode(slug: string): Promise<Code | null>;
  updateCode(slug: string, patch: CodePatch): Promise<void>;
  deleteCode(slug: string): Promise<void>;
  /** Atomically counts a scan. Returns false when the scan cap is already reached. */
  countScan(slug: string): Promise<boolean>;
  recordScan(scan: Scan): Promise<void>;
  listScans(slug: string, since: Date): Promise<Scan[]>;
  addReport(report: Report): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-memory store: local development and demos without a database.

class MemoryStore implements Store {
  readonly persistent = false;
  private codes = new Map<string, Code>();
  private scans: Scan[] = [];
  private reports: Report[] = [];

  async createCode(code: NewCode) {
    if (this.codes.has(code.slug)) return false;
    const now = new Date();
    this.codes.set(code.slug, {
      ...code,
      paused: false,
      scanCount: 0,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    });
    return true;
  }

  async getCode(slug: string) {
    const code = this.codes.get(slug);
    return code ? { ...code } : null;
  }

  async updateCode(slug: string, patch: CodePatch) {
    const code = this.codes.get(slug);
    if (code) this.codes.set(slug, { ...code, ...patch, updatedAt: new Date() });
  }

  async deleteCode(slug: string) {
    this.codes.delete(slug);
    this.scans = this.scans.filter((s) => s.slug !== slug);
  }

  async countScan(slug: string) {
    const code = this.codes.get(slug);
    if (!code) return false;
    if (code.maxScans !== null && code.scanCount >= code.maxScans) return false;
    code.scanCount++;
    return true;
  }

  async recordScan(scan: Scan) {
    this.scans.push(scan);
  }

  async listScans(slug: string, since: Date) {
    return this.scans.filter((s) => s.slug === slug && s.at >= since);
  }

  async addReport(report: Report) {
    this.reports.push(report);
  }
}

// ---------------------------------------------------------------------------
// Postgres store: production.

type Row = Record<string, unknown>;

function rowToCode(r: Row): Code {
  return {
    slug: r.slug as string,
    destination: r.destination as string,
    iosUrl: (r.ios_url as string) ?? null,
    androidUrl: (r.android_url as string) ?? null,
    label: (r.label as string) ?? null,
    plan: r.plan as Plan,
    passHash: (r.pass_hash as string) ?? null,
    paused: r.paused as boolean,
    expiresAt: (r.expires_at as Date) ?? null,
    maxScans: (r.max_scans as number) ?? null,
    expiredMessage: (r.expired_message as string) ?? null,
    scanCount: r.scan_count as number,
    style: (r.style as QrStyle) ?? null,
    failedAttempts: r.failed_attempts as number,
    lockedUntil: (r.locked_until as Date) ?? null,
    createdAt: r.created_at as Date,
    updatedAt: r.updated_at as Date,
  };
}

const COLUMNS: Record<keyof CodePatch, string> = {
  destination: "destination",
  iosUrl: "ios_url",
  androidUrl: "android_url",
  label: "label",
  plan: "plan",
  passHash: "pass_hash",
  paused: "paused",
  expiresAt: "expires_at",
  maxScans: "max_scans",
  expiredMessage: "expired_message",
  style: "style",
  failedAttempts: "failed_attempts",
  lockedUntil: "locked_until",
};

class PostgresStore implements Store {
  readonly persistent = true;
  // prepare:false keeps us compatible with transaction poolers (Supabase, Neon).
  constructor(private sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 3 })) {}

  async createCode(c: NewCode) {
    const rows = await this.sql`
      insert into codes (slug, destination, ios_url, android_url, label, plan, pass_hash,
                         expires_at, max_scans, expired_message, style)
      values (${c.slug}, ${c.destination}, ${c.iosUrl}, ${c.androidUrl}, ${c.label}, ${c.plan},
              ${c.passHash}, ${c.expiresAt}, ${c.maxScans}, ${c.expiredMessage},
              ${c.style ? this.sql.json(c.style) : null})
      on conflict (slug) do nothing
      returning slug`;
    return rows.length === 1;
  }

  async getCode(slug: string) {
    const rows = await this.sql`select * from codes where slug = ${slug}`;
    return rows[0] ? rowToCode(rows[0]) : null;
  }

  async updateCode(slug: string, patch: CodePatch) {
    const values: Row = { updated_at: new Date() };
    for (const [key, value] of Object.entries(patch)) {
      const column = COLUMNS[key as keyof CodePatch];
      if (!column) continue;
      values[column] = key === "style" && value ? this.sql.json(value as QrStyle) : value;
    }
    await this.sql`update codes set ${this.sql(values)} where slug = ${slug}`;
  }

  async deleteCode(slug: string) {
    await this.sql`delete from codes where slug = ${slug}`;
  }

  async countScan(slug: string) {
    const rows = await this.sql`
      update codes set scan_count = scan_count + 1
      where slug = ${slug} and (max_scans is null or scan_count < max_scans)
      returning scan_count`;
    return rows.length === 1;
  }

  async recordScan(s: Scan) {
    await this.sql`
      insert into scans (slug, at, source, device, os, browser, country, region, city, referrer, visitor)
      values (${s.slug}, ${s.at}, ${s.source}, ${s.device}, ${s.os}, ${s.browser}, ${s.country},
              ${s.region}, ${s.city}, ${s.referrer}, ${s.visitor})`;
  }

  async listScans(slug: string, since: Date) {
    const rows = await this.sql`
      select * from scans where slug = ${slug} and at >= ${since}
      order by at desc limit 50000`;
    return rows.map((r) => ({
      slug: r.slug,
      at: r.at,
      source: r.source,
      device: r.device,
      os: r.os,
      browser: r.browser,
      country: r.country,
      region: r.region,
      city: r.city,
      referrer: r.referrer,
      visitor: r.visitor,
    })) as Scan[];
  }

  async addReport(r: Report) {
    await this.sql`
      insert into reports (slug, reason, details, reporter_ip)
      values (${r.slug}, ${r.reason}, ${r.details}, ${r.reporterIp})`;
  }
}

// Survive dev hot reloads and reuse the connection across warm invocations.
const globalStore = globalThis as unknown as { __piratecodeStore?: Store };

export const store: Store =
  globalStore.__piratecodeStore ??
  (globalStore.__piratecodeStore = process.env.DATABASE_URL ? new PostgresStore() : new MemoryStore());
