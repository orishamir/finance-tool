// 2026-11-07 (independent check): the fee page asked a pension fund for a field it did not have, named "one of the values" when
// employment was missing, and the guides linked to fee pages that could only say "no record" or "check what you entered" to someone
// who had entered nothing. Every wrapper the fee page answers for is run with no inputs, with typical ones and with each field it
// requires left out: the page ends in a result, or names a field it offers, or says what would make a result; never a generic line.
import { describe, expect, it } from "vitest";
import { compareBundle } from "./compare.server";
import { feesData } from "./fees.server";
import { buildFees, feeInputs, feePageAnswers, needFieldOf, pageFields, subjectWrapperId, type FeesResult, type PageFields } from "./fees";
import { loadProducts } from "./data.server";
import { omitsSection } from "./guide-nav";
import type { InputsState } from "./inputs";

const bundle = compareBundle();
const data = feesData();
const run = (id: string, state: InputsState): FeesResult => buildFees(bundle, data, { kind: "wrapper", wrapperId: id, from: "guide" }, feeInputs(bundle, null, state));
const none: InputsState = { entered: {}, age: null, employment: null, insurance: null };
// a person's typical entries: every field the page offers filled (the insurance share is entered, A-17 has no default)
const typical: InputsState = { entered: {}, age: 40, employment: "employee", insurance: 0.3 };

/** The fields the page offers for a wrapper: a field it names must be one of them. */
const offered = (f: PageFields) => [...(f.age ? ["age"] : []), ...(f.employment ? ["employment"] : []), ...(f.insurance ? ["insurance"] : [])];

/** A message that names its reason and a way on, or a result: never the generic failure, "no record" or "not found". */
function expectAnswer(id: string, r: FeesResult, f: PageFields, label: string) {
  const where = `${id}, ${label}`;
  if (r.kind === "error") {
    expect(["no-terms", "no-wrapper", "no-run", "no-fee"], `${where}: ${JSON.stringify(r.error)}`).not.toContain(r.error.kind);
    if (r.error.kind === "need-input") expect(offered(f), `${where}: names ${r.error.field}`).toContain(r.error.field);
  }
}

const answered = bundle.wrappers.filter((w) => feePageAnswers(bundle, w.id)).map((w) => w.id);

describe("the fee page never ends in a dead end", () => {
  it("answers for the wrappers with fee terms", () => {
    expect(answered.length).toBeGreaterThan(5);
    expect(answered).toEqual(expect.arrayContaining(["pension-comprehensive", "pension-general", "provident-for-annuity", "money-market-fund-renewable"]));
  });
  for (const id of answered) {
    it(`${id}: with no inputs, typical inputs and each required field left out`, () => {
      const f = pageFields(bundle, id);
      expectAnswer(id, run(id, none), f, "no inputs");
      const full = run(id, typical);
      expectAnswer(id, full, f, "typical");
      // with every field entered the only thing left between the person and a result is a monthly deposit G-30 has no run for
      if (full.kind === "error") {
        expect(full.error.kind, id).toBe("monthly-not-run");
        expect(run(id, { ...typical, entered: { monthly_deposit: 0 } }).kind, `${id} with no monthly deposit`).toBe("ok");
      }
      const required = { age: f.age === "required", employment: f.employment === "required", insurance: f.insurance === "required" };
      for (const [field, need] of Object.entries(required)) {
        if (!need) continue;
        const r = run(id, { ...typical, [field]: null, entered: { monthly_deposit: 0 } });
        expect(r.kind === "error" && r.error.kind === "need-input" ? r.error.field : r.kind, `${id} without ${field}`).toBe(field);
      }
      // a field marked optional is optional: left out, the page still has a result
      for (const field of ["age", "employment"] as const) {
        if (f[field] !== "optional") continue;
        expect(run(id, { ...typical, [field]: null, entered: { monthly_deposit: 0 } }).kind, `${id} without ${field}`).toBe("ok");
      }
    });
  }
});

describe("a guide links to the fee page only where it answers", () => {
  const guides = loadProducts().filter((p) => !omitsSection(p.id, "cost")).map((p) => p.id);
  it("every guide link ends in a result or a named way to one", () => {
    for (const id of guides.filter((g) => feePageAnswers(bundle, g))) for (const [label, s] of [["no inputs", none], ["typical", typical]] as const) expectAnswer(id, run(id, s), pageFields(bundle, id), label);
  });
  it("a guide without the link is one whose fee page has no terms to run on", () => {
    for (const id of guides.filter((g) => !feePageAnswers(bundle, g))) {
      const r = run(id, typical);
      expect(r.kind === "error" ? r.error.kind : r.kind, id).toBe("no-terms");
    }
  });
});

describe("a track's fee page offers the fields its run asks for", () => {
  // the sheet's fields come from the track's wrapper even when the run stops (2026-11-07, independent check: a pension track's page
  // named the insurance share, and its sheet showed inflation alone); the track page links here only where the wrapper has terms
  for (const id of answered) {
    const tracks = data.tracks.filter((t) => t.wrapperId === id && t.b.value !== null && t.b.value >= 0).slice(0, 2);
    if (tracks.length === 0) continue;
    it(`${id}: its tracks, with no inputs and typical ones`, () => {
      for (const t of tracks) {
        const subject = { kind: "track" as const, trackId: t.id };
        const f = pageFields(bundle, subjectWrapperId(subject, data, null));
        expect(f, `track ${t.id}`).toEqual(pageFields(bundle, id));
        for (const [label, s] of [["no inputs", none], ["typical", typical]] as const) expectAnswer(`${id} track ${t.id}`, buildFees(bundle, data, subject, feeInputs(bundle, null, s)), f, label);
      }
    });
  }
  it("a holding's page asks for nothing its run does without", () => {
    for (const id of ["pension-comprehensive", "pension-general", "provident-for-annuity"]) expect(Object.values(pageFields(bundle, id, true))).not.toContain("required");
  });
});

describe("every field the page offers changes what it shows (guidelines/design.md)", () => {
  const total = (r: FeesResult) => (r.kind === "ok" ? (r.analysis.total.value as number) : null);
  for (const id of answered.filter((w) => pageFields(bundle, w).insurance)) {
    it(`${id}: the insurance share moves the fees' cost`, () => {
      const low = total(run(id, { ...typical, insurance: 0.1 }));
      const high = total(run(id, { ...typical, insurance: 2 }));
      expect(low).not.toBeNull();
      expect(high).not.toBe(low);
    });
  }
});

describe("a missing input is named as its field", () => {
  it("reads the comparison's own field first, then the engine's detail", () => {
    expect(needFieldOf("instrument.pension is missing: the pension run for pension-comprehensive needs it")).toBe("employment");
    expect(needFieldOf("instrument.pension is missing: the pension run for pension-comprehensive needs it", "salary")).toBe("salary");
    expect(needFieldOf("instrument.hishtalmut is missing: the provident run for keren-hishtalmut needs it")).toBe("employment");
    expect(needFieldOf("instrument.insurance is missing: pension-general needs the insurance cost A-17 (entered by the person, G-12)")).toBe("insurance");
    expect(needFieldOf("profile.ageAtStart")).toBe("age");
    expect(needFieldOf("profile.annualIncome is missing: a self-employed study fund's deduction (TXH-05, F-30) needs the person's income")).toBe("salary");
    expect(needFieldOf("A-01")).toBe("return");
    expect(needFieldOf("something else")).toBeNull();
  });
});
