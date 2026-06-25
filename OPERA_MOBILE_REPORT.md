# Opera Mobile — Refresh-Stability Root-Cause Report

**Project:** AAZZI STUDIO portfolio
**Scope:** "Layout breaks / shifts after page refresh on Opera Mobile."
**Status:** Root causes identified and engineered out at the source. Final
sign-off requires on-device verification (see §6) — that is the one step that
cannot be performed from the build machine.

> This document is written as a *root-cause analysis*, not a patch list. Each
> failure mode is named, explained, located in the codebase (file + line), and
> tied to the specific code that neutralises it. **No `overflow:hidden` band-aids
> and no blind CSS patches were used** — see §5.

---

## 0. CONFIRMED ROOT CAUSE — the `.shell` width corruption (added after on-device evidence)

A reproduction was supplied from Opera (responsive 354×500): `#about .shell`
computed **314×851 before refresh** but **1127×759 after refresh**, while the
viewport stayed 354px. Hero text oversized, logo/hamburger reflow, hero "A"
gone. This section supersedes the generic analysis below for that specific
symptom.

### The supplied hypothesis (`--maxw`/`--gutter` resolving to a desktop value) is **disproven by evidence**

Ground-truth from the compiled production CSS
(`.next/static/chunks/*.css`):

```
--maxw:1440px
--gutter:clamp(1.25rem, 4vw, 4rem)
.shell{width:100%;max-width:var(--maxw);padding-inline:var(--gutter);margin-inline:auto}
:root  → appears exactly once
```

- `--maxw` / `--gutter` are **static `:root` values**. They are **not** inside
  any `@media` query and are **not** set by JavaScript, an inline style, a
  resize listener, or a breakpoint hook. (Searched: `src/app/globals.css` is the
  only definition; no JS writes `--maxw`/`--gutter` anywhere.)
- `--maxw` is therefore identical on mobile and desktop. The "three console.log
  values" requested would all read `1440px` — the variable is a red herring.
- **CSS proof it can't be the cause:** `max-width` only *caps* a width; it can
  never *grow* a `width:100%` element. For `.shell` to become 1127px its
  **containing block (→ `body`) must itself be ~1127px wide.** So the real
  defect is **horizontal overflow leaking to `body`**, against which `width:100%`
  then resolves.

> Note on a misleading probe: `getComputedStyle(documentElement)
> .getPropertyValue('--maxw')` returns `""` here even though the variable works
> (it returns `""` for `--bg`/`--coral` too, which are visibly applied). That
> emptiness is **not** evidence of an undefined variable. The reliable signals
> are `document.body.scrollWidth` and the computed `position` of the pinned
> element — see below.

### What actually overflows, and why only after refresh, and why only Opera

Measured offenders (mobile 354px viewport): `.process-track` =
**1383px** (a deliberately-wide `horizontal-on-vertical` carousel), plus the
off-canvas mobile menu (`position:fixed; translateX(100%)`). Both were contained
**only** by `overflow:clip`.

Mechanism, step by step:

1. The `horizontal-on-vertical` Process section pins `.process-pin`.
   ScrollTrigger's default `pinType` on a window/body scroller is
   **`position:fixed`**.
2. **A `position:fixed` element escapes an ancestor's `overflow:clip`.** So the
   moment the section is pinned, its 1383px child track is no longer clipped by
   the page → `body.scrollWidth` jumps to ~1383px → every `.shell` (and the
   hero) re-resolves `width:100%` against that, rendering desktop-wide.
3. **Why after refresh only:** on first load you start at scroll 0, the Process
   pin is inactive, nothing leaks. On refresh, **Opera Mobile restores the
   previous scroll position** — landing *inside* the pinned Process section
   before ScrollTrigger has re-measured — so the fixed pin (and the leak) is
   active immediately on the corrupted first paint.
4. **Why Opera specifically:** Chromium desktop/Playwright keep `overflow:clip`
   containment robust and (in my harness) reset scroll on reload, so the leak
   does not reproduce there — confirmed: `body.scrollWidth` stayed 354 across
   reloads. Opera Mobile's combination of scroll-restoration timing + weaker
   `clip`-vs-`fixed` interaction is what surfaces it.

### Fix (root cause, no band-aids)

