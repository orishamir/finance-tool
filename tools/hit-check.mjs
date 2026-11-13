// Hit check (ground rule 8: 44 px touch targets). Measures what a finger can actually hit, not the box a control draws: for every
// visible control on a page (a button, a link, a fold's summary, a field, a select, anything with role=button) it brings the control
// onto the screen and, at its horizontal middle, walks up and down from its middle a pixel at a time while the point still lands on the
// control (`elementFromPoint`, which counts a ::before or ::after area as its owner's, and a field's own <label> as the field's). A
// control whose hit span is under 44 px is listed, with its drawn height beside it. A chip that draws 24 px but carries a 48 px area
// passes; an area another element covers does not.
//
//   BASE=http://127.0.0.1:4173/finance-tool node tools/hit-check.mjs "/deal/?wrapper=kupat-gemel-lehashkaa" phone,pc
//
// Served with `node site/scripts/serve-build.mjs site/build/client --port 4173`. `--all` lists every control with its span.
//
// `--checks` is the check (fix pass 8, 2026-11-07: value pencils at 24 to 35 px, rule chips at 36 to 42 and the guide's section index at
// 43 px got past guard 22, which reads classes): every guide page in site/build/client/guide and the fee pages of the provident fund for
// investing and the study fund, at 390 and 1280. It fails on any control under 44 px that hit-leftovers.json does not list for that page
// and width, and on a listed one that is now 44 px or gone, which is struck: the list only shrinks. box-check.mjs runs it after its own
// checks (`--no-hit` skips it).
// A link, a figure or a term inside running text (a <p> or <li> line with words of its own around it) is left out, as guard 19 leaves a
// figure in text: its line is the text's line height, and the 44 px rule is for controls that stand alone (design-system 2.5).
// A figure's or a month's field is measured by its box, which takes a press anywhere in it for the field (the kit's `focusInBox`).
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const args = process.argv.slice(2);
const all = args.includes("--all");
const checks = args.includes("--checks");
const repo = fileURLToPath(new URL("../", import.meta.url));
const LEFT = fileURLToPath(new URL("./hit-leftovers.json", import.meta.url));
const guidePages = () => {
  const dir = `${repo}site/build/client/guide/`;
  return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`${dir}${d.name}/index.html`)).map((d) => `/guide/${d.name}`).sort() : [];
};
let [paths = "/", widths = "phone"] = args.filter((a) => !a.startsWith("--"));
if (checks) {
  paths = [...guidePages(), "/deal/?wrapper=kupat-gemel-lehashkaa", "/deal/?wrapper=keren-hishtalmut"].join(",");
  widths = "phone,pc";
}
/** page@width → names of the controls still under 44 px, by the name the check prints. */
const leftovers = checks && existsSync(LEFT) ? JSON.parse(readFileSync(LEFT, "utf8")) : {};
const seen = {};
const VIEW = { phone: { width: 390, height: 844, hasTouch: true }, pc: { width: 1280, height: 900 }, desk: { width: 1440, height: 900 } };
const MIN = 44;

