// What one deal may hold (limits.ts): every edit that would pass a limit refuses, leaves its fee as it was and says which limit it met;
// a deal at every limit still opens (`readDeal`), and its link is refused where it would be too long to open.
import { describe, expect, it } from "vitest";
import { addBy, addCase, addCaseAt, addOwnPlace, addStep, addValues, copyCase, setStep, splitCase } from "./edits/case";
import { splitAt } from "./edits/stage";
import { addFee, setPick } from "./edits/deal";
import { CASES_MAX, FEES_MAX, PICKS_MAX, STAGES_MAX, TOPS_MAX, VALUES_MAX, dealBreach, feeBreach, held, takeRefusal } from "./limits";
import { packDeal } from "./link";
import { newDeal, newFee, readDeal, typed, type Case, type CasesFee, type Fee, type FeeDeal, type SlimFee, type Stage } from "./model";

const price = (v: number): Stage["price"] => ({ form: "action", rate: typed(v) });
/** Prices over time: `n` of them, a month apart from 2027-01. */
const stages = (n: number): Stage[] => Array.from({ length: n }, (_, k) => (k < n - 1 ? { price: price(k + 1), until: `2027-${String(k + 2).padStart(2, "0")}` } : { price: price(k + 1) }));
const slim = (n: number): SlimFee => ({ id: "fee-trade", kind: "trade", stages: stages(n) });
/** A trade fee that changes by a condition of the person's own, with `n` cases, each its own value. */
const cases = (n: number): CasesFee => ({
  id: "fee-trade",
  kind: "trade",
  by: [{ kind: "own", label: "ערוץ" }],
  cases: Array.from({ length: n }, (_, k): Case => ({ id: `c${k}`, when: [[`v${k}`]], stages: [{ price: price(1) }] })),
});
/** A conversion fee whose price changes by the trade's size, with `tops` tops (a case on each step). */
const ranged = (tops: number): CasesFee => ({
  id: "fee-fx",
  kind: "fx",
  by: [{ kind: "actionSize", unit: "USD", tops: Array.from({ length: tops }, (_, k) => typed((k + 1) * 10)) }],
  cases: Array.from({ length: tops + 1 }, (_, k): Case => ({ id: `s${k}`, when: [k], stages: [{ price: price(1) }] })),
});
/** A trade fee that changes by what is bought, with `n` values of the person's own. */
const owned = (n: number): CasesFee => ({
  id: "fee-trade",
  kind: "trade",
  by: [{ kind: "what", own: Array.from({ length: n }, (_, k) => ({ name: `ני״ע ${k}`, place: "abroad" as const, currency: "USD" })) }],
  cases: [{ id: "c0", when: [["tase"]], stages: [{ price: price(1) }] }],
});
const dealOf = (...fees: Fee[]): FeeDeal => ({ ...newDeal("brokerage-account"), id: "deal-a", fees });
/** The deal as the device stores it and reads it back. */
const roundTrip = (d: FeeDeal) => readDeal(JSON.parse(JSON.stringify(d)));

/** That an edit left `fee` as it was and met `limit`; the mark is said once. */
function refused(fee: Fee, after: Fee, limit: string) {
  expect(after).toBe(fee);
  expect(takeRefusal(fee)).toBe(limit);
  expect(takeRefusal(fee)).toBeNull();
}

