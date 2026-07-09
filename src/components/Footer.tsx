"use client";

import Image from "next/image";
import { openContactModal } from "./ContactModal";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";

export default function Footer() {
  const trackFooterLink = (label: string, href: string) =>
    trackEvent(AnalyticsEvent.NAV_CLICK, {
      location: "footer",
      link_text: label,
      link_target: href,
    });

  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <div className="footer-id">
            <Image src="/aazzi-logo.jpg" alt="AAZZI STUDIO" width={44} height={44} className="f-mark" />
            <span>
              AAZZI<span className="coral">STUDIO</span>
            </span>
          </div>
          <p className="footer-tag">
            Premium websites and e-commerce stores for ambitious brands.
          </p>
        </div>

        <nav className="footer-col" aria-label="Navigation">
          <h3>Navigation</h3>
          <a href="#work" onClick={() => trackFooterLink("Work", "#work")}>Work</a>
          <a href="#services" onClick={() => trackFooterLink("Services", "#services")}>Services</a>
          <a href="#process" onClick={() => trackFooterLink("Process", "#process")}>Process</a>
          <a href="#why" onClick={() => trackFooterLink("Why me", "#why")}>Why me</a>
        </nav>

        <nav className="footer-col" aria-label="Services">
          <h3>Services</h3>
          <a href="#services" onClick={() => trackFooterLink("Website Design", "#services")}>Website Design</a>
          <a href="#services" onClick={() => trackFooterLink("E-commerce Stores", "#services")}>E-commerce Stores</a>
          <a href="#services" onClick={() => trackFooterLink("Brand Identity", "#services")}>Brand Identity</a>
          <a href="#services" onClick={() => trackFooterLink("Motion & Interaction", "#services")}>Motion &amp; Interaction</a>
        </nav>

        <div className="footer-col footer-talk">
          <h3>Let&apos;s talk</h3>
          <p>Have a project in mind? Let&apos;s create something great together.</p>
          <a
            className="footer-cta"
            href="mailto:Khadija.aazzi.2020@gmail.com?subject=Project%20enquiry"
            onClick={(e) => {
              e.preventDefault();
              trackEvent(AnalyticsEvent.CTA_CLICK, {
                location: "footer",
                cta_text: "Start Your Project",
              });
              openContactModal("footer");
            }}
          >
            Start Your Project →
          </a>
        </div>
      </div>

      <div className="shell footer-base">
        <span>© {new Date().getFullYear()} AAZZI STUDIO. All rights reserved.</span>
        <span>hello@aazzistudio.com</span>
      </div>

      <style jsx>{`
        .footer {
          border-top: 1px solid var(--line);
          padding-block: clamp(3rem, 6vw, 4.5rem) 2rem;
          background: var(--bg-2);
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
          gap: clamp(2rem, 4vw, 3rem);
          align-items: start;
        }
        .footer-id {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-family: var(--font-display), serif;
          font-weight: 700;
          font-size: 1.15rem;
        }
        .f-mark { width: 44px; height: 44px; border-radius: 12px; }
        .footer-tag {
          color: var(--text-faint);
          font-size: var(--step--1);
          margin-top: 1rem;
          max-width: 26ch;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          font-size: var(--step-0);
        }
        .footer-col h3 {
          font-family: var(--font-sans), sans-serif;
          font-size: var(--step--1);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-faint);
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        .footer-col a {
          color: var(--text-dim);
          transition: color 0.25s ease;
          width: fit-content;
        }
        .footer-col a:hover { color: var(--coral-bright); }
        .footer-talk p {
          color: var(--text-dim);
          font-size: var(--step--1);
          max-width: 30ch;
        }
        .footer-cta {
          color: var(--coral-bright) !important;
          font-weight: 600;
          margin-top: 0.3rem;
        }
        .footer-base {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: clamp(2.5rem, 6vw, 4rem);
          padding-top: 1.6rem;
          border-top: 1px solid var(--line);
          font-size: var(--step--1);
          color: var(--text-faint);
        }
        @media (max-width: 860px) {
          .footer-inner { grid-template-columns: 1fr 1fr; gap: 2.4rem; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 520px) {
          .footer-inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
