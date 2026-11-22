// The response check (guidelines/code.md, "Tests": the main flows are timed on a processor slowed four times). On a phone's screen, with
// Chrome slowing the processor four times (browser.mjs `slowDown`, as tools/first-tap.mjs does), each flow below drags a slider with a
// finger (Chrome's Input.dispatchTouchEvent: Playwright's touchscreen only taps) and types a number into a field key by key, then Enter.
// The page reports through PerformanceObserver:
//   Event Timing entries (`event`) time each tap and key from the finger or the key to the frame that shows its answer;
//   long animation frames (`long-animation-frame`, each frame over 50 ms) time the finger's moves, which Event Timing leaves out: a frame
//   that a move waited for, from the move to the frame's end;
//   layout-shift entries name what moved on the page.
// A step fails on a tap, a key or a move answered over 100 ms after it (design.md), and a drag fails on any layout shift between the
// finger going down and coming up, and on a drag that moves its slider through fewer than three values (it measured nothing). A flow that
// names a figure (`follows`) also fails a step whose control ended on another value while the figure, read at rest before and after,
// stayed the same: a page that answers fast because its result never follows the input passes nothing.
//
// Usage: node site/scripts/response-check.mjs [page path...]   e.g. /indices/sp500
// Without paths: every flow below. Needs a build (npm run build). Exits 1 when a step fails.
// response-check-leftovers.json lists what failed when the check came in, each with why and the worst value measured for it (`worst`: ms
// for an input or a move, the shifts' sum for a shift): a listed finding is reported, not failed, until it measures over twice its worst,
// so a listed step still catches a large regression; a new one fails. A listed one no longer found is said, so the list can shrink.
// A page that does not come to rest before a step is measured fails the check: what it measured was taken on a page still changing.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { newContext, slowDown, waitSettled } from "./browser.mjs";
import { serveBuild } from "./serve-build.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const build = join(here, "../build/client");
if (!existsSync(join(build, "index.html")) && !existsSync(join(build, "404.html"))) {
  console.error(`no build at ${build}: run npm run build first`);
  process.exit(2);
}

/** The longest an input may take, from the finger or key to the frame that answers it (design.md: under 100 ms). */
const LIMIT_MS = 100;
/** How much slower than this machine's processor the phone is. */
const CPU_SLOWDOWN = 4;
/** How far over a leftover's worst value a listed finding may measure before it fails. */
const LEFTOVER_ROOM = 2;
const dealFile = join(here, "layout-check-deal.txt");
const dealPath = existsSync(dealFile) ? readFileSync(dealFile, "utf8").trim() : null;

/**
 * The flows. `slider` and `field` count the visible sliders (role=slider: the kit's range fields and a chart's marker) and the visible
 * number fields (inputmode numeric or decimal) in the page's main part, from 0; `text` is what is typed into the field. `follows` is the
 * words that label a figure the steps must change: the figure is the element right after the first visible element with those words alone.
 * `open` names a button a person taps first to bring the slider and the field into sight (a knob tile, whose popup holds them).
 */
