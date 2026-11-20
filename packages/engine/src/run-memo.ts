// A run remembered (performance only). A ledger run is a pure function of its input and its context: the rules, the run date and the
// readings (architecture 3.4: the engine never reads a clock). `memoRun` hands back the result already worked out for the same rules array
// (as the resolver indexes it) and an exact encoding of the rest: the same object to every caller, so no caller may change it. It holds only
// while a rules array's records do not change in place: the data cache hands them out frozen, and a test that builds its own must build a
// new array to change one. Two ways turn it on; without either, every run is worked out afresh:
// - `withRunMemo`, for the length of one call: an index page's build (site/app/lib/invest.ts `buildInvest`) asks for about a quarter of
//   its runs twice, and remembering them while it builds made the S&P 500 page's build about a sixth faster (about 160 ms to 136 ms here,
//   2026-11-20), for about 4 MB more held at the end of a 41-year build. Everything is let go when the call ends, so a reader's browser keeps
//   nothing between plans.
// - `keepRuns`, the latest n results for as long as the process runs, which only the test setup turns on (tests/setup.ts): the tests build
//   the same pages again and again, about nine in ten of the suite's securities runs repeated one, and keeping them took about a fifth off
//   the suite's time. A result holds its month-by-month series, about 57 KB, so a worker keeping thousands holds a few hundred MB. These
//   results are frozen, deep, so a caller that changed a shared result fails its test; the page skips the freezing, which cost as much as
//   remembering saved there.

let kept = 0;

type Memo = Map<string, { result?: unknown; error?: unknown }>;
const memos = new WeakMap<object, Memo>();
/** The results of the `withRunMemo` call under way, per rules array; null outside one. */
let scoped: WeakMap<object, Memo> | null = null;

/** `fn()` with every run it asks for twice worked out once; a call inside another shares the outer one's results. */
export function withRunMemo<T>(fn: () => T): T {
  if (scoped) return fn();
  scoped = new WeakMap();
  try {
    return fn();
  } finally {
    scoped = null;
  }
}

/** Remember up to `n` latest results per rule base; 0 (the default) remembers nothing. */
export function keepRuns(n: number): void {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`keepRuns: ${n} must be a whole number of 0 or more`);
  kept = n;
}

/**
 * The input and context as text that two runs share only when the ledger cannot tell them apart. JSON alone would merge NaN, ±Infinity and
 * null, 0 and -0, and a property set to undefined with one left out; each is written apart here, and a string that could be mistaken for one
 * of them is escaped. A function cannot be encoded, so an input holding one is refused rather than keyed on its other fields (`memoRun` then
 * runs it without remembering).
 */
export function runKey(value: unknown): string {
  return JSON.stringify(value, (_k, v: unknown) => {
    if (typeof v === "number") return Number.isFinite(v) ? (Object.is(v, -0) ? "~-0" : v) : `~${v}`;
    if (v === undefined) return "~u";
    if (typeof v === "string") return v.startsWith("~") ? `~${v}` : v;
    if (typeof v === "function") throw new TypeError("memoRun: an input holding a function cannot be keyed");
    return v;
  });
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

/**
 * `run()`'s result for this rule base, run date, readings and input, run once while it is among the `kept` latest asked for, or once in the
 * `withRunMemo` call under way. A run that throws throws the same error again. `kind` keeps apart two ledgers that take the same input.
 */
export function memoRun<R>(kind: string, ctx: { rules: readonly object[]; runDate: string; readings?: object }, input: unknown, run: () => R): R {
  const store = kept > 0 ? memos : scoped;
  if (!store) return run();
  let memo = store.get(ctx.rules);
  if (!memo) {
    memo = new Map();
    store.set(ctx.rules, memo);
  }
  let key: string;
  try {
    key = runKey([kind, ctx.runDate, ctx.readings ?? null, input]);
  } catch {
    // an input that cannot be keyed is run as it is, each time
    return run();
  }
  let hit = memo.get(key);
  if (hit) {
    // the latest asked for stays longest
    memo.delete(key);
  } else {
    try {
      hit = { result: kept > 0 ? deepFreeze(run()) : run() };
    } catch (error) {
      hit = { error };
    }
    // a call's own results are let go with it; the kept ones are bounded
    if (kept > 0) while (memo.size >= kept) memo.delete(memo.keys().next().value!);
  }
  memo.set(key, hit);
  if ("error" in hit) throw hit.error;
  return hit.result as R;
}
