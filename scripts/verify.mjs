import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:354,height:500},isMobile:true,hasTouch:true})).newPage();
await p.goto(process.env.URL||"http://localhost:3000",{waitUntil:"load"});
await p.waitForTimeout(4500);

const measure = async (label) => {
  const m = await p.evaluate(() => {
    const shell = document.querySelector("#about .shell");
    const track = document.querySelector(".process-track");
    const vp = document.querySelector(".process-viewport");
    return {
      bodyScrollW: document.body.scrollWidth,
      docScrollW: document.documentElement.scrollWidth,
      shellW: shell ? Math.round(shell.getBoundingClientRect().width) : null,
      shellMaxW: shell ? getComputedStyle(shell).maxWidth : null,
      trackW: track ? Math.round(track.getBoundingClientRect().width) : null,
      trackTx: track ? getComputedStyle(track).transform.slice(0,24) : null,
      vpClientW: vp ? vp.clientWidth : null,
    };
  });
  console.log(label, JSON.stringify(m));
};

await measure("AT TOP        ");
// drive the process pin via real scroll steps so ScrollTrigger engages
for (let i=0;i<40;i++){ await p.mouse.wheel(0,300); await p.waitForTimeout(40); }
await measure("DEEP SCROLL   ");
// reload then immediately measure (simulates refresh) then scroll into process
await p.reload({waitUntil:"load"});
await p.waitForTimeout(200);
await measure("RELOAD +200ms ");
await p.waitForTimeout(4500);
for (let i=0;i<60;i++){ await p.mouse.wheel(0,300); await p.waitForTimeout(30); }
await measure("RELOAD+SCROLL ");
await b.close();
