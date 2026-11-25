// F-63, B3: a compared row is ranked, so the workbench never compares a run listed, not ranked, for a reason that is not an open rule (a
// wrapper locked at the horizon). No workbench input reaches such a run today; the outcomes are given here.
import { describe, expect, it } from "vitest";
import { stoppedBeforeComparing } from "../src/providers/workbench.ts";

const eligible = { outcome: { code: "eligible" } } as const;
const locked = { outcome: { code: "listed-not-ranked", reason: "B3", untilMonth: 48 } } as const;
const open = { outcome: { code: "listed-not-ranked", reason: "TXG-09", question: "TXG OQ17" } } as const;

describe("F-63 which runs the workbench compares", () => {
  it("compares two runs that may enter a ranking", () => {
    expect(stoppedBeforeComparing([eligible, eligible])).toBeNull();
  });
  it("keeps out a run listed on an open rule at its exit, naming the rule and the question", () => {
    expect(stoppedBeforeComparing([eligible, open])).toEqual({ ruleId: "TXG-09", question: "TXG OQ17" });
    expect(stoppedBeforeComparing([open, locked])).toEqual({ ruleId: "TXG-09", question: "TXG OQ17" });
  });
  it("stops on a run locked at the horizon (B3) rather than rank it", () => {
    expect(() => stoppedBeforeComparing([eligible, locked])).toThrow(/listed, not ranked, on B3/);
    expect(() => stoppedBeforeComparing([locked, eligible])).toThrow(/listed, not ranked, on B3/);
  });
});