const FLOWS = [
  // an index page, opened on its default index: the plan's amount tile tapped open, then the slider and the box in its popup, typed as a
  // number the drag (which ends on the slider's middle, 250,000) does not leave, so the figure must change at both steps
  { name: "the index page", path: "/indices/sp500", open: "סכום היום", slider: 0, field: 0, text: "180000", follows: "נשאר לכם" },
  // the fee page's filled deal (layout-check-deal.txt): the chart's size of a trade, and a fee's figure
  ...(dealPath ? [{ name: "the fee page's deal", path: dealPath, slider: 0, field: 0, text: "0.25" }] : []),
  // a guide page whose chart answers a slider and a field
  { name: "the government bond guide", path: "/guide/government-bond", slider: 0, field: 0, text: "50000" },
];
const named = process.argv.slice(2);
const flows = named.length ? FLOWS.filter((f) => named.some((p) => f.path.startsWith(p))) : FLOWS;
const leftovers = JSON.parse(readFileSync(join(here, "response-check-leftovers.json"), "utf8")).leftovers;
// a leftover with no worst value could never fail (a comparison with NaN is false), so the file itself is refused
const unbounded = leftovers.filter((l) => typeof l.worst !== "number" || !(l.worst > 0));
if (unbounded.length) {
  console.error(`response-check: leftovers with no positive "worst" value: ${unbounded.map((l) => `${l.flow} / ${l.step} / ${l.check}`).join("; ")}`);
  process.exit(1);
}
const listed = (flow, f) => leftovers.find((l) => l.flow === flow.name && l.step === f.step && l.check === f.check);
/** A listed finding that measures over LEFTOVER_ROOM times its leftover's worst value: listed, but failed. */
const beyond = (l, f) => typeof f.value === "number" && f.value > LEFTOVER_ROOM * l.worst;
/** How many times a page did not come to rest before a step; `waitSettled` names each. */
let restless = 0;
const rest = async (page) => {
  if (!(await waitSettled(page, 30_000))) restless++;
};

const t0 = Date.now();
const server = await serveBuild(build, { port: 0 });
const base = server.url.replace(/\/$/, "");
const browser = await chromium.launch();
// each kind of finding must be caught on a page with that fault planted before a pass on the site counts
const missed = await selfTest();
const results = [];
for (const flow of flows) results.push({ flow, steps: await runFlow(flow) });
await browser.close();
await server.close();

let failed = missed.length + restless;
for (const m of missed) console.log(`FAIL  self-test: ${m}`);
let known = 0;
const used = new Set();
for (const { flow, steps } of results) {
  for (const s of steps) {
    const fresh = s.findings.filter((f) => {
      const l = listed(flow, f);
      if (l) used.add(l);
      return !l || beyond(l, f);
    });
    known += s.findings.length - fresh.length;
    failed += fresh.length;
    console.log(`${fresh.length ? "FAIL " : s.findings.length ? "LIST " : "PASS "} ${flow.name} (${flow.path.slice(0, 40)}), ${s.step}: ${s.summary}`);
    for (const f of s.findings) {
      const l = listed(flow, f);
      const over = l && beyond(l, f) ? ` (over ${LEFTOVER_ROOM}× its listed worst, ${l.worst})` : "";
      console.log(`      ${l ? "listed " : ""}${f.check}: ${f.detail}${over}`);
    }
  }
}
if (!named.length) for (const l of leftovers.filter((l) => !used.has(l))) console.log(`GONE  ${l.flow}, ${l.step}, ${l.check}: no longer found; remove it from response-check-leftovers.json`);
console.log(
  `\n${restless ? `${restless} times a page did not come to rest before a step; ` : ""}${failed ? `${failed} failed` : "all passed"}${known ? ` (${known} listed in response-check-leftovers.json)` : ""}: ${many(flows.length, "flow")} on a 390 px phone, processor slowed ${CPU_SLOWDOWN}×, inputs under ${LIMIT_MS} ms and no layout shift while dragging; ${((Date.now() - t0) / 1000).toFixed(0)} s`,
);
process.exit(failed ? 1 : 0);

/**
 * The government bond guide's flow with three faults planted in the page: a key that keeps the page busy for 150 ms, a finger's move that
 * does the same, and a block right above the slider that grows at each move. Returns the kinds of finding the flow did not catch.
 */
