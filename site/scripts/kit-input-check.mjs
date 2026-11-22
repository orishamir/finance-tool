// The kit's pieces as a hand uses them, on the built kit page, with real keys, a mouse and a finger (Chrome's own touch events, which
// scroll the page the way a phone does, for a drag; Playwright's touchscreen for a tap). Run by the layout check; each check returns what
// failed, in words:
//   field    a number field typed in: a wrong value's error shown before the hand rests, or not shown after a pause or on leaving the
//            field, or not cleared by the keystroke that fixes it; a right value not taking effect at once (the slider follows the
//            box); what was typed cleared; the slider field's error spoken as an alert; a number box without autocomplete off, spellcheck
//            off and enterkeyhint done, or a shekel box without a whole-number pad.
//   slider   a slider without its value at each end, or one a finger drags across that does not follow it.
//   sheet    a sheet that does not open with the focus on its first thing to act on, that the phone's Back does not close (or that
//            leaves the page with it), whose X leaves its history entry behind, that does not give the focus back to what opened it,
//            or a sheet opened from inside another that shows over it rather than in its place, with no way back to it.
//   popover  a figure's source note that a tap outside or Escape on its link does not close.
//   through  a press on a card's surface that a part positioned over its button (a block holding a grip) does not let through to the
//            button, checked on every case row and pick card, after a positioned block planted in a pick card is caught; a case row whose
//            press there does not open it; a pick card's tile choice not chosen by Space.
//   strip    a product table's folding strip that a tap on its words does not fold.
//   touch    a chart dragged sideways by a finger that does not follow it, or that keeps the page from scrolling when the finger moves down.

