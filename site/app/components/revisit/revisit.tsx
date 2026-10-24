// The choose and save buttons, the revisit line and banner, the what-changed sheet and its rows (design-spec 21.3 and
// 23, design-system 9.4). The words are copy.md 9.3; the verdict is two booleans from the engine in fixed sentences.
import { Fragment, useId, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { r2, r5 } from "../../copy";
import { fmt } from "../../lib/format";
import type { DiffRowView, GoalChange, RevisitView, Rendered, ValueChange } from "../../lib/revisit";
import { entered } from "../../lib/value";
import { todayLocal } from "../../lib/today";
import { Sheet } from "../Sheet";
import { IconAlert, IconCheck, IconLock } from "../icons";
import { Num } from "../provenance";
import { Button, Callout, Disclosure, Tag, cx } from "../ui";
import { Tpl } from "../exposure-mode/tpl";

const date = (iso: string) => <bdi dir="ltr">{fmt.date(iso)}</bdi>;

// ---------------------------------------------------------------- choose and save

/** "בחרתי בזה" on a ranked row: quiet, 44px; the label turns into the confirmation with its date (design-spec 21.3). */
export function ChooseButton({ chosenOn, onChoose, onUnchoose }: { chosenOn?: string; onChoose: () => void; onUnchoose: () => void }) {
  if (chosenOn) {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <span className="text-sm inline-flex items-center gap-1.5 min-h-target text-positive-foreground">
          <IconCheck size={16} className="text-positive" />
          <Tpl t={r5.exposure.choose.chosen} vars={{ date: date(chosenOn) }} />
        </span>
        <Button variant="quiet" className="text-sm" onClick={onUnchoose}>
          {r5.exposure.choose.unchoose}
        </Button>
      </span>
    );
  }
  return (
    <Button variant="quiet" className="text-sm" onClick={onChoose}>
      {r5.exposure.choose.button}
    </Button>
  );
}

