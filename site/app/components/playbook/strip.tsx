// The subject strip of the playbook (design-system 11.3 with the pair patterns): what is known ("מ… ל…", "מ…") and the two
// optional fields over the companies the site knows; a brokerage page adds the two fund fields.
import { useId } from "react";
import { r4playbook as c } from "../../copy";
import { hebrewPrefix } from "../../lib/hebrew";
import type { Side } from "../../lib/playbook";
import { cx } from "../ui";

export interface PairOption {
  id: string;
  name: string;
}

function Pick({ label, value, options, onChange }: { label: string; value: string | null; options: PairOption[]; onChange: (id: string | null) => void }) {
  const id = useId();
  return (
    <div className="field min-w-0">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="field-box">
        <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className="field-input !text-start w-full min-w-0 text-ellipsis">
          <option value="">{c.strip.none}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function PlaybookSubjectStrip({
  from,
  to,
  same,
  companies,
  funds,
  onPair,
  onFunds,
  fundFrom,
  fundTo,
}: {
  from: Side | null;
  to: Side | null;
  same: boolean;
  companies: PairOption[];
  /** Brokerage only: the fund records the site holds. */
  funds?: PairOption[];
  onPair: (patch: { from?: string | null; to?: string | null }) => void;
  onFunds?: (patch: { fundFrom?: string | null; fundTo?: string | null }) => void;
  fundFrom: string | null;
  fundTo: string | null;
}) {
  // a holding of the person's that the company list does not carry is offered under its own name
  const withSide = (side: Side | null) => (side && !companies.some((x) => x.id === side.id) ? [{ id: side.id, name: side.name }, ...companies] : companies);
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-card border border-border p-4" aria-label={c.strip.fieldFrom}>
      <p className={cx("text-base", !from && !to && "text-muted-foreground")}>
        {from && to ? (
          <>
            <bdi>{hebrewPrefix(c.strip.from, from.name)}</bdi> <bdi>{hebrewPrefix(c.strip.to, to.name)}</bdi>
          </>
        ) : from ? (
          <>
            <bdi>{hebrewPrefix(c.strip.fromOnly, from.name)}</bdi>
          </>
        ) : (
          c.strip.pickPair
        )}
      </p>
      {same && <p className="text-sm">{c.strip.same}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Pick label={c.strip.fieldFrom} value={from?.id ?? null} options={withSide(from)} onChange={(id) => onPair({ from: id })} />
        <Pick label={c.strip.fieldTo} value={to?.id ?? null} options={withSide(to)} onChange={(id) => onPair({ to: id })} />
        {funds && onFunds && (
          <>
            <Pick label={c.strip.fundFrom} value={fundFrom} options={funds} onChange={(id) => onFunds({ fundFrom: id })} />
            <Pick label={c.strip.fundTo} value={fundTo} options={funds} onChange={(id) => onFunds({ fundTo: id })} />
          </>
        )}
      </div>
    </section>
  );
}
