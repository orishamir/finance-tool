// The kit's pieces as a hand uses them, on the built kit page, with real keys, a mouse and a finger (Chrome's own touch events, which
// scroll the page the way a phone does, for a drag; Playwright's touchscreen for a tap). Run by the layout check; each check returns what
// failed, in words:
//   field    a number field typed in: a wrong value's error shown before the hand rests, or not shown after a pause or on leaving the
//            field, or not cleared by the keystroke that fixes it; a wrong text the box does not mark as wrong at once (a form's Save
//            reads that mark); a right value not taking effect at once (the slider follows the box); what was typed cleared; an error
//            left from before a value came from outside shown at once on the next wrong keystroke; the slider field's error spoken as an
//            alert; a number box without autocomplete off, spellcheck off and enterkeyhint done, or a shekel box without a whole-number
//            pad.
//   early    a number field typed in before the page's script arrived that loses what was typed, or the keystrokes after it; one typed
//            in and left before the script arrived that loses what was typed (on the deposits page: the kit page's script draws it again
//            rather than taking it over).
//   slider   a range field a finger drags from its left end to its right that does not carry its box to the top of its scale, or back
//            to the bottom, the money slider's stepped scale included; the money slider's keys (Home, the arrows,
//            End, Page Up and Down) not landing on the scale's steps; the index page's amount slider, built from P-05's segments, that a
//            finger does not carry to the end of its first segment a third along, to its max and back to its min; and the slider rules every page's sliders are held to by the layout
//            check (`sliderRules`), which must catch a slider planted with every fault: right to left, its ends written under it, and a
//            drag from its left end to its right that does not carry it to its most.
//   sheet    with the sheets' motion played: a sheet that does not open with the focus on its first thing to act on, that Escape (the
//            browser's close request, which the phone's Back sends on Android) or its X does not close, that does not give the focus back
//            to what opened it; a sheet opened from inside another that shows over it rather than in its place, leaves the one under it
//            modal (the close request would reach it), has no way back to it, or brings it back scrolled elsewhere; Escape on the top of
//            two sheets that does not bring back the other with the focus on what opened the top one, a second Escape that does not close
//            that one, or two quick Escapes that leave one open; a close request the page may not refuse on the top of two sheets (its
//            cancel not cancelable, the browser closing the dialog itself) that closes the other too, or brings it back only after the top
//            one's closing would have played; sheets that add history entries.
//   sheet link / search sheet   a page the router opens from inside a sheet (a link in a rule's sheet on the kit page; the phone's search
//            sheet on a guide page, a word typed and Enter opening another guide page, so the frame and its sheets stay mounted) that keeps
//            a sheet open, adds more than one history entry, or that one Back does not leave for the page under the sheet, with no sheet
//            open.
//   popover  a figure's source note that a tap outside or Escape on its link does not close.
//   through  a press on a card's surface that a part positioned over its button (a block holding a grip) does not let through to the
//            button, checked on every case row and pick card, after a positioned block planted in a pick card is caught; a case row whose
//            press there does not open it; a pick card's tile choice not chosen by Space.
//   strip    a product table's folding strip that a tap on its words does not fold, or whose link a tap does not reach.
//   side     a side page's fold that opens again when the Back button comes back to the part it was opened for.
//   header   from 1024 px the site's five sections not all in sight on one line each, or overlapped by the open search; below it, no menu
//            button named exactly "תפריט" (design.md, "The site's sections are in sight"). A section hidden on purpose must be caught first.
//   touch    a chart dragged sideways by a finger that does not follow it, or that keeps the page from scrolling when the finger moves down.
//   lift in a sheet   the kit's lift demo opened in a sheet (a modal dialog, in the top layer over the page): a row carried among the rows
//            by its grip with a mouse at 1440 (the sheet centred by a transform) or pressed long and carried by a finger at 390 whose picture
//            is not drawn over the sheet under the pointer while carried, or that does not move the row where it is let go; a knob pulled
//            whose frame is not drawn over the sheet; a menu of actions (a grip's) not drawn over the sheet. In the same sheet, too short for
//            its rows: the first row carried to the sheet's foot (a mouse at 1440, a finger at 390) that does not scroll the sheet's body,
//            or the wheel that does not scroll it during a carry, or the row let go on the top of the last row, out of view when it was
//            lifted, that does not land just before it.
//   toolbox carry   on the fee page's deal at 1024 (the toolbox docked at the window's foot, its parts in a list that scrolls), a card
//            carried from it over one case, the page wheeled down under the still pointer until the case below stands there, and let go
//            with no move: the card not landing on that case (the drop aimed at the places as they stood before the scroll); opening the
//            fee raising the notice that a script failed (the browser's ResizeObserver loop report counted as the site's failure).
//   notice in a sheet   with a sheet open on the kit page and a script's failure planted (at 390 a sheet at the foot, at 1440 a short sheet
//            centred by a transform), the notice's title or its reload button not the top thing at its middle (drawn under the sheet, or cut
//            by its card), the notice not at the window's foot, or the button not reloading the page.

import { existsSync, readFileSync } from "node:fs";

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CONTEXT = { locale: "he-IL", timezoneId: "Asia/Jerusalem", reducedMotion: "reduce", colorScheme: "dark" };
const PHONE = { ...CONTEXT, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DESK = { ...CONTEXT, viewport: { width: 1440, height: 900 } };
// the sheets with their opening and closing played: a close request can come while a sheet is still leaving
const MOVING_PHONE = { ...PHONE, reducedMotion: "no-preference" };

/** Two frames after the browser is idle: what a render started has been drawn. */
const settled = () => {
  const once = () => new Promise((done) => requestIdleCallback(() => requestAnimationFrame(() => requestAnimationFrame(() => done())), { timeout: 10000 }));
  return once().then(once);
};

async function open(browser, base, options, path = "/kit") {
  const ctx = await browser.newContext(options);
  const page = await ctx.newPage();
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(settled);
  return { ctx, page };
}

/** A finger pressed at `from`, moved to `to` in steps, and lifted, through Chrome's touch events (a pan or a drag the page answers). */
async function touchDrag(page, from, to, steps = 10) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y }] });
  for (let i = 1; i <= steps; i++) {
    const p = { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps };
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [p] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

const center = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

export async function kitInputCheck(browser, base) {
  const found = [];
  for (const run of [fieldCheck, earlyCheck, sliderCheck, sheetCheck, sheetLeaveCheck, popoverCheck, throughCheck, stripCheck, sideCheck, touchCheck, headerCheck, liftSheetCheck, toolboxCarryCheck, noticeSheetCheck]) {
    try {
      found.push(...(await run(browser, base)));
    } catch (e) {
      found.push(`${run.name}: stopped: ${e.message.split("\n")[0]}`);
    }
  }
  return found;
}

async function fieldCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, DESK);
  const field = page.locator('article[aria-label="RangeField"] .range-field').first();
  const box = field.locator("input.field-input");
  const slider = field.locator('input[type="range"]');
  const error = field.locator('[id$="-err"]');
  // the slider holds its place on the track (0 to 1); the years it stands at, through the field's linear scale of 1 to 40
  const sliderYears = async () => String(Math.round(1 + Number(await slider.inputValue()) * 39));
  await box.scrollIntoViewIfNeeded();
  await box.click();
  await box.press("ControlOrMeta+a");
  await page.keyboard.type("50");
  const typedAt = Date.now();
  if (await error.count()) found.push("field: the error of a wrong value (50 years of 1 to 40) shows as it is typed, before the hand rests");
  if ((await box.getAttribute("data-wrong")) === null) found.push("field: a wrong value typed is not marked wrong on the box at once (a form's Save would take it)");
  await error.waitFor({ timeout: 3000 }).catch(() => found.push("field: the error of a wrong value does not show after a pause in the typing"));
  if (Date.now() - typedAt < 400) found.push("field: the error shows before the hand has rested");
  if ((await box.inputValue()) !== "50") found.push(`field: the wrong value typed is not kept in the box (it holds "${await box.inputValue()}")`);
  if (await field.locator('[role="alert"]').count()) found.push("field: the slider field's error is an alert, spoken on every keystroke");
  await page.keyboard.press("Backspace");
  if (await error.count()) found.push("field: the keystroke that fixes the value does not clear its error");
  if ((await sliderYears()) !== "5") found.push(`field: a right value typed does not take effect at once (the slider stands at ${await sliderYears()}, not 5)`);
  if ((await box.getAttribute("data-wrong")) !== null) found.push("field: a right value typed is still marked wrong on the box");
  await page.keyboard.type("0");
  if (await error.count()) found.push("field: a wrong value typed after a right one shows its error before the hand rests");
  await page.keyboard.press("Tab");
  if (!(await error.count())) found.push("field: a wrong value's error does not show on leaving the field");
  if ((await box.inputValue()) !== "50") found.push("field: leaving the field clears the wrong value typed");
  if ((await sliderYears()) !== "5") found.push("field: the last right result does not stay while the value is wrong");
  // a value from outside (the slider) replaces the wrong text and its error; a wrong keystroke after it waits for the hand to rest again
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  if (await error.count()) found.push("field: a value from outside does not clear the error of the text it replaces");
  await box.click();
  await box.press("ControlOrMeta+a");
  await page.keyboard.type("0");
  if (await error.count()) found.push("field: after a value from outside, a wrong keystroke shows the old error at once instead of waiting for the hand to rest");
  // every number box of the kit's fields
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll("main input.field-input[inputmode], main input[data-figure]")].map((el) => ({
      id: el.id || el.getAttribute("aria-label") || "",
      autocomplete: el.getAttribute("autocomplete"),
      spellcheck: el.getAttribute("spellcheck"),
      enter: el.getAttribute("enterkeyhint"),
      mode: el.getAttribute("inputmode"),
      shekel: el.closest(".field-box")?.querySelector(".field-unit")?.textContent === "₪",
    })),
  );
  for (const b of boxes) {
    if (b.autocomplete !== "off" || b.spellcheck !== "false" || b.enter !== "done") found.push(`field: the number box ${b.id} lacks autocomplete="off", spellcheck="false" or enterkeyhint="done"`);
    if (b.shekel && b.mode !== "numeric") found.push(`field: the shekel box ${b.id} opens a "${b.mode}" pad, not the whole-number one`);
  }
  await ctx.close();
  return found;
}