describe("an edit at a limit refuses", () => {
  it("adds no change of price past STAGES_MAX prices", () => {
    const full = slim(STAGES_MAX);
    expect(roundTrip(dealOf(full))).not.toBeNull();
    refused(full, splitAt(full, "buy", "2030-06"), "stages");
    // one short of it takes one more
    expect(pricesOf(splitAt(slim(STAGES_MAX - 1), "buy", "2030-06"))).toBe(STAGES_MAX);
  });
  it("adds, copies and places no case past CASES_MAX", () => {
    const full = cases(CASES_MAX);
    expect(roundTrip(dealOf(full))).not.toBeNull();
    refused(full, addCase(full), "cases");
    refused(full, copyCase(full, "c0"), "cases");
    refused(full, addCaseAt(full, "c0", 0, ["new"]), "cases");
    refused(full, addValues(full, 0, ["new"]), "cases");
    expect((addCase(cases(CASES_MAX - 1)) as CasesFee).cases).toHaveLength(CASES_MAX);
  });
  it("adds no thing that would make more than CASES_MAX cases", () => {
    const half = cases(CASES_MAX / 2 + 1);
    refused(half, addBy(half, { kind: "channel", values: ["branch", "direct"] }), "cases");
    const full = cases(CASES_MAX);
    refused(full, splitCase(full, "c0", { kind: "channel", values: ["branch", "direct"] }), "cases");
    expect((addBy(cases(CASES_MAX / 2), { kind: "channel", values: ["branch", "direct"] }) as CasesFee).cases).toHaveLength(CASES_MAX);
  });
  it("adds no step past TOPS_MAX tops", () => {
    const full = ranged(TOPS_MAX);
    expect(roundTrip(dealOf(full))).not.toBeNull();
    refused(full, addStep(full, 0, 5), "tops");
    refused(full, setStep(full, "s0", 0, 5), "tops");
    expect((addStep(ranged(TOPS_MAX - 1), 0, 5) as CasesFee).by[0]).toMatchObject({ tops: { length: TOPS_MAX } });
  });
  it("names no value of the person's own past VALUES_MAX", () => {
    const full = owned(VALUES_MAX);
    expect(roundTrip(dealOf(full))).not.toBeNull();
    refused(full, addOwnPlace(full, 0, { name: "עוד אחד", place: "abroad", currency: "USD" }), "values");
  });
  it("adds no fee past FEES_MAX, and no pick past PICKS_MAX", () => {
    const full = dealOf(...Array.from({ length: FEES_MAX }, (_, k) => ({ ...newFee("own", `עמלה ${k}`), id: `fee-${k}` })));
    expect(roundTrip(full)).not.toBeNull();
    expect(addFee(full, "own")).toBeNull();
    expect(addFee({ ...full, fees: full.fees.slice(1) }, "own")!.deal.fees).toHaveLength(FEES_MAX);
    const picked = Array.from({ length: PICKS_MAX }, (_, k) => `own:${k}`).reduce((d, by) => setPick(d, by, "x"), dealOf());
    expect(picked.readFor).toHaveLength(PICKS_MAX);
    expect(setPick(picked, "own:more", "x")).toBe(picked);
    expect(setPick(picked, "own:0", "y").readFor).toHaveLength(PICKS_MAX);
  });
  it("lets a change through that passes no limit, and leaves a fee already past one to the edit (`held`)", () => {
    const fee = slim(2);
    const next = splitAt(fee, "buy", "2030-06");
    expect(next).not.toBe(fee);
    expect(takeRefusal(fee)).toBeNull();
    const over = slim(STAGES_MAX + 1);
    expect(feeBreach(over)).toBe("stages");
    const longer = { ...over, stages: [...over.stages] };
    expect(held(over, longer)).toBe(longer);
  });
  it("says which fee of a deal passes a limit", () => {
    expect(dealBreach(dealOf(slim(1), { ...cases(CASES_MAX + 1), id: "fee-big" }))).toEqual({ limit: "cases", feeId: "fee-big" });
    expect(dealBreach(dealOf(slim(STAGES_MAX)))).toBeNull();
  });
});

describe("a link too long to open", () => {
  it("is refused rather than written", async () => {
    // every figure its own, so the compression has little to fold: forty fees of a hundred and twenty cases each
    let n = 0;
    const big = (k: number): CasesFee => ({ ...cases(CASES_MAX), id: `fee-${k}`, cases: cases(CASES_MAX).cases.map((c) => ({ ...c, stages: [{ price: price(n++ / 7) }] })) });
    expect(await packDeal(dealOf(...Array.from({ length: 40 }, (_, k) => big(k))))).toBeNull();
    expect(await packDeal(dealOf(cases(CASES_MAX)))).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

function pricesOf(f: Fee): number {
  return (f as SlimFee).stages.length;
}
