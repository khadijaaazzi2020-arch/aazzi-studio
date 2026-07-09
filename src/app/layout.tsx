import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Syne, Geist } from "next/font/google";
import "./globals.css";
import StyledJsxRegistry from "@/components/StyledJsxRegistry";
import SmoothScroll from "@/components/SmoothScroll";
import ContactModal from "@/components/ContactModal";
import MobileCtaBar from "@/components/MobileCtaBar";
// TEMPORARY — Investigation #2 (1127.92px flash) diagnostic. Self-disables in
// production unless ?debug=viewport is present. Delete this import + the
// <ViewportProbe /> mount below once on-device verification is complete.
import ViewportProbe from "@/components/ViewportProbe";
import { SITE_URL } from "@/lib/site";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "AAZZI STUDIO — Premium Websites & E-commerce Stores",
    template: "%s · AAZZI STUDIO",
  },
  applicationName: "AAZZISTUDIO",
  description:
    "We design fast, modern websites and high-converting e-commerce stores that help brands grow online. Custom design, mobile-optimized, and conversion-focused.",
  keywords: [
    "website design",
    "web development",
    "e-commerce stores",
    "Shopify stores",
    "online business",
    "conversion optimization",
    "AAZZI STUDIO",
  ],
  authors: [{ name: "AAZZI STUDIO" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "AAZZI STUDIO — Premium Websites & E-commerce Stores",
    description:
      "Fast, modern websites and high-converting e-commerce stores that help brands grow online.",
    siteName: "AAZZI STUDIO",
    images: [{ url: "/aazzi-logo.jpg", width: 1242, height: 1242, alt: "AAZZI STUDIO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AAZZI STUDIO — Premium Websites & E-commerce Stores",
    description:
      "Fast, modern websites and high-converting e-commerce stores that help brands grow online.",
    images: ["/aazzi-logo.jpg"],
  },
  // Full favicon / app-icon set generated from the brand logo
  // (see scripts/gen-favicons.mjs). Files live in /public.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    title: "AAZZISTUDIO",
    statusBarStyle: "black-translucent",
  },
  other: {
    "msapplication-TileColor": "#121414",
    "msapplication-TileImage": "/mstile-150x150.png",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  themeColor: "#121414",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// GTM container ID; inlined at build time. GTM is the sole analytics loader
// (GA4 is configured inside the container) and only loads in production
// builds AND when the ID is configured, so dev/preview traffic never
// pollutes the property.
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${geist.variable}`}>
      {process.env.NODE_ENV === "production" && gtmId && (
        <GoogleTagManager gtmId={gtmId} />
      )}
      <body>
        {/* GTM noscript fallback — the @next/third-parties component only
            renders the script half of the snippet. */}
        {process.env.NODE_ENV === "production" && gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <StyledJsxRegistry>
          <ViewportProbe />
          <SmoothScroll>{children}</SmoothScroll>
          <ContactModal />
          <MobileCtaBar />
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
