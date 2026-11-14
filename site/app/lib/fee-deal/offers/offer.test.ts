// The offer (method §10.6): every row of the rule table cites ids that exist, or the records of products the page has; the offer of every
// product's fee stays within its kind's capacity and is the same for the same product and fee; a form's part follows its form; what a
// rule leaves open keeps what the fee's kind can hold; and where a row stands on the records, no collected line of those products prints
// the channel or the plan it takes away.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { feesData } from "../../fees.server";
import type { DealKind } from "../kinds";
import { FEE_KIND_IDS, kindHas, type FeeKindId } from "../shapes";
import { capacity } from "./capacity";
import type { ByKind } from "./conditions";
import { capacityOffer, feeOffered, offerFor } from "./offer";
import type { PartId } from "./parts";
import { providentFamily, RULES } from "./rules";

const data = feesData();
const DATA = new URL("../../../../../data/", import.meta.url).pathname;

const json = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : f.endsWith(".json") ? [join(dir, f)] : []));
const kind = (id: string): DealKind => data.kinds.find((k) => k.id === id)!;

/** The ids a row may cite: every rule's (data/rules), every product record's (data/instruments) and every price line's (data/fees). */
function citable(): Set<string> {
  const ids = new Set<string>();
  for (const f of walk(join(DATA, "rules"))) ids.add((json(f) as { id: string }).id);
  for (const f of walk(join(DATA, "instruments"))) ids.add((json(f) as { id: string }).id);
  for (const f of walk(join(DATA, "fees"))) for (const line of (json(f) as { lines?: { id: string }[] }).lines ?? []) ids.add(line.id);
  return ids;
}

describe("the rule table", () => {
  it("cites, in every row, rule or line ids that exist in data/, or stands on the records of the products it is about", () => {
    const ids = citable();
    for (const row of RULES) {
      expect(row.cite.length > 0 || row.records, row.id).toBeTruthy();
      for (const c of row.cite) expect(ids.has(c), `${row.id}: ${c}`).toBe(true);
    }
  });
  it("names each row once", () => {
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length);
  });
  it("is about, in every row, a product the page has and a fee that product has", () => {
    for (const row of RULES) {
      const about = data.kinds.filter((k) => !row.when.products || row.when.products(k));
      const fees = row.when.fees ?? FEE_KIND_IDS;
      expect(about.some((k) => fees.some((f) => kindHas(k.id, k.bases, f))), row.id).toBe(true);
    }
  });
});

describe("offerFor", () => {
  const products = [null, ...data.kinds];
  it("keeps every product's fee within its kind's capacity", () => {
    for (const product of products)
      for (const fee of FEE_KIND_IDS) {
        const cap = capacityOffer(fee);
        const offer = offerFor(product, fee);
        const at = `${product?.id ?? "no product"} · ${fee}`;
        for (const f of offer.forms) expect(cap.forms, at).toContain(f);
        for (const p of offer.parts) expect(cap.parts, at).toContain(p);
        for (const c of offer.conditions) expect(cap.conditions, at).toContain(c);
        expect(offer.forms, at).toContain("free");
      }
  });
  it("is pure: the same product and fee give the same offer, and reading it changes nothing", () => {
    for (const product of products)
      for (const fee of FEE_KIND_IDS) {
        const before = JSON.stringify(product);
        expect(offerFor(product, fee)).toEqual(offerFor(product, fee));
        expect(JSON.stringify(product)).toBe(before);
      }
  });
  it("offers a provident management fee its rate and a price for a period, changing by the track (PF-07) and the balance (PF-14, KGL-30)", () => {
    const family = data.kinds.filter(providentFamily);
    expect(family.length).toBeGreaterThan(0);
    for (const k of family.filter((x) => x.bases.includes("balance"))) {
      const balance = offerFor(k, "balance");
      expect(balance.parts).toEqual(["held", "free", "until"]);
      expect(balance.conditions).toContain("portfolioSize");
      expect(balance.why.refund).toEqual(expect.arrayContaining(["PF-01", k.id]));
    }
    const deposit = offerFor(kind("kupat-gemel-lehashkaa"), "deposit");
    expect(deposit.parts).toEqual(["share", "free", "until"]);
    expect(deposit.conditions).toEqual(["track", "actionSize", "portfolioSize", "own"]);
    expect(deposit.why.discount).toContain("PF-13");
    expect(deposit.why.volume).toEqual(expect.arrayContaining(["PF-01", "PF-10"]));
    // a self-directed fund's management fee has no track (IRA-17), and its brokerage fees are its annexes'
    expect(offerFor(kind("ira-provident"), "balance").conditions).toEqual(["portfolioSize", "own"]);
    expect(offerFor(kind("ira-provident"), "balance").why.track).toContain("IRA-17");
    // a product outside the family keeps its deposit fee's capacity
    expect(offerFor(kind("brokerage-account"), "deposit")).toEqual(capacityOffer("deposit"));
  });
  it("takes a form's part away with its form, with the form's reasons, and starts a new fee in a form offered", () => {
    const premium = offerFor(kind("pension-comprehensive"), "insurance_premium");
    expect(premium.forms).toEqual(["free", "action"]);
    expect(premium.parts).not.toContain("sum");
    expect(premium.parts).not.toContain("held");
    expect(premium.why.sum).toContain("PEN-15");
    expect(capacity("insurance_premium").usual).toBe("sum");
    expect(premium.usual).toBe("action");
    expect(offerFor(kind("money-market-fund-daily"), "own").usual).toBe("held");
    expect(offerFor(kind("current-account"), "own").usual).toBe("sum");
  });
});

