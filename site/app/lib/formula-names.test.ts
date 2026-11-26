// A formula's name is the same on every page: copy.ts holds it, and no module changes the table when it loads. A name a module put
// there would show on the pre-rendered page (the server loads every module) and not in the browser on a page that never loads that
// module, so the first render there would not match the pre-rendered page. Test files share modules in a worker (vitest.config.ts,
// isolate off), so the table is read from fresh copies, before and after the modules that once changed it load.
import { DITTO, sameName } from "@finance-tool/schema";
import { describe, expect, it, vi } from "vitest";

describe("formula names", () => {
  it("loading the providers' module leaves copy.ts's table as it is", async () => {
    vi.resetModules();
    const { formulaNames } = await import("../copy");
    const own = { ...formulaNames };
    // the module loaded for what it does at load; one export named, so the test marks no other export of it as used
    const { isFxToFx } = await import("./providers");
    expect(isFxToFx).toBeTypeOf("function");
    expect(formulaNames).toEqual(own);
    vi.resetModules();
  });
});

// A Hebrew name points at one thing: a formula's name in copy.ts's table, a glossary term's name and a rule's title are never the same
// (the quotation-mark kinds made one), and no two formulas share one. A formula's keys and a figure's about line stand alone in its sheet, so none points
// back with a ditto ("אותו", "אותה", "האלה") at a line before it. What still does is listed here, and each list only shrinks.


/** The names still given to more than one thing, as `sameName` writes them. */
const NAME_LEFTOVERS: string[] = [
  "דמי ניהול מהפקדה",
  "דמי ניהול פיקדון ניירות ערך",
  "דמי ניהול מחיסכון",
  "איחוד חשבונות",
  "קרנות כספיות יומיות",
];
/** The formula keys and about lines still pointing back, by where they are in copy.ts. */
const DITTO_LEFTOVERS: string[] = [
  "formulaKeys.F-05.C_m",
  "formulaKeys.F-05.I_m",
  "formulaKeys.F-129.Y",
  "formulaKeys.F-129.C_m",
  "formulaKeys.F-130.B^{real}",
  "formulaKeys.F-131.s(a, m)",
  "formulaKeys.F-06.V",
  "formulaKeys.F-06.I_m",
  "formulaKeys.F-06.C_m",
  "formulaKeys.F-84.E_c",
  "formulaKeys.F-87.A",
  "formulaKeys.F-88.A",
  "formulaKeys.F-93.\\text{ILS}_t",
  "formulaKeys.F-93.\\text{USD}_t",
  "invest.before.map.howTo.about",
];

describe("names across the formula table, the glossary and the rules", async () => {
  const { readdirSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { formulaNames } = await import("../copy");
  const data = join(import.meta.dirname, "../../../data");
  const read = (dir: string) => readdirSync(join(data, dir)).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(data, dir, f), "utf8")) as Record<string, unknown>);
  const owners = new Map<string, string[]>();
  const own = (name: unknown, who: string) => typeof name === "string" && owners.set(sameName(name), [...(owners.get(sameName(name)) ?? []), who]);
  for (const [id, name] of Object.entries(formulaNames)) own(name, `formula ${id}`);
  for (const t of read("terms")) own(t.he, `term ${String(t.id)}`);
  for (const r of read("rules")) own(r.title_he, `rule ${String(r.id)}`);
  // two terms of one name are the data check's (data-schema §4 item 16), two rules of one title the pipeline's rule-titles check
  const kind = (who: string) => who.split(" ")[0];
  const shared = [...owners].filter(([, who]) => new Set(who.map(kind)).size > 1 || who.filter((w) => kind(w) === "formula").length > 1).map(([name]) => name);
  it("give each formula, term and rule a name no thing of another kind has, and each formula its own", () => {
    expect(shared.filter((name) => !NAME_LEFTOVERS.includes(name)).map((name) => `${name}: ${owners.get(name)?.join(", ")}`)).toEqual([]);
  });
  it("leave no listed name that is no longer shared (the list only shrinks)", () => {
    expect(NAME_LEFTOVERS.filter((name) => !shared.includes(name))).toEqual([]);
  });
});

describe("formula keys and about lines", async () => {
  const copy = await import("../copy");
  /** Every string under a key named "about" in copy.ts, by its path. */
  const abouts = (node: unknown, path: string): [string, string][] => {
    if (!node || typeof node !== "object") return [];
    return Object.entries(node).flatMap(([k, v]) => [...(k === "about" && typeof v === "string" ? [[`${path}${k}`, v] as [string, string]] : []), ...abouts(v, `${path}${k}.`)]);
  };
  const lines: [string, string][] = [
    ...Object.entries(copy.formulaKeys).flatMap(([id, keys]) => [
      ...(keys.lines ?? []).map((l, i) => [`formulaKeys.${id}.lines.${i}`, l] as [string, string]),
      ...keys.symbols.map(([tex, words]) => [`formulaKeys.${id}.${tex}`, words] as [string, string]),
    ]),
    ...abouts(copy, ""),
  ];
  const back = lines.filter(([, text]) => DITTO.test(text)).map(([where]) => where);
  it("never point back with a ditto a list does not allow", () => {
    expect(back.filter((where) => !DITTO_LEFTOVERS.includes(where))).toEqual([]);
  });
  it("leave no listed line that is fixed or gone (the list only shrinks)", () => {
    expect(DITTO_LEFTOVERS.filter((where) => !back.includes(where))).toEqual([]);
  });
  it("catch a planted ditto and pass a word that only holds one", () => {
    expect(DITTO.test("המדד באותו חודש")).toBe(true);
    expect(DITTO.test("אותות מסחר")).toBe(false);
  });
});
