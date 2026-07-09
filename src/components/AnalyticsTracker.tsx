"use client";

import { useEffect } from "react";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";

/**
 * AnalyticsTracker — invisible, global instrumentation. Mounted once in the
 * root layout; renders nothing.
 *
 * Covers the interactions that don't belong to any single component:
 *  1. Scroll depth — 25 / 50 / 75 / 100%, each fired once per page view.
 *  2. Section views — first time a major section (#work, #services, #why,
 *     #process, #contact) enters the viewport ("portfolio viewed" etc.).
 *  3. Link taxonomy — one delegated bubble-phase click listener classifies
 *     every anchor: wa.me → whatsapp_click, mailto: → email_click,
 *     tel: → phone_click, other external hosts → outbound_click.
 *     Bubble phase (not capture) so links whose default is prevented by the
 *     UI (e.g. mailto CTAs that open the contact modal instead) are skipped —
 *     only real navigations are counted.
 *
 * page_view / session_start / first_visit are GA4 auto-collected events and
 * are intentionally NOT duplicated here.
 */

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

const TRACKED_SECTIONS = ["work", "services", "why", "process", "contact"];

export default function AnalyticsTracker() {
  // 1. Scroll depth.
  useEffect(() => {
    const fired = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const percent =
        scrollable <= 0
          ? 100
          : Math.round((window.scrollY / scrollable) * 100);
      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          trackEvent(AnalyticsEvent.SCROLL_DEPTH, { percent_scrolled: milestone });
        }
      }
      if (fired.size === SCROLL_MILESTONES.length) {
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 2. Section views.
  useEffect(() => {
    const sections = TRACKED_SECTIONS.map((id) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!entry.isIntersecting || seen.has(id)) continue;
          seen.add(id);
          trackEvent(AnalyticsEvent.SECTION_VIEW, { section_id: id });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 3. Delegated link classification.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return; // UI intercepted it (e.g. opened the modal)
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href") ?? "";
      const text = (anchor.textContent ?? "").trim().slice(0, 80);

      if (href.startsWith("mailto:")) {
        trackEvent(AnalyticsEvent.EMAIL_CLICK, { link_text: text });
        return;
      }
      if (href.startsWith("tel:")) {
        trackEvent(AnalyticsEvent.PHONE_CLICK, { link_text: text });
        return;
      }
      if (!/^https?:/i.test(anchor.href)) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.host === window.location.host) return; // internal

      if (url.host === "wa.me" || url.host === "api.whatsapp.com") {
        trackEvent(AnalyticsEvent.WHATSAPP_CLICK, { link_text: text });
      } else {
        trackEvent(AnalyticsEvent.OUTBOUND_CLICK, {
          link_url: url.href,
          link_domain: url.host,
          link_text: text,
        });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
