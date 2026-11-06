// Before/after crops of the indices page's two lists for the founder's items 4 (a label every row shares goes once, to the group head)
// and 5 (in dense lists the column head carries the number mark; the cells stay plain but still open their calculation).
// Run from the repository root: node research/specs/2026-11-05-indices-visuals/draw45.mjs, then compose45.mjs. It reads the live page.
import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
async function open(url, w = 1440, h = 900) {
  const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  return { browser, page };
}
const OUT = "/home/ori/dev/finance-tool/research/specs/2026-11-05-indices-visuals/rows";
import fs from "fs";
fs.mkdirSync(OUT, { recursive: true });

async function cardH(page, label) {
  return page.evaluate((label) => { const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label); return Math.round((g.closest("[class*='rounded']") ?? g.parentElement).getBoundingClientRect().height); }, label);
}
async function crop(page, label, rows, path) {
  const box = await page.evaluate(([label, rows]) => {
    const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label);
    const card = g.closest("[class*='rounded']") ?? g.parentElement;
    const c = card.getBoundingClientRect();
    const radios = [...g.querySelectorAll("[role=radio]")];
    const last = radios[Math.min(rows, radios.length) - 1].getBoundingClientRect();
    return { x: c.x, y: c.y + scrollY, width: c.width, height: last.bottom - c.top };
  }, [label, rows]);
  await page.screenshot({ path, clip: { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 }, fullPage: true });
}

// item 4: per group of two or more rows, the labels on every row leave the rows and appear once in the group's head;
// a list with no groups puts them at the end of its filter line, after "בכולן:".
async function moveShared(page) {
  return page.evaluate(() => {
    const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === "קרנות על המדד");
    const groups = []; let cur = { head: null, rows: [] };
    for (const el of g.children) {
      if (el.getAttribute("role") === "radio") cur.rows.push(el);
      else if (el.className.includes("bg-popover")) { if (cur.rows.length || cur.head) groups.push(cur); cur = { head: el, rows: [] }; }
    }
    groups.push(cur);
    const chipsOf = (r) => [...(r.querySelector("span[class*=\"md:flex-wrap\"]")?.children ?? [])].filter((c) => c.textContent.trim());
    const all = groups.flatMap((x) => x.rows);
    const has = (r, t) => chipsOf(r).some((c) => c.textContent.trim() === t);
    const texts = [...new Set(all.flatMap((r) => chipsOf(r).map((c) => c.textContent.trim())))];
    const filter = [...document.querySelectorAll("[role=group]")].find((x) => x.getAttribute("aria-label") === "סננו לפי תווית:");
    const tag = (sample) => { const s = document.createElement("span"); s.style.cssText = "display:inline-flex;align-items:center;gap:6px;margin-inline-start:10px;font-weight:400"; s.className = "text-sm text-muted-foreground"; s.append("בכולן:", sample); return s; };
    const take = (rows, t) => { let sample = null; for (const r of rows) for (const c of chipsOf(r)) if (c.textContent.trim() === t) { sample ??= c.cloneNode(true); c.remove(); } return sample; };
    const moved = [];
    for (const t of texts) {
      const on = all.filter((r) => has(r, t));
      if (on.length === all.length && all.length > 1) { const head = document.createElement("div"); head.className = "px-4 py-2 bg-popover border-b border-border text-sm font-semibold"; const inner = document.createElement("span"); inner.style.cssText = "display:flex;align-items:center;gap:6px"; inner.append(`כל ${all.length} הקרנות`, tag(take(all, t))); head.append(inner); all[0].before(head); moved.push({ t, to: "a head over the whole list" }); continue; }
      const gr = groups.find((x) => x.head && x.rows.length && x.rows.every((r) => has(r, t)) && on.length === x.rows.length);
      if (gr) {
        gr.head.firstElementChild.append(tag(take(gr.rows, t)));
        for (const b of filter.querySelectorAll("button")) if (b.textContent.trim().startsWith(t)) b.remove();
        moved.push({ t, to: gr.head.innerText.split("\n")[0], rows: gr.rows.length });
      }
    }
    return moved;
  });
}