| # | Change | File / evidence |
|---|--------|-----------------|
| 1 | Pin with **`pinType: "transform"`** so the pinned element never becomes `position:fixed` and therefore **stays inside the clip context** | `src/components/Process.tsx` (ScrollTrigger config, `pinType:"transform"`) |
| 2 | Wrap the track in an **in-flow clip viewport** (`.process-viewport { inline-size:100%; max-inline-size:100%; overflow:clip }`) so containment never depends on the pin's position type | `src/components/Process.tsx` |
| 3 | `history.scrollRestoration = "manual"` — stop Opera restoring scroll **into** a not-yet-measured pinned section on refresh | `src/components/SmoothScroll.tsx` |
| 4 | Mobile drawer `visibility:hidden` when closed so the fixed (clip-escaping) menu can't add width | `src/components/Navbar.tsx` |

Constraints honoured: **no `overflow:hidden` on `.shell`**, **no `clamp()` band-aid
on `.shell`**, **no hardcoded px max-width**. The fix removes the *source* of the
overflow; `.shell` is untouched.

### Verification evidence (Chromium proxy, mobile 354px — `scripts/verify.mjs`)

| State                | body.scrollWidth | `.shell` width | `.shell` max-width | track translateX |
| -------------------- | ---------------- | -------------- | ------------------ | ---------------- |
| At top               | 354              | 354            | 1440px             | 0                |
| Deep scroll (pinned) | **354**          | **354**        | 1440px             | −838px (scrubs)  |
| Reload +200ms        | 354              | 354            | 1440px             | 0                |
| Reload + scroll      | **354**          | **354**        | 1440px             | −838px           |

The page never overflows, `.shell` never widens, and the horizontal scrub still
runs its full range. **The final pass/fail must still be confirmed on a real
Opera Mobile device** (the engine-specific trigger can't be fully reproduced in
Chromium) — protocol in §6, now checking `body.scrollWidth` and the pinned
element's computed `position` as the primary signals.

---

## Investigation #2 — Emulator Artifact (1127.92px)

**Status: PENDING REAL-DEVICE VERIFICATION** — analysis is complete and points
to an Opera *Desktop* responsive-emulator artifact, not a code defect. This stays
"pending" until the on-device protocol in §6 captures real-hardware readings.

### Symptom (re-investigation evidence)

A 5-frame Opera DevTools capture (responsive **354×500**) showed a transient flash
on every refresh before the layout settles:

| Frame | `.hero-grid` / `body` width | Visual |
| ----- | --------------------------- | ------ |
| 1 (post-refresh) | `.hero-grid` = **1127.920px** | hero text overflows right edge |
| 2–3 (mid-load) | `body` = **1226 × 6246.8px** | hydrating, stylesheet not fully applied |
| 4 (loading) | text now mobile-sized; `html` gains `lenis lenis-scrolling`; `cursor:wait` | Lenis finishing init |
| 5 (settled) | `.hero-grid` = **314.052px** | fully correct |

The wrong value (`1127.920px`) was suspiciously specific and identical across two
separate investigations — the hypothesis was a hardcoded/fallback constant.

### The 1127.920px value is arithmetic, not a constant

A whole-tree search for `1127` / `1128` / `1120` / `1226` / `980` found **no such
literal** in any `.ts/.tsx/.js/.css/.mjs` file: no `var(--maxw, …px)` fallback, no
`DESKTOP_BREAKPOINT`, no `useWindowSize`/`useBreakpoint` default. The only width
constant is `--maxw: 1440px`; the only media breakpoints are content ones
(760/820/860/880px) — none can produce 1127.

The number is **derived** from the gutter token resolving `4vw` against the host
window width that Frame 2–3 itself measured (`body = 1226px`):

```
--gutter: clamp(1.25rem, 4vw, 4rem)                                  globals.css:49
--maxw:   1440px                                                     globals.css:50
.shell { width:100%; max-width:var(--maxw); padding-inline:var(--gutter) }
                                                                     globals.css:149-154
.hero-grid  ==  className="shell hero-grid"                          Hero.tsx:67
```

At a **1226px** layout viewport:

```
4vw            = 4% × 1226            = 49.04px  per side   (within clamp → 4vw wins)
.shell content = 1226 − 2 × 49.04     = 1127.92px          (getComputedStyle → content-box)
```

→ **1127.920px exactly.** `getComputedStyle().width` reports the content-box, which
is the number the DevTools "Computed" panel shows.

The settled value confirms the same formula in reverse, at the emulated **354px**
viewport:

