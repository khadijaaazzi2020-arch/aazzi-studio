"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** delay before the stagger starts (s) */
  delay?: number;
  /** start animation on scroll into view; if false, runs on mount */
  onScroll?: boolean;
  stagger?: number;
  /**
   * Hold the entrance until the preloader curtain lifts. Only meaningful with
   * onScroll=false (above-the-fold copy). Prevents the hero text animating
   * unseen behind the preloader. Default: play on mount.
   */
  waitFor?: "intro";
};

/**
 * splittext-reveal — words rise into view from behind a mask, one by one.
 *
 * SSR renders the plain string (fully legible, crawlable, no layout shift).
 * Splitting + the hidden initial state are applied in useGSAP/useLayoutEffect
 * (post-hydration, BEFORE paint) so there is no hydration mismatch and no FOUC.
 * Falls back to plain visible text under prefers-reduced-motion.
 */
export default function SplitText({
  text,
  as = "h2",
  className,
  delay = 0,
  onScroll = true,
  stagger = 0.06,
  waitFor,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as React.ElementType;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const words = text.split(" ");
      el.textContent = "";
      const inners: HTMLElement[] = [];

      words.forEach((word, i) => {
        const mask = document.createElement("span");
        mask.style.display = "inline-block";
        mask.style.overflow = "hidden";
        mask.style.verticalAlign = "top";
        mask.style.paddingBottom = "0.12em"; // room for descenders inside mask
        mask.style.marginBottom = "-0.12em";

        const inner = document.createElement("span");
        inner.style.display = "inline-block";
        inner.style.willChange = "transform, opacity";
        inner.textContent = word;

        mask.appendChild(inner);
        el.appendChild(mask);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
        inners.push(inner);
      });

      gsap.set(inners, { yPercent: 115, opacity: 0 });

      // Gate on the preloader for above-the-fold copy so it doesn't animate
      // unseen behind the curtain. Play immediately once the curtain lifts (or
      // now, if it already has).
      const gateOnIntro = waitFor === "intro" && !onScroll;
      const tl = gsap.timeline({
        delay,
        paused: gateOnIntro,
        defaults: { ease: "expo.out", duration: 1 },
        scrollTrigger: onScroll
          ? { trigger: el, start: "top 85%", once: true }
          : undefined,
      });
      tl.to(inners, { yPercent: 0, opacity: 1, stagger });

      let onReady: (() => void) | undefined;
      let fallback = 0;
      if (gateOnIntro) {
        const playOnce = () => {
          window.clearTimeout(fallback);
          tl.play();
        };
        if ((window as unknown as { __introReady?: boolean }).__introReady) {
          playOnce();
        } else {
          onReady = playOnce;
          window.addEventListener("intro-ready", onReady, { once: true });
          // Safety net: never strand gated above-the-fold copy at opacity:0 if
          // intro-ready never fires. Outlasts the preloader's 5.2s failsafe.
          fallback = window.setTimeout(playOnce, 6500);
        }
      }

      return () => {
        if (onReady) window.removeEventListener("intro-ready", onReady);
        window.clearTimeout(fallback);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: ref, dependencies: [text] }
  );

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}

// keep ScrollTrigger import side-effect (plugin registration) tree-shake-safe
gsap.registerPlugin(ScrollTrigger, useGSAP);
