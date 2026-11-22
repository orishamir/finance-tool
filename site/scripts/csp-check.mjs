// Opens a sample of the built pages in headless Chrome and fails on anything their Content Security Policy (csp.mjs) refused, so an
// inline script without its hash, a style, font or fetch from elsewhere, or code the policy blocks never reaches the site:
//   the front page, then a guide page reached from it by a click (the route's script and its .data fetched in the browser);
//   a guide page, the indices with no index named, an index page (its figures come from its Web Worker, lib/invest-worker.ts), a company
//   page and the not-found fallback (404.html), each opened afresh;
//   the kit, where a formula draws with KaTeX, loaded on first use with its stylesheet and fonts.
// A page fails on a `securitypolicyviolation` event or a refusal Chrome logs in the console. Any other error in the console, and an
// uncaught error, is printed and left to the other checks.
// Before the sample, the check plants an inline script with no hash in the front page and fails unless it sees the refusal: a check
// that cannot see a violation passes nothing.
// Usage: node site/scripts/csp-check.mjs [build/client]. Needs a build (npm run build) and Playwright's Chrome.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { serveBuild } from "./serve-build.mjs";

const build = process.argv[2] ?? fileURLToPath(new URL("../build/client/", import.meta.url));
if (!existsSync(join(build, "index.html"))) {
  console.error(`csp-check: no build at ${build}: run npm run build first`);
  process.exit(2);
}

/** The first page built under a folder of the build (`guide` gives `/guide/<first>/`). */
const firstUnder = (folder) => {
  const name = readdirSync(join(build, folder), { withFileTypes: true }).find((d) => d.isDirectory() && existsSync(join(build, folder, d.name, "index.html")))?.name;
  if (!name) throw new Error(`csp-check: no page built under ${folder}/`);
  return `/${folder}/${name}/`;
};
// how Chrome words a refusal in the console
const CSP_LOG = /Content Security Policy/i;
const PLANTED = "<script>window.plantedByCspCheck = 1</script>";

// Runs in the page before its own scripts: keeps every refusal the policy reports.
const listen = () => {
  window.cspRefusals = [];
  document.addEventListener("securitypolicyviolation", (e) => window.cspRefusals.push(`${e.effectiveDirective} refused ${e.blockedURI || "an inline script"}${e.sourceFile ? ` (${e.sourceFile}:${e.lineNumber})` : ""}`));
};
// Runs in the page: resolves once the main thread is idle and two frames have drawn, twice (the page hydrated and drew again).
const settled = () => {
  const once = () => new Promise((done) => requestIdleCallback(() => requestAnimationFrame(() => requestAnimationFrame(() => done())), { timeout: 10000 }));
  return once().then(once);
};

const server = await serveBuild(build);
const base = server.url.replace(/\/$/, "");
const browser = await chromium.launch();
const context = await browser.newContext({ locale: "he-IL", timezoneId: "Asia/Jerusalem", reducedMotion: "reduce" });
await context.addInitScript(listen);

/** Opens a page in a fresh tab, runs `steps` on it, and returns everything refused or broken meanwhile. */
async function visit(path, steps = async () => {}, { plant = false } = {}) {
  const page = await context.newPage();
  const problems = [];
  const other = [];
  page.on("console", (m) => m.type() === "error" && (CSP_LOG.test(m.text()) ? problems : other).push(`console: ${m.text()}`));
  page.on("pageerror", (e) => other.push(`uncaught: ${e.message}`));
  if (plant) {
    await page.route(base + path, async (route) => {
      const res = await route.fetch();
      await route.fulfill({ response: res, body: (await res.text()).replace("</body>", `${PLANTED}</body>`) });
    });
  }
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(settled);
  try {
    await steps(page);
  } catch (e) {
    problems.push(e instanceof Error ? e.message : String(e));
  }
  problems.push(...(await page.evaluate(() => window.cspRefusals)));
  await page.close();
  return { problems, other };
}

let failed = false;
try {
  const planted = await visit("/", async () => {}, { plant: true });
  if (!planted.problems.some((p) => p.startsWith("script-src"))) {
    console.error("csp-check: an inline script with no hash, planted in the front page, was not refused: the policy or the check is broken");
    failed = true;
  }
  // each visit: what it is called, the page it opens, and the steps it takes there before the refusals are read
  const VISITS = [
    {
      name: "/ and a click to a guide page",
      path: "/",
      steps: async (page) => {
        await page.locator(`a[href^="${new URL(server.url).pathname}guide/"]`).first().click();
        await page.waitForURL(/\/guide\//);
        await page.waitForLoadState("networkidle");
        await page.evaluate(settled);
      },
    },
    // the indices with no index named is a page of its own, with its own inline scripts and their hashes
    ...[firstUnder("guide"), "/indices/", firstUnder("companies"), "/no-such-page/"].map((path) => ({ name: path, path })),
    {
      name: "/indices/sp500/ and its worker's figures",
      path: "/indices/sp500/",
      // the result shows once the page's worker has loaded and answered
      steps: async (page) => {
        await page.getByText("נשאר לכם", { exact: true }).first().waitFor({ timeout: 20000 });
      },
    },
    {
      name: "/kit/ and its formula",
      path: "/kit/",
      // KaTeX's own markup appears once its script and stylesheet are in; its fonts load as the formula draws
      steps: async (page) => {
        await page.locator(".katex").first().waitFor({ timeout: 15000 });
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
      },
    },
  ];
  const results = [];
  for (const { name, path, steps } of VISITS) results.push({ name, ...(await visit(path, steps)) });
  for (const { name, problems, other } of results) {
    if (problems.length) {
      failed = true;
      console.error(`csp-check: ${name}`);
      for (const p of problems) console.error(`  ${p}`);
    }
    // an error the policy did not cause is another check's to judge: said, not failed
    for (const p of other) console.log(`csp-check: ${name}, not a refusal: ${p.slice(0, 300)}`);
  }
  if (!failed) console.log(`csp-check: ${results.length} pages ran under their Content Security Policy with nothing refused (the planted script was)`);
} finally {
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