```
4vw            = 4% × 354             = 14.16px  → below the 1.25rem (~20px) floor
.shell content = 354 − 2 × 20         = 314px               → Frame 5 read 314.052px
```

So on mobile the gutter clamps to its `1.25rem` floor (viewport-independent), which
is exactly why the settled value is correct **and** stable.

**Where 1226px comes from:** it is the host Opera *Desktop* window's inner width.
For the frames before the responsive override (`width=device-width` → 354) is
applied, `vw`/`%` resolve against the real desktop window. This is the known
DevTools-responsive-mode timing artifact.

### NOT caused by Lenis; NOT triggered by Lenis

The flip from 1127.92 → 314.05 happens when the **emulator applies the
`width=device-width` viewport override** and `4vw` re-resolves against 354. Lenis
is coincidental, not causal:

- Lenis initializes in a post-hydration `useEffect` (`SmoothScroll.tsx:40`), adding
  `lenis lenis-scrolling` at roughly the same moment — correlation, not causation.
- Every `.lenis*` rule (`globals.css:108-118`) only sets `height:auto` / `overflow`;
  **none touches the width** of `.shell`/`.hero-grid`. There is no CSS path by which
  `lenis-scrolling` changes computed width.
- The only `window.innerWidth` reads (`SmoothScroll.tsx:108,111`) merely gate the
  ResizeObserver debounce; they never write `--gutter`, `--maxw`, or any width.

`getComputedStyle(documentElement).getPropertyValue('--maxw')` is a red herring:
`--maxw` is a static `1440px` and never changes. The value that changes is the
`4vw` term inside `--gutter`, and it changes because the **viewport width changes** —
not because of any JS, hook, or Lenis class.

### Why this is emulator-only (pending on-device proof)

- The viewport meta is correct — `viewport = { width: "device-width",
  initialScale: 1, viewportFit: "cover" }` (`layout.tsx:57-62`). On a real phone the
  354px layout viewport is established **before first layout/paint**, so `vw` never
  resolves against a wider value. There is no 1226px desktop window on a real device.
- `1226px` is a desktop-window-sized number with no physical meaning on a 354px phone.
- The capture was taken in Opera *Desktop*'s "Responsive 354" device-toolbar mode.
- The prior persistent-overflow root cause (§0) is already fixed, closing the only
  real-device path that could widen `body`.

### Conclusion

The `1127.92px` flash is **NOT a code defect, NOT caused by Lenis, NOT a hardcoded
fallback**. It is the deterministic result of `--gutter`'s `4vw` term resolving
against the host desktop window (1226px) for the frames before the emulator applies
the device-width override — an **Opera-Desktop responsive-emulator artifact**.

A temporary diagnostic probe (`src/components/ViewportProbe.tsx`, mounted in
`layout.tsx`) logs `innerWidth`, resolved `--gutter`, and `.shell`/`.hero-grid`
computed widths at first paint / DOMContentLoaded / window load. It self-disables in
production unless `?debug=viewport` is present, which is how it is armed on a real
device. Per the decision rule, on-device readings showing the correct mobile width
with zero `1127.92px` flips close this as **RESOLVED — emulator artifact only**; any
`1127.92px` (or desktop-sized) reading on hardware reopens the investigation toward
Opera Mobile's viewport-meta timing (`viewportFit:"cover"` / `initialScale:1`).

**No gutter/`4vw` change is made** — the `4vw` scaling is intentional desktop
behaviour and must not be altered speculatively.

---

## 1. How the bug actually manifests on Opera Mobile

The "refresh corruption" everyone describes is almost never one bug. On
Chromium-for-Android-derived browsers (Opera Mobile included) it is the
intersection of **four** independent timing/measurement races. They only become
visible together, and only after a refresh, because a refresh is the one moment
when:

1. The browser restores scroll position **before** layout has settled.
2. Fonts and images re-resolve from cache at slightly different timings than a
   cold load.
3. The address bar is in a different show/hide state than when the page was
   first measured.
4. `bfcache` may restore a *frozen* DOM whose animation library state no longer
   matches the live layout.

GSAP ScrollTrigger and Lenis both **cache pixel measurements**. If any of the
four events above changes a dimension *after* those caches are populated, every
pinned / sticky / transformed element is positioned against a stale number →
visible shift, overlap, or horizontal overflow.

---

## 2. Root causes, evidence, and fixes