const CONTEXT = { locale: "he-IL", timezoneId: "Asia/Jerusalem", reducedMotion: "reduce", colorScheme: "dark" };
const PHONE = { ...CONTEXT, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const DESK = { ...CONTEXT, viewport: { width: 1440, height: 900 } };

/** Two frames after the browser is idle: what a render started has been drawn. */
const settled = () => {
  const once = () => new Promise((done) => requestIdleCallback(() => requestAnimationFrame(() => requestAnimationFrame(() => done())), { timeout: 10000 }));
  return once().then(once);
};

async function open(browser, base, options) {
  const ctx = await browser.newContext(options);
  const page = await ctx.newPage();
  await page.goto(`${base}/kit`, { waitUntil: "networkidle" });
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
  for (const run of [fieldCheck, sliderCheck, sheetCheck, popoverCheck, throughCheck, stripCheck, touchCheck]) {
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
  await box.scrollIntoViewIfNeeded();
  await box.click();
  await box.press("ControlOrMeta+a");
  await page.keyboard.type("50");
  const typedAt = Date.now();
  if (await error.count()) found.push("field: the error of a wrong value (50 years of 1 to 40) shows as it is typed, before the hand rests");
  await error.waitFor({ timeout: 3000 }).catch(() => found.push("field: the error of a wrong value does not show after a pause in the typing"));
  if (Date.now() - typedAt < 400) found.push("field: the error shows before the hand has rested");
  if ((await box.inputValue()) !== "50") found.push(`field: the wrong value typed is not kept in the box (it holds "${await box.inputValue()}")`);
  if (await field.locator('[role="alert"]').count()) found.push("field: the slider field's error is an alert, spoken on every keystroke");
  await page.keyboard.press("Backspace");
  if (await error.count()) found.push("field: the keystroke that fixes the value does not clear its error");
  if ((await slider.inputValue()) !== "5") found.push(`field: a right value typed does not take effect at once (the slider stands at ${await slider.inputValue()}, not 5)`);
  await page.keyboard.type("0");
  if (await error.count()) found.push("field: a wrong value typed after a right one shows its error before the hand rests");
  await page.keyboard.press("Tab");
  if (!(await error.count())) found.push("field: a wrong value's error does not show on leaving the field");
  if ((await box.inputValue()) !== "50") found.push("field: leaving the field clears the wrong value typed");
  if ((await slider.inputValue()) !== "5") found.push("field: the last right result does not stay while the value is wrong");
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

async function sliderCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, PHONE);
  const field = page.locator('article[aria-label="RangeField"] .range-field').first();
  const ends = await field.locator("[data-slider-ends] > *").allTextContents();
  if (ends.join("|") !== "1|40") found.push(`slider: the years slider (1 to 40) shows "${ends.join("|")}" at its ends`);
  const all = await page.locator('main input[type="range"]').count();
  const withEnds = await page.locator("main .range-field [data-slider-ends]").count();
  if (withEnds < all) found.push(`slider: ${all - withEnds} of the ${all} sliders on the kit page show no value at their ends`);
  const slider = field.locator('input[type="range"]');
  await slider.scrollIntoViewIfNeeded();
  const r = await slider.boundingBox();
  const before = Number(await slider.inputValue());
  // right to left: the least at the right end, so the finger moves left to grow it
  await touchDrag(page, { x: r.x + r.width - 6, y: r.y + r.height / 2 }, { x: r.x + 6, y: r.y + r.height / 2 });
  await page.evaluate(settled);
  const after = Number(await slider.inputValue());
  if (!(after > before && after >= 35)) found.push(`slider: a finger dragged from its right end to its left does not carry it up (${before} to ${after})`);
  if ((await field.locator("input.field-input").inputValue()) !== String(after)) found.push("slider: the box does not follow the slider a finger drags");
  await ctx.close();
  return found;
}

async function sheetCheck(browser, base) {
  const found = [];
  const { ctx, page } = await open(browser, base, PHONE);
  const shown = () => page.evaluate(() => [...document.querySelectorAll("dialog")].filter((d) => d.open).length);
  const marked = () => page.evaluate(() => history.state?.sheetEntry !== undefined);
  await page.evaluate(() => (window.__samePage = true));
  const opener = page.locator('article[aria-label="ConfirmAsk"] button').first();
  await opener.scrollIntoViewIfNeeded();
  await opener.tap();
  await page.locator("dialog[open]").waitFor({ timeout: 3000 });
  await page.evaluate(settled);
  if (!(await page.evaluate(() => document.activeElement?.hasAttribute("data-autofocus")))) found.push("sheet: the confirmation does not open with the focus on its first thing to act on");
  if (await page.evaluate(() => document.querySelector("dialog[open]")?.hasAttribute("tabindex"))) found.push("sheet: the dialog carries a tabindex");
  await page.goBack();
  await page.waitForFunction(() => ![...document.querySelectorAll("dialog")].some((d) => d.open), null, { timeout: 3000 }).catch(() => found.push("sheet: the phone's Back does not close the sheet"));
  if (!(await page.evaluate(() => window.__samePage === true && location.pathname.endsWith("/kit")))) found.push("sheet: the phone's Back left the page instead of closing the sheet");
  if (!(await opener.evaluate((el) => el === document.activeElement))) found.push("sheet: the focus does not go back to what opened the sheet");
  await opener.tap();
  await page.locator("dialog[open]").waitFor({ timeout: 3000 });
  await page.locator("dialog[open] .sheet-head button").last().tap();
  await page.waitForFunction(() => ![...document.querySelectorAll("dialog")].some((d) => d.open), null, { timeout: 3000 });
  await page.evaluate(settled);
  if (await marked()) found.push("sheet: a sheet closed by its X leaves its history entry behind (Back would do nothing once)");
  // a rule opened from inside a label's sheet takes its place, with a way back
  const label = page.locator("main button[data-label]").first();
  await label.scrollIntoViewIfNeeded();
  await label.tap();
  const first = page.locator("dialog[open]");
  await first.waitFor({ timeout: 3000 });
  const rule = first.locator(".rule-chip").first();
  if (!(await rule.count())) found.push("sheet: the label sheet on the kit page holds no rule to open from it");
  else {
    const firstId = await first.evaluate((d) => [...document.querySelectorAll("dialog")].indexOf(d));
    await rule.tap();
    await page.waitForFunction((i) => !document.querySelectorAll("dialog")[i].open && [...document.querySelectorAll("dialog")].some((d) => d.open), firstId, { timeout: 3000 }).catch(() => found.push("sheet: a rule opened from inside a sheet shows over it instead of in its place"));
    await page.evaluate(settled);
    if ((await shown()) !== 1) found.push(`sheet: ${await shown()} sheets show at once`);
    const back = page.locator("dialog[open] .sheet-head[data-back] button").first();
    if (!(await back.count())) found.push("sheet: a sheet opened from inside another has no way back to it");
    else {
      await back.tap();
      await page.waitForFunction((i) => document.querySelectorAll("dialog")[i].open, firstId, { timeout: 3000 }).catch(() => found.push("sheet: the way back does not bring back the sheet it was opened from"));
      await page.evaluate(settled);
      if (!(await rule.evaluate((el) => el === document.activeElement))) found.push("sheet: back in the first sheet, the focus is not on the rule that opened the second");
      // the phone's Back from a sheet opened inside another goes back to that one, then closes it
      await rule.tap();
      await page.waitForFunction((i) => !document.querySelectorAll("dialog")[i].open, firstId, { timeout: 3000 });
      await page.goBack();
      await page.waitForFunction((i) => document.querySelectorAll("dialog")[i].open, firstId, { timeout: 3000 }).catch(() => found.push("sheet: the phone's Back from a sheet opened inside another does not bring that one back"));
      await page.goBack();
      await page.waitForFunction(() => ![...document.querySelectorAll("dialog")].some((d) => d.open), null, { timeout: 3000 }).catch(() => found.push("sheet: the phone's Back does not close the first sheet after the second"));
      if (!(await page.evaluate(() => window.__samePage === true))) found.push("sheet: the phone's Back left the page");
    }
  }
  await ctx.close();
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
