// act.mjs: a browser you drive from the shell, one command at a time.
//
//   node act.mjs open <url> [pc|phone]     open a page (pc: 1440 x 900; phone: 390 x 844, touch, 2x pixels)
//   node act.mjs click "<visible text>"    click (on a phone: tap) the control or text that shows these words
//   node act.mjs click <x> <y>             click at a point of the last screenshot, in its own pixels
//   node act.mjs type "<text>"             type into the field that has the focus
//   node act.mjs fill "<field label>" "<text>"   empty a field found by its label and type into it
//   node act.mjs press <key>               press a key (Enter, Tab, Escape, PageDown, ...)
//   node act.mjs scroll <down|up> [px]     scroll the page (default: most of a screen)
//   node act.mjs slider "<label>" <value>  set a slider found by its label
//   node act.mjs back                      go back one page
//   node act.mjs look                      take a new screenshot without doing anything
//   node act.mjs zoom <x> <y>              a close-up, twice as large, around a point of the last screenshot
//
// Each command answers with the path of a new screenshot (read it) and what can be clicked on screen.
// The browser stays open between commands: the first command starts a small background process that holds it.
import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import http from "node:http";
import { join } from "node:path";

const HERE = process.cwd();
const DRIVER = join(HERE, ".act-driver.json");
const CONFIG = join(HERE, "act-config.json");
const LOG = join(HERE, "actions.jsonl");
const PLAYWRIGHT = process.env.ACT_PLAYWRIGHT || "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/";
const CHROME = process.env.ACT_CHROME || "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";

const readJson = (p, d) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return d;
  }
};
const config = () => ({ device: "pc", maxActions: 60, deadline: 0, ...readJson(CONFIG, {}) });

