import QRCode from "qrcode";

export type ModuleShape = "square" | "rounded" | "dots";
export type EyeShape = "square" | "rounded" | "circle";
export type Ecc = "L" | "M" | "Q" | "H";

export type QrStyle = {
  fg: string;
  bg: string;
  /** When set, modules are filled with a gradient from fg to this color. */
  fg2: string | null;
  eye: string;
  shape: ModuleShape;
  eyeShape: EyeShape;
  ecc: Ecc;
  margin: number;
  frame: boolean;
  frameLabel: string;
  /** Small Jolly Rogers on either side of the frame label. */
  frameSkull: boolean;
  frameColor: string;
  frameText: string;
};

export const DEFAULT_STYLE: QrStyle = {
  fg: "#14101f",
  bg: "#ffffff",
  fg2: null,
  eye: "#14101f",
  shape: "square",
  eyeShape: "square",
  ecc: "M",
  margin: 3,
  frame: false,
  frameLabel: "SCAN ME",
  frameSkull: false,
  frameColor: "#14101f",
  frameText: "#ffffff",
};

export const PRESETS: { name: string; style: Partial<QrStyle> }[] = [
  { name: "Black Pearl", style: { fg: "#14101f", fg2: null, eye: "#14101f", bg: "#ffffff" } },
  { name: "Jolly Roger", style: { fg: "#14101f", fg2: null, eye: "#c81e1e", bg: "#f6ecd6" } },
  { name: "Sunset", style: { fg: "#d9480f", fg2: "#6b21d6", eye: "#14101f", bg: "#ffffff" } },
  { name: "Port Royal", style: { fg: "#6b21d6", fg2: "#00897b", eye: "#d6197a", bg: "#ffffff" } },
  { name: "Tortuga", style: { fg: "#1d1340", fg2: null, eye: "#d6197a", bg: "#fff3d6" } },
  { name: "Davy Jones", style: { fg: "#00695f", fg2: "#1d4fd8", eye: "#14101f", bg: "#effffb" } },
  { name: "Kraken", style: { fg: "#4c1d95", fg2: null, eye: "#ea580c", bg: "#fdf4ff" } },
  { name: "Doubloon", style: { fg: "#5c3200", fg2: "#b45309", eye: "#14101f", bg: "#fff7e0" } },
];

const HEX = /^#[0-9a-f]{6}$/i;
const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T =>
  allowed.includes(v as T) ? (v as T) : d;
const color = (v: unknown, d: string) => (typeof v === "string" && HEX.test(v) ? v.toLowerCase() : d);

/** Coerces untrusted input into a safe style. Everything rendered goes through here. */
export function sanitizeStyle(input: unknown): QrStyle {
  const s = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_STYLE;
  return {
    fg: color(s.fg, d.fg),
    bg: color(s.bg, d.bg),
    fg2: s.fg2 ? color(s.fg2, d.fg) : null,
    eye: color(s.eye, d.eye),
    shape: pick(s.shape, ["square", "rounded", "dots"] as const, d.shape),
    eyeShape: pick(s.eyeShape, ["square", "rounded", "circle"] as const, d.eyeShape),
    ecc: pick(s.ecc, ["L", "M", "Q", "H"] as const, d.ecc),
    margin: typeof s.margin === "number" ? Math.max(0, Math.min(8, Math.round(s.margin))) : d.margin,
    frame: s.frame === true,
    frameLabel: typeof s.frameLabel === "string" ? s.frameLabel.slice(0, 24) : d.frameLabel,
    frameSkull: s.frameSkull === true,
    frameColor: color(s.frameColor, d.frameColor),
    frameText: color(s.frameText, d.frameText),
  };
}

// --- Payloads for the static content types ---------------------------------

const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

export function wifiPayload(ssid: string, password: string, security: "WPA" | "WEP" | "nopass", hidden: boolean) {
  const pass = security === "nopass" ? "" : `P:${esc(password)};`;
  return `WIFI:T:${security};S:${esc(ssid)};${pass}${hidden ? "H:true;" : ""};`;
}

