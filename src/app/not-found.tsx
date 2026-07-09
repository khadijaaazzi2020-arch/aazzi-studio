import type { Metadata } from "next";
import Link from "next/link";
import NotFoundTracker from "@/components/NotFoundTracker";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Minimal branded 404 built entirely from existing global utility classes —
// no new visual styles. Its main job is a way back home plus the
// page_not_found analytics event (broken inbound links show up in GA4).
export default function NotFound() {
  return (
    <main className="section">
      <NotFoundTracker />
      <div className="shell" style={{ textAlign: "center", paddingBlock: "18vh" }}>
        <p className="eyebrow">404 — page not found</p>
        <h1 style={{ marginBlock: "1rem 1.5rem" }}>
          This page doesn&apos;t exist.
        </h1>
        <p style={{ color: "var(--text-dim)", marginBottom: "2.2rem" }}>
          The link may be outdated or mistyped. Let&apos;s get you back on track.
        </p>
        <Link className="btn btn-coral" href="/">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
