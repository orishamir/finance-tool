// The built-pages guard (site/scripts/rule-codes.mjs, run after the build): a rule's, a parameter's, a formula's or an assumption's code
// in what a page shows fails, except inside a rule's own card (`data-code-ok`); and the chips the pages draw say words, not codes.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
// @ts-expect-error a plain ES module script, without types
import { codesIn, ruleIds, shownText } from "../../scripts/rule-codes.mjs";
import { ProvenanceProvider, RuleRef, RuleTitleRow } from "./provenance";
import { RuleCard } from "./provenance-sheets";

const rules: Set<string> = ruleIds();
const codes = (html: string) => (codesIn(shownText(html), rules) as { code: string }[]).map((h) => h.code);

describe("the built-pages guard", () => {
  it("finds a rule's, a parameter's, a formula's and an assumption's code in text and in a title", () => {
    expect(codes(`<p>מס על ריבית KH-19.</p><span title="P-05">x</span><p>F-21 · A-01</p>`)).toEqual(["KH-19", "P-05", "F-21", "A-01"]);
  });
  it("leaves an index's name, an address, a script and a rule's own card alone", () => {
    expect(codes(`<p>מדד TA-35 ו־TA-125</p><a href="/rules#KH-19" aria-label="KH-19">לחוק</a><script>"KH-19"</script>`)).toEqual([]);
    expect(codes(`<div data-code-ok><h2>KH-19 · כותרת</h2><p>עוד <b>KH-15</b></p></div><p>KH-15</p>`)).toEqual(["KH-15"]);
  });
  it("knows only the rules the data holds", () => {
    expect(rules.has("KH-19")).toBe(true);
    expect(codes("<p>ABC-99 XYZ-12</p>")).toEqual([]);
  });
});

describe("the chips and rows a page draws", () => {
  const record = { id: "KH-19", title: "Default track", title_he: "מסלול ברירת המחדל", scope: "general", strength: "primary", dimensions: [], figures: {}, sources: [], checked: "2026-11-01" };
  const draw = (el: unknown, props: object) =>
    renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: { "KH-19": record }, terms: {}, dimensions: {}, today: "2026-11-11" } } as never, createElement(el as (p: object) => null, props))));
  it("a rule's chip and a rule's row print no code; its card does, inside data-code-ok", () => {
    expect(codes(draw(RuleRef, { id: "KH-19" }))).toEqual([]);
    expect(codes(draw(RuleTitleRow, { id: "KH-19" }))).toEqual([]);
    expect(draw(RuleTitleRow, { id: "KH-19" })).toContain("מסלול ברירת המחדל");
    const card = draw(RuleCard, { id: "KH-19", data: { rules: { "KH-19": record }, terms: {}, dimensions: {}, today: "2026-11-11" } });
    expect(card).toContain("KH-19");
    expect(codes(card)).toEqual([]);
  });
});
