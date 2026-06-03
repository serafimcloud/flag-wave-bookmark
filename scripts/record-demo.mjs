// Records the bookmark "flapping" into a webm with Playwright, then you convert
// it to public/demo.gif with ffmpeg (see README "Recording the GIF").
//
//   npm i -D playwright && npx playwright install chromium
//   DEMO_URL=http://localhost:3000 node scripts/record-demo.mjs
//
// The hero waves continuously, so we just turn the wind up, let it flap, then
// hover the Save button for the second beat.

import { chromium } from "playwright";

const URL = process.env.DEMO_URL || "http://localhost:3000";
const OUT_DIR = "recording";
const W = 1000;
const H = 600;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  recordVideo: { dir: OUT_DIR, size: { width: W, height: H } },
});
const page = await context.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("#hero svg path");

// Stronger wind + bigger flag so the ripple reads in a small GIF.
await page.evaluate(() => {
  const setRange = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      "value",
    ).set;
    setter.call(el, String(val));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setRange("amp", 0.85);
  setRange("period", 800);
  setRange("size", 175);
});

// Beat 1: the hero flaps in the wind.
await page.waitForTimeout(4200);
// Beat 2: hover the Save button so the second bookmark picks up the wind.
await page.hover("text=Save to reading list");
await page.waitForTimeout(2600);

await context.close(); // finalizes the video file
await browser.close();
console.log(`Done. Video in ./${OUT_DIR}/ - convert it with ffmpeg (see README).`);
