// A provident wrapper with several managers' list fees collected (2026-11-07): the guide shows the range over all of them (F-105)
// and runs its example on one, chosen by F-80, never one manager's list standing for the product.
import { describe, expect, it } from "vitest";
import type { FeesSnapshot } from "@finance-tool/schema";
import { loadFees, loadRules } from "./data.server";
import { pricedLine, providentLists, providentPick, providentTerms } from "./compare.server";
import { buildGuidePage } from "./guide.server";

const KGL = "kupat-gemel-lehashkaa";
const fees = loadFees();
const rules = loadRules();

describe("the provident fund for investing's list fees", () => {
  it("are one per manager, the latest snapshot of each, with both bases", () => {
    const lists = providentLists(KGL, fees);
    const ids = lists.map((l) => l.snap.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ["harel", "mor", "meitav", "yalin-lapidot", "analyst", "altshuler-shaham", "phoenix", "migdal", "clal", "menora-mivtachim", "infinity", "ayalon"]) expect(ids).toContain(id);
    for (const l of lists) {
      expect(l.balance.unit).toBe("pct_per_year");
      expect(l.deposit.unit).toBe("pct_of_deposit");
      // no binding document lets a manager charge more than the law (PF-02: 1.05% of the balance, 4% of deposits)
      expect(l.balance.value as number).toBeLessThanOrEqual(1.05);
      expect(l.deposit.value as number).toBeLessThanOrEqual(4);
    }
  });
  it("run the example on the list lowest on both bases in every month, Harel's 0.7% and 0% for five years and the bylaws' most after", () => {
    expect(providentPick(KGL, fees, undefined, rules)).toEqual({ id: "harel", count: 12 });
    const r = providentTerms(KGL, fees, undefined, rules, "2026-11-07");
    expect(r.missing).toEqual([]);
    expect(r.pick?.id).toBe("harel");
    // A-19, D56 (2026-11-07): the printed rate is a discount under the bylaws' s.36.1, kept at least PF-13's five years, then 1.05% and 4%
    expect(r.terms!.fees!.balance).toBeCloseTo(0.007, 10);
    expect(r.terms!.fees!.deposit).toBe(0);
    expect(r.terms!.fees!.discount).toEqual({ months: 60, listRate: 0.0105 });
    expect(r.terms!.fees!.depositDiscount).toEqual({ months: 60, listRate: 0.04 });
    expect(r.feeValues.balance!.own).toBe("הראל פנסיה וגמל");
    expect([r.feeValues.discountBalance!.value, r.feeValues.afterBalance!.value, r.feeValues.discountDeposit!.value, r.feeValues.afterDeposit!.value]).toEqual([0.7, 1.05, 0, 4]);
    expect(r.feeValues.discountYears).toMatchObject({ value: 5, unit: "years" });
  });
  it("prove Harel's place month by month: no other manager is cheaper on either base in the five years or after", () => {
    const min = 60;
    const lists = providentLists(KGL, fees);
    const at = (p: ReturnType<typeof pricedLine>, m: number) => (m <= p.months ? p.rate : p.after);
    const harel = lists.find((l) => l.snap.id === "harel")!;
    for (const m of [1, 60, 61, 120, 240])
      for (const l of lists)
        for (const base of ["balance", "deposit"] as const) expect(at(pricedLine(harel.lines[base], min), m)).toBeLessThanOrEqual(at(pricedLine(l.lines[base], min), m));
  });
  it("price Mor's printed 0.8% and 0% as an offer, at the bylaws' most from the start, because a letter not published sets them (D56)", () => {
    const mor = providentLists(KGL, fees).find((l) => l.snap.id === "mor")!;
    expect(mor.balance.value).toBe(0.8);
    expect(pricedLine(mor.lines.balance, 60)).toMatchObject({ rate: 1.05, after: 1.05, offer: true, discounted: false });
    expect(pricedLine(mor.lines.deposit, 60)).toMatchObject({ rate: 4, after: 4, offer: true });
    const r = providentTerms(KGL, fees, { tariff: "mor" } as never, rules, "2026-11-07");
    expect(r.terms!.fees!.balance).toBeCloseTo(0.0105, 10);
    expect(r.terms!.fees!.discount).toBeUndefined();
    expect(r.feeValues.listBalance!.value).toBe(1.05);
  });
  it("weigh a longer discount: a lower rate for five years does not beat a slightly higher one kept for ten", () => {
    const twin: FeesSnapshot = JSON.parse(JSON.stringify(fees.find((f) => f.id === "harel" && f.snapshot === "2026-11-07")));
    twin.id = "test-longer";
    for (const l of twin.lines) if (l.base === "balance") {
      l.rate.value = 0.75;
      l.discount_months!.value = 120;
    }
    expect(providentPick(KGL, [...fees, twin], undefined, rules)).toBeNull();
  });
  it("name a tie when two managers price the same in every month, and run on the first", () => {
    const twin: FeesSnapshot = JSON.parse(JSON.stringify(fees.find((f) => f.id === "harel" && f.snapshot === "2026-11-07")));
    twin.id = "test-twin";
    expect(providentPick(KGL, [...fees, twin], undefined, rules)).toEqual({ id: "harel", count: 13, tied: ["harel", "test-twin"] });
  });
  it("take the manager P-05 names first, and pick none when no list is the lowest on both bases", () => {
    expect(providentPick(KGL, fees, { tariff: "mor" }, rules)?.id).toBe("mor");
    const cheaperBalance: FeesSnapshot = JSON.parse(JSON.stringify(fees.find((f) => f.id === "analyst")));
    cheaperBalance.id = "test-manager";
    for (const l of cheaperBalance.lines) l.rate.value = l.base === "balance" ? 0.5 : 2;
    expect(providentPick(KGL, [...fees, cheaperBalance], undefined, rules)).toBeNull();
    expect(providentTerms(KGL, [...fees, cheaperBalance], undefined, rules, "2026-11-07").missing[0]).toContain("none is the lowest on both bases");
  });
  it("leave the study fund on its one list, with no pick", () => {
    expect(providentPick("keren-hishtalmut", fees, undefined, rules)?.count ?? 0).toBeLessThanOrEqual(1);
    expect(providentTerms("keren-hishtalmut", fees, undefined, rules, "2026-11-07").pick).toBeUndefined();
  });
});

