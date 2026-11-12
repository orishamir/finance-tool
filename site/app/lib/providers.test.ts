import { describe, expect, it } from "vitest";
import { loadCma, loadFees } from "./data.server";
import { loadDepositTerms, loadFunds } from "./instruments.server";
import { loadInstitutionRegistry } from "./institutions.server";
import { shortName } from "./providers";

describe("shortName", () => {
  it("drops the legal suffix and a parenthesis", () => {
    expect(shortName("", 'אלטשולר שחם גמל ופנסיה בע"מ')).toBe("אלטשולר שחם גמל ופנסיה");
    expect(shortName("", "פסגות ניירות ערך בע״מ (פסגות טרייד)")).toBe("פסגות ניירות ערך");
    expect(shortName("leumi", 'בנק לאומי לישראל בע"מ')).toBe("לאומי");
  });

  it("leaves no suffix and no parenthesis on any company name the data holds", () => {
    const names = new Set<string>();
    for (const s of loadFees()) names.add(s.provider.name_he);
    for (const f of loadFunds()) names.add(f.manager);
    for (const c of loadCma().companies) names.add(c.name);
    for (const r of loadInstitutionRegistry()) names.add(r.name_he);
    for (const d of loadDepositTerms()) names.add(d.bank);
    for (const n of names) {
      const short = shortName("", n);
      expect(short, n).not.toMatch(/בע["״]מ|[()]/);
      expect(short, n).toBe(short.trim());
      expect(short.length, n).toBeGreaterThan(0);
    }
  });
});