/**
 * A number field typed in before the page's script arrived: what was typed stays, and the keystrokes after the script are not lost; a box
 * typed in and left before the script arrived keeps what was typed too, and the field takes it. On the deposits page's amount, a page whose
 * script takes over its pre-rendered fields in place.
 */
async function earlyCheck(browser, base) {
  const found = [];
  for (const left of [false, true]) {
    const ctx = await browser.newContext(DESK);
    const page = await ctx.newPage();
    let release;
    const gate = new Promise((done) => (release = done));
    await page.route(/\.js(\?|$)/, async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(`${base}/deposits`, { waitUntil: "domcontentloaded" });
    const box = page.locator("main input.field-input").first();
    await box.scrollIntoViewIfNeeded();
    await box.click();
    await box.press("ControlOrMeta+a");
    const typed = left ? "5000" : "5";
    await page.keyboard.type(typed);
    // the box left before the script arrives: a click on the page's heading takes the focus away
    if (left) await page.locator("main h1").first().click();
    release();
    await page.waitForFunction(() => !!window.__reactRouterDataRouter, null, { timeout: 15000 });
    await page.evaluate(settled);
    const which = left ? "typed in and left" : "typed in";
    // the digits only: the field may write the amount with its thousands separator
    const digits = async () => (await box.inputValue()).replace(left ? /\D/g : /$^/, "");
    if ((await digits()) !== typed) found.push(`early: a field ${which} before the script arrived holds "${await box.inputValue()}", not the ${typed} typed`);
    if (left) {
      // the field took it: back in the box, its text is the field's own writing of the value
      await box.click();
      await page.keyboard.press("End");
      await page.keyboard.type("0");
      if ((await digits()) !== "50000") found.push(`early: a field typed in and left before the script arrived does not take what was typed (one more 0 gives "${await box.inputValue()}", not 50000)`);
    } else {
      // a wrong keystroke after it: the box keeps what was typed rather than the field's own value
      await page.keyboard.type("x");
      if ((await box.inputValue()) !== "5x") found.push(`early: a keystroke after the script arrived in a field typed in before is lost (the box holds "${await box.inputValue()}", not 5x)`);
    }
    await ctx.close();
  }
  return found;
}

async function sliderCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, PHONE);
  // the kit's range fields: the years (1 to 40) and the money slider on its stepped scale (0 to 500,000)
  const fields = page.locator('article[aria-label="RangeField"] .range-field');
  for (const [n, top, bottom] of [[0, "40", "1"], [2, "500,000", "0"]]) {
    const field = fields.nth(n);
    const slider = field.locator('input[type="range"]');
    const box = field.locator("input.field-input");
    await slider.scrollIntoViewIfNeeded();
    const r = await slider.boundingBox();
    const y = r.y + r.height / 2;
    const before = await box.inputValue();
    await touchDrag(page, { x: r.x + 6, y }, { x: r.x + r.width - 6, y });
    await page.evaluate(settled);
    const up = await box.inputValue();
    if (up !== top) found.push(`slider: a finger dragged across a range field from its left end to its right does not carry its box to the top of its scale (${before} to ${up}, not ${top})`);
    await touchDrag(page, { x: r.x + r.width - 6, y }, { x: r.x + 6, y });
    await page.evaluate(settled);
    const down = await box.inputValue();
    if (down !== bottom) found.push(`slider: a finger dragged across a range field from its right end to its left does not carry its box to the bottom of its scale (${up} to ${down}, not ${bottom})`);
  }
  await ctx.close();
  found.push(...(await sliderKeyCheck(browser, base)));
  found.push(...(await sliderDataCheck(browser, base)));
  // a slider with every fault, planted on the kit page: right to left, its ends written under it, and so growing as the mouse moves left
  {
    const { ctx: kit, page: desk } = await open(browser, base, DESK);
    await desk.evaluate(() => {
      const field = Object.assign(document.createElement("div"), { id: "planted-slider", className: "field" });
      field.innerHTML = '<input type="range" class="slider" min="0" max="10" step="1" value="5" style="direction:rtl"><div style="display:flex;justify-content:space-between"><span>10</span><span>0</span></div>';
      document.querySelector("main").prepend(field);
    });
    const caught = (await sliderRules(desk, "#planted-slider")).map((f) => f.detail);
    for (const [rule, word] of [["direction", "left to right"], ["ends", "at its ends"], ["drag", "drag"]]) if (!caught.some((f) => f.includes(word))) found.push(`slider: self-test: the ${rule} rule did not catch the slider planted on /kit`);
    await kit.close();
  }
  return found;
}

/** The x of a place (0 to 1) on a slider's track: the thumb's centre runs from half a thumb in from the left end to half a thumb in from the right (app.css: a 24 px thumb). */
const placeX = (r, place) => r.x + 12 + (r.width - 24) * place;

/** The kit's money slider moved by its keys, whose Page Up and Page Down carry a tenth of the track, more than a step. */
async function sliderKeyCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, DESK);
  const money = page.locator('article[aria-label="RangeField"] .range-field').nth(2);
  const box = money.locator("input.field-input");
  // the keys on the money slider (0 to 20,000 by 1,000, to 100,000 by 5,000, to 500,000 by 25,000): Page Down from 475,000 lands on the
  // step nearest a tenth of the track lower (350,000), and Page Up from there on the one nearest a tenth higher (475,000)
  const slider = money.locator('input[type="range"]');
  await slider.scrollIntoViewIfNeeded();
  await slider.focus();
  for (const [key, want] of [["Home", "0"], ["ArrowRight", "1,000"], ["End", "500,000"], ["ArrowLeft", "475,000"], ["PageDown", "350,000"], ["PageUp", "475,000"]]) {
    await page.keyboard.press(key);
    const got = await box.inputValue();
    if (got !== want) found.push(`slider: ${key} on the money slider gives ${got}, not ${want}`);
  }
  await ctx.close();
  return found;
}

/**
 * One slider built from P-05's data, on an index page: the amount tile tapped open, a finger dragged across the plan's amount slider from its left end to the place a
 * third along carries its box to the end of the first segment P-05 writes, then to the right end its max, then back to the left end its min.
 */
