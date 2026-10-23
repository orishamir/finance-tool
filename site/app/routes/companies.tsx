// The companies list (flows 6.10): every managing company in the regulator's data, with a filter.
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/companies";
import { companies as copy, site } from "../copy";
import { IconDrillIn, IconSearch } from "../components/icons";
import { PageShell, useOpenSearch } from "../components/shell";
import { normalize } from "../lib/search";

export async function loader() {
  const { loadCma, today } = await import("../lib/data.server");
  const cma = loadCma();
  return { companies: cma.companies.map((c) => ({ id: c.id, name: c.name, line: c.classifications.join(" · ") })), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function Companies() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="decoder" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <Body companies={data.companies} />
    </PageShell>
  );
}

function Body({ companies }: { companies: { id: string; name: string; line: string }[] }) {
  const [q, setQ] = useState("");
  const open = useOpenSearch();
  const nq = normalize(q);
  const shown = nq ? companies.filter((c) => normalize(c.name).includes(nq)) : companies;
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
          <input id="company-filter" dir="auto" value={q} onChange={(e) => setQ(e.target.value)} className="field-input !text-start" autoComplete="off" />
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p>{copy.noMatch}</p>
          <button type="button" className="text-link self-start min-h-target hover:underline" onClick={(e) => open(e.currentTarget, q)}>
            {copy.searchAll}
          </button>
        </div>
      ) : (
        <ul className="grid lg:grid-cols-2 gap-x-8">
          {shown.map((c) => (
            <li key={c.id}>
              <Link to={`/companies/${c.id}`} className="flex items-center justify-between gap-3 min-h-14 py-2 border-b border-border hover:bg-accent/40 -mx-2 px-2 rounded-md">
                <span className="flex flex-col min-w-0">
                  <bdi className="font-medium">{c.name}</bdi>
                  <span className="text-sm text-muted-foreground">{c.line}</span>
                </span>
                <IconDrillIn className="text-muted-foreground shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
