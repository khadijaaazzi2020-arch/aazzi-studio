"use client";

import SplitText from "./anim/SplitText";
import Reveal from "./anim/Reveal";

const REASONS = [
  {
    title: "Custom Design",
    desc: "Unique design built for your brand.",
    icon: (
      <path d="M3 17.5V21h3.5L17 10.5 13.5 7 3 17.5zM19.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 5l3.5 3.5 2.2-1.2z" fill="currentColor" />
    ),
  },
  {
    title: "Mobile First",
    desc: "Perfect experience on every device.",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <line x1="11" y1="18.5" x2="13" y2="18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Fast Performance",
    desc: "Speed optimized for better results.",
    icon: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />,
  },
  {
    title: "Conversion Focused",
    desc: "Designed to turn visitors into clients.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      </>
    ),
  },
  {
    title: "Clear Communication",
    desc: "Regular updates and full transparency.",
    icon: (
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
];

export default function About() {
  return (
    <section id="why" className="section why">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow">Why work with me</p>
          <h2 className="section-title why-title">
            <SplitText as="span" text="Focused on results." />{" "}
            <SplitText as="span" className="accent" text="Built for growth." />
          </h2>
        </div>

        <Reveal y={28}>
          <div className="why-grid">
            {REASONS.map((r) => (
              <article key={r.title} className="why-card">
                <span className="why-ic" aria-hidden>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">{r.icon}</svg>
                </span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .why-title :global(span) { display: inline; }
        .why-title :global(.accent) { color: var(--coral-bright); }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: clamp(1.4rem, 2.6vw, 2.2rem);
        }
        .why-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .why-ic {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 15px;
          color: var(--coral-bright);
          background: rgba(224, 71, 58, 0.1);
          border: 1px solid rgba(224, 71, 58, 0.22);
          margin-bottom: 0.9rem;
        }
        .why-card h3 { font-size: var(--step-1); }
        .why-card p {
          color: var(--text-dim);
          font-size: var(--step-0);
          line-height: 1.55;
        }
        @media (max-width: 980px) {
          .why-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2.2rem 1.6rem;
          }
        }
        @media (max-width: 620px) {
          .why-grid { grid-template-columns: 1fr 1fr; gap: 1.8rem 1.2rem; }
          .why-ic { width: 48px; height: 48px; }
        }
      `}</style>
    </section>
  );
}
