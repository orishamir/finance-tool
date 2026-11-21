// A list thing's values kept apart from its cases (model.ts `By.values`, F-114): a value no case names is a row or a column of places
// no case holds, the reading prints no price for it, every edit keeps the values, and a deal saved or linked before things kept them opens
// with them from its cases.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { bandLayout } from "./band-layout";
import type { CaseRow } from "./rows";
import { readDealFor } from "./deal-read";
import { leftOut } from "./left-out";
import { pickLine, readingOf } from "./reading";
import { liftDrop, liftRemove } from "./lifted";
import { decodeDeal, encodeDeal } from "./link";
import { addBlankCase, addBy, addValues, removeBy, removeCase, setWhen, splitCase } from "./edits/case";
import { duplicateValue, inOrderOf, moveValue, removeColumn, removeValue, swapThings } from "./edits/arrange";
import { duplicateFee } from "./edits/deal";
import { thingMenu, slotEdit } from "./things";
import { valueKey, WHOLE } from "./layout";
import { readDeal, thingValues, typed, type CasesFee, type Fee, type FeeDeal } from "./model";

const data = feesData();
const TODAY = "2026-11-12";
const rate = (v: number) => ({ form: "action" as const, rate: typed(v) });

/** A bank's trade fee by what is bought down and the channel across; money market certificates (מק״מ) on the internet alone. */
const trade = (): CasesFee => ({
  id: "fee-trade",
  kind: "trade",
  by: [
    { kind: "what", values: ["tase", "makam", "us"] },
    { kind: "channel", values: ["direct", "branch"] },
  ],
  cases: [
    { id: "t-d", when: [["tase"], ["direct"]], stages: [{ price: rate(0.1) }] },
    { id: "t-b", when: [["tase"], ["branch"]], stages: [{ price: rate(0.5) }] },
    { id: "m-d", when: [["makam"], ["direct"]], stages: [{ price: rate(0.05) }] },
    { id: "u-d", when: [["us"], ["direct"]], stages: [{ price: rate(0.2) }] },
    { id: "u-b", when: [["us"], ["branch"]], stages: [{ price: rate(0.6) }] },
  ],
});
const dealOf = (fee: Fee, readFor?: FeeDeal["readFor"]): FeeDeal => ({ id: "deal-v", name: "", kind: "brokerage-account", fees: [fee], ...(readFor ? { readFor } : {}) });
const feeIn = (d: FeeDeal) => d.fees[0] as CasesFee;
const grid = (fee: CasesFee) => {
  const l = bandLayout(fee, fee.cases.map((c) => ({ case: c.id, parts: [] }) as unknown as CaseRow));
  if (l.shape !== "grid") throw new Error(`a ${l.shape}`);
  return l;
};

describe("a row's last cell taken away", () => {
  it("leaves its value as a row of places no case holds", () => {
    const r = liftRemove(dealOf(trade()), { k: "cell", fee: "fee-trade", cases: ["m-d"], row: WHOLE, along: 1 })!;
    const fee = feeIn(r.deal);
    expect(fee.cases.map((c) => c.id)).not.toContain("m-d");
    expect(thingValues(fee, 0)).toEqual(["tase", "makam", "us"]);
    const g = grid(fee);
    expect(g.rows.map((x) => x.key)).toEqual([valueKey(["tase"]), valueKey(["makam"]), valueKey(["us"])]);
    expect(g.rows[1]!.cases).toEqual([]);
    expect(g.rows[1]!.cells.map((c) => c.case)).toEqual([null, null]);
  });

  it("leaves a column of a table with no case where it was the column's last", () => {
    const table: CasesFee = { id: "f", kind: "trade", by: [{ kind: "channel", values: ["direct", "branch"] }], cases: [
      { id: "a", when: [["direct"]], stages: [{ price: rate(0.1) }] },
      { id: "b", when: [["branch"]], stages: [{ price: rate(0.5) }] },
    ] };
    const left = removeCase(table, "b") as CasesFee;
    const l = bandLayout(left, left.cases.map((c) => ({ case: c.id, parts: [] }) as unknown as CaseRow));
    expect(l.shape === "table" && l.columns).toEqual([{ case: "a", when: ["direct"] }, { case: null, when: ["branch"] }]);
    // its head takes the column away with its value
    expect(thingValues(removeColumn(table, "b") as CasesFee, 0)).toEqual(["direct"]);
    expect(thingValues(removeValue(left, 0, valueKey(["branch"])) as CasesFee, 0)).toEqual(["direct"]);
  });

  it("never takes away a fee's last case", () => {
    const one: CasesFee = { ...trade(), cases: [trade().cases[0]!] };
    expect(removeCase(one, "t-d")).toBe(one);
    expect(removeValue(one, 0, valueKey(["tase"]))).toBe(one);
  });
});

