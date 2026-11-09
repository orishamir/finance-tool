// The status cards read the rule base's status sections: closures come from struck-through items with a date and name the
// rules that answered them, blockers from G-24, and an institution-strength answer is flagged (D23) without closing a question.
import { describe, expect, it } from "vitest";
import { graduationStatuses } from "./graduation.server";

describe("graduation status", () => {
  const all = graduationStatuses();
  const by = (id: string) => all.find((s) => s.id === id)!;
  it("covers the nine tier-2 instruments, each blocked by its open questions", () => {
    expect(all).toHaveLength(9);
    for (const s of all) expect(s.status).toBe(s.open.length > 0 ? "blocked" : "remaining");
  });
  it("lists the savings policy's fee-cap closure with its rule and date, and flags the insurer-statement answer", () => {
    expect(by("savings-policies").closed).toEqual(expect.arrayContaining([{ closedOn: "2026-10-24", ruleIds: ["INS-25"] }]));
    // TXA OQ1's base is answered by the law (TXA-28 became general), so no insurer statement is flagged as its answer
    expect(by("savings-policies").open.find((o) => o.code === "TXA OQ1")?.institutionAnswer).toBeUndefined();
    // a REIT's blocker in G-24 is TX2 OQ8, which has no institution answer; TX2-21 (split from TX2-20) answers OQ7, which G-24 no longer lists
    expect(by("reits").open.some((o) => o.institutionAnswer)).toBe(false);
  });
  it("lists the Amendment 190 closures by the rules that answered them, with their date (2026-10-26), never a question", () => {
    const closed = by("amendment-190-deposits").closed;
    expect(closed).toEqual([
      { closedOn: "2026-10-26", ruleIds: ["TXA-30"] },
      { closedOn: "2026-10-26", ruleIds: ["TXA-19"] },
    ]);
    // an answered question is deleted from the rule base: a closure carries no question code
    expect(all.flatMap((s) => s.closed).every((c) => !("code" in c))).toBe(true);
    expect(by("amendment-190-deposits").open.map((o) => o.code)).toEqual(["TXA OQ14"]);
  });
  it("lists no closure where the status section names none", () => {
    expect(by("gold-via-funds").closed).toEqual([]);
    expect(by("executive-insurance").closed).toEqual([]);
  });
});
