// A bank's page from its real deposit records (data/terms/deposits/): each product's rates carry their own records' date, and the
// catalogue's names say in Hebrew where they were seen.
import { describe, expect, it } from "vitest";
import { buildInstitution } from "./institutions.server";
import { rangeLinkage, rateRange } from "./bank-table";
import type { SiteValue } from "./value";
import type { ProductRowData } from "../components/decoder/institutions/types";
import { loadCatalog, loadDepositTerms, seenValue, seenWhere } from "./instruments.server";

describe("a bank's products and their dates", () => {
  it("each of a bank's products is dated by its own records, the oldest and the newest, not by another product's (Leumi)", () => {
    const page = buildInstitution("leumi")!;
    const records = loadDepositTerms().filter((d) => d.bank === "leumi");
    expect(page.groups.length).toBeGreaterThan(1);
    for (const g of page.groups) {
      const days = records.filter((d) => d.wrapper_id === g.wrapperId).map((d) => d.rate_offered.effective_from ?? d.snapshot).sort();
      expect(g.asOf?.from.value).toBe(days[0]);
      expect(g.asOf?.to.value).toBe(days.at(-1));
    }
    const current = page.groups.find((g) => g.wrapperId === "current-account")!;
    const deposits = page.groups.find((g) => g.wrapperId === "bank-deposit")!;
    expect(current.asOf?.to.value).toBe("2026-11-15");
    expect(current.asOf?.to.value).not.toBe(deposits.asOf?.to.value);
  });

  it("the overview's rate range is dated by the records it spans, not by a record of another linkage", () => {
    // Discount's deposits: unlinked rows read on 08.11.2026 and a CPI-linked row on 13.11.2026; the range is the unlinked one, dated 08.11
    const day = (iso: string) => ({ value: iso, unit: "date", state: "sourced" }) as unknown as SiteValue;
    const pct = (n: number) => ({ value: n, unit: "pct_per_year", state: "sourced" }) as unknown as SiteValue;
    const row = (linkage: ProductRowData["linkage"], rate: number, asOf: string) => ({ linkage, rate: pct(rate), asOf: day(asOf) }) as unknown as ProductRowData;
    const rows = [row("none", 2.1, "2026-11-08"), row("none", 2.6, "2026-11-08"), row("cpi", 0.4, "2026-11-13")];
    const ranged = rangeLinkage(rows);
    const range = ranged ? rateRange(ranged.products) : null;
    expect([range?.asOf.from.value, range?.asOf.to.value]).toEqual(["2026-11-08", "2026-11-08"]);
    // unlinked rows read on two days span the two
    const spread = rateRange([row("none", 2.1, "2026-11-08"), row("none", 2.6, "2026-11-13")]);
    expect([spread?.asOf.from.value, spread?.asOf.to.value]).toEqual(["2026-11-08", "2026-11-13"]);
  });
});

describe("where the catalogue's names were seen", () => {
  it("is said in Hebrew, document by document, without the links", () => {
    for (const c of loadCatalog()) {
      const where = seenWhere(c);
      expect(where, c.id).not.toMatch(/https?:|[A-Za-z]{3,}/);
      expect(where.split("; ").length, c.id).toBe(c.where_seen.split(/;\s*/).length);
      expect(seenValue(c).source.url, c.id).toMatch(/^https:\/\//);
    }
    const klali = loadCatalog().find((c) => c.id === "meitav-gemel-lehashkaa-klali")!;
    expect(seenWhere(klali)).toBe("מיטב, רשימת מסלולי ההשקעה בקופת הגמל להשקעה של מיטב (דוחות תשואה גמל להשקעה); מיטב, פלייר תפעולי, עמוד 3: ״גמל להשקעה - מ.ה קופה 7857״; מיטב, הודעה על מיזוג מסלולי השקעה בקופת הגמל ״מיטב גמל להשקעה״ (7857), מאי 2024, עץ המסלולים לפני המיזוג ואחריו");
  });
});
