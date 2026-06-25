import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:354,height:500},isMobile:true,hasTouch:true})).newPage();
await p.goto(process.env.URL||"http://localhost:3000",{waitUntil:"load"});
await p.waitForTimeout(4500);

const measure = async (label) => {
  const m = await p.evaluate(() => {
    const shell = document.querySelector("#about .shell");
    const pin = document.querySelector(".process-pin");
    const pinCS = pin ? getComputedStyle(pin) : null;
    return {
      bodyScrollW: document.body.scrollWidth,
      docScrollW: document.documentElement.scrollWidth,
      shellW: shell ? Math.round(shell.getBoundingClientRect().width) : null,
      shellMaxW: shell ? getComputedStyle(shell).maxWidth : null,
      processPosition: pinCS ? pinCS.position : null,
      processTransform: pinCS ? (pinCS.transform || "").slice(0,30) : null,
    };
  });
  console.log(label, JSON.stringify(m));
};

await measure("AT TOP                 ");
// scroll into the process section so its ScrollTrigger pins
await p.evaluate(() => {
  const el = document.getElementById("process");
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 50);
});
await p.waitForTimeout(800);
await measure("INSIDE PROCESS (pinned)");
// scroll a bit more (mid-scrub)
await p.evaluate(() => window.scrollBy(0, 400));
await p.waitForTimeout(600);
await measure("PROCESS MID-SCRUB      ");
await b.close();
