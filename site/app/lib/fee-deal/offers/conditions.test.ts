// Every thing a price can change by has its words in each copy map the page reads it from, so a new thing in the conditions registry
// fails here until its words are written, rather than showing an empty pill or "undefined" on the page.
import { describe, expect, it } from "vitest";
import { feeDeal as copy } from "../../../copy";
import { BY_KINDS, LIST_IDS, RANGE_UNITS, isListKind, isRangeKind, pickKind } from "./conditions";

const words = (s: string | undefined) => typeof s === "string" && s.trim().length > 0;
const c = copy.cases;

describe("the conditions registry's words", () => {
  it("names every thing, and its any value", () => {
    for (const k of BY_KINDS) {
      expect(words(c.things[k]), `things.${k}`).toBe(true);
      expect(words(c.any[k]), `any.${k}`).toBe(true);
    }
  });

  it("asks for every thing's values when it is added, and names the copies it makes", () => {
    for (const k of BY_KINDS) {
      if (isRangeKind(k)) expect(words(c.ask.range), "ask.range").toBe(true);
      else {
        expect(words(c.ask[k]), `ask.${k}`).toBe(true);
        expect(words(c.copyNoun[k]), `copyNoun.${k}`).toBe(true);
      }
    }
  });

  it("names each value of a list, under the thing it is picked as", () => {
    const values = c.values as Record<string, Record<string, string>>;
    for (const k of BY_KINDS.filter(isListKind)) for (const id of LIST_IDS[k]) expect(words(values[pickKind(k)]?.[id]), `values.${pickKind(k)}.${id}`).toBe(true);
  });

  it("names each unit of a range", () => {
    for (const k of BY_KINDS.filter(isRangeKind))
      for (const u of RANGE_UNITS[k]) expect(words(u === "units" || u === "actions" ? c.units[u] : copy.panel.signs[u]), `${k}: ${u}`).toBe(true);
  });
});
