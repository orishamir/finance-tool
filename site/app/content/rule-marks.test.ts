// A rule marks one phrase in a block (`Ruled`, D116): every guide and exposure page, drawn as the build draws it, opens each rule at
// most once in a paragraph, a list item or a table cell. Every element that opens a rule names it in `data-opens` (words that state
// it, a term that rests on it, a chip), so a block is the nearest block-level element around such an element, and a rule two of them
// name in one block is marked twice. The pages' doubles that are left are listed in rule-marks-leftovers.json, each with why: a new
// one fails, and so does a listed one that is gone, until its entry is removed, so the list only shrinks.
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createStaticHandler, createStaticRouter, Outlet, StaticRouterProvider, type RouteObject } from "react-router";
import { describe, expect, it } from "vitest";
import { InputsProvider } from "../lib/inputs";
import { loadProducts } from "../lib/data.server";
import { exposureFolds, loadExposures } from "../lib/instruments.server";
import { exposurePath, guidePath } from "../lib/site-paths";
import GuidePage, { loader as guideLoader } from "../routes/guide";
import ExposurePage, { loader as exposureLoader } from "../routes/exposure";
import GuideLimitedBondFund, { loader as limitedBondFundLoader } from "../routes/guide-limited-bond-fund";
import GuideMutualFunds, { loader as mutualFundsLoader } from "../routes/guide-mutual-funds";

interface Leftover {
  page: string;
  rule: string;
  /** How many blocks of the page mark the rule twice or more. */
  blocks: number;
  why: string;
}
const leftovers = (JSON.parse(readFileSync(new URL("./rule-marks-leftovers.json", import.meta.url), "utf8")) as { leftovers: Leftover[] }).leftovers;

/** An element of a drawn page: its tag, its `data-opens` ids, and the element it stands in. */
interface El {
  tag: string;
  opens: string[];
  parent: El | null;
  /** Where its markup starts and ends in the page. */
  from: number;
  to: number;
}
const VOID = new Set(["br", "img", "input", "meta", "hr", "link", "source", "col", "wbr", "area", "base", "embed", "track"]);
/** The elements of server-drawn markup, in document order. */
function elements(html: string): El[] {
  const root: El = { tag: "#root", opens: [], parent: null, from: 0, to: html.length };
  const out: El[] = [];
  let at = root;
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>/g)) {
    const [, close, tag = "", attrs = "", self] = m;
    if (close) {
      at.to = m.index + m[0].length;
      at = at.parent ?? root;
      continue;
    }
    const opens = /\sdata-opens="([^"]*)"/.exec(attrs)?.[1]?.split(/\s+/).filter(Boolean) ?? [];
    const el: El = { tag: tag.toLowerCase(), opens, parent: at, from: m.index, to: m.index + m[0].length };
    out.push(el);
    if (!self && !VOID.has(el.tag)) at = el;
  }
  return out;
}

/** What lays out as a block: the words and marks inside one of these, outside a nearer one, read as one place. */
const BLOCK = new Set(["p", "li", "td", "th", "dd", "dt", "div", "section", "aside", "article", "header", "footer", "main", "nav", "figure", "figcaption", "caption", "blockquote", "details", "summary", "dialog", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "dl", "table", "tr", "form", "fieldset"]);
const blockOf = (el: El): El | null => {
  for (let n = el.parent; n; n = n.parent) if (BLOCK.has(n.tag)) return n;
  return null;
};

/** The words of a block, to name it in a failure. */
const wordsOf = (html: string, el: El) => html.slice(el.from, el.to).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);

