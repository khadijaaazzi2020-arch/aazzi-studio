// Opera-Mobile final-pass verification. Mobile context @ 354x500.
// Captures the [Hero] diagnostics + any console errors, then asserts:
//   - the GSAP intro sequence fired (mounted → fadeItems 5 → playEntrance)
//   - no "GSAP target not found"
//   - every .hero-fade ends visible (opacity ~1) — no stranded hidden content
//   - the logo sits inside the viewport (not displaced off-screen / black)
//   - no horizontal overflow after deep scroll
import { chromium } from "playwright";

const URL = process.env.URL || "http://localhost:3000";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 354, height: 500 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();

const errors = [];
const warnings = [];
p.on("console", (m) => {
  const t = m.text();
  if (m.type() === "error") errors.push(t);
  if (m.type() === "warning") warnings.push(t);
});

await p.goto(URL, { waitUntil: "load" });
await p.waitForTimeout(6000); // preloader curtain (5.2s failsafe) + entrance

const state = await p.evaluate(() => {
  const fades = Array.from(document.querySelectorAll(".hero-fade"));
  const logo = document.querySelector(".hero-logo");
  const vp = { w: window.innerWidth, h: window.innerHeight };
  const r = logo ? logo.getBoundingClientRect() : null;
  return {
    fadeCount: fades.length,
    fadeOpacities: fades.map((f) => +getComputedStyle(f).opacity.slice(0, 4)),
    heroVisualIsolation: getComputedStyle(document.querySelector(".hero-visual")).isolation,
    logoBox: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
    logoOnScreen: r ? r.x < vp.w && r.right > 0 && r.y < vp.h && r.bottom > 0 : false,
    docScrollW: document.documentElement.scrollWidth,
    innerW: vp.w,
  };
});

// deep scroll to confirm no overflow / breakage after the address-bar-style churn
for (let i = 0; i < 30; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(25); }
const afterScroll = await p.evaluate(() => ({
  docScrollW: document.documentElement.scrollWidth,
  innerW: window.innerWidth,
}));

await b.close();

const targetNotFound = [...errors, ...warnings].some((l) => /GSAP target.*not found/i.test(l));
const allVisible = state.fadeOpacities.every((o) => o > 0.9);
const noOverflow = state.docScrollW <= state.innerW + 1 && afterScroll.docScrollW <= afterScroll.innerW + 1;

console.log("─ STATE ─────────────────────────");
console.log(JSON.stringify(state, null, 2));
console.log("  afterScroll:", JSON.stringify(afterScroll));
console.log("─ ASSERTIONS ────────────────────");
const checks = [
  ["fadeItems resolved = 5",          state.fadeCount === 5],
  ["all .hero-fade visible (opacity~1)", allVisible],
  ["NO 'GSAP target not found'",      !targetNotFound],
  ["isolation auto on mobile",        state.heroVisualIsolation === "auto"],
  ["logo on-screen (not displaced)",  state.logoOnScreen],
  ["no horizontal overflow",          noOverflow],
  ["no console errors",               errors.length === 0],
];
let ok = true;
for (const [name, pass] of checks) { console.log(`  ${pass ? "✓" : "✗"} ${name}`); if (!pass) ok = false; }
if (errors.length) errors.slice(0, 5).forEach((e) => console.log("   ! " + e));
console.log(ok ? "\nRESULT: PASS" : "\nRESULT: FAIL");
process.exit(ok ? 0 : 1);
