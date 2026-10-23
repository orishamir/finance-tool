// Guide page components (design-spec 2): section index, sections, key-value list, fee table, tax steps,
// dimension checklist, related products, term table, institution chips.
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { guide as copy } from "../../copy";
import type { TermRow } from "../../lib/data.server";
import type { Strength } from "../../lib/value";
import { IconCheck, IconDrillIn, IconLock, IconMinus } from "../icons";
import { Disclosure, RuleRef, RulesLine, StrengthLabel } from "../provenance";
import { Card, cx, Tag } from "../ui";

export interface SectionDef {
  id: string;
  title: string;
}

export function useCurrentSection(ids: readonly string[]): string {
  const [current, setCurrent] = useState(ids[0] ?? "");
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (els.length === 0) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : Number.POSITIVE_INFINITY);
        const best = [...visible.entries()].filter(([, top]) => Number.isFinite(top)).sort((a, b) => a[1] - b[1])[0];
        if (best) setCurrent(best[0]);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return current;
}

export function SectionIndex({ sections, current }: { sections: readonly SectionDef[]; current: string }) {
  return (
    <>
      <nav aria-label={copy.indexTitle} className="lg:hidden sticky top-14 z-[var(--z-sticky)] bg-background/95 backdrop-blur -mx-gutter px-gutter py-2 overflow-x-auto scrollbar-none">
        <ul className="flex gap-2 w-max">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={current === s.id ? "location" : undefined} className={cx("sec-chip", current === s.id && "sec-chip-on")}>
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label={copy.indexTitle} className="hidden lg:block w-[200px] shrink-0 sticky top-24 self-start text-sm">
        <span className="block text-xs text-muted-foreground ps-3.5 pb-1.5">{copy.indexTitle}</span>
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={current === s.id ? "location" : undefined} className={cx("block py-2.5 px-3.5 border-s-2 hover:text-foreground", current === s.id ? "border-primary text-foreground font-medium" : "border-border text-muted-foreground")}>
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export function GuideSection({ id, title, children, className }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cx("flex flex-col gap-4 scroll-mt-[112px] lg:scroll-mt-[88px]", className)}>
      <h2 id={`${id}-h`} className="text-xl lg:text-2xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export interface KeyValueItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  line?: ReactNode;
  rules: readonly string[];
  tag?: ReactNode;
  lead?: ReactNode;
}

/** Phone: a list in one card. PC: a 2×2 grid of cards with the value at 20px (design-spec 2). */
export function KeyValueList({ items }: { items: KeyValueItem[] }) {
  return (
    <>
      <Card className="lg:hidden flex flex-col divide-y divide-border p-0 md:p-0">
        {items.map((it) => (
          <div key={it.id} className="flex flex-col gap-1 p-4">
            <span className="text-sm text-muted-foreground">{it.label}</span>
            <span className="flex flex-wrap items-center gap-2">
              <span>{it.value}</span>
              {it.tag}
            </span>
            {it.line && <span className="text-sm">{it.line}</span>}
            <RulesLine ids={it.rules} lead={it.lead} />
          </div>
        ))}
      </Card>
      <div className="hidden lg:grid grid-cols-2 gap-4">
        {items.map((it) => (
          <Card key={it.id} className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">{it.label}</span>
            <span className="text-xl font-semibold flex flex-wrap items-center gap-2">
              <span>{it.value}</span>
              {it.tag}
            </span>
            {it.line && <span className="text-sm">{it.line}</span>}
            <RulesLine ids={it.rules} lead={it.lead} />
          </Card>
        ))}
      </div>
    </>
  );
}

export interface FeeRow {
  id: string;
  name: string;
  base: string;
  cap: ReactNode;
  rules: readonly string[];
  tag?: ReactNode;
}

export function FeeTable({ fees, note }: { fees: FeeRow[]; note: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Card className="md:hidden flex flex-col divide-y divide-border p-0 md:p-0">
        {fees.map((f) => (
          <div key={f.id} className="flex flex-col gap-1 p-4">
            <h3 className="font-semibold">{f.name}</h3>
            <span className="text-sm text-muted-foreground">{f.base}</span>
            <span className="flex flex-wrap items-center gap-2">
              {f.cap}
              {f.tag}
            </span>
            <RulesLine ids={f.rules} />
          </div>
        ))}
      </Card>
      <Card className="hidden md:block p-0 md:p-0 overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">{copy.feeTable.type}</th>
              <th scope="col">{copy.feeTable.base}</th>
              <th scope="col">{copy.feeTable.cap}</th>
              <th scope="col">{copy.feeTable.rules}</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id}>
                <th scope="row">{f.name}</th>
                <td className="text-muted-foreground">{f.base}</td>
                <td>
                  <span className="flex flex-wrap items-center gap-2">
                    {f.cap}
                    {f.tag}
                  </span>
                </td>
                <td>
                  <span className="flex flex-wrap gap-2">
                    {f.rules.map((id) => (
                      <RuleRef key={id} id={id} />
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-sm text-muted-foreground max-w-measure">{note}</p>
    </div>
  );
}

export interface TaxStep {
  id: string;
  when: string;
  headline: ReactNode;
  text: ReactNode;
  rules: readonly string[];
  tag?: ReactNode;
  alt?: ReactNode;
}

/** Phone: vertical with a line joining 28px circles at the start side. PC: three cards joined by arrows pointing left. */
export function TaxSteps({ steps }: { steps: TaxStep[] }) {
  return (
    <>
      <ol className="lg:hidden flex flex-col">
        {steps.map((s, i) => (
          <li key={s.id} className="relative ps-10 pb-6 last:pb-0">
            {i < steps.length - 1 && <span className="absolute inset-s-[13px] top-7 bottom-0 w-0.5 bg-border" aria-hidden="true" />}
            <span className="absolute inset-s-0 top-0 size-7 rounded-full border-2 border-primary bg-card flex items-center justify-center text-primary" aria-hidden="true">
              <IconDrillIn size={16} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{s.when}</span>
              <span className="font-medium">{s.headline}</span>
              <span className="text-sm">{s.text}</span>
              {s.tag}
              {s.alt && <span className="text-sm text-muted-foreground">{s.alt}</span>}
              <RulesLine ids={s.rules} />
            </div>
          </li>
        ))}
      </ol>
      <ol className="hidden lg:grid gap-0 items-stretch" style={{ gridTemplateColumns: "1fr 24px 1fr 24px 1.3fr" }}>
        {steps.map((s, i) => (
          <li key={s.id} className="contents">
            <Card className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">{s.when}</span>
              <span className="text-xl font-semibold">{s.headline}</span>
              <span className="text-sm">{s.text}</span>
              {s.alt && <span className="text-sm text-muted-foreground">{s.alt}</span>}
              {s.tag && <span>{s.tag}</span>}
              <RulesLine ids={s.rules} className="mt-auto" />
            </Card>
            {i < steps.length - 1 && (
              <span className="flex items-center justify-center text-muted-foreground" aria-hidden="true">
                <IconDrillIn size={24} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

export interface ChecklistRowView {
  id: string;
  name: string;
  explanation: string;
  mark: "covered" | "na" | "blocked";
  code?: string;
  rules: readonly string[];
  weak?: Strength | null;
  applies?: ReactNode;
}

export function DimensionChecklist({ rows }: { rows: ChecklistRowView[] }) {
  const blocked = rows.filter((r) => r.mark === "blocked");
  return (
    <div className="flex flex-col gap-3">
      {blocked.length > 0 && (
        <p className="text-sm text-blocked-foreground flex items-center gap-2">
          <IconLock size={16} className="text-blocked" />
          {copy.checklist.blocked} {blocked.map((r) => r.name).join(", ")}
        </p>
      )}
      <ul className="grid lg:grid-cols-2 gap-x-8">
        {rows.map((r) => (
          <li key={r.id} className="flex gap-3 py-3 border-b border-border">
            <span className="shrink-0 mt-0.5" aria-hidden="true">
              {r.mark === "covered" ? <IconCheck size={24} className="text-positive" /> : r.mark === "blocked" ? <IconLock size={24} className="text-blocked" /> : <IconMinus size={24} className="text-muted-foreground" />}
            </span>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium">{r.name}</span>
                <span className={cx("text-xs", r.mark === "covered" ? "text-positive-foreground" : r.mark === "blocked" ? "text-blocked-foreground" : "text-muted-foreground")}>
                  {r.mark === "covered" ? copy.checklist.considered : r.mark === "na" ? copy.checklist.notRelevant : <>{copy.checklist.blockedMark} <bdi dir="ltr">{r.code?.replace("-OQ", " OQ")}</bdi></>}
                </span>
                {r.weak && (r.weak === "institution" || r.weak === "secondary") && <StrengthLabel strength={r.weak} />}
                {r.applies}
              </span>
              <span className="text-sm text-muted-foreground">
                {r.explanation}
                {r.mark === "blocked" && <> {copy.checklist.blockedLast}</>}
              </span>
              {r.rules.length > 0 && (
                <Disclosure label={<span className="text-xs text-link">{copy.checklist.expand}</span>} summaryClassName="min-h-9 justify-start gap-1 [&>svg]:size-4">
                  <RulesLine ids={r.rules} className="pb-2" />
                </Disclosure>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RelatedProducts({ items }: { items: { href: string; label: string }[] }) {
  if (items.length === 0) return null;
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span>{copy.related}</span>
      {items.map((it) => (
        <Link key={it.href} to={it.href} className="a-chip">
          {it.label}
        </Link>
      ))}
    </p>
  );
}

export function InstitutionChips({ companies, allHref }: { companies: { id: string; name: string }[]; allHref: string }) {
  return (
    <p className="flex flex-wrap items-center gap-2">
      {companies.map((c) => (
        <Link key={c.id} to={`/companies/${c.id}`} className="a-chip max-w-full !whitespace-normal py-1.5 !rounded-xl">
          <bdi>{c.name}</bdi>
        </Link>
      ))}
      <Link to={allHref} className="a-chip text-link">
        {copy.allCompanies}
      </Link>
    </p>
  );
}

function whereTags(where: string[]) {
  const tags = where.map((w) => copy.where[w]).filter((x): x is string => !!x);
  return [...new Set(tags)].map((t) => (
    <Tag key={t} tone="neutral">
      {t}
    </Tag>
  ));
}

export function TermTable({ terms }: { terms: TermRow[] }) {
  return (
    <>
      <dl className="md:hidden flex flex-col divide-y divide-border">
        {terms.map((t) => (
          <div key={t.he} className="py-3 flex flex-col gap-1">
            <dt className="font-medium">{t.he}</dt>
            <dd className="text-sm">{t.explanation}</dd>
            <dd className="flex flex-wrap gap-1.5">{whereTags(t.where)}</dd>
          </div>
        ))}
      </dl>
      <Card className="hidden md:block p-0 md:p-0 overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">{copy.termTable.term}</th>
              <th scope="col">{copy.termTable.meaning}</th>
              <th scope="col">{copy.termTable.where}</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.he}>
                <th scope="row">{t.he}</th>
                <td>{t.explanation}</td>
                <td>
                  <span className="flex flex-wrap gap-1.5">{whereTags(t.where)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
