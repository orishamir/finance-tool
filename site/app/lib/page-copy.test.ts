// A rule's card and a guide page that opens it say the rule once: the page says it in its own words and opens the card, which states it.
// A sentence of a card's text_he that the page's prose says again, word for word once both are reduced to their Hebrew words and numbers,
// reads twice in a row when the card opens over the page. Each such pair still allowed is listed, as "<rule id>#<guide file>", under
// "page-copy" in the rule's group file (packages/pipeline/src/leftovers/rules/<group>.json), and the list only shrinks.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repo = join(import.meta.dirname, "../../..");
const guideDir = join(repo, "site/app/content/guide");
const groupDir = join(repo, "packages/pipeline/src/leftovers/rules");

/** A sentence reduced to what a reader compares: its Hebrew words and numbers, one space between them. */
const reduce = (s: string): string => s.replace(/[^א-ת0-9%]+/g, " ").trim();
/** The sentences of a text, each reduced; one of fewer than four words matches too easily to count. */
const sentences = (text: string): string[] => text.split(/[.?!](?=\s|$)/).map(reduce).filter((s) => s.split(" ").length >= 4);

/** The prose of a guide file: the text between its tags, in order, with the code inside it dropped by `reduce`. */
const prose = (source: string): string => [...source.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").matchAll(/>([^<>]*)</g)].map((m) => m[1]).join("");
/** The rules a guide file opens: every quoted rule id in it ("GOV-23", 'TXI-01'). */
const opened = (source: string): Set<string> => new Set([...source.matchAll(/["'`]([A-Z][A-Z0-9]*-\d+)["'`]/g)].map((m) => m[1] ?? ""));
/** A rule text with its figure slots taken out, as a page shows each by a figure of its own. */
const withoutSlots = (text: string): string => text.replace(/\{[A-Z0-9-]+:[a-z0-9_.]+\}/g, " ");

/** Each rule id and guide file whose card text and prose share a sentence. */
function pageCopies(rules: ReadonlyMap<string, string>, guides: ReadonlyMap<string, string>): string[] {
  return [...guides].flatMap(([page, source]) => {
    const said = new Set(sentences(prose(source)));
    return [...opened(source)].filter((id) => sentences(withoutSlots(rules.get(id) ?? "")).some((s) => said.has(s))).map((id) => `${id}#${page}`);
  });
}

describe("rule texts and the guide pages that open them", () => {
  const rules = new Map(
    readdirSync(join(repo, "data/rules"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(repo, "data/rules", f), "utf8")) as { id: string; text_he?: string })
      .map((r) => [r.id, r.text_he ?? ""] as const),
  );
  const guides = new Map(
    readdirSync(guideDir)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => [f.replace(/\.tsx$/, ""), readFileSync(join(guideDir, f), "utf8")] as const),
  );
  const listed = readdirSync(groupDir).flatMap((f) => ((JSON.parse(readFileSync(join(groupDir, f), "utf8")) as Record<string, string[]>)["page-copy"] ?? []));
  const found = pageCopies(rules, guides);
  it("share no sentence a list does not allow", () => {
    expect(found.filter((e) => !listed.includes(e))).toEqual([]);
  });
  it("leave no listed pair that no longer shares one (the list only shrinks)", () => {
    expect(listed.filter((e) => !found.includes(e))).toEqual([]);
  });
  it("catch a planted copy, whatever the tags, slots and punctuation around it", () => {
    const rule = new Map([["GOV-98", "המדינה משלמת את השווי הנקוב במלואו ביום {GOV-98:day}. משפט אחר לגמרי בכרטיס."]]);
    const page = new Map([["makam", `<p><Ruled id="GOV-98">המדינה משלמת את <Term id="שווי נקוב">השווי הנקוב</Term> במלואו</Ruled> ביום {day ? <Num value={day} /> : null}. ועוד משפט.</p>`]]);
    expect(pageCopies(rule, page)).toEqual(["GOV-98#makam"]);
    expect(pageCopies(rule, new Map([["makam", `<p><Ruled id="GOV-98">המדינה משלמת את הכול</Ruled> בסוף.</p>`]]))).toEqual([]);
  });
});
