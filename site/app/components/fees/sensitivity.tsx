// "What would change the conclusion" on the fee page (design-spec 12, flow 20 step 9): F-81 over the verdicts and
// the largest fee. One row per assumption; rows that flip first.
import { Link } from "react-router";
import type { ParameterRecord, ValueObject } from "@finance-tool/schema";
import { numbers, r3fees, site } from "../../copy";
import { asParameter, parameterOf, type CompareBundle } from "../../lib/compare";
import type { Analysis, FeeSensRow, FeeSensitivity } from "../../lib/fees";
import { fmt } from "../../lib/format";
import type { FieldKey } from "../../lib/goal";
import { Num } from "../provenance";
import { Tag, cx } from "../ui";

type Bounds = Record<string, { lo: ValueObject; hi: ValueObject }>;

function value(an: Analysis, row: FeeSensRow, v: number) {
  const s = r3fees.sens;
  if (row.unit === "fraction") return <Num value={an.mk.plain(v * 100, "pct_per_year", "F-81", row.label)} />;
  if (row.unit === "years") return <Num value={an.mk.plain(v, "years", "F-81", row.label)} display={fmt.years(Number(v.toFixed(2)))} />;
  // a fee axis moves a multiple of the rate: show the rate that multiple makes
  const pct = row.ratePct !== undefined ? v * row.ratePct : v;
  void s;
  return <Num value={an.mk.plain(pct, "pct", "F-81", row.label)} />;
}

function Row({ row, an, onOpen, p02 }: { row: FeeSensRow; an: Analysis; onOpen: (f: FieldKey, suggested: number) => void; p02: { param: ParameterRecord; bounds: Bounds } }) {
  const s = r3fees.sens;
  const flip = row.flip;
  let text: React.ReactNode;
  if (flip && flip.kind === "verdict") {
    text = (
      <>
        {s.flipVerdict[0]}
        <bdi>{r3fees.names[flip.line!]}</bdi>
        {s.flipVerdict[1]}
        {row.label}
        {s.flipVerdict[2]}
        {value(an, row, flip.from)}
        {s.flipVerdict[3]}
        {value(an, row, flip.to)}
        {s.flipVerdict[4]}
        {r3fees.verdict[flip.newVerdict!]}.
      </>
    );
  } else if (flip) {
    text = (
      <>
        {s.flipLargest[0]}
        {row.label}
        {s.flipLargest[1]}
        {value(an, row, flip.from)}
        {s.flipLargest[2]}
        {value(an, row, flip.to)}
        {s.flipLargest[3]}
        <bdi>{r3fees.names[flip.newLargest!]}</bdi>.
      </>
    );
  } else {
    const b = row.key.startsWith("fee:") ? p02.bounds.fee_rates : p02.bounds[row.key === "horizon" ? "horizon" : row.key];
    const node = (side: "lo" | "hi") =>
      row.unit === "fraction" && b ? <Num value={asParameter(p02.param, b[side])} /> : row.unit === "years" ? <Num value={an.mk.plain(row[side], "years", "F-81", row.label)} display={fmt.years(Number(row[side].toFixed(2)))} /> : value(an, row, row[side]);
    text = (
      <>
        {s.noFlip}
        {node("lo")}
        {s.until}
        {node("hi")}
      </>
    );
  }
  const current = row.unit === "fraction" ? an.mk.plain(row.current * 100, "pct_per_year", "F-81", row.label) : null;
  const inner = (
    <div className="flex flex-col gap-1 w-full text-start">
      <span className="flex items-center gap-2 flex-wrap">
        <span className="font-medium">{row.label}</span>
        {current && <Num value={current} />}
      </span>
      <span className="text-sm">{text}</span>
    </div>
  );
  const cls = cx("min-h-14 px-4 py-3 flex items-center border-b border-border last:border-b-0", flip && "bg-computed-subtle");
  if (flip && row.field) {
    const suggested = row.field === "horizonYears" ? (flip.side === "hi" ? Math.ceil(flip.to) : Math.floor(flip.to)) : flip.to * 100;
    return (
      <li className={cls}>
        <button type="button" className="w-full text-start" onClick={() => onOpen(row.field!, suggested)}>
          {inner}
        </button>
      </li>
    );
  }
  return <li className={cls}>{inner}</li>;
}

export function FeeSensitivityPanel({ view, an, bundle, onOpen }: { view: FeeSensitivity | null; an: Analysis; bundle: CompareBundle; onOpen: (f: FieldKey, suggested: number) => void }) {
  const param = parameterOf(bundle, "P-02");
  const p02 = { param, bounds: (param as unknown as { bounds: Bounds }).bounds };
  return (
    <div className="flex flex-col gap-3">
      {view === null ? (
        <p className="text-sm text-muted-foreground">{r3fees.review.sensRunning}</p>
      ) : (
        <ul className="bg-card border border-border rounded-lg overflow-hidden">
          {view.rows.map((r) => (
            <Row key={r.key} row={r} an={an} onOpen={onOpen} p02={p02} />
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
        <span>{r3fees.review.sensFooter}</span>
        <Tag tone="parameter">{numbers.parameter}</Tag>
        <Link to="/parameters" className="text-link hover:underline">
          {site.menuItems[3].label}
        </Link>
      </p>
    </div>
  );
}
