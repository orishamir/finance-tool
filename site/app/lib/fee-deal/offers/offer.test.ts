// The offer (method §10.6): every row of the rule table cites ids that exist, the offer of every product's fee stays within its kind's
// capacity and is the same for the same product and fee, and the provident row narrows a provident-family product's management fees as
// it says, citing its rules.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { feesData } from "../../fees.server";
import { FEE_KIND_IDS } from "../shapes";
import { capacityOffer, offerFor } from "./offer";
import { providentFamily, RULES } from "./rules";

const data = feesData();
const DATA = new URL("../../../../../data/", import.meta.url).pathname;

const json = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : f.endsWith(".json") ? [join(dir, f)] : []));

/** The ids a row may cite: every rule's (data/rules), every product record's (data/instruments) and every price line's (data/fees). */
function citable(): Set<string> {
  const ids = new Set<string>();
  for (const f of walk(join(DATA, "rules"))) ids.add((json(f) as { id: string }).id);
  for (const f of walk(join(DATA, "instruments"))) ids.add((json(f) as { id: string }).id);
  for (const f of walk(join(DATA, "fees"))) for (const line of (json(f) as { lines?: { id: string }[] }).lines ?? []) ids.add(line.id);
  return ids;
}

describe("the rule table", () => {
  it("cites, in every row, rule, record or line ids that exist in data/", () => {
    const ids = citable();
    for (const row of RULES) {
      expect(row.cite.length, row.id).toBeGreaterThan(0);
      for (const c of row.cite) expect(ids.has(c), `${row.id}: ${c}`).toBe(true);
    }
  });
  it("names each row once", () => {
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length);
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
  it("offers a provident-family product's management fees only their share, a price for a period and a condition of their own (PF-01, KGL-14, PF-13)", () => {
    const family = data.kinds.filter(providentFamily);
    expect(family.length).toBeGreaterThan(0);
    for (const kind of family) {
      const deposit = offerFor(kind, "deposit");
      expect(deposit.parts).toEqual(["share", "until"]);
      expect(deposit.conditions).toEqual(["own"]);
      expect(deposit.why.discount).toEqual(["PF-01", "KGL-14", "PF-13"]);
      expect(offerFor(kind, "balance").parts).toEqual(["held", "until"]);
      // its other fees keep their capacity
      expect(offerFor(kind, "trade")).toEqual(capacityOffer("trade"));
    }
    // a product outside the family keeps its deposit fee's capacity
    const brokerage = data.kinds.find((k) => k.id === "brokerage-account")!;
    expect(offerFor(brokerage, "deposit")).toEqual(capacityOffer("deposit"));
  });
});