describe("the guide page", () => {
  const page = buildGuidePage(KGL)!;
  it("shows each fee over every collected manager, with how many print the legal cap", () => {
    const r = page.listRange!;
    // 2026-11-07: Meitav's binding documents print no rate (joining request blank, bylaws up to the maximum), so it moved from its
    // product page's 0.8% and 0% to the cap, 1.05% and 4% (D56): at the cap 7 -> 8 on each base. Ayalon, the twelfth manager (bylaws
    // edition 07.2026, s.35.1, up to the legal maximum; joining form 102 leaves the rates blank), at the cap: 11 -> 12, 8 -> 9
    expect([r.balance!.low.value, r.balance!.managers.value, r.balance!.atCap.value]).toEqual([0.7, 12, 9]);
    expect([r.deposit!.low.value, r.deposit!.managers.value, r.deposit!.atCap.value]).toEqual([0, 12, 9]);
    for (const v of [r.balance!.low, r.balance!.managers, r.balance!.atCap]) {
      expect(v.state).toBe("computed");
      // the sheet lists every manager's own figure
      expect(Object.keys(v.computed_from!.inputs).length).toBeGreaterThanOrEqual(12);
    }
  });
  it("names the example's manager as the site's pick, with the number compared", () => {
    expect(page.bundle!.pick).toMatchObject({ kind: "manager", id: "harel" });
    expect(page.bundle!.pick!.count.value).toBe(12);
    expect(page.bundle!.feeValues.balance!.own).toBe("הראל פנסיה וגמל");
  });
  it("shows no range on a guide with one list or none", () => {
    expect(buildGuidePage("keren-hishtalmut")!.listRange).toBeNull();
    expect(buildGuidePage("pension-general")!.listRange).toBeNull();
  });
});