async function selfTest() {
  const flow = FLOWS.find((f) => f.path === "/guide/government-bond");
  const steps = await runFlow(flow, () => {
    const busy = () => {
      const t = performance.now();
      while (performance.now() - t < 150);
    };
    document.addEventListener("keydown", busy, { capture: true });
    document.addEventListener("touchmove", busy, { capture: true, passive: true });
    // right above the slider, on the screen: one above it would be out of sight, where the browser keeps what is seen in place
    const grow = Object.assign(document.createElement("div"), { id: "planted-shift" });
    document.querySelector("main [role=slider], main input[type=range]")?.before(grow);
    document.addEventListener("touchmove", () => (grow.style.height = `${grow.offsetHeight + 12}px`), { capture: true, passive: true });
  });
  const caught = new Set(steps.flatMap((s) => s.findings.map((f) => `${s.step}: ${f.check}`)));
  const want = { "type in a field: input": "a key that keeps the page busy for 150 ms", "drag a slider: move": "a finger's move that keeps the page busy for 150 ms", "drag a slider: shift": "a block that grows above the slider while the finger drags" };
  return Object.entries(want).filter(([k]) => !caught.has(k)).map(([, what]) => `the check did not catch ${what}, planted on ${flow.path}`);
}

/**
 * One flow on a fresh page: its slider dragged, then its field typed into, after `plant` runs in the page (the self-test's faults).
 * Returns each step's findings and a line that sums it up.
 */
async function runFlow(flow, plant) {
  const ctx = await newContext(browser, { viewport: { width: 390, height: 844 }, colorScheme: "dark", hasTouch: true, isMobile: true });
  await ctx.addInitScript(observe);
  const page = await ctx.newPage();
  await page.goto(base + flow.path, { waitUntil: "networkidle" });
  await rest(page);
  if (plant) await page.evaluate(plant);
  const cdp = await slowDown(page, { cpu: CPU_SLOWDOWN });
  const steps = [];
  if (flow.open) {
    const opener = page.locator("main").getByRole("button", { name: flow.open }).first();
    if (!(await opener.count())) steps.push({ step: "open", summary: "no button", findings: [{ step: "open", check: "missing", detail: `no button "${flow.open}" on the page` }] });
    else {
      await opener.tap();
      await rest(page);
    }
  }
  const sliders = page.locator("main").getByRole("slider").locator("visible=true");
  const fields = page.locator('main input:is([inputmode="numeric"], [inputmode="decimal"])').locator("visible=true");
  const slider = sliders.nth(flow.slider);
  if (!(await slider.count())) steps.push({ step: "drag a slider", summary: "no slider", findings: [{ step: "drag a slider", check: "missing", detail: `no visible slider number ${flow.slider + 1} on the page` }] });
  else steps.push(await followed(page, flow, () => drag(page, cdp, slider)));
  const field = fields.nth(flow.field);
  if (!(await field.count())) steps.push({ step: "type in a field", summary: "no field", findings: [{ step: "type in a field", check: "missing", detail: `no visible number field number ${flow.field + 1} on the page` }] });
  else steps.push(await followed(page, flow, () => typeIn(page, field, flow.text)));
  await ctx.close();
  return steps;
}

/**
 * A step run with the flow's figure (`follows`) read before it and after it, the page at rest both times: a finding when the step's control
 * ended on another value and the figure did not change, or when the figure is not on the page. A flow with no figure runs the step alone.
 */
async function followed(page, flow, run) {
  if (!flow.follows) return run();
  const before = await figureOf(page, flow.follows);
  const result = await run();
  const after = await figureOf(page, flow.follows);
  const { step, control } = result;
  // a field shows its number with thousands separators while it is not being typed in, and as typed after Enter
  const number = (v) => String(v).replace(/[^\d.-]/g, "");
  if (before === null || after === null) result.findings.push({ step, check: "missing", detail: `no figure labelled "${flow.follows}" on the page` });
  else if (number(control.from) !== number(control.to) && before === after) result.findings.push({ step, check: "stale", detail: `"${flow.follows}" stayed ${after} while the control went from ${control.from} to ${control.to}` });
  else result.summary += `; "${flow.follows}" ${before === after ? `stayed ${after}, the control back on ${control.to}` : `went from ${before} to ${after}`}`;
  return result;
}