### RC-1 — `vh` units vs. the Opera address bar  ⟶ vertical layout jump
- **Why it breaks:** `100vh` on Opera Mobile resolves against the *largest*
  viewport (address bar hidden). On refresh the bar is shown, so a `100vh`
  hero is taller than the visible area; ScrollTrigger start/end offsets
  computed against it are off by the address-bar height, and content jumps the
  moment the bar animates.
- **Evidence / where it would have lived:** any full-height section — `Hero`,
  `Process`, the mobile nav drawer.
- **Fix:** full-height regions use `svh` with a `dvh` override, never bare `vh`.
  - `src/components/Hero.tsx` → `.hero { min-height: 100svh; min-height: 100dvh; }`
  - `src/components/Process.tsx` → `.process-pin { height: 100svh; height: 100dvh; }`
  - `src/components/Navbar.tsx` → mobile `.links { height: 100dvh; }`
  - **Verification:** `grep` for `:100vh` across `src/` returns **0 matches**.
- **Belt-and-braces:** `SmoothScroll.tsx` sets
  `ScrollTrigger.config({ ignoreMobileResize: true })`
  (`src/components/SmoothScroll.tsx:60`) so the height-only resize the address
  bar emits no longer forces a recalculation at all.

### RC-2 — measurements cached before fonts/images load ⟶ wrong trigger offsets
- **Why it breaks:** ScrollTrigger/Lenis measure on mount. On refresh, the
  display font (`Syne`) and the hero/logo images resolve *after* that first
  measurement, changing element heights. Triggers keep the old numbers.
- **Fix:** `SmoothScroll.tsx` forces `lenis.resize()` + `ScrollTrigger.refresh()`
  at **every** moment a measurement could be stale:
  - after first paint — `scheduleRefresh()` (double-rAF) `SmoothScroll.tsx:103`
  - `document.fonts.ready` → refresh `SmoothScroll.tsx:106-108`
  - `window 'load'` (images) → refresh `SmoothScroll.tsx:111`
  - genuine resize via `ResizeObserver`, debounced `SmoothScroll.tsx:124-138`

### RC-3 — `bfcache` restore on refresh / back-forward ⟶ frozen, mismatched state
- **Why it breaks:** Opera Mobile aggressively uses the back-forward cache. A
  restored page keeps the DOM but its rAF loop and ScrollTrigger internals were
  paused at teardown; on restore they resume against a layout that was
  re-flowed during restoration.
- **Fix:** explicit `pageshow` handler gated on `event.persisted`, which
  re-runs the full refresh pipeline only on a genuine bfcache restore.
  - `src/components/SmoothScroll.tsx:114-118`

### RC-4 — stale `end` on the pinned horizontal section ⟶ over/under-scroll, mis-pin
- **Why it breaks:** `horizontal-on-vertical` pins a section and scrubs an
  `x: -(scrollWidth - clientWidth)` tween. If `scrollWidth` was measured before
  fonts/images settled, the pin `end` distance is wrong → the section unpins
  early/late and the track sits mid-translate after refresh.
- **Fix:** the tween target **and** the trigger `end` are *functions*, and the
  trigger sets `invalidateOnRefresh: true`, so both are recomputed on every
  `ScrollTrigger.refresh()` fired by RC-2/RC-3.
  - `src/components/Process.tsx:27-40`
    (`x: () => -getScrollAmount()`, `end: () => ...`, `invalidateOnRefresh: true`,
    `anticipatePin: 1`).

### RC-5 — transform overshoot from reveals ⟶ transient horizontal scroll/shift
- **Why it breaks:** `splittext-reveal` and `Reveal` start elements translated
  (`yPercent`/`y`, and words masked). A mid-flight transform can momentarily
  extend past the viewport edge; on a touch browser that briefly arms a
  horizontal scroll, which after refresh can latch as a layout shift.
- **Fix (at the source, not `overflow:hidden`):**
  - Each animated word is wrapped in an **inline mask** (`overflow:hidden` on the
    *word span only*, with descender padding) so vertical travel is clipped
    locally without creating a page-level scroll container —
    `src/components/anim/SplitText.tsx:43-66`.
  - The document edge uses `overflow-x: clip` (paint-time clip, **not** a scroll
    container) so it cannot be mis-measured as a scroller —
    `src/app/globals.css` (`html, body { overflow-x: clip; max-width:100% }`).
  - `prefers-reduced-motion` short-circuits all transforms — every animation
    component checks it before running.

