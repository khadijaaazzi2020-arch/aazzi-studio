"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

// Clarity project ID; inlined at build time. Same policy as GTM in
// app/layout.tsx: only load in production builds AND when the ID is
// configured, so dev/preview sessions never pollute the Clarity project.
const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * ClarityAnalytics — mounts Microsoft Clarity (session recordings, heatmaps)
 * via the official @microsoft/clarity package. Renders nothing.
 *
 * - Initializes after hydration (useEffect), and the tag it injects is
 *   async, so it never competes with first paint or blocks the main thread.
 * - Duplicate-safe: the effect runs once per mount and the package itself
 *   skips injection when the #clarity-script tag already exists.
 * - Independent of GTM/GA4: Clarity queues on `window.clarity` and never
 *   touches `window.dataLayer`, so both stacks coexist without conflict.
 */
export default function ClarityAnalytics() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !clarityId) return;
    Clarity.init(clarityId);
  }, []);
  return null;
}
