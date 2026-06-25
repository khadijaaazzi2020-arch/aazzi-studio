import { chromium } from "playwright";

const URL = process.env.URL || "http://localhost:3000";
const VW = 354, VH = 500; // user's reported Opera responsive viewport

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const probe = () =>
  page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const shell = document.querySelector("#about .shell");
    const sc = shell ? getComputedStyle(shell) : null;
    // find every element wider than the viewport (the overflow culprit)
    const vw = window.innerWidth;
    const wide = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 1 || r.right > vw + 1) {
        wide.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && el.className.toString().slice(0, 60)) || "",
          w: Math.round(r.width),
          right: Math.round(r.right),
        });
      }
    }
    return {
      innerWidth: window.innerWidth,
      visualVW: window.visualViewport ? Math.round(window.visualViewport.width) : null,
      docScrollW: document.documentElement.scrollWidth,
      bodyScrollW: document.body.scrollWidth,
      maxw: root.getPropertyValue("--maxw").trim(),
      gutter: root.getPropertyValue("--gutter").trim(),
      shellWidth: sc ? sc.width : null,
      shellMaxWidth: sc ? sc.maxWidth : null,
      // top 8 widest offenders, dedup by class
      wide: wide
        .sort((a, b) => b.w - a.w)
        .slice(0, 10),
    };
  });

console.log("=== INITIAL LOAD ===");
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(4500); // let preloader finish
console.log(JSON.stringify(await probe(), null, 2));

console.log("\n=== AFTER RELOAD (immediate) ===");
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(200);
console.log(JSON.stringify(await probe(), null, 2));

console.log("\n=== AFTER RELOAD (+500ms) ===");
await page.waitForTimeout(500);
console.log(JSON.stringify(await probe(), null, 2));

console.log("\n=== AFTER RELOAD (+4500ms, preloader done) ===");
await page.waitForTimeout(4000);
console.log(JSON.stringify(await probe(), null, 2));

await browser.close();