// ---------------------------------------------------------------- the driver (a background process holding the browser)
async function serve() {
  const { createRequire } = await import("node:module");
  const require = createRequire(PLAYWRIGHT);
  const { chromium } = require("playwright");
  const cfg = config();
  const phone = cfg.device === "phone";
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const context = await browser.newContext(
    phone
      ? {
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
          userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
          locale: "he-IL",
          timezoneId: "Asia/Jerusalem",
        }
      : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "he-IL", timezoneId: "Asia/Jerusalem" },
  );
  // only web pages: a session may not open files or the browser's own pages
  await context.route(/^(?!https?:|data:|blob:|about:blank)/, (route) => route.abort());
  for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(0)));
  let pages = [await context.newPage()];
  context.on("page", (p) => {
    pages.push(p);
    p.on("close", () => (pages = pages.filter((q) => q !== p)));
  });
  const page = () => pages[pages.length - 1];
  const dpr = phone ? 2 : 1;
  let n = readJson(join(HERE, ".act-count.json"), { n: 0 }).n;
  let lastIdle = Date.now();
  setInterval(() => {
    if (Date.now() - lastIdle > 20 * 60 * 1000) process.exit(0);
  }, 30000).unref();

  // a person looks once the screen stops changing: the page loaded, the network quiet, and no change to the page for
  // 400 ms (figures that are worked out after a field changes), at most 4 s
  async function settle(p) {
    try {
      await p.waitForLoadState("domcontentloaded", { timeout: 15000 });
      await p.waitForLoadState("networkidle", { timeout: 4000 });
    } catch {}
    await p
      .evaluate(
        () =>
          new Promise((done) => {
            let t = setTimeout(finish, 400);
            const mo = new MutationObserver(() => {
              clearTimeout(t);
              t = setTimeout(finish, 400);
            });
            const cap = setTimeout(finish, 4000);
            function finish() {
              mo.disconnect();
              clearTimeout(cap);
              done();
            }
            mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
          }),
      )
      .catch(() => {});
    await p.waitForTimeout(150);
  }

  // what a person could click or use on screen now, in screenshot pixels
  async function onScreen(p) {
    return p.evaluate((dpr) => {
      const sel =
        'a[href], button, input, select, textarea, summary, [role=button], [role=link], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=slider], [role=option], [role=menuitem], [role=combobox], [tabindex]:not([tabindex="-1"])';
      const vw = innerWidth,
        vh = innerHeight;
      // the words a sighted person sees first; the accessible name only for a control without visible words
      const textOf = (el) => {
        const seen = (el.innerText || "").trim();
        if (seen && el.tagName !== "INPUT" && el.tagName !== "SELECT" && el.tagName !== "TEXTAREA") return seen;
        const lab = el.getAttribute("aria-label");
        if (lab) return lab;
        const by = el.getAttribute("aria-labelledby");
        if (by) {
          const t = by
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.innerText || "")
            .join(" ")
            .trim();
          if (t) return t;
        }
        if (el.id) {
          const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
          if (l?.innerText.trim()) return l.innerText;
        }
        const t = (el.innerText || "").trim();
        if (t) return t;
        return el.getAttribute("placeholder") || el.getAttribute("title") || el.querySelector("img[alt]")?.alt || el.value || "";
      };
      const out = [];
      const seen = new Set();
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
        if (el.closest("[aria-hidden=true], [inert]")) continue;
        const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)),
          cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
        const top = document.elementFromPoint(cx, cy);
        if (top && !(el === top || el.contains(top) || top.contains(el)) && el.tagName !== "INPUT") continue;
        let kind = el.tagName.toLowerCase();
        const role = el.getAttribute("role");
        if (kind === "a" || role === "link") kind = "link";
        else if (kind === "input" && el.type === "range") kind = "slider";
        else if (role === "slider") kind = "slider";
        else if (kind === "input" && (el.type === "checkbox" || el.type === "radio")) kind = el.type;
        else if (kind === "input" || kind === "textarea") kind = "field";
        else if (kind === "select" || role === "combobox") kind = "choice";
        else if (role === "tab") kind = "tab";
        else if (role === "checkbox" || role === "switch") kind = "checkbox";
        else kind = "button";
        let text = textOf(el).replace(/\s+/g, " ").trim();
        if (text.length > 70) text = text.slice(0, 67) + "...";
        let extra = "";
        if (kind === "slider") extra = ` = ${el.value ?? el.getAttribute("aria-valuenow")} (from ${el.min ?? el.getAttribute("aria-valuemin")} to ${el.max ?? el.getAttribute("aria-valuemax")})`;
        else if (kind === "field") extra = ` = "${el.value}"`;
        else if (kind === "choice" && el.tagName === "SELECT") extra = ` = "${el.selectedOptions[0]?.text || ""}"`;
        else if (kind === "checkbox" || kind === "radio") extra = el.checked || el.getAttribute("aria-checked") === "true" ? " (on)" : " (off)";
        else if (el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-pressed") === "true") extra = " (chosen)";
        else if (el.getAttribute("aria-expanded")) extra = el.getAttribute("aria-expanded") === "true" ? " (open)" : " (closed)";
        const key = `${kind}|${text}|${Math.round(cx / 8)}|${Math.round(cy / 8)}`;
        if (seen.has(key) || (!text && kind !== "field" && kind !== "slider")) continue;
        seen.add(key);
        out.push({ kind, text, extra, x: Math.round(cx * dpr), y: Math.round(cy * dpr) });
      }
      const doc = document.scrollingElement || document.documentElement;
      return {
        items: out.slice(0, 80),
        more: Math.max(0, out.length - 80),
        title: document.title,
        url: location.href,
        scroll: { y: Math.round(scrollY), height: Math.round(doc.scrollHeight), view: vh },
      };
    }, dpr);
  }

  // find a control by the words a person sees on it, anywhere on the page; returns its centre after scrolling it into view
  async function findByText(p, words, kinds) {
    const handle = await p.evaluateHandle(
      ({ words, kinds }) => {
        const norm = (s) => (s || "").replace(/[‎‏⁦-⁩]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        const w = norm(words);
        const sel =
          kinds === "slider"
            ? 'input[type=range], [role=slider]'
            : kinds === "field"
              ? "input:not([type=range]):not([type=checkbox]):not([type=radio]), textarea, select"
              : 'a[href], button, input, select, textarea, summary, label, [role=button], [role=link], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=option], [role=menuitem], [role=combobox], [tabindex]:not([tabindex="-1"])';
        const labelOf = (el) => {
          const parts = [el.getAttribute("aria-label"), el.getAttribute("placeholder"), el.getAttribute("title")];
          const by = el.getAttribute("aria-labelledby");
          if (by) for (const id of by.split(/\s+/)) parts.push(document.getElementById(id)?.innerText);
          if (el.id) parts.push(document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText);
          parts.push(el.closest("label")?.innerText);
          if (kinds !== "slider" && kinds !== "field") parts.push(el.innerText, el.value);
          else parts.push(el.closest(".field, fieldset, [role=group]")?.innerText);
          return parts.filter(Boolean).map(norm);
        };
        const visible = (el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 1 && r.height > 1 && cs.visibility !== "hidden" && cs.display !== "none" && !el.closest("[aria-hidden=true], [inert]");
        };
        const inView = (el) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < innerHeight;
        };
        const scored = [];
        for (const el of document.querySelectorAll(sel)) {
          if (!visible(el)) continue;
          const labels = labelOf(el);
          let s = 0;
          if (labels.some((l) => l === w)) s = 3;
          else if (labels.some((l) => l.startsWith(w))) s = 2;
          else if (labels.some((l) => l.includes(w))) s = 1;
          if (s) scored.push({ el, s: s * 10 + (inView(el) ? 5 : 0) - Math.min(4, labels[0]?.length / 100 || 0) });
        }
        if (!scored.length && kinds !== "slider" && kinds !== "field") {
          // any text on the page (a card or a row that reacts to a click without being a button)
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
          let best = null;
          while (walker.nextNode()) {
            const el = walker.currentNode;
            if (!visible(el) || !norm(el.innerText).includes(w)) continue;
            if ([...el.children].some((c) => visible(c) && norm(c.innerText).includes(w))) continue;
            const s = (norm(el.innerText) === w ? 3 : 1) * 10 + (inView(el) ? 5 : 0);
            if (!best || s > best.s) best = { el, s };
          }
          if (best) scored.push(best);
        }
        scored.sort((a, b) => b.s - a.s);
        window.__actMatches = scored.length;
        return scored[0]?.el || null;
      },
      { words, kinds },
    );
    const el = handle.asElement();
    if (!el) return null;
    const matches = await p.evaluate(() => window.__actMatches);
    await el.scrollIntoViewIfNeeded().catch(() => {});
    const box = await el.boundingBox();
    return { el, box, matches };
  }

  async function shoot(p, label, clip) {
    n += 1;
    writeFileSync(join(HERE, ".act-count.json"), JSON.stringify({ n }));
    mkdirSync(join(HERE, "shots"), { recursive: true });
    const file = `shots/${String(n).padStart(3, "0")}-${label}.png`;
    await p.screenshot({ path: join(HERE, file), ...(clip ? { clip, scale: "device" } : {}) });
    return file;
  }

  async function run(argv) {
    const [cmd, ...a] = argv;
    let p = page();
    let note = "";
    if (cmd === "open") {
      const url = a[0];
      if (!/^https?:\/\//.test(url || "")) return "Only web addresses (http or https) can be opened.";
      await p.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch((e) => (note = `The page did not load fully (${e.message.split("\n")[0]}).`));
    } else if (cmd === "click" || cmd === "tap") {
      let x, y;
      if (a.length >= 2 && /^\d+$/.test(a[0]) && /^\d+$/.test(a[1])) {
        x = Number(a[0]) / dpr;
        y = Number(a[1]) / dpr;
      } else {
        const f = await findByText(p, a.join(" "), "any");
        if (!f || !f.box) return `Nothing on the page shows the words "${a.join(" ")}". Look at the screenshot and try other words, or click x y.`;
        x = f.box.x + f.box.width / 2;
        y = f.box.y + f.box.height / 2;
        if (f.matches > 1) note = `${f.matches} places show these words; the one on screen (or nearest the top) was used.`;
      }
      const before = pages.length;
      if (phone) await p.touchscreen.tap(x, y);
      else await p.mouse.click(x, y);
      await p.waitForTimeout(300);
      if (pages.length > before) {
        note += " It opened in a new tab, now in front; 'back' closes it.";
        p = page();
      }
    } else if (cmd === "type") {
      await p.keyboard.type(a.join(" "), { delay: 15 });
    } else if (cmd === "fill") {
      const f = await findByText(p, a[0] || "", "field");
      if (!f) return `No field is labelled "${a[0]}".`;
      await f.el.click({ clickCount: 3 }).catch(() => {});
      await p.keyboard.press("ControlOrMeta+A");
      await p.keyboard.type(a.slice(1).join(" "), { delay: 15 });
      await p.keyboard.press("Tab");
    } else if (cmd === "press") {
      await p.keyboard.press(a[0] || "Enter");
    } else if (cmd === "scroll") {
      const dir = a[0] === "up" ? -1 : 1;
      const px = Number(a[1]) || Math.round((phone ? 844 : 900) * 0.8);
      if (phone) await p.evaluate((d) => scrollBy(0, d), dir * px);
      else await p.mouse.wheel(0, dir * px);
      await p.waitForTimeout(400);
    } else if (cmd === "slider") {
      const value = a[a.length - 1];
      const label = a.slice(0, -1).join(" ");
      const f = await findByText(p, label, "slider");
      if (!f) return `No slider is labelled "${label}".`;
      const got = await f.el.evaluate((el, v) => {
        if (el.tagName === "INPUT") {
          const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
          set.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          return el.value;
        }
        return null;
      }, value);
      if (got === null) {
        // an ARIA slider: focus it and use the keys
        await f.el.focus();
        const now = Number(await f.el.getAttribute("aria-valuenow"));
        const steps = Math.round(Number(value) - now);
        for (let i = 0; i < Math.min(200, Math.abs(steps)); i++) await p.keyboard.press(steps > 0 ? "ArrowRight" : "ArrowLeft");
      } else if (String(got) !== String(value)) note = `The slider took ${got} (its nearest allowed value).`;
    } else if (cmd === "back") {
      if (pages.length > 1) {
        await p.close();
        p = page();
      } else await p.goBack({ timeout: 15000 }).catch(() => (note = "There is no page to go back to."));
    } else if (cmd === "look") {
      // nothing to do
    } else if (cmd === "zoom") {
      const x = Number(a[0]) / dpr,
        y = Number(a[1]) / dpr;
      const vw = phone ? 390 : 1440,
        vh = phone ? 844 : 900;
      const w = vw / 2,
        h = vh / 2;
      const clip = { x: Math.max(0, Math.min(vw - w, x - w / 2)), y: Math.max(0, Math.min(vh - h, y - h / 2)), width: w, height: h };
      const file = await shoot(p, "zoom", clip);
      // a close-up: twice the pixels of the same region
      return `screenshot: ${file} (a close-up of the area around ${a[0]},${a[1]}; read it)`;
    } else {
      return `Unknown command "${cmd}". Commands: open, click, type, fill, press, scroll, slider, back, look, zoom.`;
    }
    await settle(p);
    const file = await shoot(p, cmd);
    const s = await onScreen(p);
    const pct = s.scroll.height > s.scroll.view ? Math.round((100 * s.scroll.y) / (s.scroll.height - s.scroll.view)) : 0;
    const lines = [
      `screenshot: ${file} (read it to see the screen)`,
      `page: ${s.title} | ${decodeURI(s.url)}`,
      `scrolled: ${pct}% of the page (${s.scroll.y} of ${Math.max(0, s.scroll.height - s.scroll.view)} px)`,
    ];
    if (note) lines.push(`note: ${note.trim()}`);
    lines.push(`on screen you can use (x y in screenshot pixels):`);
    for (const i of s.items) lines.push(`- ${i.kind} "${i.text}"${i.extra} at ${i.x} ${i.y}`);
    if (s.more) lines.push(`- and ${s.more} more`);
    return lines.join("\n");
  }

  let queue = Promise.resolve();
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      lastIdle = Date.now();
      const argv = JSON.parse(body || "[]");
      if (argv[0] === "__quit") {
        res.end("bye");
        browser.close().finally(() => process.exit(0));
        return;
      }
      queue = queue.then(async () => {
        let text;
        try {
          text = await run(argv);
        } catch (e) {
          text = `That did not work: ${String(e.message || e).split("\n")[0]}`;
        }
        res.end(text);
      });
    });
  });
  server.listen(0, "127.0.0.1", () => {
    writeFileSync(DRIVER, JSON.stringify({ port: server.address().port, pid: process.pid, device: cfg.device }));
  });
}

