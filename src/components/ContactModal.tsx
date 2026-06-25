"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type Lenis from "lenis";

/* ============================================================
   CONTACT DETAILS — edit here.
   ------------------------------------------------------------
   WHATSAPP_NUMBER: full international number, DIGITS ONLY
   (country code first, no +, spaces or dashes).
   e.g. Morocco mobile 06 00 11 22 33  →  "212600112233"
   Leave it "" to fall back to a number-less WhatsApp link.
   ============================================================ */
const EMAIL = "Khadija.aazzi.2020@gmail.com";
const WHATSAPP_NUMBER = "212762057523"; // ← paste your number here

const MAIL_SUBJECT = "New project enquiry";
const MAIL_BODY =
  "Hi Khadija,\n\nI'd like to discuss a project with AAZZI STUDIO.\n\nProject type:\nTimeline:\nBudget:\n\nThanks!";
const WA_TEXT = "Hi Khadija, I'd like to discuss a project with AAZZI STUDIO.";

const mailtoHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
  MAIL_SUBJECT
)}&body=${encodeURIComponent(MAIL_BODY)}`;
const whatsappHref = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`
  : `https://wa.me/?text=${encodeURIComponent(WA_TEXT)}`;

const OPEN_EVENT = "aazzi:open-contact";

/** Open the contact modal from anywhere (buttons, links, code). */
export function openContactModal() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ContactModal() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false); // present in the DOM
  const [show, setShow] = useState(false); // animation/visible state
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number>(0);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setShow(false);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 260);
  }, []);

  // Listen for global open requests.
  useEffect(() => {
    const onOpen = () => {
      window.clearTimeout(closeTimer.current);
      lastFocused.current = document.activeElement as HTMLElement | null;
      setOpen(true);
      // next frame → trigger the enter transition
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Side-effects while open: lock background scroll (Lenis), focus trap, ESC.
  useEffect(() => {
    if (!open) return;

    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    lenis?.stop();

    // Focus the dialog's first focusable element.
    const focusFirst = () => {
      const node = dialogRef.current;
      if (!node) return;
      const first = node.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node).focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const node = dialogRef.current;
      if (!node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && activeEl === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      lenis?.start();
      // Restore focus to the trigger when fully closed.
      lastFocused.current?.focus?.();
    };
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`cm-root ${show ? "is-open" : ""}`}
      aria-hidden={show ? undefined : true}
    >
      <div className="cm-backdrop" onClick={close} />

      <div
        ref={dialogRef}
        className="cm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-title"
        aria-describedby="cm-sub"
        tabIndex={-1}
      >
        <button className="cm-close" onClick={close} aria-label="Close dialog" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <p className="eyebrow">Let&apos;s talk</p>
        <h2 id="cm-title" className="cm-title">Ready to start your project?</h2>
        <p id="cm-sub" className="cm-sub">
          Choose your preferred contact method and let&apos;s discuss your project.
        </p>

        <div className="cm-cards">
          <a
            className="cm-card cm-card-wa cm-card-primary"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
          >
            <span className="cm-ic cm-ic-wa" aria-hidden>
              <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.04 3C9.43 3 4.06 8.37 4.06 14.98c0 2.11.55 4.17 1.6 5.99L4 29l8.2-1.62a11.93 11.93 0 0 0 3.84.63h.01c6.6 0 11.98-5.37 11.98-11.98C28.03 8.37 22.65 3 16.04 3Zm0 21.9h-.01a9.9 9.9 0 0 1-3.4-.6l-.42-.16-4.87.96.99-4.75-.27-.44a9.86 9.86 0 0 1-1.51-5.27c0-5.46 4.45-9.9 9.91-9.9 2.65 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.9 7c0 5.46-4.45 9.9-9.92 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
              </svg>
            </span>
            <span className="cm-card-body">
              <strong>Chat on WhatsApp</strong>
              <em>Fastest way to discuss your project.</em>
            </span>
            <span className="cm-go" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>

          <a className="cm-card" href={mailtoHref} onClick={close}>
            <span className="cm-ic cm-ic-mail" aria-hidden>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="cm-card-body">
              <strong>Send an Email</strong>
              <em>Best for detailed project requirements.</em>
            </span>
            <span className="cm-go" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>

        <p className="cm-reply">
          <span className="cm-reply-dot" aria-hidden /> I typically reply within a few hours.
        </p>
      </div>

      <style jsx>{`
        .cm-root {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          place-items: end center;
          padding: clamp(0.75rem, 3vw, 2rem);
        }
        @media (min-width: 600px) {
          .cm-root { place-items: center; }
        }
        .cm-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(8, 9, 9, 0.66);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          opacity: 0;
          transition: opacity 0.28s ease;
        }
        .cm-root.is-open .cm-backdrop { opacity: 1; }

        .cm-dialog {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 540px;
          padding: clamp(1.5rem, 4vw, 2.4rem);
          border: 1px solid var(--line-strong);
          border-radius: var(--r-xl);
          background:
            radial-gradient(120% 80% at 100% 0%, rgba(224, 71, 58, 0.12), transparent 55%),
            linear-gradient(180deg, var(--bg-2), var(--bg));
          box-shadow: var(--shadow-soft), 0 0 0 1px rgba(224, 71, 58, 0.06);
          outline: none;
          opacity: 0;
          transform: translateY(16px) scale(0.98);
          transition: opacity 0.3s ease, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cm-root.is-open .cm-dialog {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .cm-close {
          position: absolute;
          top: clamp(0.8rem, 2vw, 1.1rem);
          right: clamp(0.8rem, 2vw, 1.1rem);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .cm-close:hover {
          color: var(--text);
          border-color: var(--line-strong);
          background: rgba(255, 255, 255, 0.05);
        }

        .cm-title {
          font-size: var(--step-3);
          margin: 0.7rem 0 0.5rem;
          max-width: 16ch;
        }
        .cm-sub {
          color: var(--text-dim);
          font-size: var(--step-0);
          max-width: 42ch;
        }

        .cm-cards {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          margin-top: clamp(1.4rem, 4vw, 2rem);
        }
        .cm-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: clamp(1rem, 3vw, 1.3rem);
          min-height: 76px;
          border: 1px solid var(--line);
          border-radius: var(--r-lg);
          background: var(--bg-3);
          color: var(--text);
          transition: border-color 0.25s ease, transform 0.25s ease,
            background 0.25s ease, box-shadow 0.25s ease;
        }
        .cm-card:hover,
        .cm-card:focus-visible {
          transform: translateY(-3px);
          border-color: var(--line-strong);
          box-shadow: var(--shadow-soft);
        }
        .cm-ic {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          flex: 0 0 auto;
          border-radius: 14px;
        }
        .cm-ic-mail {
          color: var(--coral-bright);
          background: rgba(224, 71, 58, 0.1);
          border: 1px solid rgba(224, 71, 58, 0.22);
        }
        .cm-ic-wa {
          color: #25d366;
          background: rgba(37, 211, 102, 0.1);
          border: 1px solid rgba(37, 211, 102, 0.25);
        }
        .cm-card-wa:hover { border-color: rgba(37, 211, 102, 0.4); }
        /* WhatsApp = primary contact method → stronger emphasis. */
        .cm-card-primary {
          border-color: rgba(37, 211, 102, 0.35);
          background: linear-gradient(
            180deg,
            rgba(37, 211, 102, 0.1),
            rgba(37, 211, 102, 0.03)
          );
        }
        .cm-card-primary .cm-ic-wa {
          color: #fff;
          background: #25d366;
          border-color: #25d366;
        }
        .cm-card-primary:hover {
          border-color: rgba(37, 211, 102, 0.55);
          box-shadow: 0 18px 50px -22px rgba(37, 211, 102, 0.55);
        }
        .cm-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex: 1;
        }
        .cm-card-body strong {
          font-size: var(--step-1);
          font-weight: 600;
        }
        .cm-card-body em {
          font-style: normal;
          font-size: var(--step--1);
          color: var(--text-dim);
        }
        .cm-go {
          color: var(--text-faint);
          flex: 0 0 auto;
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .cm-card:hover .cm-go {
          color: var(--coral-bright);
          transform: translate(3px, -3px);
        }
        .cm-card-wa:hover .cm-go { color: #25d366; }

        .cm-reply {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.1rem;
          font-size: var(--step--1);
          color: var(--text-faint);
        }
        .cm-reply-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #25d366;
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.18);
        }
      `}</style>
    </div>,
    document.body
  );
}
