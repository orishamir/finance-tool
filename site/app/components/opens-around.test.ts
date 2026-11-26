// What a figure's sheet leaves out because the place it was tapped in already opens it (`opensAround`), read over pages as the server
// draws them: a figure in a paragraph beside the words that state a rule, a rule card's own figure, a computed figure's input inside a
// sheet, and a company's securities account, whose parts are each their own place, never the whole card.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { brokeragePart, buildInstitution, institutionIds } from "../lib/institutions.server";
import { loadRules } from "../lib/data.server";
import type { SiteValue } from "../lib/value";
import { InsideSheetCtx, Num, opensAround, ProvenanceProvider, Ruled, type ProvenanceData } from "./provenance";
import { RuleCard } from "./provenance-sheets";
import { BrokerageGroupCard } from "./decoder/institutions/brokerage-card";
import { accountOf } from "./decoder/institutions/types";

/**
 * A server-drawn page as a tree of elements with what `opensAround` reads of the DOM: `closest` over a tag, an attribute or a list of them,
 * `querySelectorAll` of an attribute, `getAttribute` and `contains`.
 */
class Node {
  readonly children: Node[] = [];
  readonly tag: string;
  readonly attrs: Record<string, string>;
  readonly parent: Node | null;
  constructor(tag: string, attrs: Record<string, string>, parent: Node | null) {
    this.tag = tag;
    this.attrs = attrs;
    this.parent = parent;
  }
  private matches(selector: string): boolean {
    return selector.split(",").some((s) => {
      const one = s.trim();
      const attr = /^\[([\w-]+)\]$/.exec(one);
      return attr?.[1] ? attr[1] in this.attrs : one === this.tag;
    });
  }
  getAttribute(name: string): string | null {
    return this.attrs[name] ?? null;
  }
  closest(selector: string): Node | null {
    return this.matches(selector) ? this : (this.parent?.closest(selector) ?? null);
  }
  querySelectorAll(selector: string): Node[] {
    return this.children.flatMap((c) => [...(c.matches(selector) ? [c] : []), ...c.querySelectorAll(selector)]);
  }
  contains(other: Node | null): boolean {
    for (let n = other; n; n = n.parent) if (n === this) return true;
    return false;
  }
  /** Every element below, in document order. */
  all(): Node[] {
    return this.children.flatMap((c) => [c, ...c.all()]);
  }
}

const VOID = new Set(["br", "img", "input", "meta", "hr", "link", "source", "col", "wbr"]);
function parse(html: string): Node {
  const root = new Node("#root", {}, null);
  let at = root;
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>/g)) {
    const [, close, tag = "", rawAttrs = "", self] = m;
    if (close) {
      at = at.parent ?? root;
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const [, name = "", value = ""] of rawAttrs.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) attrs[name] = value.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    const node = new Node(tag.toLowerCase(), attrs, at);
    at.children.push(node);
    if (!self && !VOID.has(node.tag)) at = node;
  }
  return root;
}

const today = "2026-11-26";
const rules = loadRules();
const data = (ids: readonly string[]): ProvenanceData => ({ rules: Object.fromEntries(ids.flatMap((id) => (rules[id] ? [[id, rules[id]]] : []))), terms: {}, dimensions: {}, today });
const page = (d: ProvenanceData, children: ReactNode) => parse(renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: d } as never, children))));
/** The figures of a drawn page: every `Num`'s button. */
const figures = (root: Node) => root.all().filter((n) => n.tag === "button" && (n.attrs.class ?? "").split(" ").includes("num"));
const around = (n: Node, inside = false) => opensAround(n as unknown as Element, inside).sort();

const figure = (value: number, ruleIds: string[]): SiteValue => ({ value, unit: "pct", source: { url: "https://example.org/x", title: "x", publisher: "x", strength: "primary" }, checked: today, effective_from: null, effective_to: null, update_rule: "market", state: "sourced", rule_ids: ruleIds });