const browser = await chromium.launch({ executablePath: CHROME });
let failures = 0;
for (const path of paths.split(",")) {
  for (const w of widths.split(",")) {
    const v = VIEW[w];
    const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, hasTouch: !!v.hasTouch });
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const count = await page.evaluate(() => {
      const sel = "button, a[href], summary, input:not([type=hidden]), select, textarea, [role=button]";
      const els = [...document.querySelectorAll(sel)].filter((e) => e.checkVisibility({ visibilityProperty: true, opacityProperty: false }) && !e.closest("[aria-hidden=true], .invisible, .sr-only, svg"));
      els.forEach((e, i) => e.setAttribute("data-hit", String(i)));
      return els.length;
    });
    const rows = [];
    for (let i = 0; i < count; i++) {
      const row = await page.evaluate(
        ({ i, MIN }) => {
          const e = document.querySelector(`[data-hit="${i}"]`);
          if (!e) return null;
          const r0 = e.getBoundingClientRect();
          if (r0.width === 0 || r0.height === 0) return null;
          // a link in running text: words of its own line around it (left out, as a figure in text is)
          // a link, a figure or a term inside running text: words of its own line around it (left out, as guard 19 leaves a figure in
          // text, whose area the line above or below may share)
          // the line is the nearest box that lays out text: a <p>, <li>, <dd> or <td>, or any block (a callout's sentence is a <div>); a flex
          // or grid row is not running text, its items stand alone
          let line = e.parentElement;
          while (line && getComputedStyle(line).display.startsWith("inline")) line = line.parentElement;
          if (line && !line.matches("p, li, dd, td") && !["block", "list-item", "table-cell"].includes(getComputedStyle(line).display)) line = null;
          if (line && line !== e && getComputedStyle(e).display.startsWith("inline") && (e.tagName === "A" || e.matches(".num, .term"))) {
            const own = (e.textContent ?? "").trim();
            const rest = (line.textContent ?? "").replace(own, "").trim();
            if (rest.length > 12) return null;
          }
          e.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
          const r = e.getBoundingClientRect();
          const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1);
          const y0 = r.top + r.height / 2;
          const labels = e.id ? [...document.querySelectorAll(`label[for="${CSS.escape(e.id)}"]`)] : [];
          // a figure's or a month's field (the kit's FigureField and MonthField, `input[data-figure]`) sits in a 44 px box that passes a
          // press anywhere in it to the field (`focusInBox`), so the box is the field's, all but a choice or a button in it, which keeps
          // its own press; the input itself is only its text line
          const box = e.matches("input[data-figure]") ? e.parentElement : null;
          const ownPress = (n) => {
            const c = n.closest("select, button, a");
            return !!c && box.contains(c);
          };
          const mine = (n) => !!n && (n === e || e.contains(n) || labels.some((l) => l === n || l.contains(n)) || (n.tagName === "LABEL" && n.contains(e)) || (!!box && box.contains(n) && !ownPress(n)));
          if (!mine(document.elementFromPoint(x, y0))) {
            const top = document.elementFromPoint(x, y0);
            return { i, name: (e.getAttribute("aria-label") || e.textContent || e.value || e.tagName).trim().replace(/\s+/g, " ").slice(0, 50), tag: e.tagName.toLowerCase(), drawn: Math.round(r.height), span: 0, covered: top ? `${top.tagName.toLowerCase()}.${String(top.className).split(" ")[0]}` : "nothing" };
          }
          let up = 0;
          while (up < 60 && mine(document.elementFromPoint(x, y0 - up - 1))) up++;
          let down = 0;
          while (down < 60 && mine(document.elementFromPoint(x, y0 + down + 1))) down++;
          const span = up + down + 1;
          return { i, name: (e.getAttribute("aria-label") || e.textContent || e.value || e.tagName).trim().replace(/\s+/g, " ").slice(0, 50), tag: e.tagName.toLowerCase(), drawn: Math.round(r.height), span, short: span < MIN };
        },
        { i, MIN },
      );
      if (row) rows.push(row);
    }
    const short = rows.filter((r) => r.span < MIN);
    const key = `${path}@${v.width}`;
    const allowed = checks ? leftovers[key] ?? [] : [];
    seen[key] = short.map((r) => r.name);
    const fresh = short.filter((r) => !allowed.includes(r.name));
    failures += fresh.length;
    console.log(`\n${path} at ${v.width}: ${rows.length} controls, ${short.length} with a hit span under ${MIN} px${checks ? `, ${short.length - fresh.length} of them listed` : ""}`);
    for (const r of all ? rows : short) console.log(`  ${r.span < MIN ? (allowed.includes(r.name) ? "LISTED" : "SHORT") : "ok   "} ${r.tag} "${r.name}": hit ${r.span} px, drawn ${r.drawn} px${r.covered ? `, covered by ${r.covered}` : ""}`);
    await page.close();
  }
}
await browser.close();
if (checks) {
  // a listed control that is now 44 px or gone is struck: the list only shrinks
  const struck = Object.entries(leftovers).flatMap(([k, names]) => names.filter((n) => !(seen[k] ?? []).includes(n)).map((n) => `${k} "${n}"`));
  for (const x of struck) console.log(`  STRIKE from hit-leftovers.json: ${x}`);
  failures += struck.length;
  console.log(`\nhit check: ${failures ? `${failures} to fix or strike` : "every control at 44 px or listed"}`);
}
process.exit(failures > 0 ? 1 : 0);