async function sliderDataCheck(browser, base) {
  const found = [];
  const p05 = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../data/parameters/illustrative-scenario.json"), "utf8"));
  const range = p05.sliders.amount_now;
  const third = range.segments.length === 3 ? range.segments[0].to.value : null;
  const words = (n) => n.toLocaleString("en-US");
  const { ctx, page } = await open(browser, base, PHONE, "/indices/sp500");
  // the plan's amount tile tapped open, then its box (invest/knobs.tsx, `PLAN_AMOUNT_FIELD`) and the slider in its popup
  await page.locator("main").getByRole("button", { name: "סכום היום" }).first().tap();
  const field = page.locator(".range-field", { has: page.locator("#plan-amount") });
  const slider = field.locator('input[type="range"]');
  const box = field.locator("#plan-amount");
  if (!(await slider.isVisible())) {
    found.push("slider: the index page's amount slider is not in sight");
    await ctx.close();
    return found;
  }
  await slider.scrollIntoViewIfNeeded();
  const r = await slider.boundingBox();
  const y = r.y + r.height / 2;
  const left = placeX(r, 0);
  const steps = [
    ...(third === null ? [] : [[left, placeX(r, 1 / 3), words(third), "a third along"]]),
    [left, placeX(r, 1), words(range.max.value), "to its right end"],
    [placeX(r, 1), left, words(range.min.value), "back to its left end"],
  ];
  for (const [from, to, want, where] of steps) {
    await touchDrag(page, { x: from, y }, { x: to, y });
    await page.evaluate(settled);
    const got = await box.inputValue();
    if (got !== want) found.push(`slider: a finger dragged across the index page's amount slider (P-05's segments) ${where} gives ${got}, not ${want}`);
  }
  await ctx.close();
  return found;
}

/**
 * The slider rules on each visible slider (`input[type=range]`) inside `within`, at a computer's width with a mouse: it runs left to right,
 * nothing with a figure stands under it in its field (`.field`, else its parent), and a drag from its left end to its right carries it to
 * its most, one back to its least (a disabled one is not dragged). A slider that shows only in a knob tile's popup (`KnobStrip
 * layout="tiles"`) is checked as a person reaches it: its tile clicked open, the rules run, Escape. The layout check runs it on every page at
 * 1440. Returns what failed: the slider's name and the words.
 */
export async function sliderRules(page, within) {
  const found = await rulesOn(page, page.locator(`${within} input[type="range"]`).locator("visible=true"));
  const tiles = page.locator(`${within} [data-knob-tile]`).locator("visible=true");
  const n = await tiles.count();
  for (let i = 0; i < n; i++) {
    const tile = tiles.nth(i);
    if ((await tile.getAttribute("aria-expanded")) !== "false" || (await tile.isDisabled())) continue;
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
    found.push(...(await rulesOn(page, page.locator(`${within} [popover] input[type="range"]`).locator("visible=true"))));
    await page.keyboard.press("Escape");
  }
  return found;
}

/** The slider rules on each slider `sliders` finds. */
async function rulesOn(page, sliders) {
  const found = [];
  const n = await sliders.count();
  for (let i = 0; i < n; i++) {
    const s = sliders.nth(i);
    await s.scrollIntoViewIfNeeded();
    const facts = await s.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const field = el.closest(".field") ?? el.parentElement;
      const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT);
      const under = [];
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        if (!/\d/.test(t.textContent ?? "")) continue;
        const range = document.createRange();
        range.selectNodeContents(t);
        const b = range.getBoundingClientRect();
        if (b.width > 0 && b.top >= r.bottom - 2) under.push(t.textContent.trim());
      }
      const name = el.getAttribute("aria-label") ?? (el.getAttribute("aria-labelledby") ? document.getElementById(el.getAttribute("aria-labelledby"))?.textContent : null) ?? `slider ${el.id || ""}`;
      return { direction: getComputedStyle(el).direction, under, name: name.trim(), min: Number(el.min || 0), max: Number(el.max || 100), disabled: el.disabled };
    });
    const who = `"${facts.name}"`;
    if (facts.direction !== "ltr") found.push({ slider: facts.name, detail: `${who} does not run left to right (its direction is ${facts.direction})` });
    if (facts.under.length) found.push({ slider: facts.name, detail: `${who} shows values at its ends: ${facts.under.join(" · ")}` });
    // a disabled slider (a field waiting for its data) takes no drag
    if (facts.disabled) continue;
    const r = await s.boundingBox();
    const y = r.y + r.height / 2;
    // a drag of a few moves (each one re-renders what the slider drives), and the slider's own value two frames after the lift: React sets
    // it in the events' own handlers, so the drag waits for no more (not for the rest of the page, a chart's glide or a deferred list, to
    // come to rest)
    const drag = async (from, to) => {
      await page.mouse.move(from, y);
      await page.mouse.down();
      await page.mouse.move(to, y, { steps: 4 });
      await page.mouse.up();
      return s.evaluate((el) => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(Number(el.value))))));
    };
    const most = await drag(r.x + 2, r.x + r.width - 2);
    const least = await drag(r.x + r.width - 2, r.x + 2);
    if (most !== facts.max || least !== facts.min) found.push({ slider: facts.name, detail: `a drag of ${who} from its left end to its right gives ${most} and back ${least}, not its most ${facts.max} and its least ${facts.min}` });
  }
  return found;
}

