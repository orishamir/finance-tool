// The data the holdings page, the fee page and the transfer page read besides the comparison bundle (flows 22 to 24, 26),
// built at build time and served as /holdings-bundle.json: the regulator's tracks per wrapper with their two fee
// averages (compact), the fit table (P-04), the rule texts the statement disclosure and the consolidation cards quote,
// the glossary's other spellings of the statement's terms, and the site and data ids the export file carries. Server-only.
import type { RuleRecord, WrapperId } from "@finance-tool/schema";
import { loadCma, loadCmaFees, loadRules, loadTerms, loadWrappers, today } from "./data.server";
import { fitTable } from "./compare.server";
import type { HoldingsBundle, HTrack, HWrapper } from "./holdings";
import { cmaFeeValue, compactFee, type SiteValue } from "./value";

/** The wrappers a holding can be, in the order of the sheet (flow 22): the provident family, the IRAs, then a child plan. */
const holdingWrappers: { id: WrapperId; kind: HWrapper["kind"]; name?: string }[] = [
  { id: "kupat-gemel-lehashkaa", kind: "provident" },
  { id: "keren-hishtalmut", kind: "provident" },
  { id: "pension-comprehensive", kind: "pension" },
  { id: "pension-general", kind: "pension" },
  { id: "provident-for-annuity", kind: "pension", name: "קופת גמל לקצבה" },
  { id: "ira-hishtalmut", kind: "ira" },
  { id: "ira-provident", kind: "ira" },
  { id: "child-savings-provident", kind: "child" },
  { id: "child-savings-bank", kind: "child" },
];

/** Rules the page quotes by id; every one that has a record is shipped with its text, the others render as a chip alone. */
const quotedRules = [
  "PF-12", "PF-22", "PF-26", "PF-33", "PF-34", "PF-35", "PF-36", "PF-37", "PF-38",
  "CS-07", "CS-12", "CS-18", "CS-20", "CS-21", "CS-26", "CS-27", "CAT-09",
  "PF-14", "PF-17", "PF-18", "PF-19", "SW-01", "SW-12", "SW-15", "SW-22", "SW-24", "SW-39", "TXK-04", "TXH-09", "TXH-19",
  "PF-02", "PF-04", "PF-05", "PF-06", "PEN-21", "PEN-22", "KH-22",
  "BANK-32", "BRK-37",
  // a study-fund payslip with an employer part above TXH-01's limit runs F-52 (2026-10-24): the rules that run reads
  "TXH-01", "TXH-02", "TXH-03", "TXH-08", "TXH-11", "TXG-02", "TXG-35",
  // the decision block of a liquid study fund (scenario fix 2026-10-24)
  "TXH-17", "TXH-18", "PF-23", "PF-18", "KH-14", "KH-15",
];

/** The glossary rows whose other spellings the statement disclosure lists (copy 7.2 "מילים שתפגשו"). */
const spellingRows: Record<keyof HoldingsBundle["spellings"], string[]> = {
  balanceFee: ["דמי ניהול מחיסכון"],
  depositFee: ["דמי ניהול מהפקדה"],
  balance: ["יתרה צבורה"],
  direct: ["הוצאות ישירות"],
};

function siteInfo(runDate: string, period: string, checked: string) {
  return { version: `r3-${runDate}`, data: `cma-${period}@${checked}` };
}

export function buildHoldingsBundle(): HoldingsBundle {
  const t = today();
  const cma = loadCma();
  const fees = loadCmaFees();
  const wrappers = loadWrappers();
  const rules = loadRules();

  const hw: HWrapper[] = holdingWrappers.map((h) => {
    const rec = wrappers.find((w) => w.id === h.id);
    if (!rec) throw new Error(`holdings bundle: no wrapper record ${h.id}`);
    return { id: h.id, kind: h.kind, name: h.name ?? rec.names.he[0]! };
  });

  const classifications: string[] = [];
  const companyIdx = new Map<string, number>();
  const companies: { id: string; name: string }[] = [];
  const templates: HoldingsBundle["fees"] = {};
  const tracks: HTrack[] = [];
  for (const tr of cma.tracks) {
    if (!tr.wrapperId || !holdingWrappers.some((h) => h.id === tr.wrapperId)) continue;
    const f = fees.get(tr.fundId)!;
    const tmpl = (templates[tr.dataset] ??= { balance: cmaFeeValue(f.balance, t), deposit: cmaFeeValue(f.deposit, t) });
    let k = classifications.indexOf(tr.classification);
    if (k < 0) k = classifications.push(tr.classification) - 1;
    let c = companyIdx.get(tr.companyId);
    if (c === undefined) {
      c = companies.push({ id: tr.companyId, name: tr.companyName }) - 1;
      companyIdx.set(tr.companyId, c);
    }
    tracks.push({
      id: tr.fundId,
      n: tr.name,
      c,
      w: tr.wrapperId,
      k,
      d: tr.dataset === "pensia-net" ? 1 : 0,
      s: tr.specialization,
      ss: tr.subSpecialization,
      fb: compactFee(f.balance, tmpl.balance),
      fd: compactFee(f.deposit, tmpl.deposit),
    });
  }

  // the rules: the quoted ones, every rule a holding wrapper's transfer routes cite, and what the cap lines cite
  const need = new Set<string>(quotedRules);
  for (const h of holdingWrappers) {
    const rec = wrappers.find((w) => w.id === h.id)!;
    for (const r of rec.transfer_routes) r.rule_ids.forEach((id) => need.add(id));
  }
  const shipped: RuleRecord[] = [...need].map((id) => rules[id]).filter((r): r is RuleRecord => !!r);

  const terms = loadTerms();
  // the glossary rows' other spellings: every variant of the rows with the term's name, without the name itself
  const spellings = Object.fromEntries(
    Object.entries(spellingRows).map(([key, names]) => [key, [...new Set(terms.filter((x) => names.includes(x.he)).flatMap((r) => r.variants))].filter((x) => !names.includes(x))]),
  ) as HoldingsBundle["spellings"];

  const newest = cma.files.map((f) => f.checked).sort().at(-1) ?? t;
  return {
    today: t,
    site: siteInfo(t, String(cma.periodValue.value), newest),
    period: cma.periodValue as SiteValue,
    fit: fitTable(),
    wrappers: hw,
    classifications,
    companies,
    tracks,
    fees: templates,
    rules: shipped,
    spellings,
  };
}

let cached: HoldingsBundle | null = null;
export function holdingsBundle(): HoldingsBundle {
  return (cached ??= buildHoldingsBundle());
}

/** Site and data ids for the export file, without the track list (the transfer page's loader). */
export function exportSiteInfo() {
  const t = today();
  const cma = loadCma();
  return siteInfo(t, String(cma.periodValue.value), cma.files.map((f) => f.checked).sort().at(-1) ?? t);
}
