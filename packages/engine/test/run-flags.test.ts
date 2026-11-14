// RUN_FLAG_CODES lists every flag code a ledger run can raise, so the site can hold a line for each (copy.ts `flags`, its own test): the
// codes the ledgers flag by name, and those they flag through a value, which come from the blocked exits, the reliefs and the open readings.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RUN_FLAG_CODES } from "../src/result.ts";
import { blockedWrapperExit } from "../src/formulas/blocked-exit.ts";
import { openReadings, readingFlag } from "../src/open-readings.ts";

const src = fileURLToPath(new URL("../src/", import.meta.url));
const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

describe("RUN_FLAG_CODES", () => {
  it("names exactly the codes a ledger run can flag", () => {
    const raised = new Set<string>();
    const throughValue: string[] = [];
    for (const f of walk(join(src, "ledgers")).filter((x) => x.endsWith(".ts"))) {
      const text = readFileSync(f, "utf8");
      // tally.flag("G-21"), tally.flag(cond ? "G-34" : "G-16", m), tally.flag(code): each call's whole argument list
      for (const m of text.matchAll(/\.flag\(/g)) {
        let depth = 1;
        let i = m.index! + m[0].length;
        const start = i;
        for (; i < text.length && depth > 0; i++) depth += text[i] === "(" ? 1 : text[i] === ")" ? -1 : 0;
        const args = text.slice(start, i - 1);
        const named = [...args.matchAll(/"([A-Z]+-(?:OQ)?\d+)"/g)].map((x) => x[1]!);
        if (named.length) named.forEach((c) => raised.add(c));
        else throughValue.push(args.split(",")[0]!.trim());
      }
    }
    // the values a ledger flags: a relief's open readings, a blocked exit's gap and open questions
    expect(throughValue.sort()).toEqual(["code", "exit.gap", "exit.gap", "q", "q"]);
    for (const formula of ["F-45", "F-48", "F-49"] as const) {
      const exit = blockedWrapperExit(formula, 0);
      if (exit.gap) raised.add(exit.gap);
    }
    // only F-49 flags its open questions in a run (pension.ts); F-45 is the formula registry's alone
    for (const q of blockedWrapperExit("F-49", 0).openQuestions) raised.add(q);
    for (const code of ["G-23", "TXP-OQ20"]) raised.add(code); // reliefFlags
    for (const o of openReadings) raised.add(readingFlag(o.question)); // acrossReadings
    expect([...raised].sort()).toEqual([...RUN_FLAG_CODES].sort());
  });
});
