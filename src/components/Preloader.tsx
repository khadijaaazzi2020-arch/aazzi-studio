"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";

/**
 * Preloader — cinematic logo reveal. Locks scroll, animates the monogram in,
 * counts up, then lifts the curtain to expose the hero. Runs once per load.
 *
 * ── FIRST-PAINT STABILITY (no hero "jump") ───────────────────────────────────
 * The curtain is rendered OPAQUE from the very first server-rendered paint (its
 * dark background covers the whole viewport). Previously the root carried an
 * inline `visibility:hidden;opacity:0` so, before hydration ran, the curtain was
 * transparent and the hero showed through — its logo painted at the hero
 * position, then the preloader appeared and the logo "jumped" to centre. By
 * keeping the curtain opaque and hiding ONLY the logo (via CSS, until GSAP
 * reveals it) the hero is never visible early, so there is no flash and no jump.
 *
 * On `finish` we broadcast `intro-ready` (and set a global flag) so the hero
 * entrance animation starts AFTER the curtain lifts instead of playing unseen
 * behind it.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const finished = { current: false };

      // Lenis is created in SmoothScroll's passive effect, which runs AFTER this
      // layout effect — so window.lenis may not exist yet. Retry on the next
      // frame (by then SmoothScroll has run) so the scroll lock actually holds.
      let lockRaf = 0;
      const lockScroll = () => {
        const lenis = (window as unknown as { lenis?: Lenis }).lenis;
        if (lenis) lenis.stop();
        else lockRaf = requestAnimationFrame(lockScroll);
      };
      lockScroll();
      document.body.style.cursor = "wait";

      // reveal() unlocks scroll and signals the hero to start its entrance. It
      // runs as the curtain BEGINS lifting (not after it is gone) so the hero
      // animates in underneath the rising curtain — no flash of static content.
      const reveal = () => {
        if (finished.current) return;
        finished.current = true;
        cancelAnimationFrame(lockRaf);
        const lenis = (window as unknown as { lenis?: Lenis }).lenis;
        lenis?.start();
        document.body.style.cursor = "";
        (window as unknown as { __introReady?: boolean }).__introReady = true;
        window.dispatchEvent(new Event("intro-ready"));
      };
      const unmount = () => {
        window.scrollTo(0, 0);
        setDone(true);
      };
      const finishNow = () => {
        window.clearTimeout(failsafe);
        reveal();
        unmount();
      };

      // Failsafe: whatever happens to the timeline (e.g. an iOS Safari stall),
      // never trap the visitor behind the curtain — reveal within a few seconds.
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const failsafe = window.setTimeout(finishNow, reduce ? 600 : 5200);

      if (reduce) {
        // Reduced motion: no choreography, just reveal quickly.
        gsap.delayedCall(0.2, finishNow);
        return () => {
          window.clearTimeout(failsafe);
          cancelAnimationFrame(lockRaf);
        };
      }

      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(failsafe);
          unmount();
        },
      });
      // fromTo (not from): the CSS start state is opacity:0, so a plain .from()
      // would read 0 as the END value and never reveal the logo. State the end
      // explicitly.
      tl.fromTo(
        ".pl-logo",
        { scale: 0.82, autoAlpha: 0, filter: "blur(14px)" },
        { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 1.0, ease: "expo.out" }
      )
        .to(
          counter,
          {
            v: 100,
            duration: 1.1,
            ease: "power2.inOut",
            onUpdate: () => {
              const node = root.current?.querySelector(".pl-count");
              if (node)
                node.textContent = `${Math.round(counter.v)}`.padStart(2, "0");
            },
          },
          "<0.1"
        )
        .to(".pl-bar-fill", { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, "<")
        .to(".pl-logo", { y: -8, duration: 0.45, ease: "power2.out" }, "+=0.05")
        .to(".pl-inner", { autoAlpha: 0, duration: 0.35 }, "+=0.05")
        .to(root.current, {
          yPercent: -100,
          duration: 0.8,
          ease: "expo.inOut",
          onStart: reveal, // hero entrance begins as the curtain rises
        });

      return () => {
        window.clearTimeout(failsafe);
        cancelAnimationFrame(lockRaf);
        tl.kill();
      };
    },
    { scope: root }
  );

  if (done) return null;

  return (
    <div ref={root} className="preloader" aria-hidden>
      <div className="pl-inner">
        <div className="pl-logo">
          <Image
            src="/aazzi-logo.jpg"
            alt=""
            width={220}
            height={220}
            priority
          />
        </div>
        <div className="pl-meter">
          <div className="pl-bar">
            <span className="pl-bar-fill" />
          </div>
          <span className="pl-count">00</span>
        </div>
      </div>

      <style jsx>{`
        .preloader {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          background: var(--bg);
          /* Opaque from first paint — covers the hero so nothing flashes
             through before hydration. */
        }
        .pl-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.4rem;
        }
        /* Logo starts hidden so there is no 1-frame flash of the final state
           before GSAP's .from() applies; GSAP fades/scales it in. If JS never
           runs, the failsafe still reveals the (styled) hero. */
        .pl-logo {
          opacity: 0;
          will-change: transform, opacity, filter;
        }
        .pl-logo :global(img) {
          width: clamp(130px, 30vw, 220px);
          height: auto;
          border-radius: 18px;
          box-shadow: 0 0 90px -20px rgba(224, 71, 58, 0.55);
        }
        .pl-meter {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-family: var(--font-sans), sans-serif;
          font-size: var(--step--1);
          letter-spacing: 0.2em;
          color: var(--text-dim);
        }
        .pl-bar {
          width: clamp(120px, 28vw, 200px);
          height: 1px;
          background: var(--line-strong);
          overflow: hidden;
        }
        .pl-bar-fill {
          display: block;
          height: 100%;
          width: 100%;
          transform: scaleX(0);
          transform-origin: left;
          background: linear-gradient(90deg, var(--coral), var(--coral-bright));
        }
        .pl-count {
          font-variant-numeric: tabular-nums;
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
