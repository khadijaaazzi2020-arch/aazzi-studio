"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register at MODULE scope, not inside an effect. Child components create
// ScrollTrigger tweens inside useGSAP (a layout effect), which fires BEFORE this
// parent's passive effect — so registering in the effect would be too late and
// the triggers could be silently dropped (a likely cause of "animations don't
// run" on some devices). Registering on import guarantees the plugin is ready
// before any component mounts.
gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * SmoothScroll — single source of truth for scrolling.
 *
 * Lenis drives the window scroll; GSAP's ticker drives Lenis's RAF (ONE rAF
 * loop, never two — double rAF is a classic mobile-jank source). ScrollTrigger
 * is told to update on every Lenis frame.
 *
 * ── OPERA MOBILE REFRESH STABILITY ──────────────────────────────────────────
 * The documented "layout breaks after refresh" bug is caused by ScrollTrigger
 * and Lenis caching element/viewport measurements *before* fonts + images
 * finish loading, and by spurious resize events when Opera's address bar
 * shows/hides. We neutralise both here:
 *
 *  1. `ScrollTrigger.config({ ignoreMobileResize: true })` — ignores the
 *     height-only resizes caused purely by the mobile address bar. Combined
 *     with `dvh`/`svh` units in CSS (never `vh`), layout no longer reflows
 *     when the bar animates.
 *  2. We force a recalculation (`lenis.resize()` + `ScrollTrigger.refresh()`)
 *     at every moment a measurement could have been stale:
 *        • after first paint               • on `fonts.ready`
 *        • on window `load` (images)        • on genuine width changes (RO)
 *        • on `pageshow` (bfcache restore — fires on refresh/back-forward)
 *  3. A ResizeObserver on <body> catches dynamic content-height changes that
 *     Lenis would otherwise miss, but it is gated on WIDTH change so address-bar
 *     height jitter can't trigger a storm of refreshes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Take ownership of scroll position. Opera Mobile otherwise restores the
    // previous scroll offset on refresh BEFORE ScrollTrigger has re-measured —
    // landing inside a pinned section with stale geometry, which is the trigger
    // for the post-refresh layout corruption. Starting from the top lets pins
    // initialise from a clean state.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    // Honour reduced-motion: skip smooth scroll entirely.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Ignore address-bar-only (height) resizes on touch devices.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const lenis = new Lenis({
      duration: 1.05,
      lerp: 0.1,
      smoothWheel: !prefersReduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      syncTouch: false, // native momentum on touch; avoids Opera Mobile fighting
    });

    // Expose for anchor navigation (Navbar).
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    // Keep ScrollTrigger in lock-step with Lenis.
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ── Refresh orchestration ────────────────────────────────────────────────
    let rafId = 0;
    const refresh = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    const scheduleRefresh = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => requestAnimationFrame(refresh));
    };

    // 1. After first paint.
    scheduleRefresh();

    // 2. Fonts can change line heights → re-measure.
    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleRefresh).catch(() => {});
    }

    // 3. Images / late assets.
    window.addEventListener("load", scheduleRefresh);

    // 4. bfcache restore on refresh / back-forward — the exact moment the
    //    Opera layout corruption surfaced.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) scheduleRefresh();
    };
    window.addEventListener("pageshow", onPageShow);

    // 5. Genuine layout changes (width or content height), debounced and gated
    //    on width so address-bar height jitter is ignored.
    let lastWidth = window.innerWidth;
    let debounce = 0;
    const ro = new ResizeObserver(() => {
      const w = window.innerWidth;
      const widthChanged = w !== lastWidth;
      lastWidth = w;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(
        scheduleRefresh,
        widthChanged ? 120 : 200
      );
    });
    ro.observe(document.body);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener("load", scheduleRefresh);
      window.removeEventListener("pageshow", onPageShow);
      ro.disconnect();
      window.clearTimeout(debounce);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return <>{children}</>;
}
