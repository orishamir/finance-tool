// The companies list (flows 6.10): the brands first (D33: a group's companies as one row), then every other managing company in the
// regulator's data and every other bank and broker, with a filter.
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/companies";
import { brands as brandsCopy, companies as copy, r4catalogue as r4, site } from "../copy";
import { IconSearch } from "../components/icons";
import { PageShell, useOpenSearch } from "../components/shell";
import { normalize } from "../lib/search";
import { fmt } from "../lib/format";
import type { InstitutionRow } from "../components/decoder/institutions/types";
import { NoPageCompanyTerms } from "../components/decoder/company-terms";
import { CompanyTabs } from "../components/decoder/company-tabs";
import { withoutLtd } from "../lib/company-name";
import { RowArrow } from "../components/kit";

export async function loader() {
  const { loadCma, loadProducts, classificationToWrapper, today } = await import("../lib/data.server");
  const { institutionRows, noPageCompanyTerms } = await import("../lib/institutions.server");
  const { loadChecklistRows, loadRules, pointedRecords } = await import("../lib/data.server");
  const { shortCompanyName } = await import("../lib/track-browser.server");
  const cma = loadCma();
  // a product of the regulator's list goes by the site's name for it ("חיסכון לכל ילד", not "קופת גמל להשקעה - חסכון לילד"), as on the tracks page and the guides
  const products = loadProducts();
  const productName = (classification: string) => {
    const id = classificationToWrapper[classification.trim()];
    return (id && products.find((w) => w.id === id)?.names.he[0]) || classification;
  };
  // D33: one row per brand, its line the kinds of product it offers, and its members' own rows left out
  const { brandFunds, loadBrands } = await import("../lib/brands.server");
  const brandList = loadBrands();
  const brandRows = brandList
    .map((b) => {
      const cmaCompany = cma.companies.find((c) => c.id === b.cmaId);
      const words = [...(cmaCompany?.classifications ?? []).map(productName), ...brandFunds(b).map((g) => brandsCopy.funds.groups[g.kind]), ...(b.brokerId ? [r4.groups.brokerage] : [])];
      return { id: b.page, name: b.name, line: [...new Set(words)], match: [b.name, b.id, cmaCompany?.name, ...b.members.map((m) => m.name_he), ...b.fundManagers].join(" ") };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "he"));
  const inBrand = new Set(brandList.flatMap((b) => b.pageIds));
  // the terms of the companies the site has no page for (fund managers, index providers, foreign brokers, the exchange), and the not-rules (D30)
  const allRules = loadRules();
  const noPage = noPageCompanyTerms(allRules);
  const ids = [...noPage.companies.flatMap((c) => c.ids), ...noPage.none];
  const rules = Object.fromEntries(ids.map((id) => [id, allRules[id]!]));
  return { brands: brandRows, companies: cma.companies.filter((c) => !inBrand.has(c.id)).map((c) => ({ id: c.id, name: shortCompanyName(c.id, c.name), match: c.name, line: [...new Set(c.classifications.map(productName))] })), institutions: institutionRows(), today: today(), noPage, rules, pointed: pointedRecords(rules, allRules), dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function Companies() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="decoder" data={{ rules: data.rules, pointed: data.pointed, terms: {}, dimensions: data.dimensions, today: data.today }}>
      <Body brands={data.brands} companies={data.companies} institutions={data.institutions} />
      <div className="pt-section">
        <NoPageCompanyTerms companies={data.noPage.companies} none={data.noPage.none} />
      </div>
    </PageShell>
  );
}

type CompanyRow = { id: string; name: string; line: string[]; match: string };

/** What a company offers, one product after another: a narrow screen breaks the line at a dot, never inside a product's name. */
function Offers({ items }: { items: string[] }) {
  return (
    <span className="text-sm text-muted-foreground">
      {items.map((w, i) => (
        <span key={w}>
          {i > 0 && " · "}
          <span className="whitespace-nowrap">{w}</span>
        </span>
      ))}
    </span>
  );
}