/** "לשמור את ההשוואה": with one saved, "נשמרה ב־{תאריך}" and "לשמור שוב" with the inline confirm naming the old date. */
export function SaveComparisonButton({ savedOn, onSave, failed }: { savedOn?: string; onSave: () => void; failed?: boolean }) {
  const [confirm, setConfirm] = useState(false);
  const s = r5.exposure.save;
  return (
    <div className="flex flex-col gap-1.5 items-start">
      {savedOn ? (
        confirm ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm">
              <Tpl t={s.confirm} vars={{ date: date(savedOn) }} />
            </span>
            <span className="flex items-center gap-2">
              <Button
                variant="quiet"
                onClick={() => {
                  onSave();
                  setConfirm(false);
                }}
              >
                {s.replace}
              </Button>
              <Button variant="quiet" onClick={() => setConfirm(false)}>
                {s.cancel}
              </Button>
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-2 flex-wrap text-sm">
            <span className="inline-flex items-center gap-1.5">
              <IconCheck size={16} className="text-positive" />
              <Tpl t={s.saved} vars={{ date: date(savedOn) }} />
            </span>
            <Button variant="quiet" className="text-sm" onClick={() => setConfirm(true)}>
              {s.again}
            </Button>
          </span>
        )
      ) : (
        <Button variant="secondary" onClick={onSave}>
          {s.button}
        </Button>
      )}
      {failed && <p className="text-xs text-caution-foreground">{s.failed}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- the notice

const joinHe = (parts: string[]): string => (parts.length <= 1 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} ו${parts[parts.length - 1]}`);

/** The `{מה}` of the notice: the one changed entry, or the counts by kind (copy 9.3). */
function whatText(v: RevisitView): { text: string; plural: boolean } {
  const w = r5.revisit.what;
  const single = v.notice?.single;
  if (single) {
    const text = single.kind === "rule" ? w.rule.replace("{code}", single.code) : single.kind === "parameter" ? w.parameter.replace("{name}", single.label) : single.kind === "data" ? w.data.replace("{name}", single.label) : w.assumption.replace("{name}", single.label);
    return { text, plural: false };
  }
  const c = r5.revisit.counts;
  const parts = [v.counts.rule ? c.rules.replace("{n}", String(v.counts.rule)) : "", v.counts.parameter ? c.parameters.replace("{n}", String(v.counts.parameter)) : "", v.counts.data ? c.data.replace("{n}", String(v.counts.data)) : "", v.counts.assumption ? c.assumptions.replace("{n}", String(v.counts.assumption)) : ""].filter(Boolean);
  return { text: joinHe(parts), plural: true };
}

/** "שנות החיסכון: מ־15 ל־20 שנים", and "ועוד שינוי אחד" or "ועוד 3 שינויים" for the rest (audit 2026-10-24, A30). */
function goalChangeNode(changes: GoalChange[]): ReactNode {
  const r = r5.revisit;
  const f = changes[0]!;
  const label = r.goalFields[f.field];
  const today = todayLocal();
  const first = f.values ? (
    <Tpl
      t={r.goalChange}
      vars={{
        label,
        before: <Num value={entered(f.values.before, f.values.unit, today)} display={f.values.unit === "years" ? fmt.number(f.values.before) : undefined} />,
        after: <Num value={entered(f.values.after, f.values.unit, today)} display={f.values.unit === "years" ? fmt.years(f.values.after) : undefined} />,
      }}
    />
  ) : (
    label
  );
  if (changes.length === 1) return first;
  const n = changes.length - 1;
  return <Tpl t={r.goalChangeMore} vars={{ first, more: n === 1 ? r.goalChangeMoreOne : <Tpl t={r.goalChangeMoreMany} vars={{ n: <Num value={entered(n, "count", today)} /> }} /> }} />;
}

/** The strip's line text, as a string with the date in its own isolate. */
export function noticeNode(v: RevisitView): ReactNode {
  const r = r5.revisit;
  if (v.goalChanges?.length) return <Tpl t={r.goalChanged} vars={{ what: <bdi>{goalChangeNode(v.goalChanges)}</bdi> }} />;
  if (v.status === "unchanged") return <Tpl t={r.unchanged} vars={{ date: date(v.savedOn) }} />;
  if (v.status === "unreadable") return r.unreadable;
  if (v.status === "cannot-run") return <Tpl t={r.verdict.cannotRun} vars={{ reason: <bdi dir="ltr" className="text-xs">{v.cannotRun}</bdi> }} />;
  if (v.diff.length === 0) return <Tpl t={r.changedRanking} vars={{ date: date(v.savedOn) }} />;
  const { text, plural } = whatText(v);
  const when = v.notice?.date;
  const t = when ? (plural ? r.changedMany : r.changed) : plural ? r.changedSinceMany : r.changedSince;
  return <Tpl t={t} vars={{ what: <bdi>{text}</bdi>, date: date(when ?? v.savedOn) }} />;
}

/** The strip's second line (design-spec 21.3 `RevisitLine`): saved date and choice, then the notice and "מה השתנה". */
export function RevisitLine({ view, savedOn, choice, computing, onOpen }: { view: RevisitView | null; savedOn: string; choice?: { name: string }; computing: boolean; onOpen: () => void }) {
  const r = r5.revisit;
  const changed = view && (view.status === "changed" || view.status === "cannot-run" || !!view.goalChanges?.length);
  return (
    <span className="text-xs flex flex-wrap items-center gap-x-3 gap-y-0.5 text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        {choice && <IconCheck size={14} className="text-positive" />}
        {choice ? <Tpl t={r.stripSavedChoice} vars={{ date: date(savedOn), choice: <bdi>{choice.name}</bdi> }} /> : <Tpl t={r.stripSaved} vars={{ date: date(savedOn) }} />}
      </span>
      {computing || !view ? (
        <span className="animate-pulse">{r.computing}</span>
      ) : view.status === "unreadable" ? (
        <span className="text-caution-foreground inline-flex items-center gap-1">
          <IconAlert size={14} className="text-caution" />
          {r.unreadable}
        </span>
      ) : (
        <span className={cx("inline-flex items-center gap-1", changed ? "text-caution-foreground" : "text-muted-foreground")}>
          {changed && <IconAlert size={14} className="text-caution shrink-0" />}
          {noticeNode(view)}
          {view.status !== "unchanged" && view.diff.length > 0 && !view.goalChanges?.length && (
            <button type="button" className="text-link hover:underline ms-1" onClick={onOpen}>
              {r.banner.sheet}
            </button>
          )}
          {view.status === "unchanged" && (
            <button type="button" className="text-link hover:underline ms-1" onClick={onOpen}>
              {r.banner.sheet}
            </button>
          )}
        </span>
      )}
    </span>
  );
}

/** The compact strip's icon and two words (company and track pages). */
export function CompactRevisit({ view }: { view: RevisitView | null }) {
  if (!view || view.status === "unreadable") return null;
  const changed = view.status !== "unchanged" || !!view.goalChanges?.length;
  return (
    <span className={cx("inline-flex items-center gap-1 text-sm", changed ? "text-caution-foreground" : "text-muted-foreground")}>
      {changed && <IconAlert size={14} className="text-caution" />}
      {changed ? r5.revisit.compact.changed : r5.revisit.compact.unchanged}
    </span>
  );
}

// ---------------------------------------------------------------- the banner

function verdictText(v: RevisitView): ReactNode {
  const r = r5.revisit.verdict;
  const n = (id?: string) => <bdi className="font-medium">{id ? (v.names[id] ?? id) : ""}</bdi>;
  if (v.verdict === "none") return r.none;
  if (v.verdict === "top-changed") return <Tpl t={r.topChanged} vars={{ option: n(v.after?.top), before: n(v.before?.top) }} />;
  if (v.verdict === "tie-set-changed") return <Tpl t={r.tieSet} vars={{ names: <bdi>{(v.after?.tieSet ?? []).map((id) => v.names[id] ?? id).join(", ")}</bdi> }} />;
  return <Tpl t={r.holds} vars={{ option: n(v.after?.top) }} />;
}

function choiceLine(v: RevisitView): ReactNode {
  const r = r5.revisit;
  if (!v.choice) return null;
  const name = <bdi>{v.choice.name}</bdi>;
  const now = v.choiceNow;
  if (!now) return null;
  if (now.kind === "ranked" && now.rank) return <p className="text-sm"><Tpl t={r.choiceStill} vars={{ option: name, n: now.rank }} /></p>;
  const outcome = now.kind === "gone" ? r.choiceGone : (r.outcomes[now.kind] ?? now.kind);
  return (
    <p className="text-sm text-caution-foreground">
      <Tpl t={r.choiceNot} vars={{ option: name, outcome, reason: <bdi>{now.reason ?? ""}</bdi> }} />
    </p>
  );
}

export function RevisitBanner({ view, onOpen, onSaveAgain }: { view: RevisitView; onOpen: () => void; onSaveAgain: () => void }) {
  const r = r5.revisit;
  const [confirm, setConfirm] = useState(false);
  if (view.status === "unreadable") return null;
  const save = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
      {view.status !== "unchanged" || view.diff.length > 0 ? (
        <Button variant="quiet" className="text-sm -ms-2" onClick={onOpen}>
          {r.banner.sheet}
        </Button>
      ) : null}
      {confirm ? (
        <span className="flex items-center gap-2 flex-wrap text-sm">
          <Tpl t={r5.exposure.save.confirm} vars={{ date: date(view.savedOn) }} />
          <Button variant="quiet" onClick={() => (onSaveAgain(), setConfirm(false))}>
            {r5.exposure.save.replace}
          </Button>
          <Button variant="quiet" onClick={() => setConfirm(false)}>
            {r5.exposure.save.cancel}
          </Button>
        </span>
      ) : (
        <Button variant="quiet" className="text-sm" onClick={() => setConfirm(true)}>
          {r.banner.saveToday}
        </Button>
      )}
    </div>
  );
  if (view.goalChanges?.length) {
    // the saved comparison is about the goal as it was: no verdict, only what changed and the way to save again
    return (
      <Callout tone="caution">
        <div className="flex flex-col gap-1.5">
          <p className="font-medium">{noticeNode(view)}</p>
          {save}
        </div>
      </Callout>
    );
  }
  if (view.status === "unchanged") {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-1 text-sm">
        <p className="text-muted-foreground">
          <Tpl t={r.resultUnchanged} vars={{ date: date(view.savedOn) }} />
        </p>
        {choiceLine(view)}
        {save}
      </div>
    );
  }
  if (view.status === "cannot-run") {
    return (
      <Callout tone="caution">
        <div className="flex flex-col gap-1">
          <p className="font-medium flex items-center gap-1.5">
            <IconLock size={16} className="text-blocked" />
            <Tpl t={r.verdict.cannotRun} vars={{ reason: <bdi dir="ltr" className="text-xs">{view.cannotRun}</bdi> }} />
          </p>
          {save}
        </div>
      </Callout>
    );
  }
  const topFirst = view.verdict === "top-changed";
  const notice = <p>{noticeNode(view)}</p>;
  const verdict = <p className="font-medium">{verdictText(view)}</p>;
  return (
    <Callout tone="caution">
      <div className="flex flex-col gap-1.5">
        {topFirst ? verdict : notice}
        {topFirst ? notice : verdict}
        {choiceLine(view)}
        {save}
      </div>
    </Callout>
  );
}

// ---------------------------------------------------------------- the sheet

function RenderedValue({ v }: { v: Rendered }): ReactNode {
  if (v === null) return <span className="text-muted-foreground">{r5.revisit.sheet.notThere}</span>;
  if (v.kind === "num") return <Num value={v.value} />;
  if (v.kind === "table")
    return (
      <Disclosure label={<span className="text-xs">{r5.revisit.sheet.detail}</span>} summaryClassName="text-sm">
        <table className="tbl text-xs mt-1">
          <tbody>
            {v.rows.map((b, i) => (
              <tr key={i}>
                <td>
                  <bdi dir="ltr">{b.upTo === null ? "∞" : fmt.number(b.upTo)}</bdi>
                </td>
                <td>
                  <bdi dir="ltr">{fmt.pct(b.rate * (b.rate <= 1 ? 100 : 1))}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Disclosure>
    );
  return <bdi dir="auto">{v.text}</bdi>;
}

export function DiffRow({ row }: { row: DiffRowView }) {
  const s = r5.revisit.sheet;
  return (
    <li className="py-3 border-b border-border last:border-b-0 flex flex-col gap-1">
      <span className="font-medium flex items-center gap-2 flex-wrap">
        {row.kind === "rule" ? (
          <>
            <Link to={`/rules#${row.code}`} className="rule-chip">
              <bdi dir="ltr">{row.code}</bdi>
            </Link>
            <span className="text-sm text-muted-foreground">
              <bdi dir="ltr">{row.key.split("/")[1]}</bdi>
            </span>
          </>
        ) : row.href ? (
          <Link to={row.href} className="text-link hover:underline">
            <bdi>{row.label}</bdi>
          </Link>
        ) : (
          <bdi dir="ltr" className="text-sm">
            {row.label}
          </bdi>
        )}
        {row.kind === "parameter" && (
          <bdi dir="ltr" className="text-xs text-muted-foreground">
            {row.code}
          </bdi>
        )}
      </span>
      {row.removed ? (
        <span className="text-sm flex items-center gap-1.5">
          <IconLock size={14} className="text-blocked" />
          {row.kind === "data" ? s.fileGone : s.removed}
        </span>
      ) : row.added && row.kind === "data" ? (
        <span className="text-sm">{s.added}</span>
      ) : row.recheckedOnly ? (
        <span className="text-sm text-muted-foreground">{s.rechecked}</span>
      ) : row.stateChange ? (
        <span className="text-sm">{s.stateChange}</span>
      ) : null}
      {!row.removed && !row.recheckedOnly && !row.stateChange && !(row.added && row.kind === "data") && (
        <span className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
          <Tpl t={s.was} vars={{ v: <RenderedValue v={row.old} /> }} />
          <span aria-hidden="true">·</span>
          <Tpl t={s.now} vars={{ v: <RenderedValue v={row.new} /> }} />
        </span>
      )}
      {(row.oldChecked || row.newChecked) && (
        <span className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
          {row.oldChecked && <Tpl t={s.checked} vars={{ date: date(row.oldChecked) }} />}
          {row.newChecked && row.newChecked !== row.oldChecked && <Tpl t={s.checked} vars={{ date: date(row.newChecked) }} />}
        </span>
      )}
    </li>
  );
}

