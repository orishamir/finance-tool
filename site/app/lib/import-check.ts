// The per-field check of an import file (audit 2026-10-24, A33): a goal, a holding, a saved comparison or a guide input
// that fails the form's own rules is left out of the load and reported with its field, so a hand-edited file can never
// put "NaN שנים" or a negative amount on a page. Pure; the words are in copy.ts `r3transfer.rejected`.
import { valueObject } from "@finance-tool/schema";
import { HORIZON_MAX, HORIZON_MIN } from "./goal-limits";

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export type RejectedKind = "goal" | "holding" | "comparison" | "input";
export type Problem = "structure" | "not-number" | "negative" | "over-100" | "years" | "age" | "date" | "wrapper" | "gain-over-balance";

export interface Rejected {
  kind: RejectedKind;
  /** 1-based place in the file's list, or the input's key. */
  at: number | string;
  /** The field's name in the file (`horizonYears`, `balance`, ...); `copy` maps it to a Hebrew name. */
  field: string;
  problem: Problem;
}

const AGE_MIN = 15;
const AGE_MAX = 100;

/** A goal's `NumField`: `{ value: number | null, entered: boolean }`; `v` is already known to be an object. */
function numField(v: Rec, rule: (n: number) => Problem | null): Problem | null {
  if (v.value === null || v.value === undefined) return null;
  if (!finite(v.value)) return "not-number";
  return rule(v.value);
}

const nonNegative = (n: number): Problem | null => (n < 0 ? "negative" : null);
const percent = (n: number): Problem | null => (n < 0 ? "negative" : n > 100 ? "over-100" : null);
const years = (n: number): Problem | null => (!Number.isInteger(n) || n < HORIZON_MIN || n > HORIZON_MAX ? "years" : null);

/** The first problem of a goal as `{field, problem}`, or null. */
export function goalProblem(g: unknown): { field: string; problem: Problem } | null {
  if (!isRec(g)) return { field: "goal", problem: "structure" };
  if (typeof g.id !== "string" || typeof g.preset !== "string") return { field: "id", problem: "structure" };
  if (!isRec(g.profile)) return { field: "profile", problem: "structure" };
  if (!isRec(g.assumptions)) return { field: "assumptions", problem: "structure" };
  for (const [f, rule] of [["horizonYears", years], ["amountNow", nonNegative], ["monthly", nonNegative], ["available", nonNegative]] as const) {
    if (!isRec(g[f])) return { field: f, problem: "structure" };
    const r = numField(g[f] as Rec, rule);
    if (r) return { field: f, problem: r };
  }
  if (g.name !== undefined && typeof g.name !== "string") return { field: "name", problem: "structure" };
  const p = g.profile;
  if (p.age !== null && p.age !== undefined && (!finite(p.age) || p.age < AGE_MIN || p.age > AGE_MAX)) return { field: "age", problem: finite(p.age) ? "age" : "not-number" };
  if (p.salary !== null && p.salary !== undefined && (!finite(p.salary) || p.salary < 0)) return { field: "salary", problem: finite(p.salary) ? "negative" : "not-number" };
  for (const [name, pair] of [["pension", p.pension], ["hishtalmut", p.hishtalmut]] as const) {
    if (pair === undefined) continue;
    if (!isRec(pair)) return { field: name, problem: "structure" };
    for (const side of ["employer", "employee"] as const) {
      const v = pair[side];
      if (v !== null && v !== undefined && (!finite(v) || v < 0 || v > 100)) return { field: name, problem: !finite(v) ? "not-number" : v < 0 ? "negative" : "over-100" };
    }
  }
  const y = isRec(p.hishtalmut) ? p.hishtalmut.yearly : undefined;
  if (y !== null && y !== undefined && (!finite(y) || y < 0)) return { field: "hishtalmutYearly", problem: finite(y) ? "negative" : "not-number" };
  const a = g.assumptions;
  for (const f of ["return", "inflation"] as const) {
    const v = a[f];
    if (v !== null && v !== undefined && (!finite(v) || v < -100 || v > 100)) return { field: f, problem: !finite(v) ? "not-number" : "over-100" };
  }
  for (const f of ["insurance", "acceptedFall"] as const) {
    const v = a[f];
    if (v !== null && v !== undefined && (!finite(v) || v < 0 || v > 100)) return { field: f, problem: !finite(v) ? "not-number" : v < 0 ? "negative" : "over-100" };
  }
  if (g.exposures !== undefined) {
    if (!isRec(g.exposures)) return { field: "exposures", problem: "structure" };
    for (const inputs of Object.values(g.exposures)) {
      if (!isRec(inputs)) return { field: "exposures", problem: "structure" };
      for (const f of ["return", "worstFall", "acceptedFall"] as const) {
        const v = inputs[f];
        if (v === undefined) continue;
        const r = valueObject.safeParse(v);
        if (!r.success) return { field: "exposures", problem: "structure" };
        if (typeof r.data.value !== "number" || !Number.isFinite(r.data.value)) return { field: "exposures", problem: "not-number" };
      }
    }
  }
  return null;
}

