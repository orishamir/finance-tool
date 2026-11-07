import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { heldAnchors, heldPages, heldSignatures, isHeld, isHeldAnchor, shown } from "./review";
import { signatureRegistry } from "../components/guide-signature";
import { ProvenanceProvider } from "../components/provenance";
import { guideContent } from "../content/guide";
import type { ContentProps } from "../content/guide/types";
import { guideSignature } from "../copy";
import { GoalsProvider } from "./goal";
import { buildGuidePage } from "./guide.server";
import { InputsProvider } from "./inputs";
import type { SiteValue } from "./value";

const app = join(__dirname, "..");
const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return sources(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
/** A path into the guide's copy (`ladder.range.anchorId`), as a held visual names its anchor. */
const resolve = (path: string): unknown => path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), guideSignature);

/** A guide page's visual and prose as the pre-rendered page has them: no `?review` (it is read after the first render). */
const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-11-07" };
const render = (el: ReactNode) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(GoalsProvider, { presets: {}, children: createElement(ProvenanceProvider, { data, children: el }) }) })));
const visualHtml = (id: string): string => {
  const sig = buildGuidePage(id)?.signature;
  const Visual = signatureRegistry[id];
  return sig && Visual ? render(createElement(Visual, { data: sig, today: data.today })) : "";
};
const proseHtml = (id: string): string => {
  const c = guideContent[id];
  const page = buildGuidePage(id);
  if (!c || !page) return "";
  const figure = (ruleId: string, name: string): SiteValue | null => {
    const f = page.rules[ruleId]?.figures?.[name];
    if (!f || Array.isArray(f)) return null;
    const v = "by_tax_year" in f ? Object.values(f.by_tax_year).at(-1) : f;
    return v ? ({ ...v, rule_ids: v.rule_ids ?? [ruleId] } as SiteValue) : null;
  };
  const p: ContentProps = { figure, breakTerms: page.breakTerms };
  const parts: ReactNode[] = [c.what(p), c.who?.(p), typeof c.switchLine === "function" ? c.switchLine(p) : c.switchLine, ...(c.inoutRows?.(p).map((r) => r.value) ?? []), c.afterTax?.(p), c.risks(p), c.use?.(p)];
  return parts.map((n, i) => render(createElement("div", { key: i }, n))).join("");
};
/** Every id an element of the HTML carries, but React's useId ids and the ids an SVG defines for its own patterns and gradients. */
const anchorIds = (html: string): string[] => {
  const defs = new Set([...html.matchAll(/<(?:pattern|linearGradient|radialGradient|clipPath|mask|marker|filter|symbol)\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]!));
  return [...new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!))].filter((a) => !defs.has(a) && !/[«»:]|^_R?_/.test(a));
};

describe("held for review (lib/review.ts)", () => {
  it("a held page is held with a query, a hash or a trailing slash, and nothing else is", () => {
    for (const p of heldPages) {
      expect(isHeld(p)).toBe(true);
      expect(isHeld(`${p}?balance=1`)).toBe(true);
      expect(isHeld(`${p}#x`)).toBe(true);
      expect(isHeld(`${p}/`)).toBe(true);
    }
    expect(shown("/holdings-bundle.json")).toBe(true);
    expect(shown("/guide")).toBe(true);
  });
  it("every held visual is a visual the guide has", () => {
    for (const id of heldSignatures) expect(signatureRegistry).toHaveProperty(id);
  });
  it("a link to an anchor inside a held visual is hidden, except on the same page in review mode", () => {
    for (const [anchor, page] of Object.entries(heldAnchors)) {
      expect(heldSignatures.includes(page) ? isHeldAnchor(`/guide/${page}#${anchor}`) : true).toBe(true);
      if (!heldSignatures.includes(page)) continue;
      expect(shown(`/guide/${page}#${anchor}`)).toBe(false);
      expect(shown(`/guide/${page}#${anchor}`, true)).toBe(false); // another page's ?review does not carry over
      expect(shown(`#${anchor}`)).toBe(false);
      expect(shown(`#${anchor}`, true)).toBe(true);
    }
    expect(shown("/guide/bank-deposit#tax")).toBe(true);
  });

  // 2026-11-07 (independent check 2 of the deposit branch): two live links led to the bank-deposit list while its visual was held.
  // Both guards read the rendered HTML (code review, 2026-11-07): read line by line in the source they missed a link whose address is
  // built in a variable, any anchor set through a constant or a kit component, and anchors in subcomponents.
  it("every anchor a held visual renders is listed in heldAnchors", () => {
    for (const id of heldSignatures) {
      const html = visualHtml(id);
      expect(html, id).not.toBe("");
      for (const a of anchorIds(html)) expect(heldAnchors[a], `the ${id} visual renders #${a}`).toBe(id);
    }
  });
  it("no guide page links to an anchor inside a held visual", () => {
    const held = Object.entries(heldAnchors).filter(([, page]) => heldSignatures.includes(page)).map(([a]) => a);
    const bad: string[] = [];
    for (const id of new Set([...Object.keys(signatureRegistry), ...Object.keys(guideContent)])) {
      for (const [part, html] of [["visual", heldSignatures.includes(id) ? "" : visualHtml(id)], ["prose", proseHtml(id)]] as const) {
        for (const m of html.matchAll(/\shref="([^"]*)"/g)) if (held.some((a) => m[1]!.endsWith(`#${a}`))) bad.push(`${id} ${part}: ${m[1]}`);
      }
    }
    expect(bad).toEqual([]);
    // Renders every guide's visual and prose: about 5.5 s on CI's runners and growing with the guides,
    // so it has its own limit instead of vitest's 5 s default.
  }, 30_000);
  it("every file that names a held anchor is one the render guards read", () => {
    const anchors = Object.keys(heldAnchors);
    const covered = (f: string) => /^(components\/guide-signature|content\/guide)\//.test(f) || f === "lib/review.ts" || f === "copy.ts";
    const outside: string[] = [];
    for (const f of sources(app)) {
      const src = readFileSync(f, "utf8");
      const named = [...[...src.matchAll(/(?:copy|guideSignature)\.([\w.]+)/g)].map((m) => String(resolve(m[1]!))), ...[...src.matchAll(/["'`#]([\w-]+)["'`]/g)].map((m) => m[1]!)];
      if (named.some((t) => anchors.includes(t)) && !covered(relative(app, f))) outside.push(relative(app, f));
    }
    expect(outside).toEqual([]);
  });
});
