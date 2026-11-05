import { describe, expect, it } from "vitest";
import { hebrewCitation, hostOf, isHebrewTitle, mostlyHebrew, sourceLabel } from "./source-label";

describe("source-label", () => {
  it("tells a Hebrew title from an English one", () => {
    expect(isHebrewTitle("פקודת מס הכנסה")).toBe(true);
    expect(isHebrewTitle("Income Tax Ordinance (פקודה)")).toBe(false);
  });
  it("takes the host without www", () => expect(hostOf("https://www.gov.il/x")).toBe("gov.il"));
  it("shows the host for an English title and keeps the title for the collapsed line", () => {
    expect(sourceLabel({ title: "Ordinance", url: "https://www.gov.il/x" }, "קובץ")).toEqual({ text: "gov.il", host: true, english: "Ordinance" });
    expect(sourceLabel({ title: "Ordinance", url: "data/x.json" }, "קובץ").text).toBe("קובץ");
  });
  it("never takes an English working note for a Hebrew one, even when it quotes a long Hebrew line (#190)", () => {
    expect(mostlyHebrew("Trustee fee (שכר נאמן): p. 1 '0.02% מהשווי הנקי השנתי הממוצע של נכסי הקרן'; expense table 0.02% in 2025.")).toBe(false);
    expect(mostlyHebrew("שכר הנאמן לפי הדוח השנתי של הקרן (iShares).")).toBe(true);
    expect(mostlyHebrew("״MTF סל״ גובה דמי ניהול קבועים בלבד, לפי הדוח השנתי של הקרן.")).toBe(true);
    expect(mostlyHebrew(null)).toBe(false);
  });
});

describe("hebrewCitation", () => {
  it("says a Maya citation in Hebrew with its number isolated (#190)", () => {
    expect(hebrewCitation("דוח שנתי, מגדל קרנות נאמנות בע\"מ (Maya filing 1725200, PDF), עמ' 1")).toBe("דוח שנתי, מגדל קרנות נאמנות בע\"מ (דיווח במאיה ⁦1725200⁩), עמ' 1");
    expect(hebrewCitation("דוח (Maya filing 1725343, PDF, linked from the fund's Maya page as 'דו\"ח שנתי של הקרן')")).toBe("דוח (דיווח במאיה ⁦1725343⁩)");
    expect(hebrewCitation("דוח (Maya filing 1, published 16.09.2026)")).toBe("דוח (דיווח במאיה ⁦1⁩, פורסם ⁦16.09.2026⁩)");
    expect(hebrewCitation("דוח (Maya filing PDF)")).toBe("דוח (דיווח במאיה)");
  });
});
