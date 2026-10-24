// The change-log page's parts (design-spec 24, design-system 9.5): the since picker, the counts line, the collection
// chips, the two groups, a collection's disclosure, a change-log row and a folded snapshot row. The log's reasons
// are kept as the file wrote them, behind a disclosure (`dir="auto"`, never paraphrased into a claim).
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { parametersPage, r5 } from "../../copy";
import { fmt } from "../../lib/format";
import { DateField } from "../holdings/fields";
import { Tpl } from "../exposure-mode/tpl";
import { Button, Disclosure, cx } from "../ui";

// ---------------------------------------------------------------- the rows' shapes

export interface Line {
  date: string;
  collection: string;
  id: string;
  field: string;
  old: unknown;
  new: unknown;
  reason: string;
  affects_rankings: boolean;
}

export interface Resolvers {
  parameters: Record<string, string>;
  deposits: Record<string, string>;
  exposures: string[];
  wrappers: string[];
}

export type RowItem = { kind: "line"; line: Line } | { kind: "snapshot"; date: string; collection: string; id: string; reason: string; lines: Line[] };

/** Lines that share a date, a collection, an id and a reason fold into one row (flow 36 step 4); a lone line stays a line. */
export function fold(lines: Line[]): RowItem[] {
  const groups = new Map<string, Line[]>();
  for (const l of lines) {
    const k = [l.date, l.collection, l.id, l.reason].join("\u0000");
    const g = groups.get(k);
    if (g) g.push(l);
    else groups.set(k, [l]);
  }
  return [...groups.values()].map((g) => (g.length > 1 ? { kind: "snapshot", date: g[0]!.date, collection: g[0]!.collection, id: g[0]!.id, reason: g[0]!.reason, lines: g } : { kind: "line", line: g[0]! }));
}

const fieldWords: Record<string, string> = { "*": "כל הרשומה", record: "הרשומה", names: "שמות", "(prose)": "הטקסט", rule: "הכלל", tariff: "התעריפון", identity: "פרטי זיהוי" };

/** The page of an entry, where the site has one. */
export function entryHref(l: { collection: string; id: string }, r: Resolvers): string | undefined {
  switch (l.collection) {
    case "rules":
    case "il-finance":
      return `/rules#${l.id}`;
    case "parameters":
      return r.parameters[l.id] ? `/parameters#${r.parameters[l.id]}` : "/parameters";
    case "terms/deposits":
      return r.deposits[l.id] ? `/companies/${r.deposits[l.id]}` : undefined;
    case "instruments/exposures":
      return r.exposures.includes(l.id) ? `/exposure/${l.id}` : undefined;
    case "instruments/wrappers":
      return r.wrappers.includes(l.id) ? `/guide/${l.id}` : undefined;
    case "site/content/guide":
      return `/guide/${l.id}`;
    default:
      return undefined;
  }
}

function Entry({ l, r }: { l: { collection: string; id: string }; r: Resolvers }) {
  const href = entryHref(l, r);
  const name = l.collection === "parameters" && r.parameters[l.id] ? (parametersPage.names[r.parameters[l.id] as keyof typeof parametersPage.names] ?? l.id) : null;
  const body = (
    <>
      {name && <bdi className="me-1.5">{name}</bdi>}
      <bdi dir="ltr" className="num-id text-sm">
        {l.id}
      </bdi>
    </>
  );
  return href ? (
    <Link to={href} className="text-link hover:underline">
      {body}
    </Link>
  ) : (
    <span>{body}</span>
  );
}

function FieldCell({ field }: { field: string }) {
  const known = fieldWords[field];
  return known ? <span>{known}</span> : <bdi dir="ltr" className="num-id text-xs [overflow-wrap:anywhere]">{field}</bdi>;
}

/** A value from the log: a number or a short text inline, `null` as words, anything else as data in a disclosure. */
export function LogValue({ v, side }: { v: unknown; side: "old" | "new" }) {
  if (v === null || v === undefined) return <span className="text-muted-foreground">{side === "old" ? r5.changes.values.none : r5.changes.values.removed}</span>;
  if (typeof v === "number") return <bdi dir="ltr" className="num-id">{fmt.number(v)}</bdi>;
  if (typeof v === "boolean") return <span>{v ? "כן" : "לא"}</span>;
  if (typeof v === "string" && v.length <= 120) return <bdi dir="auto" className="[overflow-wrap:anywhere]">{v}</bdi>;
  const text = typeof v === "string" ? v : JSON.stringify(v, null, 2);
  return (
    <Disclosure label={<span className="text-xs">{typeof v === "string" ? r5.changes.values.detail : r5.changes.objectLabel}</span>} summaryClassName="text-sm">
      <pre dir="ltr" className="text-xs font-mono whitespace-pre-wrap [overflow-wrap:anywhere] max-h-60 overflow-auto mt-1 text-start">
        {text}
      </pre>
    </Disclosure>
  );
}

