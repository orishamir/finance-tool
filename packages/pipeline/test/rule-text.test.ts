// The checks on the rule cards' Hebrew (src/rule-text.ts, data-schema §3.1 and §4 item 23): each kind of flaw caught on a planted text,
// left alone on a text without it, and the ratchet over the whole of data/rules, whose lists only shrink.
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readFormulaIds, readRuleBaseIds, validateData } from "../src/index.ts";
import { phrasesIn, printedForms, readTextLeftovers, ruleTextProblems, sentenceCount, spelledNumbers, staleTextLeftovers, textFlaws, typedFigures, type RuleText, type TextLeftovers } from "../src/rule-text.ts";
import { staleTermCopies, termCopies } from "../src/validate.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const leftovers = readTextLeftovers();
const none: TextLeftovers = { ...leftovers, leftovers: { long: [], "research-talk": [], "fixed-line": [], "spelled-number": [], "typed-figure": [], "term-copy": [] } };
const pct = (value: number) => ({ value, unit: "pct" });

describe("sentenceCount", () => {
  it("ends a sentence at a full stop, a question mark or an exclamation mark before a space or the end", () => {
    expect(sentenceCount("המס הוא כלל. הוא חל על כולם? כן!")).toBe(3);
    expect(sentenceCount("משפט אחד בלי נקודה")).toBe(1);
    expect(sentenceCount("משפט אחד. ועוד אחד בלי נקודה")).toBe(2);
    expect(sentenceCount("")).toBe(0);
  });
  it("does not end one at a full stop inside a number or a date", () => {
    expect(sentenceCount("החוק נכנס לתוקף ב־10.11.2026 והשיעור הוא 2.5% לשנה.")).toBe(1);
    expect(sentenceCount("החוק נכנס לתוקף ב־10.11.2026. השיעור הוא 2.5%.")).toBe(2);
  });
  it("does not end one inside an abbreviation", () => {
    expect(sentenceCount("לפי ע״מ 4 בחוזר, הסכום עולה.")).toBe(1);
    expect(sentenceCount("לפי ע.מ. 4 בחוזר, הסכום עולה.")).toBe(1);
    expect(sentenceCount("מדד ה־S&P 500 של חברות ה־U.S. מוכר. הוא רחב.")).toBe(2);
  });
  it("counts a full stop inside closing quotes as the end", () => {
    expect(sentenceCount("בחוק כתוב ״הלקוח מקבל ריבית.״ זה הכלל.")).toBe(2);
  });
});

describe("spelledNumbers", () => {
  it("finds a year and a count of ten or more spelled in words", () => {
    expect(spelledNumbers("הסכום לשנת אלפיים עשרים וחמש")).toEqual(["אלפיים", "עשרים"]); // MF-55
    expect(spelledNumbers("עד גיל עשרים ואחת")).toEqual(["עשרים"]); // CS-27
    expect(spelledNumbers("מגיל שמונה עשרה")).toEqual(["שמונה עשרה"]);
    expect(spelledNumbers("בתוך שלושים יום, ועוד חמישה עשר")).toEqual(["שלושים", "חמישה עשר"]);
    expect(spelledNumbers("חמש מאות חברות")).toEqual(["מאות"]);
    expect(spelledNumbers("ממוצעים לחמש ולעשר שנים")).toEqual(["ולעשר"]);
  });
  it("leaves small counts, other words and numbers written in digits alone", () => {
    expect(spelledNumbers("אחד משני תנאים, שלוש שנים, שתי קרנות ושנים רבות")).toEqual([]);
    expect(spelledNumbers("עשרות קרנות, לפי סדר האלף־בית")).toEqual([]);
    expect(spelledNumbers("כ־245 אלף ₪")).toEqual([]);
  });
});

describe("phrasesIn", () => {
  const talk = leftovers.research_talk;
  it("finds a phrase that reports how the site read a rule", () => {
    expect(phrasesIn("נוסח התקנות נקרא ברשומות.", talk.phrases, talk.allowed)).toEqual(["נקרא ב"]);
    expect(phrasesIn("האתר לא מצא את הנוסח.", talk.phrases, talk.allowed)).toEqual(["האתר לא"]);
  });
  it("lets the site's reading said as such stand", () => {
    expect(phrasesIn("זו קריאה של האתר לא של הרשות.", talk.phrases, talk.allowed)).toEqual([]);
  });
});