function ValueChangeRow({ c, nis }: { c: ValueChange; nis: (v: number, about: string) => ReactNode }) {
  const s = r5.revisit.sheet;
  return (
    <li className="py-2 border-b border-border last:border-b-0 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
      <Tpl t={s.valueChange} vars={{ option: <bdi className="font-medium">{c.name}</bdi>, a: c.before ? nis(c.before.real, c.name) : "—", b: c.after ? nis(c.after.real, c.name) : "—" }} />
      {!c.before && <Tag tone="positive">{s.tags.new}</Tag>}
      {!c.after && <Tag tone="neutral">{s.tags.left}</Tag>}
    </li>
  );
}

function BeforeAfter({ view }: { view: RevisitView }) {
  const s = r5.revisit.sheet;
  const col = (res: RevisitView["before"], head: ReactNode) => (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-xs text-muted-foreground">{head}</span>
      {res?.top ? <Tpl t={s.rows.top} vars={{ option: <bdi className="font-medium">{view.names[res.top] ?? res.top}</bdi> }} /> : <span>{s.rows.none}</span>}
      {res && res.tieSet.length > 1 ? <Tpl t={s.rows.tie} vars={{ names: <bdi>{res.tieSet.map((id) => view.names[id] ?? id).join(", ")}</bdi> }} /> : res?.top ? <span className="text-muted-foreground">{s.rows.noTie}</span> : null}
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      {col(view.before, <Tpl t={s.columns.before} vars={{ date: date(view.savedOn) }} />)}
      {col(view.after, s.columns.now)}
    </div>
  );
}

