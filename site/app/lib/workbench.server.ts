// Builds the track workbench of one wrapper at build time (flows 25, design-spec 14): the engine's F-64 over the
// latest CMA period, shaped compactly for the page. Server-only.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { latestTracks, trackWorkbench, type WorkbenchReferences } from "@finance-tool/engine";
import { referenceOfClass } from "./class-reference";
import { cmaPeriodFile, type CmaPeriodFile, type ValueObject, type WrapperId } from "@finance-tool/schema";
import { classificationToWrapper, loadCma, loadWrappers, root, today } from "./data.server";
import { fitTable } from "./compare.server";
import { institutionCompanies, loadCatalog, resolutionOf } from "./instruments.server";
import { staleCma, cmaFeeValue, compactFee, feeYear, type SiteValue } from "./value";
import { NO_CLASS, type Resolution, type WbData, type WbReference, type WbRow } from "./workbench";
import { readParsedCached } from "./read-cache.server";

let files: CmaPeriodFile[] | null = null;
function cmaFiles(): CmaPeriodFile[] {
  if (!files) {
    const dir = join(root, "data/cma");
    files = readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => readParsedCached(join(dir, f), cmaPeriodFile));
  }
  return files;
}

const references: WorkbenchReferences = { classificationToWrapper };
const GENERAL = "כלל האוכלוסיה";

/** The wrappers that have tracks in the latest CMA period: the pages the build prerenders. */
export function workbenchWrapperIds(): WrapperId[] {
  return [...new Set(loadCma().tracks.map((t) => t.wrapperId).filter((w): w is WrapperId => w !== null))];
}

export function buildWorkbench(wrapperId: string): WbData | null {
  const cma = loadCma();
  const wb = trackWorkbench(wrapperId as WrapperId, cmaFiles(), undefined, { table: [] }, references);
  if (wb.rows.length === 0) return null;
  const t = today();
  const wrapper = loadWrappers().find((w) => w.id === wrapperId);
  const first = wb.rows[0]!;
  const dataset = first.dataset;
  const file = cma.files.find((f) => f.dataset === dataset)!;

  // companies that have a track here, in the companies list's order
  const companyIds = new Set(wb.rows.map((r) => r.companyId));
  const companies = cma.companies.filter((c) => companyIds.has(c.id)).map((c) => ({ id: c.id, name: c.name }));
  const companyIndex = new Map(companies.map((c, i) => [c.id, i]));

  // the catalogue: default tags and the resolution of same-name tracks
  const catalog = loadCatalog();
  const owner = institutionCompanies(catalog, cma.tracks);
  const defaultIds = new Set(catalog.filter((c) => c.default_at_joining).flatMap((c) => c.maps_to.track_ids.map((id) => `${owner.get(c.institution)}:${id}`)));
  const known = new Map<string, { name: string; trackIds: number[]; resolution: Resolution }[]>();
  for (const c of catalog) {
    const companyId = owner.get(c.institution);
    if (!companyId) continue;
    for (const d of c.near_duplicates) {
      const resolution = resolutionOf(d.resolution);
      if (resolution) known.set(companyId, [...(known.get(companyId) ?? []), { name: d.name, trackIds: d.track_ids, resolution }]);
    }
  }

  // the fee templates: the source, dates and rule ids are the same on every track of a dataset
  const pickFee = (pick: (r: (typeof wb.rows)[number]) => ValueObject) => pick(wb.rows.find((r) => pick(r).value !== null) ?? first);
  const balance = cmaFeeValue(pickFee((r) => r.fees.management), t);
  const deposit = cmaFeeValue(pickFee((r) => r.fees.deposit), t);
  const year = feeYear(balance);

  const dupIndex = new Map<string, number>();
  const dups: { resolution: Resolution }[] = [];
  for (const g of wb.groups) {
    const ids = new Set(g.fundIds);
    const given = known.get(g.companyId)?.find((k) => k.name === g.name && (k.trackIds.length === 0 || k.trackIds.some((id) => ids.has(id))));
    dupIndex.set(g.id, dups.length);
    dups.push({ resolution: given?.resolution ?? "distinct" });
  }

  const rows: WbRow[] = wb.rows.map((r) => {
    const row: WbRow = {
      f: r.fundId,
      c: companyIndex.get(r.companyId)!,
      n: r.name,
      sp: r.specialization,
      sub: r.subSpecialization,
      pop: r.targetPopulation && r.targetPopulation !== GENERAL ? r.targetPopulation : "",
      b: compactFee(r.fees.management, balance),
      d: compactFee(r.fees.deposit, deposit),
    };
    if (defaultIds.has(`${r.companyId}:${r.fundId}`)) row.def = 1;
    if (r.groupId !== null) row.dup = dupIndex.get(r.groupId);
    return row;
  });

  // one reference per class (SPECIALIZATION within this wrapper's product type)
  const refs: Record<string, WbReference> = {};
  const latest = latestTracks(cmaFiles());
  for (const r of wb.rows) {
    if (refs[r.specialization] || !("management" in r.reference)) continue;
    // the same call as the fee page and the holdings card (class-reference.ts): the latest-period tracks, one trimmed class key
    const ref = referenceOfClass(latest, r.classification, r.specialization);
    refs[r.specialization] = {
      tracks: ref.tracksInClass,
      management: { count: ref.management.count, mean: ref.management.mean.value as number | null, median: ref.management.median.value as number | null },
      deposit: { count: ref.deposit.count, mean: ref.deposit.mean.value as number | null, median: ref.deposit.median.value as number | null },
    };
  }
  const firstRef = wb.rows.map((r) => r.reference).find((x) => "management" in x);
  const refPeriod = firstRef && "management" in firstRef ? firstRef.period : null;
  const refValue = firstRef && "management" in firstRef ? firstRef.management.mean : null;

  const sizes = new Map<string, number>();
  for (const r of rows) sizes.set(r.sp, (sizes.get(r.sp) ?? 0) + 1);
  const groups = [...sizes].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || (a.key === NO_CLASS ? 1 : b.key === NO_CLASS ? -1 : a.key.localeCompare(b.key, "he")));

  const periodValue: SiteValue = {
    value: file.period,
    unit: "text",
    source: file.source,
    checked: file.checked,
    effective_from: file.period + "-01",
    effective_to: null,
    update_rule: "market",
    state: "sourced",
    stale: staleCma(file.period, t),
    notes: "",
  };
  return {
    wrapperId,
    wrapperName: wrapper?.names.he[0] ?? first.classification,
    classification: first.classification,
    dataset,
    today: t,
    period: periodValue,
    feeYear: year ? { ...balance, value: year, unit: "text", notes: "" } : null,
    feeTemplate: { balance, deposit },
    referenceMeta: { period: refPeriod, checked: refValue?.checked ?? file.checked, ruleIds: refValue?.rule_ids ? [...refValue.rule_ids] : [] },
    companies,
    rows,
    dups,
    groups,
    references: refs,
    fit: fitTable(),
    stale: periodValue.stale ?? null,
    engine: { considered: wb.coverage.considered, grouped: wb.coverage.grouped, feeNotReported: wb.coverage.feeNotReported, depositNotReported: wb.coverage.depositFeeNotReported, ok: wb.coverage.invariant.ok },
  };
}
