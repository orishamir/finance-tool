// The toolbox on several of a fee's cases at once (toolbox.ts `casesToolbox`, `casesTool`), on the First International Bank's buy and sell
// fee as its price list fills it (Tel Aviv and מק״מ in shekels, abroad in dollars, each online and at a branch): every card the fee is
// offered shows; a card is had where every case has it, can be added only where it then stands in every case alike, and is off with why
// otherwise; a note goes beside a case's other notes; and a tap and a drop on those cases do the same.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { feeDeal } from "../../copy";
import { newDeal, hasCases, type CasesFee, type FeeDeal, type Price } from "./model";
import { dealFromTemplate } from "./templates";
import { readDealFor } from "./deal-read";
import { builder } from "./rows";
import { casesTool, casesToolbox, toolbox, type CasesTarget, type ToolPart } from "./toolbox";
import { askAcross, everyCaseRows } from "./every-case";
import { partAcross } from "./edits/cells";

const data = feesData();
const copy = feeDeal.cases;
const TODAY = "2026-11-20";
const fibi = (): FeeDeal => dealFromTemplate(newDeal("brokerage-account"), "house:fibi", data, TODAY)!;
const read = (deal: FeeDeal) => readDealFor(deal, data.kinds, TODAY);
const tradeOf = (deal: FeeDeal) => deal.fees.find((f) => f.kind === "trade") as CasesFee;
/** The deal with the trade fee's cases' first prices changed by `edit`. */
const withTrade = (edit: (p: Price, caseId: string) => Price): FeeDeal => {
  const deal = fibi();
  const fee = tradeOf(deal);
  const cases = fee.cases.map((c) => ({ ...c, stages: [{ ...c.stages[0]!, price: edit(c.stages[0]!.price, c.id) }, ...c.stages.slice(1)] }));
  return { ...deal, fees: deal.fees.map((f) => (f.id === fee.id ? { ...fee, cases } : f)) };
};
const without = (p: Price, key: string): Price => {
  const { [key]: _gone, ...rest } = p as Record<string, unknown>;
  return rest as Price;
};
const every = (deal: FeeDeal): CasesTarget => {
  const fee = tradeOf(deal);
  return { fee: fee.id, cases: fee.cases.map((c) => c.id), along: 1 };
};
const cardsOf = (deal: FeeDeal) => casesToolbox(read(deal), every(deal))!.groups.flatMap((g) => g.parts);
const card = (deal: FeeDeal, id: string): ToolPart => cardsOf(deal).find((p) => p.id === id)!;
const bandRows = (deal: FeeDeal, feeId: string) => {
  const row = builder(read(deal)).rows.find((x) => x.fee === feeId)!;
  if (row.block.kind !== "band") throw new Error("a fee with cases reads as a band");
  return row.block.rows;
};

