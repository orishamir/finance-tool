// The companies page's two panes (routes/companies.tsx): the list of every company in its three groups, and the company in focus. Both
// only draw what the page's state says; lib/company-focus.ts holds the logic. Filtering and searching dim rows in place, never move them.
import { companyFocus as w } from "../../copy";
import { countMark, countWords, matches, productsOnSite, companyGroups, productTypes, type FocusCompany, type FocusData, type FocusFigures, type FocusProduct, type FocusProductKind, type FocusState } from "../../lib/company-focus";
import { assetsText } from "../../lib/track-browser";
import { fmt, formatValue } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { IconDrillIn } from "../icons";
import { ChooseRow, GroupHead, ListRow, MixedName, RowList, TextLink, cx, gershayim } from "../kit";

// ---------------------------------------------------------------- the list

/** The three groups side by side from lg (one under another below it), each a heading with its count and one compact row per company. */
export function CompanyList({ data, state, onFocus }: { data: FocusData; state: FocusState; onFocus: (id: string, el: HTMLElement) => void }) {
  const filtered = state.type !== "all" || !!state.q.trim();
  return (
    <div className="grid gap-6 lg:gap-3 lg:grid-cols-3">
      {companyGroups.map((g) => {
        const list = data.companies.filter((c) => c.group === g);
        const shown = list.filter((c) => matches(data.kinds, c, state)).length;
        return (
          <section key={g} aria-labelledby={`cg-${g}`} className="flex flex-col gap-2 min-w-0">
            <GroupHead as="h2" id={`cg-${g}`} nowrap count={filtered ? <bdi dir="rtl">{w.of(fmt.number(shown), fmt.number(list.length))}</bdi> : fmt.number(list.length)}>
              {w.groups[g]}
            </GroupHead>
            <RowList>
              {list.map((c) => {
                const on = state.product ? c.products.find((p) => p.id === state.product) : undefined;
                return (
                  <ListRow
                    key={c.id}
                    rowId={`co-${c.id}`}
                    title={<MixedName>{c.short}</MixedName>}
                    end={
                      // a fixed slot, so a count coming or going moves nothing
                      <bdi dir="ltr" className="inline-block w-[3ch] text-end tabular-nums text-sm">
                        {countMark(on)}
                      </bdi>
                    }
                    selected={state.focus === c.id}
                    dim={!matches(data.kinds, c, state)}
                    onSelect={() => onFocus(c.id, document.getElementById(`co-${c.id}`)!)}
                  />
                );
              })}
            </RowList>
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- the company in focus

/** A figure of the pane: its sourced value once the page has fetched it (it then opens its source), until then the same text, plain. */
function Fig({ value, text }: { value: SiteValue | null | undefined; text: string }) {
  if (value) return <Num value={value} display={text} />;
  return <span className="whitespace-nowrap">{text}</span>;
}

const pct = (n: number) => formatValue(n, "pct_per_year", "computed");

/** The quiet line of a product's row. */
function ProductLine({ p, figures }: { p: FocusProduct; figures: FocusFigures[string]["products"][string] | undefined }) {
  if (p.tariffGroups) return <>{`${w.tariffGroups} ${p.tariffGroups.join(", ")}`}</>;
  if (p.asOf !== undefined) {
    if (!p.asOf) return null;
    return (
      <>
        {w.asOf}
        <Fig value={figures?.asOf} text={formatValue(p.asOf, "text")} />
      </>
    );
  }
  const parts = [];
  if (p.assets != null) {
    parts.push(
      <span key="a" className="whitespace-nowrap">
        {w.assets} <Fig value={figures?.assets} text={assetsText(p.assets)} />
      </span>,
    );
  }
  if (p.fees) {
    const one = p.fees.low === p.fees.high;
    parts.push(
      <span key="f">
        <span className="whitespace-nowrap">{w.fees}</span> <Fig value={figures?.fees?.low} text={pct(p.fees.low)} />
        {!one && (
          <>
            {" "}
            {w.to} <Fig value={figures?.fees?.high} text={pct(p.fees.high)} />
          </>
        )}
      </span>,
    );
  }
  if (parts.length === 0) return null;
  return (
    <>
      {parts.map((x, i) => (
        <span key={i}>
          {i > 0 && " · "}
          {x}
        </span>
      ))}
    </>
  );
}

/** The company in focus: its name and page, how many products the site has of it, one line about it, its products by kind (each chooses
 *  itself as the filter, its arrow opens it on the company's page), the further sections of its page, and what the site has none of. */
export function FocusPane({ company: c, data, state, figures, onChoose, headId }: { company: FocusCompany; data: FocusData; state: FocusState; figures: FocusFigures | null; onChoose: (productId: string) => void; headId?: string }) {
  const kindOf = (id: string) => data.kinds.find((k) => k.id === id)!;
  const types = productTypes.filter((t) => c.products.some((p) => kindOf(p.id).type === t));
  const mine = new Set(c.products.map((p) => p.id));
  const missing = data.kinds.filter((k) => !mine.has(k.id));
  const own = figures?.[c.id];
  const page = `/companies/${c.id}`;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id={headId} className="text-xl lg:text-2xl font-semibold min-w-0">
            <MixedName>{c.name}</MixedName>
          </h2>
          <TextLink look="line" to={page} className="shrink-0 text-sm">
            {w.fullPage}
            <IconDrillIn size={16} />
          </TextLink>
        </div>
        <p className="text-sm">{productsOnSite(c.products.length)}</p>
        {c.line && (
          <p className="text-sm text-muted-foreground">
            {c.line.kind === "members" ? (
              <>
                {w.members}{" "}
                {c.line.names.map((n, i) => (
                  <span key={n}>
                    {i > 0 && " · "}
                    <MixedName>{n}</MixedName>
                  </span>
                ))}
              </>
            ) : c.line.kind === "tariff" ? (
              <>
                {w.tariffAt}
                <Fig value={own?.line} text={formatValue(c.line.at, "text")} />
              </>
            ) : (
              c.line.text
            )}
          </p>
        )}
      </div>
      <p className="text-[13px] text-muted-foreground">{w.paneHint}</p>
      {types.map((t) => (
        <section key={t} aria-label={w.types[t]} className={cx("flex flex-col gap-2 transition-opacity duration-[var(--duration-base)]", state.type !== "all" && state.type !== t && "opacity-45")}>
          <GroupHead>{w.types[t]}</GroupHead>
          <RowList>
            {c.products
              .filter((p) => kindOf(p.id).type === t)
              .map((p) => {
                const k: FocusProductKind = kindOf(p.id);
                return (
                  <ChooseRow
                    key={p.id}
                    title={k.name}
                    end={countWords(k.unit, p.count)}
                    line={<ProductLine p={p} figures={own?.products[p.id]} />}
                    chosen={state.product === p.id}
                    onChoose={() => onChoose(p.id)}
                    label={k.name}
                    link={{ to: p.href, label: w.open(k.name, gershayim(c.name)) }}
                  />
                );
              })}
          </RowList>
        </section>
      ))}
      {(c.sections.length > 0 || c.terms > 0) && (
        <section aria-label={w.more} className="flex flex-col gap-1">
          <GroupHead>{w.more}</GroupHead>
          <ul className="flex flex-wrap gap-x-4">
            {c.sections.map((s) => (
              <li key={s.id}>
                <TextLink look="line" to={`${page}#${s.id}`} className="text-sm">
                  {s.title}
                </TextLink>
              </li>
            ))}
            {c.terms > 0 && (
              <li>
                <TextLink look="line" to={`${page}#company-terms`} className="text-sm">
                  {w.terms}
                  <bdi dir="ltr" className="text-muted-foreground tabular-nums">
                    {fmt.number(c.terms)}
                  </bdi>
                </TextLink>
              </li>
            )}
          </ul>
        </section>
      )}
      {missing.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {w.notHere} {missing.map((k) => k.name).join(", ")}
        </p>
      )}
    </div>
  );
}

