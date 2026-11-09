// The track browser's data, built at build time (D54): for each of the six products that have regulator tracks, every
// company's tracks with the two fee averages, the amounts the exposure shares are computed from, and the two average annual
// yields, compacted against one template per product (as the company page does). Server-only.
import { loadCma, loadCmaFees, loadCmaHoldings, loadCmaYields, loadWrappers, today } from "./data.server";
import { brandOfPage } from "./brands.server";
import { loadInstitutionRegistry } from "./institutions.server";
import { compactHoldings, holdingsTemplate } from "./track-exposure";
import { defaultProduct, trackProductIds, type TbData, type TbProduct, type TbRow } from "./track-browser";
import { cmaFeeValue, compactFee, feeYear, staleCma, type SiteValue } from "./value";
import { withoutLtd } from "./company-name";

// the six products and the default are in lib/track-browser.ts (the guides read them too)
export { defaultProduct, trackProductIds };

/** The name the site calls a company by: its brand's, else the company registry's, else the regulator's name without the legal suffix.
 *  The tracks page, the companies list and a company's page all call it so. */
export function shortCompanyName(id: string, legalName: string): string {
  const brand = brandOfPage(id);
  if (brand) return brand.name;
  const registered = loadInstitutionRegistry().find((r) => r.cma_legal_id === id);
  if (registered) return registered.name_he;
  return withoutLtd(legalName);
}

/** `companyId`: one company's tracks only (its page); the figures' templates are then built over its tracks, and its
 *  tracks of a type the site has no product page for (מרכזית לפיצויים, מטרה אחרת) are products too, named by the regulator's type. */
export function buildTrackBrowser(companyId?: string): TbData {
  const cma = loadCma();
  const feesOf = loadCmaFees();
  const holdingsOf = loadCmaHoldings();
  const yieldsOf = loadCmaYields();
  const t = today();
  const wrappers = loadWrappers();

  const companyIds: string[] = [];
  const own = (x: (typeof cma.tracks)[number]) => !companyId || x.companyId === companyId;
  const kinds = [
    ...trackProductIds.map((id) => ({ id, page: true, of: (x: (typeof cma.tracks)[number]) => x.wrapperId === id })),
    ...(companyId ? [...new Set(cma.tracks.filter((x) => own(x) && !x.wrapperId).map((x) => x.classification))].map((c) => ({ id: c, page: false, of: (x: (typeof cma.tracks)[number]) => !x.wrapperId && x.classification === c })) : []),
  ];
  const products: TbProduct[] = kinds.flatMap(({ id, page, of }) => {
    const list = cma.tracks.filter((x) => of(x) && own(x));
    if (list.length === 0) return [];
    const period = list[0]!.reportPeriod;
    const balances = list.map((x) => feesOf.get(x.fundId)!.balance);
    const deposits = list.map((x) => feesOf.get(x.fundId)!.deposit);
    const balance = cmaFeeValue(balances.find((b) => b.value !== null) ?? balances[0]!, t);
    const deposit = cmaFeeValue(deposits.find((b) => b.value !== null) ?? deposits[0]!, t);
    const holdings = holdingsTemplate(list.map((x) => holdingsOf.get(x.fundId)), period, t);
    const stale = staleCma(period, t);
    const yieldTemplate = (pick: (y: NonNullable<ReturnType<typeof yieldsOf.get>>) => SiteValue): SiteValue | null => {
      const all = list.map((x) => yieldsOf.get(x.fundId)).filter((y): y is NonNullable<typeof y> => !!y);
      const first = all.find((y) => pick(y).value !== null) ?? all[0];
      return first ? { ...pick(first), stale } : null;
    };
    const y3 = yieldTemplate((y) => y.avg_annual_yield_3y as SiteValue);
    const y5 = yieldTemplate((y) => y.avg_annual_yield_5y as SiteValue);
    const rows: TbRow[] = list.map((x, i) => {
      if (!companyIds.includes(x.companyId)) companyIds.push(x.companyId);
      // a self-managed (IRA) fund: each member directs its money (IRA-01), and the file reports 0 in its yields
      const ira = /בניהול אישי|\bIRA\b/i.test(x.name);
      const y = ira ? undefined : yieldsOf.get(x.fundId);
      return {
        f: x.fundId,
        c: companyIds.indexOf(x.companyId),
        n: x.name,
        sub: x.subSpecialization,
        sp: x.specialization,
        inc: x.inception,
        b: compactFee(balances[i]!, balance),
        d: compactFee(deposits[i]!, deposit),
        h: compactHoldings(holdingsOf.get(x.fundId), holdings),
        y3: y && y3 ? compactFee(y.avg_annual_yield_3y, y3) : null,
        y5: y && y5 ? compactFee(y.avg_annual_yield_5y, y5) : null,
        ...(ira ? { s: 1 as const } : {}),
      };
    });
    const wrapper = wrappers.find((w) => w.id === id);
    return [{ id, name: wrapper?.names.he[0] ?? list[0]!.classification, ...(page ? {} : { noPage: true as const }), dataset: list[0]!.dataset, period, templates: { balance, deposit, holdings, y3, y5 }, rows }];
  });

  const companies = companyIds.map((id) => {
    const c = cma.companies.find((x) => x.id === id)!;
    return { id, name: shortCompanyName(id, c.name), fullName: c.name };
  });
  const firstBalance = products.find((p) => feeYear(p.templates.balance))?.templates.balance;
  const year = firstBalance ? feeYear(firstBalance) : null;
  return { today: t, reportPeriod: cma.periodValue.value as string, feeYear: firstBalance && year ? { ...firstBalance, value: year, unit: "text", notes: "" } : null, period: cma.periodValue, companies, products };
}

/** Every rule id any value of the products' templates names: the sheets open on them, so the page's loader ships these rules. */
export function templateRuleIds(data: TbData): Set<string> {
  const out = new Set<string>();
  const walk = (x: unknown) => {
    if (Array.isArray(x)) for (const v of x) walk(v);
    else if (x && typeof x === "object") {
      for (const [k, v] of Object.entries(x)) {
        if (k === "rule_ids" && Array.isArray(v)) {
          for (const id of v) if (typeof id === "string") out.add(id);
        } else walk(v);
      }
    }
  };
  for (const p of data.products) walk(p.templates);
  return out;
}