// ---------------------------------------------------------------- the client (what the session runs)
function send(port, argv) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, method: "POST", path: "/", timeout: 90000 }, (res) => {
      let t = "";
      res.on("data", (d) => (t += d));
      res.on("end", () => resolve(t));
    });
    req.on("error", reject);
    req.end(JSON.stringify(argv));
  });
}

async function ensureDriver(device) {
  const d = readJson(DRIVER, null);
  if (d) {
    let alive = false;
    try {
      process.kill(d.pid, 0);
      alive = true;
    } catch {}
    // a running browser of the other screen size is closed and opened again in the size asked for, unless the run fixed it
    if (alive && device && device !== d.device && !config().lockDevice) {
      await send(d.port, ["__quit"]).catch(() => {});
      await new Promise((r) => setTimeout(r, 500));
    } else if (alive) return d.port;
  }
  if (device) writeFileSync(CONFIG, JSON.stringify({ ...readJson(CONFIG, {}), device }));
  const child = spawn(process.execPath, [process.argv[1], "__serve"], { cwd: HERE, detached: true, stdio: "ignore", env: process.env });
  child.unref();
  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 150));
    const now = readJson(DRIVER, null);
    if (now && now.pid === child.pid) return now.port;
  }
  throw new Error("the browser did not start");
}

