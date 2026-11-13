// Guide page components (design-spec 2): section index, sections, the facts with their rules, fee table, tax steps,
// dimension checklist, related products, term table, institution chips.
import { useEffect, useState, type ReactNode } from "react";
import { companyPath, dealPagePath } from "../../lib/site-paths";
import { Link, useParams } from "react-router";
import { feePageLink, guide as copy, guideIndex, trackBrowser } from "../../copy";
import type { Strength } from "../../lib/value";
import { IconCheck, IconChevronDown, IconDrillIn, IconLock, IconMinus } from "../icons";
import { IdRef, RulesLine, StrengthLabel } from "../provenance";
import { Breadcrumb } from "../shell";
import { Card, cx, Disclosure, gershayim, GoLink, KeyValueList, PageHead, Section, Stat, StatRow, TableCols, TextLink } from "../kit";

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
      {/* lg:mt-8 is PageHead's top padding: the index starts level with the way back above the title */}
      <nav aria-label={copy.indexTitle} className="hidden lg:block w-[200px] shrink-0 sticky top-24 self-start lg:mt-8 text-sm">
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

/**
 * A guide page's columns: the section index beside the page's header and sections; `foot` closes the page under a hairline (the key to
 * the number marks). The header (`GuideHeader`, the first child) carries the page's top padding.
 */
export function GuideFrame({ sections, current, children, foot }: { sections: readonly SectionDef[]; current: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="lg:flex lg:gap-12">
      <SectionIndex sections={sections} current={current} />
      <div className="flex-1 min-w-0 flex flex-col gap-section">
        {children}
        {foot && <div className="border-t border-border pt-6">{foot}</div>}
      </div>
    </div>
  );
}

/** One of the facts a guide opens with: what it is, in the words of the section that holds it, and its value. */
export interface GlanceItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

/**
 * A guide page's header: the page's head (the way back to the guide, the title, the `lede`, then what the page adds under it). `glance`
 * is the product's main facts in one card, each as its section states it: under the head, and beside it from `xl`, where the room is.
 */
export function GuideHeader({ title, lede, children, glance = [] }: { title: string; lede?: ReactNode; children?: ReactNode; glance?: GlanceItem[] }) {
  return (
    <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,38rem)_minmax(0,1fr)] xl:items-end xl:gap-x-12">
      <PageHead crumb={<Breadcrumb parent={{ href: "/guide", label: guideIndex.title }} current={title} />} title={title} lede={lede}>
        {children}
      </PageHead>
      {/* one fact alone is no summary: the card shows from two */}
      {glance.length > 1 && (
        <Card pad="snug" className="max-w-measure xl:max-w-none">
          <StatRow cols={2}>
            {glance.map((g) => (
              <Stat key={g.id} label={g.label}>
                {g.value}
              </Stat>
            ))}
          </StatRow>
        </Card>
      )}
    </div>
  );
}

/**
 * A section of a guide page, opened by a hairline across the page. Its blocks keep the prose measure, so words, lists and tables share
 * one edge; a block marked `data-wide` (a drawing, a grid of cards) takes the page's width.
 */
export function GuideSection({ id, title, children, className }: { id: string; title: string; children: ReactNode; className?: string }) {
  return (
    <Section id={id} title={title} className={cx("border-t border-border pt-8", className)}>
      <div className="flex flex-col gap-4 [&>*:not([data-wide])]:max-w-measure">{children}</div>
    </Section>
  );
}

/**
 * Detail inside a guide section that only a specialist needs (an index maker's entry conditions, a fund's tracking asset): one
 * closed line in the link colour that names what it holds, and the detail under it once opened. It sits after the text it adds
 * to, so a glossary term it names for the first time on the page is still the page's first use.
 */
export function GuideFold({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Disclosure look="link" label={label}>
      <div className="flex flex-col gap-3 pb-2">{children}</div>
    </Disclosure>
  );
}

export interface RuleRowItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  line?: ReactNode;
  rules: readonly string[];
  tag?: ReactNode;
  lead?: ReactNode;
}

/** The guide page's facts as the kit's key/value rows, each closed by its rule chips (design-spec 2). */
export function RuleRows({ items }: { items: RuleRowItem[] }) {
  return <KeyValueList rows items={items.map((it) => ({ id: it.id, label: it.label, value: it.value, tag: it.tag, line: it.line, lead: it.lead, footer: <RulesLine ids={it.rules} name={typeof it.label === "string" ? it.label : undefined} /> }))} />;
}

export interface FeeRow {
  id: string;
  name: string;
  base: string;
  cap: ReactNode;
  /** Under the cap: the case it holds in and what holds where it does not bind (a cap that binds banks only), from its record. */
  capNote?: ReactNode;
  rules: readonly string[];
  tag?: ReactNode;
  /** "תלוי בחברה" and the companies whose own rate the site holds for this fee (D30), under the cap. */
  varies?: ReactNode;
  /** What the collected managers' binding documents charge for this fee, over all of them (F-105), under the cap. */
  range?: ReactNode;
  /** The cell holds a cap the fee regulations set. */
  regsCap?: boolean;
}

/**
 * `feePage`: the fee page builds a deal of this guide's product (its record lists a fee base); without one the guide does not send the reader there.
 * The cap column's head says whose caps it holds, read from the rows: "התקרה שבתקנות" where a row holds a cap the fee regulations set
 * (`regsCap`), since such a cap is the regulations' and never "the law's" (copy.md 3, guard 18), and a cell of that table with no cap says so
 * in its own words; "תקרה בחוק", the general head, where no row holds one. A phone, whose rows have no heads, says it in the first sentence
 * under them.
 */
