// Tiny user-agent classifier. Good enough for dashboards, not for fingerprinting.

const BOT =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegram|discord|skype|curl|wget|python-requests|httpclient|headless|lighthouse|monitor/i;

export function isBot(ua: string): boolean {
  return !ua || BOT.test(ua);
}

export function parseUa(ua: string): { device: string; os: string; browser: string } {
  const os = /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /CrOS/.test(ua)
            ? "ChromeOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Other";

  const device = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))
    ? "Tablet"
    : /Mobi|iPhone|iPod|Android/.test(ua)
      ? "Mobile"
      : "Desktop";

  const browser = /SamsungBrowser/.test(ua)
    ? "Samsung Internet"
    : /Edg\//.test(ua)
      ? "Edge"
      : /OPR\/|Opera/.test(ua)
        ? "Opera"
        : /Firefox|FxiOS/.test(ua)
          ? "Firefox"
          : /Chrome|CriOS/.test(ua)
            ? "Chrome"
            : /Safari/.test(ua)
              ? "Safari"
              : "Other";

  return { device, os, browser };
}
