// What scripts/gen-open-questions.ts makes of a rule-base item (data-schema 3.15): its status and answered_by from its own text, and
// the fields written by hand carried over; and that data/open-questions.json is what the script makes of the rule base today.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openQuestionsFile, type OpenQuestionEntry } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import { ANSWERED_BY_READ, answerableRules, answeredBy, buildEntry, droppedLine, readItemTexts, statusOf } from "../scripts/gen-open-questions.ts";
import { readOpenQuestionItems, readRuleBaseIds } from "../src/references.ts";

const references = fileURLToPath(new URL("../../../.claude/skills/il-finance/references", import.meta.url));
const rules = new Set(["CAT-44", "KGL-06", "KGL-27", "TXK-30", "BPN-02", "REG-04", "REG-05", "REG-06", "CAT-36", "CAT-37"]);

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
      "**Q.** Unknown. **[2026-11-26] Closed** by TX2-19's record: no amendment is listed.",
      "**Q.** Unknown. **[2026-10-23: Period closed (latest completed calendar year, CAT-36).]**",
      "**Q.** ~~the trading unit~~ (closed 2026-10-31, GOV-24); hours.",
      "**Q.** Unknown. **[2026-10-25 scope pass]** Answered: two later amendments; one is not read.",
      "**Q.** Where: the file. (The units are settled by CAT-03 and CAT-35; struck 2026-11-03.)",
      "**Q.** Unknown. **[2026-11-26]** Partly **answered**: the law sets no age, KGL-06.",
    ])
      expect([text, statusOf(text)]).toEqual([text, "narrowed"]);
  });

  it("is open where nothing is answered, even when the question itself uses one of the words", () => {
    for (const text of [
      "**Q.** No general rule found. Would settle it: a CMA text.",
      "**Q.** Whether a negative real interest makes the deposit partly linked (TXI-04).",
      "**Q.** Unknown. **[2026-10-26 open-questions audit]** Still open. Searched: the library.",
      "**Q.** What each exit point pays is not settled by them.",
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

  it("stops where a note turns to the part still open, but not at a phrase that only states the status", () => {
    expect(answeredBy("**Q.** Who decides. **[2026-10-25]** Partly answered: the law sets no age, KGL-06. Who manages a minor's money stays unsettled, KGL-27.", rules)).toEqual(["KGL-06"]);
    expect(answeredBy("**Q.** Which bank. **[2026-11-01]** Narrowed by CAT-44. Still open for One Zero: a deposit without an account (TXK-30).", rules)).toEqual(["CAT-44"]);
    expect(answeredBy("**Q.** Which bank. **[2026-11-01]** Narrowed, still open. (1) The cap is KGL-06's.", rules)).toEqual(["KGL-06"]);
    expect(answeredBy("**Q.** Which bank. **[2026-11-01]** Narrowed: no age (KGL-06). What still stands open: the unit (TXK-30).", rules)).toEqual(["KGL-06"]);
  });

  it("ends a note at the end of its line, so a list item below it is not read as answered", () => {
    expect(answeredBy("**Q.** Rates.\n   - tax on early payments (narrowed: no 35%, KGL-06);\n   - the basis of the exemption (TXK-30).", rules)).toEqual(["KGL-06"]);
  });

  it("reads a note whose narrowing words carry bold marks, and ends it at the next dated note", () => {
    expect(answeredBy("**Q.** Rates. **[2026-11-26] Closed** by KGL-06's record. **[2026-11-27]** Searched: TXK-30.", rules)).toEqual(["KGL-06"]);
    expect(answeredBy("**Q.** Rates. **[2026-11-26]** Partly **answered**: KGL-06. [2026-11-27, a pass] TXK-30 read.", rules)).toEqual(["KGL-06"]);
  });

  it("reads a range of ids as each id in it", () => {
    expect(answeredBy("**Q.** Failure. **[2026-10-26]** Narrowed by REG-04 to REG-06: no deposit insurance.", rules)).toEqual(["REG-04", "REG-05", "REG-06"]);
  });

  it("reads a note whose narrowing words name what was closed", () => {
    expect(answeredBy("**Q.** Averaging. **[2026-10-23: Period closed (CAT-36). Basis closed as far as the CMA defines it (CAT-37). Weighting still open: KGL-06.]**", rules)).toEqual(["CAT-36", "CAT-37"]);
  });
});

describe("the rules that may answer", () => {
  it("leaves out a rule whose scope is a company's term or rests only on company documents, and a rule folded into another", () => {
    const blocks = new Map([
      ["A-01", { body: "- Rule: a law.\n- Scope: general\n" }],
      ["A-02", { body: "- Rule: a tariff.\n- Scope: institution\n" }],
      ["A-03", { body: "- Rule: company pages.\n- Scope: unsettled\n" }],
      ["A-04", { body: "- Rule: not reviewed.\n" }],
      ["A-05", { body: "- Rule: Folded on 2026-11-26. The claim is in A-01.\n- Scope: general\n" }],
      ["A-06", { body: "- Rule: Merged on 2026-11-26. The claim is in A-01.\n- Scope: general\n" }],
    ]);
    expect([...answerableRules(blocks)]).toEqual(["A-01", "A-04"]);
  });
});

describe("an entry", () => {
  const text = "**Q.** Unknown. **[2026-11-03: Mostly closed by CAT-44.]** Still open: the unit.";

  it("takes its status from the text, whatever the file said before", () => {
    expect(buildEntry("CAT OQ4", text, { id: "CAT OQ4", status: "open" }, rules).status).toBe("narrowed");
    expect(buildEntry("PEN OQ21", "**Q.** No general rule found.", { id: "PEN OQ21", status: "narrowed" }, rules).status).toBe("open");
  });

  it("keeps every field written by hand, and makes answered_by afresh from the text, never from what the file held", () => {
    const was: OpenQuestionEntry = { id: "CAT OQ4", status: "open", title_he: "כותרת", blocks_he: "מה מחכה", answered_by: ["TXK-30"], meanwhile_he: "מה האתר עושה בינתיים." };
    expect(buildEntry("CAT OQ4", text, was, rules)).toEqual({ id: "CAT OQ4", status: "narrowed", title_he: "כותרת", blocks_he: "מה מחכה", answered_by: ["CAT-44"], meanwhile_he: "מה האתר עושה בינתיים." });
    expect(buildEntry("CAT OQ4", "**Q.** Unknown.", undefined, rules)).toEqual({ id: "CAT OQ4", status: "open" });
  });

  it("has no answered_by once its text no longer says part of it is answered", () => {
    expect(buildEntry("CAT OQ4", "**Q.** Unknown (CAT-44).", { id: "CAT OQ4", status: "narrowed", answered_by: ["CAT-44"] }, rules)).toEqual({ id: "CAT OQ4", status: "open" });
  });

  it("takes a list a person wrote for the item in place of the scan's", () => {
    const [id, list] = Object.entries(ANSWERED_BY_READ)[0]!;
    expect(buildEntry(id, text, undefined, rules).answered_by).toEqual(list);
  });

  it("an id that left the markdown is printed with everything written by hand for it", () => {
    const line = droppedLine({ id: "CAT OQ4", status: "narrowed", title_he: "כותרת", blocks_he: "מה מחכה", answered_by: ["CAT-44"], meanwhile_he: "בינתיים." });
    for (const part of ["CAT OQ4", "כותרת", "מה מחכה", "CAT-44", "בינתיים."]) expect(line).toContain(part);
  });
});

describe("data/open-questions.json", () => {
  const file = openQuestionsFile.parse(JSON.parse(readFileSync(fileURLToPath(new URL("../../../data/open-questions.json", import.meta.url)), "utf8")));
  const texts = readItemTexts(references);
  const base = readRuleBaseIds(references);
  const answerable = answerableRules(base.blocks);

  it("reads a text for every item the validator reads, and no other", () => {
    expect([...texts.keys()].sort()).toEqual(readOpenQuestionItems(references).map((it) => it.id).sort());
  });

  it("is what the generator makes of the rule base today: run npm run gen:open-questions -w @finance-tool/pipeline when this fails", () => {
    for (const q of file) {
      const text = texts.get(q.id);
      expect(text, q.id).toBeDefined();
      expect([q.id, q.status]).toEqual([q.id, statusOf(text!)]);
      const made = q.status === "open" ? [] : (ANSWERED_BY_READ[q.id] ?? answeredBy(text!, answerable));
      expect([q.id, q.answered_by ?? []]).toEqual([q.id, made]);
    }
  });

  it("names in answered_by only rules the rule base holds, and only rules that may answer", () => {
    for (const q of file) for (const id of q.answered_by ?? []) expect([q.id, id, base.rules.has(id), answerable.has(id)]).toEqual([q.id, id, true, true]);
    for (const [id, list] of Object.entries(ANSWERED_BY_READ)) for (const rule of list) expect([id, rule, answerable.has(rule)]).toEqual([id, rule, true]);
  });
});
