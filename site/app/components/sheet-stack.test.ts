// The open sheets show one at a time, the phone's Back closes the top one, and a sheet closed any other way takes its history entry back
// (guidelines/design.md, "A sheet"). The window, its history and the dialogs are stand-ins the test drives by hand; the history's `go`
// lands a task later, as a browser's does.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (e: { stopImmediatePropagation: () => void }) => void;
interface Entry {
  state: unknown;
  url: string;
}

/** A window with a history of entries, a popstate the stack and then the router hear, and a log of what the history was asked to do. */
function fakeWindow() {
  const entries: Entry[] = [{ state: { idx: 0, key: "page" }, url: "/page" }];
  let at = 0;
  const pops: Listener[] = [];
  const asked: string[] = [];
  /** The entries the router heard a popstate land on: those the stack let through. */
  const routerSaw: unknown[] = [];
  const pop = (): boolean => {
    let stopped = false;
    for (const f of pops) f({ stopImmediatePropagation: () => (stopped = true) });
    if (!stopped) routerSaw.push(entries[at]!.state);
    return !stopped;
  };
  const history = {
    get state() {
      return entries[at]!.state;
    },
    pushState(state: unknown, _: string, url?: string) {
      entries.splice(at + 1);
      entries.push({ state, url: url ?? entries[at]!.url });
      at++;
      asked.push("push");
    },
    replaceState(state: unknown, _: string, url?: string) {
      entries[at] = { state, url: url ?? entries[at]!.url };
      asked.push("replace");
    },
    go(n: number) {
      asked.push(`go ${n}`);
      setTimeout(() => {
        at += n;
        pop();
      }, 0);
    },
  };
  return {
    history,
    entries,
    asked,
    routerSaw,
    get at() {
      return at;
    },
    get url() {
      return entries[at]!.url;
    },
    addEventListener: (type: string, f: Listener) => type === "popstate" && pops.push(f),
    /** The phone's Back: whether the router heard it. */
    back(): boolean {
      at--;
      return pop();
    },
  };
}

function fakeDialog() {
  return {
    open: false,
    isConnected: true,
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  };
}

const sheet = (close = vi.fn()) => ({ dialog: fakeDialog() as unknown as HTMLDialogElement, close, opener: { isConnected: true, focus: vi.fn() } as unknown as HTMLElement });

let win: ReturnType<typeof fakeWindow>;
let stack: typeof import("./sheet-stack");

beforeEach(async () => {
  win = fakeWindow();
  vi.stubGlobal("window", win);
  vi.resetModules();
  stack = await import("./sheet-stack");
});
afterEach(() => vi.unstubAllGlobals());

/** Until the stack's own steps back have landed: a few tasks. */
const settle = async () => {
  for (let i = 0; i < 5; i++) await new Promise<void>((done) => setTimeout(done, 0));
};

