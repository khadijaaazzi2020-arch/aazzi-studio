"use client";

import Image from "next/image";
import SplitText from "./anim/SplitText";
import Reveal from "./anim/Reveal";
import { openContactModal } from "./ContactModal";

type Store = {
  name: string;
  href: string;
  category: string;
  points: string[];
  img: string;
};

const STORES: Store[] = [
  {
    name: "Velora Femme",
    href: "https://velora-femme-qtf7.vercel.app",
    category: "Fashion · E-commerce",
    points: ["Premium Fashion Store", "Mobile Optimized", "Custom Design"],
    img: "/photo/velora-femme-fashion-mobile.webp.png",
  },
  {
    name: "Velora Perfumes",
    href: "https://velora-nu-pied.vercel.app",
    category: "Fragrance · E-commerce",
    points: ["Luxury Fragrance Store", "Mobile Optimized", "Conversion Focused"],
    img: "/photo/velora-homepage-desktop.webp.png",
  },
  {
    name: "GA Natural Store",
    href: "https://ganaturalstore.com",
    category: "Natural products · E-commerce",
    points: ["Natural Products Store", "Built for Trust", "Conversion Focused"],
    img: "/photo/ganatural-desktop.webp.png",
  },
];

export default function Portfolio() {
  return (
    <section id="work" className="section work">
      <div className="shell">
        <div className="work-head">
          <div className="section-head">
            <p className="eyebrow">Featured work</p>
            <SplitText as="h2" className="section-title" text="Recent projects." />
          </div>
          <a
            className="work-all"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              openContactModal();
            }}
          >
            Start a project
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <Reveal y={28}>
          <div className="work-grid">
            {STORES.map((s) => (
              <a
                key={s.name}
                className="work-card"
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="work-shot-wrap">
                  <Image
                    src={s.img}
                    alt={`${s.name} — ${s.category}`}
                    fill
                    sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 30vw"
                    className="work-shot"
                  />
                </div>
                <div className="work-info">
                  <h3>{s.name}</h3>
                  <ul className="work-points">
                    {s.points.map((p) => (
                      <li key={p}>
                        <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden>
                          <path d="M3.5 9.5L7 13L14.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="work-link">
                    View Project
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .work-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: clamp(2.2rem, 5vw, 3.4rem);
        }
        .work-head .section-head { margin-bottom: 0; }
        .work-all {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          flex: 0 0 auto;
          font-size: var(--step-0);
          color: var(--coral-bright);
          transition: gap 0.25s ease;
        }
        .work-all:hover { gap: 0.8rem; }
        .work-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1rem, 2.2vw, 1.6rem);
        }
        .work-card {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--line);
          border-radius: var(--r-lg);
          background: var(--bg-2);
          overflow: hidden;
          transition: border-color 0.35s ease, transform 0.35s ease,
            box-shadow 0.35s ease;
        }
        .work-card:hover {
          border-color: var(--line-strong);
          transform: translateY(-6px);
          box-shadow: var(--shadow-soft);
        }
        .work-shot-wrap {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--bg-3);
          border-bottom: 1px solid var(--line);
        }
        .work-card :global(.work-shot) {
          object-fit: cover;
          object-position: top center;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .work-card:hover :global(.work-shot) { transform: scale(1.05); }
        .work-info {
          padding: clamp(1.3rem, 2.6vw, 1.8rem);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .work-info h3 { font-size: var(--step-2); }
        .work-points {
          list-style: none;
          margin: 0.2rem 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .work-points li {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: var(--step-0);
          color: var(--text-dim);
        }
        .work-points li svg {
          flex: 0 0 auto;
          color: var(--coral-bright);
        }
        .work-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: 0.6rem;
          font-weight: 500;
          font-size: var(--step-0);
          color: var(--coral-bright);
          transition: gap 0.25s ease;
        }
        .work-card:hover .work-link { gap: 0.8rem; }
        @media (max-width: 900px) {
          .work-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .work-grid { grid-template-columns: 1fr; }
          .work-head { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
      `}</style>
    </section>
  );
}