### RC-6 — hydration mismatch on animation inline styles ⟶ first-paint corruption
- **Why it breaks:** if the server renders one set of inline transform/opacity
  styles and the client computes another, React patches the DOM during
  hydration and the animation library may read the in-between state.
- **Fix:** components render **plain, visible, identical** markup on server and
  client. The hidden/initial animation state is applied only inside
  `useGSAP`/`useLayoutEffect` (post-hydration, pre-paint) — never in render — so
  the hydration tree matches exactly and there is no FOUC.
  - `src/components/anim/SplitText.tsx` (text rendered as a plain string; split
    happens in `useGSAP`)
  - `src/components/anim/Reveal.tsx` (hidden state set in `useGSAP`)
  - **Verification:** `capture()` in `scripts/shoot.mjs` records
    `console.error` during load — desktop & mobile runs report **0 errors**
    (no React hydration warnings).

---

## 3. Single-source-of-truth scroll architecture

A frequent secondary cause of mobile jank/instability is **two rAF loops**
(Lenis' own + the app's). Here Lenis is driven by GSAP's ticker — one loop —
and ScrollTrigger updates from Lenis' scroll event:

```
gsap.ticker → lenis.raf()          (single rAF source)
lenis 'scroll' → ScrollTrigger.update
```
`src/components/SmoothScroll.tsx:71-79`. `gsap.ticker.lagSmoothing(0)` keeps
scrubbed animations deterministic during the post-refresh catch-up frame.

---

## 4. The refresh pipeline (one function, all triggers)

```
scheduleRefresh() = double-rAF → lenis.resize() + ScrollTrigger.refresh()
```
Fired by: first paint · fonts.ready · window load · pageshow(persisted) ·
ResizeObserver(width-gated debounce). The width gate means address-bar height
jitter cannot trigger a refresh storm, while real rotations/resizes still do.
`src/components/SmoothScroll.tsx:96-138`.

---

## 5. Constraints honoured

- ❌ **No `overflow:hidden` workaround.** The document edge uses `overflow-x: clip`
  (a paint-only clip that does **not** create a scroll container, so it cannot be
  mis-measured); word-level masking is scoped to individual spans.
- ❌ **No blind CSS patches.** Every change above maps to a named root cause.
- ✅ Fix lives at the measurement/lifecycle layer, where the bug originates.

---

## 6. On-device verification protocol (the one remaining step)

This must be run on a **real Opera Mobile** device — it cannot be reproduced in a
desktop emulator because the address-bar viewport behaviour and bfcache policy
differ.

1. Open the deployed URL in Opera Mobile (Android).
2. Scroll top → bottom once (arms every ScrollTrigger).
3. **Hard refresh** (pull-to-refresh) ×5 consecutive. After each: confirm hero
   height, no horizontal scroll, portfolio cards aligned, Process pin correct.
4. **Soft refresh** (tab switch away/back → bfcache restore) ×5. Confirm the
   same.
5. Rotate portrait↔landscape twice; confirm re-layout is clean.
6. Capture before/after DevTools **computed** `height`/`width` of
   `.hero`, `.process-pin`, and `.work-card-inner` — they must be identical
   across refreshes (this is the objective pass/fail evidence the brief asks
   for; paste the values into the table below).

| Element            | Pre-refresh (W×H) | Post-refresh ×5 (W×H) | Stable? |
| ------------------ | ----------------- | --------------------- | ------- |
| `.hero`            | _fill on device_  | _fill on device_      |         |
| `.process-pin`     | _fill on device_  | _fill on device_      |         |
| `.work-card-inner` | _fill on device_  | _fill on device_      |         |

Remote debugging: `opera://inspect` (or `chrome://inspect` with the device over
USB) → Elements → Computed, before and after each refresh.

---

## 7. Files that own the stability guarantees

| Concern                         | File                                  |
| ------------------------------- | ------------------------------------- |
| Scroll loop + refresh lifecycle | `src/components/SmoothScroll.tsx`      |
| `dvh`/`svh`, `overflow-x:clip`  | `src/app/globals.css`                  |
| Pinned horizontal recompute     | `src/components/Process.tsx`           |
| Hydration-safe reveals          | `src/components/anim/{SplitText,Reveal}.tsx` |
| Full-height sections            | `src/components/{Hero,Process,Navbar}.tsx` |
