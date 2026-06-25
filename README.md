# AAZZI STUDIO — Portfolio

Studio-grade, cinematic portfolio for AAZZI STUDIO (premium websites &
e-commerce). Built to feel custom and awards-tier — not a SaaS template.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind v4** (tokens layer)
- **GSAP + ScrollTrigger** — scroll-driven motion
- **Lenis** — smooth scroll (single rAF loop, driven by GSAP ticker)
- **Motion** — available for component-level animation
- **Syne** (display) + **Geist** (body)

## Design tokens (locked)

See **`DESIGN_TOKENS.md`**. Core: base `#121414`, dark coral `#e0473a`
(glow `#ff5246`), text `#e3e2e2`. All values live in `src/app/globals.css`.

## Sections & motion patterns

| Section      | Motion pattern                          | File |
| ------------ | --------------------------------------- | ---- |
| Preloader    | logo mask + count reveal                | `src/components/Preloader.tsx` |
| Hero         | `splittext-reveal` + parallax           | `src/components/Hero.tsx` |
| About        | line-by-line reveal                     | `src/components/About.tsx` |
| Services     | staggered card reveal                   | `src/components/Services.tsx` |
| Portfolio    | `sticky-stack` (3 live stores)          | `src/components/Portfolio.tsx` |
| Process      | `horizontal-on-vertical` (pinned)       | `src/components/Process.tsx` |
| Testimonials | fade reveal (placeholder content)       | `src/components/Testimonials.tsx` |
| Contact      | `splittext-reveal` CTA                   | `src/components/Contact.tsx` |

## Develop

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
node scripts/shoot.mjs   # screenshots -> ./shots (desktop 1440 + mobile 375)
```

## Cross-browser / Opera Mobile

Refresh-stability is engineered at the source (dvh units, single-source scroll
loop, full ScrollTrigger refresh lifecycle, hydration-safe reveals). Full
analysis + the on-device verification protocol: **`OPERA_MOBILE_REPORT.md`**.

## Adding real store screenshots (recommended)

The portfolio uses designed preview panels with live links. To drop in real
captures: save 16:10 images to `public/work/`, then swap the `.preview-canvas`
block in `src/components/Portfolio.tsx` for a `next/image`.

## Hero / supporting imagery via Gemini CLI (optional)

Gemini CLI is installed. To generate brand-matched abstract textures instead of
the CSS glow, set a Google AI Studio API key and use the prompt template in
`scripts/gemini-imagery.md`, then save outputs to `public/` and reference them
from `Hero.tsx`. Keep imagery on-palette (`#121414` + dark coral).

## Brand assets

- Logo: `public/aazzi-logo.jpg` (navbar, preloader, favicon, OG image).
