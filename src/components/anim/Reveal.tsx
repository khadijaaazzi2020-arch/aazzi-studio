"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** translate distance in px */
  y?: number;
  delay?: number;
  duration?: number;
  /** stagger direct children instead of the wrapper itself */
  stagger?: number;
  as?: "div" | "section" | "ul" | "li" | "span";
};

/**
 * Reveal — fade + rise on scroll-in. Used for body blocks and card grids.
 * Hidden state is set in useGSAP (pre-paint, post-hydration) → no FOUC,
 * no hydration mismatch. Reduced-motion: renders content as-is.
 */
export default function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
  duration = 1,
  stagger,
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as React.ElementType;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets =
        stagger != null ? (Array.from(el.children) as HTMLElement[]) : [el];

      gsap.set(targets, { y, opacity: 0, willChange: "transform, opacity" });
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration,
        delay,
        ease: "power3.out",
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onComplete: () => gsap.set(targets, { clearProps: "willChange" }),
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