const voNumber = (v: unknown): { ok: true; n: number } | { ok: false; problem: Problem } => {
  const r = valueObject.safeParse(v);
  if (!r.success) return { ok: false, problem: "structure" };
  if (typeof r.data.value !== "number" || !Number.isFinite(r.data.value)) return { ok: false, problem: "not-number" };
  return { ok: true, n: r.data.value };
};

const isDate = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

const WRAPPERS = new Set(["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity", "ira-hishtalmut", "ira-provident", "child-savings-provident", "child-savings-bank"]);

/** The first problem of a holding (the sheet's `checkDraft` rules: balance at least zero, percents 0 to 100, dates as dates), or null. */
export function holdingProblem(h: unknown): { field: string; problem: Problem } | null {
  if (!isRec(h)) return { field: "holding", problem: "structure" };
  if (typeof h.id !== "string") return { field: "id", problem: "structure" };
  if (typeof h.wrapperId !== "string" || !WRAPPERS.has(h.wrapperId)) return { field: "wrapperId", problem: "wrapper" };
  if (!isRec(h.company) || typeof h.company.name !== "string") return { field: "company", problem: "structure" };
  if (!finite(h.order)) return { field: "order", problem: "not-number" };
  if (h.track !== undefined && !(isRec(h.track) && finite(h.track.fundId) && typeof h.track.name === "string")) return { field: "track", problem: "structure" };
  const get = (f: string): number | null | "bad" => {
    if (h[f] === undefined) return null;
    const r = voNumber(h[f]);
    return r.ok ? r.n : "bad";
  };
  for (const f of ["balance", "statementDate"]) if (h[f] === undefined) return { field: f, problem: "structure" };
  const money: [string, (n: number) => Problem | null][] = [["balance", nonNegative], ["directExpenses", percent], ["feeBalance", percent], ["feeDeposit", percent], ["monthlyOwn", nonNegative], ["monthlyEmployer", nonNegative], ["embeddedGain", nonNegative]];
  const got: Record<string, number | null> = {};
  for (const [f, rule] of money) {
    const v = get(f);
    if (v === "bad") return { field: f, problem: voNumber(h[f]).ok ? "structure" : (voNumber(h[f]) as { problem: Problem }).problem };
    got[f] = v;
    if (v !== null) {
      const p = rule(v);
      if (p) return { field: f, problem: p };
    }
  }
  if (got.balance === null) return { field: "balance", problem: "structure" };
  if (got.embeddedGain !== null && got.embeddedGain! > got.balance!) return { field: "embeddedGain", problem: "gain-over-balance" };
  for (const f of ["statementDate", "firstDeposit"]) {
    if (h[f] === undefined) continue;
    const r = valueObject.safeParse(h[f]);
    if (!r.success) return { field: f, problem: "structure" };
    if (!isDate(r.data.value)) return { field: f, problem: "date" };
  }
  return null;
}

/** A guide input (`inputs.<key>`): a value object with a finite number or a text. */
export function inputProblem(v: unknown): Problem | null {
  const r = valueObject.safeParse(v);
  if (!r.success) return "structure";
  if (r.data.unit !== "text" && r.data.unit !== "boolean" && !finite(r.data.value)) return "not-number";
  return null;
}

/**
 * The state of an import file with every item that fails its check taken out, and one entry per rejection. A saved
 * comparison goes when its own goal copy fails, or when its goal was rejected. Only arrays and maps that are present
 * are touched; anything else is left for `checkState`.
 */
export function sanitizeRawState(raw: unknown): { state: unknown; rejected: Rejected[] } {
  if (!isRec(raw)) return { state: raw, rejected: [] };
  const rejected: Rejected[] = [];
  const out: Rec = { ...raw };
  const goalIds = new Set<string>();
  if (Array.isArray(raw.goals)) {
    out.goals = raw.goals.filter((g, i) => {
      const p = goalProblem(g);
      if (p) {
        rejected.push({ kind: "goal", at: i + 1, ...p });
        return false;
      }
      goalIds.add((g as Rec).id as string);
      return true;
    });
    if (typeof raw.currentId === "string" && !goalIds.has(raw.currentId)) delete out.currentId;
  }
  if (Array.isArray(raw.holdings)) {
    out.holdings = raw.holdings.filter((h, i) => {
      const p = holdingProblem(h);
      if (p) rejected.push({ kind: "holding", at: i + 1, ...p });
      return !p;
    });
  }
  if (isRec(raw.inputs)) {
    out.inputs = Object.fromEntries(
      Object.entries(raw.inputs).filter(([k, v]) => {
        const p = inputProblem(v);
        if (p) rejected.push({ kind: "input", at: k, field: k, problem: p });
        return !p;
      }),
    );
  }
  if (Array.isArray(raw.savedComparisons)) {
    out.savedComparisons = raw.savedComparisons.filter((c, i) => {
      if (!isRec(c)) return true; // kept as it is (an unreadable record), checked by `checkState`
      if (typeof c.goalId === "string" && Array.isArray(raw.goals) && !goalIds.has(c.goalId)) return false; // its goal is gone or was rejected
      if (c.goal !== undefined) {
        const p = goalProblem(c.goal);
        if (p) {
          rejected.push({ kind: "comparison", at: i + 1, ...p });
          return false;
        }
      }
      return true;
    });
  }
  return { state: out, rejected };
}
