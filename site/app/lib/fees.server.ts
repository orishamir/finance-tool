// The data the fee page needs besides the comparison bundle (flows 20, 21, 27), built at build time and served
// as /fees-data.json: P-03, the rule records the page quotes and the caps read, the F-68 regulator reference of
// every provident-family class, the regulator's tracks in compact form (for ?track=), where P-05 sends each
// wrapper, whose tariff a securities wrapper uses, and the link-outs (D20). Server-only.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cmaPeriodFile, type ParameterRecord, type RuleRecord, type ValueObject } from "@finance-tool/schema";
import { latestTracks, type CmaTrack } from "@finance-tool/engine";
import { referenceOfClass } from "./class-reference";
import { classificationToWrapper, loadFees, loadParameters, loadRules, pointedRecords, root, today } from "./data.server";
import { compactFee } from "./value";
import type { FeesData, LinkOut, TrackLite } from "./fees";
import { classKey } from "./fees";

/** The rules the page quotes (negotiation, caps, references, link-outs) and the cap and run rules read. */
const quoted = ["PF-02", "PF-04", "PF-05", "PF-06", "PF-11", "PF-13", "PF-16", "PF-39", "PEN-21", "PEN-22", "KH-22", "KH-23", "MF-55", "MF-18", "MF-19", "ETF-17", "BRK-26", "BRK-33", "BRK-37", "CAT-35", "CAT-36", "CAT-37", "CAT-40", "BANK-32"];

function cmaFiles() {
  const dir = join(root, "data/cma");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => cmaPeriodFile.parse(JSON.parse(readFileSync(join(dir, f), "utf8"))));
}

/** A link written in an il-finance reference under a rule's heading, found by its link text. */
function linkFrom(file: string, heading: string, text: RegExp): LinkOut | null {
  const path = join(root, ".claude/skills/il-finance/references", file);
  if (!existsSync(path)) return null;
  const doc = readFileSync(path, "utf8");
  const start = doc.indexOf(`### ${heading}`);
  if (start < 0) return null;
  const end = doc.indexOf("\n### ", start + 5);
  const section = doc.slice(start, end < 0 ? undefined : end);
  for (const m of section.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) if (text.test(m[1]!) || text.test(m[2]!)) return { href: m[2]!, title: m[1]!, ruleId: heading.split(" ")[0]! };
  return null;
}

export function buildFeesData(): FeesData {
  const t = today();
  const parameters = loadParameters();
  const p03 = parameters.find((p) => (p as { method_id?: string }).method_id === "P-03") as ParameterRecord | undefined;
  if (!p03) throw new Error("data/parameters/ holds no P-03 record");
  const p05 = parameters.find((p) => (p as { method_id?: string }).method_id === "P-05") as ParameterRecord | undefined;
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  const allRules = loadRules();
  const rules: RuleRecord[] = quoted.map((id) => allRules[id]).filter((r): r is RuleRecord => !!r);

  const files = cmaFiles();
  const tracks: CmaTrack[] = latestTracks(files);
  const mapped = tracks.filter((x) => classificationToWrapper[x.fund_classification.trim()] != null);
  const keys = new Map<string, { fund_classification: string; specialization: string }>();
  for (const x of mapped) keys.set(classKey(x.fund_classification, x.specialization), { fund_classification: x.fund_classification.trim(), specialization: x.specialization.trim() });
  const references: FeesData["references"] = {};
  for (const [k, key] of keys) references[k] = referenceOfClass(mapped, key.fund_classification, key.specialization);

  const templates: FeesData["templates"] = {};
  const lite: TrackLite[] = [];
  for (const x of mapped) {
    const tpl = (templates[x.dataset] ??= { balance: { ...x.fees.avg_annual_management_fee } as ValueObject, deposit: { ...x.fees.avg_deposit_fee } as ValueObject });
    const company = x.managing_corporation;
    lite.push({
      id: x.fund_id,
      name: x.names.cma[0]!.trim(),
      company: company.name.trim(),
      companyId: company.legal_id,
      classification: x.fund_classification.trim(),
      specialization: x.specialization.trim(),
      wrapperId: classificationToWrapper[x.fund_classification.trim()] ?? null,
      dataset: x.dataset,
      period: x.report_period,
      b: compactFee(x.fees.avg_annual_management_fee, tpl.balance),
      d: compactFee(x.fees.avg_deposit_fee, tpl.deposit),
    });
  }

  const wrapperTrack: Record<string, number> = {};
  const tariffClass: Record<string, string> = {};
  const snapshots = new Map(loadFees().map((s) => [s.id, s]));
  const instruments = (p05.instruments ?? {}) as Record<string, { track?: number; tariff?: string }>;
  for (const [id, spec] of Object.entries(instruments)) {
    if (spec.track !== undefined) wrapperTrack[id] = spec.track;
    const snap = spec.tariff ? snapshots.get(spec.tariff) : undefined;
    if (snap) tariffClass[id] = (snap.provider as { class?: string }).class ?? "";
  }

  const links: FeesData["links"] = {
    boi: linkFrom("brokerage-account.md", "BRK-26", /FEES_DASH/),
    tase: linkFrom("brokerage-account.md", "BRK-37", /market\.tase\.co\.il|trading_fees/),
    isa: linkFrom("mutual-funds-and-money-market-funds.md", "MF-55", /Funds_Report2025/),
  };
  return { today: t, p03, rules, pointed: Object.values(pointedRecords(rules, allRules)), references, templates, tracks: lite, wrapperTrack, tariffClass, links };
}

let cached: FeesData | null = null;
export function feesData(): FeesData {
  return (cached ??= buildFeesData());
}
