// READING_RULE_IDS lists every rule the engine labels `reading` (the goal comparison holds room for the reading mark on a row that cites one
// of them, so the list must not fall behind the engine): those a ledger labels by name, and the rule of every open reading whose split takes
// the cautious reading, which the resolver labels whichever reading a run is under.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { READING_RULE_IDS } from "../src/result.ts";
import { openReadings } from "../src/open-readings.ts";

const src = fileURLToPath(new URL("../src/", import.meta.url));
const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

describe("READING_RULE_IDS", () => {
  it("names exactly the rules the engine labels a reading", () => {
    const labelled = new Set<string>();
    let dynamic = 0;
    for (const f of walk(src).filter((x) => x.endsWith(".ts"))) {
      const text = readFileSync(f, "utf8");
      for (const m of text.matchAll(/label\(\s*"reading"\s*,\s*("([A-Z0-9-]+)"|\w+)/g)) {
        if (m[2]) labelled.add(m[2]);
        else dynamic++;
      }
    }
    // every rule is labelled by name: one labelled through a variable would have to be listed where the variable is set
    expect(dynamic).toBe(0);
    for (const o of openReadings) if (o.onSplit === "cautious") labelled.add(o.ruleId);
    expect([...labelled].sort()).toEqual([...READING_RULE_IDS].sort());
  });
});
