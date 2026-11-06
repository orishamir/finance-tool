import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
const res = {};
for (const idx of ["sp500", "ta125"]) {
  await page.goto(`https://orishamir.github.io/finance-tool/indices/${idx}`, { waitUntil: "networkidle" });
  await page.waitForSelector("[role=radiogroup]");
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
  res[idx] = await page.evaluate(() => {
    // normalise any CSS colour to oklch via a canvas-free trick: let the browser parse into a probe and read it back
    const probe = document.createElement("div"); document.body.appendChild(probe);
    const toOk = (c) => { probe.style.color = ""; probe.style.color = `oklch(from ${c} l c h / alpha)`; return getComputedStyle(probe).color; };
    const chroma = (s) => { const m = s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/); return m ? { l: +m[1], c: +m[2], h: +m[3], a: m[4] ? +m[4] : 1 } : null; };
    const map = new Map(); let heading = "";
    for (const el of document.querySelectorAll("body *")) {
      if (/^H[1-3]$/.test(el.tagName)) heading = el.textContent.trim().slice(0, 30);
      const r = el.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue;
      const cs = getComputedStyle(el);
      const props = { color: cs.color, bg: cs.backgroundColor, border: cs.borderTopWidth !== "0px" ? cs.borderTopColor : null, borderS: cs.borderInlineStartWidth !== "0px" ? cs.borderInlineStartColor : null, fill: el instanceof SVGElement ? cs.fill : null, stroke: el instanceof SVGElement && cs.stroke !== "none" ? cs.stroke : null, deco: cs.textDecorationLine !== "none" ? cs.textDecorationColor : null, outline: cs.outlineStyle !== "none" ? cs.outlineColor : null, shadow: cs.boxShadow !== "none" ? cs.boxShadow : null };
      for (const [p, v] of Object.entries(props)) {
        if (!v || v === "none" || v.startsWith("rgba(0, 0, 0, 0)")) continue;
        let ok; try { ok = toOk(v.split(/ (?=-?\d+px)/)[0]); } catch { continue; }
        const k = chroma(ok); if (!k || k.a === 0 || k.c < 0.025) continue;
        const key = `${p} ${k.l.toFixed(2)} ${k.c.toFixed(3)} ${Math.round(k.h)}${k.a < 1 ? " a" + k.a.toFixed(2) : ""}`;
        const cls = (typeof el.className === "string" ? el.className : el.getAttribute("class") || "").split(/\s+/).filter((c) => /(bg|text|fill|stroke|border|ring|decoration|num|outline|shadow)-|^num|computed|entered|sourced/.test(c)).slice(0, 4).join(" ");
        const e = map.get(key) || { key, n: 0, sec: new Set(), cls: new Set(), sample: (el.textContent || el.tagName).trim().slice(0, 25) };
        e.n++; e.sec.add(heading); e.cls.add(cls); map.set(key, e);
      }
    }
    return [...map.values()].map((e) => `${e.n}\t${e.key}\t[${[...e.cls].slice(0, 3).join(" ; ")}]\t${[...e.sec].slice(0, 3).join(" / ")}\t${e.sample}`).sort((a, b) => a.split("\t")[1].split(" ")[3] - b.split("\t")[1].split(" ")[3]);
  });
}
const fs = await import("fs");
fs.writeFileSync("scan2.txt", Object.entries(res).map(([k, v]) => "##### " + k + "\n" + v.join("\n")).join("\n"));
await b.close();