async function sheetCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, MOVING_PHONE);
  const shown = () => page.evaluate(() => [...document.querySelectorAll("dialog")].filter((d) => d.open).length);
  const modal = () => page.evaluate(() => [...document.querySelectorAll("dialog")].filter((d) => d.matches(":modal")).length);
  const noneOpen = () => page.waitForFunction(() => ![...document.querySelectorAll("dialog")].some((d) => d.open), null, { timeout: 3000 });
  const entries = () => page.evaluate(() => history.length);
  const before = await entries();
  const opener = page.locator('article[aria-label="ConfirmAsk"] button').first();
  await opener.scrollIntoViewIfNeeded();
  await opener.tap();
  await page.locator("dialog[open]").waitFor({ timeout: 3000 });
  await page.evaluate(settled);
  if (!(await page.evaluate(() => document.activeElement?.hasAttribute("data-autofocus")))) found.push("sheet: the confirmation does not open with the focus on its first thing to act on");
  if (await page.evaluate(() => document.querySelector("dialog[open]")?.hasAttribute("tabindex"))) found.push("sheet: the dialog carries a tabindex");
  // Escape is the browser's close request, as the phone's Back is on Android
  await page.keyboard.press("Escape");
  await noneOpen().catch(() => found.push("sheet: Escape (the close request the phone's Back also sends) does not close the sheet"));
  if (!(await opener.evaluate((el) => el === document.activeElement))) found.push("sheet: the focus does not go back to what opened the sheet");
  await opener.tap();
  await page.locator("dialog[open]").waitFor({ timeout: 3000 });
  await page.locator("dialog[open] .sheet-head button").last().tap();
  await noneOpen().catch(() => found.push("sheet: the X does not close the sheet"));
  if (!(await opener.evaluate((el) => el === document.activeElement))) found.push("sheet: after the X, the focus does not go back to what opened the sheet");
  // a rule opened from inside a label's sheet takes its place, with a way back
  const label = page.locator("main button[data-label]").first();
  await label.scrollIntoViewIfNeeded();
  await label.tap();
  await page.locator("dialog[open]").waitFor({ timeout: 3000 });
  const firstId = await page.locator("dialog[open]").evaluate((d) => [...document.querySelectorAll("dialog")].indexOf(d));
  const first = page.locator("dialog").nth(firstId);
  const rule = first.locator(".rule-chip").first();
  if (!(await rule.count())) found.push("sheet: the label sheet on the kit page holds no rule to open from it");
  else {
    const firstOpen = (i) => document.querySelectorAll("dialog")[i].open;
    // in place once its opening has played
    await page.waitForFunction((i) => document.querySelectorAll("dialog")[i].getAnimations({ subtree: true }).length === 0, firstId, { timeout: 3000 });
    await page.evaluate(settled);
    // the first sheet scrolled down (made taller than the phone, with room over and under its words), its rule still well in view, clear of
    // the floating buttons at its top (a tap on a rule under them would scroll it first)
    await first.evaluate((d) => {
      const body = d.querySelector(".sheet-body");
      body.style.paddingTop = "200px";
      body.style.paddingBottom = "2000px";
      body.scrollTop = 60;
    });
    await page.evaluate(settled);
    const scrolled = await first.evaluate((d) => d.querySelector(".sheet-body").scrollTop);
    await rule.tap();
    await page.waitForFunction((i) => !document.querySelectorAll("dialog")[i].open && [...document.querySelectorAll("dialog")].some((d) => d.open), firstId, { timeout: 3000 }).catch(() => found.push("sheet: a rule opened from inside a sheet shows over it instead of in its place"));
    await page.evaluate(settled);
    if ((await shown()) !== 1) found.push(`sheet: ${await shown()} sheets show at once`);
    if ((await modal()) !== 1) found.push(`sheet: ${await modal()} sheets are modal at once (a close request must reach the top one only)`);
    const back = page.locator("dialog[open] .sheet-head[data-back] button").first();
    if (!(await back.count())) found.push("sheet: a sheet opened from inside another has no way back to it");
    else {
      await back.tap();
      await page.waitForFunction(firstOpen, firstId, { timeout: 3000 }).catch(() => found.push("sheet: the way back does not bring back the sheet it was opened from"));
      await page.evaluate(settled);
      if (!(await rule.evaluate((el) => el === document.activeElement))) found.push("sheet: back in the first sheet, the focus is not on the rule that opened the second");
      const at = await first.evaluate((d) => d.querySelector(".sheet-body").scrollTop);
      if (Math.abs(at - scrolled) > 1) found.push(`sheet: back in the first sheet, it is scrolled to ${at} px, not the ${scrolled} px it was left at`);
    }
    // Escape closes the top of the two, then the other, the focus going back each time
    await rule.tap();
    await page.waitForFunction((i) => !document.querySelectorAll("dialog")[i].open, firstId, { timeout: 3000 }).catch(() => found.push("sheet: a rule opened again from inside a sheet does not take its place"));
    await page.evaluate(settled);
    await page.keyboard.press("Escape");
    await page.waitForFunction(firstOpen, firstId, { timeout: 3000 }).catch(() => found.push("sheet: Escape on a sheet opened inside another does not bring that one back"));
    await page.evaluate(settled);
    if ((await shown()) !== 1) found.push(`sheet: after Escape on the top of two sheets, ${await shown()} show`);
    if (!(await rule.evaluate((el) => el === document.activeElement))) found.push("sheet: after Escape on the top sheet, the focus is not on the rule that opened it");
    await page.keyboard.press("Escape");
    await noneOpen().catch(() => found.push("sheet: a second Escape does not close the first sheet"));
    if (!(await label.evaluate((el) => el === document.activeElement))) found.push("sheet: after the second Escape, the focus is not on what opened the first sheet");
    // two quick Escapes, the second while the top sheet is still leaving, close both
    await label.tap();
    await page.locator("dialog[open] .rule-chip").first().tap();
    await page.waitForFunction((i) => !document.querySelectorAll("dialog")[i].open, firstId, { timeout: 3000 }).catch(() => found.push("sheet: a rule opened again from inside a sheet does not take its place"));
    await page.evaluate(settled);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    // every closing played out: a sheet the top one uncovers shows as the top one's closing ends
    await page.waitForFunction(() => !document.querySelector("dialog[data-closing]"), null, { timeout: 3000 });
    await page.evaluate(settled);
    if (await shown()) found.push("sheet: two quick Escapes on two sheets leave the first one open");
    if (!(await label.evaluate((el) => el === document.activeElement))) found.push("sheet: after two quick Escapes, the focus is not on what opened the first sheet");
    // a close request the page may not refuse (the browser's own, with no press since the last): its cancel cannot be refused, and the
    // browser closes the top sheet itself; that close is the same request, so only the top one closes, and the one under it comes back at
    // once rather than after the top one's closing would have played
    await label.tap();
    await page.locator("dialog[open] .rule-chip").first().tap();
    await page.waitForFunction((i) => !document.querySelectorAll("dialog")[i].open && [...document.querySelectorAll("dialog")].some((d) => d.open), firstId, { timeout: 3000 });
    await page.evaluate(settled);
    const atClose = await page.evaluate(
      (i) =>
        new Promise((done) => {
          const top = [...document.querySelectorAll("dialog")].find((d) => d.open);
          top.addEventListener("close", () => done(document.querySelectorAll("dialog")[i].open), { once: true });
          top.dispatchEvent(new Event("cancel", { cancelable: false }));
          // the browser closes the dialog after its cancel listeners have run and the microtasks they queued (the page's render) with them
          setTimeout(() => top.close(), 0);
        }),
      firstId,
    );
    if (!atClose) found.push("sheet: the browser closing the top of two sheets itself does not bring the other back at once");
    await page.waitForFunction(() => !document.querySelector("dialog[data-closing]"), null, { timeout: 3000 });
    await page.evaluate(settled);
    if (!(await page.evaluate(firstOpen, firstId)) || (await shown()) !== 1) found.push(`sheet: a close request the page may not refuse on the top of two sheets leaves ${await shown()} open, not the one under it`);
    await page.keyboard.press("Escape");
    await noneOpen().catch(() => found.push("sheet: after the browser closed the top sheet itself, Escape does not close the other"));
  }
  if ((await entries()) !== before || !(await page.evaluate(() => location.pathname.endsWith("/kit")))) found.push("sheet: opening and closing sheets adds history entries or leaves the page");
  await ctx.close();
  return found;
}

/** Back from a page the router opened from inside a sheet: no sheet left open there, no entry left for it, and one Back returns. */
async function sheetLeaveCheck(browser, base) {
  const found = [];
  const noneOpen = (page) => page.waitForFunction(() => ![...document.querySelectorAll("dialog")].some((d) => d.open), null, { timeout: 2000 });
  const left = async (page, where, before, from) => {
    // a sheet leaving plays its closing first
    await noneOpen(page).catch(() => found.push(`${where}: a sheet is still open on the page it opened`));
    const added = (await page.evaluate(() => history.length)) - before;
    if (added !== 1) found.push(`${where}: the page it opened added ${added} history entries, not 1`);
    await page.goBack();
    await page.waitForFunction((p) => location.pathname.endsWith(p), from, { timeout: 10000 }).catch(() => found.push(`${where}: one Back from the page it opened does not come back to the page`));
    await page.evaluate(settled);
    // a sheet that comes back would open within its opening's time
    await page
      .waitForFunction(() => [...document.querySelectorAll("dialog")].some((d) => d.open), null, { timeout: 1000 })
      .then(() => found.push(`${where}: Back to the page shows a sheet open again`))
      .catch(() => undefined);
  };
  {
    // a link inside a rule's sheet, itself opened inside a label's sheet
    const { ctx, page } = await open(browser, base, MOVING_PHONE);
    const before = await page.evaluate(() => history.length);
    const label = page.locator("main button[data-label]").first();
    await label.scrollIntoViewIfNeeded();
    await label.tap();
    await page.locator("dialog[open] .rule-chip").first().tap();
    const link = page.locator('dialog[open] a[href$="/rules"]').first();
    await link.waitFor({ timeout: 3000 }).catch(() => undefined);
    if (!(await link.count())) found.push("sheet link: the rule sheet on the kit page holds no link to the rules page");
    else {
      await page.evaluate(settled);
      await link.tap();
      await page.waitForFunction(() => location.pathname.endsWith("/rules"), null, { timeout: 10000 });
      await page.evaluate(settled);
      await left(page, "sheet link", before, "/kit");
    }
    await ctx.close();
  }
  {
    // the phone's search sheet: a word typed and Enter opens the first hit's page, a page of the same kind as the one it was opened on, so
    // the page's frame and its sheets stay on the page and only the change of page closes the sheet
    const from = "/guide/current-account";
    const { ctx, page } = await open(browser, base, MOVING_PHONE, from);
    const before = await page.evaluate(() => history.length);
    await page.locator("[data-site-header]").getByRole("button", { name: "חיפוש", exact: true }).tap();
    const box = page.locator("dialog[open] form[role=search] input");
    await box.waitFor({ timeout: 3000 });
    // a word whose first hit is a page; a term's hit opens the term's own sheet on its page
    await box.fill("פיקדון");
    const hit = page.locator("dialog[open] a[href]").first();
    await hit.waitFor({ timeout: 10000 }).catch(() => undefined);
    await page.evaluate(settled);
    const href = (await hit.count()) ? await hit.getAttribute("href") : null;
    if (!href?.includes("/guide/") || href.includes("#")) found.push(`search sheet: the word's first hit (${href}) is not another guide page: the check needs another word`);
    await box.press("Enter");
    await page.waitForFunction((p) => !location.pathname.endsWith(p), from, { timeout: 10000 }).catch(() => found.push("search sheet: Enter does not open the first hit's page"));
    await page.evaluate(settled);
    if (!(await page.evaluate((p) => location.pathname.endsWith(p), from))) await left(page, "search sheet", before, from);
    await ctx.close();
  }
  return found;
}