describe("the toolbox on every case of a fee", () => {
  it("names what it adds to and lists every card one case's toolbox lists", () => {
    const deal = fibi();
    const r = read(deal);
    const fee = tradeOf(deal);
    const view = casesToolbox(r, every(deal))!;
    expect(view.addTo!.lead).toBe(copy.addToAll);
    const ids = new Set(view.groups.flatMap((g) => [...g.parts.map((p) => p.id), ...g.lines.map((l) => l.id)]));
    for (const c of fee.cases) for (const g of toolbox(r, fee.id, c.id)!.groups) for (const p of [...g.parts, ...g.lines]) expect(ids.has(p.id), p.id).toBe(true);
    // a grid row's names its row
    const row = casesToolbox(r, { ...every(deal), cases: ["c1", "c2"], row: "tase" })!;
    expect(row.addTo!.lead).toBe(copy.addToRow);
    expect(row.addTo!.when).toHaveLength(1);
  });

  it("marks a maximum every case holds as had, whatever each case's figure", () => {
    expect(card(fibi(), "max")).toMatchObject({ used: true });
    expect(card(fibi(), "max").off).toBeUndefined();
  });

  it("adds a part none holds and all can take to every case alike, said once over the band", () => {
    const deal = fibi();
    const fee = tradeOf(deal);
    expect(card(deal, "discount")).toMatchObject({ used: false });
    expect(card(deal, "discount").off).toBeUndefined();
    const t = casesTool(read(deal), every(deal), "discount");
    expect(t?.k).toBe("fee");
    const next = t && t.k === "fee" ? (t.fee as CasesFee) : fee;
    const after: FeeDeal = { ...deal, fees: deal.fees.map((f) => (f.id === fee.id ? next : f)) };
    expect(everyCaseRows(bandRows(after, fee.id))).toContain("discount");
  });

  it("asks an amount once where every case asks it alike, and the amount given stands once for them all", () => {
    const deal = withTrade((p) => without(p, "cap"));
    const fee = tradeOf(deal);
    const t = casesTool(read(deal), every(deal), "cap");
    expect(t).toMatchObject({ k: "ask", ask: { part: "cap", cases: fee.cases.map((c) => c.id), along: 1 } });
    const next = partAcross(fee, fee.cases.map((c) => c.id), "cap", 1, { value: 25 });
    const after: FeeDeal = { ...deal, fees: deal.fees.map((f) => (f.id === fee.id ? next : f)) };
    expect(everyCaseRows(bandRows(after, fee.id))).toContain("cap");
  });

  it("asks once for the fee an offset is against, which every case then names alike", () => {
    const deal = fibi();
    const custody = deal.fees.find((f) => f.kind === "custody") as CasesFee;
    const target = { fee: custody.id, cases: custody.cases.map((c) => c.id), along: 0 };
    expect(askAcross(custody, target.cases, "offset")).toMatchObject({ words: { lead: expect.any(String) } });
    const next = partAcross(custody, target.cases, "offset", 0, { against: "trade" }) as CasesFee;
    expect(next.cases.map((c) => (c.stages[0]!.price as { offset?: unknown }).offset)).toEqual([{ kind: "trade" }, { kind: "trade" }]);
  });

  it("leaves off, with why, a minimum some cases hold and others not", () => {
    const deal = withTrade((p, id) => (id === "c1" ? without(p, "min") : p));
    expect(card(deal, "min")).toMatchObject({ used: false, off: copy.casesOff.someHave });
    expect(casesTool(read(deal), every(deal), "min")).toBeNull();
  });

  it("leaves off, with why, a minimum no case holds where the cases keep their sums in shekels and in dollars", () => {
    const deal = withTrade((p) => without(p, "min"));
    expect(card(deal, "min")).toMatchObject({ used: false, off: copy.casesOff.currencies });
    expect(casesTool(read(deal), every(deal), "min")).toBeNull();
    // the shekel cases alone, a row of them, ask it once
    const shekels = { ...every(deal), cases: ["c1", "c2", "c3", "c4"] };
    expect(casesTool(read(deal), shekels, "min")).toMatchObject({ k: "ask", ask: { part: "min" } });
  });

  it("leaves off a form of the price and the month a price changes from, which are set in each case on its own", () => {
    const deal = fibi();
    expect(card(deal, "perUnit")).toMatchObject({ off: copy.casesOff.perCase });
    // the form every case has is had, as in any fee
    expect(card(deal, "share")).toMatchObject({ used: true });
    const line = casesToolbox(read(deal), every(deal))!.groups.flatMap((g) => g.lines).find((l) => l.id === "until");
    expect(line?.off).toBe(copy.casesOff.perCase);
    expect(casesTool(read(deal), every(deal), "perUnit")).toBeNull();
    expect(casesTool(read(deal), every(deal), "until")).toBeNull();
  });

  it("puts a note beside the notes a case has, in every case that lacks it", () => {
    const deal = fibi();
    const fee = tradeOf(deal);
    expect(card(deal, "partial").off).toBeUndefined();
    const t = casesTool(read(deal), every(deal), "partial");
    expect(t?.k).toBe("fee");
    const next = t && t.k === "fee" && hasCases(t.fee) ? t.fee : fee;
    const notes = (id: string) => (next.cases.find((c) => c.id === id)!.stages[0]!.price as { notes?: string[] }).notes;
    expect(notes("c1")).toEqual(["partial"]);
    expect(notes("c2")).toEqual(["unfilledClerk", "partial"]);
    expect(notes("c6")).toEqual(["unfilledClerkAbroad", "partial"]);
    // had by every case once it is there
    const after: FeeDeal = { ...deal, fees: deal.fees.map((f) => (f.id === fee.id ? next : f)) };
    expect(card(after, "partial")).toMatchObject({ used: true });
  });

  it("does on a drop what a tap does: a card it refuses is one the toolbox shows had or off", () => {
    for (const deal of [fibi(), withTrade((p) => without(p, "min")), withTrade((p, id) => (id === "c5" ? without(p, "max") : p))]) {
      for (const p of cardsOf(deal)) {
        if (p.id.startsWith("by:")) continue;
        expect(casesTool(read(deal), every(deal), p.id) !== null, p.id).toBe(!p.used && !p.off);
      }
    }
  });
});
