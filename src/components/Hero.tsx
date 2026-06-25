"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SplitText from "./anim/SplitText";
import { openContactModal } from "./ContactModal";

const TRUST = [
  {
    title: "Custom Design",
    sub: "No templates",
    icon: (
      <path d="M3 17.5V21h3.5L17 10.5 13.5 7 3 17.5zM19.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 5l3.5 3.5 2.2-1.2z" fill="currentColor" />
    ),
  },
  {
    title: "Mobile Optimized",
    sub: "Perfect on any device",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <line x1="11" y1="18.5" x2="13" y2="18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Fast Performance",
    sub: "Speed matters",
    icon: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />,
  },
  {
    title: "Conversion Focused",
    sub: "Designed to sell",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      </>
    ),
  },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const fadeItems = el.querySelectorAll<HTMLElement>(".hero-fade");
      if (!fadeItems.length) return;

      // Pre-hide ONLY after confirming targets exist, so a missing-target case
      // can never strand the hero at opacity:0.
      gsap.set(fadeItems, { y: 24, opacity: 0 });

      let played = false;
      let onReady: (() => void) | undefined;
      let fallback = 0;
      const playEntrance = () => {
        if (played) return;
        played = true;
        window.clearTimeout(fallback);
        gsap.to(fadeItems, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
        });
      };

      // Gate on the preloader curtain so the entrance plays in view.
      if ((window as unknown as { __introReady?: boolean }).__introReady) {
        playEntrance();
      } else {
        onReady = playEntrance;
        window.addEventListener("intro-ready", onReady, { once: true });
        fallback = window.setTimeout(playEntrance, 6500);
      }

      return () => {
        if (onReady) window.removeEventListener("intro-ready", onReady);
        window.clearTimeout(fallback);
      };
    },
    { scope: root }
  );

  return (
    <section id="top" ref={root} className="hero">
      <div className="hero-glow" aria-hidden />

      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-fade">Web Design &amp; E-commerce</p>

          <h1 className="hero-title">
            <SplitText as="span" className="hl" text="Premium websites" onScroll={false} waitFor="intro" delay={0.05} />
            <span className="hl">
              <SplitText as="span" className="hl-part" text="&amp; stores " onScroll={false} waitFor="intro" delay={0.18} />
              <SplitText as="span" className="hl-part accent" text="that sell." onScroll={false} waitFor="intro" delay={0.3} />
            </span>
          </h1>

          <p className="hero-sub hero-fade">
            We design fast, modern websites and e-commerce stores that help
            brands grow online.
          </p>

          <div className="hero-actions hero-fade">
            <a
              className="btn btn-coral"
              href="#contact"
              data-cta
              onClick={(e) => {
                e.preventDefault();
                openContactModal();
              }}
            >
              Start Your Project
            </a>
            <a
              className="btn btn-ghost"
              href="#work"
              data-cta
              onClick={(e) => {
                e.preventDefault();
                const lenis = (window as unknown as { lenis?: import("lenis").default }).lenis;
                const target = document.getElementById("work");
                if (lenis && target) lenis.scrollTo(target, { offset: -84, duration: 1.1 });
                else target?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Our Work
            </a>
          </div>

          <ul className="hero-trust hero-fade">
            {TRUST.map((t) => (
              <li key={t.title}>
                <span className="trust-ic" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">{t.icon}</svg>
                </span>
                <span className="trust-txt">
                  <strong>{t.title}</strong>
                  <em>{t.sub}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-visual hero-fade">
          <span className="hero-badge">
            <span className="dot" /> Velora Femme · Live store
          </span>
          <div className="laptop" aria-hidden>
            <div className="laptop-screen">
              <Image
                src="/photo/velora-femme-fashion-mobile.webp.png"
                alt=""
                fill
                priority
                sizes="(max-width: 980px) 90vw, 560px"
                className="device-shot"
              />
            </div>
            <div className="laptop-base"><span /></div>
          </div>

          <div className="phone">
            <div className="phone-screen">
              <Image
                src="/photo/ganatural-mobile.webp.jpeg"
                alt=""
                fill
                priority
                sizes="180px"
                className="device-shot"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 100svh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          overflow: clip;
          padding-top: 96px;
          padding-bottom: 56px;
        }
        .hero-glow {
          position: absolute;
          right: -6%;
          top: 18%;
          width: min(60vw, 720px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(224, 71, 58, 0.22),
            rgba(224, 71, 58, 0.05) 45%,
            transparent 70%
          );
          filter: blur(30px);
          pointer-events: none;
          z-index: 0;
        }
        .hero-grid {
          position: relative;
          z-index: 2;
          width: 100%;
          display: grid;
          /* Visual column gets the larger share — the featured project is the
             hero's proof, so it leads the visual hierarchy. */
          grid-template-columns: 1fr 1.28fr;
          align-items: center;
          gap: clamp(2rem, 5vw, 4.5rem);
        }
        .hero-copy { max-width: 36rem; }
        .hero-title {
          font-size: clamp(2.4rem, 1.6rem + 3.6vw, 4.6rem);
          margin: 1.3rem 0 1.5rem;
        }
        .hero-title :global(.hl) { display: block; }
        .hero-title :global(.hl-part) { display: inline-block; }
        .hero-title :global(.accent) { color: var(--coral-bright); }
        .hero-sub {
          font-size: var(--step-1);
          color: var(--text-dim);
          max-width: 38ch;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem;
          margin: 2rem 0 2.4rem;
        }
        .hero-trust {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(4, auto);
          justify-content: start;
          gap: 1.4rem 1.8rem;
          padding: 0;
          margin: 0;
        }
        .hero-trust li {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        .trust-ic {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          border-radius: 10px;
          color: var(--coral-bright);
          background: rgba(224, 71, 58, 0.1);
          border: 1px solid rgba(224, 71, 58, 0.22);
        }
        .trust-txt { display: flex; flex-direction: column; line-height: 1.2; }
        .trust-txt strong {
          font-size: var(--step-0);
          font-weight: 600;
          color: var(--text);
        }
        .trust-txt em {
          font-style: normal;
          font-size: var(--step--1);
          color: var(--text-faint);
        }

        /* ── Device mockups (featured project showcase) ── */
        .hero-visual {
          position: relative;
          justify-self: center;
          width: 100%;
          max-width: 700px;
        }
        .hero-badge {
          position: absolute;
          top: -0.9rem;
          left: -0.4rem;
          z-index: 4;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          font-size: var(--step--1);
          color: var(--text);
          background: rgba(18, 20, 20, 0.82);
          border: 1px solid var(--line-strong);
          backdrop-filter: blur(8px);
          box-shadow: var(--shadow-soft);
          white-space: nowrap;
        }
        .hero-badge .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #25d366;
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.18);
        }
        .laptop { width: 100%; }
        .laptop-screen {
          position: relative;
          aspect-ratio: 16 / 10;
          border: 8px solid #232626;
          border-bottom: 0;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
          background: #000;
          box-shadow: var(--shadow-soft);
        }
        .laptop-base {
          position: relative;
          height: 16px;
          margin: 0 -7%;
          border-radius: 0 0 14px 14px;
          background: linear-gradient(180deg, #2a2d2e, #15181a);
          box-shadow: var(--shadow-soft);
        }
        .laptop-base span {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 16%;
          height: 5px;
          border-radius: 0 0 6px 6px;
          background: rgba(0, 0, 0, 0.45);
        }
        .phone {
          position: absolute;
          right: -3%;
          bottom: -10%;
          width: 30%;
          max-width: 168px;
          z-index: 3;
        }
        .phone-screen {
          position: relative;
          aspect-ratio: 9 / 19;
          border: 7px solid #232626;
          border-radius: 26px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 26px 60px -22px rgba(0, 0, 0, 0.85);
        }
        .hero-visual :global(.device-shot) {
          object-fit: cover;
          object-position: top center;
        }

        @media (max-width: 980px) {
          .hero {
            min-height: auto;
            padding-top: 120px;
            padding-bottom: 64px;
            text-align: left;
          }
          .hero-grid { grid-template-columns: 1fr; gap: 3rem; }
          .hero-copy { max-width: 100%; }
          .hero-visual { max-width: 440px; margin-inline: auto; }
        }
        @media (max-width: 560px) {
          .hero-trust { grid-template-columns: repeat(2, 1fr); }
          .hero-actions :global(.btn) { flex: 1 1 auto; justify-content: center; }
          .phone { width: 34%; right: -2%; bottom: -8%; }
        }
      `}</style>
    </section>
  );
}
