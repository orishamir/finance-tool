// When a later price holds a part exactly as the price before it (alike.ts): what a table, a grid and the cases read as rows leave unsaid
// with the later price, and what an edit in place carries on to. Anything the words or the reading depend on that differs keeps it said.
import { describe, expect, it } from "vitest";
import { heldAlike, saidWhole } from "./alike";
import { slimParts } from "./case-words";
import type { Num, Price, Sourced } from "./core";

const src: Sourced = { url: "https://example.org/list.pdf", title: "t", publisher: "p", strength: "institution", checked: "2026-11-01", own: "בית" } as Sourced;
const listed = (v: number, s: Sourced = src): Num => ({ v, src: s });
const action = (rate: Num, min?: Num, extra: object = {}): Price => ({ form: "action", rate, ...(min ? { min } : {}), ...extra }) as Price;
const held = (rate: Num, per: number, every: number): Price => ({ form: "held", rate, per, every }) as Price;

describe("a later price holding a part alike", () => {
  it("holds it alike where the figures are the same numbers from the same place", () => {
    expect(heldAlike(action(listed(0.1), listed(5)), action(listed(0.2), listed(5)), "min")).toBe(true);
    expect(heldAlike(action(listed(0.1), listed(5)), action(listed(0.2), listed(5)), "share")).toBe(false);
  });

  it("holds it otherwise where the same number is the person's, or from another document or page", () => {
    expect(heldAlike(action(listed(0.1), listed(5)), action(listed(0.2), { v: 5 }), "min")).toBe(false);
    expect(heldAlike(action(listed(0.1), listed(5)), action(listed(0.2), listed(5, { ...src, url: "https://example.org/other.pdf" })), "min")).toBe(false);
    expect(heldAlike(action(listed(0.1), listed(5)), action(listed(0.2), listed(5, { ...src, page: 3 })), "min")).toBe(false);
  });

  it("is said whole where its terms differ in what a part's words may not show: a share's period or charging months, a bound's currency", () => {
    expect(saidWhole(held(listed(0.1), 12, 12), held(listed(0.1), 1, 12))).toBe(true);
    expect(saidWhole(held(listed(0.1), 12, 12), held(listed(0.1), 12, 3))).toBe(true);
    expect(saidWhole(action(listed(0.1), listed(5)), action(listed(0.1), listed(5), { currency: "USD" }))).toBe(true);
    expect(heldAlike(held(listed(0.1), 12, 12), held(listed(0.1), 12, 3), "held")).toBe(false);
  });

  it("is said whole where a third party's minimum or maximum, which its words do not show, differs", () => {
    const third = (min: number): Price => action(listed(0.1), undefined, { third: { price: { form: "action", rate: listed(0.05), min: listed(min) } } });
    expect(saidWhole(third(1), third(2))).toBe(true);
    expect(saidWhole(third(1), third(1))).toBe(false);
  });

  it("is said whole where it lacks a part the price before it holds, and then holds no part alike", () => {
    expect(saidWhole(action(listed(0.1), listed(5)), action(listed(0.1)))).toBe(true);
    expect(heldAlike(action(listed(0.1), listed(5)), action(listed(0.1)), "share")).toBe(false);
  });

  it("marks the parts a slim line's later price holds alike, which a table leaves unsaid", () => {
    const parts = slimParts({ kind: "trade" }, { stages: [{ price: action(listed(0.25), listed(39)), until: "2027-03" }, { price: action(listed(0.5), listed(39)) }] }, { today: "2026-11-14" });
    expect(parts.filter((p) => p.alike).map((p) => `${p.id}@${p.stage}`)).toEqual(["min@1"]);
  });
  it("says a price's action once: its bounds say none on a price per action, and their period on a share of what is held", () => {
    const line = slimParts({ kind: "fx" }, { stages: [{ price: action(listed(0.0875), listed(5)) }] }, { today: "2026-11-19" });
    expect(line.find((p) => p.id === "share")!.words.tail).toContain("המרה");
    expect(line.find((p) => p.id === "min")!.words.tail).toBeUndefined();
    const custody = slimParts({ kind: "custody" }, { stages: [{ price: { ...held(listed(0.1), 12, 3), min: listed(5) } as Price }] }, { today: "2026-11-19" });
    expect(custody.find((p) => p.id === "min")!.words.tail).toBeTruthy();
  });
});
