// F-133: what the receipt's line for buying every few months opens: the charge each purchase pays whatever its size, what the same pair
// leaves bought every month, and that the waiting cash earns nothing. The monthly figure is held to the engine's own run of the input that
// gave the pair's row, at an interval of one month: the engine's workbench is watched (each run's input kept, the run itself the engine's)
// in modules loaded afresh for this file, and the modules are let go after it, so the files after it in the worker load theirs unwatched
// (vitest.config.ts `isolate`).
import { createElement } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { ComparedProvider, providerWorkbench as Workbench } from "@finance-tool/engine";
import type { PairCosts } from "../../lib/invest";

type Run = Parameters<typeof Workbench>;
const runs = { calls: [] as Run[], real: null as typeof Workbench | null };
/** `v`, or the test stops with `why` where it is missing. */
function need<T>(v: T | null | undefined, why: string): T {
  if (v === null || v === undefined) throw new Error(why);
  return v;
}
let m: { invest: typeof import("../../copy").invest; lib: typeof import("../../lib/invest"); receipt: typeof import("./receipt"); f: typeof import("./render-fixtures") };

beforeAll(async () => {
  vi.resetModules();
  vi.doMock("@finance-tool/engine", async (importOriginal: () => Promise<typeof import("@finance-tool/engine")>) => {
    const engine = await importOriginal();
    runs.real = engine.providerWorkbench;
    return { ...engine, providerWorkbench: (...a: Run) => (runs.calls.push(a), engine.providerWorkbench(...a)) };
  });
  m = { invest: (await import("../../copy")).invest, lib: await import("../../lib/invest"), receipt: await import("./receipt"), f: await import("./render-fixtures") };
});
afterAll(() => {
  vi.doUnmock("@finance-tool/engine");
  vi.resetModules();
});

// the page's default fund at Psagot, priced buying every few months on the fixtures' plan
const psagot = { house: "psagot", fund: "ie00bfmxxd54" };
/** What the reader sees, the isolates and the no-break spaces as plain text. */
const bare = (out: string) => m.f.shown(out).replace(/[⁦-⁩‎‏]/g, "").replace(/ /g, " ");

describe("what the line under what is left opens (F-133)", () => {
  let pc: PairCosts;
  let monthly: ComparedProvider;
  beforeAll(() => {
    const { bundle, plan } = m.f;
    runs.calls.length = 0;
    const got = m.lib.pairCosts({ bundle, index: need(m.lib.indexById(bundle, "index-sp500"), "the S&P 500 index is in the data"), plan, fundId: psagot.fund, providerId: psagot.house });
    if (!got?.batched) throw new Error("the pair is no longer priced every few months: pick another");
    pc = got;
    // the run of the workbench that gave the pair's row, run again by the engine at an interval of one month
    const engine = need(runs.real, "the engine's workbench is watched");
    const rowOf = (r: ReturnType<typeof Workbench>) => r.rows.find((x): x is ComparedProvider => x.kind === "compared" && x.id === psagot.house);
    const given = runs.calls.find(([input, ctx]) => input.behaviour?.orderEvery === undefined && rowOf(engine(input, ctx))?.real === pc.left.value);
    if (!given) throw new Error("no run of the workbench gave the pair's row");
    const [input, ctx] = given;
    const row = rowOf(engine({ ...input, behaviour: { ...input.behaviour, orderEvery: 1 } }, ctx));
    if (!row) throw new Error("the house has no row at an interval of one month");
    monthly = row;
  });
  it("holds what the same pair leaves bought every month: the engine's run of the same input at an interval of one month", () => {
    expect(monthly.way.orderEvery).toBe(1);
    const got = pc.batched?.monthly();
    expect(got?.computed_from?.formula).toBe("F-133");
    expect(got?.value).toBeCloseTo(monthly.real, 6);
    // it leaves less than the interval the figure is priced at
    expect(monthly.real).toBeLessThan(pc.left.value as number);
  });
  it("says the house's minimum on a purchase, as its price list prints it, and that figure; then the waiting cash", () => {
    const w = m.invest.receipt.batched;
    // the trade line the run read: Psagot's line for an exchange in Europe prints a minimum in euros
    const min = need(pc.priced.lines.find((l) => l.base === "trade")?.min, "the run's trade line prints no minimum: pick another pair");
    expect(min.unit, "the run's trade line prints no minimum in euros: pick another pair").toBe("eur");
    // the house by its short name, as the receipt names it
    const out = bare(m.f.html(createElement(m.receipt.BatchedWhy, { pc, house: "פסגות" })));
    const [before, after] = w.charge.tradeMin("פסגות").split("{figure}");
    expect(out).toContain(`${before}${String(min.value)} €${after}`);
    expect(out).toContain(w.monthly.replace("{figure}", `${Math.round(monthly.real).toLocaleString("en-US")} ₪`));
    expect(out).toContain(w.waits);
  });
});
