// What a site parameter's sheet says (2026-10-25). The founder clicked the yearly inflation on a guide page and got the whole parameter
// file's one line: every input, the test scenarios, a fund swap and "chosen by Claude; the founder has not approved". Now every number
// has its own short line, the sheet shows it first, and no parameter's reader text carries the working history.
import { readdirSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { ParameterRecord } from "@finance-tool/schema";
import { parameterVersions } from "@finance-tool/engine";
import { ProvenanceProvider, ValueSheet } from "../components/provenance";
import { loadParameters } from "./data.server";
import { p05Value } from "./engine";
import type { SiteValue } from "./value";

const dir = new URL("../../../data/parameters/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const raw = (f: string) => JSON.parse(readFileSync(new URL(f, dir), "utf8")) as Record<string, unknown>;

const hebrew = /[א-ת]/;
/** Working history that belongs in docs/parameters-rationale.md, never on a sheet. */
const forbidden: [string, RegExp][] = [
  ["Claude", /Claude/i],
  ["test scenarios", /תרחישי (ה)?בדיקה|תרחיש הבדיקה|תרחישי הבדיקות/],
  ["the founder", /המייסד|מייסד האתר|בעל האתר/],
  ["a scenario id", /\bS\d{2}\b/],
  ["an audit", /ביקורת|audit/i],
  ["a history of earlier values", /הוחלפ|מחליפה את|זמני, נבחר|נבחר על ידי/],
];

type Found = { where: string; text: string };

/** Every string the reader can meet in a parameter file: each `*_he` field and any Hebrew `notes`, wherever it sits. */
function readerText(node: unknown, path: string, out: Found[]): Found[] {
  if (Array.isArray(node)) node.forEach((n, i) => readerText(n, `${path}[${i}]`, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === "string" && (k.endsWith("_he") || (k === "notes" && hebrew.test(v)))) out.push({ where: `${path}.${k}`, text: v });
      else readerText(v, `${path}.${k}`, out);
    }
  }
  return out;
}

/** Every value object of a parameter file with its path. */
function valueObjects(node: unknown, path: string, out: { path: string; v: Record<string, unknown> }[]) {
  if (Array.isArray(node)) node.forEach((n, i) => valueObjects(n, `${path}[${i}]`, out));
  else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if ("value" in o && "unit" in o && "source" in o) out.push({ path, v: o });
    else for (const [k, v] of Object.entries(o)) valueObjects(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

describe("the reader text of every parameter file", () => {
  it("covers the nine parameter files (and any added since)", () => {
    expect(files.length).toBeGreaterThanOrEqual(9);
  });

  for (const f of files) {
    it(`${f} carries no working history`, () => {
      const hits: string[] = [];
      for (const { where, text } of readerText(raw(f), f, [])) for (const [what, re] of forbidden) if (re.test(text)) hits.push(`${where}: ${what}`);
      expect(hits).toEqual([]);
    });

    it(`${f}: a general line, and its own short Hebrew line for every number`, () => {
      const d = raw(f);
      expect(typeof d.rationale_he === "string" && hebrew.test(d.rationale_he)).toBe(true);
      const bare = valueObjects(d, "", []).filter(({ v }) => typeof v.rationale_he !== "string" || !hebrew.test(v.rationale_he) || (v.rationale_he as string).length > 400);
      expect(bare.map((b) => b.path)).toEqual([]);
    });
  }

  it("the English working rationale of a file does not name who chose the value either", () => {
    for (const f of files) {
      const d = raw(f);
      expect(String(d.rationale), f).not.toMatch(/Claude|the founder has not|test scenarios/i);
    }
  });
});

describe("the sheet of the yearly inflation", () => {
  const p05 = loadParameters().find((p) => p.method_id === "P-05") as ParameterRecord;
  const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-10-25" };
  const sheet = (value: SiteValue) =>
    renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(ValueSheet, { value, exact: false, data, headId: "h", descId: "d" }) })));
  const general = p05.rationale_he as string;
  const a02 = p05Value(p05, "A-02");
  const own = (raw("illustrative-scenario.json").inputs as Record<string, { rationale_he: string }>)["A-02"]!.rationale_he;

  it("says it is a round starting value the site chose, not a measured average or a forecast", () => {
    expect(a02.rationale_he).toBe(own);
    expect(own).toMatch(/ערך התחלה עגול שהאתר בחר/);
    expect(own).toMatch(/לא ממוצע שנמדד ולא תחזית/);
  });

  it("shows its own line first and the file's line only behind 'עוד על הפרמטר'", () => {
    const html = sheet(a02);
    const at = (s: string) => html.indexOf(s);
    expect(at(own)).toBeGreaterThan(-1);
    expect(at("עוד על הפרמטר")).toBeGreaterThan(at(own));
    expect(at(general)).toBeGreaterThan(at("עוד על הפרמטר"));
    // the fold is closed on first paint: nothing of the general line sits before the fold label
    expect(html.slice(0, at("עוד על הפרמטר"))).not.toContain(general);
  });

  it("never prints the history the file used to carry", () => {
    const html = sheet(a02);
    for (const [what, re] of forbidden) expect(html, what).not.toMatch(re);
  });

  it("a number with no line of its own shows the file's line directly, without a fold", () => {
    const { rationale_he: _gone, ...plain } = a02;
    const html = sheet(plain as SiteValue);
    expect(html).toContain(general);
    expect(html).not.toContain("עוד על הפרמטר");
  });

  it("every input of P-05 opens on its own line", () => {
    const lines = new Set<string>();
    for (const key of ["amount_now", "monthly_deposit", "horizon_years", "A-01", "A-02", "cash_rate", "annual_income"] as const) {
      const v = p05Value(p05, key);
      expect(v.rationale_he, key).toBeTruthy();
      lines.add(v.rationale_he!);
    }
    expect(lines.size).toBe(7);
  });
});

describe("a saved comparison does not see the per-number lines", () => {
  it("adding or rewording them is not a changed parameter", () => {
    const records = loadParameters().filter((p) => ["P-01", "P-02", "P-05"].includes(p.method_id));
    const strip = (n: unknown): unknown => (Array.isArray(n) ? n.map(strip) : n && typeof n === "object" ? Object.fromEntries(Object.entries(n).filter(([k]) => k !== "rationale_he").map(([k, v]) => [k, strip(v)])) : n);
    const before = parameterVersions(records.map((r) => strip(r)));
    const after = parameterVersions(records);
    expect(after).toEqual(before);
    expect(JSON.stringify(after)).not.toContain("rationale_he");
  });
});
