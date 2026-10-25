import { describe, expect, it } from "vitest";
import { loadRules } from "./data.server";
import { CHECKLIST, STEP_LISTS, buildSteps, experienceSource, parsePlaybookQuery, playbookQueryString, playbookRuleIds, providentCost, sentences, tickKey, migrateTickKeys, hasOldTickKeys, buildSummary, SUMMARY_SPECS } from "./playbook";

const rules = loadRules();
const today = "2026-10-24";

describe("the step lists", () => {
  it("name only rules the rule base holds, and each has a Hebrew text or title", () => {
    for (const [wrapper, list] of Object.entries(STEP_LISTS)) {
      for (const id of playbookRuleIds(wrapper)) expect(rules[id], `${wrapper}: ${id}`).toBeDefined();
      for (const st of list) for (const id of st.ruleIds) expect(rules[id]!.title_he ?? rules[id]!.text_he, id).toBeTruthy();
    }
  });
  it("have the step counts of the index", () => {
    const n = (w: string) => buildSteps(rules, w, today).length;
    expect(n("keren-hishtalmut")).toBe(13);
    expect(n("current-account")).toBe(7);
    expect(n("bank-deposit")).toBe(1);
    expect(n("child-savings-provident")).toBe(1);
  });
  it("renders the retention step as no-rule with the two experience entries", () => {
    const st = buildSteps(rules, "keren-hishtalmut", today).find((x) => x.noRule)!;
    expect(st.ruleIds).toEqual(["SW-19"]);
    expect(st.experience.map((e) => e.id)).toEqual(["SW-X01", "SW-X02"]);
    expect(st.noRule!.known.map((k) => k.ruleId)).toEqual(["SW-07", "PF-13", "PF-14"]);
  });
  it("takes figures from the figure files (3 and 15 business days, 10 for the money)", () => {
    const steps = buildSteps(rules, "keren-hishtalmut", today);
    const f = (n: number) => steps[n - 1]!.figures.map((x) => x.value?.value);
    expect(f(8)).toEqual([3]);
    expect(f(11)).toEqual([10, 20]);
    // 2026-10-25 (scope pass): The Phoenix's own 14 days moved out of SW-09 into SW-47 and is listed after the circular's 15, named
    expect(f(12)).toEqual([15, 14]);
    expect(steps[11]!.figures[1]!.label).toContain("הפניקס");
  });
  it("shows a company's own records after the step's rules, named, without setting the step's chip (scope pass 2026-10-25)", () => {
    const steps = buildSteps(rules, "keren-hishtalmut", today);
    const cancel = steps[9]!;
    expect(cancel.text.map((t) => t.ruleId)).toEqual(["SW-07", "SW-46"]);
    expect(cancel.strength).toBe("primary");
    expect(cancel.text[1]!.text).toContain("הפניקס");
    for (const id of ["SW-45", "SW-46", "SW-47", "SW-48", "SW-49", "SW-50"]) expect(playbookRuleIds("keren-hishtalmut"), id).toContain(id);
  });
  it("moves the sentences that name the forms to the labelled lines, whole, out of the body", () => {
    const steps = buildSteps(rules, "keren-hishtalmut", today);
    const sign = steps[4]!;
    expect(sign.sign.some((x) => x.text.includes("נספח א׳"))).toBe(true);
    expect(sign.text.find((t) => t.ruleId === "SW-02")!.text).not.toContain("נספח א׳");
    expect(steps[7]!.expect[0]!.text).toContain("נספח ה׳");
    expect(steps[9]!.sign[0]!.text).toContain("נספח ו׳");
  });
  it("labels the brokerage steps by their strength: institution only gets the prefix flag", () => {
    const steps = buildSteps(rules, "brokerage-account", today);
    // the checklist step (SW-38) reads the CMA circular itself since the source check of 2026-10-25; it was a copy before.
    // 2026-10-25 (scope pass): the request step rests on BoI directive 432 (SW-35, primary) with the institutions' own instructions
    // named after it (SW-54); the cost step's weakest rule is SW-34's press report (secondary); the tax step carries the unsettled
    // same-owner claim (SW-55, institution) beside the Ordinance (SW-36, primary). No step rests on company texts alone any more.
    expect(steps.map((s) => s.strength)).toEqual(["primary", "secondary", "institution", "open", "primary"]);
    expect(steps.map((s) => s.institutionOnly)).toEqual([false, false, false, false, false]);
    expect(steps[3]!.open).toBe(true);
  });
  it("names the mirror host of a primary-mirror text, from the rule's own copy sources", () => {
    // no switching rule rests on a copy since 2026-10-25, so SW-05 is made one here
    const sw05 = rules["SW-05"]!;
    const copy = { ...sw05.sources![0]!, url: "https://www.analyst.co.il/x.pdf", strength: "primary-mirror" as const, mirror_host: undefined };
    const asCopy = { ...rules, "SW-05": { ...sw05, strength: "primary-mirror" as const, sources: [copy] } };
    expect(buildSteps(asCopy, "keren-hishtalmut", today)[7]!.text[0]!.host).toBe("analyst.co.il");
    expect(buildSteps(rules, "keren-hishtalmut", today)[7]!.text[0]!.host).toBeUndefined();
  });
});

