import "server-only";
import { cookies } from "next/headers";
import { sessionCookieName, SLUG_PATTERN, verifySessionToken } from "./security";
import { type Code, store } from "./store";

/** Returns the code when the current visitor has unlocked it with its passphrase. */
export async function sessionCode(slug: string): Promise<Code | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  const code = await store.getCode(slug);
  if (!code?.passHash) return null;
  const token = (await cookies()).get(sessionCookieName(slug))?.value;
  return verifySessionToken(token, slug, code.passHash) ? code : null;
}
