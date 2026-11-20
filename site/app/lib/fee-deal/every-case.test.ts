// The parts every case of a fee holds alike (every-case.ts), on a custody fee by what is held and the portfolio's size, read on the site's
// own data: which part rows stand apart from the grid and which stay in it, editing and taking away such a part in every case, the part
// going back into the grid once an edit makes the cases differ, and a part added to every case at once, its amount asked once for them all.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { readDealFor } from "./deal-read";
import { builder } from "./rows";
import { askAcross, everyCaseRows, withoutRows } from "./every-case";
import { bandLayout, laterChanges } from "./band-layout";
import { figureToAll, partAcross } from "./edits/cells";
import { liftRemove } from "./lifted";
import { editPrice } from "./edits/stage";
import { withFigure } from "./edits/price";
import { typed, type CasesFee, type FeeDeal, type Price } from "./model";
import { besideThePrice, PART_IDS, PARTS } from "./offers/parts";
import { WHOLE } from "./layout";

const kinds = feesData().kinds;
const TODAY = "2026-11-20";
const read = (deal: FeeDeal) => readDealFor(deal, kinds, TODAY);

const held = (rate: number, more: Partial<Extract<Price, { form: "held" }>> = {}): Price => ({ form: "held", rate: typed(rate), per: 12, every: 12, ...more });
const RATES = { tase: [0.195, 0.15, 0.1], us: [0.199, 0.15, 0.1] } as const;
/** Custody by what is held and the portfolio's size: six cases, each with its own rate and the same maximum on each security. */
const custody = (each: (what: "tase" | "us", step: number) => Partial<Extract<Price, { form: "held" }>> = () => ({ perSecurity: typed(4000) })): CasesFee => ({
  id: "fee-c",
  kind: "custody",
  by: [{ kind: "held", values: [] }, { kind: "portfolioSize", unit: "ILS", tops: [typed(100_000), typed(500_000)] }],
  cases: (["tase", "us"] as const).flatMap((what) => [0, 1, 2].map((step) => ({ id: `${what}${step}`, when: [[what], step], stages: [{ price: held(RATES[what][step]!, each(what, step)) }] }))),
});
const deal = (fee: CasesFee): FeeDeal => ({ id: "deal-e", name: "", kind: "brokerage-account", fees: [fee] });
const feeOf = (d: FeeDeal) => d.fees[0] as CasesFee;
/** The band's rows the builder gives the fee: every case's parts, later prices included. */
const bandRows = (fee: CasesFee) => {
  const b = builder(read(deal(fee))).rows[0]!.block;
  if (b.kind !== "band") throw new Error("a fee with cases reads as a band");
  return b.rows;
};
const every = (fee: CasesFee) => everyCaseRows(bandRows(fee));
const ids = (fee: CasesFee) => fee.cases.map((c) => c.id);