export function WhatChangedSheet({ view, open, onClose, anchor, nis, today }: { view: RevisitView; open: boolean; onClose: () => void; anchor: HTMLElement | null; nis: (v: number, about: string) => ReactNode; today: string }) {
  const s = r5.revisit.sheet;
  const [more, setMore] = useState<Record<string, boolean>>({});
  const titleId = useId();
  const kinds = ["rule", "parameter", "data", "assumption"] as const;
  void today;
  return (
    <Sheet open={open} onClose={onClose} anchor={anchor} pc="center" height={100} labelledBy={titleId}>
      <h2 id={titleId} className="text-lg font-semibold mb-3">
        <Tpl t={s.title} vars={{ date: date(view.savedOn) }} />
      </h2>
      {view.diff.length === 0 && <p className="text-muted-foreground mb-3">{s.empty}</p>}
      {kinds.map((k) => {
        const rows = view.diff.filter((d) => d.kind === k);
        if (rows.length === 0) return null;
        const shown = more[k] ? rows : rows.slice(0, 3);
        return (
          <section key={k} className="mb-4">
            <h4 className="font-medium">
              {s.kinds[k]} <span className="text-muted-foreground font-normal">({rows.length})</span>
            </h4>
            <ul>
              {shown.map((d) => (
                <DiffRow key={d.key} row={d} />
              ))}
            </ul>
            {rows.length > shown.length && (
              <Button variant="quiet" className="text-sm" onClick={() => setMore((m) => ({ ...m, [k]: true }))}>
                <Tpl t={s.more} vars={{ n: rows.length - shown.length }} />
              </Button>
            )}
          </section>
        );
      })}
      {view.valueChanges.length > 0 && (
        <section className="mb-4">
          <h4 className="font-medium">{s.valueChanges}</h4>
          <ul>
            {view.valueChanges.map((c) => (
              <ValueChangeRow key={c.id} c={c} nis={nis} />
            ))}
          </ul>
        </section>
      )}
      {view.before && view.after && (
        <section className="mb-4">
          <h4 className="font-medium mb-1">{s.beforeAfter}</h4>
          <BeforeAfter view={view} />
        </section>
      )}
    </Sheet>
  );
}

