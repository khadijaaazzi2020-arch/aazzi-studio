"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * ViewportProbe — TEMPORARY diagnostic for "Investigation #2" (1127.92px flash).
 *
 * Logs, at three lifecycle moments, the values needed to tell an Opera-Desktop
 * responsive-emulator artifact apart from a genuine real-device bug:
 *
 *   • window.innerWidth            (the layout viewport the page is resolving against)
 *   • resolved --gutter            (clamp(1.25rem, 4vw, 4rem) — the 4vw term is what
 *                                   produces 1127.92px when vw resolves against 1226px)
 *   • computed width of .shell     (content-box; this is the value DevTools reports)
 *   • computed width of .hero-grid (same element family — the one captured at 1127.92)
 *   • performance.now()            (timestamp so the flip moment is visible)
 *
 * Triggers: first paint (layout effect), DOMContentLoaded, window 'load'.
 *
 * ── HOW TO ENABLE / DISABLE ──────────────────────────────────────────────────
 * Active when EITHER:
 *   • NODE_ENV !== 'production'        (always on in `next dev`), OR
 *   • the URL contains ?debug=viewport (works on a deployed/production build,
 *                                       which is how you arm it on a real device)
 * To remove entirely after verification: delete this file and its single mount
 * line in src/app/layout.tsx. No other code references it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TAG = "[viewport-probe]";

function isEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "production") return true;
  try {
    return new URLSearchParams(window.location.search).get("debug") === "viewport";
  } catch {
    return false;
  }
}

function readWidth(selector: string): string {
  const el = document.querySelector(selector);
  if (!el) return "(not found)";
  // getComputedStyle().width is the content-box width — the same number the
  // DevTools "Computed" panel shows (e.g. 1127.920px / 314.052px).
  return getComputedStyle(el).width;
}

function snapshot(trigger: string): void {
  const gutter = getComputedStyle(document.documentElement)
    .getPropertyValue("--gutter")
    .trim();

  // console.table gives a compact, copy-pasteable row per trigger.
  // eslint-disable-next-line no-console
  console.log(
    `${TAG} ${trigger}`,
    {
      "t (ms)": Math.round(performance.now()),
      innerWidth: window.innerWidth,
      "--gutter": gutter || "(empty)",
      ".shell width": readWidth(".shell"),
      ".hero-grid width": readWidth(".hero-grid"),
    }
  );
}

export default function ViewportProbe() {
  // First paint: a layout effect runs after the DOM is committed but before the
  // browser paints — the closest React hook to "first paint".
  useLayoutEffect(() => {
    if (!isEnabled()) return;
    snapshot("first-paint (layout-effect)");
  }, []);

  useEffect(() => {
    if (!isEnabled()) return;

    // DOMContentLoaded — fire now if it already happened, else wait for it.
    const onDCL = () => snapshot("DOMContentLoaded");
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDCL, { once: true });
    } else {
      onDCL();
    }

    // window 'load' (all images/late assets) — fire now if already loaded.
    const onLoad = () => snapshot("window load");
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      document.removeEventListener("DOMContentLoaded", onDCL);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
