"use client";

import SplitText from "./anim/SplitText";
import Reveal from "./anim/Reveal";

const SERVICES = [
  {
    title: "Website Design",
    desc: "Modern websites that build trust.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <line x1="3" y1="8.5" x2="21" y2="8.5" stroke="currentColor" strokeWidth="1.6" />
        <line x1="9" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "E-commerce Stores",
    desc: "Online stores that convert visitors.",
    icon: (
      <>
        <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .7h8.7a1 1 0 0 0 1-.8L21 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.3" fill="currentColor" />
        <circle cx="17" cy="20" r="1.3" fill="currentColor" />
      </>
    ),
  },
  {
    title: "Brand Identity",
    desc: "Visual systems that represent you.",
    icon: (
      <>
        <path d="M12 3l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16l-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Motion & Interaction",
    desc: "Smooth experiences that engage.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 8.5l5 3.5-5 3.5v-7z" fill="currentColor" />
      </>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className="section services">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow">Services</p>
          <SplitText as="h2" className="section-title" text="What I do." />
          <p className="section-lead">
            Everything your brand needs to grow online.
          </p>
        </div>

        <Reveal y={28}>
          <div className="svc-grid">
            {SERVICES.map((s) => (
              <article key={s.title} className="svc-card">
                <span className="svc-ic" aria-hidden>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">{s.icon}</svg>
                </span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(1rem, 2.2vw, 1.5rem);
        }
        .svc-card {
          padding: clamp(1.1rem, 2.2vw, 1.6rem);
          border: 1px solid var(--line);
          border-radius: var(--r-md);
          background: linear-gradient(180deg, var(--bg-2), var(--bg));
          transition: border-color 0.35s ease, transform 0.35s ease;
        }
        .svc-card:hover {
          border-color: var(--line-strong);
          transform: translateY(-4px);
        }
        .svc-ic {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          color: var(--coral-bright);
          background: rgba(224, 71, 58, 0.1);
          border: 1px solid rgba(224, 71, 58, 0.22);
          margin-bottom: 0.9rem;
        }
        .svc-card h3 {
          font-size: var(--step-1);
          margin-bottom: 0.35rem;
        }
        .svc-card p {
          color: var(--text-dim);
          font-size: var(--step--1);
          line-height: 1.5;
        }
        @media (max-width: 900px) {
          .svc-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 520px) {
          /* Keep two-up on phones for density — cards are short now. */
          .svc-grid { gap: 0.7rem; }
          .svc-card { padding: 1.05rem; }
          .svc-ic { width: 40px; height: 40px; margin-bottom: 0.7rem; }
        }
      `}</style>
    </section>
  );
}
