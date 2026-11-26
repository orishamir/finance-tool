// F-133 on the receipt: where the pair is priced buying every few months, one line under what is left says the interval and what each
// purchase buys, as words that open why (what they open: batched-why.test.ts).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { buildInvest, indexById, pairCosts } from "../../lib/invest";
import { planOf } from "../../lib/receipt-fixtures";
import { PairReceipt } from "./receipt";
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