describe("fees not offered at all", () => {
  it("are a study fund's and a child-savings fund's deposit fee, a fee of the person's own on a provident fund, and a bank deposit's or savings plan's fees", () => {
    const off: [string, FeeKindId, string][] = [
      ["keren-hishtalmut", "deposit", "KH-22"],
      ["child-savings-provident", "deposit", "CS-18"],
      ...(["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity", "child-savings-provident"].map((id) => [id, "own", "PF-01"]) as [string, FeeKindId, string][]),
      ...(["bank-deposit", "savings-plan", "child-savings-bank"].flatMap((id) => [[id, "exit", "BANK-06"], [id, "own", "BANK-16"]]) as [string, FeeKindId, string][]),
      ["ira-provident", "current_account", "IRA-16"],
    ];
    for (const [id, fee, rule] of off) {
      expect(feeOffered(kind(id), fee), `${id} · ${fee}`).toBe(false);
      expect(offerFor(kind(id), fee).why.share ?? offerFor(kind(id), fee).why.held ?? offerFor(kind(id), fee).why.perAction, `${id} · ${fee}`).toContain(rule);
    }
    // every other fee its product has is offered
    for (const k of data.kinds)
      for (const fee of FEE_KIND_IDS.filter((f) => kindHas(k.id, k.bases, f)))
        if (!off.some(([id, f]) => id === k.id && f === fee) && !(k.id === "ira-hishtalmut" && fee === "current_account")) expect(feeOffered(k, fee), `${k.id} · ${fee}`).toBe(true);
    expect(feeOffered(null, "exit")).toBe(true);
  });
});

/**
 * What a rule leaves open (the rule base's open question, or a question put to it), which keeps today's offer: what the fee's kind can
 * hold. Each is listed with its question; none is a row of the table.
 */
const OPEN: { question: string; cells: [string, FeeKindId, (PartId | ByKind)[]][] }[] = [
  {
    question: "Which variables the Commissioner has approved for grading a provident fee besides the balance (PF-14 s.3(ב)(4)): a deposit's size, an arrangement of the person's own outside a workplace (PF-15)",
    cells: [
      ["kupat-gemel-lehashkaa", "deposit", ["actionSize", "own"]],
      ["kupat-gemel-lehashkaa", "balance", ["own"]],
      ["pension-comprehensive", "deposit", ["actionSize"]],
      ["pension-general", "deposit", ["actionSize"]],
      ["provident-for-annuity", "deposit", ["actionSize"]],
      ["child-savings-provident", "balance", ["own"]],
      ["ira-provident", "balance", ["own"]],
      ["ira-hishtalmut", "balance", ["own"]],
    ],
  },
  {
    question: "Custody, conversion and the notes on an order at the banks inside an IRA, which the annexes do not print (IRA open question 6)",
    cells: [
      ["ira-provident", "trade", ["unfilled", "partial"]],
      ["ira-hishtalmut", "trade", ["unfilled", "partial"]],
      ["ira-provident", "custody", ["min", "max", "held"]],
      ["ira-hishtalmut", "custody", ["min", "max", "held"]],
    ],
  },
  {
    question: "Whether the closed list of charges to an IRA (IRA-16) allows a conversion fee or spread, a fee on dividends, transfer fees and corporate-event charges",
    cells: [
      ["ira-provident", "fx", ["share", "flat", "min", "max", "currency"]],
      ["ira-hishtalmut", "fx", ["share", "flat", "min", "max", "currency"]],
      ["ira-provident", "fx_spread", ["share"]],
      ["ira-hishtalmut", "fx_spread", ["share"]],
      ["ira-provident", "corporate_event", ["perAction"]],
      ["ira-hishtalmut", "corporate_event", ["perAction"]],
      ["ira-provident", "own", ["share", "perAction", "held", "sum"]],
      ["ira-hishtalmut", "own", ["share", "perAction", "held", "sum"]],
    ],
  },
  {
    question: "How the pension statement's percent of deposits paid for insurance is counted (PF open question 17)",
    cells: [
      ["pension-comprehensive", "insurance_premium", ["share"]],
      ["pension-general", "insurance_premium", ["share"]],
    ],
  },
  {
    question: "Which funds charge a load or a redemption deduction, and on what terms (MF open question 7)",
    cells: [
      ["money-market-fund-daily", "load", ["actionSize", "own"]],
      ["money-market-fund-renewable", "load", ["actionSize", "own"]],
      ["money-market-fund-daily", "redemption_deduction", ["own"]],
      ["money-market-fund-renewable", "redemption_deduction", ["own"]],
    ],
  },
  {
    question: "Whether a house's mutual-fund trade lines cover money-market units: no collected line names them",
    cells: [
      ["money-market-fund-daily", "trade", ["perAction", "min"]],
      ["money-market-fund-renewable", "trade", ["perAction", "min"]],
    ],
  },
];

