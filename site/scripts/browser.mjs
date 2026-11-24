// What every browser script shares (guidelines/code.md, "Tests"): the context a page opens in, in Hebrew and on Israel's clock whatever the
// machine's, and waits that wait for the page itself, never for a fixed time.

/** The options every browser context starts from; a script adds its screen, colours, input and motion to them. */
export const CONTEXT = { locale: "he-IL", timezoneId: "Asia/Jerusalem" };

/** A browser context with CONTEXT under the script's own options, every page of it counting the work it has waiting (`countWaiting`). */
export async function newContext(browser, options = {}) {
  const ctx = await browser.newContext({ ...CONTEXT, ...options });
  await ctx.addInitScript(countWaiting);
  return ctx;
}

/**
 * Runs in the page before its own scripts. Counts what the page has waiting that will change it soon, which `settled` waits for and a
 * page at rest between two frames does not show: a timer of a second or less (a value that waits for the hand to rest, `useSettled`; a
 * sheet that closes once it has slid away), a fetch still on its way, and a message to a Web Worker not yet answered (the site's workers
 * answer every message once: the index page's, lib/invest-worker.ts). A longer timer (a "copied" that goes after two seconds, an undo
 * offered for a while) is not waited for.
 */
function countWaiting() {
  const timers = new Set();
  let fetching = 0;
  const set = window.setTimeout.bind(window);
  const clear = window.clearTimeout.bind(window);
  const get = window.fetch.bind(window);
  window.setTimeout = function (run, ms = 0, ...rest) {
    if (typeof run !== "function" || ms > 1000) return set(run, ms, ...rest);
    const id = set((...a) => {
      timers.delete(id);
      run(...a);
    }, ms, ...rest);
    timers.add(id);
    return id;
  };
  window.clearTimeout = function (id) {
    timers.delete(id);
    return clear(id);
  };
  window.fetch = function (...a) {
    fetching++;
    return get(...a).finally(() => fetching--);
  };
  let owed = 0;
  const Worker = window.Worker;
  if (Worker)
    window.Worker = class extends Worker {
      constructor(...a) {
        super(...a);
        // counted before the page's own listener runs, which then starts what the answer changes
        this.addEventListener("message", () => owed--);
        this.addEventListener("error", () => (owed = 0));
      }
      postMessage(...a) {
        owed++;
        return super.postMessage(...a);
      }
    };
  Object.defineProperty(window, "__waiting", { value: () => timers.size + fetching + Math.max(0, owed) });
}

/**
 * Runs in the page (`page.evaluate(settled)`). Resolves once the page is at rest: the main thread idle, then two checks in a row, each over
 * two frames, with nothing in the document changed, no box scrolled, no motion running (a CSS transition or animation, or one started by
 * `element.animate`; one that repeats forever does not count) and nothing waiting (`countWaiting`, in a context from `newContext`). A
 * glide drawn frame by frame from a script changes the document at every frame, so it is waited for too. Gives up after `limit` ms and
 * resolves false, so a page that never rests shows as slow rather than hanging the check.
 */
export function settled(limit = 5000) {
  const end = performance.now() + limit;
  // a frame first: headless Chrome can give no idle period while no frame is coming, and an idle callback asked for then waits out its
  // whole timeout, up to a second a call
  const idle = () => new Promise((done) => requestAnimationFrame(() => requestIdleCallback(() => done(), { timeout: 1000 })));
  const frame = () => new Promise((done) => requestAnimationFrame(() => done()));
  let changed = false;
  const mark = () => (changed = true);
  const watch = new MutationObserver(mark);
  watch.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  document.addEventListener("scroll", mark, { capture: true, passive: true });
  const moving = () => document.getAnimations().some((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations !== Infinity);
  const waiting = () => (typeof window.__waiting === "function" ? window.__waiting() : 0);
  return (async () => {
    let still = 0;
    while (still < 2 && performance.now() < end) {
      await idle();
      changed = false;
      await frame();
      await frame();
      still = changed || moving() || waiting() ? 0 : still + 1;
    }
    watch.disconnect();
    document.removeEventListener("scroll", mark, { capture: true });
    return still >= 2;
  })();
}

/**
 * Waits until `page` is at rest (`settled`, giving up after `limit` ms). When it gives up it prints a warning naming the page and returns
 * false, so what the script measures next is known to be taken on a page still changing, and a check whose measure needs a page at rest
 * fails on it.
 */
export async function waitSettled(page, limit = 5000) {
  const rested = await page.evaluate(settled, limit);
  if (!rested) console.warn(`warning: ${page.url()} did not come to rest within ${limit} ms`);
  return rested;
}

/** Waits for `n` of the page's frames: the page's own unit of change, for a script that samples what moves over time. */
export const frames = (page, n = 1) =>
  page.evaluate(
    (n) =>
      new Promise((done) => {
        const step = (left) => (left ? requestAnimationFrame(() => step(left - 1)) : done());
        step(n);
      }),
    n,
  );

/** Lighthouse's slow 4G: 150 ms round trip, 1.6 Mbit/s down, 750 kbit/s up. */
export const SLOW_4G = { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

/**
 * The page on a phone: its processor slowed `cpu` times through Chrome's DevTools protocol (4, as Lighthouse slows a computer to a mid
 * phone), and, with `network`, a slow connection (SLOW_4G). Returns the DevTools session.
 */
export async function slowDown(page, { cpu = 4, network } = {}) {
  const cdp = await page.context().newCDPSession(page);
  if (network) {
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...network });
  }
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  return cdp;
}