// item 5: in the two lists, the cells' dotted underline goes; each column head whose cells are all computed carries it once.
async function headMarks(page) {
  return page.evaluate(() => {
    const done = [];
    for (const label of ["חשבונות ניירות ערך", "קרנות על המדד"]) {
      const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label);
      const head = g.firstElementChild;
      const cols = [...head.children];
      const radios = [...g.querySelectorAll("[role=radio]")];
      // which head column each computed number sits under: by its horizontal centre
      const colBoxes = cols.map((c) => c.getBoundingClientRect());
      const marked = new Set();
      for (const r of radios) for (const n of r.querySelectorAll(".num-computed")) {
        n.style.textDecoration = "none";
        const b = n.getBoundingClientRect(); const x = (b.left + b.right) / 2;
        let best = 0, bd = Infinity;
        colBoxes.forEach((cb, i) => { const d = x < cb.left ? cb.left - x : x > cb.right ? x - cb.right : 0; if (d < bd) { bd = d; best = i; } });
        marked.add(best);
      }
      if (label === "חשבונות ניירות ערך") {
        // the cost under each bar has no head of its own: it gets one, beside the account's name
        const c = cols.find((x) => x.textContent.trim() === "חשבון");
        c.style.whiteSpace = "nowrap";
        c.innerHTML = 'חשבון · <span style="text-decoration:underline dotted;text-decoration-color:var(--computed);text-decoration-thickness:2px;text-underline-offset:4px;color:var(--foreground)">עלות ב־10 שנים</span>';
        marked.delete(cols.indexOf(c));
        done.push(`${label}: חשבון + מה הוא גובה`);
      }
      for (const i of marked) {
        const c = cols[i];
        if (!c.textContent.trim() || c.textContent.trim() === "#") continue;
        c.style.cssText += ";text-decoration:underline dotted;text-decoration-color:var(--computed);text-decoration-thickness:2px;text-underline-offset:4px;color:var(--foreground)";
        done.push(`${label}: ${c.textContent.trim()}`);
      }
      // the one line that says what the mark means, at the list's head
      const note = document.createElement("div");
      note.className = "text-xs text-muted-foreground";
      note.style.cssText = "padding:6px 16px 2px";
      note.innerHTML = '<span style="text-decoration:underline dotted;text-decoration-color:var(--computed);text-decoration-thickness:2px;text-underline-offset:4px">מחושב</span> · כל מספר ברשימה נפתח לחישוב שלו בלחיצה';
      head.before(note);
    }
    return done;
  });
}

for (const [slug, tag] of [["sp500", "sp"], ["ta125", "ta"]]) {
  const { browser, page } = await open("https://orishamir.github.io/finance-tool/indices/" + slug);
  await page.waitForSelector("[role=radiogroup]", { timeout: 20000 });
  await page.waitForTimeout(600);
  const h0 = await cardH(page, "קרנות על המדד");
  await crop(page, "קרנות על המדד", 6, `${OUT}/4-${tag}-before.png`);
  const m = await moveShared(page);
  console.log(tag, "moved", JSON.stringify(m));
  await page.waitForTimeout(200);
  await crop(page, "קרנות על המדד", 6, `${OUT}/4-${tag}-after.png`);
  console.log(tag, "fund list height", h0, "->", await cardH(page, "קרנות על המדד"));
  await browser.close();
}
{
  const { browser, page } = await open("https://orishamir.github.io/finance-tool/indices/sp500");
  await page.waitForSelector("[role=radiogroup]", { timeout: 20000 });
  await page.waitForTimeout(600);
  const a0 = await cardH(page, "חשבונות ניירות ערך"), f0 = await cardH(page, "קרנות על המדד");
  await crop(page, "חשבונות ניירות ערך", 6, `${OUT}/5-accounts-before.png`);
  await crop(page, "קרנות על המדד", 6, `${OUT}/5-funds-before.png`);
  console.log("heads", JSON.stringify(await headMarks(page)));
  await page.waitForTimeout(200);
  await crop(page, "חשבונות ניירות ערך", 6, `${OUT}/5-accounts-after.png`);
  await crop(page, "קרנות על המדד", 6, `${OUT}/5-funds-after.png`);
  console.log("item 5 heights: accounts", a0, "->", await cardH(page, "חשבונות ניירות ערך"), "funds", f0, "->", await cardH(page, "קרנות על המדד"));
  await browser.close();
}