describe("typedFigures", () => {
  it("prints a figure as the site does: a percent with its sign, money grouped, other numbers plain or grouped", () => {
    expect(printedForms(25, "pct")).toEqual(["25%"]);
    expect(printedForms(0.24, "pct_per_year")).toEqual(["0.24%"]);
    expect(printedForms(50000, "nis")).toEqual(["50,000"]);
    expect(printedForms(2027, "count")).toEqual(["2027", "2,027"]);
    expect(printedForms(60, "years")).toEqual(["60"]);
  });
  it("finds a figure's value typed in digits outside a slot", () => {
    expect(typedFigures({ text_he: "המס הוא 25% מהרווח.", figures: { rate: pct(25) } })).toEqual(["rate"]);
    expect(typedFigures({ text_he: "עד 50,000 ₪.", figures: { cap: { value: 50000, unit: "nis" } } })).toEqual(["cap"]);
    expect(typedFigures({ text_he: "משיכה מגיל 60.", figures: { age: { value: 60, unit: "years" } } })).toEqual(["age"]);
    expect(typedFigures({ text_he: "בשנת 2026 המס 25%.", figures: { rate: { by_tax_year: { "2026": pct(25) } } } })).toEqual(["rate"]);
  });
  it("leaves a slot, another number, a section's number and an id alone", () => {
    expect(typedFigures({ text_he: "המס הוא {TXS-09:rate} מהרווח.", figures: { rate: pct(25) } })).toEqual([]);
    expect(typedFigures({ text_he: "המס הוא 250% או 2.5% או 125%.", figures: { rate: pct(25) } })).toEqual([]);
    expect(typedFigures({ text_he: "לפי סעיף 3 לחוק, ושיעור של 3%.", figures: { years: { value: 3, unit: "years" } } })).toEqual([]);
    expect(typedFigures({ text_he: "חוזר 2020-9-2 תיקן אותו.", figures: { days: { value: 2, unit: "business_days" } } })).toEqual([]);
    expect(typedFigures({ text_he: "המדרגות בטבלה.", figures: { brackets: [{ up_to: { value: 1, unit: "nis" } }] } })).toEqual([]);
  });
});

describe("textFlaws and the ratchet", () => {
  const long: RuleText = { id: "TXS-09", text_he: "א. ב. ג. ד. ה." };
  it("catches each kind of flaw on a planted text", () => {
    expect(textFlaws(long, leftovers)).toEqual({ long: "5 sentences" });
    expect(Object.keys(textFlaws({ id: "X", text_he: "הכלל לא נבדק." }, leftovers))).toEqual(["research-talk"]);
    expect(Object.keys(textFlaws({ id: "X", scope: "institution", text_he: "בבנקים אחרים זה שונה." }, leftovers))).toEqual(["fixed-line"]);
    expect(textFlaws({ id: "X", scope: "general", text_he: "בבנקים אחרים זה שונה." }, leftovers)).toEqual({});
    expect(Object.keys(textFlaws({ id: "X", title_he: "עד גיל עשרים ואחת", text_he: "כלל." }, leftovers))).toEqual(["spelled-number"]);
    expect(Object.keys(textFlaws({ id: "X", text_he: "המס 25%.", figures: { rate: pct(25) } }, leftovers))).toEqual(["typed-figure"]);
  });
  it("fails a flaw on a record its list does not name, and passes one it names", () => {
    const rules = new Map([["TXS-09", long]]);
    expect(ruleTextProblems(rules, none).map((p) => p.message)).toEqual([expect.stringMatching(/^text_he \(long\): 5 sentences; text_he states the rule in 2 to 4 sentences/)]);
    expect(ruleTextProblems(rules, { ...none, leftovers: { ...none.leftovers, long: ["TXS-09"] } })).toEqual([]);
  });
  it("fails a slot that names a rule with no record or a figure that record lacks", () => {
    const rules = new Map<string, RuleText>([
      ["TXS-09", { id: "TXS-09", text_he: "המס {TXS-09:rate}, וגם {TXS-99:rate} ו־{TXS-09:other}.", figures: { rate: pct(25) } }],
    ]);
    expect(ruleTextProblems(rules, none).map((p) => p.message)).toEqual([
      "text_he: the slot {TXS-99:rate} names a rule with no record under data/rules/",
      "text_he: the slot {TXS-09:other} names a figure TXS-09 does not have (rate)",
    ]);
  });
  it("reads the month a figure takes effect as a slot of that figure", () => {
    const rules = new Map<string, RuleText>([["TXS-09", { id: "TXS-09", text_he: "מ{TXS-09:rate.from} המס {TXS-09:rate}, ומ{TXS-09:other.from} אחרת.", figures: { rate: pct(25) } }]]);
    expect(ruleTextProblems(rules, none).map((p) => p.message)).toEqual(["text_he: the slot {TXS-09:other} names a figure TXS-09 does not have (rate)"]);
  });
  it("says a listed record is gone once its text no longer carries the flaw, or it has no record", () => {
    const listed = { ...none, leftovers: { ...none.leftovers, long: ["TXS-09", "TXS-98"] } };
    expect(staleTextLeftovers(new Map([["TXS-09", long]]), listed)).toEqual([expect.stringMatching(/TXS-98 under "long", and it has no record/)]);
    expect(staleTextLeftovers(new Map([["TXS-09", { id: "TXS-09", text_he: "כלל קצר." }]]), listed)).toEqual([
      expect.stringMatching(/TXS-09 under "long", which its text no longer carries/),
      expect.stringMatching(/TXS-98 under "long", and it has no record/),
    ]);
  });
});

