// Checks that variants work, on a computer and on a phone. Free (no session is started); about three minutes.
//
//   node research/user-lab/tools/variant-test.mjs [out-folder] [--url <page>] [--only pc|phone]
//
// 1. Control: the page with the "control" variant (no change, but every piece of the machinery in place) is the same,
//    pixel for pixel, as the page with no variant, on every screen-high slice.
// 2. Every kind of change shows ("selftest" variant), through the same act.mjs driver a session uses, and still shows
//    after moving a slider, typing into a field and moving to another index's page.
// 3. A session's own act.mjs (the copy with the lab lines cut out) cannot reach the lab's commands.
// 4. A whole build: the site served from this checkout's site/build/client, at the live address.
// 5. The example planted variant shows all its changes.
// Writes <out>/report.md (default out: /tmp/claude-1000/variant-test) with the screenshots it compared, and a copy of
// the report to research/user-lab/runs/variant-test/report.md. Exits 1 if anything failed.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { CHROME, PLAYWRIGHT, sessionAct } from "./lib/session.mjs";
import { LAB, capture, labBrowser, loadVariant } from "./lib/variant.mjs";
import { serveBuild } from "./serve-build.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i < 0 ? d : args.splice(i, 2)[1];
};
const URL0 = opt("url", "https://orishamir.github.io/finance-tool/indices/sp500");
const only = opt("only", null);
// the screenshots go outside the repository by default; the folder is added to, never emptied
const OUT = resolve(args[0] || "/tmp/claude-1000/variant-test");
mkdirSync(OUT, { recursive: true });
const devices = only ? [only] : ["pc", "phone"];
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `: ${detail}` : ""}`);
};

// ---------------------------------------------------------------- pixel comparison, in a browser canvas
const { chromium } = createRequire(PLAYWRIGHT)("playwright");
const cmpBrowser = await chromium.launch({ executablePath: CHROME });
const cmpPage = await cmpBrowser.newPage();
async function pixelDiff(a, b) {
  const da = `data:image/png;base64,${readFileSync(a).toString("base64")}`;
  const db = `data:image/png;base64,${readFileSync(b).toString("base64")}`;
  return cmpPage.evaluate(
    async ([da, db]) => {
      const load = (src) => new Promise((ok, no) => Object.assign(new Image(), { onload() { ok(this); }, onerror: no, src }));
      const [ia, ib] = await Promise.all([load(da), load(db)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return { size: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`, diff: -1 };
      const px = (img) => {
        const c = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height });
        const x = c.getContext("2d");
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, img.width, img.height).data;
      };
      const pa = px(ia),
        pb = px(ib);
      let diff = 0;
      for (let i = 0; i < pa.length; i += 4) if (pa[i] !== pb[i] || pa[i + 1] !== pb[i + 1] || pa[i + 2] !== pb[i + 2] || pa[i + 3] !== pb[i + 3]) diff++;
      return { size: `${ia.width}x${ia.height}`, diff, of: pa.length / 4 };
    },
    [da, db],
  );
}

const lines = (s) => s.split("\n");
const statusOf = async (b) => JSON.parse(await b.send(["__status"]));
const shotOf = (answer) => (answer.match(/^screenshot: (\S+)/m) || [])[1];

