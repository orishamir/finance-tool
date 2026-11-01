import { describe, expect, it } from "vitest";
import { claimTopics, docGroup, docsForTopics, editionText, pageHref, type CompanyDoc } from "./company-docs";

describe("a claim names a document topic", () => {
  it("needs every part of the topic", () => {
    expect(claimTopics("מותר לבנק לשנות עמלה בלי להודיע")).toContain("שינוי תעריף והודעה עליו");
    expect(claimTopics("אני רוצה לשנות מסלול")).not.toContain("שינוי תעריף והודעה עליו");
  });
  it("takes a one-letter prefix", () => {
    expect(claimTopics("כמה עולה המרה של מט״ח")).toContain("המרת מטבע");
    expect(claimTopics("עמלה במכירה")).toContain("עמלת קנייה ומכירה");
  });
  it("finds nothing in a claim on another subject", () => {
    expect(claimTopics("קרן השתלמות פטורה ממס אחרי שש שנים")).toEqual([]);
  });
});

describe("company documents", () => {
  const doc: CompanyDoc = { id: "a", company: "בנק א", title: "תנאים", version: "2026-03-15", url: "https://x.example/a.pdf", group: "bank", topics: [{ topic: "סגירת חשבון", page: 9 }, { topic: "סגירת חשבון", page: 4 }, { topic: "המרת מטבע", page: 4 }, { topic: "דמי ניהול", page: 2 }] };
  it("gives each document's pages once, ascending", () => {
    expect(docsForTopics([doc], ["סגירת חשבון", "המרת מטבע"])[0]!.pages).toEqual([4, 9]);
    expect(docsForTopics([doc], ["מס זר"])).toEqual([]);
  });
  it("opens a PDF at its page, and another document at its start", () => {
    expect(pageHref("https://x.example/a.pdf", 4)).toBe("https://x.example/a.pdf#page=4");
    expect(pageHref("https://x.example/a", 4)).toBe("https://x.example/a");
  });
  it("sorts a publisher into its group", () => {
    expect(docGroup("בנק הפועלים", "terms")).toBe("bank");
    expect(docGroup("פפר (בנק לאומי)", "terms")).toBe("bank");
    expect(docGroup("הראל גמל והשתלמות", "regulations")).toBe("fund");
    expect(docGroup("מיטב טרייד", "tariff")).toBe("other");
  });
  it("writes an edition the way the site writes dates", () => {
    expect(editionText("2026-03-15")).toBe("15.03.2026");
    expect(editionText("2026-03")).toBe("03.2026");
    expect(editionText(null)).toBeNull();
  });
});
