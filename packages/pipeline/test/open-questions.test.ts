// What scripts/gen-open-questions.ts makes of a rule-base item (data-schema 3.15): its status and answered_by from its own text, and
// the fields written by hand carried over; and that data/open-questions.json is what the script makes of the rule base today.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openQuestionsFile, type OpenQuestionEntry } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import { answeredBy, buildEntry, droppedLine, readItemTexts, statusOf } from "../scripts/gen-open-questions.ts";
import { readOpenQuestionItems, readRuleBaseIds } from "../src/references.ts";

const references = fileURLToPath(new URL("../../../.claude/skills/il-finance/references", import.meta.url));
const rules = new Set(["CAT-44", "KGL-06", "KGL-27", "TXK-30", "BPN-02"]);

describe("an item's status", () => {
  it("is narrowed where its notes say part of it is answered, in any of the rule base's ways of saying so", () => {
    for (const text of [
      "**Q.** Unknown. **[2026-10-31]** Narrowed: the table was read (BPN-02).",
      "**Q.** Unknown. **[2026-10-26 open-questions audit]** Still open (narrowed). Searched: a web search.",
      "**Q.** Unknown. **[2026-10-25 scope pass]** Partly answered: the law sets no age, KGL-06.",
      "**Q.** Unknown. **[2026-11-03: Mostly closed by CAT-44.]** Still open: the unit.",
      "**Q.** Unknown. **[2026-10-22 browser pass: Closed by CS-24: Clal is on the list.]**",
      "**Q.** Unknown. **[2026-10-25 rule-text pass: Closed for payment dates: reg. 3(ב)(1).]**",
      "**Q.** Unknown. **[2026-10-23 R3 research pass: The regulations side is settled (SW-39); the annex is the open part.]**",
    ])
      expect([text, statusOf(text)]).toEqual([text, "narrowed"]);
  });

  it("is open where nothing is answered, even when the question itself uses one of the words", () => {
    for (const text of [
      "**Q.** No general rule found. Would settle it: a CMA text.",
      "**Q.** Whether a negative real interest makes the deposit partly linked (TXI-04).",
      "**Q.** Unknown. **[2026-10-26 open-questions audit]** Still open. Searched: the library.",
    ])
      expect([text, statusOf(text)]).toEqual([text, "open"]);
  });
});

describe("answered_by", () => {
  it("names the rules the narrowing notes name, those the rule base holds, each once and in order", () => {
    const text =
      "**Q.** Asks about CAT-03 and TXK-30. **[2026-10-25]** Partly answered: KGL-06, and KGL-27 for a minor; ZZZ-9 is no rule. **[2026-11-01]** Still open: see TXK-30. **[2026-11-03]** Narrowed again by KGL-06 and BPN-02.";
    expect(answeredBy(text, rules)).toEqual(["KGL-06", "KGL-27", "BPN-02"]);
    expect(answeredBy("**Q.** Unknown (CAT-44).", rules)).toEqual([]);
  });
});

describe("an entry", () => {
  const text = "**Q.** Unknown. **[2026-11-03: Mostly closed by CAT-44.]** Still open: the unit.";

  it("takes its status from the text, whatever the file said before", () => {
    expect(buildEntry("CAT OQ4", text, { id: "CAT OQ4", status: "open" }, rules).status).toBe("narrowed");
    expect(buildEntry("PEN OQ21", "**Q.** No general rule found.", { id: "PEN OQ21", status: "narrowed" }, rules).status).toBe("open");
  });

  it("keeps every field written by hand, an answered_by written by hand beside the rules the text names", () => {
    const was: OpenQuestionEntry = { id: "CAT OQ4", status: "open", title_he: "כותרת", blocks_he: "מה מחכה", answered_by: ["TXK-30"], meanwhile_he: "מה האתר עושה בינתיים." };
    expect(buildEntry("CAT OQ4", text, was, rules)).toEqual({ id: "CAT OQ4", status: "narrowed", title_he: "כותרת", blocks_he: "מה מחכה", answered_by: ["CAT-44", "TXK-30"], meanwhile_he: "מה האתר עושה בינתיים." });
    expect(buildEntry("CAT OQ4", "**Q.** Unknown.", undefined, rules)).toEqual({ id: "CAT OQ4", status: "open" });
  });

  it("an id that left the markdown is printed with everything written by hand for it", () => {
    const line = droppedLine({ id: "CAT OQ4", status: "narrowed", title_he: "כותרת", blocks_he: "מה מחכה", answered_by: ["CAT-44"], meanwhile_he: "בינתיים." });
    for (const part of ["CAT OQ4", "כותרת", "מה מחכה", "CAT-44", "בינתיים."]) expect(line).toContain(part);
  });
});

describe("data/open-questions.json", () => {
  const file = openQuestionsFile.parse(JSON.parse(readFileSync(fileURLToPath(new URL("../../../data/open-questions.json", import.meta.url)), "utf8")));
  const texts = readItemTexts(references);
  const ruleIds = readRuleBaseIds(references).rules;

  it("reads a text for every item the validator reads, and no other", () => {
    expect([...texts.keys()].sort()).toEqual(readOpenQuestionItems(references).map((it) => it.id).sort());
  });

  it("is what the generator makes of the rule base today: run npm run gen:open-questions -w @finance-tool/pipeline when this fails", () => {
    for (const q of file) {
      const text = texts.get(q.id);
      expect(text, q.id).toBeDefined();
      expect([q.id, q.status]).toEqual([q.id, statusOf(text!)]);
      for (const id of answeredBy(text!, ruleIds)) expect([q.id, q.answered_by ?? []]).toEqual([q.id, expect.arrayContaining([id])]);
    }
  });
});