describe("the parts every case holds alike", () => {
  it("are the parts a price keeps beside its main figure: never its form, a later price or a sale priced apart", () => {
    const beside = PART_IDS.filter(besideThePrice);
    expect(beside).toEqual(expect.arrayContaining(["min", "max", "cap", "flat", "maxPerSecurity", "discount", "third", "offset", "refund", "unfilled", "partial", "inTrade"]));
    for (const id of ["share", "perUnit", "perAction", "held", "sum", "free", "until", "sale"] as const) expect(besideThePrice(id), id).toBe(false);
    expect(beside.every((id) => !PARTS[id].form)).toBe(true);
  });

  it("take the maximum on each security every case holds out of the grid, said once, and leave the rates there", () => {
    const fee = custody();
    expect(every(fee)).toEqual(["maxPerSecurity"]);
    const rows = bandRows(fee).map((r) => ({ ...r, parts: laterChanges(r.parts) }));
    const laid = bandLayout(fee, withoutRows(rows, every(fee)));
    expect(laid.shape).toBe("grid");
    if (laid.shape !== "grid") return;
    // the grid gets shorter: no part line under either row, and no row's group says it once on a phone
    expect(laid.rows.map((r) => r.parts)).toEqual([[], []]);
    expect(laid.rows.map((r) => r.once)).toEqual([[], []]);
    expect(Object.values(laid.cellShows).every((shown) => !shown.includes("maxPerSecurity"))).toBe(true);
    // read as it stood, each row had the maximum as a part line over its three sizes
    const before = bandLayout(fee, rows);
    expect(before.shape === "grid" && before.rows.map((r) => r.parts.map((p) => p.row))).toEqual([["maxPerSecurity"], ["maxPerSecurity"]]);
  });

  it("never move the price itself, even where every case charges the same", () => {
    const same: CasesFee = { ...custody(), cases: custody().cases.map((c) => ({ ...c, stages: [{ price: held(0.1, { perSecurity: typed(4000) }) }] })) };
    expect(every(same)).toEqual(["maxPerSecurity"]);
  });

  it("leave a part only some cases hold, or hold otherwise, in the grid", () => {
    expect(every(custody((what) => (what === "tase" ? { perSecurity: typed(4000) } : {})))).toEqual([]);
    expect(every(custody((what) => ({ perSecurity: typed(what === "tase" ? 4000 : 7400) })))).toEqual([]);
  });

  it("count every case of a third thing's every value, not only the cases the switch shows", () => {
    const three: CasesFee = {
      ...custody(),
      by: [...custody().by, { kind: "channel", values: [] }],
      cases: custody().cases.flatMap((c) => [
        { ...c, id: `${c.id}-d`, when: [...c.when, ["direct"]] },
        { ...c, id: `${c.id}-b`, when: [...c.when, ["branch"]], stages: c.id === "us2" ? [{ price: held(0.1) }] : c.stages },
      ]),
    };
    expect(every(three)).toEqual([]);
    expect(every({ ...three, cases: three.cases.filter((c) => c.id !== "us2-b") })).toEqual(["maxPerSecurity"]);
  });

  it("need two cases at least", () => {
    const one: CasesFee = { ...custody(), cases: [custody().cases[0]!] };
    expect(every(one)).toEqual([]);
  });

  it("stay in the grid where a later price of a case does not hold them alike, so the part said once reads for every price", () => {
    const later = (fee: CasesFee, then: Price): CasesFee => ({ ...fee, cases: fee.cases.map((c, k) => (k === 0 ? { ...c, stages: [{ ...c.stages[0]!, until: "2027-01" }, { price: then }] } : c)) });
    expect(every(later(custody(), held(0.3, { perSecurity: typed(4000) })))).toEqual(["maxPerSecurity"]);
    expect(every(later(custody(), held(0.3)))).toEqual([]);
  });

  it("are edited in every case at once, and go back into the grid on their own once an edit inside it makes the cases differ", () => {
    const fee = custody();
    const all = ids(fee);
    // the cell said once: its figure typed in the first case, set in every other (EditHere over every case)
    const typedOnce = figureToAll(editPrice(fee, "buy", 0, (p) => withFigure(p, "perSecurity", 5000), all[0]), all[0], all.slice(1), 0, "perSecurity") as CasesFee;
    expect(typedOnce.cases.map((c) => (c.stages[0]!.price as { perSecurity?: { v: number } }).perSecurity?.v)).toEqual([5000, 5000, 5000, 5000, 5000, 5000]);
    expect(every(typedOnce)).toEqual(["maxPerSecurity"]);
    // one case's maximum edited inside its own cell: the cases differ, and the part stands in the grid again
    const split = editPrice(typedOnce, "buy", 0, (p) => withFigure(p, "perSecurity", 7400), "us1") as CasesFee;
    expect(every(split)).toEqual([]);
  });

  it("are taken away from every case by the cell's bin, with the undo's words", () => {
    const fee = custody();
    const r = liftRemove(deal(fee), { k: "cell", fee: fee.id, cases: ids(fee), row: "maxPerSecurity", along: 1 })!;
    expect(feeOf(r.deal).cases.every((c) => (c.stages[0]!.price as { perSecurity?: unknown }).perSecurity === undefined)).toBe(true);
    expect(r.kept?.words).toBeTruthy();
    expect(every(feeOf(r.deal))).toEqual([]);
    // the whole case is never what the bin of a part said once takes
    expect(liftRemove(deal(fee), { k: "cell", fee: fee.id, cases: ids(fee), row: WHOLE, along: 1 })!.deal.fees[0]).not.toEqual(feeOf(r.deal));
  });
});

describe("a part added to every case at once", () => {
  const bare = custody(() => ({}));

  it("puts no figure in before the person gives one, and the amount given once in every case, said once", () => {
    expect(partAcross(bare, ids(bare), "maxPerSecurity", 1)).toBe(bare);
    const added = partAcross(bare, ids(bare), "maxPerSecurity", 1, { value: 4000 }) as CasesFee;
    expect(added.cases.map((c) => (c.stages[0]!.price as { perSecurity?: { v: number } }).perSecurity?.v)).toEqual([4000, 4000, 4000, 4000, 4000, 4000]);
    expect(every(added)).toEqual(["maxPerSecurity"]);
  });

  it("asks once, in the words the open case asks it, where every case asks it alike", () => {
    expect(askAcross(bare, ids(bare), "maxPerSecurity")).toMatchObject({ sign: expect.any(String), words: { lead: expect.any(String) } });
    expect(askAcross(bare, ids(bare), "discount")).toBeNull();
  });

  it("is refused where a case holds that part already: nothing the person gave is overwritten", () => {
    const one = custody((what, step) => (what === "tase" && step === 0 ? { perSecurity: typed(7500) } : {}));
    expect(partAcross(one, ids(one), "maxPerSecurity", 1, { value: 4000 })).toBe(one);
  });
});
