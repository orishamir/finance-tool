import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { guide, notCovered, provenance, rule } from "../copy";
import { IdRef, ProvenanceProvider, Ruled, Term } from "./provenance";
import { SheetContent } from "./provenance-sheets";

/** What a reader can be told: the markup without `data-opens`, the attribute by which a sheet knows which rules its opener already opens. It
 *  holds rule ids for the code alone, and is neither shown nor read out. */
const told = (html: string) => html.replace(/ data-opens="[^"]*"/g, "");

describe("an open question's chip (D49, 2026-11-02)", () => {
  const render = (id: string) => told(renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, today: "2026-11-02" } } as never, createElement(IdRef, { id })))));
  it("says a word, not the code", () => {
    const html = render("GOV OQ8");
    expect(html).toContain(provenance.idRef.questionChip);
    expect(html).not.toContain("OQ8");
  });
  // a rule's chip names the rule (its title, or "חוק או כלל" for a record the page does not hold) and opens its card; the code stays in
  // the card (D101); there is no chip with a count (D116)
  it("a rule's chip says words, not the code", () => {
    const html = render("TXS-05");
    expect(html).toContain(rule.title);
    expect(html).not.toContain(rule.set);
    expect(html).not.toContain("TXS-05");
  });
  it("a rule's chip says the rule's title", () => {
    const html = told(renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: { "TXS-05": { id: "TXS-05", title_he: "מס על רווח הון", title: "x" } }, today: "2026-11-02" } } as never, createElement(IdRef, { id: "TXS-05" })))));
    expect(html).toContain("מס על רווח הון");
    expect(html).not.toContain("TXS-05");
  });
  it("the guide's own section titles name real sections", () => {
    const ids = guide.sections.map((s) => s.id as string);
    for (const titles of Object.values(guide.sectionTitles)) for (const id of Object.keys(titles)) expect(ids).toContain(id);
  });
});

// D116: the words of a sentence that state a rule are the link to it, in the solid grey look of a sourced figure; a glossary term keeps a
// look of its own. Both are one inline control whose `aria-expanded` the look reads while its sheet is open.
describe("the words a rule states (Ruled)", () => {
  const data = { rules: { "TXS-05": { id: "TXS-05", title_he: "מס על רווח הון", title: "x" } }, today: "2026-11-15" };
  const render = (el: ReturnType<typeof createElement>) => told(renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, el))));
  /** The opening tags of the controls in the html, by class. */
  const controls = (html: string, look: string) => [...html.matchAll(/<span[^>]*role="button"[^>]*>/g)].map((m) => m[0]).filter((t) => new RegExp(`class="${look}"`).test(t));
  it("is one inline control with the words, in its own look, saying no code", () => {
    const html = render(createElement(Ruled, { id: "TXS-05", children: "מנכה מס" }));
    const [tag, ...more] = controls(html, "ruled");
    expect(more).toEqual([]);
    expect(tag).toMatch(/tabindex="0"/);
    expect(tag).toMatch(/aria-haspopup="dialog"/);
    expect(tag).toMatch(/aria-expanded="false"/);
    expect(html).toMatch(/class="ruled"[^>]*>מנכה מס<\/span>/);
    expect(html).not.toContain("TXS-05");
    expect(html).not.toContain("rule-chip");
    expect(html).not.toContain(rule.set);
  });
  it("is not drawn as a glossary term, and a term is not drawn as rule words", () => {
    expect(controls(render(createElement(Ruled, { id: "TXS-05", children: "מנכה מס" })), "term")).toEqual([]);
    const term = render(createElement(Term, { id: "מס רווח הון" }, "מס רווח הון"));
    expect(controls(term, "term")).toHaveLength(1);
    expect(controls(term, "ruled")).toEqual([]);
  });
  it("several rules are one control over the one phrase", () => {
    const html = render(createElement(Ruled, { id: ["TXS-05", "TXS-06"], name: "מס", children: "שיעור המס" }));
    expect(controls(html, "ruled")).toHaveLength(1);
    expect(html).not.toMatch(/TXS-0[56]/);
  });
  it("keeps a one-letter prefix outside the control, touching it, with no no-wrap span so a long phrase wraps", () => {
    const html = render(createElement(Ruled, { id: "TXS-05", prefix: "ב", children: "ניכוי במקור" }));
    expect(html).toMatch(/ב<span[^>]*class="ruled"[^>]*>ניכוי במקור<\/span>/);
    expect(html).not.toContain("whitespace-nowrap");
  });
  it("with no rules, is the words alone: no control with nothing behind it", () => {
    const html = render(createElement(Ruled, { id: [], children: "מנכה מס" }));
    expect(html).not.toContain("role=\"button\"");
    expect(html).toContain("מנכה מס");
  });
});

describe("an open question's sheet", () => {
  const sheet = (data: object, id: string, at = "/") =>
    renderToString(createElement(MemoryRouter, { initialEntries: [at] }, createElement(SheetContent, { item: { kind: "question", id }, data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-28", ...data } as never, headId: "h", descId: "d" })))
      .replace(/<!-- -->/g, "")
      .replace(/<[^>]+>/g, " ");
  it("every question reaches the pages with its status, a question answered in part among them, Hebrew lines or not", async () => {
    const { loadOpenQuestions } = await import("../lib/data.server");
    const file = JSON.parse(readFileSync(new URL("../../../data/open-questions.json", import.meta.url), "utf8")) as { id: string; status: string; title_he?: string; blocks_he?: string }[];
    const shipped = loadOpenQuestions();
    for (const q of file) expect(shipped[q.id]?.status).toBe(q.status);
    const bare = file.find((q) => q.status === "narrowed" && !q.title_he && !q.blocks_he);
    if (bare) expect(sheet({ openQuestions: shipped }, bare.id)).toContain(provenance.questionSheet.statuses.narrowed);
  });
  it("says what the site does meanwhile as its own sentence, with no label repeating its first word", () => {
    const text = sheet({ openQuestions: { "TX OQ1": { status: "open", title_he: "שאלה לבדיקה", meanwhile_he: "בינתיים החישוב לוקח את השיעור הנמוך." } } }, "TX OQ1");
    expect(text).toContain("בינתיים החישוב לוקח את השיעור הנמוך.");
    expect(text.match(/בינתיים/g)).toHaveLength(1);
  });
  const pointing = { openQuestions: { "TX2 OQ2": { status: "open", title_he: "שאלה לבדיקה", meanwhile_he: `בינתיים הנושא נמצא בעמוד ״${notCovered.title}״.` } } };
  it("links the page it names, and leaves the line out on that page", () => {
    const html = renderToString(createElement(MemoryRouter, null, createElement(SheetContent, { item: { kind: "question", id: "TX2 OQ2" }, data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-28", ...pointing } as never, headId: "h", descId: "d" })));
    expect(html).toMatch(/<a[^>]*href="\/not-covered"[^>]*>״מה האתר עוד לא מכסה״<\/a>/);
    expect(sheet(pointing, "TX2 OQ2", "/not-covered")).not.toContain("בינתיים");
  });
});
