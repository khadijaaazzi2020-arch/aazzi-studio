// Centralized analytics utility — the ONLY place the app talks to analytics.
//
// Architecture: Google Tag Manager is the single analytics loader (mounted in
// app/layout.tsx). Every custom interaction below is pushed into
// `window.dataLayer`; GTM triggers/tags decide what gets forwarded to GA4,
// Google Ads, Clarity, etc. The app itself never loads gtag.js and never
// calls window.gtag.
//
// NOTE: GA4's automatically collected events (page_view, session_start,
// first_visit, user_engagement) come from the GA4 Google Tag inside the GTM
// container. Do NOT push those names here — doing so would double-count.

/** Every custom event name the app can emit. snake_case, per GA4 convention. */
export const AnalyticsEvent = {
  /** Any primary call-to-action button ("Start Your Project", "View Our Work"). */
  CTA_CLICK: "cta_click",
  /** Header / footer navigation link clicks (internal anchors). */
  NAV_CLICK: "nav_click",
  /** Contact modal opened — the site's key micro-conversion. */
  CONTACT_MODAL_OPEN: "contact_modal_open",
  /** WhatsApp conversation link clicked — primary conversion. */
  WHATSAPP_CLICK: "whatsapp_click",
  /** mailto: link clicked — secondary conversion. */
  EMAIL_CLICK: "email_click",
  /** tel: link clicked (none exist today; tracked automatically if added). */
  PHONE_CLICK: "phone_click",
  /** A portfolio project card opened (external client site). */
  PORTFOLIO_PROJECT_CLICK: "portfolio_project_click",
  /** Any other outbound link. */
  OUTBOUND_CLICK: "outbound_click",
  /** Scroll milestones: 25 / 50 / 75 / 100 percent, once per page view. */
  SCROLL_DEPTH: "scroll_depth",
  /** A major page section entered the viewport, once per page view. */
  SECTION_VIEW: "section_view",
  /** The 404 page rendered. */
  PAGE_NOT_FOUND: "page_not_found",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/** GA4 accepts string/number/boolean params; undefined entries are dropped. */
export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Push a custom event into the GTM dataLayer.
 *
 * Production-safe by construction: it no-ops on the server, initializes
 * `window.dataLayer` if GTM hasn't loaded yet (GTM drains the queue when it
 * boots), and never throws — analytics must never break the UI.
 */
export function trackEvent(
  event: AnalyticsEventName,
  params: AnalyticsParams = {}
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: Record<string, unknown> = { event };
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) payload[key] = value;
    }
    (window.dataLayer ??= []).push(payload);
  } catch {
    // Swallow: a failed analytics push must never surface to the user.
  }
}
