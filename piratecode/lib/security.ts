import "server-only";
import { createHash, createHmac, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

let warned = false;
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (!warned) {
    console.warn("[piratecode] SESSION_SECRET is not set; using an insecure development secret.");
    warned = true;
  }
  return "piratecode-dev-secret-change-me";
}

// --- Slugs -----------------------------------------------------------------

// No 0/o, 1/l/i: slugs get read aloud and typed from print.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const SLUG_PATTERN = /^[a-z0-9]{4,32}$/;

export function newSlug(length = 6): string {
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

// --- Passphrases -------------------------------------------------------------

export const PASSPHRASE_MIN = 12;
export const PASSPHRASE_MAX = 128;

export function passphraseProblem(p: string): string | null {
  if (/\s/.test(p)) return "Passphrase can't contain spaces.";
  if (p.length < PASSPHRASE_MIN) return `Passphrase needs at least ${PASSPHRASE_MIN} characters.`;
  if (p.length > PASSPHRASE_MAX) return `Passphrase can be at most ${PASSPHRASE_MAX} characters.`;
  return null;
}

export async function hashPassphrase(p: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(p, salt, 32);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassphrase(p: string, stored: string): Promise<boolean> {
  const [scheme, salt, key] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = await scryptAsync(p, Buffer.from(salt, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

// After this many wrong guesses the code locks for LOCK_MINUTES.
export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

// --- Unlock sessions ---------------------------------------------------------

export const SESSION_HOURS = 2;

export function sessionCookieName(slug: string) {
  return `pc_${slug}`;
}

// Binding the token to the stored hash means changing the passphrase logs everyone out.
function sign(slug: string, exp: number, passHash: string) {
  return createHmac("sha256", secret()).update(`${slug}|${exp}|${passHash}`).digest("base64url");
}

export function createSessionToken(slug: string, passHash: string): string {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  return `${exp}.${sign(slug, exp, passHash)}`;
}

export function verifySessionToken(token: string | undefined, slug: string, passHash: string | null): boolean {
  if (!token || !passHash) return false;
  const [expRaw, mac] = token.split(".");
  const exp = Number(expRaw);
  if (!mac || !Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = Buffer.from(sign(slug, exp, passHash));
  const actual = Buffer.from(mac);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// --- Visitors ----------------------------------------------------------------

/** Daily-rotating anonymous visitor id. Raw IPs are never stored. */
export function visitorId(slug: string, ip: string, ua: string, day = new Date()): string {
  const d = day.toISOString().slice(0, 10);
  return createHash("sha256").update(`${secret()}|${d}|${slug}|${ip}|${ua}`).digest("hex").slice(0, 16);
}
