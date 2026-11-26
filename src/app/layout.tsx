import type { Metadata, Viewport } from "next";
import { Sora, Sniglet } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL, config } from "../config";
import "../index.css";
import "../App.css";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

const sniglet = Sniglet({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-sniglet",
});

const title = `${config.developer.fullName} · ${config.developer.title}`;
const description = config.developer.description;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  keywords: [
    "Tebi Njeik",
    "Full-Stack Developer",
    "ERP Developer",
    "Cameroon Developer",
    "React Developer",
    "Next.js Developer",
    "Odoo Developer",
  ],
  authors: [{ name: config.developer.fullName, url: SITE_URL }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: config.developer.fullName,
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e0f13",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the script below sets data-theme before React hydrates,
    // so <html> legitimately differs from what the server rendered.
    <html
      lang="en"
      className={`${sora.variable} ${sniglet.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a saved theme before first paint, per Next's "preventing flash before
            hydration" guide. Only the two known values are accepted. Dark is the default,
            so with nothing stored this does nothing. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);if(t==="light"){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#e3edf5")}}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        {children}
        <div className="grain-overlay" aria-hidden="true" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
