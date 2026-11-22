// The kit's pieces as a hand uses them, on the built kit page, with real keys, a mouse and a finger (Chrome's own touch events, which
// scroll the page the way a phone does, for a drag; Playwright's touchscreen for a tap). Run by the layout check; each check returns what
// failed, in words:
//   field    a number field typed in: a wrong value's error shown before the hand rests, or not shown after a pause or on leaving the
//            field, or not cleared by the keystroke that fixes it; a wrong text the box does not mark as wrong at once (a form's Save
//            reads that mark); a right value not taking effect at once (the slider follows the box); what was typed cleared; an error
//            left from before a value came from outside shown at once on the next wrong keystroke; the slider field's error spoken as an
//            alert; a number box without autocomplete off, spellcheck off and enterkeyhint done, or a shekel box without a whole-number
//            pad.
//   early    a number field typed in before the page's script arrived that loses what was typed, or the keystrokes after it (on the
//            deposits page: the kit page's script draws it again rather than taking it over).
//   slider   a slider without its value at each end, or one a finger drags across that does not follow it.
//   sheet    with the sheets' motion played: a sheet that does not open with the focus on its first thing to act on, that Escape (the
//            browser's close request, which the phone's Back sends on Android) or its X does not close, that does not give the focus back
//            to what opened it; a sheet opened from inside another that shows over it rather than in its place, leaves the one under it
//            modal (the close request would reach it), has no way back to it, or brings it back scrolled elsewhere; Escape on the top of
//            two sheets that does not bring back the other with the focus on what opened the top one, a second Escape that does not close
//            that one, or two quick Escapes that leave one open; sheets that add history entries.
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
//   touch    a chart dragged sideways by a finger that does not follow it, or that keeps the page from scrolling when the finger moves down.

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
  for (const run of [fieldCheck, earlyCheck, sliderCheck, sheetCheck, sheetLeaveCheck, popoverCheck, throughCheck, stripCheck, sideCheck, touchCheck]) {
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
  if ((await box.getAttribute("data-wrong")) === null) found.push("field: a wrong value typed is not marked wrong on the box at once (a form's Save would take it)");
  await error.waitFor({ timeout: 3000 }).catch(() => found.push("field: the error of a wrong value does not show after a pause in the typing"));
  if (Date.now() - typedAt < 400) found.push("field: the error shows before the hand has rested");
  if ((await box.inputValue()) !== "50") found.push(`field: the wrong value typed is not kept in the box (it holds "${await box.inputValue()}")`);
  if (await field.locator('[role="alert"]').count()) found.push("field: the slider field's error is an alert, spoken on every keystroke");
  await page.keyboard.press("Backspace");
  if (await error.count()) found.push("field: the keystroke that fixes the value does not clear its error");
  if ((await slider.inputValue()) !== "5") found.push(`field: a right value typed does not take effect at once (the slider stands at ${await slider.inputValue()}, not 5)`);
  if ((await box.getAttribute("data-wrong")) !== null) found.push("field: a right value typed is still marked wrong on the box");
  await page.keyboard.type("0");
  if (await error.count()) found.push("field: a wrong value typed after a right one shows its error before the hand rests");
  await page.keyboard.press("Tab");
  if (!(await error.count())) found.push("field: a wrong value's error does not show on leaving the field");
  if ((await box.inputValue()) !== "50") found.push("field: leaving the field clears the wrong value typed");
  if ((await slider.inputValue()) !== "5") found.push("field: the last right result does not stay while the value is wrong");
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
 * A number field typed in before the page's script arrived: what was typed stays, and the keystrokes after the script are not lost. On the
 * deposits page's amount, a page whose script takes over its pre-rendered fields in place.
 */
async function earlyCheck(browser, base) {
  const found = [];
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
  await page.keyboard.type("5");
  release();
  await page.waitForFunction(() => !!window.__reactRouterDataRouter, null, { timeout: 15000 });
  await page.evaluate(settled);
  if ((await box.inputValue()) !== "5") found.push(`early: a field typed in before the script arrived holds "${await box.inputValue()}", not the 5 typed`);
  // a wrong keystroke after it: the box keeps what was typed rather than the field's own value
  await page.keyboard.type("x");
  if ((await box.inputValue()) !== "5x") found.push(`early: a keystroke after the script arrived in a field typed in before is lost (the box holds "${await box.inputValue()}", not 5x)`);
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
    await page.locator('[data-site-header] button[class~="lg:hidden"]').tap();
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
