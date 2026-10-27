// The brands (founder, 2026-10-26, D33): the companies of one group shown as one company under the name people know it by. One page
// holds every product of every member (the managing company's tracks, the brokerage account, the funds its fund manager runs), each
// under its own heading, and every member's old address shows that page. Server-only; the table is data/sources/brands.json.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { brandsTable, institutionsTable, type ExposureRecord, type FundRecord, type InstitutionRegistryRow } from "@finance-tool/schema";
import { brands as brandsCopy } from "../copy";
import { refOfExposure } from "./invest";
import { fundLabels, type Label } from "./labels";
import { loadCma, root } from "./data.server";
import { loadExposures, loadFunds } from "./instruments.server";
import { ownBy, type SiteValue } from "./value";
import { readParsedCached, readJsonCached } from "./read-cache.server";

export interface Brand {
  id: string;
  name: string;
  members: InstitutionRegistryRow[];
  fundManagers: string[];
  /** The managing company's CMA id, when one member is in the CMA data: its tracks' addresses stay `/companies/<cma>/<fund>`. */
  cmaId: string | null;
  /** The fee snapshot of the member that runs a brokerage account (a broker or a foreign broker). */
  brokerId: string | null;
  /** The address the companies list and every link use: the CMA id, else the broker's snapshot id, else the brand's id. */
  page: string;
  /** Every address that shows the page: the canonical one, the brand's id, and each member's CMA id and snapshot or deposit id. */
  pageIds: string[];
}

let cache: Brand[] | null = null;

export function loadBrands(): Brand[] {
  if (cache) return cache;
  const path = join(root, "data/sources/brands.json");
  if (!existsSync(path)) return (cache = []);
  const registry = new Map(institutionsRegistry().map((r) => [r.id, r]));
  const cmaIds = new Set(loadCma().companies.map((c) => c.id));
  const brokers = brokerSnapshotIds();
  cache = readParsedCached(path, brandsTable).map((b) => {
    const members = b.members.map((m) => registry.get(m)).filter((r): r is InstitutionRegistryRow => !!r);
    const cmaId = members.map((m) => m.cma_legal_id).find((id): id is string => !!id && cmaIds.has(id)) ?? null;
    const brokerId = members.map((m) => m.fees_id).find((id): id is string => !!id && brokers.has(id)) ?? null;
    const page = cmaId ?? brokerId ?? b.id;
    const pageIds = [...new Set([page, b.id, ...members.flatMap((m) => [m.cma_legal_id, m.fees_id, m.deposit_bank_id]).filter((x): x is string => !!x)])];
    return { id: b.id, name: b.name_he, members, fundManagers: b.fund_managers, cmaId, brokerId, page, pageIds };
  });
  return cache;
}

/** The brand an address belongs to, if any. */
export function brandOfPage(id: string): Brand | undefined {
  return loadBrands().find((b) => b.pageIds.includes(id));
}

/** The brand a registry company is a member of. */
export function brandOfMember(registryId: string): Brand | undefined {
  return loadBrands().find((b) => b.members.some((m) => m.id === registryId));
}

function institutionsRegistry(): InstitutionRegistryRow[] {
  // read here rather than from institutions.server, which imports this module
  return readParsedCached(join(root, "data/sources/institutions.json"), institutionsTable);
}

function brokerSnapshotIds(): Set<string> {
  const dir = join(root, "data/fees");
  const out = new Set<string>();
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const s = readJsonCached(join(dir, f)) as { id: string; provider: { class: string } };
    if (s.provider.class === "broker" || s.provider.class === "foreign_broker") out.add(s.id);
  }
  return out;
}

// ---------------------------------------------------------------- the funds a brand's fund managers run

export type FundKind = "etf" | "tracking" | "money-market" | "other";
const kindOrder: FundKind[] = ["etf", "tracking", "money-market", "other"];

