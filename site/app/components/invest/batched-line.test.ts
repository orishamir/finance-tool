// F-133 on the receipt: where the pair is priced buying every few months, one line under what is left says the interval and what each
// purchase buys, and opens why: the charge each purchase pays whatever its size, what the same pair leaves bought every month, and that the
// waiting cash earns nothing. The engine's workbench is watched (each run's input kept, the run itself the engine's), so the monthly figure is
// held to the engine's own run of the same input at an interval of one month.
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ComparedProvider, providerWorkbench as Workbench } from "@finance-tool/engine";

const runs = vi.hoisted(() => ({ calls: [] as Parameters<typeof Workbench>[], real: null as typeof Workbench | null }));
vi.mock("@finance-tool/engine", async (importOriginal) => {
  const engine = await importOriginal<typeof import("@finance-tool/engine")>();
  runs.real = engine.providerWorkbench;
  return { ...engine, providerWorkbench: (...a: Parameters<typeof Workbench>) => (runs.calls.push(a), engine.providerWorkbench(...a)) };
});

import { invest } from "../../copy";
import { buildInvest, indexById, pairCosts, type PairCosts } from "../../lib/invest";
import { planOf } from "../../lib/receipt-fixtures";
import { BatchedWhy, PairReceipt } from "./receipt";
import { bundle, html, plan, shown, t } from "./render-fixtures";

const w = invest.receipt.batched;
const sp = indexById(bundle, "index-sp500")!;
/** What the reader sees, the isolates and the no-break spaces as plain text. */
const bare = (out: string) => shown(out).replace(/[⁦-⁩‎‏]/g, "").replace(/ /g, " ");
const receipt = (p: typeof plan, pick: { house: string; fund: string }, layout: "paper" | "ticket") => html(createElement(PairReceipt, { view: buildInvest({ bundle, index: sp, plan: p }), bundle, plan: p, pick, chosen: true, layout }));
/** The first pair on the plan priced at an interval that `ok` takes. */
function pairWhere(p: typeof plan, ok: (k: number) => boolean): { house: string; fund: string; k: number } | null {
  for (const o of buildInvest({ bundle, index: sp, plan: p }).options)
    for (const f of o.funds) for (const [house, at] of Object.entries(f.byHouse)) if ("orderEvery" in at && ok(at.orderEvery)) return { house, fund: f.rec.id, k: at.orderEvery };
  return null;
}
// the page's default fund at Psagot, priced buying every few months on the fixtures' plan, 400 ₪ a month
const psagot = { house: "psagot", fund: "ie00bfmxxd54" };

describe("the line under what is left, where the pair is priced buying every few months (F-133)", () => {
  const pc = pairCosts({ bundle, index: sp, plan, fundId: psagot.fund, providerId: psagot.house });
  it("says the interval and each purchase, the monthly deposit times the interval, at both widths, in place of the account's tag", () => {
    expect(pc?.orderEvery, "the pair is no longer priced every few months: pick another").toBeGreaterThan(1);
    const k = pc!.orderEvery;
    const line = w.line(k).replace("{amount}", `${(400 * k).toLocaleString("en-US")} ₪`);
    for (const layout of ["paper", "ticket"] as const) {
      const raw = receipt(plan, psagot, layout);
      const out = bare(raw);
      expect(out, layout).toContain(line);
      // under the total, after it
      expect(out.indexOf(line)).toBeGreaterThan(out.lastIndexOf(invest.receipt.left));
      // words drawn as a glossary term that open a sheet
      expect(raw).toMatch(/<button type="button" aria-haspopup="dialog" aria-expanded="false" class="term whitespace-normal[^"]*">(<span>)?אם קונים/);
      // the account's tag is gone; the fund's rows in the lists keep theirs
      expect(out).not.toContain(invest.pair.orderEvery(k));
    }
  });
  it("is not there where the pair buys every month", () => {
    const monthly = pairWhere(plan, (k) => k === 1);
    expect(monthly, "no pair buys every month on the plan").not.toBeNull();
    for (const layout of ["paper", "ticket"] as const) expect(bare(receipt(plan, monthly!, layout))).not.toContain(w.lineAlone(2).split(" ").slice(0, 2).join(" "));
  });
  it("with no monthly deposit, where only payouts wait, says the interval alone", () => {
    const p = planOf(t, { years: 20, monthly: 0 });
    const pair = pairWhere(p, (k) => k > 1);
    expect(pair, "no pair is priced every few months with no monthly deposit: pick another plan").not.toBeNull();
    const out = bare(receipt(p, pair!, "ticket"));
    expect(out).toContain(w.lineAlone(pair!.k));
    expect(out).not.toContain(w.line(pair!.k).split("{amount}")[1]!.trim());
  });
});

describe("what the line opens (F-133)", () => {
  runs.calls.length = 0;
  const pc = pairCosts({ bundle, index: sp, plan, fundId: psagot.fund, providerId: psagot.house }) as PairCosts;
  const priced = [...runs.calls];
  /** The engine's run of the input that gave the pair's row, at an interval of one month: the house's row in it. */
  const atMonthly = (): ComparedProvider => {
    const rowOf = (r: ReturnType<typeof Workbench>) => r.rows.find((x): x is ComparedProvider => x.kind === "compared" && x.id === psagot.house);
    const given = priced.find(([input, ctx]) => input.behaviour?.orderEvery === undefined && rowOf(runs.real!(input, ctx))?.real === pc.left.value);
    if (!given) throw new Error("no run of the workbench gave the pair's row");
    const [input, ctx] = given;
    const row = rowOf(runs.real!({ ...input, behaviour: { ...input.behaviour, orderEvery: 1 } }, ctx));
    if (!row) throw new Error("the house has no row at an interval of one month");
    return row;
  };
  it("holds what the same pair leaves bought every month: the engine's run of the same input at an interval of one month", () => {
    const row = atMonthly();
    expect(row.way.orderEvery).toBe(1);
    const got = pc.batched?.monthly();
    expect(got?.computed_from?.formula).toBe("F-133");
    expect(got?.value).toBeCloseTo(row.real, 6);
    // it leaves less than the interval the figure is priced at
    expect(row.real).toBeLessThan(pc.left.value as number);
  });
  it("says the house's minimum on a purchase, as its price list prints it, and that figure; then the waiting cash", () => {
    // the trade line the run read: Psagot's line for an exchange in Europe prints a minimum in euros
    const line = pc.priced.lines.find((l) => l.base === "trade");
    expect(line?.min?.unit, "the run's trade line prints no minimum in euros: pick another pair").toBe("eur");
    const out = bare(html(createElement(BatchedWhy, { pc })));
    const [before, after] = w.charge.tradeMin(pc.priced.house).split("{figure}");
    expect(out).toContain(`${before}${line!.min!.value} €${after}`);
    expect(out).toContain(w.monthly.replace("{figure}", `${Math.round(atMonthly().real).toLocaleString("en-US")} ₪`));
    expect(out).toContain(w.waits);
  });
});
