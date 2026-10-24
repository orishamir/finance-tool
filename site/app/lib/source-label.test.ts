import { describe, expect, it } from "vitest";
import { hostOf, isHebrewTitle, sourceLabel } from "./source-label";

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
});
