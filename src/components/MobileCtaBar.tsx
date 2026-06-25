"use client";

import { useEffect, useState } from "react";
import { openContactModal } from "./ContactModal";

/**
 * MobileCtaBar — a fixed, always-reachable "Start Your Project" bar on phones.
 *
 * Appears once the visitor scrolls past the hero, and politely hides when the
 * contact section / footer enters view so it never covers the closing CTA.
 * Honours iPhone safe-area insets and prefers-reduced-motion.
 */
export default function MobileCtaBar() {
  const [pastHero, setPastHero] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Hide the bar while the contact section is on screen — the page already
  // shows a full-width CTA there, so the sticky bar would be redundant + cover it.
  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearEnd(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  const visible = pastHero && !nearEnd;

  return (
    <div className={`mcta ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <button
        type="button"
        className="mcta-btn"
        onClick={openContactModal}
        tabIndex={visible ? 0 : -1}
      >
        Start Your Project
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <style jsx>{`
        .mcta {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 90;
          display: none;
          padding: 0.7rem clamp(0.9rem, 4vw, 1.3rem);
          padding-bottom: calc(0.7rem + env(safe-area-inset-bottom, 0px));
          background: linear-gradient(
            180deg,
            rgba(18, 20, 20, 0),
            rgba(18, 20, 20, 0.92) 38%
          );
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transform: translateY(120%);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .mcta.is-visible {
          transform: translateY(0);
          pointer-events: auto;
        }
        .mcta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          min-height: 54px;
          border: 0;
          border-radius: 999px;
          background: var(--coral);
          color: #fff;
          font-family: var(--font-sans), sans-serif;
          font-size: var(--step-0);
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 16px 38px -12px rgba(224, 71, 58, 0.75);
          transition: background 0.25s ease;
        }
        .mcta-btn:active { background: var(--coral-deep); }

        /* Phones only — desktop has the persistent navbar CTA. */
        @media (max-width: 760px) {
          .mcta { display: block; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mcta { transition: none; }
        }
      `}</style>
    </div>
  );
}
