"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type Lenis from "lenis";
import { openContactModal } from "./ContactModal";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Why", href: "#why" },
];

// Fixed-header height — anchors must stop this far below the viewport top so
// the section heading isn't hidden behind the bar.
const NAV_OFFSET = 84;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the section currently crossing the upper-middle of the
  // viewport. IntersectionObserver is cheap and reliable across Safari/Chrome/
  // Opera (no scroll-handler math, no layout thrash).
  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock page scroll while the mobile drawer is open so the content behind it
  // doesn't scroll under the finger on iOS.
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      (window as unknown as { lenis?: Lenis }).lenis?.start();
    };
  }, [open]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    trackEvent(AnalyticsEvent.NAV_CLICK, {
      location: "navbar",
      link_target: href,
    });
    if (href !== "#top") setActive(href.slice(1));
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    // The mobile drawer leaves Lenis STOPPED. scrollTo() is ignored while
    // stopped, so resume it first (the open-effect cleanup also calls start —
    // start() is idempotent). Without this, mobile nav taps silently no-op.
    lenis?.start();
    const target =
      href === "#top"
        ? null
        : (document.querySelector(href) as HTMLElement | null);
    if (href === "#top") {
      if (lenis) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (lenis && target)
      lenis.scrollTo(target, { offset: -NAV_OFFSET, duration: 1.1 });
    else if (target)
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
        behavior: "smooth",
      });
  };

  const openProject = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    trackEvent(AnalyticsEvent.CTA_CLICK, {
      location: "navbar",
      cta_text: "Start Your Project",
    });
    openContactModal("navbar");
  };

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav-inner shell">
        <a href="#top" className="brand" onClick={(e) => go(e, "#top")} aria-label="AAZZI STUDIO — home">
          <Image src="/aazzi-logo.jpg" alt="AAZZI STUDIO" width={40} height={40} className="brand-mark" />
          <span className="brand-text">
            AAZZI<span className="coral">STUDIO</span>
          </span>
        </a>

        <nav id="primary-nav" className={`links ${open ? "open" : ""}`} aria-label="Primary">
          {LINKS.map((l) => {
            const isActive = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                className={isActive ? "is-active" : ""}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => go(e, l.href)}
              >
                {l.label}
              </a>
            );
          })}
          <a className="nav-cta" href="#contact" onClick={openProject}>
            Start Your Project
          </a>
        </nav>

        <button
          className={`burger ${open ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <style jsx>{`
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          transition: background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease;
          border-bottom: 1px solid transparent;
        }
        .nav.is-scrolled {
          background: rgba(18, 20, 20, 0.72);
          backdrop-filter: blur(14px) saturate(140%);
          border-bottom-color: var(--line);
        }
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 76px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-family: var(--font-display), serif;
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.02em;
        }
        .brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          object-fit: cover;
        }
        .links {
          display: flex;
          align-items: center;
          gap: 2.1rem;
          font-size: var(--step--1);
          letter-spacing: 0.04em;
        }
        .links a {
          position: relative;
          color: var(--text-dim);
          transition: color 0.25s ease;
        }
        .links a:hover { color: var(--text); }
        .links a.is-active { color: var(--text); }
        .links a.is-active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 2px;
          border-radius: 2px;
          background: var(--coral);
        }
        .nav-cta {
          color: #fff !important;
          background: var(--coral);
          border: 1px solid var(--coral);
          padding: 0.6rem 1.2rem;
          border-radius: 999px;
          box-shadow: 0 12px 30px -14px rgba(224, 71, 58, 0.7);
          transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .nav-cta:hover {
          background: var(--coral-bright);
          box-shadow: 0 16px 40px -14px rgba(255, 82, 70, 0.75);
          transform: translateY(-1px);
        }
        .burger {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          background: none;
          border: 0;
          cursor: pointer;
          /* 44×44 minimum touch target (Apple HIG) */
          min-width: 44px;
          min-height: 44px;
          padding: 8px;
          margin-right: -8px; /* keep the icon optically aligned to the edge */
        }
        .burger span {
          width: 24px;
          height: 2px;
          background: var(--text);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .burger.open span:nth-child(2) { opacity: 0; }
        .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        @media (max-width: 860px) {
          .burger { display: flex; }
          .links {
            position: fixed;
            inset: 0 0 0 auto;
            width: min(78vw, 340px);
            height: 100dvh;
            flex-direction: column;
            align-items: stretch;
            justify-content: center;
            gap: 0.4rem;
            padding: 0 1.4rem;
            background: var(--bg-2);
            border-left: 1px solid var(--line);
            font-size: var(--step-1);
            transform: translateX(100%);
            /* hidden when closed so this fixed (clip-escaping) drawer cannot
               contribute to document width on Opera Mobile */
            visibility: hidden;
            transition: transform 0.45s cubic-bezier(0.7, 0, 0.2, 1),
              visibility 0s linear 0.45s;
          }
          .links.open {
            transform: translateX(0);
            visibility: visible;
            transition: transform 0.45s cubic-bezier(0.7, 0, 0.2, 1),
              visibility 0s;
          }
          /* Large, comfortable tap targets in the drawer. */
          .links a {
            display: flex;
            align-items: center;
            min-height: 52px;
            padding: 0.4rem 0.6rem;
          }
          /* Vertical drawer → use a left coral bar, not a bottom underline. */
          .links a.is-active::after {
            left: -1.4rem;
            right: auto;
            top: 50%;
            bottom: auto;
            transform: translateY(-50%);
            width: 3px;
            height: 60%;
          }
          .nav-cta {
            justify-content: center;
            min-height: 52px;
            margin-top: 0.8rem;
          }
        }
      `}</style>
    </header>
  );
}
