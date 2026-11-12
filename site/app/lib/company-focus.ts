// The companies page (/companies): every company at once beside one company in focus. What the loader ships for each company, and the
// pure logic of the page's filters: which companies a type, a product and a search match, the counts the chips, the group heads and the
// status line say, and the page's address. Nothing here reads files; lib/company-focus.server.ts builds the data at build.
import { companyFocus as w } from "../copy";
import { countPhrase, fmt } from "./format";
import { normalize } from "./search";
import type { SiteValue } from "./value";

/** The four kinds of product the page filters by, the designer's grouping. */
export const productTypes = ["savings", "funds", "trade", "bank"] as const;
export type ProductType = (typeof productTypes)[number];
export type TypeChoice = ProductType | "all";

/** The three groups of the list, in their order. */
export const companyGroups = ["houses", "managers", "banks"] as const;
export type CompanyGroup = (typeof companyGroups)[number];

/** How a product's count is said: the tracks of a provident product, a brand's funds, a bank's deposits or savings plans, or "יש" for
 *  what has no count (a securities account, a current account). */
export type CountUnit = "tracks" | "funds" | "deposits" | "plans" | "has";

/** One product the page can filter by: its id is the company page's own id for it (its `?product=`), so the arrow opens it there. */
export interface FocusProductKind {
  id: string;
  name: string;
  type: ProductType;
  unit: CountUnit;
}

/** One product of one company, with what its row's quiet line says. The figures here are plain numbers, so the page draws at once;
 *  their sourced values (with what each was computed from) come from /company-figures.json once the page is open (`FocusFigures`). */
export interface FocusProduct {
  id: string;
  /** The number of tracks, funds, deposits or plans; null for a product said with "יש". */
  count: number | null;
  /** A provident product: the company's assets in it, NIS millions (F-99), and the range of its tracks' fees from savings (F-100). */
  assets?: number | null;
  fees?: { low: number; high: number } | null;
  /** A securities account: the names of its price list's groups of fees. */
  tariffGroups?: string[];
  /** Deposits and savings plans: the bank's latest "נכון ליום" over them, ISO. */
  asOf?: string | null;
  /** Where the arrow opens the product on the company's page. */
  href: string;
}

/** The one line under a company's name in the pane. `at`: the day the price list was collected, ISO. */
export type FocusLine = { kind: "members"; names: string[] } | { kind: "tariff"; at: string } | { kind: "class"; text: string };

/** The sourced values behind a company's figures, by company id: its line's date and each product's figures. */
export type FocusFigures = Record<string, { line?: SiteValue; products: Record<string, { assets?: SiteValue | null; fees?: { low: SiteValue; high: SiteValue } | null; asOf?: SiteValue | null }> }>;

export interface FocusCompany {
  /** The address of its page, `/companies/<id>`. */
  id: string;
  name: string;
  /** Its name in the list, one short word or two that fit the narrow column (copy `companyFocus.shortNames`, else `shortName`). */
  short: string;
  group: CompanyGroup;
  /** Every name the search finds it by (its legal companies' too). */
  match: string;
  line: FocusLine | null;
  products: FocusProduct[];
  /** The further sections its page has, each landing on its fixed id. */
  sections: { id: string; title: string }[];
  /** The number of entries under its page's "מה כתוב במסמכים". */
  terms: number;
}

export interface FocusData {
  kinds: FocusProductKind[];
  companies: FocusCompany[];
}

// ---------------------------------------------------------------- the filters

export interface FocusState {
  type: TypeChoice;
  /** A product of the type, or null: the type alone. */
  product: string | null;
  q: string;
  /** The company in focus. */
  focus: string;
}

/** A type with a single product behaves as if that product was chosen. */
export function chooseType(kinds: readonly FocusProductKind[], type: TypeChoice): Pick<FocusState, "type" | "product"> {
  if (type === "all") return { type, product: null };
  const of = kinds.filter((k) => k.type === type);
  return { type, product: of.length === 1 ? of[0]!.id : null };
}

/** Choosing a product: its type lights up with it. The chosen product chosen again goes back to the type alone, or to everything when
 *  the type has that one product (a choice that would change nothing is not one). */
export function chooseProduct(kinds: readonly FocusProductKind[], s: Pick<FocusState, "type" | "product">, id: string): Pick<FocusState, "type" | "product"> {
  const kind = kinds.find((k) => k.id === id);
  if (!kind) return s;
  if (s.product === id) {
    const single = kinds.filter((k) => k.type === kind.type).length === 1;
    return single ? { type: "all", product: null } : { type: kind.type, product: null };
  }
  return { type: kind.type, product: id };
}

/** A product row in the pane: choosing it chooses it as the filter; choosing it again returns to everything. */
export function toggleFromPane(kinds: readonly FocusProductKind[], s: Pick<FocusState, "type" | "product">, id: string): Pick<FocusState, "type" | "product"> {
  if (s.product === id) return { type: "all", product: null };
  return chooseProduct(kinds, { type: "all", product: null }, id);
}