describe("a value taken away by its head", () => {
  it("goes with its cases, a row with no case too", () => {
    const r = liftRemove(dealOf(trade()), { k: "value", fee: "fee-trade", t: 0, key: valueKey(["makam"]), name: "מק״מ" })!;
    expect(thingValues(feeIn(r.deal), 0)).toEqual(["tase", "us"]);
    expect(feeIn(r.deal).cases.map((c) => c.id)).toEqual(["t-d", "t-b", "u-d", "u-b"]);
    const empty = removeCase(trade(), "m-d") as CasesFee;
    const gone = removeValue(empty, 0, valueKey(["makam"])) as CasesFee;
    expect(thingValues(gone, 0)).toEqual(["tase", "us"]);
    expect(gone.cases).toEqual(empty.cases);
    expect(grid(gone).rows.map((x) => x.key)).toEqual([valueKey(["tase"]), valueKey(["us"])]);
  });
});

describe("every edit keeps the values", () => {
  const empty = () => removeCase(trade(), "m-d") as CasesFee;
  it("adds values with no case, at the end or before a value", () => {
    expect(thingValues(addValues(empty(), 0, ["mutualFunds"]) as CasesFee, 0)).toEqual(["tase", "makam", "us", "mutualFunds"]);
  });
  it("moves a value with no case, the page's order following the values", () => {
    const moved = moveValue(empty(), 0, valueKey(["makam"]), valueKey(["tase"])) as CasesFee;
    expect(thingValues(moved, 0)).toEqual(["makam", "tase", "us"]);
    expect(grid(moved).rows.map((x) => x.key)).toEqual([valueKey(["makam"]), valueKey(["tase"]), valueKey(["us"])]);
    const back = moveValue(moved, 0, valueKey(["us"]), valueKey(["makam"])) as CasesFee;
    expect(thingValues(back, 0)).toEqual(["us", "makam", "tase"]);
  });
  it("duplicates a value right after it, with its cases", () => {
    const d = duplicateValue(trade(), 0, valueKey(["tase"]), "מניות דואליות") as CasesFee;
    expect(thingValues(d, 0)).toEqual(["tase", "מניות דואליות", "makam", "us"]);
    expect(d.cases.filter((c) => (c.when[0] as string[])[0] === "מניות דואליות")).toHaveLength(2);
  });
  it("swaps the things with their values", () => {
    const s = swapThings(empty(), 0, 1) as CasesFee;
    expect(thingValues(s, 0)).toEqual(["direct", "branch"]);
    expect(thingValues(s, 1)).toEqual(["tase", "makam", "us"]);
    expect(bandLayout(s, s.cases.map((c) => ({ case: c.id, parts: [] }) as unknown as CaseRow)).shape).toBe("grid");
  });
  it("keeps the other things' values when a thing stops, and adds a thing with its values", () => {
    const stopped = removeBy(empty(), 1) as CasesFee;
    expect(thingValues(stopped, 0)).toEqual(["tase", "makam", "us"]);
    const added = addBy(stopped, { kind: "track", values: ["מסלול 1", "מסלול 2"] }) as CasesFee;
    expect(added.by[1]).toEqual({ kind: "track", values: ["מסלול 1", "מסלול 2"] });
    expect(thingValues(added, 0)).toEqual(["tase", "makam", "us"]);
  });
  it("splits a case into values the thing keeps after its own", () => {
    const anyChannel: CasesFee = { ...empty(), cases: [...empty().cases, { id: "w", when: [["world"], "any"], stages: [{ price: rate(0.3) }] }] };
    const s = splitCase(anyChannel, "w", { kind: "channel", values: ["direct", "phone"] }) as CasesFee;
    expect(thingValues(s, 1)).toEqual(["direct", "branch", "phone"]);
    expect(thingValues(s, 0)).toEqual(["tase", "makam", "us", "world"]);
  });
  it("keeps a value a case named before it named another", () => {
    const moved = setWhen(trade(), "m-d", 0, ["mutualFunds"]) as CasesFee;
    expect(thingValues(moved, 0)).toEqual(["tase", "makam", "us", "mutualFunds"]);
    expect(grid(moved).rows[1]!.cases).toEqual([]);
  });
  it("copies a fee with its values", () => {
    const d = duplicateFee(dealOf(empty()), "fee-trade")!;
    expect(thingValues(d.deal.fees.find((f) => f.id === d.feeId) as CasesFee, 0)).toEqual(["tase", "makam", "us"]);
  });
  it("puts an undone fee back in the values' order a move set since, a value it lacked after its neighbour", () => {
    const was = trade();
    const now = moveValue(removeValue(was, 0, valueKey(["makam"])), 0, valueKey(["us"]), valueKey(["tase"])) as CasesFee;
    expect(thingValues(inOrderOf(was, now) as CasesFee, 0)).toEqual(["us", "tase", "makam"]);
  });
});