describe("the checklist", () => {
  it("is made of clauses of SW-38's own text", () => {
    for (const item of CHECKLIST) expect(rules["SW-38"]!.text_he, item.id).toContain(item.text);
  });
  it("names rules the base holds", () => {
    for (const item of CHECKLIST) for (const id of item.ruleIds) expect(rules[id], id).toBeDefined();
  });
});

describe("the address and the ticks", () => {
  it("round-trips the pair", () => {
    const q = parsePlaybookQuery("?from=a&to=b&fundFrom=1&fundTo=2&share=50");
    expect(q).toEqual({ from: "a", to: "b", fundFrom: "1", fundTo: "2", share: 50 });
    expect(playbookQueryString(q)).toBe("?from=a&to=b&fundFrom=1&fundTo=2&share=50");
    expect(parsePlaybookQuery("?share=100").share).toBeNull();
    expect(playbookQueryString(parsePlaybookQuery(""))).toBe("");
  });
  it("keys ticks by the wrapper alone, so a pair picked or cleared never loses them (A32)", () => {
    expect(tickKey("keren-hishtalmut", "a", null)).toBe("keren-hishtalmut");
    expect(tickKey("keren-hishtalmut")).toBe(tickKey("keren-hishtalmut", "a", "b"));
  });
  it("migrates keys of the old shape into the wrapper's key as a union", () => {
    const old = { "keren-hishtalmut|a|b": ["fee", "track"], "keren-hishtalmut||": ["track", "employer"], "current-account|x|": ["orders"] };
    expect(hasOldTickKeys(old)).toBe(true);
    const next = migrateTickKeys(old);
    expect(next).toEqual({ "keren-hishtalmut": ["fee", "track", "employer"], "current-account": ["orders"] });
    expect(hasOldTickKeys(next)).toBe(false);
    expect(migrateTickKeys(next)).toEqual(next);
  });
  it("reads the forum and thread out of an experience title", () => {
    expect(experienceSource(rules["SW-X01"]!.title, "2026-10-22")).toEqual({ forum: "Hasolidit", thread: ".36841", threadDate: "15/7/26", read: "2026-10-22" });
    expect(sentences("א. ב? ג").length).toBe(3);
  });
});

describe("the provident switching cost (F-66)", () => {
  const all = Object.values(rules);
  it("is zero with the rules for a track switch and a transfer, and a transfer carries the secondary label of SW-40", () => {
    const track = providentCost({ wrapperId: "kupat-gemel-lehashkaa", fromWrapper: "kupat-gemel-lehashkaa", sameCompany: true, share: null, rules: all, today });
    expect(track.kind).toBe("provident");
    if (track.kind === "provident") expect(track.cost.value).toBe(0);
    const transfer = providentCost({ wrapperId: "kupat-gemel-lehashkaa", fromWrapper: "kupat-gemel-lehashkaa", sameCompany: false, share: null, rules: all, today });
    if (transfer.kind !== "provident") throw new Error(transfer.kind);
    expect(transfer.ruleIds).toEqual(expect.arrayContaining(["SW-39", "SW-40"]));
    expect(transfer.labels.some((l) => l.code === "secondary-source")).toBe(true);
  });
  it("refuses a hishtalmut in part and does not evaluate two kinds", () => {
    expect(providentCost({ wrapperId: "keren-hishtalmut", fromWrapper: "keren-hishtalmut", sameCompany: false, share: 50, rules: all, today })).toMatchObject({ kind: "not-allowed", code: "hishtalmut-whole-only" });
    expect(providentCost({ wrapperId: "keren-hishtalmut", fromWrapper: "kupat-gemel-lehashkaa", sameCompany: false, share: null, rules: all, today })).toMatchObject({ kind: "not-evaluated", code: "different-kind" });
  });
});

describe("a sentence about the study fund alone (B14)", () => {
  const rules = loadRules();
  const all = (wrapper: string) => buildSteps(rules, wrapper, "2026-10-24").flatMap((s) => s.text.map((t) => t.text ?? "")).join(" ");
  it("is on the study fund's page and not on the kupat gemel lehashkaa's", () => {
    expect(all("keren-hishtalmut")).toContain("בקרן השתלמות אין העברה חלקית");
    expect(all("kupat-gemel-lehashkaa")).not.toContain("בקרן השתלמות אין העברה חלקית");
  });
});

describe("the summary box (A56)", () => {
  it("quotes whole sentences of rules the wrapper's own steps render, and finds every one", () => {
    for (const [wrapper, specs] of Object.entries(SUMMARY_SPECS)) {
      const items = buildSummary(rules, wrapper);
      expect(items.length, wrapper).toBe(specs.length);
      expect(items.length).toBeGreaterThanOrEqual(6);
      expect(items.length).toBeLessThanOrEqual(8);
      const onPage = new Set(STEP_LISTS[wrapper]!.flatMap((st) => [...st.ruleIds, ...(st.noRule?.known ?? [])]));
      for (const it of items) {
        expect(rules[it.ruleId]!.text_he, `${wrapper} ${it.ruleId}`).toContain(it.text);
        expect(onPage.has(it.ruleId), `${wrapper} ${it.ruleId} is a step rule`).toBe(true);
      }
    }
  });
});
