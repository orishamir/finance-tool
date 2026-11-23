// The companies page's data (lib/company-focus.ts), built at build from what each company's page shows: a managing company's tracks by
// product (the same product ids and figures as its page's list, F-99 and F-100), a brand's funds and securities account, a bank's deposits,
// savings plans and current account, and the sections its page has. The page's loader ships the light list; the sourced values behind its
// figures are /company-figures.json (routes/company-figures.ts). Server-only.
import { brands as brandsCopy, companyFocus as focusCopy, r4catalogue, topicName } from "../copy";
import { companyPath } from "./site-paths";
import { shortName } from "./providers";
import { loadCma, loadRules } from "./data.server";
import { brandFunds, loadBrands, type Brand } from "./brands.server";
import { buildTrackBrowser, shortCompanyName } from "./track-browser.server";
import { buildProductView, feeRangeOf, type TbData } from "./track-browser";
import { brokeragePart, buildInstitution, companyTermGroups, institutionRows, registryIdsOfPage } from "./institutions.server";
import type { TariffCardData } from "../components/decoder/institutions/types";
import { feeKindName, feeKinds } from "../components/decoder/institutions/sections";
import { heCollator } from "./format";
import { depositCount } from "./bank-table";
import { withoutLtd } from "./company-name";
import { addressId } from "./company-page";
import type { FocusCompany, FocusData, FocusFigures, FocusLine, FocusProduct, FocusProductKind } from "./company-focus";
import { numberOf } from "./value";

/** The provident products in the designer's order: the six with a page, then the regulator's two types the site has no page for. */
const savingsOrder = ["keren-hishtalmut", "kupat-gemel-lehashkaa", "provident-for-annuity", "מרכזית לפיצויים", "child-savings-provident", "pension-comprehensive", "pension-general", "מטרה אחרת"];
const fundOrder = ["etf", "tracking", "money-market", "other"] as const;
/** A bank's products as its page groups them (the deposit records' wrappers). */
const bankProducts: { id: string; name: string; unit: FocusProductKind["unit"] }[] = [
  { id: "bank-deposit", name: r4catalogue.groups.deposits, unit: "deposits" },
  { id: "savings-plan", name: r4catalogue.groups.savings, unit: "plans" },
  { id: "current-account", name: r4catalogue.groups.current, unit: "has" },
];

type Built = { kind: FocusProductKind; product: FocusProduct; figures?: FocusFigures[string]["products"][string] };

/** A managing company's provident products, from the same data its page's list reads. */
function savingsProducts(tb: TbData, pageId: string): Built[] {
  return tb.products.map((p) => {
    const view = buildProductView(tb, p.id)!;
    const assets = view.companies[0]?.assets ?? null;
    const fees = feeRangeOf(view.tracks, tb.today);
    return {
      kind: { id: p.id, name: p.name, type: "savings", unit: "tracks" },
      product: { id: p.id, count: view.tracks.length, assets: numberOf(assets), fees: fees ? { low: numberOf(fees.low)!, high: numberOf(fees.high)! } : null, href: companyPath(pageId, { product: addressId(p.id) }) },
      figures: { assets, fees },
    };
  });
}

function brokerageProduct(t: TariffCardData | null | undefined, pageId: string): Built[] {
  if (!t || t.missing) return [];
  return [{ kind: { id: "brokerage", name: r4catalogue.groups.brokerage, type: "trade", unit: "has" }, product: { id: "brokerage", count: null, tariffGroups: feeKinds(t.lines).map(feeKindName), href: companyPath(pageId, { product: "brokerage" }) } }];
}

/** What a page's securities account card holds, for the companies route to name its sections. The route adds the two that rest on what the
 *  house publishes beside its price list (D57), which nothing in lib/ reads. */
export interface AccountParts {
  house: string;
  fees: boolean;
  canBuy: boolean;
}
const partsOf = (t: TariffCardData | null | undefined, house: string | null): AccountParts | null => (t && !t.missing && house ? { house, fees: t.lines.length > 0, canBuy: t.availability.length > 0 } : null);

let cache: { data: FocusData; figures: FocusFigures; accounts: Record<string, AccountParts> } | null = null;