describe("the open sheets", () => {
  it("show one at a time: a sheet opened over another hides it, and it comes back with the focus on what opened the top one", () => {
    const a = sheet();
    const b = sheet();
    stack.pushSheet(a);
    a.dialog.showModal();
    stack.pushSheet(b);
    expect(a.dialog.open).toBe(false);
    expect(stack.isCovered(a)).toBe(true);
    expect(stack.coversOther(b)).toBe(true);
    expect(stack.coversOther(a)).toBe(false);
    stack.dropSheet(b);
    expect(a.dialog.open).toBe(true);
    expect(b.opener?.focus).toHaveBeenCalled();
    expect(stack.isCovered(a)).toBe(false);
  });

  it("bring back a sheet they uncover only while it is still on the page", () => {
    const a = sheet();
    const b = sheet();
    stack.pushSheet(a);
    stack.pushSheet(b);
    (a.dialog as unknown as { isConnected: boolean }).isConnected = false;
    stack.dropSheet(b);
    expect(a.dialog.open).toBe(false);
  });

  it("each hold a history entry, and the phone's Back closes the top one without the router seeing it", () => {
    const close = vi.fn();
    const a = sheet(close);
    stack.pushSheet(a);
    expect(win.entries).toHaveLength(2);
    // the router's own state stays in the entry, with the mark beside it
    expect(win.history.state).toMatchObject({ idx: 0, key: "page" });
    expect(win.back()).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("hold no entry where the page was opened without a press (a browser skips such an entry on Back)", async () => {
    vi.stubGlobal("navigator", { userActivation: { isActive: false } });
    const a = sheet();
    stack.pushSheet(a);
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual([]);
  });

  it("closed by its X, takes its entry back off the history once, and the router does not see that step back either", async () => {
    const a = sheet();
    stack.pushSheet(a);
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push", "go -1"]);
    expect(win.at).toBe(0);
    expect(win.routerSaw).toEqual([]);
    // a Back after it is the router's again
    win.history.pushState({ idx: 1, key: "next" }, "");
    expect(win.back()).toBe(true);
  });

  it("closed by the Back button, takes nothing more off the history", async () => {
    const a = sheet();
    stack.pushSheet(a);
    win.back();
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push"]);
  });

  it("closed together, take their entries back in one step", async () => {
    const a = sheet();
    const b = sheet();
    stack.pushSheet(a);
    stack.pushSheet(b);
    stack.dropSheet(b);
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push", "push", "go -2"]);
    expect(win.at).toBe(0);
  });

  it("closed while the stack's own step back is still on its way, wait for it and then take their entries too", async () => {
    const a = sheet();
    const b = sheet();
    stack.pushSheet(a);
    stack.pushSheet(b);
    stack.dropSheet(b);
    // the step back for b has been asked for, and has not landed
    await Promise.resolve();
    expect(win.asked).toEqual(["push", "push", "go -1"]);
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push", "push", "go -1", "go -1"]);
    expect(win.at).toBe(0);
    expect(win.routerSaw).toEqual([]);
  });

  it("let the router see a Back that lands anywhere but under the top sheet (a page put its entry over the sheet's), and close", () => {
    const close = vi.fn();
    stack.pushSheet(sheet(close));
    win.history.pushState({ idx: 1, key: "over" }, "", "/over");
    expect(win.back()).toBe(true);
    expect(close).toHaveBeenCalled();
    // the stack holds no entries any more: the next Back is the router's
    expect(win.back()).toBe(true);
  });

  it("take the mark off a sheet's entry the history lands on once it is no longer theirs, so a sheet opened there counts from the page", () => {
    const a = sheet();
    stack.pushSheet(a);
    win.history.pushState({ idx: 1, key: "over" }, "", "/over");
    win.back();
    stack.dropSheet(a);
    expect(win.history.state).toEqual({ idx: 0, key: "page" });
    const close = vi.fn();
    stack.pushSheet(sheet(close));
    expect(win.back()).toBe(false);
    expect(close).toHaveBeenCalled();
  });

  it("let the router see a Back to an entry of another page under the sheet's", () => {
    const close = vi.fn();
    stack.pushSheet(sheet(close));
    win.entries[0] = { state: { idx: 0, key: "other" }, url: "/other" };
    expect(win.back()).toBe(true);
    expect(close).toHaveBeenCalled();
  });

  it("keep the address a page writes while a sheet is open, once the sheet is closed by its X", async () => {
    const a = sheet();
    stack.pushSheet(a);
    stack.replaceAddress("/page?q=1");
    expect(win.url).toBe("/page?q=1");
    stack.dropSheet(a);
    await settle();
    expect(win.at).toBe(0);
    expect(win.url).toBe("/page?q=1");
    // the router's state stays in the entry
    expect(win.history.state).toEqual({ idx: 0, key: "page" });
  });

  it("keep the address a page writes while a sheet is open, once the sheet is closed by the Back button", () => {
    const a = sheet();
    stack.pushSheet(a);
    stack.replaceAddress("/page?q=2");
    win.back();
    stack.dropSheet(a);
    expect(win.url).toBe("/page?q=2");
  });

  it("write the address in place with no sheet open", () => {
    stack.replaceAddress("/page?q=3");
    expect(win.entries).toEqual([{ state: { idx: 0, key: "page" }, url: "/page?q=3" }]);
  });

  it("give a sheet's entry to the page a link inside it opens, so Back from there goes straight to the page under the sheet", async () => {
    const a = sheet();
    stack.pushSheet(a);
    const go = vi.fn((replace: boolean) => (replace ? win.history.replaceState({ idx: 0, key: "next" }, "", "/next") : win.history.pushState({ idx: 1, key: "next" }, "", "/next")));
    stack.leaveFromSheet(go);
    expect(go).toHaveBeenCalledWith(true);
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push", "replace"]);
    expect(win.entries.map((e) => e.url)).toEqual(["/page", "/next"]);
    expect(win.back()).toBe(true);
    expect(win.url).toBe("/page");
  });

  it("from a sheet opened inside another, first take back the entries above the lowest sheet's, then give that one to the page", async () => {
    const a = sheet();
    const b = sheet();
    stack.pushSheet(a);
    stack.pushSheet(b);
    const go = vi.fn(() => win.history.replaceState({ idx: 0, key: "next" }, "", "/next"));
    stack.leaveFromSheet(go);
    expect(go).not.toHaveBeenCalled();
    await settle();
    expect(go).toHaveBeenCalledWith(true);
    stack.dropSheet(b);
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push", "push", "go -1", "replace"]);
    expect(win.routerSaw).toEqual([]);
    expect(win.entries.slice(0, win.at + 1).map((e) => e.url)).toEqual(["/page", "/next"]);
  });
});