export function FeeTable({ fees, note, feePage }: { fees: FeeRow[]; note: ReactNode; feePage: boolean }) {
  const { id } = useParams();
  const cap = fees.some((f) => f.regsCap) ? "regs" : "law";
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
            {f.capNote && <span className="block text-sm text-muted-foreground">{f.capNote}</span>}
            {f.range && <span className="block text-sm text-muted-foreground">{f.range}</span>}
            {f.varies && <span className="block">{f.varies}</span>}
            <RulesLine ids={f.rules} name={f.name} className="pt-1" />
          </div>
        ))}
      </Card>
      <Card className="hidden md:block p-0 md:p-0 overflow-hidden">
        <table className="tbl">
          <TableCols widths={["26%", "34%", "40%"]} />
          <thead>
            <tr>
              <th scope="col">{copy.feeTable.type}</th>
              <th scope="col">{copy.feeTable.base}</th>
              <th scope="col">{copy.feeTable.cap[cap]}</th>
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
                  {f.capNote && <span className="block pt-1 text-sm text-muted-foreground">{f.capNote}</span>}
                  {f.range && <span className="block pt-1 text-sm text-muted-foreground">{f.range}</span>}
                  {f.varies && <span className="block pt-1">{f.varies}</span>}
                  <RulesLine ids={f.rules} name={f.name} className="pt-1" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-sm text-muted-foreground max-w-measure">
        <span className="md:hidden">{copy.feeCapsPhone[cap]} </span>
        {note}
      </p>
      {id && feePage && (
        <TextLink look="line" to={dealPagePath({ wrapper: id })} className="self-start">
          {feePageLink}
        </TextLink>
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

/**
 * The three moments of the money as a rail of 28px circles: one under the other on a phone, the line at the start side and a down
 * chevron in each (UX fix 22); side by side across the page from `lg`, the line along the top and the arrow pointing the way the
 * money goes.
 */
export function TaxSteps({ steps }: { steps: TaxStep[] }) {
  return (
    <ol data-wide className="flex flex-col lg:grid lg:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.id} className="relative ps-10 pb-6 last:pb-0 lg:ps-0 lg:pb-0 lg:pt-11 lg:pe-8">
          {i < steps.length - 1 && <span className="absolute bg-border inset-s-[13px] top-7 bottom-0 w-0.5 lg:inset-s-7 lg:inset-e-0 lg:top-[13px] lg:bottom-auto lg:w-auto lg:h-0.5" aria-hidden="true" />}
          <span className="absolute inset-s-0 top-0 size-7 rounded-full border-2 border-primary bg-card flex items-center justify-center text-primary" aria-hidden="true">
            <span className="lg:hidden">
              <IconChevronDown size={16} />
            </span>
            <span className="max-lg:hidden">
              <IconDrillIn size={16} />
            </span>
          </span>
          <div className="flex flex-col gap-1 lg:h-full">
            <span className="text-sm text-muted-foreground">{s.when}</span>
            <span className="font-medium lg:text-lg lg:font-semibold">{s.headline}</span>
            <span className="text-sm">{s.text}</span>
            {s.tag}
            {s.alt && <span className="text-sm text-muted-foreground">{s.alt}</span>}
            <RulesLine ids={s.rules} name={stepName(s)} className="lg:mt-auto" />
          </div>
        </li>
      ))}
    </ol>
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
        {/* the status sentence is its own line, not glued to the question */}
        {r.mark === "blocked" && <span className="block text-sm text-blocked-foreground">{copy.checklist.blockedLast}</span>}
        {r.rules.length > 0 && (
          <Disclosure look="link" label={copy.checklist.expand} summaryClassName="text-xs [&>svg]:size-4">
            <RulesLine ids={r.rules} className="pb-2" />
          </Disclosure>
        )}
      </div>
    </li>
  );
}

/**
 * What the site took into account for this product: the open questions first, as rows, and the full list
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
      <Disclosure look="link" label={copy.checklist.showAll} openLabel={copy.checklist.hideAll}>
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
          {gershayim(it.label)}
        </Link>
      ))}
    </p>
  );
}

/** The links to the exposures a product can hold. */
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

/** The companies that offer a product, each a link to its page on a line of its own (a 44 px target), in two columns from `md`. */
function CompanyColumns({ companies }: { companies: { id: string; name: string }[] }) {
  return (
    <ul className="text-sm md:columns-2 md:gap-x-10">
      {companies.map((c) => (
        <li key={c.id} className="flex break-inside-avoid">
          <TextLink to={companyPath(c.id)} look="line">
            <bdi>{gershayim(c.name)}</bdi>
          </TextLink>
        </li>
      ))}
    </ul>
  );
}

/** The companies that offer the product, behind one toggle, or shown open (`open`); the "all companies" link stays outside. */
export function InstitutionChips({ companies, allHref, tracks, open }: { companies: { id: string; name: string }[]; allHref: string; /** The product's track browser (`/tracks/<id>`) and the product's name, for the link to every company's tracks of it. */ tracks?: { href: string; name: string }; /** The list shows with no toggle. */ open?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {companies.length > 0 && open && (
        <div className="pb-2">
          <CompanyColumns companies={companies} />
        </div>
      )}
      {companies.length > 0 && !open && (
        <Disclosure look="link" label={copy.companiesShow} openLabel={copy.companiesHide}>
          <div className="pb-2">
            <CompanyColumns companies={companies} />
          </div>
        </Disclosure>
      )}
      <GoLink to={allHref} className="self-start">
        {copy.allCompanies}
      </GoLink>
      {tracks && (
        <GoLink to={tracks.href} className="self-start">
          {trackBrowser.guideLink.before}
          {tracks.name}
          {trackBrowser.guideLink.after}
        </GoLink>
      )}
    </div>
  );
}