export function vcardPayload(c: {
  first: string;
  last: string;
  org: string;
  title: string;
  phone: string;
  email: string;
  url: string;
}) {
  const v = (s: string) => s.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${v(c.last)};${v(c.first)};;;`, `FN:${v(`${c.first} ${c.last}`.trim())}`];
  if (c.org) lines.push(`ORG:${v(c.org)}`);
  if (c.title) lines.push(`TITLE:${v(c.title)}`);
  if (c.phone) lines.push(`TEL;TYPE=CELL:${v(c.phone)}`);
  if (c.email) lines.push(`EMAIL:${v(c.email)}`);
  if (c.url) lines.push(`URL:${v(c.url)}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export function emailPayload(to: string, subject: string, body: string) {
  const q = new URLSearchParams();
  if (subject) q.set("subject", subject);
  if (body) q.set("body", body);
  const qs = q.toString().replace(/\+/g, "%20");
  return `mailto:${to}${qs ? `?${qs}` : ""}`;
}

export function smsPayload(number: string, message: string) {
  return `SMSTO:${number}:${message}`;
}

// --- Scannability ------------------------------------------------------------

function luminance(hex: string): number {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length < 3) return 0;
  const [r, g, b] = m.slice(0, 3).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Human readable warnings, empty when the code should scan fine. */
export function scanWarnings(style: QrStyle): string[] {
  const out: string[] = [];
  const darks = [style.fg, style.fg2, style.eye].filter(Boolean) as string[];
  const worst = Math.min(...darks.map((c) => contrast(c, style.bg)));
  if (worst < 3) out.push("Low contrast: some phones will struggle. Darken the code or lighten the background.");
  if (darks.some((c) => luminance(c) > luminance(style.bg))) {
    out.push("Light-on-dark codes confuse older scanners. Keep the code darker than the background.");
  }
  if (style.margin < 2) out.push("Tiny quiet zone. Leave at least 2 modules of margin if printing on busy backgrounds.");
  return out;
}

// --- Rendering -----------------------------------------------------------------

const EYE_ORIGINS = (n: number) => [
  [0, 0],
  [n - 7, 0],
  [0, n - 7],
];

function inEye(r: number, c: number, n: number) {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

function eyeSvg(x: number, y: number, shape: EyeShape, color: string) {
  if (shape === "circle") {
    return (
      `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="3" fill="none" stroke="${color}" stroke-width="1"/>` +
      `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${color}"/>`
    );
  }
  const rx = shape === "rounded" ? 1.6 : 0;
  const rxi = shape === "rounded" ? 0.8 : 0;
  return (
    `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="${rx}" fill="none" stroke="${color}" stroke-width="1"/>` +
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${rxi}" fill="${color}"/>`
  );
}

const escapeXml = (s: string) =>
  s.replace(/[<>&"']/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[ch]!);

/** Renders `text` as a standalone SVG document string. Units are QR modules. */
export function renderQrSvg(text: string, rawStyle: QrStyle): string {
  const style = sanitizeStyle(rawStyle);
  const qr = QRCode.create(text || " ", { errorCorrectionLevel: style.ecc });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const m = Math.max(0, Math.min(8, style.margin));
  const size = n + m * 2;

  const parts: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!data[r * n + c] || inEye(r, c, n)) continue;
      const x = c + m;
      const y = r + m;
      if (style.shape === "dots") parts.push(`<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.42"/>`);
      else if (style.shape === "rounded") parts.push(`<rect x="${x + 0.05}" y="${y + 0.05}" width="0.9" height="0.9" rx="0.32"/>`);
      else parts.push(`M${x} ${y}h1v1h-1z`);
    }
  }

  const gid = `pcg${(style.fg + (style.fg2 ?? "")).replace(/[^a-z0-9]/gi, "")}`;
  const fill = style.fg2 ? `url(#${gid})` : style.fg;
  const body =
    style.shape === "square"
      ? `<path d="${parts.join("")}" fill="${fill}" shape-rendering="crispEdges"/>`
      : `<g fill="${fill}">${parts.join("")}</g>`;
  const eyes = EYE_ORIGINS(n)
    .map(([c, r]) => eyeSvg(c + m, r + m, style.eyeShape, style.eye))
    .join("");
  const defs = style.fg2
    ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${style.fg}"/><stop offset="1" stop-color="${style.fg2}"/></linearGradient></defs>`
    : "";

  const code = `${defs}<rect width="${size}" height="${size}" fill="${style.bg}"/>${body}${eyes}`;

  if (!style.frame) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 10}" height="${size * 10}">${code}</svg>`;
  }

  // Frame: a thick border with a label band underneath, neo-brutalist style.
  const pad = 1.5;
  const band = 6;
  const w = size + pad * 2;
  const h = size + pad * 2 + band;
  const raw = style.frameLabel.slice(0, 24) || "SCAN ME";
  const label = escapeXml(raw);
  const cy = pad + size + (pad + band) / 2;
  const skull = 3.8;
  const room = style.frameSkull ? w - 2 * (1.4 + skull + 1) : w - 4;
  const fontSize = Math.min(3.6, room / Math.max(4, raw.length * (style.frameSkull ? 0.82 : 0.68)));
  const skulls = style.frameSkull
    ? [1.4, w - 1.4 - skull]
        .map(
          (x) =>
            `<g transform="translate(${x} ${cy - skull / 2}) scale(${skull / 10})">` +
            `<path d="M5 .6C2.4.6.8 2.4.8 4.7c0 1.4.7 2.4 1.7 3V9.4h5V7.7c1-.6 1.7-1.6 1.7-3C9.2 2.4 7.6.6 5 .6Z" fill="${style.frameText}"/>` +
            `<rect x="2.4" y="3.7" width="2" height="2" fill="${style.frameColor}"/>` +
            `<rect x="5.6" y="3.7" width="2" height="2" fill="${style.frameColor}"/>` +
            `<path d="M5 6.2 4.4 7.3h1.2Z" fill="${style.frameColor}"/></g>`,
        )
        .join("")
    : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 10}" height="${h * 10}">` +
    `<rect width="${w}" height="${h}" rx="1.2" fill="${style.frameColor}"/>` +
    `<g transform="translate(${pad} ${pad})">${code}</g>` +
    skulls +
    `<text x="${w / 2}" y="${cy}" dominant-baseline="central" text-anchor="middle" ` +
    `font-family="'Archivo Black','Arial Black',Impact,sans-serif" font-weight="900" font-size="${fontSize}" ` +
    `letter-spacing="0.15" fill="${style.frameText}">${label}</text></svg>`
  );
}
