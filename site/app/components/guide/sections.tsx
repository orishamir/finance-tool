// Guide page components (design-spec 2): section index, sections, key-value list, fee table, tax steps,
// dimension checklist, related products, term table, institution chips.
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { guide as copy, r3fees, scopeWords, trackBrowser } from "../../copy";
import type { Strength } from "../../lib/value";
import { IconCheck, IconChevronDown, IconDrillIn, IconFile, IconLock, IconMinus } from "../icons";
import { IdRef, RulesLine, StrengthLabel } from "../provenance";
import { Card, cx, Disclosure, gershayim, KeyValueList as KitKeyValueList, Section, TableCols } from "../kit";

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
              <a href={`#${s.id}`} aria-current={current === s.id ? "location" : undefined} className={cx("flex items-center min-h-target py-2.5 px-3.5 border-s-2 hover:text-foreground", current === s.id ? "border-primary text-foreground font-medium" : "border-border text-muted-foreground")}>
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

/** A section of a guide page. */
export function GuideSection({ id, title, children, className }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <Section id={id} title={title} className={className}>
      <div className="flex flex-col gap-4">{children}</div>
    </Section>
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

/** The guide page's facts as the kit's key/value cards, each closed by its rule chips (design-spec 2). */
export function KeyValueList({ items }: { items: KeyValueItem[] }) {
  return <KitKeyValueList items={items.map((it) => ({ id: it.id, label: it.label, value: it.value, tag: it.tag, line: it.line, lead: it.lead, footer: <RulesLine ids={it.rules} name={typeof it.label === "string" ? it.label : undefined} /> }))} />;
}

export interface FeeRow {
  id: string;
  name: string;
  base: string;
  cap: ReactNode;
  rules: readonly string[];
  tag?: ReactNode;
  /** "תלוי בחברה" and the companies whose own rate the site holds for this fee (D30), under the cap. */
  varies?: ReactNode;
  /** What the collected managers' binding documents charge for this fee, over all of them (F-105), under the cap. */
  range?: ReactNode;
}

/** `feePage`: the fee page has an answer for this guide's product; without one the guide does not send the reader there (2026-11-07). */
export function FeeTable({ fees, note, feePage }: { fees: FeeRow[]; note: ReactNode; feePage: boolean }) {
  const { id } = useParams();
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
            {f.range && <span className="block text-sm text-muted-foreground">{f.range}</span>}
            {f.varies && <span className="block">{f.varies}</span>}
            <RulesLine ids={f.rules} name={f.name} className="pt-1" />
          </div>
        ))}
      </Card>
      <Card className="hidden md:block p-0 md:p-0 overflow-hidden">
        <table className="tbl">
          <TableCols widths={["22%", "38%", "40%"]} />
          <thead>
            <tr>
              <th scope="col">{copy.feeTable.type}</th>
              <th scope="col">{copy.feeTable.base}</th>
              <th scope="col">{copy.feeTable.cap}</th>
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
                  {f.range && <span className="block pt-1 text-sm text-muted-foreground">{f.range}</span>}
                  {f.varies && <span className="block pt-1">{f.varies}</span>}
                  <RulesLine ids={f.rules} name={f.name} className="pt-1" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-sm text-muted-foreground max-w-measure">{note}</p>
      {id && feePage && (
        <Link to={`/fees?wrapper=${id}`} className="text-link hover:underline self-start min-h-target inline-flex items-center">
          {r3fees.links.fromGuide}
        </Link>
      )}
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

/** The step's name on the list of its rules: its headline when that is words alone, else when it happens. */
const stepName = (s: TaxStep) => (typeof s.headline === "string" ? s.headline : s.when);