/** The kind of an Israeli fund, from its legal form as its record writes it (the prospectus's words). */
export function fundKindOf(rec: Pick<FundRecord, "legal_form">): FundKind {
  if (rec.legal_form.includes("קרן סל")) return "etf";
  if (rec.legal_form.includes("קרן מחקה")) return "tracking";
  if (rec.legal_form.includes("כספית")) return "money-market";
  return "other";
}

export interface BrandFundRow {
  id: string;
  name: string;
  number: string | null;
  /** The index the fund follows (its short name, linking to its page under /exposure; founder, 2026-10-26: not the index comparison), or a money-market fund's kind (linking to its guide). */
  follows: { kind: "index" | "money-market"; name: string; href: string } | null;
  /** Maya's page of the fund: the fund's number links to it (founder, 2026-10-27). */
  mayaHref: string | null;
  /** What the fund is and does, from the index page's label set (fundLabels); an index fund only. */
  labels: Label[];
  fixed: SiteValue | null;
  variable: SiteValue | null;
  trustee: SiteValue | null;
}

export interface BrandFundGroup {
  kind: FundKind;
  funds: BrandFundRow[];
}

const collator = new Intl.Collator("he");
const indexWordAtStart = new RegExp(`^${brandsCopy.funds.indexWord}\\s+`);

export function brandFunds(brand: Brand): BrandFundGroup[] {
  if (brand.fundManagers.length === 0) return [];
  const exposures = new Map(loadExposures().map((e) => [e.id, e]));
  const recs = loadFunds().filter((f) => brand.fundManagers.includes(f.manager));
  const rows = recs.map((rec) => ({ kind: fundKindOf(rec), row: fundRow(rec, exposures.get(rec.exposure_id ?? "") ?? null) }));
  return kindOrder
    .map((kind) => ({ kind, funds: rows.filter((r) => r.kind === kind).map((r) => r.row).sort((a, b) => collator.compare(a.name, b.name)) }))
    .filter((g) => g.funds.length > 0);
}

function fundRow(rec: FundRecord, exposure: ExposureRecord | null): BrandFundRow {
  // D31: the fund manager's own fee, shown on its own fund
  const fee = (key: "fixed_management" | "variable_management" | "trustee"): SiteValue | null => {
    const v = rec.fees[key];
    return v && v.value !== null ? ownBy(v as SiteValue, rec.manager) : null;
  };
  const kind = fundKindOf(rec);
  const number = rec.identifiers.tase_number;
  // Maya's page of the fund: an Israeli ETF under "etfs", any other Israeli fund under "mutual-funds" (the fund records' sources)
  const mayaHref = rec.domicile === "IL" && number ? `https://maya.tase.co.il/he/funds/${kind === "etf" ? "etfs" : "mutual-funds"}/${number}` : null;
  const index = exposure && exposure.id.startsWith("index-") ? exposure : null;
  // the column's head carries the word "index", so the cell holds the index's name without it (founder, 2026-10-27)
  const follows: BrandFundRow["follows"] = index
    ? { kind: "index", name: (index.names.he[0] ?? index.id).replace(indexWordAtStart, ""), href: `/exposure/${index.id}` }
    : kind === "money-market"
      ? rec.legal_form.includes("מתחדשת")
        ? { kind: "money-market", name: brandsCopy.funds.moneyMarketKinds.renewable, href: "/guide/money-market-fund-renewable" }
        : { kind: "money-market", name: brandsCopy.funds.moneyMarketKinds.daily, href: "/guide/money-market-fund-daily" }
      : null;
  const labels = index ? fundLabels(rec, refOfExposure(index), kind === "etf" ? "il-etf" : "il-tracking") : [];
  return { id: rec.id, name: rec.names.he[0] ?? rec.names.en[0] ?? rec.id, number, follows, mayaHref, labels, fixed: fee("fixed_management"), variable: fee("variable_management"), trustee: fee("trustee") };
}
