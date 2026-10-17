-- PirateCode schema. Idempotent: safe to run more than once.

create table if not exists codes (
  slug             text primary key,
  destination      text not null,
  ios_url          text,
  android_url      text,
  label            text,
  plan             text not null default 'free' check (plan in ('free', 'pro')),
  pass_hash        text,
  paused           boolean not null default false,
  expires_at       timestamptz,
  max_scans        integer check (max_scans is null or max_scans > 0),
  expired_message  text,
  scan_count       integer not null default 0,
  style            jsonb,
  failed_attempts  integer not null default 0,
  locked_until     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists scans (
  id         bigserial primary key,
  slug       text not null references codes(slug) on delete cascade,
  at         timestamptz not null default now(),
  source     text not null,
  device     text,
  os         text,
  browser    text,
  country    text,
  region     text,
  city       text,
  referrer   text,
  visitor    text
);

create index if not exists scans_slug_at on scans (slug, at desc);

create table if not exists reports (
  id          bigserial primary key,
  slug        text not null,
  reason      text not null,
  details     text,
  reporter_ip text,
  created_at  timestamptz not null default now()
);

-- The app connects with a server-side role and never through the public API,
-- so lock the tables down for anon/authenticated (matters on Supabase).
alter table codes enable row level security;
alter table scans enable row level security;
alter table reports enable row level security;
