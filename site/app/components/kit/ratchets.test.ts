// Ratchets of the kit (founder, 2026-10-25: "how can we make sure that in the future we always use shared components?"). Each
// pattern the kit owns is counted outside the kit, per file. Today's leftovers are listed by name below; a new use anywhere fails,
// and a file that drops below its number fails too, until its line is lowered or removed, so the lists only shrink. To clear a
// leftover, move it to the kit piece named in the test, then lower its number here. Kit round 2 (research/specs/2026-10-25-ui-kit/
// round-2.md) adds the pieces that empty the input list.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const rel = (f: string) => relative(root, f).split("\\").join("/");
const files = walk(root).filter((f) => f.endsWith(".tsx") && !rel(f).startsWith("components/kit/"));
/** Source without block comments and whole-line `//` comments. */
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const classStrings = (s: string) => [...s.matchAll(/className=(?:\{cx\()?["'`]([^"'`]*)["'`]/g)].map((m) => m[1]!);

// Today's leftovers (2026-10-26), per file.
const PILL: Record<string, number> = {
    "components/compare/quick-goal.tsx": 4,
    "components/compare/strip.tsx": 1,
    "components/exposure-mode/chart.tsx": 2,
    "components/exposure-mode/fields.tsx": 2,
    "components/guide-signature/current-account.tsx": 2,
    "components/guide/sections.tsx": 4,
    "components/timeline/Timeline.tsx": 3,
    "components/workbench/controls.tsx": 4,
    "components/workbench/funds/controls.tsx": 3,
    "components/workbench/providers/controls.tsx": 3,
  };
const CARD: Record<string, number> = {
    "components/compare/fit.tsx": 1,
    "components/compare/rows.tsx": 1,
    "components/compare/strip.tsx": 3,
    "components/invest/funds.tsx": 1,
    "components/playbook/strip.tsx": 1,
    "components/revisit/revisit.tsx": 2,
    "components/workbench/providers/row.tsx": 1,
    "routes/home.tsx": 1,
    "routes/idle-cash.tsx": 1,
    "routes/switch.tsx": 2,
    "routes/workbench-funds.tsx": 1,
  };
const INPUT: Record<string, number> = {
    "components/compare/fields.tsx": 2,
    "components/compare/why.tsx": 1,
    "components/decoder/tracks.tsx": 1,
    "components/holdings/fields.tsx": 3,
    "components/invest/chips.tsx": 4,
    "components/playbook/strip.tsx": 1,
    "components/search.tsx": 2,
    "components/transfer/panel.tsx": 1,
    "components/workbench/controls.tsx": 1,
    "components/workbench/funds/controls.tsx": 2,
    "components/workbench/providers/offer-card.tsx": 2,
    "routes/companies.tsx": 1,
    "routes/rules.tsx": 1,
  };
const STATGRID: Record<string, number> = {
    "components/holdings/card.tsx": 1,
  };
const OLDUI: Record<string, number> = {
    "components/Sheet.tsx": 1,
    "components/provenance.tsx": 1,
    "routes/switch.tsx": 1,
    "routes/workbench-funds.tsx": 1,
    "routes/workbench-providers.tsx": 1,
    "routes/workbench-tracks.tsx": 1,
  };

const patterns: Record<string, { kit: string; count: (s: string) => number; allowed: Record<string, number> }> = {
  pill: {
    kit: "ChipList, ChoiceChips or PlanChips (the pill classes sec-chip and a-chip belong to them)",
    count: (s) => (s.match(/\b(sec-chip|a-chip)\b/g) ?? []).length,
    allowed: PILL,
  },
  card: {
    kit: "Card (a hand-written bg-card border rounded-lg surface)",
    count: (s) => classStrings(s).filter((c) => /\bbg-card\b/.test(c) && /\bborder\b/.test(c) && /\brounded-(lg|xl)\b/.test(c)).length,
    allowed: CARD,
  },
  input: {
    kit: "NumberField, RangeField or PercentField (a raw <input> or <select>; text and select fields come in kit round 2)",
    count: (s) => [...s.matchAll(/<input\b[^>]*>/g)].filter((m) => !/type="(checkbox|radio|range|hidden)"/.test(m[0])).length + (s.match(/<select\b/g) ?? []).length,
    allowed: INPUT,
  },
  statGrid: {
    kit: "StatRow or KeyValueList (a <dl> laid out as a grid)",
    count: (s) => (s.match(/<dl\b[^>]*className="[^"]*\bgrid\b/g) ?? []).length,
    allowed: STATGRID,
  },
  oldUi: {
    kit: "components/kit (ui.tsx is a legacy re-export)",
    count: (s) => (s.match(/from\s+["'](?:\.\.?\/)+(?:components\/)?ui["']/g) ?? []).length,
    allowed: OLDUI,
  },
};

for (const [name, p] of Object.entries(patterns)) {
  describe(`ratchet: ${name}`, () => {
    const now: Record<string, number> = {};
    for (const f of files) {
      const n = p.count(code(readFileSync(f, "utf8")));
      if (n) now[rel(f)] = n;
    }
    it(`no new use outside the kit: use ${p.kit}`, () => {
      const over = Object.entries(now).filter(([f, n]) => n > (p.allowed[f] ?? 0)).map(([f, n]) => `${f}: ${n} (allowed ${p.allowed[f] ?? 0})`);
      expect(over).toEqual([]);
    });
    it("the list only shrinks: lower a number once its file has fewer", () => {
      const stale = Object.entries(p.allowed).filter(([f, n]) => (now[f] ?? 0) < n).map(([f, n]) => `${f}: allowed ${n}, now ${now[f] ?? 0}`);
      expect(stale).toEqual([]);
    });
  });
}

describe("no field painted in the edge colour", () => {
  // --input is the edge token (borders); a field's background is --card (.field-box). The index page's account select and a
  // textarea on the fees page rendered light grey with bg-input (2026-10-26).
  it("bg-input is not used", () => {
    const hits = walk(root).filter((f) => f.endsWith(".tsx") && /\bbg-input\b/.test(code(readFileSync(f, "utf8")))).map(rel);
    expect(hits).toEqual([]);
  });
});