// ---------------------------------------------------------------- the unreadable form

export function UnreadableSavedForm({ view, onRedo, onDelete }: { view: RevisitView; onRedo: () => void; onDelete: () => void }) {
  const r = r5.revisit;
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-2 text-sm">
      <p className="text-caution-foreground flex items-start gap-2">
        <IconAlert size={16} className="text-caution shrink-0 mt-1" />
        {r.unreadable}
      </p>
      <p className="text-muted-foreground">
        {view.savedOn ? <Tpl t={r.stripSaved} vars={{ date: date(view.savedOn) }} /> : null}
        {view.choice ? (
          <Fragment>
            {" · "}
            <Tpl t={r.stripSavedChoice.split(" · ")[1]!} vars={{ choice: <bdi>{view.choice.name}</bdi> }} />
          </Fragment>
        ) : null}
      </p>
      {confirm ? (
        <span className="flex items-center gap-2 flex-wrap">
          {r.deleteConfirm}
          <Button variant="destructive" onClick={onDelete}>
            {r.deleteYes}
          </Button>
          <Button variant="quiet" onClick={() => setConfirm(false)}>
            {r.deleteNo}
          </Button>
        </span>
      ) : (
        <span className="flex items-center gap-2 flex-wrap">
          <Button variant="quiet" onClick={onRedo}>
            {r.unreadableActions.redo}
          </Button>
          <Button variant="destructive" onClick={() => setConfirm(true)}>
            {r.unreadableActions.del}
          </Button>
        </span>
      )}
    </div>
  );
}

export { r2 };