async function popoverCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, PHONE);
  const note = page.locator("[data-figure-note]");
  const boxes = page.locator("main input[data-figure]");
  let box = null;
  for (let i = 0, n = Math.min(await boxes.count(), 12); i < n && !box; i++) {
    const b = boxes.nth(i);
    await b.scrollIntoViewIfNeeded();
    await b.tap();
    if (await note.count()) box = b;
    else await page.keyboard.press("Escape");
  }
  if (!box) {
    await ctx.close();
    return ["popover: no figure on the kit page opens its source note on a tap"];
  }
  // a tap on plain words away from the box and its note
  const away = await page.locator("main h1").first().boundingBox();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.touchscreen.tap(away.x + 4, away.y + away.height / 2);
  if (await note.count()) found.push("popover: a tap outside a figure's source note does not close it");
  await box.scrollIntoViewIfNeeded();
  await box.tap();
  await note.waitFor({ timeout: 2000 });
  await page.keyboard.press("Tab");
  if (!(await note.evaluate((n) => n.contains(document.activeElement)))) found.push("popover: Tab from a figure does not reach its source note's link");
  await page.keyboard.press("Escape");
  if (await note.count()) found.push("popover: Escape on a figure's source note does not close it");
  if (!(await box.evaluate((el) => el === document.activeElement))) found.push("popover: Escape on a figure's source note does not give the focus back to the figure");
  await ctx.close();
  return found;
}

// Runs in the page. Every card or row of `selector` whose button is stretched over it, with a block in it made to stand over the button
// the way a block holding a grip does (`plant`): the point of the block's own surface a press lands on, and whether it is the card's button.
function pressSpots({ selector, plant }) {
  const out = [];
  for (const card of document.querySelectorAll(selector)) {
    const button = card.querySelector(":scope > button[data-pick-card]");
    // its last block: a case row's parts' cell, where its grip stands
    const block = [...card.children].filter((c) => c !== button && c.getBoundingClientRect().height > 20).at(-1);
    if (!button || !block) continue;
    if (plant === "grip") block.prepend(Object.assign(document.createElement("span"), { "data-planted": "" }));
    if (plant === "grip") block.firstElementChild.setAttribute("data-grip-box", "");
    if (plant === "positioned") block.style.position = "relative";
    block.scrollIntoView({ block: "center" });
    const r = block.getBoundingClientRect();
    const x = r.left + 3;
    const y = r.top + 3;
    const hit = document.elementFromPoint(x, y);
    out.push({ label: button.getAttribute("aria-label"), x, y, through: hit === button });
  }
  return out;
}

async function throughCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, PHONE);
  // the check catches a block positioned over a pick card's button that does not let a press through (a block with no grip in it)
  const planted = await page.evaluate(pressSpots, { selector: 'article[aria-label="PickCard"] div:has(> button[data-pick-card])', plant: "positioned" });
  if (!planted.length || planted.every((s) => s.through)) found.push("through: self-test: a positioned block planted in a pick card was not caught");
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(settled);
  for (const s of await page.evaluate(pressSpots, { selector: "main div:has(> button[data-pick-card])", plant: "grip" }))
    if (!s.through) found.push(`through: a press on the surface of a block holding a grip in "${s.label}" does not reach its button`);
  // a case row whose press opens it (the kit's trade fee), pressed on its parts' cell holding a grip
  const ROWS = "main div[data-lift-body]:has(> button[data-pick-card])";
  const n = await page.locator(ROWS).count();
  let opened = false;
  for (let i = 0; i < n && !opened; i++) {
    const spot = await page.evaluate(({ sel, i }) => {
      const card = document.querySelectorAll(sel)[i];
      const button = card?.querySelector(":scope > button[data-pick-card]");
      const block = card && [...card.children].filter((c) => c !== button && c.getBoundingClientRect().height > 20).at(-1);
      if (!block) return null;
      block.scrollIntoView({ block: "center" });
      const r = block.getBoundingClientRect();
      return { x: r.left + 3, y: r.top + 3, label: button.getAttribute("aria-label") };
    }, { sel: ROWS, i });
    if (!spot) continue;
    const rows = () => page.evaluate((label) => [...document.querySelectorAll("button[data-pick-card]")].filter((b) => b.getAttribute("aria-label") === label).length, spot.label);
    const before = await rows();
    await page.touchscreen.tap(spot.x, spot.y);
    await page.evaluate(settled);
    // the row it opens gives way to the open case
    opened = (await rows()) < before;
  }
  if (!opened) found.push("through: no case row on the kit page opens on a tap on its parts' cell holding a grip");
  await ctx.close();
  // a tile of a tile choice is a button: Space chooses it
  const desk = await open(browser, base, DESK);
  const tiles = desk.page.locator('article[aria-label="TileChoice"] button[role="radio"]');
  if ((await tiles.count()) < 2) found.push("through: the tile choice's tiles are not buttons");
  else {
    await tiles.nth(1).focus();
    await desk.page.keyboard.press("Space");
    if ((await tiles.nth(1).getAttribute("aria-checked")) !== "true") found.push("through: Space on a tile does not choose it");
  }
  await desk.ctx.close();
  return found;
}

async function stripCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, PHONE);
  const strip = page.locator("main .grp-phone.grp-foldable").first();
  if (!(await strip.count())) {
    await ctx.close();
    return ["strip: no folding strip on the kit page at 390"];
  }
  const fold = strip.locator('button[aria-expanded]');
  await strip.scrollIntoViewIfNeeded();
  const was = await fold.getAttribute("aria-expanded");
  const words = await strip.locator(".grp-title").boundingBox();
  await page.touchscreen.tap(words.x + 4, words.y + words.height / 2);
  await page.evaluate(settled);
  if ((await fold.getAttribute("aria-expanded")) === was) found.push("strip: a tap on a folding strip's words does not fold it");
  // a link in a strip's words stands over the strip's stretched button
  const linked = page.locator("main .grp-phone.grp-foldable > span a").first();
  if (!(await linked.count())) found.push("strip: no folding strip on the kit page holds a link");
  else {
    await linked.scrollIntoViewIfNeeded();
    const reached = await linked.evaluate((a) => {
      const r = a.getBoundingClientRect();
      return a.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    });
    if (!reached) found.push("strip: a tap on a link in a folding strip's words lands on the strip's button, not the link");
  }
  await ctx.close();
  return found;
}

async function sideCheck(browser, base) {
  const found = [];
  const ctx = await browser.newContext(PHONE);
  const page = await ctx.newPage();
  await page.goto(`${base}/kit?side=1`, { waitUntil: "networkidle" });
  await page.evaluate(settled);
  const fold = page.locator("[data-side-page] [data-side-nav] button[aria-expanded]").first();
  await fold.scrollIntoViewIfNeeded();
  await fold.tap();
  if ((await fold.getAttribute("aria-expanded")) !== "true") found.push("side: a side page's fold does not open on a tap");
  // another part chosen without the fold (a navigation), then Back to the part it was opened for
  await page.evaluate(() => window.__reactRouterDataRouter.navigate("/kit?side=2"));
  await page.waitForFunction(() => location.search === "?side=2", null, { timeout: 3000 });
  await page.evaluate(settled);
  if ((await fold.getAttribute("aria-expanded")) !== "false") found.push("side: choosing another part does not close a side page's fold");
  await page.goBack();
  await page.waitForFunction(() => location.search === "?side=1", null, { timeout: 3000 });
  await page.evaluate(settled);
  if ((await fold.getAttribute("aria-expanded")) !== "false") found.push("side: Back to the part a side page's fold was opened for opens the fold again");
  await ctx.close();
  return found;
}