const has = (c: FocusCompany, id: string) => c.products.some((p) => p.id === id);
const hasType = (kinds: readonly FocusProductKind[], c: FocusCompany, type: ProductType) => c.products.some((p) => kinds.find((k) => k.id === p.id)?.type === type);

/** The company offers what the type and product ask for. */
export function offers(kinds: readonly FocusProductKind[], c: FocusCompany, s: Pick<FocusState, "type" | "product">): boolean {
  if (s.product) return has(c, s.product);
  if (s.type === "all") return true;
  return hasType(kinds, c, s.type);
}

/** The company's name has the search's words. */
export function nameMatches(c: FocusCompany, q: string): boolean {
  const nq = normalize(q.trim());
  return !nq || normalize(`${c.short} ${c.name} ${c.match}`).includes(nq);
}

/** Whether a company is shown at full strength: it offers what is chosen and its name matches the search. */
export function matches(kinds: readonly FocusProductKind[], c: FocusCompany, s: Omit<FocusState, "focus">): boolean {
  return offers(kinds, c, s) && nameMatches(c, s.q);
}

/** The number of companies each type chip would show (the search left aside: the chips count companies, as the status line does). */
export function typeCounts(kinds: readonly FocusProductKind[], companies: readonly FocusCompany[]): Record<TypeChoice, number> {
  const out = { all: companies.length } as Record<TypeChoice, number>;
  for (const t of productTypes) out[t] = companies.filter((c) => hasType(kinds, c, t)).length;
  return out;
}

/** The company the search brings into focus: the one company it matches, else none. */
export function searchFocus(kinds: readonly FocusProductKind[], companies: readonly FocusCompany[], s: Omit<FocusState, "focus">): string | null {
  if (!s.q.trim()) return null;
  const hit = companies.filter((c) => matches(kinds, c, s));
  return hit.length === 1 ? hit[0]!.id : null;
}

// ---------------------------------------------------------------- the words

/** "חברה אחת", "שתי חברות", "15 חברות". */
export function companiesWord(n: number): string {
  return countPhrase(n, w.companies);
}

/** A product's count with its unit: "16 מסלולים", "קרן אחת", "שני פיקדונות", "יש". */
export function countWords(unit: CountUnit, n: number | null): string {
  if (unit === "has" || n === null) return w.has;
  return countPhrase(n, w.units[unit]);
}

/** The short count beside a name in the list while a product is chosen: the number, or ✓ for a product said with "יש". */
export function countMark(p: FocusProduct | undefined): string {
  if (!p) return "";
  return p.count === null ? "✓" : fmt.number(p.count);
}

/** The status line: what the list shows, with live numbers. A search speaks of the search; a product, of the product and of the counts
 *  beside the names; a type, of the type; else how many companies there are and what a tap does. */
export function statusLine(kinds: readonly FocusProductKind[], companies: readonly FocusCompany[], s: Omit<FocusState, "focus">): string {
  const n = companies.filter((c) => matches(kinds, c, s)).length;
  const verb = n === 1 ? w.status.offersOne : w.status.offersMany;
  if (s.q.trim()) return n === 0 ? w.status.searchNone : `${companiesWord(n)} ${n === 1 ? w.status.searchOne : w.status.searchMany}`;
  if (s.product) {
    const k = kinds.find((x) => x.id === s.product);
    if (!k) return "";
    const first = `${companiesWord(n)} ${verb} ${k.name}.`;
    return k.unit === "has" ? first : `${first} ${w.status.beside} ${w.status.unit[k.unit]}.`;
  }
  if (s.type !== "all") return `${companiesWord(n)} ${verb} ${w.types[s.type]}.`;
  return `${companiesWord(n)}. ${w.status.tap}`;
}

/** "10 מוצרים באתר". */
export function productsOnSite(n: number): string {
  return countPhrase(n, w.productsOnSite);
}

// ---------------------------------------------------------------- the address

/** The page's address holds the company in focus and the filter, so a link or the back button returns to the same view. */
export function stateToSearch(s: FocusState, first: string): string {
  const p = new URLSearchParams();
  if (s.focus && s.focus !== first) p.set("company", s.focus);
  if (s.type !== "all") p.set("type", s.type);
  if (s.product) p.set("product", s.product);
  if (s.q.trim()) p.set("q", s.q);
  const out = p.toString();
  return out ? `?${out}` : "";
}

/** The state an address asks for, each part checked against the data (an unknown company, type or product is left out). */
export function searchToState(search: string, data: FocusData): Partial<FocusState> {
  const p = new URLSearchParams(search);
  const out: Partial<FocusState> = {};
  const company = p.get("company");
  if (company && data.companies.some((c) => c.id === company)) out.focus = company;
  const product = p.get("product");
  const kind = product ? data.kinds.find((k) => k.id === product) : undefined;
  if (kind) {
    out.type = kind.type;
    out.product = kind.id;
  } else {
    const type = p.get("type");
    if (type && (productTypes as readonly string[]).includes(type)) Object.assign(out, chooseType(data.kinds, type as ProductType));
  }
  const q = p.get("q");
  if (q) out.q = q;
  return out;
}