for (const device of devices) {
  // ---------------------------------------------------------- 1. control = live, pixel for pixel
  const plain = await capture({ url: URL0, device, out: join(OUT, device, "plain") });
  const control = await capture({ url: URL0, device, variant: "control", out: join(OUT, device, "control") });
  let worst = 0;
  const per = [];
  if (plain.names.length !== control.names.length) worst = -1;
  else
    for (const n of plain.names) {
      const d = await pixelDiff(join(OUT, device, "plain", n), join(OUT, device, "control", n));
      per.push(`${n} ${d.diff}`);
      if (d.diff !== 0) worst = d.diff < 0 ? -1 : Math.max(worst, d.diff);
    }
  check(`${device}: control variant is identical to the live page`, worst === 0, `${plain.names.length} slices; differing pixels per slice: ${per.map((p) => p.split(" ")[1]).join(", ")}`);

  // ---------------------------------------------------------- 2. every kind of change, through act.mjs, and it survives use
  const dir = mkdtempSync("/tmp/claude-1000/ws/t-");
  const log = join(OUT, device, "selftest.jsonl");
  const b = await labBrowser(dir, { device, variant: "selftest", log, config: { maxActions: 0, deadline: 0 } });
  try {
    const opened = await b.send(["open", URL0, device]);
    const st = await statusOf(b);
    const missing = [...st.changes.filter((c) => c.live === 0), ...st.data.filter((d) => d.served === 0)].map((c) => c.id);
    check(`${device}: every kind of change shows after opening`, missing.length === 0 && st.errors.length === 0, missing.length ? `not showing: ${missing.join(", ")}` : `${st.changes.length + st.data.length} changes${st.errors.length ? `; errors: ${st.errors.join("; ")}` : ""}`);
    check(`${device}: the address is the live one`, lines(opened).some((l) => l.startsWith("page:") && l.includes(URL0.replace(/^https?:\/\//, ""))), lines(opened).find((l) => l.startsWith("page:")));
    const has = async (...w) => lines(await b.send(["__has", ...w]));
    const [h1, newLine, years, oldYears, paid, dollar, note] = await has("כותרת אחרת לגמרי", "שורה שלא הייתה בדף", "יהיה לכם אחרי 10 שנים", "נשאר לכם בעוד", "71,234", "3.56", "אפשר להחזיק אותו גם דרך קרן חוץ");
    check(`${device}: text, number, insert and data show; hidden text is gone`, [h1, newLine, years, paid, dollar].every((x) => x === "yes") && oldYears === "no" && note === "no", `title ${h1}, inserted ${newLine}, years line ${years}, old words ${oldYears}, 71,234 ${paid}, dollar 3.56 ${dollar}, hidden note ${note}`);
    const shotOpen = shotOf(opened);
    // the same state with no variant, to see that the change is on the screenshot
    const pdir = mkdtempSync("/tmp/claude-1000/ws/t-");
    const pb = await labBrowser(pdir, { device, config: { maxActions: 0, deadline: 0 } });
    const pOpened = await pb.send(["open", URL0, device]);
    const d0 = await pixelDiff(join(dir, shotOpen), join(pdir, shotOf(pOpened)));
    check(`${device}: the screenshot shows the changes`, d0.diff > 1000, `${d0.diff} pixels differ from the live page's first screen`);
    execFileSync("cp", [join(dir, shotOpen), join(OUT, device, "selftest-open.png")]);
    execFileSync("cp", [join(pdir, shotOf(pOpened)), join(OUT, device, "live-open.png")]);
    await pb.quit();

    // a slider
    const slid = await b.send(["slider", "שנים", "20"]);
    let [y20, y10, h1b, ins] = await has("יהיה לכם אחרי 20 שנים", "נשאר לכם בעוד", "כותרת אחרת לגמרי", "שורה שלא הייתה בדף");
    let st2 = await statusOf(b);
    let gone = st2.changes.filter((c) => c.live === 0 && c.id !== "paid-in").map((c) => c.id);
    check(`${device}: after moving a slider (years to 20) the changes still show`, y20 === "yes" && y10 === "no" && h1b === "yes" && ins === "yes" && gone.length === 0, `years line follows the slider ${y20}, old words ${y10}, title ${h1b}, inserted ${ins}${gone.length ? `, not showing: ${gone.join(", ")}` : ""}`);
    execFileSync("cp", [join(dir, shotOf(slid)), join(OUT, device, "selftest-slider.png")]);

    // typing into a field
    const typed = await b.send(["fill", "הפקדה חודשית", "750"]);
    [y20, h1b, ins] = await has("יהיה לכם אחרי 20 שנים", "כותרת אחרת לגמרי", "שורה שלא הייתה בדף");
    st2 = await statusOf(b);
    gone = st2.changes.filter((c) => c.live === 0 && c.id !== "paid-in").map((c) => c.id);
    check(`${device}: after typing 750 into a field the changes still show`, y20 === "yes" && h1b === "yes" && ins === "yes" && gone.length === 0, gone.length ? `not showing: ${gone.join(", ")}` : "all showing");
    execFileSync("cp", [join(dir, shotOf(typed)), join(OUT, device, "selftest-typed.png")]);

    // the number change follows the figure: back to 500 a month and 10 years, 70,000 shows as 71,234 again
    await b.send(["fill", "הפקדה חודשית", "500"]);
    await b.send(["slider", "שנים", "10"]);
    const [paid2, real] = await has("71,234", "70,000");
    check(`${device}: a changed number comes back when the figure does`, paid2 === "yes" && real === "no", `71,234 ${paid2}, 70,000 ${real}`);

    // another page of the same kind, reached without loading (the site's own navigation)
    const nav = await b.send(["click", 'נאסד"ק 100']);
    const [h1c, ins2] = await has("כותרת אחרת לגמרי", "שורה שלא הייתה בדף");
    check(`${device}: after moving to another index's page the changes still show`, h1c === "yes" && ins2 === "yes", `${lines(nav).find((l) => l.startsWith("page:"))}; title ${h1c}, inserted ${ins2}`);
  } finally {
    await b.quit();
  }

  // ---------------------------------------------------------- 3. a session's copy cannot reach the lab
  writeFileSync(join(dir, "act.mjs"), sessionAct());
  const b2 = await labBrowser(dir, { device, variant: "selftest", log: join(OUT, device, "probe.jsonl"), config: { maxActions: 0, deadline: 0 } });
  const env = { ...process.env, ACT_PLAYWRIGHT: PLAYWRIGHT, ACT_CHROME: CHROME };
  const probe = ["__status", "__has", "__slices"].map((c) => execFileSync(process.execPath, ["act.mjs", c, "/tmp/claude-1000/ws/x"], { cwd: dir, env, encoding: "utf8" }).trim());
  check(`${device}: a session's act.mjs cannot use the lab's commands`, probe.every((p) => /^Unknown command/.test(p)), probe.map((p) => p.split("\n")[0].slice(0, 40)).join(" | "));
  await b2.quit();
  await new Promise((r) => setTimeout(r, 300));
  rmSync(dir, { recursive: true, force: true });

  // ---------------------------------------------------------- 5. the example planted variant
  const plant = await capture({ url: URL0, device, variant: "plant-fees-look-alike", out: join(OUT, device, "plant-fees-look-alike") });
  check(`${device}: the example planted variant shows all its changes`, plant.summary.neverShown.length === 0, plant.summary.changes.map((c) => `${c.id} on ${c.applied} of ${c.shots}`).join(", "));
}

// ---------------------------------------------------------------- 4. a whole build at the live address
const buildDir = resolve(LAB, "..", "..", "site", "build", "client");
if (existsSync(join(buildDir, "404.html"))) {
  const srv = await serveBuild(buildDir);
  const vdir = mkdtempSync("/tmp/claude-1000/ws/v-");
  writeFileSync(join(vdir, "variant.json"), JSON.stringify({ id: "local-build", build: srv.url, changes: [{ type: "text", selector: "h1", set: "מהבנייה המקומית" }] }));
  const dir = mkdtempSync("/tmp/claude-1000/ws/t-");
  const b = await labBrowser(dir, { device: "pc", variant: loadVariant(vdir), log: join(OUT, "build.jsonl"), config: { maxActions: 0, deadline: 0 } });
  const opened = await b.send(["open", URL0, "pc"]);
  const [h1] = lines(await b.send(["__has", "מהבנייה המקומית"]));
  const st = await statusOf(b);
  check("pc: a whole build served locally, at the live address", srv.hits.n > 5 && h1 === "yes" && !st.routeErrors, `${srv.hits.n} requests answered by the local build; ${lines(opened).find((l) => l.startsWith("page:"))}; change on it ${h1}${st.routeErrors ? `; errors ${st.routeErrors.join("; ")}` : ""}`);
  execFileSync("cp", [join(dir, shotOf(opened)), join(OUT, "build-open.png")]);
  await b.quit();
  await srv.close();
  await new Promise((r) => setTimeout(r, 300));
  rmSync(dir, { recursive: true, force: true });
  rmSync(vdir, { recursive: true, force: true });
} else check("pc: a whole build served locally", false, `no build at ${buildDir} (npm run build -w site)`);

await cmpBrowser.close();
const failed = results.filter((r) => !r.ok);
const report = `# Variant test, ${new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jerusalem" }).slice(0, 16)} (Israel time)\n\nPage: ${URL0}\n\n| | Check | Detail |\n|---|---|---|\n${results.map((r) => `| ${r.ok ? "pass" : "**FAIL**"} | ${r.name} | ${String(r.detail).replace(/\|/g, "/")} |`).join("\n")}\n\n${failed.length ? `${failed.length} failed.` : "All passed."}\n`;
writeFileSync(join(OUT, "report.md"), report);
// the report (not the screenshots, about 13 MB) is kept in the lab
mkdirSync(join(LAB, "runs", "variant-test"), { recursive: true });
writeFileSync(join(LAB, "runs", "variant-test", "report.md"), report);
console.log(`${results.length - failed.length} of ${results.length} passed; ${join(OUT, "report.md")} (and runs/variant-test/report.md)`);
process.exit(failed.length ? 1 : 0);
