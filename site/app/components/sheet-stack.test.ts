// The open sheets show one at a time, and the one under the top is closed as a dialog so the browser's close request reaches the top one
// only (guidelines/design.md, "A sheet"). The dialogs are stand-ins the test drives by hand.
import { beforeEach, describe, expect, it, vi } from "vitest";

function fakeDialog(inside: object[] = []) {
  return {
    open: false,
    isConnected: true,
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
    contains: (el: unknown) => inside.includes(el as object),
  };
}

/** Each stand-in opener's `focus`, kept apart from it to be asked whether it was called. */
const focuses = new Map<unknown, ReturnType<typeof vi.fn>>();
const opener = () => {
  const focus = vi.fn();
  const el = { isConnected: true, focus } as unknown as HTMLElement;
  focuses.set(el, focus);
  return el;
};
const sheet = (o: HTMLElement | null = opener(), inside: object[] = []) => ({ dialog: fakeDialog(inside) as unknown as HTMLDialogElement, close: vi.fn(), opener: o });

let stack: typeof import("./sheet-stack");

beforeEach(async () => {
  vi.resetModules();
  stack = await import("./sheet-stack");
});

describe("the open sheets", () => {
  it("show one at a time: a sheet opened over another closes it as a dialog, and it comes back with the focus on what opened the top one", () => {
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
    expect(focuses.get(b.opener)).toHaveBeenCalled();
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

  it("pass a close request that reaches a sheet already leaving to the one under it", () => {
    const a = sheet();
    const b = sheet();
    stack.pushSheet(a);
    stack.pushSheet(b);
    stack.closeUnder(b);
    expect(a.close).toHaveBeenCalledOnce();
    stack.closeUnder(a);
    expect(b.close).not.toHaveBeenCalled();
  });

  it("closed under the top one, give the top one their opener in place of the one inside them, and the focus goes there at the end", () => {
    const chip = opener();
    const a = sheet(opener(), [chip]);
    const b = sheet(chip);
    stack.pushSheet(a);
    a.dialog.showModal();
    stack.pushSheet(b);
    stack.dropSheet(a);
    expect(a.dialog.open).toBe(false);
    expect(stack.coversOther(b)).toBe(false);
    stack.dropSheet(b);
    expect(focuses.get(chip)).not.toHaveBeenCalled();
    expect(focuses.get(a.opener)).toHaveBeenCalled();
  });
});