function Body({ brands, companies, institutions }: { brands: CompanyRow[]; companies: CompanyRow[]; institutions: InstitutionRow[] }) {
  const [q, setQ] = useState("");
  const open = useOpenSearch();
  const nq = normalize(q);
  const shown = nq ? companies.filter((c) => normalize(c.match).includes(nq)) : companies;
  const shownBrands = nq ? brands.filter((c) => normalize(c.match).includes(nq)) : brands;
  const shownInstitutions = nq ? institutions.filter((c) => normalize(`${c.name} ${c.id}`).includes(nq)) : institutions;
  const headed = institutions.length > 0 || brands.length > 0;
  return (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8">
      <CompanyTabs current="company" />
      <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
      <div className="flex flex-col gap-2 max-w-measure">
        <label htmlFor="company-filter" className="text-sm font-medium">
          {copy.filter}
        </label>
        <div className="field-box text-muted-foreground">
          <IconSearch size={18} />
          <input id="company-filter" dir="rtl" value={q} onChange={(e) => setQ(e.target.value)} className="field-input !text-start text-mixed" autoComplete="off" />
        </div>
      </div>
      {shown.length === 0 && shownInstitutions.length === 0 && shownBrands.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p>{copy.noMatch}</p>
          <button type="button" className="text-link self-start min-h-target hover:underline" onClick={(e) => open(e.currentTarget, q)}>
            {copy.searchAll}
          </button>
        </div>
      ) : (
        <>
          {shownBrands.length > 0 && (
            <Heading title={brandsCopy.heading}>
              {shownBrands.map((c) => (
                <Row key={c.id} id={c.id} name={c.name}>
                  <Offers items={c.line} />
                </Row>
              ))}
            </Heading>
          )}
          {shown.length > 0 && (
            <Heading title={headed ? r4.headings.companies : null}>
              {shown.map((c) => (
                <Row key={c.id} id={c.id} name={c.name}>
                  <Offers items={c.line} />
                </Row>
              ))}
            </Heading>
          )}
          {shownInstitutions.length > 0 && (
            <Heading title={r4.headings.institutions}>
              {shownInstitutions.map((c) => (
                <Row key={c.id} id={c.id} name={withoutLtd(c.name)}>
                  <span className="text-sm text-muted-foreground">
                    {r4.classWord[c.kind]}
                    {" · "}
                    {c.missing ? (
                      <span className="text-caution-foreground">{r4.rowLine.missing}</span>
                    ) : c.published ? (
                      <>
                        {r4.rowLine.tariffFrom}
                        <bdi dir="ltr">{fmt.date(c.published)}</bdi>
                      </>
                    ) : (
                      <span className="text-caution-foreground">{r4.rowLine.noDate}</span>
                    )}
                  </span>
                </Row>
              ))}
            </Heading>
          )}
        </>
      )}
    </div>
  );
}

/** One heading of the list (release 4): an h2 and its two-column rows; the first group has no heading while it is alone. The two rows side
 *  by side are one height, so their lines meet. */
function Heading({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2" aria-label={title ?? undefined}>
      {title && <h2 className="text-xl lg:text-2xl font-semibold">{title}</h2>}
      <ul className="grid lg:grid-cols-2 gap-x-8">{children}</ul>
    </section>
  );
}

function Row({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
  return (
    <li className="flex">
      <Link to={`/companies/${id}`} className="flex-1 flex items-center justify-between gap-3 min-h-14 py-2 border-b border-border hover:bg-accent/40 transition-colors duration-[var(--duration-fast)] -mx-2 px-2">
        <span className="flex flex-col min-w-0">
          <bdi className="font-medium">{name}</bdi>
          {children}
        </span>
        <RowArrow />
      </Link>
    </li>
  );
}
