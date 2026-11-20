// The run memo (src/run-memo.ts): what it gives back, when, and what it keeps apart. The suite's setup keeps 4000 results; each test here
// sets its own count and puts the setup's back.
import { afterEach, describe, expect, it } from "vitest";
import { keepRuns, memoRun, runKey, withRunMemo } from "../src/run-memo.ts";

const ctx = { rules: [] as object[], runDate: "2026-11-20" };
afterEach(() => keepRuns(4000));

/** A run that counts how often it is worked out. */
function counted() {
  let n = 0;
  return { run: () => ({ n: ++n, series: [{ month: 0 }] }), times: () => n };
}

describe("withRunMemo (the index page's build)", () => {
  it("works a run out once inside the call, afresh outside it, and keeps nothing after", () => {
    keepRuns(0);
    const c = counted();
    const ask = () => memoRun("k", ctx, { a: 1 }, c.run);
    const [x, y] = withRunMemo(() => [ask(), ask()]);
    expect(x).toBe(y);
    expect(c.times()).toBe(1);
    // the page skips the freezing
    expect(Object.isFrozen(x)).toBe(false);
    expect(ask()).not.toBe(x);
    expect(withRunMemo(ask)).not.toBe(x);
    expect(c.times()).toBe(3);
  });
  it("shares the outer call's results with a call inside it, and lets go of them only when the outer one ends", () => {
    keepRuns(0);
    const c = counted();
    const ask = () => memoRun("k", ctx, { a: 1 }, c.run);
    withRunMemo(() => {
      const x = ask();
      expect(withRunMemo(ask)).toBe(x);
      expect(ask()).toBe(x);
    });
    expect(c.times()).toBe(1);
  });
  it("throws the same error again for a run that threw", () => {
    keepRuns(0);
    let n = 0;
    const bad = () => {
      n++;
      throw new RangeError("no");
    };
    withRunMemo(() => {
      expect(() => memoRun("k", ctx, {}, bad)).toThrow(RangeError);
      expect(() => memoRun("k", ctx, {}, bad)).toThrow(RangeError);
    });
    expect(n).toBe(1);
  });
});

describe("keepRuns (the tests)", () => {
  it("keeps the latest n results, frozen, the one asked for last staying longest", () => {
    keepRuns(2);
    const rules: object[] = [];
    const c = counted();
    const ask = (a: number) => memoRun("k", { ...ctx, rules }, { a }, c.run);
    const one = ask(1);
    expect(Object.isFrozen(one.series[0])).toBe(true);
    ask(2);
    expect(ask(1)).toBe(one);
    ask(3); // lets go of 2, asked for longest ago
    expect(ask(1)).toBe(one);
    expect(c.times()).toBe(3);
    ask(2);
    expect(c.times()).toBe(4);
  });
  it("remembers nothing at 0", () => {
    keepRuns(0);
    const c = counted();
    memoRun("k", ctx, {}, c.run);
    memoRun("k", ctx, {}, c.run);
    expect(c.times()).toBe(2);
  });
});

describe("what keeps two runs apart", () => {
  it("another rules array, run date, readings, ledger or input", () => {
    keepRuns(100);
    const c = counted();
    const base = memoRun("k", ctx, { a: 1 }, c.run);
    expect(memoRun("k", { ...ctx, rules: [] }, { a: 1 }, c.run)).not.toBe(base);
    expect(memoRun("k", { ...ctx, runDate: "2026-11-21" }, { a: 1 }, c.run)).not.toBe(base);
    expect(memoRun("k", { ...ctx, readings: { q: "lower" } }, { a: 1 }, c.run)).not.toBe(base);
    expect(memoRun("other", ctx, { a: 1 }, c.run)).not.toBe(base);
    expect(memoRun("k", ctx, { a: 2 }, c.run)).not.toBe(base);
    expect(memoRun("k", ctx, { a: 1 }, c.run)).toBe(base);
  });
  it("NaN, the infinities, null, 0 and -0, undefined and a missing field, and a string written like one of them", () => {
    const keys = [NaN, Infinity, -Infinity, null, 0, -0, "~NaN", "~u", "NaN"].map((v) => runKey({ v }));
    keys.push(runKey({ v: undefined }), runKey({}));
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("an input holding a function is run each time, not keyed on its other fields", () => {
    keepRuns(100);
    const c = counted();
    memoRun("k", ctx, { f: () => 1 }, c.run);
    memoRun("k", ctx, { f: () => 2 }, c.run);
    expect(c.times()).toBe(2);
  });
});
