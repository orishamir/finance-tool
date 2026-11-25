// A foreign fund that pays out, named as the guides' representative fund (P-05's instruments): its fund reaches the run as the indices
// page's does (`fundOf`), with the domicile F-20 reads its foreign tax by and the legal form that settles its distribution (F-20, D85).
import { describe, expect, it } from "vitest";
import { loadFees, loadParameters, loadProducts, loadRules, today } from "./data.server";
import { runTimeline } from "./engine";
import { buildInstrumentTerms, loadFunds } from "./instruments.server";

const BRK = "brokerage-account";

describe("a distributing foreign fund in Tel Aviv as the guides' fund", () => {
  // a Tel Aviv line of an Irish company, made a shekel line that pays out by the test, so the guides run it (they run no foreign currency)
  const base = loadFunds().find((f) => f.id === "1183441");
  const yieldOf = loadFunds().find((f) => f.id === "ie0031442068")?.distribution;
  if (!base?.legal_structure || !yieldOf) throw new Error("1183441's record names its form, and ie0031442068's carries its yield");
  const paying = { ...base, currency: "NIS", distribution_policy: "distributing" as const, distribution: yieldOf };
  const runDate = today();
  const record = loadProducts().find((w) => w.id === BRK);
  const p05 = loadParameters().find((p) => p.method_id === "P-05");
  if (!record || !p05) throw new Error("the brokerage account's record and P-05 are in data/");
  const timeline = (rec: typeof paying) => {
    const built = buildInstrumentTerms(BRK, "securities", { fund: rec.id, tariff: "leumi" }, { fees: loadFees(), funds: [rec], deposits: [], rules: loadRules(), today: runDate });
    if (!("terms" in built)) throw new Error(built.missing.join("; "));
    return { terms: built.terms, run: runTimeline({ record, p05, terms: built.terms, feeValues: built.feeValues, rules: Object.values(loadRules()), runDate }, { entered: {}, age: null }) };
  };

  it("runs with its domicile and its form: a company's distribution is settled, with no reading label", () => {
    const { terms, run } = timeline(paying);
    expect(terms.fund).toMatchObject({ kind: "tase-foreign-fund", domicile: "ireland", legalStructure: "company" });
    expect(run.kind).toBe("ok");
    if (run.kind === "ok") expect(run.labels.some((l) => l.ruleId === "TXF-08")).toBe(false);
  });

  it("runs one whose form is not known on the site's reading of TXF-08", () => {
    const { legal_structure: _form, ...unknown } = paying;
    const { terms, run } = timeline(unknown);
    expect(terms.fund?.legalStructure).toBeUndefined();
    expect(run.kind).toBe("ok");
    if (run.kind === "ok") expect(run.labels).toContainEqual({ code: "reading", ruleId: "TXF-08" });
  });
});
