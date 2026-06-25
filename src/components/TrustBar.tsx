"use client";

const TOOLS = ["Shopify", "WordPress", "Webflow", "Next.js", "GSAP"];

export default function TrustBar() {
  return (
    <section className="trustbar" aria-label="Technologies we build with">
      <p className="trustbar-label">Built with proven technology</p>

      <div className="marquee">
        {/* Two identical groups → translateX(-50%) loops seamlessly. The copy is
            aria-hidden so the list is announced once to screen readers. */}
        <ul className="marquee-track" aria-hidden="false">
          {TOOLS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <ul className="marquee-track" aria-hidden="true">
          {TOOLS.map((t) => (
            <li key={`dup-${t}`}>{t}</li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .trustbar {
          border-block: 1px solid var(--line);
          background: var(--bg-2);
          padding-block: clamp(1.4rem, 3vw, 2rem);
          overflow: hidden;
        }
        .trustbar-label {
          text-align: center;
          font-size: var(--step--1);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-faint);
          margin-bottom: clamp(1rem, 2.5vw, 1.5rem);
        }
        /* Edge fade so logos dissolve in/out rather than hard-clip. */
        .marquee {
          position: relative;
          display: flex;
          width: 100%;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
        }
        .marquee-track {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          gap: clamp(2.2rem, 6vw, 4.5rem);
          padding-right: clamp(2.2rem, 6vw, 4.5rem);
          flex: 0 0 auto;
          min-width: max-content;
          animation: marquee-scroll 26s linear infinite;
          will-change: transform;
        }
        .marquee:hover .marquee-track {
          animation-play-state: paused;
        }
        .marquee-track li {
          font-family: var(--font-display), serif;
          font-weight: 600;
          font-size: var(--step-1);
          color: var(--text-dim);
          letter-spacing: 0.01em;
          opacity: 0.78;
          white-space: nowrap;
          transition: opacity 0.25s ease, color 0.25s ease;
        }
        .marquee-track li:hover {
          opacity: 1;
          color: var(--text);
        }
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee {
            justify-content: center;
            -webkit-mask-image: none;
            mask-image: none;
          }
          .marquee-track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
          .marquee-track:nth-child(2) {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
