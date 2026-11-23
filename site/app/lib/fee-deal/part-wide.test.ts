// A part applied to a head's cases (edits/cells.ts `partToCases`, lifted.ts's `cases` target): a trade's grid by what is bought and the
// channel, each case with its own maximum. Dropped on a row's head, on a column's head or on the fee's condition, the part goes into every
// case the head covers, replacing what each held there, and reads as one cell where the row's cases now hold it alike; the source keeps
// it, a figure keeps its source only where the case held that very figure, and one undo puts back every case.
import { describe, expect, it } from "vitest";
import { FIRST, noteToCases as noteTo, partToCases as partTo } from "./edits/cells";
import { liftDrop, liftTakes, liftWhy, type Lifted, type LiftTarget } from "./lifted";
import { layoutOf, WHOLE } from "./layout";
import { byRank, type Case, type CasesFee, type FeeDeal, type Num, type Price, type SlimFee } from "./model";
import type { Sourced } from "./core";
import { liftKept, undo } from "./undo";
import { feeDeal as copy } from "../../copy";

const src: Sourced = { url: "https://www.example.org/tariff.pdf", title: "Tariff", publisher: "Bank", strength: "institution", checked: "2026-10-01", effectiveFrom: "2026-01-01" };
const listed = (v: number): Num => ({ v, src });
const action = (rate: number, max?: Num): Price => ({ form: "action", rate: listed(rate), ...(max ? { max } : {}) });

/** מק״מ and shares, each on the web and at the branch; shares at the branch has no maximum, a fifth place no case holds. */
const trade = (): CasesFee => ({
  id: "fee-t",
  kind: "trade",
  by: [{ kind: "what", values: [] }, { kind: "channel", values: [] }],
  cases: [
    { id: "mw", when: [["makam"], ["direct"]], stages: [{ price: action(0.1, listed(6900)) }] },
    { id: "mb", when: [["makam"], ["branch"]], stages: [{ price: action(0.5, listed(7000)) }] },
    { id: "sw", when: [["tase"], ["direct"]], stages: [{ price: action(0.1, listed(6900)) }] },
    { id: "sb", when: [["tase"], ["branch"]], stages: [{ price: action(0.5) }] },
  ],
});
const custody = (): SlimFee => ({ id: "fee-c", kind: "custody", stages: [{ price: { form: "held", rate: listed(0.1), per: 12, every: 12 } }] });
const deal = (): FeeDeal => ({ id: "deal-w", name: "", kind: "brokerage-account", fees: [trade(), custody()] });
const feeOf = (d: FeeDeal) => d.fees[0] as CasesFee;
const caseOf = (f: CasesFee, id: string) => f.cases.find((c) => c.id === id)!;
const maxOf = (c: Case) => (c.stages[0]!.price as { max?: Num }).max;

/** The layout the page draws for a fee, each part keyed by its figure alone (a source shown apart, as the page's cell names it). */
const laid = (f: CasesFee) =>
  layoutOf({
    things: f.by.map(() => ({ range: false })),
    rows: ["price", "max"],
    cases: byRank(f.cases).map((c) => {
      const p = c.stages[0]!.price as { form: string; rate?: Num; max?: Num };
      return { id: c.id, when: c.when, parts: [{ row: "price", key: JSON.stringify([p.form, p.rate?.v]) }, ...(p.max ? [{ row: "max", key: String(p.max.v) }] : [])], ...(c.spans ? { spans: c.spans } : {}) };
    }),
  });

/** The edits, read back as the fee of cases they keep. */
const partToCases = (...a: Parameters<typeof partTo>) => partTo(...a) as CasesFee;
const noteToCases = (...a: Parameters<typeof noteTo>) => noteTo(...a) as CasesFee;

const names = { mw: "באינטרנט", mb: "בסניף", sw: "באינטרנט", sb: "בסניף" };
const head = (cases: string[], along: number): LiftTarget => ({ k: "cases", fee: "fee-t", cases, along, names });
const row = (w: "makam" | "tase") => head(w === "makam" ? ["mw", "mb"] : ["sw", "sb"], 1);
const branchColumn = head(["mb", "sb"], 0);
const every = head(["mw", "mb", "sw", "sb"], 1);
/** The maximum of מק״מ at the branch, lifted from the open case. */
const lifted: Lifted = { k: "part", fee: "fee-t", case: "mb", price: FIRST, row: "max" };