/** The text of the first element with a digit right after the first visible element in the page's main part whose own text is `label`, or right after one of its two nearest boxes; null with none. */
function figureOf(page, label) {
  return page.evaluate((label) => {
    const el = [...document.querySelectorAll("main *")].find((e) => e.children.length === 0 && e.textContent.trim() === label && e.checkVisibility());
    // the figure follows the label, or the label's own box where a mark ("?") stands beside the label inside it
    for (let n = el, up = 0; n && up < 3; n = n.parentElement, up++) {
      const next = n.nextElementSibling?.textContent.trim();
      if (next && /\d/.test(next)) return next;
    }
    return null;
  }, label);
}

/** A finger on the slider, moved across the screen and back in small steps, then lifted. */
async function drag(page, cdp, slider) {
  const step = "drag a slider";
  const name = await accessibleName(slider);
  await slider.scrollIntoViewIfNeeded();
  await rest(page);
  const b = await slider.boundingBox();
  const vw = page.viewportSize().width;
  const y = Math.round(b.y + b.height / 2);
  const x0 = Math.round(b.x + b.width / 2);
  const way = [...line(x0, Math.round(vw * 0.85)), ...line(Math.round(vw * 0.85), Math.round(vw * 0.15)), ...line(Math.round(vw * 0.15), x0)];
  const value = () => slider.evaluate((e) => e.getAttribute("aria-valuenow") ?? e.value);
  const before = await value();
  const start = await now(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
  const seen = new Set([before]);
  for (const x of way) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    seen.add(await value());
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const end = await now(page);
  await rest(page);
  const { events, shifts, frames } = await taken(page, start);
  const late = frames.filter((f) => f.event <= end && f.latency > LIMIT_MS).map((f) => f.latency);
  const during = shifts.filter((s) => s.start <= end);
  const findings = slowInputs(step, events);
  if (late.length) findings.push({ step, check: "move", value: Math.max(...late), detail: `${many(late.length, "frame")} answered the finger's moves over ${LIMIT_MS} ms after them, the slowest after ${Math.max(...late)} ms` });
  // a drag that moved nothing measured nothing
  if (seen.size < 3) findings.push({ step, check: "missing", detail: `the finger's drag did not move "${name}" (its values: ${[...seen].join(", ")})` });
  if (during.length) findings.push({ step, check: "shift", value: sum(during), detail: `${many(during.length, "layout shift")} while the finger dragged "${name}", ${sum(during).toFixed(3)} in all, ${moved(during)}` });
  const slowest = frames.filter((f) => f.event <= end).reduce((n, f) => Math.max(n, f.latency), 0);
  return { step, control: { from: before, to: await value() }, summary: `"${name}", ${way.length} moves through ${seen.size} values, ${slowest ? `the slowest frame answering a move after ${slowest} ms` : "every move answered in a frame under 50 ms"}; ${worst(events)}; ${many(during.length, "layout shift")} while dragging`, findings };
}

/** The field tapped, its text selected, the number typed key by key with the page at rest between keys (each key timed on its own), then Enter. */
async function typeIn(page, field, text) {
  const step = "type in a field";
  const name = await accessibleName(field);
  await field.scrollIntoViewIfNeeded();
  await rest(page);
  const from = await field.inputValue();
  const start = await now(page);
  await field.tap();
  await rest(page);
  await field.selectText();
  for (const key of [...text, "Enter"]) {
    await page.keyboard.press(key);
    await rest(page);
  }
  const { events } = await taken(page, start);
  return { step, control: { from, to: await field.inputValue() }, summary: `"${name}", "${text}" and Enter; ${worst(events)}`, findings: slowInputs(step, events) };
}

/**
 * The inputs among the timed events: each interaction (a tap, a key: the events one `interactionId` groups) as one input, timed by its
 * slowest event. A key's `input` event, the mouse events a tap sends after it and the other events no interaction claims are not inputs
 * of their own: the interaction's events end in the same frame.
 */
function inputsOf(events) {
  const taps = new Map();
  for (const e of events) {
    if (!e.interaction) continue;
    const w = taps.get(e.interaction);
    if (!w || e.duration > w.duration) taps.set(e.interaction, e);
  }
  return [...taps.values()];
}

/** The inputs over the limit, one finding each, the slowest first. */
function slowInputs(step, events) {
  return inputsOf(events)
    .filter((e) => e.duration > LIMIT_MS)
    .sort((a, b) => b.duration - a.duration)
    .map((e) => ({ step, check: "input", value: e.duration, detail: `a ${e.name} on ${e.target} was answered ${e.duration} ms after it` }));
}

/** How many inputs the browser timed and the slowest of them. */
function worst(events) {
  const inputs = inputsOf(events);
  const w = inputs.reduce((a, e) => (e.duration > (a?.duration ?? -1) ? e : a), null);
  return w ? `${many(inputs.length, "input")} timed, the slowest a ${w.name} at ${w.duration} ms` : "no input timed";
}

/** What the shifts moved, as the browser names it. */
function moved(shifts) {
  const names = [...new Set(shifts.flatMap((s) => s.sources))];
  return names.length ? `moving ${names.slice(0, 4).join(", ")}` : "on boxes the browser does not name";
}

/** A count and its noun, "1 flow" or "3 flows". */
function many(n, noun) {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

function sum(shifts) {
  return shifts.reduce((n, s) => n + s.value, 0);
}

/** Points from a to b, 8 px apart, b included. */
function line(a, b) {
  const n = Math.max(1, Math.round(Math.abs(b - a) / 8));
  return Array.from({ length: n }, (_, i) => Math.round(a + ((b - a) * (i + 1)) / n));
}

function now(page) {
  return page.evaluate(() => performance.now());
}

/** A control's name as a screen reader says it: its label, the words it is labelled by, or its field's label. */
function accessibleName(el) {
  return el.evaluate((e) => (e.getAttribute("aria-label") || (e.getAttribute("aria-labelledby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent?.trim() ?? "").join(" ").trim() || e.labels?.[0]?.textContent?.trim() || e.tagName.toLowerCase()).slice(0, 40));
}

/** What the page observed from `start` on: its timed inputs and its layout shifts. */
function taken(page, start) {
  return page.evaluate((start) => ({ events: window.__inputs.filter((e) => e.start >= start), shifts: window.__shifts.filter((s) => s.start >= start), frames: window.__frames.filter((f) => f.event >= start) }), start);
}

/**
 * Runs in the page before its own scripts: keeps every Event Timing entry of 16 ms or more (the shortest the browser reports), every long
 * animation frame that answered an input, and every layout shift, each event and shift with what it fell on, named by its tag, label or
 * first words.
 */
function observe() {
  const inputs = [];
  const shifts = [];
  const frames = [];
  Object.defineProperty(window, "__frames", { value: frames });
  Object.defineProperty(window, "__inputs", { value: inputs });
  Object.defineProperty(window, "__shifts", { value: shifts });
  const describe = (node) => {
    const el = node instanceof Element ? node : node?.parentElement;
    if (!el) return "the page";
    const words = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30);
    return `<${el.tagName.toLowerCase()}>${words ? ` "${words}"` : ""}`;
  };
  new PerformanceObserver((list) => {
    for (const e of list.getEntries())
      inputs.push({ name: e.name, interaction: e.interactionId, start: e.startTime, duration: Math.round(e.duration), target: describe(e.target) });
  }).observe({ type: "event", buffered: true, durationThreshold: 16 });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) shifts.push({ start: e.startTime, value: e.value, sources: (e.sources ?? []).map((s) => describe(s.node)) });
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (e.firstUIEventTimestamp > 0) frames.push({ start: e.startTime, event: e.firstUIEventTimestamp, latency: Math.round(e.startTime + e.duration - e.firstUIEventTimestamp), blocking: Math.round(e.blockingDuration) });
  }).observe({ type: "long-animation-frame", buffered: true });
}
