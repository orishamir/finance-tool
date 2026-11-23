// "מה הכי משנה": each number's row writes what is left on the plan, what is left after the change and the difference, and the difference is
// the difference of the two figures as the row writes them (guidelines/wording.md, "Numbers"): 86,449 and 100,917 differ by 14,468.
import { describe, expect, it } from "vitest";
import { computed } from "../../lib/value";
import { changesAt } from "./knobs";
import { plan, t } from "./render-fixtures";
import type { PlanChanges } from "../../lib/invest-work";

describe("the change chart's rows", () => {
  it("a row's difference is what is left after the change less what is left on the plan, each in whole shekels as shown", () => {
    const share = { min: -20, max: 20, step: 20, start: 20 };
    const base = computed(86449.4, "nis", "F-90", {}, { today: t, about: "base" });
    const run: PlanChanges = {
      index: "index-sp500",
      house: "psagot",
      fund: "f",
      plan: { ...plan, currentAccounts: true },
      shares: [-20, 0, 20],
      base,
      lines: [{ id: "amount", key: "amountNow", scale: 1, tos: [4800, 6000, 7200], ys: [80000.2, 86449.4, 100916.6] }],
    };
    const [row] = changesAt(run, 20, share, t);
    expect(row?.after?.value).toBe(100917);
    expect(row?.diff?.value).toBe(100917 - 86449);
  });
});
