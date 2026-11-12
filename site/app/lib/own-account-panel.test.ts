// The panel's own logic (own-account-panel.ts): the draft it starts from, the starting point a draft stands on, the stretches of the year strip.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brokerFromDraft } from "./custom-entries";
import { startingPointsOf, withAdopted } from "./own-account";
import { pointOfBroker, startDraft, stretchesOf } from "./own-account-panel";
import { layersOf } from "./own-account-view";
import type { WorkbenchInputs } from "./providers";
import { buildIndicesBundle } from "./providers.server";
import { entered } from "./value";

const bundle = buildIndicesBundle();
const t = bundle.today;
// the worked example of a price for a time is Leumi's opening offer as the 2026-11-04 record held it (see own-account.test.ts)
const leumi = JSON.parse(readFileSync(new URL("../../../data/fees/leumi@2026-11-04.json", import.meta.url), "utf8")) as (typeof bundle.snapshots)[number];
const points = startingPointsOf(leumi);
const OFFER = points.find((p) => p.nameHe === "לאומי סטודנט, בפתיחת חשבון")!;
const plan: WorkbenchInputs = {
  amountNow: 6000, monthly: 400, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  returnFromParameter: false,
};

const layersFor = (adopt: boolean, untilYears: number | null) => {
  let draft = startDraft(leumi, OFFER, "שלי");
  if (adopt) draft = { ...draft, base: { ...draft.base!, group: draft.base!.group!.prices.reduce((g, p) => (p.value && !p.names_fund ? withAdopted(g, p.fee, true) : g), draft.base!.group!) } };
  const b = brokerFromDraft({ ...draft, untilYears }, "custom-broker-x", t);
  return layersOf(bundle, plan, b, leumi, "il-etf")!;
};

describe("the panel's draft and strip", () => {
  it("starts from a house's price list or a group with nothing typed and the whole plan", () => {
    const list = startDraft(leumi, points[0]!, "שלי");
    expect(list.base).toMatchObject({ houseId: "leumi", group: null });
    expect(list.untilYears).toBeNull();
    const group = startDraft(leumi, OFFER, "שלי");
    expect(group.base!.group!.name).toBe(OFFER.nameHe);
  });
  it("finds the starting point a draft stands on, the price list when it has no group", () => {
    expect(pointOfBroker(points, startDraft(leumi, OFFER, "x").base)).toBe(OFFER);
    expect(pointOfBroker(points, startDraft(leumi, points[0]!, "x").base)).toBe(points[0]);
    expect(pointOfBroker(points, undefined)).toBe(points[0]);
  });
  it("shows no stretch when no price of the group is applied", () => {
    expect(stretchesOf(layersFor(false, null), null, 10)).toBeNull();
  });
  it("shows each applied price to its own end, no longer than the stay", () => {
    const layers = layersFor(true, null);
    const whole = stretchesOf(layers, null, 10)!;
    expect(whole[0]).toMatchObject({ fromYears: 0, kind: "all" });
    expect(whole.at(-1)!.toYears).toBe(10);
    // the stretches cover the plan, one after the other
    whole.forEach((s, i) => { if (i > 0) expect(s.fromYears).toBe(whole[i - 1]!.toYears); });
    const short = stretchesOf(layers, 2, 10)!;
    expect(short.at(-1)).toMatchObject({ toYears: 10, kind: "none" });
    expect(short.some((s) => s.toYears === 2)).toBe(true);
  });
});
