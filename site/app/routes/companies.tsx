// The companies list (flows 6.10): every managing company in the regulator's data, with a filter.
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/companies";
import { companies as copy, r4catalogue as r4, site } from "../copy";
import { IconDrillIn, IconSearch } from "../components/icons";
import { PageShell, useOpenSearch } from "../components/shell";
import { normalize } from "../lib/search";
import { fmt } from "../lib/format";
import type { InstitutionRow } from "../components/decoder/institutions/types";
import { NoPageCompanyTerms } from "../components/decoder/company-terms";

export async function loader() {
  const { loadCma, today } = await import("../lib/data.server");
  const { institutionRows, noPageCompanyTerms } = await import("../lib/institutions.server");
  const { loadChecklistRows, loadRules } = await import("../lib/data.server");
  const cma = loadCma();
  // the terms of the companies the site has no page for (fund managers, index providers, foreign brokers, the exchange), and of none (D30)
  const allRules = loadRules();
  const noPage = noPageCompanyTerms(allRules);
  const ids = [...noPage.companies.flatMap((c) => c.ids), ...noPage.none];
  const rules = Object.fromEntries(ids.map((id) => [id, allRules[id]!]));
  for (const id of ids) for (const d of (allRules[id] as { derived_from?: string[] }).derived_from ?? []) if (allRules[d]) rules[d] = allRules[d]!;
  return { companies: cma.companies.map((c) => ({ id: c.id, name: c.name, line: c.classifications.join(" · ") })), institutions: institutionRows(), today: today(), noPage, rules, dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function Companies() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="decoder" data={{ rules: data.rules, terms: {}, dimensions: data.dimensions, today: data.today }}>
      <Body companies={data.companies} institutions={data.institutions} />
      <div className="pt-section">
        <NoPageCompanyTerms companies={data.noPage.companies} none={data.noPage.none} />
      </div>
    </PageShell>
  );
}

function Body({ companies, institutions }: { companies: { id: string; name: string; line: string }[]; institutions: InstitutionRow[] }) {
  const [q, setQ] = useState("");
  const open = useOpenSearch();
  const nq = normalize(q);
  const shown = nq ? companies.filter((c) => normalize(c.name).includes(nq)) : companies;
  const shownInstitutions = nq ? institutions.filter((c) => normalize(`${c.name} ${c.id}`).includes(nq)) : institutions;
  const headed = institutions.length > 0;
  return (
    <div className="flex flex-col gap-6 pt-6 lg:pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
        <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
      </header>
      <div className="flex flex-col gap-2 max-w-measure">
        <label htmlFor="company-filter" className="text-sm font-medium">
          {copy.filter}
        </label>
        <div className="field-box text-muted-foreground">
          <IconSearch size={18} />
          <input id="company-filter" dir="rtl" value={q} onChange={(e) => setQ(e.target.value)} className="field-input !text-start text-mixed" autoComplete="off" />
        </div>
      </div>
      {shown.length === 0 && shownInstitutions.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p>{copy.noMatch}</p>
          <button type="button" className="text-link self-start min-h-target hover:underline" onClick={(e) => open(e.currentTarget, q)}>
            {copy.searchAll}
          </button>
        </div>
      ) : (
        <>
          {shown.length > 0 && (
            <Heading title={headed ? r4.headings.companies : null}>
              {shown.map((c) => (
                <Row key={c.id} id={c.id} name={c.name}>
                  <span className="text-sm text-muted-foreground">{c.line}</span>
                </Row>
              ))}
            </Heading>
          )}
          {shownInstitutions.length > 0 && (
            <Heading title={r4.headings.institutions}>
              {shownInstitutions.map((c) => (
                <Row key={c.id} id={c.id} name={c.name}>
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

/** One heading of the list (release 4): an h2 and its two-column rows; the first group has no heading while it is alone. */
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
    <li>
      <Link to={`/companies/${id}`} className="flex items-center justify-between gap-3 min-h-14 py-2 border-b border-border hover:bg-accent/40 -mx-2 px-2 rounded-md">
        <span className="flex flex-col min-w-0">
          <bdi className="font-medium">{name}</bdi>
          {children}
        </span>
        <IconDrillIn className="text-muted-foreground shrink-0" />
      </Link>
    </li>
  );
}
