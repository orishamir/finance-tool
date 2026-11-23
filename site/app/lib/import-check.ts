// The per-field check of an import file: a holding or a guide input
// that fails the form's own rules is left out of the load and reported with its field, so a hand-edited file can never
// put "NaN שנים" or a negative amount on a page. Pure; the words are in copy.ts `r3transfer.rejected`.
import { valueObject } from "@finance-tool/schema";

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export type RejectedKind = "holding" | "input";
export type Problem = "structure" | "not-number" | "negative" | "over-100" | "date" | "wrapper" | "gain-over-balance";

export interface Rejected {
  kind: RejectedKind;
  /** 1-based place in the file's list, or the input's key. */
  at: number | string;
  /** The field's name in the file (`horizonYears`, `balance`, ...); `copy` maps it to a Hebrew name. */
  field: string;
  problem: Problem;
}

const nonNegative = (n: number): Problem | null => (n < 0 ? "negative" : null);
const percent = (n: number): Problem | null => (n < 0 ? "negative" : n > 100 ? "over-100" : null);

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
 * The state of an import file with every item that fails its check taken out, and one entry per rejection. The goals, the current goal
 * and the saved comparisons of an older file are not read, so they pass unchecked (`readState` leaves them out, and reads nothing of a
 * version 1 goals document). Only arrays and maps that are present are touched; anything else is left for `checkState`.
 */
export function sanitizeRawState(raw: unknown): { state: unknown; rejected: Rejected[] } {
  if (!isRec(raw)) return { state: raw, rejected: [] };
  const rejected: Rejected[] = [];
  const out: Rec = { ...raw };
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
  return { state: out, rejected };
}
