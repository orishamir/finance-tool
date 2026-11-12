// The parameters page (flows 6.15): the site's own judgement calls that a page on the site reads (lib/parameter-pages.ts), each
// value a Num with its rationale, and links to the pages that use it. No code is shown: the card's id is the anchor links land on.
import { useLoaderData } from "react-router";
import { parametersPage as copy, provenance as provCopy } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { Num } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, GoLink, gershayim, PageHead } from "../components/kit";

import { mostlyHebrew } from "../lib/source-label";
import { fieldLabel, unitText } from "../lib/parameter-labels";
import { parameterPageRoutes, parameterPages } from "../lib/parameter-pages";
import type { SiteValue } from "../lib/value";

interface Entry {
  path: string;
  value: SiteValue;
}

function isValueObject(x: unknown): x is SiteValue {
  return !!x && typeof x === "object" && "value" in x && "unit" in x && "source" in x && "state" in x;
}

function walk(node: unknown, path: string[], out: Entry[]) {
  if (isValueObject(node)) {
    out.push({ path: path.join("."), value: node });
    return;
  }
  if (Array.isArray(node)) node.forEach((n, i) => walk(n, [...path, String(i)], out));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, [...path, k], out);
}

export async function loader() {
  const { loadHomeGuideDoor, loadParameters, today } = await import("../lib/data.server");
  const skip = new Set(["id", "method_id", "rationale", "rationale_he", "shown_as", "chosen_by"]);
  const parameters = loadParameters()
    .filter((p) => Object.hasOwn(parameterPages, p.method_id))
    .sort((a, b) => a.method_id.localeCompare(b.method_id))
    .map((p) => {
      // the page's own line where the file's still names a page the site no longer has
      const general = copy.why[p.method_id] ?? p.rationale_he ?? (mostlyHebrew(p.rationale) ? p.rationale : provCopy.parameter.noRationale);
      const entries: Entry[] = [];
      for (const [k, v] of Object.entries(p)) if (!skip.has(k)) walk(v, [k], entries);
      const values = entries.map((e) => ({ ...e, label: fieldLabel(p.method_id, e.path), value: { ...e.value, parameter: { rationale: p.rationale, rationaleHe: general } } }));
      const pages = parameterPages[p.method_id]!.map((k) => ({ to: parameterPageRoutes[k].href, name: copy.pages[k] ?? "" }));
      // the kinds of saving the first page names (P-10) hold no figure: the card lists them by name, in order
      const kinds = p.method_id === "P-10" ? loadHomeGuideDoor().map((k) => k.name) : [];
      return { methodId: p.method_id, name: copy.names[p.method_id] ?? "", why: general, values, kinds, pages };
    });
  return { parameters, today: today() };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

export default function Parameters() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="parameters" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section">
        <PageHead title={copy.title} lede={copy.lede} />
        <ul className="grid gap-4 lg:grid-cols-2">
          {data.parameters.map((p) => (
            <Card as="li" key={p.methodId} id={p.methodId} className="anchor-target flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              {p.values.length > 0 && (
                <dl className="readout">
                  {p.values.map((e) => {
                    const u = unitText(e.path, e.value);
                    return (
                      <div key={e.path} className="readout-row">
                        <dt>{e.label}</dt>
                        <dd>
                          <Num value={e.value} display={u.display} />
                          {u.suffix && <span className="text-sm text-muted-foreground">{u.suffix}</span>}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
              {p.kinds.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">{copy.homeKinds}</span> {p.kinds.map(gershayim).join(" · ")}
                </p>
              )}
              <dl className="sheet-dl">
                <dt className="text-sm text-muted-foreground">{copy.rows.why}</dt>
                <dd className="text-sm">{p.why}</dd>
                <dt className="text-sm text-muted-foreground">{copy.rows.usedIn}</dt>
                <dd className="flex flex-wrap gap-x-4">
                  {/* a page kind with no single page (the fee pages, one per product) is named, not linked */}
                  {p.pages.map((pg) =>
                    pg.to ? (
                      <GoLink key={pg.name} to={pg.to}>
                        {pg.name}
                      </GoLink>
                    ) : (
                      <span key={pg.name} className="text-sm min-h-target inline-flex items-center">
                        {pg.name}
                      </span>
                    ),
                  )}
                </dd>
              </dl>
            </Card>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