describe("the rule cards' texts in data/rules", () => {
  const dir = join(root, "data/rules");
  const rules = new Map(
    readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as RuleText)
      .map((r) => [r.id, r]),
  );
  it("carry no flaw a list does not allow, and every slot names a figure that exists", () => {
    expect(ruleTextProblems(rules, leftovers)).toEqual([]);
  });
  it("leave no listed record that is fixed (each list only shrinks)", () => {
    expect(staleTextLeftovers(rules, leftovers)).toEqual([]);
  });
});

describe("glossary copies", () => {
  const term = (id: string, he: string, meaning: string) => ({ id, he, meaning });
  it("finds two records with the same name and the same explanation, after trimming", () => {
    expect(termCopies([term("a", "נאמן", "גוף שמחזיק"), term("b", " נאמן", "גוף שמחזיק "), term("c", "נאמן", "גוף אחר")])).toEqual(["a b"]);
  });
  it("fails a copy the list does not allow, through the data check", () => {
    const dir = mkdtempSync(join(tmpdir(), "data-"));
    mkdirSync(join(dir, "terms"), { recursive: true });
    const rec = (id: string) => ({ id, he: "מונח לדוגמה", en: null, meaning: "הסבר אחד", where: [], wrapper_ids: [], variants: [], rule_ids: [], source: { url: "https://www.gov.il/x", title: "t", publisher: "p", strength: "primary", checked: "2026-11-01" } });
    writeFileSync(join(dir, "terms/x-a.json"), JSON.stringify(rec("x-a")));
    writeFileSync(join(dir, "terms/x-b.json"), JSON.stringify(rec("x-b")));
    const problems = validateData({ dataDir: dir, ruleBase: readRuleBaseIds(`${root}.claude/skills/il-finance/references`), formulas: readFormulaIds(`${root}docs/method.md`) });
    expect(problems).toContainEqual({ file: "terms/x-b.json", message: expect.stringMatching(/x-a and x-b carry the same name and the same explanation/) });
  });
  it("says a listed copy is gone once one of its records is merged away, or the two differ", () => {
    const a = term("x-a", "נאמן", "גוף שמחזיק");
    expect(staleTermCopies([a, term("x-b", "נאמן", "גוף שמחזיק")], ["x-a x-b"])).toEqual([]);
    expect(staleTermCopies([a], ["x-a x-b"])).toEqual([expect.stringMatching(/"x-a x-b", and x-b has no record under data\/terms\//)]);
    expect(staleTermCopies([a, term("x-b", "נאמן", "גוף אחר")], ["x-a x-b"])).toEqual([expect.stringMatching(/"x-a x-b", which is no longer one/)]);
  });
});

describe("the glossary records in data/terms", () => {
  const dir = join(root, "data/terms");
  const terms = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as { id: string; he: string; meaning: string });
  it("leave no listed copy that is gone (the list only shrinks)", () => {
    expect(staleTermCopies(terms, leftovers.leftovers["term-copy"])).toEqual([]);
  });
});