/** The log's own reason is English prose written for the founder: kept behind a disclosure, never shown as the change's description. */
function Reason({ text, className }: { text: string; className?: string }) {
  return (
    <Disclosure label={<span className="text-xs">{r5.changes.reasonLabel}</span>} summaryClassName="text-xs text-link min-h-9 justify-start gap-1" className={className}>
      <p dir="auto" className="text-xs text-muted-foreground [overflow-wrap:anywhere] text-start">
        {text}
      </p>
    </Disclosure>
  );
}

const grid = "md:grid md:grid-cols-[6.5rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)] md:gap-x-4";

export function ChangeRow({ line, r }: { line: Line; r: Resolvers }) {
  return (
    <li className={cx("py-3 border-b border-border last:border-b-0 flex flex-col gap-1", grid)}>
      <bdi dir="ltr" className="text-sm text-muted-foreground md:text-foreground">
        {fmt.date(line.date)}
      </bdi>
      <span className="font-medium min-w-0 [overflow-wrap:anywhere]">
        <span className="block text-xs font-normal text-muted-foreground">{r5.changes.collectionNames[line.collection] ?? r5.changes.unknownCollection}</span>
        <Entry l={line} r={r} />
      </span>
      <span className="text-sm min-w-0">
        <FieldCell field={line.field} />
      </span>
      <span className="text-sm min-w-0 flex gap-2 md:block">
        <span className="md:hidden text-muted-foreground">{r5.changes.columns.old}</span>
        <LogValue v={line.old} side="old" />
      </span>
      <span className="text-sm min-w-0 flex gap-2 md:block">
        <span className="md:hidden text-muted-foreground">{r5.changes.columns.now}</span>
        <LogValue v={line.new} side="new" />
      </span>
      <Reason text={line.reason} className="md:col-span-5 md:mt-0.5" />
    </li>
  );
}

