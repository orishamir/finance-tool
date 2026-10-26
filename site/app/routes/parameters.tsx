// The parameters page (flows 6.15): the site's own judgement calls, each value a Num with its rationale.
import { useLoaderData } from "react-router";
import type { Route } from "./+types/parameters";
import { parametersPage as copy, provenance as provCopy, site } from "../copy";
import { IdRef, Num } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, Tag } from "../components/kit";
import { fmt } from "../lib/format";
import { mostlyHebrew } from "../lib/source-label";
import { fieldLabel, unitText } from "../lib/parameter-labels";
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
  const { loadParameters, loadParameterUses, today } = await import("../lib/data.server");
  const uses = loadParameterUses();
  const skip = new Set(["id", "method_id", "rationale", "rationale_he", "signed_off_by", "signed_off_on", "shown_as", "chosen_by"]);
  const parameters = loadParameters()
    .sort((a, b) => a.method_id.localeCompare(b.method_id))
    .map((p) => {
      const entries: Entry[] = [];
      for (const [k, v] of Object.entries(p)) if (!skip.has(k)) walk(v, [k], entries);
      const values = entries.map((e) => ({ ...e, label: fieldLabel(p.method_id, e.path, p as unknown as Record<string, unknown>), value: { ...e.value, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null, signedOffOn: p.signed_off_on, provisional: (e.value.notes ?? "").startsWith("provisional") } } }));
      return { id: p.id, methodId: p.method_id, rationale: p.rationale, rationaleHe: p.rationale_he ?? null, chosenBy: (p as { chosen_by?: string }).chosen_by ?? null, signedOffOn: p.signed_off_on, values, usedIn: uses[p.method_id] ?? [] };
    });
  return { parameters, today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function Parameters() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="parameters" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section pt-6 lg:pt-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
        </header>
        <ul className="grid gap-4 lg:grid-cols-2">
          {data.parameters.map((p) => (
            <Card as="li" key={p.id} id={p.methodId} className="flex flex-col gap-3 scroll-mt-24">
              <header className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{copy.names[p.methodId] ?? p.id}</h2>
                <IdRef id={p.methodId} asLabel />
              </header>
              {p.values.length === 0 ? (
                <p className="text-muted-foreground">{copy.notSet}</p>
              ) : (
                <dl className="readout">
                  {p.values.map((e) => (
                    <div key={e.path} className="readout-row">
                      <dt>{e.label}</dt>
                      <dd>
                        <Num value={e.value} display={unitText(e.path, e.value).display} />
                        {unitText(e.path, e.value).suffix && <span className="text-sm text-muted-foreground">{unitText(e.path, e.value).suffix}</span>}
                        {e.value.parameter?.provisional && <Tag tone="caution">{copy.provisional}</Tag>}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              <dl className="sheet-dl">
                <dt className="text-sm text-muted-foreground">{copy.rows.why}</dt>
                <dd className="text-sm">
                  {p.rationaleHe ?? (mostlyHebrew(p.rationale) ? p.rationale : provCopy.parameter.noRationale)}
                </dd>
                <dt className="text-sm text-muted-foreground">{copy.rows.approved}</dt>
                <dd>{p.signedOffOn ? <bdi dir="ltr">{fmt.date(p.signedOffOn)}</bdi> : provCopy.parameter.notApproved}</dd>
                {p.usedIn.length > 0 && (
                  <>
                    <dt className="text-sm text-muted-foreground">{copy.rows.usedIn}</dt>
                    <dd className="flex flex-wrap gap-2">
                      {p.usedIn.map((f) => (
                        <IdRef key={f} id={f} />
                      ))}
                    </dd>
                  </>
                )}
              </dl>
            </Card>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