async function touchCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, PHONE);
  const chart = page.locator('article[aria-label="ChangeChart"] svg.cursor-ew-resize').first();
  await chart.scrollIntoViewIfNeeded();
  const r = await chart.boundingBox();
  const drawn = () => chart.evaluate((s) => s.innerHTML);
  const before = await drawn();
  await touchDrag(page, { x: r.x + r.width * 0.8, y: r.y + r.height / 2 }, { x: r.x + r.width * 0.2, y: r.y + r.height / 2 });
  await page.evaluate(settled);
  if ((await drawn()) === before) found.push("touch: a finger dragged sideways across the change chart does not move what it shows");
  const top = await page.evaluate(() => window.scrollY);
  const c = center(await chart.boundingBox());
  await touchDrag(page, { x: c.x, y: c.y + 60 }, { x: c.x, y: c.y - 120 }, 12);
  await page.waitForFunction((y) => window.scrollY !== y, top, { timeout: 2000 }).catch(() => found.push("touch: a finger moving down the change chart does not scroll the page"));
  await ctx.close();
  return found;
}

/** What is wrong with the header at a computer width, on a page whose section is current: each of the five sections shown, on one line,
 *  none overlapping another or the open header search. */
async function headerFaults(page) {
  return page.evaluate(() => {
    const faults = [];
    const links = [...document.querySelectorAll('header nav[aria-label="ראשי"] a')].filter((a) => a.getClientRects().length > 0 && getComputedStyle(a).visibility !== "hidden");
    if (links.length !== 5) faults.push(`${links.length} of the five sections in sight`);
    const boxes = links.map((a) => a.getBoundingClientRect());
    links.forEach((a, i) => {
      const line = parseFloat(getComputedStyle(a).lineHeight) || 24;
      if (boxes[i].height > line * 1.5 + 16) faults.push(`"${a.textContent}" wraps`);
    });
    const meet = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (meet(boxes[i], boxes[j])) faults.push(`"${links[i].textContent}" and "${links[j].textContent}" overlap`);
    const search = document.querySelector("#header-search")?.getBoundingClientRect();
    if (search) boxes.forEach((b, i) => meet(b, search) && faults.push(`the open search covers "${links[i].textContent}"`));
    return faults;
  });
}