const argv = process.argv.slice(2);
if (argv[0] === "__serve") {
  await serve();
} else if (argv[0] === "__quit") {
  const d = readJson(DRIVER, null);
  if (d) await send(d.port, ["__quit"]).catch(() => {});
} else {
  if (!argv.length) {
    console.log("Commands: open <url> [pc|phone], click \"<text>\" | click <x> <y>, type \"<text>\", fill \"<label>\" \"<text>\", press <key>, scroll <down|up> [px], slider \"<label>\" <value>, back, look, zoom <x> <y>");
    process.exit(0);
  }
  const cfg = config();
  const log = existsSync(LOG) ? readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean) : [];
  const t0 = Date.now();
  let text;
  if (cfg.maxActions && log.length >= cfg.maxActions) text = "You have used all your actions. Stop here and give your answer with what you have seen.";
  else if (cfg.deadline && Date.now() > cfg.deadline) text = "Your time is up. Stop here and give your answer with what you have seen.";
  else {
    const device = argv[0] === "open" && /^(pc|phone)$/.test(argv[2] || "") ? argv[2] : undefined;
    const port = await ensureDriver(device);
    text = await send(port, argv);
    const left = cfg.maxActions ? cfg.maxActions - log.length - 1 : null;
    if (left !== null && left <= 5) text += `\n(${left} actions left)`;
    if (cfg.deadline && cfg.deadline - Date.now() < 120000) text += "\n(less than two minutes left)";
  }
  const shot = (text.match(/^screenshot: (\S+)/m) || [])[1] || null;
  appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), argv, ms: Date.now() - t0, shot, answer: text.split("\n").slice(0, 4).join(" | ") }) + "\n");
  console.log(text);
}
