import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.URL || "http://localhost:3000";
const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// Scroll the whole page in steps so every ScrollTrigger reveal fires,
// then return to top. Mirrors how a real visitor experiences the page.
async function scrollThrough(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const step = 500;
  for (let y = 0; y < height; y += step) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(180);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

async function capture(name, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(4200); // preloader curtain

  // hero (above fold)
  await page.screenshot({ path: `${OUT}/${name}-hero.png`, fullPage: false });

  // trigger reveals, then full page
  await scrollThrough(page);
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });

  // section spot-checks
  for (const id of ["services", "work", "why", "process", "expect", "contact"]) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 20);
    }, id);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${name}-${id}.png`, fullPage: false });
  }

  console.log(`✓ ${name} (${width}x${height})${errors.length ? "  console-errors: " + errors.length : ""}`);
  if (errors.length) errors.slice(0, 5).forEach((e) => console.log("   ! " + e));
  await ctx.close();
}

await capture("desktop", 1440, 900);
await capture("mobile", 375, 780);

await browser.close();
console.log("done");
