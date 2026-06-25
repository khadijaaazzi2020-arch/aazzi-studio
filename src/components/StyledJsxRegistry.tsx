"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";

/**
 * StyledJsxRegistry — server-side collection + injection for styled-jsx.
 *
 * ── WHY THIS EXISTS (the first-paint "broken frame" on real iPhones) ─────────
 * Every visual component (Preloader, Navbar, Hero, sections…) styles itself with
 * `<style jsx>` blocks. In the App Router, styled-jsx in Client Components needs
 * a registry to be SERVER-RENDERED. Without it, Next prerenders the elements
 * WITH their scoped `jsx-xxxx` class names but emits NONE of the matching CSS in
 * the HTML `<head>` — the rules are injected only after client JS hydrates.
 *
 * Result on a slow first paint (a real phone, where hydration lands hundreds of
 * ms after first paint): the unstyled HTML paints for a beat — the preloader
 * curtain is not `position:fixed` so the hero shows through, the nav links
 * collapse to inline text, the logos render at natural size — then the styles
 * land and everything snaps into place. That transient is the attached
 * screenshot; on desktop it is sub-frame, on iOS it is visible.
 *
 * This registry collects the styles produced during the server render and
 * flushes them into the streamed `<head>` via `useServerInsertedHTML`, so the
 * very first frame is fully styled. See
 * node_modules/next/dist/docs/01-app/02-guides/css-in-js.md.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function StyledJsxRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create the stylesheet once (lazy initial state) so it isn't re-created on
  // every render.
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
