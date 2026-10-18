# PirateCode

QR codes with no strings attached. Working name; rename freely.

- **Deckhand (free):** no login, no signup. Make a code, style it, download it.
- **Captain (paid):** everything free plus scan analytics and device routing.

Next.js 16 (App Router) + Postgres. Lives in `piratecode/` inside the wecnal.com repo and deploys as its own Vercel
project (Root Directory `piratecode`). Don't merge it to main as-is: the wecnal.com
static site would then serve these source files under /piratecode/.

## How it works

Every dynamic code gets a random 6 character slug (`/tt7ube`). Scanning it hits
`app/[slug]/route.ts`, which checks pause / expiry / scan cap, counts the scan, records
analytics for Captain codes and 302s to the destination.

- `/{slug}/edit`: if the code has no passphrase, shows a custom "no lock" page. Otherwise asks
  for the passphrase (12+ chars, no spaces, scrypt hashed, 5 misses = 15 minute lockout) and
  then lets you change the destination, pause, expiry, scan cap, style, passphrase, or delete.
- `/{slug}/stats`: Captain analytics behind the same passphrase. CSV export at `/stats/csv`.
- `/api/codes` (POST): creates a code. Doubles as a public API later.
- `/chest`: "My codes", stored in the browser's localStorage. No account.

### Features

1. Six code types: link, text, Wi‑Fi, contact (vCard), email, SMS. Non-link types are generated
   entirely in the browser and never touch the server.
2. Dynamic vs Direct links: Direct bakes the URL into the code (never changes, never tracked).
3. Style studio: 80s presets, gradients, dot/eye shapes, error correction, margin, live
   scannability warnings (contrast, inverted colors, quiet zone).
4. Frames with a call to action label (SCAN ME, MENU, ...).
5. SVG and PNG downloads up to 4096px.
6. Self-destruct: expiry date and/or scan cap with a custom goodbye message.
7. Pause / resume.
8. UTM campaign builder.
9. My codes (per-device history).
10. Abuse reporting (`/report`), destination validation (http/https only, no self-loops,
    `BLOCKED_HOSTS`), bot/link-preview filtering so chat apps don't inflate scan counts.

Captain only: analytics (scans, daily uniques, QR vs link clicks, countries, cities, devices,
OS, browsers, referrers, time of day, CSV) and iOS / Android specific destinations.

Link clicks vs scans: the QR encodes `/{slug}`; the copy button gives `/{slug}?l`, which is
logged as a link click.

## Payments (not wired yet)

All of it funnels through `lib/plans.ts`. With `PIRATECODE_PRO_BETA=on` (the default) Pro is
granted for free. To charge: make `proCheckout()` return a checkout URL, and add a webhook route
that sets `plan = 'pro'` on the code when payment succeeds. Every Pro check reads `code.plan`,
so nothing else changes. Prices shown on `/pro` come from `PLANS` in the same file.

## Running it

```bash
cd piratecode
npm install
npm run dev            # no DATABASE_URL = in-memory store (demo mode banner)
```

Production needs a Postgres database (Supabase, Neon, anything):

```bash
DATABASE_URL=postgres://... npm run db:schema   # creates the tables, idempotent
```

Environment variables: see `.env.example`. `SESSION_SECRET` must be set in production.

### Vercel

Create a project from this repo with **Root Directory = `piratecode`**, framework Next.js,
then set `DATABASE_URL`, `SESSION_SECRET`, and (once there's a domain) `NEXT_PUBLIC_BASE_URL`.
Use the Supabase transaction pooler URL (port 6543) on serverless.

## Current deployment

- **Live:** https://piratecodes.vercel.app (Vercel project `piratecode`, team swecnals-projects,
  Root Directory `piratecode`, region iad1). Pushes to the repo auto-deploy.
- **Database:** schema `piratecode` inside the existing `aballforall` Supabase project
  (us-east-1), accessed by a dedicated `piratecode` Postgres role that owns only that schema.
  No other tables are touched. Connection is the transaction pooler
  (`aws-1-us-east-1.pooler.supabase.com:6543`); the credentials live only in the Vercel env vars.
- **Moving it out later:** `pg_dump --schema=piratecode`, restore into a new database, run
  `npm run db:schema` there if starting fresh, and swap `DATABASE_URL`.
- **Health check:** `/api/health` returns `{"ok":true,"database":true}` when the DB is reachable.
