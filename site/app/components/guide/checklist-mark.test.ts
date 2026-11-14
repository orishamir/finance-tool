// A product's checklist row reads its record's dimension mark (data-schema 3.3): a dimension no rule the record cites carries has no mark,
// and reads "not taken into account yet", never "not relevant".
import { describe, expect, it } from "vitest";
import { guide } from "../../copy";
import { checklistMark } from "./sections";

describe("checklistMark", () => {
  it("reads covered, blocked with its question, a bare blocked, and no mark as not covered yet", () => {
    expect(checklistMark("covered")).toEqual({ mark: "covered" });
    expect(checklistMark("blocked:TXK-OQ10")).toEqual({ mark: "blocked", code: "TXK-OQ10" });
    expect(checklistMark("blocked")).toEqual({ mark: "blocked" });
    expect(checklistMark(undefined)).toEqual({ mark: "uncovered" });
  });

  it("says a question with no rule yet is not covered, not that it does not apply", () => {
    expect(guide.checklist.uncovered).toBe("עוד לא נלקח בחשבון");
    expect(Object.values(guide.checklist).join(" ")).not.toContain("לא רלוונטי");
  });
});