describe("the rules around a figure", () => {
  it("are those its paragraph's words state, outside a sheet", () => {
    const root = page(data(["MF-24"]), createElement("p", null, createElement(Ruled, { id: "MF-24" } as never, "התקרה"), " ", createElement(Num, { value: figure(0.25, ["MF-24"]) })));
    expect(figures(root).map((n) => around(n))).toEqual([["MF-24"]]);
  });

  it("are none in a table cell with no words that state a rule", () => {
    const root = page(data(["MF-24"]), createElement("table", null, createElement("tbody", null, createElement("tr", null, createElement("td", null, createElement(Num, { value: figure(0.25, ["MF-24"]) }))))));
    expect(figures(root).map((n) => around(n))).toEqual([[]]);
  });

  it("inside a sheet, only a place marked as one counts: a computed figure's input in a paragraph keeps its chips", () => {
    const root = page(data(["MF-24"]), createElement("p", null, createElement(Ruled, { id: "MF-24" } as never, "התקרה"), " ", createElement(Num, { value: figure(0.25, ["MF-24"]) })));
    expect(figures(root).map((n) => around(n, true))).toEqual([[]]);
  });

  it("on a rule's card, a figure of the card opens no chip of the card's own rule", () => {
    const d = data(["TXI-03"]);
    const root = page(d, createElement(InsideSheetCtx.Provider, { value: true }, createElement(RuleCard, { id: "TXI-03", data: d })));
    const own = figures(root);
    expect(own.length).toBeGreaterThan(0);
    for (const n of own) expect(around(n, true)).toContain("TXI-03");
  });
});

describe("a company's securities account", () => {
  /** A house's part as its page draws it, with the price list's table; null where it has none. */
  const partOf = (id: string) => {
    const brand = brokeragePart(id);
    const p = brand ?? (() => {
      const page = buildInstitution(id);
      return page?.tariff ? { kind: page.kind, tariff: page.tariff, rules: page.rules } : null;
    })();
    if (!p || p.tariff.missing) return null;
    const { tariff, fees } = accountOf(p.tariff, null);
    const root = page({ rules: p.rules, terms: {}, dimensions: {}, today }, createElement(BrokerageGroupCard, { id, tariff, fees, kind: p.kind }));
    // the facts part opens the rules on the notice before a fee changes and on what protects the money
    return { tariff, root, factsRules: [...tariff.notice, ...tariff.protection.map((r) => r.id)] };
  };
  // the first house whose price table draws a fee and whose facts part draws its minimum and opens rules
  const picked = institutionIds()
    .map(partOf)
    .find((h) => h && h.tariff.minimum && h.factsRules.length > 0 && figures(h.root).some((n) => n.closest("table")));
  if (!picked) throw new Error("no house draws a fee table and a minimum beside rules of its facts");
  const house = picked;
  /** The figures of the part a figure stands in: its price list's (the table and the phone's rows), or its facts' (the minimum). */
  const partFigures = (holds: (part: Node) => boolean) => figures(house.root).filter((n) => {
    const part = n.closest("[data-opens-scope]");
    return !!part && holds(part);
  });
  const tableFigures = partFigures((part) => part.querySelectorAll("table").length > 0);
  const factsFigures = partFigures((part) => part.querySelectorAll("[data-opens]").some((x) => house.factsRules.includes(x.getAttribute("data-opens") ?? "")));

  it("a fee figure keeps the chip of a rule only another part of the card opens", () => {
    expect(tableFigures.length).toBeGreaterThan(0);
    for (const n of tableFigures) for (const id of house.factsRules) expect(around(n)).not.toContain(id);
  });

  it("a figure of the facts part (its minimum to open an account) leaves out what that part opens", () => {
    expect(factsFigures.length).toBeGreaterThan(0);
    for (const n of factsFigures) expect(around(n)).toEqual(expect.arrayContaining(house.factsRules));
  });
});
