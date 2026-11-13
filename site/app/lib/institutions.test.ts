// A bank's page from its real deposit records (data/terms/deposits/): each product's rates carry their own records' date, and the
// catalogue's names say in Hebrew where they were seen.
import { describe, expect, it } from "vitest";
import { buildInstitution, latestDeposit } from "./institutions.server";
import { loadCatalog, loadDepositTerms, seenValue, seenWhere } from "./instruments.server";

describe("a bank's products and their dates", () => {
  it("the newest record is the one whose rates are newest, else the one collected last", () => {
    const d = (id: string, from: string | null, snapshot: string) => ({ id, rate_offered: { effective_from: from }, snapshot });
    expect(latestDeposit([d("a", "2026-10-25", "2026-10-23"), d("b", "2026-11-09", "2026-11-09"), d("c", null, "2026-10-30")])?.id).toBe("b");
    expect(latestDeposit([d("a", null, "2026-10-23"), d("c", null, "2026-10-30")])?.id).toBe("c");
    expect(latestDeposit([])).toBeUndefined();
  });

  it("each of a bank's products is dated by its own records, not by another product's (Leumi)", () => {
    const page = buildInstitution("leumi")!;
    const records = loadDepositTerms().filter((d) => d.bank === "leumi");
    expect(page.groups.length).toBeGreaterThan(1);
    for (const g of page.groups) {
      const own = latestDeposit(records.filter((d) => d.wrapper_id === g.wrapperId))!;
      expect(g.asOf?.value).toBe(own.rate_offered.effective_from ?? own.snapshot);
    }
    const current = page.groups.find((g) => g.wrapperId === "current-account")!;
    const deposits = page.groups.find((g) => g.wrapperId === "bank-deposit")!;
    expect(current.asOf?.value).toBe("2026-10-25");
    expect(current.asOf?.value).not.toBe(deposits.asOf?.value);
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
