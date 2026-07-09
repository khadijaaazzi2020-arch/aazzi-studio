"use client";

import { useEffect } from "react";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";

/** Fires a single page_not_found event when the 404 page renders. */
export default function NotFoundTracker() {
  useEffect(() => {
    trackEvent(AnalyticsEvent.PAGE_NOT_FOUND, {
      page_path: window.location.pathname,
      referrer: document.referrer || undefined,
    });
  }, []);

  return null;
}