describe("the reading of a value no case names (F-114)", () => {
  const empty = () => removeCase(trade(), "m-d") as CasesFee;
  it("offers it among the picks, the thing's menu and a slot", () => {
    const r = readDealFor(dealOf(empty()), data.kinds, TODAY);
    expect(pickLine(r)!.things.find((x) => x.by === "what")!.options.map((o) => o.is)).toEqual(["tase", "makam", "us"]);
    expect(thingMenu(r, "fee-trade", 0)!.values.map((w) => w.text)).toHaveLength(3);
    const slot = slotEdit(r, "fee-trade", "t-d", 0)!;
    expect(slot.kind === "list" && slot.options.some((o) => o.id === "makam")).toBe(true);
  });
  it("reads no price for it: the fee is not read, as for a place no case holds", () => {
    const r = readDealFor(dealOf(empty(), [{ by: "what", is: "makam" }]), data.kinds, TODAY);
    expect(r.unmatched).toEqual(["fee-trade"]);
    expect(leftOut(r).unmatched.map((f) => f.fee)).toEqual(["fee-trade"]);
    expect(readingOf(r, data.fx).unmatched.map((f) => f.fee)).toEqual(["fee-trade"]);
    // the channel picked still offers both channels
    expect(pickLine(r)!.things.find((x) => x.by === "channel")!.options.map((o) => o.is)).toEqual(["direct", "branch"]);
  });
});

describe("a value no case names beside a case on any value (F-114)", () => {
  it("is read at the price of the case on any value, which holds every pick", () => {
    const fee: CasesFee = {
      id: "fee-trade",
      kind: "trade",
      by: [{ kind: "channel", values: ["direct", "branch"] }],
      cases: [
        { id: "net", when: [["direct"]], stages: [{ price: rate(0.1) }] },
        { id: "rest", when: ["any"], stages: [{ price: rate(0.4) }] },
      ],
    };
    const r = readDealFor(dealOf(fee, [{ by: "channel", is: "branch" }]), data.kinds, TODAY);
    expect(r.unmatched).toEqual([]);
    expect(r.fees.map((f) => f.read?.case)).toEqual(["rest"]);
  });
});

describe("a size read across sizes with a step whose price is not given (§10.6, F-115)", () => {
  it("is not read at all, and is named once as not priced", () => {
    const fee: CasesFee = {
      id: "fee-trade",
      kind: "trade",
      by: [{ kind: "actionSize", unit: "ILS", tops: [typed(1000)] }],
      cases: [
        { id: "small", when: [0], stages: [{ price: { form: "action", rate: { v: 0, blank: true } } }] },
        { id: "big", when: [1], stages: [{ price: rate(0.1) }] },
      ],
    };
    const r = readDealFor(dealOf(fee), data.kinds, TODAY);
    expect(r.fees).toEqual([]);
    expect(r.unpriced).toEqual(["fee-trade"]);
    expect(r.engine.fees).toEqual([]);
  });
});

