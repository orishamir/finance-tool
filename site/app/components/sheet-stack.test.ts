// The open sheets show one at a time, the phone's Back closes the top one, and a sheet closed any other way takes its history entry back
// (guidelines/design.md, "A sheet"). The window, its history and the dialogs are stand-ins the test drives by hand.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (e: { stopImmediatePropagation: () => void }) => void;

/** A window with a history of entries, a popstate the test fires, and a log of what the history was asked to do. */
function fakeWindow() {
  const entries: unknown[] = [{ idx: 0, key: "page" }];
  let at = 0;
  const pops: Listener[] = [];
  const asked: string[] = [];
  const history = {
    get state() {
      return entries[at];
    },
    pushState(state: unknown) {
      entries.splice(at + 1);
      entries.push(state);
      at++;
      asked.push("push");
    },
    go(n: number) {
      asked.push(`go ${n}`);
      at += n;
    },
  };
  return {
    history,
    entries,
    asked,
    addEventListener: (type: string, f: Listener) => type === "popstate" && pops.push(f),
    /** The phone's Back, or the popstate the stack's own `go` brings: whether a listener after the stack's (the router's) saw it. */
    pop(): boolean {
      let stopped = false;
      for (const f of pops) f({ stopImmediatePropagation: () => (stopped = true) });
      return !stopped;
    },
    back() {
      at--;
      return this.pop();
    },
  };
}

function fakeDialog() {
  return {
    open: false,
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

const settle = () => new Promise<void>((done) => queueMicrotask(done));

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

  it("closed by its X, takes its entry back off the history once, and the router does not see that step back either", async () => {
    const a = sheet();
    stack.pushSheet(a);
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push", "go -1"]);
    expect(win.pop()).toBe(false);
    // a Back after it is the router's again
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
  });

  it("leave their entries where a page opened from a sheet put its own over them", async () => {
    const a = sheet();
    stack.pushSheet(a);
    win.history.pushState({ idx: 1, key: "next" });
    stack.dropSheet(a);
    await settle();
    expect(win.asked).toEqual(["push", "push"]);
    // the Back from that page is the router's
    expect(win.back()).toBe(true);
  });
});
