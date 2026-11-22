import { afterEach, describe, expect, it, vi } from "vitest";
import { handler, inBackground } from "./background";

afterEach(() => vi.unstubAllGlobals());

describe("a promise nothing awaits", () => {
  it("reports its failure as an uncaught exception", async () => {
    const report = vi.fn();
    vi.stubGlobal("reportError", report);
    const e = new Error("stopped");
    inBackground(Promise.reject(e));
    await vi.waitFor(() => expect(report).toHaveBeenCalledWith(e));
  });

  it("reports nothing when it settles, or when there is no promise", async () => {
    const report = vi.fn();
    vi.stubGlobal("reportError", report);
    inBackground(Promise.resolve(1));
    inBackground(undefined);
    await Promise.resolve();
    await Promise.resolve();
    expect(report).not.toHaveBeenCalled();
  });

  it("an event handler built from an async function returns nothing and reports the function's failure", async () => {
    const report = vi.fn();
    vi.stubGlobal("reportError", report);
    const e = new Error("no clipboard");
    const press = handler(async (n: number) => {
      if (n > 0) throw e;
    });
    expect(press(1)).toBeUndefined();
    await vi.waitFor(() => expect(report).toHaveBeenCalledWith(e));
  });
});