/** Each rule a block of the page opens from two or more elements: the number of such blocks, and the words of each. */
function doubles(html: string): Record<string, string[]> {
  const byBlock = new Map<El | null, Map<string, number>>();
  for (const el of elements(html)) {
    if (!el.opens.length) continue;
    const block = blockOf(el);
    const counts = byBlock.get(block) ?? new Map<string, number>();
    for (const id of new Set(el.opens)) counts.set(id, (counts.get(id) ?? 0) + 1);
    byBlock.set(block, counts);
  }
  const out: Record<string, string[]> = {};
  for (const [block, counts] of byBlock) for (const [id, n] of counts) if (n > 1) (out[id] ??= []).push(block ? wordsOf(html, block) : "");
  return out;
}
const doubled = (html: string) => Object.fromEntries(Object.entries(doubles(html)).map(([id, blocks]) => [id, blocks.length]));

const shell = () => createElement(InputsProvider, null, createElement(Outlet));
const routes: RouteObject[] = [
  {
    id: "root",
    path: "/",
    Component: shell,
    children: [
      { id: "limited-bond-fund", path: "guide/limited-bond-fund", loader: limitedBondFundLoader as never, Component: GuideLimitedBondFund },
      { id: "mutual-funds", path: "guide/mutual-funds", loader: mutualFundsLoader as never, Component: GuideMutualFunds },
      { id: "guide", path: "guide/:id", loader: guideLoader as never, Component: GuidePage },
      { id: "exposure", path: "exposure/:id", loader: exposureLoader as never, Component: ExposurePage },
    ],
  },
];
const handler = createStaticHandler(routes);
/** A page as the build draws it, or null where its address answers with a redirect. */
async function draw(path: string): Promise<string | null> {
  const context = await handler.query(new Request(`http://localhost${path}`));
  if (context instanceof Response) return null;
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToStaticMarkup(createElement(StaticRouterProvider, { router, context }));
}

const folds = exposureFolds();
const pages = [
  "/guide/limited-bond-fund",
  "/guide/mutual-funds",
  ...loadProducts().map((p) => guidePath(p.id)),
  ...loadExposures().filter((e) => !folds[e.id]).map((e) => exposurePath(e.id)),
];

describe("a rule marked twice in one block", () => {
  it("is found in a paragraph, a list item and a cell, and not across two of them", () => {
    const mark = (ids: string) => `<span role="button" data-opens="${ids}">x</span>`;
    expect(doubled(`<p>${mark("A-01")} ו<span>${mark("A-01 B-02")}</span></p><p>${mark("B-02")}</p>`)).toEqual({ "A-01": 1 });
    expect(doubled(`<ul><li>${mark("A-01")}</li><li>${mark("A-01")}</li></ul><table><tr><td>${mark("C-03")}<br>${mark("C-03")}</td></tr></table>`)).toEqual({ "C-03": 1 });
    // a callout's words sit in a div, not a paragraph; a chip is a button
    expect(doubled(`<div role="note"><span>${mark("D-04")}</span> <button data-opens="D-04">x</button></div><div>${mark("D-04")}</div>`)).toEqual({ "D-04": 1 });
  });

  it("is on no guide or exposure page, except the listed leftovers", async () => {
    const found: (Omit<Leftover, "why"> & { words: string[] })[] = [];
    let drawn = 0;
    for (const page of pages) {
      const html = await draw(page);
      if (html === null) continue;
      drawn++;
      for (const [rule, words] of Object.entries(doubles(html))) found.push({ page, rule, blocks: words.length, words });
    }
    expect(drawn).toBeGreaterThan(20);
    const key = (l: Omit<Leftover, "why">) => `${l.page} ${l.rule} ×${l.blocks}`;
    const listed = new Set(leftovers.map(key));
    // a new double: fold the marks into one, or mark the rule once in the block; a listed one gone or changed: update its entry
    const unlisted = found.filter((f) => !listed.has(key(f))).map((f) => `${key(f)}: ${f.words.join(" | ")}`);
    expect(unlisted, "marked twice in one block").toEqual([]);
    expect(leftovers.map(key).filter((k) => !found.some((f) => key(f) === k)), "listed, and no longer found").toEqual([]);
  }, 300000);

  it("lists each leftover with why", () => {
    for (const l of leftovers) expect(l.why.trim().length, `${l.page} ${l.rule}`).toBeGreaterThan(0);
  });
});
