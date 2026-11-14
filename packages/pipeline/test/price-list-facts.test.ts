// The data check for the price-list facts of data-schema §3.6a, the distribution agreements of §3.6, a fund's promotions (§3.5) and the
// averages of §3.9: each check fails a planted fault, and the records as they stand pass.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { averagesRecord, feesSnapshot, fundRecord, type FeesSnapshot, type FundRecord } from "@finance-tool/schema";
import { checkFundPromotions, checkLineFacts, checkSnapshotFacts } from "../src/price-list-facts.ts";

const data = fileURLToPath(new URL("../../../data", import.meta.url));
const read = <T>(path: string): T => JSON.parse(readFileSync(join(data, path), "utf8")) as T;
const snap = (name: string) => feesSnapshot.parse(read<unknown>(`fees/${name}.json`)) as FeesSnapshot;
const line = (s: FeesSnapshot, id: string) => structuredClone(s.lines.find((l) => l.id === id)!);

describe("a minimum in the trade's currency (§3.6a item 1)", () => {
  const ibi = snap("ibi@2026-11-12");
  it("the records pass", () => expect(checkLineFacts(line(ibi, "ibi-buy-sell-foreign-other-markets"), true)).toEqual([]));
  it("fails without the words naming the trade's currency", () => {
    const l = line(ibi, "ibi-buy-sell-foreign-other-markets");
    l.min!.source.quote = "0.3%, מינימום 30";
    expect(checkLineFacts(l, true).join()).toMatch(/מטבע העסקה/);
  });
  it("fails on a line that is no trade line, and currencies with no such bound", () => {
    const l = line(ibi, "ibi-custody");
    expect(checkLineFacts({ ...l, trade_currencies: ["USD"] }, true).join()).toMatch(/trade_currencies belongs/);
  });
});

describe("a custody maximum's scope (§3.6a item 2)", () => {
  const leumi = snap("leumi@2026-11-12");
  it("the records pass", () => expect(checkLineFacts(line(leumi, "leumi-custody-israel"), true)).toEqual([]));
  it("a latest record's maximum says what it bounds; an older record stands as read", () => {
    const { max_per: _p, max_deposit: _d, ...l } = line(leumi, "leumi-custody-israel");
    expect(checkLineFacts(l, true).join()).toMatch(/max_per/);
    expect(checkLineFacts(l, false)).toEqual([]);
  });
  it("a maximum on the deposit stands beside one on each security, and not below it", () => {
    const l = line(leumi, "leumi-custody-israel");
    expect(checkLineFacts({ ...l, max_per: "deposit" }, true).join()).toMatch(/beside a maximum on each security/);
    expect(checkLineFacts({ ...l, max_deposit: { ...l.max_deposit!, value: 100 } }, true).join()).toMatch(/below the maximum on each security/);
  });
});

describe("a conversion priced by its size (§3.6a item 3)", () => {
  const fibi = snap("fibi@2026-11-12");
  it("the records pass", () => expect(checkLineFacts(line(fibi, "fibi-fx-conversion-branch"), true)).toEqual([]));
  it("the flat step and the line's flat price say the same", () => {
    const l = line(fibi, "fibi-fx-conversion-branch");
    l.size_tiers![1]!.flat!.value = 4;
    expect(checkLineFacts(l, true).join()).toMatch(/flat_up_to and the flat size step differ/);
  });
  it("steps run from the smallest up, the last open above", () => {
    const l = line(fibi, "fibi-fx-conversion-branch");
    l.size_tiers = [...l.size_tiers!].reverse();
    expect(checkLineFacts(l, true).join()).toMatch(/smallest up/);
  });
});

describe("an offset and when a fee is collected (§3.6a items 4 and 6)", () => {
  it("each sits on its kind of line", () => {
    const ibi = snap("ibi@2026-11-12");
    const fee = line(ibi, "ibi-account-fee");
    expect(checkLineFacts(fee, true)).toEqual([]);
    expect(checkLineFacts({ ...fee, base: "trade" }, true).join()).toMatch(/offset belongs/);
    const custody = line(snap("excellence@2026-11-12"), "excellence-custody");
    expect(checkLineFacts({ ...custody, base: "trade" }, true).join()).toMatch(/collection belongs/);
  });
});

describe("distribution agreements (§3.6)", () => {
  const oneZero = snap("one-zero@2026-11-12");
  it("the record passes, and holds only funds the site has records for", () => {
    expect(checkSnapshotFacts(oneZero)).toEqual([]);
    const funds = new Set(readdirSync(join(data, "funds")).map((f) => f.split("@")[0]!));
    for (const r of oneZero.distribution_agreements!.reports) for (const f of r.funds) expect(funds.has(f), f).toBe(true);
  });
  it("the class stays open for a fund no record names", () => {
    const s = structuredClone(oneZero);
    s.availability = s.availability!.map((a) => (a.applies_to.includes("mutual_fund_units") ? { ...a, available: true } : a));
    expect(checkSnapshotFacts(s).join()).toMatch(/fund by fund/);
  });
});

describe("a fund's promotion (§3.5)", () => {
  const rec = fundRecord.parse(read<unknown>("funds/1148162@2026-11-14.json")) as FundRecord;
  it("the records pass", () => {
    expect(checkFundPromotions(rec)).toEqual([]);
    expect(checkFundPromotions(fundRecord.parse(read<unknown>("funds/1223866@2026-11-14.json")))).toEqual([]);
  });
  it("a promotion lowers the fee, in its unit, for stated days", () => {
    const p = rec.promotions![0]!;
    expect(checkFundPromotions({ ...rec, promotions: [{ ...p, rate: { ...p.rate, value: 0.02 } }] }).join()).toMatch(/below the fee's own/);
    expect(checkFundPromotions({ ...rec, promotions: [{ ...p, rate: { ...p.rate, effective_to: null } }] }).join()).toMatch(/first and last days/);
    expect(checkFundPromotions({ ...rec, promotions: [{ ...p, rate: { ...p.rate, unit: "pct" } }] }).join()).toMatch(/unit/);
  });
});

describe("the averages a house charged (§3.9)", () => {
  const files = readdirSync(join(data, "averages"));
  it("every record parses, named by its id and snapshot", () => {
    expect(files.length).toBe(15);
    for (const f of files) {
      const r = averagesRecord.parse(read<unknown>(`averages/${f}`));
      expect(f).toBe(`${r.id}@${r.snapshot}.json`);
    }
  });
  it("a cell outside the reporting period, or two cells for one band, fail", () => {
    const r = read<{ averages: { rows: { rate: { effective_to: string } }[] } }>(`averages/${files[0]}`);
    const moved = structuredClone(r);
    moved.averages.rows[0]!.rate.effective_to = "2026-12-31";
    expect(averagesRecord.safeParse(moved).success).toBe(false);
    const twice = structuredClone(r);
    twice.averages.rows.push(twice.averages.rows[0]!);
    expect(averagesRecord.safeParse(twice).success).toBe(false);
  });
});
