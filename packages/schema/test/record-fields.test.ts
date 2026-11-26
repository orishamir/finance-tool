// The optional fields a record carries beside its values (data-schema §3.3, §3.7, §3.11, §3.15): each is kept where it is declared,
// and refused in a form the schema does not name.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { depositTerms, openQuestionEntry, securityRecord, termRecord, wrapperRecord } from "../src/index.ts";

const read = (path: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`../../../data/${path}.json`, import.meta.url)), "utf8")) as Record<string, unknown>;

describe("a deposit's doubt names the field it is about", () => {
  const plan = read("terms/deposits/hapoalim-hoshvim-kadima");
  it("on the term, the amount range, the linkage, the exits or the break; absent means the rate", () => {
    for (const on of ["term_months", "amount_range", "linkage", "exits", "break"]) expect(depositTerms.parse({ ...plan, doubt_he: "הבנק לא מפרסם את משך התוכנית.", doubt_on: on }).doubt_on).toBe(on);
    expect(depositTerms.safeParse({ ...plan, doubt_on: "rate_offered" }).success).toBe(false);
  });
});

describe("a product record keeps the rules that govern it but set no figure", () => {
  it("on a wrapper and on a security", () => {
    expect(wrapperRecord.parse({ ...read("instruments/wrappers/bank-deposit"), context_rule_ids: ["BANK-14"] }).context_rule_ids).toEqual(["BANK-14"]);
    expect(securityRecord.parse({ ...read("instruments/securities/makam"), context_rule_ids: ["GOV-03"] }).context_rule_ids).toEqual(["GOV-03"]);
    expect(wrapperRecord.safeParse({ ...read("instruments/wrappers/bank-deposit"), context_rule_ids: [""] }).success).toBe(false);
  });
});

describe("an open question says what answers part of it and what the site does meanwhile", () => {
  it("rule ids in answered_by, Hebrew in meanwhile_he", () => {
    const q = { id: "BND OQ10", status: "narrowed", answered_by: ["BND-15"], meanwhile_he: "האתר מציג את המח״מ כפי שהקרן פרסמה." };
    expect(openQuestionEntry.parse(q)).toEqual(q);
    expect(openQuestionEntry.safeParse({ ...q, answered_by: ["BND OQ3"] }).success).toBe(false);
    expect(openQuestionEntry.safeParse({ ...q, meanwhile_he: "" }).success).toBe(false);
  });
});

describe("a term's other names and its search strings are kept apart", () => {
  it("also_called and search, each a list of its own", () => {
    const term = { id: "makam", he: "מק״ם", en: "makam", meaning: "מלווה קצר מועד.", where: ["app"], wrapper_ids: ["makam"], variants: [], rule_ids: [], source: { url: "https://example.org", title: "t", publisher: "p", strength: "primary", checked: "2026-11-26" } };
    const parsed = termRecord.parse({ ...term, also_called: ["מלווה קצר מועד"], search: ["מק\"ם", "מקמ"] });
    expect(parsed.also_called).toEqual(["מלווה קצר מועד"]);
    expect(parsed.search).toEqual(["מק\"ם", "מקמ"]);
    expect(termRecord.safeParse({ ...term, also_called: [""] }).success).toBe(false);
  });
});
