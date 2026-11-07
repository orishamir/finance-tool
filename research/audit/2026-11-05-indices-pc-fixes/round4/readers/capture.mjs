// Screenshots for the round 4 fresh readers (#190): the whole page as it opens, in overlapping screens, then the states after a tap.
//   node readers/capture.mjs <1440|390>
import { ACCOUNTS, BASES, FUNDS, context, launch, load, pickRow, settle } from "../lib.mjs";
const width = Number(process.argv[2] ?? 1440);
const tag = width < 768 ? "phone" : "pc";
const dir = new URL("./shots/", import.meta.url).pathname;
const base = BASES.branch;
const browser = await launch();
const ctx = await context(browser, width);
const page = await ctx.newPage();
const url = `${base}indices/sp500/`;
const shot = (name) => page.screenshot({ path: `${dir}${name}.png` });
const scrollToEl = async (sel, offset = 120) => {
  await page.evaluate(([sel, offset]) => { const el = document.querySelector(sel); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - offset); }, [sel, offset]);
  await settle(page, 900);
};
// the result tiles: the smallest box that holds "הבחירה שלכם", with the plan line above it
const toTiles = async () => {
  await page.evaluate(() => { const t = [...document.querySelectorAll("main div.rounded-lg")].filter((d) => /הבחירה שלכם/.test(d.textContent ?? "")).sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0]; if (t) window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 260); });
  await settle(page, 900);
};
// A: the whole page, screen by screen, each overlapping the one before by 80 px
await load(page, url);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
const vh = page.viewportSize().height;
let i = 0;
for (let y = 0; y < H; y += vh - 80) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await settle(page, 350);
  await shot(`A-open-${tag}-${String(i++).padStart(2, "0")}`);
}
// C: Interactive Brokers tapped in the account list: the tiles, then the tapped row
await load(page, url);
await pickRow(page, ACCOUNTS, "interactive-brokers");
await settle(page, 800);
// centred by the browser itself: on a phone the scroll by offset landed on other rows while the list was still settling
await page.locator(`${ACCOUNTS} > [data-pick-key="interactive-brokers"]`).evaluate((el) => el.scrollIntoView({ block: "center" }));
await settle(page, 1500);
await page.locator(`${ACCOUNTS} > [data-pick-key="interactive-brokers"]`).evaluate((el) => el.scrollIntoView({ block: "center" }));
await settle(page, 900);
await shot(`C-pick-account-abroad-${tag}-2-row`);
await scrollToEl("main h1", 0);
await toTiles();
await shot(`C-pick-account-abroad-${tag}-1-top`);
// D: the iShares fund bought abroad tapped in the fund list: the tapped row, the tiles, and Psagot's grey row with its reason
await load(page, url);
if (width < 768) {
  // on a phone the fund sits behind the fold: open it first, as a reader would
  await page.locator(`${FUNDS} ~ button, ${FUNDS} > button`).first().click().catch(() => {});
  await settle(page, 500);
}
await pickRow(page, FUNDS, "ie00b5bmr087");
await settle(page, 800);
await scrollToEl(`${FUNDS} > [data-pick-key="ie00b5bmr087"]`, vh / 3);
await shot(`D-pick-fund-abroad-${tag}-2-row`);
await toTiles();
await shot(`D-pick-fund-abroad-${tag}-1-top`);
await scrollToEl(`${ACCOUNTS} > [data-pick-key="psagot"]`, vh / 4);
await shot(`D-pick-fund-abroad-${tag}-3-grey-row`);
// G: that row's reason opened
await page.locator(`${ACCOUNTS} > [data-pick-key="psagot"] button[aria-expanded]`).first().click();
await settle(page, 600);
await shot(`G-reason-open-${tag}`);
await browser.close();
console.log("shots:", i, "screens of the whole page");
