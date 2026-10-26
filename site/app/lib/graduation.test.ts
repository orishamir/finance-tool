// The status cards read the rule base's status sections: closures come from struck-through items with a date,
// blockers from G-24, and an institution-strength answer is flagged (D23) without closing a question.
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
    const c = by("savings-policies").closed.find((x) => x.code === "INS OQ2");
    expect(c).toMatchObject({ closedOn: "2026-10-24", ruleIds: expect.arrayContaining(["INS-25"]) });
    // 2026-10-25 tax-bases research: TXA OQ1's base is answered by the law (TXA-28 became general), so no insurer statement is flagged as its answer
    expect(by("savings-policies").open.find((o) => o.code === "TXA OQ1")?.institutionAnswer).toBeUndefined();
    // a REIT's blocker in G-24 is TX2 OQ8, which has no institution answer; TX2-21 (split from TX2-20) answers OQ7, which G-24 no longer lists
    expect(by("reits").open.some((o) => o.institutionAnswer)).toBe(false);
  });
  it("lists the Amendment 190 closures, one row per question, with their rule and date (2026-10-26)", () => {
    const closed = by("amendment-190-deposits").closed;
    expect(closed.map((c) => c.code)).toEqual(expect.arrayContaining(["TXA OQ9", "TXA OQ10", "TXA OQ11"]));
    expect(closed.find((c) => c.code === "TXA OQ10")).toMatchObject({ closedOn: "2026-10-26", ruleIds: expect.arrayContaining(["TXA-30"]) });
    expect(closed.find((c) => c.code === "TXA OQ11")).toMatchObject({ closedOn: "2026-10-26", ruleIds: expect.arrayContaining(["TXA-19"]) });
    expect(by("amendment-190-deposits").open.map((o) => o.code)).toEqual(["TXA OQ14", "TXA OQ15"]);
  });
  it("lists no closure where the status section names none", () => {
    expect(by("gold-via-funds").closed).toEqual([]);
    expect(by("executive-insurance").closed).toEqual([]);
  });
});
