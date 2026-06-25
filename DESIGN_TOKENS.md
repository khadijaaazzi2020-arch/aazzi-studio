# AAZZI STUDIO — Design Tokens (LOCKED)

Single source of truth. All values live in `src/app/globals.css` under `:root`.
Do not introduce ad-hoc colors, radii, or font sizes outside this system.

## Color

| Token            | Hex / value             | Use                                            |
| ---------------- | ----------------------- | ---------------------------------------------- |
| `--bg`           | `#121414`               | Page base — warm near-black (never `#000`)     |
| `--bg-2`         | `#181b1b`               | Elevated panels                                |
| `--bg-3`         | `#1d2120`               | Cards stacked on panels                        |
| `--coral`        | `#e0473a`               | Dark Coral accent (from logo's glowing half)   |
| `--coral-bright` | `#ff5246`               | Glow, hover, active                            |
| `--coral-deep`   | `#b5362c`               | Pressed / shadow tint                          |
| `--text`         | `#e3e2e2`               | Primary text — soft off-white (never `#fff`)   |
| `--text-dim`     | `#a7a9a8`               | Secondary text                                 |
| `--text-faint`   | `#6c6f6e`               | Meta / captions                                |
| `--line`         | `rgba(227,226,226,.10)` | Hairlines                                      |

**Rationale:** The coral is sampled from the illuminated "A" of the monogram.
The base is biased warm so coral glows and shadows read as belonging to the
same light, not pasted on.

## Typography

- **Display:** `Syne` (600–800) — geometric, high-character, used on awwwards-tier sites. Headings only.
- **Body / UI:** `Geist` — neutral, legible at small sizes.
- **Scale:** fluid `clamp()` steps `--step--1` … `--step-5` (see globals.css). No fixed px font sizes.
- Headings: `letter-spacing: -0.02em`, `line-height: 1.02`, balanced wrap.
- Eyebrows: `0.28em` tracking, uppercase, coral tick prefix.

## Spacing & layout

- `--gutter: clamp(1.25rem, 4vw, 4rem)` — page inline padding.
- `--maxw: 1440px` — content shell max width (`.shell`).
- Section rhythm: vertical padding `clamp(6rem, 12vw, 11rem)`.

## Radius & shadow

- Radii: `--r-sm 8` · `--r-md 14` · `--r-lg 22` · `--r-xl 32`.
- Shadows are warm/coral-tinted, never harsh black: `--shadow-soft`, `--shadow-coral`.

## Motion patterns (one per section)

| Section      | Pattern                  |
| ------------ | ------------------------ |
| Preloader    | logo mask + scale reveal |
| Hero         | `splittext-reveal`       |
| About        | line-by-line reveal      |
| Services     | staggered card reveal    |
| Portfolio    | `sticky-stack` (3 stores)|
| Process      | `pinned-scrub` progress  |
| Testimonials | fade/parallax            |
| Contact      | `splittext-reveal` CTA   |

## Viewport units

Use **`dvh` / `svh`** for full-height regions. **Never `vh`** — see
`OPERA_MOBILE_REPORT.md` for why (Opera Mobile address-bar behavior).
