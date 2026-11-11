// How long the reader waits for the first answer of a page's controls, on a phone with a slow connection: a guide page's first term
// card, its first rule card and the search's first results. Measured in the page, from the finger going down (or the first key) to the
// sheet showing its card (or the results' first row), right after the page became interactive ("at once": the worst case, before
// anything fetched on idle is in) and after three idle seconds ("after idle"). Each run starts with an empty cache.
//
// Usage (from the repo or worktree root, after `npm run build`):
//   node tools/first-tap.mjs [--build site/build/client] [--page /guide/keren-hishtalmut] [--runs 3] [--fast]
// The connection is Lighthouse's slow 4G (150 ms round trip, 1.6 Mbit/s down) with the processor slowed four times; --fast drops both.
import { createRequire } from "node:module";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import http from "node:http";
import { gzipSync } from "node:zlib";

const { values: o } = parseArgs({
  options: { build: { type: "string", default: "site/build/client" }, page: { type: "string", default: "/guide/keren-hishtalmut" }, runs: { type: "string", default: "3" }, fast: { type: "boolean" } },
});
const pw = (() => {
  try {
    return createRequire(join(process.cwd(), "package.json"))("playwright");
  } catch {
    return null;
  }
})();
if (!pw) {
  console.error("Playwright not found; run from the repo root");
  process.exit(2);
}
const cache = join(homedir(), ".cache/ms-playwright");
const chromeDir = existsSync(cache) && readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const executablePath = chromeDir ? join(cache, chromeDir, "chrome-linux64/chrome") : undefined;
const here = new URL(".", import.meta.url).pathname;
const { serveBuild } = await import(join(here, "../site/scripts/serve-build.mjs"));
const inner = await serveBuild(resolve(o.build), { port: 0 });
// GitHub Pages sends text files gzipped; serve-build sends them as they are, which made the search index (1.3 MB, 0.13 MB gzipped)
// take seconds on the slow connection. This front server gzips what Pages gzips.
const front = http.createServer(async (req, res) => {
  const r = await fetch(inner.url.replace(/\/finance-tool\/?$/, "") + req.url, { redirect: "manual" });
  const body = Buffer.from(await r.arrayBuffer());
  const type = r.headers.get("content-type") ?? "";
  const headers = Object.fromEntries([...r.headers].filter(([k]) => !["content-length", "transfer-encoding", "connection", "keep-alive", "date"].includes(k)));
  if (/text|javascript|json|svg|x-script/.test(type)) {
    const z = gzipSync(body);
    res.writeHead(r.status, { ...headers, "content-encoding": "gzip", "content-length": z.length }).end(z);
  } else res.writeHead(r.status, { ...headers, "content-length": body.length }).end(body);
});
await new Promise((ok) => front.listen(0, "127.0.0.1", ok));
const server = { url: `http://127.0.0.1:${front.address().port}/finance-tool/`, close: () => (front.close(), inner.close()) };
const browser = await pw.chromium.launch({ executablePath });

/** In the page: when the finger goes down or the first letter is typed, and when `selector` first shows text after it. */
const watch = (selector) => {
  const w = window;
  w.__down = null;
  w.__shown = null;
  const mark = () => {
    if (w.__down === null) w.__down = performance.now();
  };
  // Hebrew letters arrive as text input, with no key events
  for (const e of ["pointerdown", "touchstart", "keydown", "beforeinput"]) document.addEventListener(e, mark, { capture: true, once: true });
  // a mutation observer catches the change as it happens; the interval catches a layout that comes after it (frames can pause in a
  // page nobody looks at, so no requestAnimationFrame)
  const check = () => {
    if (w.__down === null || w.__shown !== null) return;
    const el = document.querySelector(selector);
    if (el && el.getBoundingClientRect().height > 0 && (el.textContent ?? "").trim().length > 0) {
      w.__shown = performance.now();
      mo.disconnect();
      clearInterval(iv);
    }
  };
  const mo = new MutationObserver(check);
  mo.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  const iv = setInterval(check, 5);
};

const cases = {
  "term card": async (page) => {
    const t = page.locator(".term").first();
    await t.scrollIntoViewIfNeeded();
    await page.evaluate(watch, "dialog[open] h2");
    await t.tap();
  },
  "rule card": async (page) => {
    // a chip that rests on one rule opens the rule's card at once (a chip of several opens a list first)
    const t = page.locator('button.rule-chip[aria-label="חוקים וכללים, 1"]').first();
    await t.scrollIntoViewIfNeeded();
    await page.evaluate(watch, "dialog[open] h2");
    await t.tap();
  },
  "search, first key to results": async (page) => {
    await page.getByRole("button", { name: "חיפוש", exact: true }).first().tap();
    const field = page.locator("dialog[open] input");
    await field.waitFor();
    await page.evaluate(watch, "dialog[open] section li");
    await field.pressSequentially("קרן", { delay: 120 });
  },
};

const results = {};
try {
  for (const [name, act] of Object.entries(cases)) {
    for (const when of ["at once", "after idle"]) {
      for (let i = 0; i < Number(o.runs); i++) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
        const page = await context.newPage();
        if (!o.fast) {
          const cdp = await context.newCDPSession(page);
          await cdp.send("Network.enable");
          await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
          await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        }
        await page.goto(server.url.replace(/\/$/, "") + o.page, { waitUntil: "load" });
        // interactive: the header's search button is enabled once the page has hydrated
        await page.waitForFunction(() => [...document.querySelectorAll("header button")].some((b) => !b.disabled), null, { timeout: 60_000 });
        if (when === "after idle") await page.waitForTimeout(3000);
        await act(page);
        await page.waitForFunction(() => window.__shown !== null, null, { timeout: 60_000 });
        const ms = await page.evaluate(() => Math.round(window.__shown - window.__down));
        (results[`${name} (${when})`] ??= []).push(ms);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  server.close();
}
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log(`${o.page}, ${o.fast ? "no throttling" : "slow 4G, processor slowed 4x"}, ms from the finger or first key to the answer (median of ${o.runs}; each run)`);
for (const [k, v] of Object.entries(results)) console.log(`${k.padEnd(44)} ${String(median(v)).padStart(6)}   ${v.join(", ")}`);
