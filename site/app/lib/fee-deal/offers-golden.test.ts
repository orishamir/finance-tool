// Characterization of what a fee offers and holds today, before the offers refactor (OFFERS-DESIGN.md, step 1): the toolbox's groups for
// every product, every fee its product has and every form the fee can take, each in its plain state and with every part it can hold; a
// price with every field its fee kind can hold, read back through the device and a link; and links written today, read back. A refactor
// step leaves these files as they are; a step that narrows an offer changes the toolbox file only in the rows its rule names.
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { toolbox } from "./builder";
import { decodeDeal, encodeDeal } from "./link";
import { blankPrice, newDeal, readDeal, typed, type Fee, type FeeDeal, type Price } from "./model";
import { readDealFor } from "./parts";
import { FEE_KIND_IDS, kindHas, type FeeKindId, type FormId } from "./shapes";
import { CAPACITY } from "./offers/capacity";

const data = feesData();
const TODAY = "2026-11-12";
const GOLDEN = new URL("./__goldens__/", import.meta.url).pathname;

/** A price of a form with every field its fee kind can hold in that form, and every part a price on an action can carry. */
function fullPrice(fee: FeeKindId, form: FormId): Price {
  const fields = form === "free" ? [] : (CAPACITY[fee].fields[form] ?? []);
  const has = (f: string) => (fields as readonly string[]).includes(f);
  const p = blankPrice(form) as Record<string, unknown>;
  if ("rate" in p) p.rate = typed(0.5);
  if ("amount" in p) p.amount = typed(form === "perUnit" ? 0.01 : 10);
  if (has("min")) p.min = typed(5);
  if (has("max")) p.max = typed(500);
  if (has("cap")) p.cap = typed(2);
  if (has("flat")) p.flat = { amount: typed(3), upTo: typed(50) };
  if (has("perSecurity")) p.perSecurity = typed(7500);
  if (has("currency")) p.currency = "USD";
  if (form === "action" || form === "perUnit" || form === "perAction") {
    p.discount = { pct: typed(10), alsoMin: true };
    p.third = { who: "הברוקר" };
    p.notes = ["unfilled", "partial"];
    if (fee === "trade") p.inTrade = true;
  }
  if (form !== "free") {
    p.refund = typed(1);
    p.offset = { kind: "fixed_period" };
  }
  return p as Price;
}

/** A deal without its ids and its fees' ids, which a link makes anew by design. */
const content = (d: FeeDeal | null) => d && { ...d, id: "", fees: d.fees.map((f) => ({ ...f, id: "" })) };

const dealOf = (kind: FeeDeal["kind"], fee: Fee): FeeDeal => ({ ...newDeal(kind), id: "deal-golden", fees: [fee] });

describe("what each fee offers today (golden)", () => {
  it("the toolbox's groups for every product × fee × form, plain and full", async () => {
    const rows: Record<string, unknown> = {};
    for (const kind of data.kinds) {
      for (const fee of FEE_KIND_IDS.filter((f) => f !== "own" && kindHas(kind.id, kind.bases, f))) {
        for (const form of CAPACITY[fee].forms) {
          for (const state of ["plain", "full"] as const) {
            const price = state === "plain" ? blankPrice(form) : fullPrice(fee, form);
            const deal = dealOf(kind.id, { id: "fee-g", kind: fee, stages: [{ price }] });
            const t = toolbox(readDealFor(deal, data.kinds, TODAY), "fee-g")!;
            rows[`${kind.id} · ${fee} · ${form} · ${state}`] = t.groups.map((g) => `${g.group}: ${g.parts.map((x) => `${x.id}${x.used ? "✓" : ""}${x.off ? "⊘" : ""}`).join(" ")}`);
          }
        }
      }
    }
    await expect(JSON.stringify(rows, null, 1)).toMatchFileSnapshot(`${GOLDEN}toolbox.json`);
  });

  it("a price with every field its fee kind can hold reads back as it was, through the device and a link", async () => {
    const out: Record<string, string> = {};
    for (const fee of FEE_KIND_IDS) {
      for (const form of CAPACITY[fee].forms) {
        const deal = dealOf("brokerage-account", { id: "fee-g", kind: fee, stages: [{ price: fullPrice(fee, form) }] });
        const stored = readDeal(JSON.parse(JSON.stringify(deal)));
        const linked = decodeDeal(encodeDeal(deal));
        out[`${fee} · ${form}`] = stored === null ? "refused" : !isDeepStrictEqual(stored, deal) ? "device differs" : !isDeepStrictEqual(content(linked), content(deal)) ? `link differs: ${JSON.stringify(linked?.fees[0]?.stages?.[0]?.price)}` : "kept";
      }
    }
    await expect(JSON.stringify(out, null, 1)).toMatchFileSnapshot(`${GOLDEN}capacity.json`);
  });

  it("links written today read back as they read today", async () => {
    const links = JSON.parse(readFileSync(`${GOLDEN}links.json`, "utf8")) as Record<string, string>;
    const read = Object.fromEntries(Object.entries(links).map(([k, d]) => [k, content(decodeDeal(d))]));
    await expect(JSON.stringify(read, null, 1)).toMatchFileSnapshot(`${GOLDEN}links-read.json`);
  });
});
