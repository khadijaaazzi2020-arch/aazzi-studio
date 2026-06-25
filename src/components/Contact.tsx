"use client";

import SplitText from "./anim/SplitText";
import { openContactModal } from "./ContactModal";

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="shell">
        <div className="contact-band">
          <div className="contact-glow" aria-hidden />

          <div className="contact-copy">
            <p className="eyebrow">Ready to grow?</p>
            <h2 className="contact-title">
              <SplitText as="span" text="Let's build something" />
              <SplitText as="span" className="accent" text="worth remembering." />
            </h2>
          </div>

          <div className="contact-cta">
            <a
              className="btn btn-coral"
              href="mailto:Khadija.aazzi.2020@gmail.com?subject=Project%20enquiry"
              onClick={(e) => {
                e.preventDefault();
                openContactModal();
              }}
            >
              Start Your Project
            </a>
            <p className="contact-note">
              I reply to every project enquiry within two business days.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-band {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          align-items: center;
          gap: clamp(2rem, 5vw, 4rem);
          padding: clamp(2.4rem, 5vw, 4rem);
          border: 1px solid var(--line-strong);
          border-radius: var(--r-xl);
          background: linear-gradient(150deg, var(--bg-3), var(--bg));
          box-shadow: var(--shadow-soft);
        }
        .contact-glow {
          position: absolute;
          right: -10%;
          top: 50%;
          transform: translateY(-50%);
          width: min(60vw, 520px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(224, 71, 58, 0.22), transparent 65%);
          filter: blur(30px);
          pointer-events: none;
        }
        .contact-copy { position: relative; z-index: 1; }
        .contact-title {
          font-size: var(--step-4);
          margin-top: 1rem;
        }
        .contact-title :global(span) { display: block; }
        .contact-title :global(.accent) { color: var(--coral-bright); }
        .contact-cta {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.1rem;
        }
        .contact-cta :global(.btn) { font-size: var(--step-1); padding: 1.1rem 2rem; }
        .contact-note {
          color: var(--text-dim);
          font-size: var(--step-0);
          max-width: 30ch;
        }
        @media (max-width: 860px) {
          .contact-band { grid-template-columns: 1fr; }
          .contact-cta :global(.btn) { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  );
}
