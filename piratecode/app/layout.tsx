import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { store } from "@/lib/store";
import "./globals.css";

const display = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "PirateCode: QR codes, no strings attached", template: "%s · PirateCode" },
  description: "Make a QR code in seconds. No signup. Edit the link any time, add scan analytics when you need them.",
};

export const viewport: Viewport = { themeColor: "#fff4e0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {!store.persistent && (
          <div className="demo-banner">Demo mode: no database connected, codes may vanish on restart.</div>
        )}
        <header className="topbar">
          <div className="wrap">
            <Link href="/" className="brand" aria-label="PirateCode home">
              <Logo size={34} />
              <span className="brand-name">
                PIRATE<span>CODE</span>
              </span>
            </Link>
            <nav className="nav">
              <Link href="/chest">My codes</Link>
              <Link href="/pro" className="hide-sm">
                Pricing
              </Link>
              <Link href="/" className="btn btn-sm btn-primary">
                New code
              </Link>
            </nav>
          </div>
        </header>
        <div className="stripe" />
        <main>{children}</main>
        <footer className="footer">
          <div className="wrap">
            <span>PirateCode. No accounts. No nonsense.</span>
            <nav>
              <Link href="/pro">Pricing</Link>
              <Link href="/chest">My codes</Link>
              <Link href="/report">Report a code</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