/** The page's data, the figures' sourced values, and by company id what its securities account card holds (its `sections` are left empty). */
export function buildCompanyFocus(): { data: FocusData; figures: FocusFigures; accounts: Record<string, AccountParts> } {
  if (cache) return cache;
  const cma = loadCma();
  const rules = loadRules();
  const kinds = new Map<string, FocusProductKind>();
  const companies: Omit<FocusCompany, "short">[] = [];
  const figures: FocusFigures = {};
  const accounts: Record<string, AccountParts> = {};
  const account = (id: string, t: TariffCardData | null | undefined, house: string | null) => {
    const parts = partsOf(t, house);
    if (parts) accounts[id] = parts;
  };
  const termsOf = (pageId: string) => companyTermGroups(registryIdsOfPage(pageId), rules, topicName).reduce((n, g) => n + g.ids.length, 0);
  const take = (id: string, list: Built[]): FocusProduct[] => {
    for (const x of list) {
      if (!kinds.has(x.kind.id)) kinds.set(x.kind.id, x.kind);
      if (x.figures) (figures[id] ??= { products: {} }).products[x.product.id] = x.figures;
    }
    return list.map((x) => x.product);
  };

  // the brands, as the investment houses (D33), and the managing companies that belong to none
  const brands = loadBrands();
  const inBrand = new Set(brands.flatMap((b) => b.pageIds));
  const brandEntry = (b: Brand): Omit<FocusCompany, "short"> => {
    const company = b.cmaId ? cma.companies.find((c) => c.id === b.cmaId) : undefined;
    const tb = company ? buildTrackBrowser(company.id) : null;
    const funds = brandFunds(b);
    const brokerage = b.brokerId ? brokeragePart(b.brokerId) : null;
    const fundProducts: Built[] = fundOrder.flatMap((k) => {
      const g = funds.find((x) => x.kind === k);
      return g ? [{ kind: { id: `funds-${k}`, name: brandsCopy.funds.groups[k], type: "funds" as const, unit: "funds" as const }, product: { id: `funds-${k}`, count: g.funds.length, href: companyPath(b.page, { product: `funds-${k}` }) } }] : [];
    });
    // the legal companies the page stands for, as its header lists them (routes/company.tsx)
    const members = [...new Set([company?.name, brokerage?.tariff.providerName, ...b.fundManagers].filter((x): x is string => !!x))];
    return {
      id: b.page,
      name: b.name,
      group: "houses",
      match: [b.id, company?.name, ...b.members.map((m) => m.name_he), ...b.fundManagers].join(" "),
      line: members.length > 1 ? { kind: "members", names: members } : null,
      products: take(b.page, [...(tb ? savingsProducts(tb, b.page) : []), ...fundProducts, ...brokerageProduct(brokerage?.tariff, b.page)]),
      sections: [],
      terms: termsOf(b.page),
    };
  };
  for (const b of brands) {
    companies.push(brandEntry(b));
    account(b.page, b.brokerId ? brokeragePart(b.brokerId)?.tariff : null, b.brokerId);
  }
  for (const c of cma.companies.filter((x) => !inBrand.has(x.id))) {
    companies.push({ id: c.id, name: shortCompanyName(c.id, c.name), group: "managers", match: c.name, line: null, products: take(c.id, savingsProducts(buildTrackBrowser(c.id), c.id)), sections: [], terms: termsOf(c.id) });
  }

  // the banks, and the investment house that has a page of its own (its page calls it one)
  for (const r of institutionRows()) {
    const inst = buildInstitution(r.id);
    if (!inst) continue;
    const bank = inst.kind === "bank";
    const deposits: Built[] = bankProducts.flatMap((p) => {
      const g = inst.groups.find((x) => x.wrapperId === p.id);
      if (!g || g.products.length === 0) return [];
      const asOf = g.asOf;
      return [{ kind: { id: p.id, name: p.name, type: "bank" as const, unit: p.unit }, product: { id: p.id, count: p.unit === "has" ? null : depositCount(g.products), asOf: asOf ? String(asOf.value) : null, href: companyPath(r.id, { product: p.id }) }, figures: { asOf } }];
    });
    const tariff = inst.tariff && !inst.tariff.missing ? inst.tariff : null;
    const line: FocusLine | null = bank ? (tariff ? { kind: "tariff", at: String(tariff.snapshot.value) } : null) : { kind: "class", text: r4catalogue.brokerClassLine };
    companies.push({
      id: r.id,
      name: withoutLtd(inst.name),
      group: bank ? "banks" : "houses",
      match: `${r.id} ${inst.name}`,
      line,
      products: take(r.id, [...deposits, ...brokerageProduct(inst.tariff, r.id)]),
      sections: [],
      terms: inst.terms.groups.reduce((n, g) => n + g.ids.length, 0),
    });
    account(r.id, inst.tariff, r.id);
    if (bank && tariff) (figures[r.id] ??= { products: {} }).line = tariff.snapshot;
  }

  // the kinds in the page's order: by type, then the designer's order inside each; each company's products in that order
  const typeRank = { savings: 0, funds: 1, trade: 2, bank: 3 } as const;
  const rank = (k: FocusProductKind) => {
    if (k.type === "savings") return savingsOrder.indexOf(k.id) + 1 || 99;
    if (k.type === "funds") return fundOrder.indexOf(k.id.replace("funds-", "") as (typeof fundOrder)[number]) + 1 || 99;
    if (k.type === "bank") return bankProducts.findIndex((p) => p.id === k.id) + 1 || 99;
    return 0;
  };
  const kindList = [...kinds.values()].sort((a, b) => typeRank[a.type] - typeRank[b.type] || rank(a) - rank(b));
  const order = new Map(kindList.map((k, i) => [k.id, i]));
  for (const c of companies) c.products.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  // the list's names, and its order by them
  const listed: FocusCompany[] = companies.map((c) => ({ ...c, short: focusCopy.shortNames[c.id] ?? shortName(c.id, c.name) }));
  listed.sort((a, b) => heCollator.compare(a.short, b.short));
  cache = { data: { kinds: kindList, companies: listed }, figures, accounts };
  return cache;
}