describe("a part applied to a head's cases", () => {
  it("replaces the part in every case of the row, so the row reads it as one cell, and leaves the other rows", () => {
    const f = partToCases(trade(), caseOf(trade(), "mb"), "max", ["mw", "mb"], 1, "mb");
    expect(["mw", "mb"].map((id) => maxOf(caseOf(f, id))?.v)).toEqual([7000, 7000]);
    expect(maxOf(caseOf(f, "sw"))?.v).toBe(6900);
    // each case keeps its own rate: only the maximum's row is applied
    expect((caseOf(f, "mw").stages[0]!.price as { rate: Num }).rate.v).toBe(0.1);
    const layout = laid(f as CasesFee);
    expect(layout.shape).toBe("grid");
    const makam = layout.shape === "grid" ? layout.rows.find((r) => r.cases.includes("mb"))! : null;
    expect(makam!.parts.find((p) => p.row === "max")!.cells).toEqual([expect.objectContaining({ from: 0, span: 2, cases: ["mw", "mb"] })]);
  });

  it("adds the part where a case has none, and keeps a source only where the case held that very figure from it", () => {
    const f = partToCases(trade(), caseOf(trade(), "mb"), "max", ["mb", "sb"], 0, "mb");
    // shares at the branch had no maximum: the copy is the person's
    expect(maxOf(caseOf(f, "sb"))).toEqual({ v: 7000 });
    const same = partToCases(trade(), caseOf(trade(), "mw"), "max", ["mw", "sw"], 0, "mw");
    // shares on the web held that very figure from that list: it keeps its source, and nothing changes
    expect(maxOf(caseOf(same, "sw"))).toEqual(listed(6900));
    expect(same).toEqual(trade());
  });

  it("leaves the source case as it was, and a fee whose source holds nothing in that row as it was", () => {
    const f = partToCases(trade(), caseOf(trade(), "mb"), "max", ["mw", "mb", "sw", "sb"], 1, "mb");
    expect(caseOf(f, "mb")).toEqual(caseOf(trade(), "mb"));
    const none = partToCases(trade(), caseOf(trade(), "sb"), "max", ["mw", "mb"], 1, "sb");
    expect(none).toEqual(trade());
  });

  it("covers only the cases a row holds: a place no case holds is not filled", () => {
    const three: CasesFee = { ...trade(), cases: trade().cases.filter((c) => c.id !== "sw") };
    const f = partToCases(three, caseOf(three, "mb"), "max", ["sb"], 1, "mb");
    expect(f.cases.map((c) => c.id)).toEqual(["mw", "mb", "sb"]);
    expect(maxOf(caseOf(f, "sb"))?.v).toBe(7000);
  });

  it("adds one note to every case of a head after its own, where it has it not yet", () => {
    const f = noteToCases(trade(), "partial", ["mw", "mb"]);
    expect(["mw", "mb", "sw"].map((id) => (caseOf(f, id).stages[0]!.price as { notes?: string[] }).notes)).toEqual([["partial"], ["partial"], undefined]);
    expect(noteToCases(f, "partial", ["mw"])).toBe(f);
  });
});

describe("a part dropped on a head", () => {
  it("on its own row's head: the source keeps it, the other case's own is replaced, and the undo line names it", () => {
    const r = liftDrop(deal(), lifted, row("makam"))!;
    expect(["mw", "mb"].map((id) => maxOf(caseOf(feeOf(r.deal), id))?.v)).toEqual([7000, 7000]);
    expect(r.kept).toEqual({ feeId: "fee-t", words: copy.cases.lifted.replacedIn.replace("{where}", "באינטרנט").replace("{what}", copy.cases.rowHeads.max!) });
  });

  it("one undo puts back every case it changed", () => {
    const r = liftDrop(deal(), lifted, every)!;
    expect(feeOf(r.deal).cases.map((c) => maxOf(c)?.v)).toEqual([7000, 7000, 7000, 7000]);
    expect(r.kept!.words).toBe(copy.cases.lifted.replacedIn.replace("{where}", "באינטרנט, באינטרנט").replace("{what}", copy.cases.rowHeads.max!));
    const kept = liftKept(deal(), r, null);
    expect(undo(kept.deal, kept.undo!, null)!.deal).toEqual(deal());
  });

  it("on a column's head that adds it where it was missing: no undo line, since nothing the person gave was replaced", () => {
    const r = liftDrop(deal(), lifted, branchColumn)!;
    expect(maxOf(caseOf(feeOf(r.deal), "sb"))?.v).toBe(7000);
    expect(r.kept).toBeUndefined();
  });

  it("on another row's head: it moves there, leaving its own case, or stays there too with the modifier held", () => {
    const moved = feeOf(liftDrop(deal(), lifted, row("tase"))!.deal);
    expect(["sw", "sb", "mb"].map((id) => maxOf(caseOf(moved, id))?.v)).toEqual([7000, 7000, undefined]);
    const copied = feeOf(liftDrop(deal(), lifted, row("tase"), { copy: true })!.deal);
    expect(maxOf(caseOf(copied, "mb"))?.v).toBe(7000);
  });

  it("a stretched part cell dropped on the fee's condition goes into every case", () => {
    const cell: Lifted = { k: "cell", fee: "fee-t", cases: ["mw", "sw"], row: "max", along: 1 };
    const r = liftDrop(deal(), cell, every)!;
    expect(feeOf(r.deal).cases.map((c) => maxOf(c)?.v)).toEqual([6900, 6900, 6900, 6900]);
  });

  it("is refused where nothing would change, and for a whole case", () => {
    const on = liftDrop(deal(), lifted, row("makam"))!.deal;
    expect(liftTakes(on, lifted, row("makam"))).toBe(false);
    expect(liftTakes(deal(), { k: "cell", fee: "fee-t", cases: ["mb"], row: WHOLE, along: 1 }, row("tase"))).toBe(false);
  });

  it("from another fee whose part the fee's kind does not take: the head does not light, and says why", () => {
    const rate: Lifted = { k: "part", fee: "fee-c", case: null, price: FIRST, row: "price" };
    const on = head(["mw", "mb"], 1);
    expect(liftTakes(deal(), rate, on)).toBe(false);
    expect(liftWhy(deal(), rate, on)).toBe(copy.cases.lifted.notHere);
  });
});

