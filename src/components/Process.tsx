"use client";

import SplitText from "./anim/SplitText";
import Reveal from "./anim/Reveal";

const STEPS = [
  { n: "01", title: "Discover", text: "Understand goals and audience." },
  { n: "02", title: "Design", text: "Create the experience." },
  { n: "03", title: "Build", text: "Develop and optimize." },
  { n: "04", title: "Launch", text: "Test, publish, and support." },
];

export default function Process() {
  return (
    <section id="process" className="section process">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow">Process</p>
          <h2 className="section-title process-title">
            <SplitText as="span" text="Simple process." />{" "}
            <SplitText as="span" className="accent" text="Clear steps." />
          </h2>
        </div>

        <Reveal y={28}>
          <ol className="proc-row">
            {STEPS.map((s, i) => (
              <li key={s.n} className="proc-step">
                <div className="proc-card">
                  <span className="proc-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="proc-arrow" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <style jsx>{`
        .process { background: linear-gradient(180deg, var(--bg), var(--bg-2)); }
        .process-title :global(span) { display: inline; }
        .process-title :global(.accent) { color: var(--coral-bright); }
        .proc-row {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .proc-step {
          position: relative;
          display: flex;
          align-items: stretch;
        }
        .proc-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-right: clamp(1rem, 2.5vw, 2rem);
        }
        .proc-n {
          font-family: var(--font-display), serif;
          font-size: var(--step-3);
          font-weight: 800;
          color: var(--coral);
          line-height: 1;
          margin-bottom: 0.4rem;
        }
        .proc-step h3 { font-size: var(--step-2); }
        .proc-step p {
          color: var(--text-dim);
          font-size: var(--step-0);
        }
        .proc-arrow {
          position: absolute;
          top: 0.1rem;
          right: clamp(-0.4rem, 0vw, 0.4rem);
          color: var(--text-faint);
        }
        @media (max-width: 860px) {
          .proc-row { grid-template-columns: 1fr 1fr; gap: 2.4rem 1rem; }
          .proc-arrow { display: none; }
        }
        @media (max-width: 480px) {
          .proc-row { grid-template-columns: 1fr; gap: 1.8rem; }
        }
      `}</style>
    </section>
  );
}
