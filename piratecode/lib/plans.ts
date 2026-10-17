// Plans and the seam where payments will plug in.
//
// Today: PIRATECODE_PRO_BETA (default "on") grants Pro for free so the analytics
// features can be used and tested. To add payments later:
//   1. Make `proCheckout` create a checkout session (Stripe etc.) for the slug and
//      return its URL instead of granting Pro directly.
//   2. Add a webhook route that calls `store.updateCode(slug, { plan: "pro" })`
//      when the payment succeeds (and back to "free" when a subscription lapses).
// Nothing else in the app needs to change: every Pro check reads `code.plan`.

export const PLANS = {
  free: {
    name: "Deckhand",
    price: "Free forever",
    features: [
      "Unlimited QR codes",
      "No account, no signup",
      "Editable destination (with passphrase)",
      "Pause, expiry date and scan caps",
      "Full style studio + frames",
      "PNG and SVG downloads",
    ],
  },
  pro: {
    name: "Captain",
    price: "$5 / code / month",
    features: [
      "Everything in Deckhand",
      "Scan analytics: totals, uniques, trends",
      "Devices, OS, browsers, countries, cities",
      "QR scans vs link clicks",
      "Smart routing: separate iOS and Android links",
      "CSV export of every scan",
    ],
  },
} as const;

export function proBetaOpen(): boolean {
  return (process.env.PIRATECODE_PRO_BETA ?? "on") !== "off";
}

/**
 * Decides what happens when someone asks for Pro on a code.
 * Returns "granted" when Pro was applied immediately, or a URL to send them to.
 */
export function proCheckout(slug: string): { granted: true } | { redirect: string } {
  if (proBetaOpen()) return { granted: true };
  return { redirect: `/pro?code=${encodeURIComponent(slug)}` };
}
