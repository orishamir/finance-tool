// Runtime checks on a built site: folds keep their own labels, fields commit, the segmented control and the marker answer. usage: node interact.mjs <baseUrl>
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const base = process.argv[2];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, locale: "he-IL" });
const goal = { id: "gfounder", name: "", preset: "none", horizonYears: { value: 20, entered: true }, amountNow: { value: 6000, entered: true }, monthly: { value: 400, entered: true }, available: { value: 0, entered: true }, availableFrom: null, anytime: { value: false, entered: true },
  profile: { age: null, employment: null, salary: null, pension: { employer: null, employee: null }, hishtalmut: { employer: null, employee: null, yearly: null }, hasPension: null, hasHishtalmut: null },
  assumptions: { return: 7, inflation: 2, insurance: null, acceptedFall: null }, exposures: {}, order: 0 };
await ctx.addInitScript((st) => { try { localStorage.setItem("mekor.v2.state", st); } catch {} }, JSON.stringify({ version: 3, goals: [goal], currentId: "gfounder", inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] }));
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", (e) => errs.push(String(e)));
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(ok ? "ok  " : "FAIL", name, extra); };

await page.goto(`${base}/kit`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
// 1. a closed fold inside an open fold keeps its closed label
const nested = page.locator('details:has(> summary:has-text("קופסה חיצונית"))').first();
check("outer fold starts open", await nested.evaluate((d) => d.open));
const inner = nested.locator('details').first();
const innerSummary = inner.locator("summary").first();
check("inner closed label inside an open fold", (await innerSummary.innerText()).includes("הצגת הפרטים") && !(await innerSummary.innerText()).includes("הסתרת"), await innerSummary.innerText());
await innerSummary.click();
await page.waitForTimeout(250);
check("inner label flips when opened", (await innerSummary.innerText()).includes("הסתרת הפרטים"), await innerSummary.innerText());
check("outer label unchanged", (await nested.locator("summary").first().innerText()).includes("קופסה חיצונית"));
await innerSummary.click();
await page.waitForTimeout(250);
check("inner label flips back", (await innerSummary.innerText()).includes("הצגת הפרטים"), await innerSummary.innerText());
// chevron rotation follows the fold's own state
const chev = async (loc) => loc.locator("summary svg").first().evaluate((s) => s.getAttribute("class") || "");
check("closed inner chevron not rotated", !(await chev(inner)).includes("rotate-180"));
await innerSummary.click(); await page.waitForTimeout(200);
check("open inner chevron rotated", (await chev(inner)).includes("rotate-180"));
check("outer chevron still rotated (open)", (await chev(nested)).includes("rotate-180"));

// 2. coverage fold: label switches
const cov = page.locator('details:has(summary:has-text("נבדקו חמש אפשרויות"))').first();
const toggle = cov.locator("summary").first();
check("coverage closed says show", (await toggle.innerText()).includes("הצגת הרשימה"));
await toggle.click(); await page.waitForTimeout(250);
check("coverage open says hide", (await toggle.innerText()).includes("הסתרת הרשימה"), await toggle.innerText());

// 3. number field: typing commits and marks the value as entered
const nf = page.locator('article[aria-label="NumberField"]');
const countEntered = async () => ((await nf.innerText()).match(/הזנתם/g) || []).length;
const before0 = await countEntered();
const field = nf.locator("input").nth(1);
await field.fill("2500"); await page.waitForTimeout(500); await field.blur(); await page.waitForTimeout(300);
check("number field shows the entered state after typing", (await countEntered()) === before0 + 1, `${before0} -> ${await countEntered()}`);

// 4. segmented control
const seg = page.locator('article[aria-label="SegmentedControl"] button').nth(1);
await seg.click();
check("segmented control pressed", (await seg.getAttribute("aria-pressed")) === "true");

// 5. marker answers the keyboard
const marker = page.locator('[role="slider"][aria-label]').first();
const before = await marker.getAttribute("aria-valuenow");
await marker.focus(); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight");
const after = await marker.getAttribute("aria-valuenow");
check("marker moves with the arrow keys", Number(after) === Number(before) + 2, `${before} -> ${after}`);

// 6. the compare page's coverage fold
await page.goto(`${base}/goal/compare`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const s2loc = page.locator('summary:has-text("כל האפשרויות ולמה")').first();
if (await s2loc.count()) {
  const s2 = await s2loc.elementHandle(); // the text changes when it opens, so hold the element, not the text selector
  await s2.scrollIntoViewIfNeeded(); await s2.click(); await page.waitForTimeout(300);
  check("compare coverage toggles its label", (await s2.innerText()).includes("הסתרת הרשימה"), (await s2.innerText()).slice(-30));
  await s2.click(); await page.waitForTimeout(300);
  check("compare coverage toggles back", (await s2.innerText()).includes("כל האפשרויות ולמה"));
} else check("compare coverage present", false);

// 7. the current-account worth-knowing link opens the folded table
await page.goto(`${base}/guide/current-account`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const link = page.locator('a[href="#current-account-banks"]').first();
if (await link.count()) {
  await link.click(); await page.waitForTimeout(500);
  const open = await page.locator("details#current-account-banks").evaluate((d) => d.open);
  check("the link opens the bank table", open);
  check("its chevron turned", (await chev(page.locator("details#current-account-banks"))).includes("rotate-180"));
} else check("worth-knowing link present", false);

// 8. rules page: a group opens and shows rules
await page.goto(`${base}/rules`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const g = page.locator("details[id]").first();
const gs = g.locator("summary").first();
await gs.click(); await page.waitForTimeout(1200);
check("a rules group opens", await g.evaluate((d) => d.open));
check("and holds rule cards", (await g.locator("li").count()) > 0);

console.log("errors:", JSON.stringify(errs.slice(0, 5)));
console.log(results.filter(Boolean).length, "of", results.length, "ok");
await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