export function SnapshotRow({ row, r }: { row: Extract<RowItem, { kind: "snapshot" }>; r: Resolvers }) {
  const [shown, setShown] = useState(0);
  return (
    <li className="py-3 border-b border-border last:border-b-0 flex flex-col gap-1">
      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <bdi dir="ltr" className="text-sm text-muted-foreground">
          {fmt.date(row.date)}
        </bdi>
        <span className="text-xs text-muted-foreground">{r5.changes.collectionNames[row.collection] ?? r5.changes.unknownCollection}</span>
        <span className="font-medium [overflow-wrap:anywhere]">
          <Tpl t={r5.changes.snapshot} vars={{ id: <Entry l={row} r={r} />, n: <bdi dir="ltr" className="num-id">{fmt.number(row.lines.length)}</bdi> }} />
        </span>
      </span>
      <Reason text={row.reason} />
      {shown === 0 ? (
        <Button variant="quiet" className="self-start text-sm -ms-2" onClick={() => setShown(50)}>
          {r5.changes.snapshotDetail}
        </Button>
      ) : (
        <div className="flex flex-col">
          <ul>
            {row.lines.slice(0, shown).map((l, i) => (
              <li key={i} className={cx("py-2 border-t border-border text-sm flex flex-col gap-0.5", "md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.3fr)] md:gap-x-4")}>
                <FieldCell field={l.field} />
                <span className="flex gap-2 md:block">
                  <span className="md:hidden text-muted-foreground">{r5.changes.columns.old}</span>
                  <LogValue v={l.old} side="old" />
                </span>
                <span className="flex gap-2 md:block">
                  <span className="md:hidden text-muted-foreground">{r5.changes.columns.now}</span>
                  <LogValue v={l.new} side="new" />
                </span>
              </li>
            ))}
          </ul>
          <span className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
            <Tpl t={r5.changes.snapshotOf} vars={{ n: Math.min(shown, row.lines.length), m: row.lines.length }} />
            {shown < row.lines.length && (
              <Button variant="quiet" className="text-sm" onClick={() => setShown((s) => s + 50)}>
                {r5.changes.snapshotMore}
              </Button>
            )}
          </span>
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------- a collection and the groups

export function CollectionDisclosure({ name, count, rows, open, r }: { name: string; count: number; rows: RowItem[]; open: boolean; r: Resolvers }) {
  const [limit, setLimit] = useState(200);
  return (
    <Disclosure
      defaultOpen={open}
      className="border-b border-border"
      summaryClassName="font-medium"
      label={
        <span>
          {name} <span className="text-muted-foreground font-normal">({fmt.number(count)})</span>
        </span>
      }
    >
      <div className="hidden md:block text-xs text-muted-foreground">
        <div className={cx("pb-1 border-b border-border", grid)}>
          <span>{r5.changes.columns.date}</span>
          <span>{r5.changes.columns.what}</span>
          <span>{r5.changes.columns.field}</span>
          <span>{r5.changes.columns.old}</span>
          <span>{r5.changes.columns.now}</span>
        </div>
      </div>
      <ul>
        {rows.slice(0, limit).map((row, i) => (row.kind === "line" ? <ChangeRow key={i} line={row.line} r={r} /> : <SnapshotRow key={i} row={row} r={r} />))}
      </ul>
      {rows.length > limit && (
        <Button variant="quiet" className="text-sm" onClick={() => setLimit((l) => l + 200)}>
          <Tpl t={r5.changes.showAll} vars={{ n: rows.length - limit }} />
        </Button>
      )}
    </Disclosure>
  );
}

export function AffectsGroup({ affects, count, defaultOpen, children }: { affects: boolean; count: number; defaultOpen: boolean; children: ReactNode }) {
  const title = affects ? r5.changes.groups.affects : r5.changes.groups.other;
  return (
    <section className="flex flex-col gap-2" aria-label={title}>
      <Disclosure
        defaultOpen={defaultOpen}
        summaryClassName="text-xl lg:text-2xl font-semibold"
        label={
          <h2 className="text-xl lg:text-2xl font-semibold">
            {title} <span className="text-muted-foreground font-normal text-base">({fmt.number(count)})</span>
          </h2>
        }
      >
        <div className="flex flex-col">{children}</div>
      </Disclosure>
    </section>
  );
}

// ---------------------------------------------------------------- the picker, the counts, the chips

export function SincePicker({
  since,
  until,
  today,
  defaultLine,
  chips,
  onSince,
  onUntil,
}: {
  since: string;
  until: string | null;
  today: string;
  defaultLine: string | null;
  chips: { key: string; label: string; date: string }[];
  onSince: (d: string) => void;
  onUntil: (d: string | null) => void;
}) {
  const [draft, setDraft] = useState(since);
  const [error, setError] = useState<string | null>(null);
  const [lastSince, setLastSince] = useState(since);
  if (lastSince !== since) {
    setLastSince(since);
    setDraft(since);
    setError(null);
  }
  const change = (v: string) => {
    setDraft(v);
    if (v === "") return;
    if (v > today) {
      setError(r5.changes.errDate);
      return;
    }
    setError(null);
    onSince(v);
  };
  return (
    <div className="flex flex-col gap-2 sticky top-14 lg:static z-[var(--z-sticky)] -mx-gutter px-gutter py-2 lg:mx-0 lg:px-0 lg:py-0 bg-background/90 backdrop-blur lg:bg-transparent lg:backdrop-blur-none">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
        <div className="lg:w-60">
          <DateField label={r5.changes.since} value={draft} max={today} onChange={change} error={error} />
        </div>
        <div role="group" aria-label={r5.changes.chipsAria} className="-mx-gutter px-gutter lg:mx-0 lg:px-0 flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible pb-1 scrollbar-none">
          {chips.map((c) => (
            <button key={c.key} type="button" aria-pressed={c.date === since} onClick={() => onSince(c.date)} className={cx("sec-chip border border-border shrink-0", c.date === since ? "sec-chip-on" : "bg-card hover:bg-accent")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      {defaultLine && <p className="text-sm text-muted-foreground">{defaultLine}</p>}
      <Disclosure label={r5.changes.until} defaultOpen={until !== null} summaryClassName="text-sm text-link">
        <div className="lg:w-60 pt-1">
          <DateField label={r5.changes.until} value={until ?? ""} max={today} onChange={(v) => onUntil(v === "" ? null : v)} />
        </div>
      </Disclosure>
    </div>
  );
}

export function CollectionChips({ collections, selected, onToggle }: { collections: { key: string; name: string; count: number }[]; selected: string[]; onToggle: (key: string) => void }) {
  return (
    <div role="group" aria-label={r5.changes.filters.collections} className="-mx-gutter px-gutter lg:mx-0 lg:px-0 flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible pb-1 scrollbar-none">
      {collections.map((c) => {
        const on = selected.includes(c.key);
        return (
          <button key={c.key} type="button" aria-pressed={on} onClick={() => onToggle(c.key)} className={cx("sec-chip border border-border shrink-0", on ? "sec-chip-on" : "bg-card hover:bg-accent")}>
            {c.name} <span className="text-muted-foreground">({fmt.number(c.count)})</span>
          </button>
        );
      })}
    </div>
  );
}