describe("a sum carries its own currency wherever it goes", () => {
  /** The trade fee with a row abroad priced in dollars: on the web with a minimum in dollars, at the branch with no other sum. */
  const abroad = (): FeeDeal => {
    const t = trade();
    const usd = (rate: number, min?: number): Price => ({ form: "action", rate: listed(rate), ...(min !== undefined ? { min: listed(min) } : {}), currency: "USD" });
    t.cases.push({ id: "fw", when: [["abroad"], ["direct"]], stages: [{ price: usd(0.25, 39) }] }, { id: "fb", when: [["abroad"], ["branch"]], stages: [{ price: usd(0.85) }] });
    return { ...deal(), fees: [t, custody()] };
  };
  const priceOf = (d: FeeDeal, id: string) => caseOf(feeOf(d), id).stages[0]!.price as { max?: Num; min?: Num; currency?: string };
  const onto = (id: string): LiftTarget => ({ k: "case", fee: "fee-t", case: id });
  const abroadRow: LiftTarget = { k: "cases", fee: "fee-t", cases: ["fw", "fb"], along: 1, names: { fw: "באינטרנט", fb: "בסניף" } };

  it("a ₪ maximum onto a ₪ case stays in shekels", () => {
    const r = liftDrop(abroad(), lifted, onto("mw"))!;
    expect(priceOf(r.deal, "mw").max?.v).toBe(7000);
    expect(priceOf(r.deal, "mw").currency).toBeUndefined();
  });

  it("a ₪ maximum onto a $ case that keeps no other sum stays in shekels, the case's sums now counted in them", () => {
    const r = liftDrop(abroad(), lifted, onto("fb"))!;
    expect(priceOf(r.deal, "fb").max?.v).toBe(7000);
    expect(priceOf(r.deal, "fb").currency).toBeUndefined();
  });

  it("a ₪ maximum onto a $ case whose minimum is in dollars is refused, and the place says why", () => {
    expect(liftTakes(abroad(), lifted, onto("fw"))).toBe(false);
    const w = copy.cases.lifted.currency;
    expect(liftWhy(abroad(), lifted, onto("fw"))).toBe(`${w.clash.replace("{moved}", w.sumOf.max!).replace("{from}", w.sumIn.ILS!).replace("{other}", w.sumOf.min!).replace("{here}", w.sumIn.USD!)}.`);
    // a copy is refused alike, and the price there is as it was
    expect(liftDrop(abroad(), lifted, onto("fw"), { copy: true })).toBeNull();
  });

  it("a head over both kinds takes it where it can and names the case it left out, with why", () => {
    const r = liftDrop(abroad(), lifted, abroadRow, { copy: true })!;
    expect(priceOf(r.deal, "fb").max?.v).toBe(7000);
    expect(priceOf(r.deal, "fw")).toEqual(priceOf(abroad(), "fw"));
    expect(priceOf(r.deal, "fw").currency).toBe("USD");
    const w = copy.cases.lifted.currency;
    expect(r.kept!.words).toBe(w.leftOut.replace("{where}", "באינטרנט").replace("{why}", "המקסימום בשקלים והמינימום כאן בדולרים"));
    // where every case of the head is left out, it takes nothing and says why
    const fwOnly: LiftTarget = { ...abroadRow, cases: ["fw"] };
    expect(liftTakes(abroad(), lifted, fwOnly)).toBe(false);
    expect(liftWhy(abroad(), lifted, fwOnly)).toBe("המקסימום בשקלים והמינימום כאן בדולרים.");
  });

  it("a $ minimum stretched over a ₪ case that keeps a ₪ maximum is refused there too", () => {
    const min: Lifted = { k: "part", fee: "fee-t", case: "fw", price: FIRST, row: "min" };
    expect(liftTakes(abroad(), min, onto("mb"))).toBe(false);
    expect(liftWhy(abroad(), min, onto("mb"))).toBe("המינימום בדולרים והמקסימום כאן בשקלים.");
  });
});
