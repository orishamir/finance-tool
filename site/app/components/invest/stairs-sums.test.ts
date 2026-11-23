// The stairs' table adds up as a reader adds it (guidelines/wording.md, "Numbers"): along a row, the start's cost and each stair's difference
// reach the result's cost ("עלות הקרן" 3,106 at the start and 3,280 at the end took differences adding to 173), and down a stair's column
// the differences make minus the difference in what is left, each figure in whole shekels as shown.
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { buildInvest, knownIndices } from "../../lib/invest";
import { useStairs } from "./stairs";
import { bundle, plan, html } from "./render-fixtures";
import type { InvestView } from "../../lib/invest";

type Stairs = NonNullable<ReturnType<typeof useStairs>>;
function read(view: InvestView): Stairs | null {
  let got: Stairs | null = null;
  function Probe() {
    got = useStairs({ view, bundle, plan, startHouse: null, startFund: null, example: true });
    return null;
  }
  html(createElement(Probe));
  return got;
}

describe("the stairs' cost rows add up", () => {
  it("on every index, each part's start figure and its differences reach the result's figure, and a stair's differences make its step", () => {
    let seen = 0;
    for (const index of knownIndices(bundle)) {
      const s = read(buildInvest({ bundle, index, plan }));
      const first = s?.levels[0];
      const end = s?.levels.at(-1);
      if (!s || s.levels.length < 2 || !first?.whole || !end?.whole || s.levels.some((l) => !l.whole)) continue;
      seen++;
      const steps = s.levels.slice(1).map((l, i) => ({ l, prev: s.levels[i] ?? first, parts: l.dParts ?? [NaN, NaN, NaN, NaN] }));
      for (const k of [0, 1, 2, 3] as const) expect(first.whole[k] + steps.reduce((a, x) => a + x.parts[k], 0), `${index.id} part ${k}`).toBe(end.whole[k]);
      for (const [i, { l, prev, parts }] of steps.entries()) {
        const step = Math.round(l.left.value as number) - Math.round(prev.left.value as number);
        expect(parts.reduce((a, n) => a + n, 0), `${index.id} stair ${i + 1}`).toBe(-step);
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});