describe("what a rule leaves open", () => {
  it("keeps what the fee's kind can hold, each item with its question", () => {
    for (const { question, cells } of OPEN)
      for (const [id, fee, items] of cells) {
        const offer = offerFor(kind(id), fee);
        for (const x of items) expect([...offer.parts, ...offer.conditions], `${id} · ${fee} · ${x}: ${question}`).toContain(x);
      }
  });
});

// ---------------------------------------------------------------- what the collected lines print

interface Line {
  id: string;
  base: string;
  applies_to: string[];
  channel: string | null;
  band: string | null;
}

/** The lines of each provider's latest price list. */
function latestLines(): Line[] {
  const latest = new Map<string, string>();
  for (const f of readdirSync(join(DATA, "fees")).filter((x) => x.endsWith(".json")).sort()) latest.set(f.split("@")[0]!, f);
  return [...latest.values()].flatMap((f) => (json(join(DATA, "fees", f)) as { lines?: Line[] }).lines ?? []);
}

/** What a line's `applies_to` names for each product whose fees a house's lines price: the security, or the product record itself. */
const LINES_OF: Readonly<Record<string, (a: string) => boolean>> = {
  "brokerage-account": () => true,
  makam: (a) => a === "all" || a === "makam",
  "government-bond": (a) => a === "all" || a === "tase_shares_bonds" || a === "tase_bonds",
  "money-market-fund-daily": (a) => a === "all" || a === "money_market_units",
  "money-market-fund-renewable": (a) => a === "all" || a === "money_market_units",
};
const linesOf = (id: string) => LINES_OF[id] ?? ((a: string) => a === id);

/**
 * Where a band on a fee's lines names something other than a plan, so a plan (`track`) taken away is not tested against it: a fund's type
 * on the distribution fee (what is held), a makam's redemption, a sub-class of Tel Aviv bonds.
 */
const BAND_NOT_A_PLAN: readonly string[] = ["brokerage-account · distribution_handling", "makam · trade", "government-bond · trade"];

describe("a channel or a plan the records do not provide", () => {
  const lines = latestLines();
  /** The lines of a product's fee: of the fee's base, naming what the product holds. */
  const of = (id: string, fee: FeeKindId) => lines.filter((l) => l.base === capacity(fee).base && l.applies_to.some(linesOf(id)));
  /** The products' fees from which a row standing on the records takes a thing away. */
  const takenOnRecords = (thing: ByKind) =>
    data.kinds.flatMap((k) => FEE_KIND_IDS.filter((f) => kindHas(k.id, k.bases, f) && capacityOffer(f).conditions.includes(thing) && (offerFor(k, f).why[thing] ?? []).includes(k.id)).map((f) => [k, f] as const));

  it("is printed by no collected line of those products: no channel", () => {
    const taken = takenOnRecords("channel");
    expect(taken.length).toBeGreaterThan(0);
    for (const [k, f] of taken) expect(of(k.id, f).filter((l) => l.channel !== null).map((l) => l.id), `${k.id} · ${f}`).toEqual([]);
  });
  it("is printed by no collected line of those products: no plan", () => {
    const taken = takenOnRecords("track").filter(([k, f]) => !BAND_NOT_A_PLAN.includes(`${k.id} · ${f}`));
    expect(taken.length).toBeGreaterThan(0);
    for (const [k, f] of taken) expect(of(k.id, f).filter((l) => l.band !== null).map((l) => l.id), `${k.id} · ${f}`).toEqual([]);
  });
  it("prints no trade line for money-market units, so their trade fee changes by nothing a line names", () => {
    expect(lines.filter((l) => l.base === "trade" && l.applies_to.includes("money_market_units")).map((l) => l.id)).toEqual([]);
  });
});