/** Phone: vertical with a line joining 28px circles at the start side, each holding a down chevron (UX fix 22). PC: three cards joined by arrows pointing left. */
export function TaxSteps({ steps }: { steps: TaxStep[] }) {
  return (
    <>
      <ol className="lg:hidden flex flex-col">
        {steps.map((s, i) => (
          <li key={s.id} className="relative ps-10 pb-6 last:pb-0">
            {i < steps.length - 1 && <span className="absolute inset-s-[13px] top-7 bottom-0 w-0.5 bg-border" aria-hidden="true" />}
            <span className="absolute inset-s-0 top-0 size-7 rounded-full border-2 border-primary bg-card flex items-center justify-center text-primary" aria-hidden="true">
              <IconChevronDown size={16} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{s.when}</span>
              <span className="font-medium">{s.headline}</span>
              <span className="text-sm">{s.text}</span>
              {s.tag}
              {s.alt && <span className="text-sm text-muted-foreground">{s.alt}</span>}
              <RulesLine ids={s.rules} name={stepName(s)} />
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
              <RulesLine ids={s.rules} name={stepName(s)} className="mt-auto" />
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

function ChecklistRow({ r }: { r: ChecklistRowView }) {
  const endsSentence = /[.!?:]$/.test(r.explanation.trim());
  return (
    <li className="flex gap-3 py-3 border-b border-border">
      <span className="shrink-0 mt-0.5" aria-hidden="true">
        {r.mark === "covered" ? <IconCheck size={24} className="text-positive" /> : r.mark === "blocked" ? <IconLock size={24} className="text-blocked" /> : <IconMinus size={24} className="text-muted-foreground" />}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{r.name}</span>
          <span className={cx("text-xs", r.mark === "covered" ? "text-positive-foreground" : r.mark === "blocked" ? "text-blocked-foreground" : "text-muted-foreground")}>
            {r.mark === "covered" ? copy.checklist.considered : r.mark === "na" ? copy.checklist.notRelevant : <>{copy.checklist.blockedMark} {r.code ? <IdRef id={r.code} /> : null}</>}
          </span>
          {r.weak && (r.weak === "institution" || r.weak === "secondary") && <StrengthLabel strength={r.weak} />}
          {r.applies}
        </span>
        <span className="text-sm text-muted-foreground">
          {gershayim(r.explanation)}
          {r.mark === "blocked" && !endsSentence && "."}
        </span>
        {/* audit A90: the status sentence is its own line, not glued to the question */}
        {r.mark === "blocked" && <span className="block text-sm text-blocked-foreground">{copy.checklist.blockedLast}</span>}
        {r.rules.length > 0 && (
          <Disclosure label={<span className="text-xs text-link">{copy.checklist.expand}</span>} summaryClassName="min-h-target justify-start gap-1 [&>svg]:size-4">
            <RulesLine ids={r.rules} className="pb-2" />
          </Disclosure>
        )}
      </div>
    </li>
  );
}

/**
 * What the site took into account for this product (audit A42): the open questions first, as rows, and the full list
 * (every question the site asks of every product) one tap away. It is the site's coverage, not a to-do list for the person.
 */
export function DimensionChecklist({ rows }: { rows: ChecklistRowView[] }) {
  const blocked = rows.filter((r) => r.mark === "blocked");
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground max-w-measure">{copy.checklist.intro}</p>
      {blocked.length > 0 && (
        <>
          <p className="text-sm text-blocked-foreground flex items-center gap-2">
            <IconLock size={16} className="text-blocked" />
            {copy.checklist.blocked} {blocked.map((r) => r.name).join(", ")}
          </p>
          <ul className="grid lg:grid-cols-2 gap-x-8">
            {blocked.map((r) => (
              <ChecklistRow key={r.id} r={r} />
            ))}
          </ul>
        </>
      )}
      <Disclosure label={<span className="text-link">{copy.checklist.showAll}</span>} openLabel={<span className="text-link">{copy.checklist.hideAll}</span>} summaryClassName="justify-start">
        <ul className="grid lg:grid-cols-2 gap-x-8">
          {rows.map((r) => (
            <ChecklistRow key={r.id} r={r} />
          ))}
        </ul>
      </Disclosure>
    </div>
  );
}

export function RelatedProducts({ items, label = copy.related }: { items: { href: string; label: string }[]; label?: string }) {
  if (items.length === 0) return null;
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span>{label}</span>
      {items.map((it) => (
        <Link key={it.href} to={it.href} className="a-chip">
          {it.label}
        </Link>
      ))}
    </p>
  );
}

/** The links to the exposures a product can hold (audit A43). */
export function ExposureLinks({ items }: { items: { id: string; name: string; href: string }[] }) {
  if (items.length === 0) return null;
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span>{copy.exposuresRow}</span>
      {items.map((it) => (
        <Link key={it.id} to={it.href} className="a-chip">
          {gershayim(it.name)}
        </Link>
      ))}
    </p>
  );
}

function CompanyLinks({ companies }: { companies: { id: string; name: string }[] }) {
  return (
    <ul className="text-sm leading-8 md:columns-2 md:gap-x-10">
      {companies.map((c) => (
        <li key={c.id} className="break-inside-avoid">
          <Link to={`/companies/${c.id}`} className="text-link hover:underline">
            <bdi>{gershayim(c.name)}</bdi>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The companies that offer the product, behind one toggle (audit A42), or shown open (`open`); the "all companies" link stays outside. */
export function InstitutionChips({ companies, allHref, tracks, open }: { companies: { id: string; name: string }[]; allHref: string; /** The product's track browser (`/tracks/<id>`) and the product's name, for the link to every company's tracks of it. */ tracks?: { href: string; name: string }; /** The list shows with no toggle. */ open?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {companies.length > 0 && open && (
        <div className="pb-2">
          <CompanyLinks companies={companies} />
        </div>
      )}
      {companies.length > 0 && !open && (
        <Disclosure label={<span className="text-link">{copy.companiesShow}</span>} openLabel={<span className="text-link">{copy.companiesHide}</span>} summaryClassName="justify-start">
          <div className="pb-2">
            <CompanyLinks companies={companies} />
          </div>
        </Disclosure>
      )}
      <Link to={allHref} className="text-link font-medium hover:underline text-sm min-h-target inline-flex items-center self-start">
        {copy.allCompanies}
      </Link>
      {tracks && (
        <Link to={tracks.href} className="text-link font-medium hover:underline text-sm min-h-target inline-flex items-center self-start">
          {trackBrowser.guideLink.before}
          {tracks.name}
          {trackBrowser.guideLink.after}
        </Link>
      )}
    </div>
  );
}