async function headerCheck(browser, base) {
  const found = [];
  const ctx = await browser.newContext({ ...CONTEXT, viewport: { width: 1024, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/rules`, { waitUntil: "networkidle" });
  await page.evaluate(settled);
  await page.locator("#header-search").focus();
  await page.evaluate(settled);
  for (const f of await headerFaults(page)) found.push(`header: at 1024 px on /rules, ${f}`);
  // the check must see a section hidden on purpose before its silence means anything
  await page.addStyleTag({ content: 'header nav[aria-label="ראשי"] a:last-child { display: none !important; }' });
  if (!(await headerFaults(page)).length) found.push("header: a section hidden on purpose at 1024 px goes unseen");
  await ctx.close();
  const phone = await open(browser, base, PHONE, "/rules");
  const named = await phone.page.getByRole("button", { name: "תפריט", exact: true }).count();
  if (named !== 1) found.push(`header: at 390 px, ${named} buttons named exactly "תפריט" (one expected)`);
  await phone.ctx.close();
  return found;
}

/**
 * In the page: whether the element `sel` (drawn with no press of its own) is what a press at the point would reach were it pressed, the top
 * thing drawn there, and whether its box holds the point; null where there is none.
 */
function drawnAt([sel, x, y]) {
  const el = document.querySelector(sel);
  if (!el) return null;
  const was = el.style.pointerEvents;
  el.style.pointerEvents = "auto";
  const hit = document.elementFromPoint(x, y);
  el.style.pointerEvents = was;
  const r = el.getBoundingClientRect();
  return { top: !!hit && el.contains(hit), holds: x >= r.left && x <= r.right && y >= r.top && y <= r.bottom };
}

/** The lift demo opened in its sheet on the kit page; the rows' order read from their grips (kit:row:<n>), outside the carried picture. */
async function openLiftSheet(browser, base, options) {
  const { ctx, page } = await open(browser, base, options);
  const opener = page.locator('article[aria-label="Grip, DropBin, SpanKnob, EditInPlace"] button', { hasText: "לפתוח את העמלה בחלון" });
  await opener.scrollIntoViewIfNeeded();
  await (options.hasTouch ? opener.tap() : opener.click());
  await page.locator("dialog[open] [data-lift-item^='kit:row:']").first().waitFor({ state: "attached", timeout: 3000 });
  await page.evaluate(settled);
  const rows = () => page.evaluate(() => [...document.querySelectorAll("dialog[open] [data-grip][data-lift-item^='kit:row:']")].filter((g) => !g.closest("[data-lift-ghost]")).map((g) => g.dataset.liftItem).join(","));
  return { ctx, page, rows };
}

async function liftSheetCheck(browser, base) {
  const found = [];
  // a mouse at 1440, where the sheet stands centred by a transform
  {
    const { ctx, page, rows } = await openLiftSheet(browser, base, DESK);
    const before = await rows();
    const row = page.locator("dialog[open] [data-liftable]:has(> * [data-grip][data-lift-item='kit:row:0'], > [data-grip-box] [data-grip][data-lift-item='kit:row:0'])").first();
    const other = page.locator("dialog[open] [data-liftable]:has(> * [data-grip][data-lift-item='kit:row:1'], > [data-grip-box] [data-grip][data-lift-item='kit:row:1'])").first();
    await row.hover();
    const g = center(await page.locator("dialog[open] [data-grip][data-lift-item='kit:row:0']").boundingBox());
    const o = await other.boundingBox();
    const to = { x: g.x, y: o.y + o.height - 4 };
    await page.mouse.move(g.x, g.y);
    await page.mouse.down();
    await page.mouse.move(g.x, g.y + 6, { steps: 3 });
    await page.mouse.move(to.x, to.y, { steps: 10 });
    const ghost = await page.evaluate(drawnAt, ["[data-lift-ghost]", to.x, to.y]);
    if (!ghost) found.push("lift in a sheet: a row's grip pressed and moved with a mouse lifts nothing");
    else {
      if (!ghost.top) found.push("lift in a sheet: the row carried with a mouse is not the top thing drawn at the pointer (hidden under the sheet's layer, or drawn elsewhere)");
      if (!ghost.holds) found.push("lift in a sheet: the row carried with a mouse is not drawn under the pointer");
    }
    await page.mouse.up();
    await page.evaluate(settled);
    if ((await rows()) === before) found.push(`lift in a sheet: a row carried with a mouse below the next one and let go does not move (${before})`);
    // a knob pulled toward the column before its cell, pressed where its strip is the top thing (the cell's grip stands over its middle)
    const k = await page.evaluate(() => {
      for (const knob of document.querySelectorAll("dialog[open] [data-span-knob]")) {
        knob.scrollIntoView({ block: "center" });
        const r = knob.getBoundingClientRect();
        for (let y = r.top + 1; y < r.bottom; y += 2) if (document.elementFromPoint(r.left + r.width / 2, y)?.closest("[data-span-knob]") === knob) return { x: r.left + r.width / 2, y, mid: r.top + r.height / 2 };
      }
      return null;
    });
    if (!k) found.push("lift in a sheet: no knob in the sheet takes a press");
    if (k) {
      await page.mouse.move(k.x, k.y);
      await page.mouse.down();
      await page.mouse.move(k.x + 40, k.y, { steps: 4 });
      // the frame spans the cell's height, as the knob's strip does: read in its middle, clear of its rounded corners
      const frame = await page.evaluate(drawnAt, ["[data-reach-frame]", k.x + 30, k.mid]);
      if (!frame) found.push("lift in a sheet: a knob pulled draws no frame");
      else if (!frame.top) found.push("lift in a sheet: a knob's frame is not the top thing drawn beside the pointer (hidden under the sheet's layer, or drawn elsewhere)");
      else if (!frame.holds) found.push("lift in a sheet: a knob's frame does not reach the pointer");
      await page.mouse.up();
      await page.evaluate(settled);
    }
    // a fee to add, carried with a mouse across the sheet's words and let go with Escape, selects no words on its way: in a modal dialog a
    // press on a button's words begins a selection, which the carry would stretch over the pointer's way
    const fee = page.locator("dialog[open] [data-drag-source]").first();
    if (!(await fee.count())) found.push("lift in a sheet: the sheet offers no fee to carry");
    else {
      await fee.scrollIntoViewIfNeeded();
      // pressed on its own words, where a press in a dialog places the caret
      const f = await fee.evaluate((el) => {
        const words = [...el.querySelectorAll("*")].find((n) => [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()));
        const r = document.createRange();
        r.selectNodeContents(words ?? el);
        const q = r.getBoundingClientRect();
        return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
      });
      await page.mouse.move(f.x, f.y);
      await page.mouse.down();
      await page.mouse.move(f.x - 12, f.y - 4, { steps: 3 });
      await page.mouse.move(f.x - 200, f.y + 160, { steps: 10 });
      const picked = await page.evaluate(() => String(getSelection()).trim());
      if (picked) found.push(`lift in a sheet: carrying a fee selected words on the way: "${picked.replace(/\s+/g, " ").slice(0, 40)}"`);
      await page.keyboard.press("Escape");
      await page.mouse.up();
      await page.evaluate(settled);
    }
    // the menu of actions the row strip's plus opens (ActionMenu, as a grip's menu)
    const strip = page.locator('dialog[open] button[data-add-slot="row"]', { hasText: "חלק לכל השורה" }).last();
    await strip.scrollIntoViewIfNeeded();
    await strip.click();
    const menu = page.locator("[role=menu]");
    if (!(await menu.count())) found.push("lift in a sheet: the row strip's plus opens no menu");
    else {
      const m = center(await menu.boundingBox());
      if (!(await page.evaluate(drawnAt, ["[role=menu]", m.x, m.y]))?.top) found.push("lift in a sheet: a menu of actions is not drawn over the sheet");
    }
    await ctx.close();
  }
  // a finger at 390: a long press on the row's head, then carried down past the next row
  {
    const { ctx, page, rows } = await openLiftSheet(browser, base, PHONE);
    const before = await rows();
    const head = page.locator("dialog[open] [data-liftable]:has([data-grip][data-lift-item='kit:row:0'])").last();
    const next = page.locator("dialog[open] [data-liftable]:has([data-grip][data-lift-item='kit:row:1'])").last();
    // the row at the top of the sheet's body; the finger stops short of the body's foot, where the body would scroll under it
    await head.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.evaluate(settled);
    const h = await head.boundingBox();
    const n = await next.boundingBox();
    const view = await page.evaluate(rowView, "kit:row:1");
    const from = { x: h.x + h.width / 2, y: h.y + Math.min(h.height / 2, 14) };
    const to = { x: from.x, y: Math.min(n.y + n.height - 4, (view?.bottom ?? 844) - 90) };
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
    const lifted = await page.waitForFunction(() => !!document.querySelector("[data-lift-ghost]"), null, { timeout: 3000 }).then(() => true, () => false);
    if (!lifted) found.push("lift in a sheet: a long press on a row's head lifts nothing");
    for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x, y: from.y + ((to.y - from.y) * i) / 10 }] });
    const ghost = lifted ? await page.evaluate(drawnAt, ["[data-lift-ghost]", to.x, to.y]) : null;
    if (ghost && !ghost.top) found.push("lift in a sheet: the row carried by a finger is not the top thing drawn at the pointer (hidden under the sheet's layer, or drawn elsewhere)");
    if (ghost && !ghost.holds) found.push("lift in a sheet: the row carried by a finger is not drawn under the finger");
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
    await page.evaluate(settled);
    if (lifted && (await rows()) === before) found.push(`lift in a sheet: a row carried by a finger below the next one and let go does not move (${before})`);
    await ctx.close();
  }
  for (const f of await liftScrollCheck(browser, base)) found.push(f);
  return found;
}

/**
 * In the page: the box the sheet's rows scroll in (the nearest around the row `item` whose height overflows), the part of the screen it
 * shows, where the row stands, whether the box is scrolled to its end and how far it has left to scroll. Null where nothing around the row scrolls.
 */
function rowView(item) {
  const grip = [...document.querySelectorAll(`dialog[open] [data-grip][data-lift-item="${item}"]`)].find((g) => !g.closest("[data-lift-ghost]"));
  let s = grip?.parentElement ?? null;
  while (s && !(s.scrollHeight > s.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement;
  if (!grip || !s) return null;
  const v = s.getBoundingClientRect();
  const r = grip.closest("[data-liftable]").getBoundingClientRect();
  return { top: v.top, bottom: v.bottom, rowTop: r.top, rowBottom: r.bottom, x: r.left + r.width / 2, shown: r.top >= v.top && r.bottom <= v.bottom, end: s.scrollTop + s.clientHeight >= s.scrollHeight - 1, left: s.scrollHeight - s.clientHeight - s.scrollTop };
}

/**
 * The lift demo's sheet, too short for its four rows (`lift in a sheet` above): the first row carried to the sheet's foot, which must scroll
 * the sheet's body to its end, then let go on the top of the last row, out of view when the carry began, which must land it just before
 * that row; with a mouse at 1440, with a finger at 390, and with a mouse whose wheel scrolls the sheet's body during the carry.
 */
async function liftScrollCheck(browser, base) {
  const found = [];
  const LAST = "kit:row:3";
  for (const how of ["mouse", "finger", "wheel"]) {
    const { ctx, page, rows } = await openLiftSheet(browser, base, how === "finger" ? PHONE : DESK);
    const say = (f) => found.push(`lift in a sheet, scrolled (${how === "finger" ? "a finger at 390" : how === "wheel" ? "a mouse's wheel at 1440" : "a mouse at 1440"}): ${f}`);
    const first = page.locator("dialog[open] [data-liftable]:has(> * [data-grip][data-lift-item='kit:row:0'], > [data-grip-box] [data-grip][data-lift-item='kit:row:0'])").first();
    await first.evaluate((el) => el.scrollIntoView({ block: "nearest" }));
    await page.evaluate(settled);
    const start = await page.evaluate(rowView, LAST);
    if (!start) {
      say("the sheet's body does not scroll, so nothing is tested");
      await ctx.close();
      continue;
    }
    if (start.shown) say("the last row is in view before the carry, so nothing is tested");
    const v0 = await page.evaluate(rowView, "kit:row:0");
    const foot = { x: v0.x, y: start.bottom - 12 };
    let cdp = null;
    const lifted = await (async () => {
      if (how === "finger") {
        const from = { x: v0.x, y: (Math.max(v0.rowTop, start.top) + Math.min(v0.rowBottom, start.bottom)) / 2 };
        cdp = await page.context().newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
        const ok = await page.waitForFunction(() => !!document.querySelector("[data-lift-ghost]"), null, { timeout: 3000 }).then(() => true, () => false);
        for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: foot.x, y: from.y + ((foot.y - from.y) * i) / 8 }] });
        return ok;
      }
      await first.hover();
      const g = center(await page.locator("dialog[open] [data-grip][data-lift-item='kit:row:0']").boundingBox());
      await page.mouse.move(g.x, g.y);
      await page.mouse.down();
      await page.mouse.move(g.x, g.y + 6, { steps: 3 });
      if (how === "mouse") await page.mouse.move(foot.x, foot.y, { steps: 8 });
      else {
        // the pointer where the top of the last row will stand once the body is scrolled to its end, then the wheel, then let go with no
        // move: only a carry that aims again as the body scrolls under the still pointer lands the row there
        const v = await page.evaluate(rowView, LAST);
        await page.mouse.move(v.x, v.rowTop - v.left + 6, { steps: 8 });
        await page.mouse.wheel(0, 3000);
      }
      return !!(await page.evaluate(() => document.querySelector("[data-lift-ghost]")));
    })();
    if (!lifted) say("the first row lifts nothing");
    else {
      const reached = await page.waitForFunction((item) => {
        const grip = [...document.querySelectorAll(`dialog[open] [data-grip][data-lift-item="${item}"]`)].find((g) => !g.closest("[data-lift-ghost]"));
        let s = grip?.parentElement ?? null;
        while (s && !(s.scrollHeight > s.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement;
        return !!s && s.scrollTop + s.clientHeight >= s.scrollHeight - 1;
      }, LAST, { timeout: 5000 }).then(() => true, () => false);
      if (!reached) say(how === "wheel" ? "the wheel does not scroll the sheet's body during the carry" : "carried to the sheet's foot, the sheet's body does not scroll to its end");
      await page.evaluate(settled);
      const end = await page.evaluate(rowView, LAST);
      // the top of the last row: the place just before it, which a drop aimed by places as they stood before the scroll would miss
      const to = { x: end.x, y: Math.max(end.rowTop, end.top) + 6 };
      if (how === "wheel") await page.mouse.up();
      else if (how === "finger") {
        for (let i = 1; i <= 3; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: to.x, y: foot.y + ((to.y - foot.y) * i) / 3 }] });
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      } else {
        await page.mouse.move(to.x, to.y, { steps: 3 });
        await page.mouse.up();
      }
      await page.evaluate(settled);
      const after = (await rows()).split(",");
      if (after.join(",") !== "kit:row:1,kit:row:2,kit:row:0,kit:row:3") say(`the first row let go on the top of the last row, out of view when it was lifted, does not land just before it (${after.join(",")})`);
    }
    if (cdp) await cdp.detach();
    await ctx.close();
  }
  return found;
}

/**
 * On the fee page's deal at 1024 (`toolbox carry` above), with its first fee and first case open: the first card the docked toolbox offers
 * carried by a mouse over a place that takes it (A), the page wheeled down by the distance to the place under it in the same column (B),
 * and let go there with no move. B must take the card; A and B are read by their keys, and the card's drop changes what B says.
 */
async function toolboxCarryCheck(browser, base) {
  const file = new URL("./layout-check-deal.txt", import.meta.url);
  if (!existsSync(file)) return [];
  const found = [];
  const say = (f) => found.push(`toolbox carry: ${f}`);
  const { ctx, page } = await open(browser, base, { ...CONTEXT, viewport: { width: 1024, height: 800 } }, readFileSync(file, "utf8").trim());
  await page.evaluate(() => document.querySelector("main [data-fee-head]")?.click());
  await page.evaluate(settled);
  await page.locator("main [role=gridcell][data-liftable]").first().click();
  await page.evaluate(settled);
  // nothing failed: the browser's own reports (a ResizeObserver loop as the toolbox docks) raise no failure notice
  if (await page.getByRole("alert").filter({ hasText: "משהו בעמוד השתבש" }).count()) say("opening a fee raises the notice that a script failed, with nothing failed");
  const cards = page.locator("[data-tool-sheet][data-docked] [data-drag-source]");
  for (const chip of await page.locator("[data-tool-sheet][data-docked] [role=radio]").all()) {
    if (await cards.count()) break;
    await chip.click();
    await page.evaluate(settled);
  }
  if (!(await cards.count())) {
    say("the docked toolbox offers no card to carry, so nothing is tested");
    await ctx.close();
    return found;
  }
  await cards.first().scrollIntoViewIfNeeded();
  const c = center(await cards.first().boundingBox());
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x - 10, c.y - 10, { steps: 3 });
  // two cases that take the card, one above the other in a column, both under the header and over the toolbox, the page room to scroll
  const pair = await page.evaluate(() => {
    const top = (document.querySelector("[data-site-header]")?.getBoundingClientRect().bottom ?? 0) + 8;
    const foot = (document.querySelector("[data-tool-sheet]")?.getBoundingClientRect().top ?? innerHeight) - 8;
    const room = document.documentElement.scrollHeight - innerHeight - scrollY;
    // cases (a grid's cells), whose words a card dropped on them changes
    const zones = [...document.querySelectorAll("main [data-drop-zone]")].filter((z) => z.querySelector("[role=gridcell]") || z.closest("[role=gridcell]")).map((z) => ({ key: z.getAttribute("data-drop-key"), r: z.getBoundingClientRect(), text: z.innerText }));
    for (const a of zones)
      for (const b of zones) {
        const ay = a.r.top + a.r.height / 2, by = b.r.top + b.r.height / 2;
        if (Math.abs(a.r.left - b.r.left) < 2 && by > a.r.bottom && ay > top && ay < foot && by - ay < room) return { a: a.key, b: b.key, x: a.r.left + a.r.width / 2, y: ay, by: Math.round(by - ay), text: b.text };
      }
    return null;
  });
  if (!pair) say("no two places that take the card stand one above the other in view, so nothing is tested");
  else {
    await page.mouse.move(pair.x, pair.y, { steps: 6 });
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, pair.by);
    await page.waitForFunction((y) => scrollY !== y, before, { timeout: 3000 }).catch(() => say("the wheel does not scroll the page during the carry"));
    await page.evaluate(settled);
    const under = await page.evaluate(([key, x, y]) => {
      const r = document.querySelector(`[data-drop-key="${key}"]`)?.getBoundingClientRect();
      return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }, [pair.b, pair.x, pair.y]);
    if (!under) say("after the wheel the lower place does not stand under the pointer, so nothing is tested");
    await page.mouse.up();
    await page.evaluate(settled);
    const after = await page.evaluate((key) => document.querySelector(`[data-drop-key="${key}"]`)?.innerText ?? null, pair.b);
    if (under && after === pair.text) say("a card carried from the docked toolbox and let go on a case after the page was wheeled under the still pointer does not land on that case");
  }
  await ctx.close();
  return found;
}

/**
 * The failure notice over an open sheet (`notice in a sheet` above), with a failure planted as an `error` event the site counts as its own
 * (a thrown value, in a script under its address): the confirmation's sheet at the foot of a phone at 390; and at 1440 the lift demo's
 * sheet, centred on the window by a transform and held to 5rem, shorter than the notice. The notice's title and its reload button must each
 * be the top thing at their own middle, the notice's foot at the window's foot, and a press on the button must load the page again.
 */
async function noticeSheetCheck(browser, base) {
  const found = [];
  const plant = (page) => page.evaluate(() => window.dispatchEvent(new ErrorEvent("error", { message: "planted", error: new Error("planted"), filename: location.href })));
  for (const at of ["phone", "desk"]) {
    const where = at === "phone" ? "at 390, the confirmation's sheet open" : "at 1440, a short centred sheet open";
    const { ctx, page } = await open(browser, base, at === "phone" ? PHONE : DESK);
    const opener = at === "phone" ? page.locator('article[aria-label="ConfirmAsk"] button').first() : page.locator('article[aria-label="Grip, DropBin, SpanKnob, EditInPlace"] button', { hasText: "לפתוח את העמלה בחלון" });
    await opener.scrollIntoViewIfNeeded();
    await (at === "phone" ? opener.tap() : opener.click());
    await page.locator("dialog[open]").waitFor({ timeout: 3000 });
    if (at === "desk") await page.addStyleTag({ content: "dialog[open] { max-height: 5rem !important; }" });
    await page.evaluate(settled);
    await plant(page);
    await page.evaluate(settled);
    const notice = page.getByRole("alert").filter({ hasText: "משהו בעמוד השתבש" });
    const reload = notice.getByRole("button", { name: "לרענן את העמוד" });
    if (!(await reload.count())) {
      found.push(`notice in a sheet: ${where}, a planted failure shows no notice`);
      await ctx.close();
      continue;
    }
    const seen = await notice.evaluate((n) => {
      const top = (el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !!hit && el.contains(hit);
      };
      const title = [...n.querySelectorAll("*")].find((e) => e.childElementCount === 0 && e.textContent.trim() === "משהו בעמוד השתבש");
      return { title: !!title && top(title), button: top(n.querySelector("button")), foot: Math.abs(innerHeight - n.getBoundingClientRect().bottom) <= 2 };
    });
    if (!seen.title) found.push(`notice in a sheet: ${where}, the failure notice's title is not the top thing at its middle (hidden under the sheet, or cut by it)`);
    if (!seen.button) found.push(`notice in a sheet: ${where}, the failure notice's reload button is not the top thing at its middle (hidden under the sheet, or cut by it)`);
    if (!seen.foot) found.push(`notice in a sheet: ${where}, the failure notice does not stand at the window's foot`);
    const b = center(await reload.boundingBox());
    const loaded = page.waitForEvent("load", { timeout: 5000 }).then(() => true, () => false);
    await (at === "phone" ? page.touchscreen.tap(b.x, b.y) : page.mouse.click(b.x, b.y));
    if (!(await loaded)) found.push(`notice in a sheet: ${where}, a press on the failure notice's reload button does not reload the page`);
    await ctx.close();
  }
  return found;
}