describe("the values on the device and in a link", () => {
  it("leave out a value no case names that the site does not know any more, and keep refusing a case that names one", () => {
    const raw = JSON.parse(JSON.stringify(dealOf(trade())));
    raw.fees[0].by[0].values = ["tase", "gone", "makam", "us"];
    expect(thingValues(feeIn(readDeal(raw)!), 0)).toEqual(["tase", "makam", "us"]);
    raw.fees[0].cases[0].when[0] = ["gone"];
    expect(readDeal(raw)).toBeNull();
  });
  it("open a deal saved before things kept them with its cases' values, in the order the page showed them", () => {
    const old = JSON.parse(JSON.stringify(dealOf(trade())));
    for (const b of old.fees[0].by) delete b.values;
    // a case moved on the page stood first: its value leads
    old.fees[0].cases[3].rank = 0;
    const read = readDeal(old)!;
    expect(thingValues(feeIn(read), 0)).toEqual(["us", "tase", "makam"]);
    expect(thingValues(feeIn(read), 1)).toEqual(["direct", "branch"]);
  });
  it("carry a row with no case through a link and back", () => {
    const d = dealOf(removeCase(trade(), "m-d"));
    const back = decodeDeal(encodeDeal(d))!;
    expect(thingValues(feeIn(back), 0)).toEqual(["tase", "makam", "us"]);
    expect(grid(feeIn(back)).rows[1]!.cases).toEqual([]);
    expect(readDeal(JSON.parse(JSON.stringify(d)))).toEqual(d);
  });
  it("open a link written before things kept them as the same deal on the page", () => {
    const d = dealOf(trade());
    const text = JSON.parse(Buffer.from(encodeDeal(d), "base64url").toString("utf8"));
    for (const b of text[1].f[0].B) delete b.Vs;
    const old = Buffer.from(JSON.stringify(text), "utf8").toString("base64url");
    const back = decodeDeal(old)!;
    expect(feeIn(back).by).toEqual(trade().by);
    expect(grid(feeIn(back)).rows.map((x) => x.key)).toEqual(grid(trade()).rows.map((x) => x.key));
  });
  it("refuse a value the thing cannot name, or one named twice", () => {
    const bad = (by: unknown) => readDeal({ ...JSON.parse(JSON.stringify(dealOf(trade()))), fees: [{ ...JSON.parse(JSON.stringify(trade())), by }] });
    expect(bad([{ kind: "what", values: ["tase", "tase"] }, { kind: "channel", values: [] }])).toBeNull();
    expect(bad([{ kind: "what", values: [] }, { kind: "channel", values: [""] }])).toBeNull();
  });
});

describe("a case added at a place of a row no case names", () => {
  it("holds a price not given yet, read once it is typed, the rest of the fee read as before", () => {
    const empty = removeCase(trade(), "m-d") as CasesFee;
    const added = addBlankCase(empty, [["makam"], ["branch"]]) as CasesFee;
    const made = added.cases.at(-1)!;
    expect(made.when).toEqual([["makam"], ["branch"]]);
    expect(made.stages).toEqual([{ price: { form: "action", rate: { v: 0, blank: true } } }]);
    expect(readDealFor(dealOf(added, [{ by: "what", is: "makam" }, { by: "channel", is: "branch" }]), data.kinds, TODAY).unpriced).toEqual(["fee-trade"]);
    expect(readDealFor(dealOf(added, [{ by: "what", is: "tase" }]), data.kinds, TODAY).fees).toHaveLength(1);
    expect(addBlankCase(empty, [["nowhere"], ["branch"]])).toBe(empty);
  });
});

describe("a whole case dropped on a place of a row no case names", () => {
  it("takes the row's value from the place", () => {
    const empty = removeCase(trade(), "m-d") as CasesFee;
    const r = liftDrop(dealOf(empty), { k: "cell", fee: "fee-trade", cases: ["u-b"], row: WHOLE, along: 1 }, { k: "place", fee: "fee-trade", row: "", t: 1, when: ["branch"], other: ["makam"] })!;
    expect(feeIn(r.deal).cases.find((c) => c.id === "u-b")!.when).toEqual([["makam"], ["branch"]]);
    expect(thingValues(feeIn(r.deal), 0)).toEqual(["tase", "makam", "us"]);
  });
});
