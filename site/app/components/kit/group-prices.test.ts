// The closed line under a house's row names who gets another price; the young with the ages their groups print.
// Read over every house's latest record, so a new group's words are checked too.
import { describe, expect, it } from "vitest";
import { buildIndicesBundle } from "../../lib/providers.server";
import { groupBlocks, groupLineWho, youngAges, type GroupEntry } from "./group-prices";

const bundle = buildIndicesBundle();
const entries = (id: string) => (bundle.snapshots.find((s) => s.id === id)!.groups?.entries ?? []) as GroupEntry[];
const young = (who: string, priced = true): GroupEntry => ({ kind: "young", who_short_he: who, prices: [{ value: priced ? { exempt: true } : undefined }] }) as GroupEntry;

describe("the young on a house's closed line", () => {
  it("say the youngest and oldest ages their groups print", () => {
    expect(groupLineWho(entries("mizrahi-tefahot"))[0]).toBe("צעירים בגילאי 14 עד 21.5");
    expect(groupLineWho(entries("hapoalim"))[0]).toBe("צעירים בגילאי 14 עד 20");
    // Discount's youth "מגיל 14 עד 21" by its annex; its young-investor page "16 עד 25" is advertising D56 does not price, so its ages are not read
    expect(groupLineWho(entries("discount"))[0]).toBe("צעירים בגילאי 14 עד 21");
    // Leumi's 18+ runs to 21 or the end of army service, whichever is later, and its academic reserve to 25: no upper bound is printed,
    // so the line never tells a 22-year-old soldier the price is not theirs, and it says the top age differs by group, since "מגיל 14" alone read
    // as no upper age
    expect(groupLineWho(entries("leumi"))[0]).toBe("צעירים מגיל 14 (עד גיל שונה בכל קבוצה)");
  });
  it("give an age on every house whose record has a young group, and the words alone where one group prints none", () => {
    for (const s of bundle.snapshots) {
      const es = (s.groups?.entries ?? []) as GroupEntry[];
      if (!es.some((e) => e.kind === "young")) continue;
      expect(youngAges(es), s.id).not.toBeNull();
    }
    expect(youngAges([young("צעירים בגילאי 14 עד 19"), young("נוער")])).toBeNull();
    expect(groupLineWho([young("נוער")])).toEqual(["צעירים"]);
    expect(youngAges([young("חיילים וצעירים מגיל 18")])).toEqual({ from: "18", to: null });
    // an entry that leaves out a bound leaves it out of the line; an entry with no value (advertising) is not read
    expect(youngAges([young("צעירים בגילאי 14 עד 18"), young("צעירים מגיל 18, עתודאים")])).toEqual({ from: "14", to: null, topVaries: true });
    expect(youngAges([young("נוער, מגיל 14 עד 21"), young("באתר הבנק: צעירים בגילאי 16 עד 25", false)])).toEqual({ from: "14", to: "21" });
    expect(youngAges([young("באתר הבנק: צעירים בגילאי 16 עד 25", false)])).toBeNull();
  });
});

describe("a house's sub-rows", () => {
  it("never join a priced entry with one not priced, even on the same words (re-check F3)", () => {
    const e = (cheaper: string, priced: boolean) => ({ ...young("מגיל 14", priced), cheaper_he: cheaper, name_he: cheaper }) as GroupEntry;
    expect(groupBlocks([e("פטור מעמלת קנייה", true), e("פטור מעמלת קנייה", false)])).toHaveLength(2);
    expect(groupBlocks([e("פטור מעמלת קנייה", true), e("פטור מעמלת קנייה", true)])).toHaveLength(1);
  });
});
