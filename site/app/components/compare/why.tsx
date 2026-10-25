// "X is best because Y" (design-system 6.4, flow 14): the headline built from the deciding formula's pattern,
// the sheet that sets the top two side by side, and the detail of one option.
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { r2, scnCompare } from "../../copy";
import { fmt } from "../../lib/format";
import type { FitTableData } from "../../lib/fit";
import { showsHorizonHonestLine } from "../../lib/quick-goal";
import { buildIdle } from "../../lib/idle";
import { shortfall } from "../../lib/goal";
import { rankCandidates } from "@finance-tool/engine";
import { enteredLead, feeShieldPair, goalValueObjects, asParameter, countPhrase, decidingFormulaOf, equityFit, grossReturnRow, headlineState, limitationFirst, parameterOf, parameterRateLead, providerOf, realOfIdle, type Breakdown, type HeadlineState, type ListedOption, type RankedOption, type SensitivityView } from "../../lib/compare";
import type { FieldKey } from "../../lib/goal";
import { Tpl } from "../exposure-mode/tpl";
import { FlipSentence } from "./sensitivity";
import { Button, Callout, cx, PercentField, Sentence, Tag } from "../kit";
import { relativeGap } from "@finance-tool/engine";
import { IconAlert, IconCheck, IconExternal } from "../icons";
import { Num, RuleRef, RulesLine, StrengthLabel } from "../provenance";
import { strengthOf } from "../../lib/value";
import type { ResultCtx } from "./ctx";

const NameLink = ({ id, name }: { id: string; name: string }) => (
  <Link to={`/guide/${id}`} className="text-link font-medium hover:underline">
    {name}
  </Link>
);

/** An option's name in the headline, with the tariff its run is priced on when the site picked or the person chose one (2026-10-24, Doron's case). */
function OptionName({ ctx, id, name }: { ctx: ResultCtx; id: string; name: string }) {
  const p = providerOf(ctx.bundle, id);
  return (
    <>
      <NameLink id={id} name={name} />
      {p && (
        <>
          {" "}
          {r2.result.atProvider} <bdi>{p.name}</bdi>
        </>
      )}
    </>
  );
}

/** A list of names as Hebrew reads it: "א, ב ו־ג". */
function joinNames(items: ReactNode[]): ReactNode {
  return items.map((n, i) => (
    <Fragment key={i}>
      {i > 0 && (i === items.length - 1 ? " ו" : ", ")}
      {n}
    </Fragment>
  ));
}

export function thetaValue(ctx: ResultCtx) {
  const p = parameterOf(ctx.bundle, "P-01");
  return asParameter(p, (p as unknown as { value: import("@finance-tool/schema").ValueObject }).value);
}

type DecidingGaps = { formula: string | null; gaps: Record<string, number>; top: { feeDrag: number; taxAtExit: number; depositSideRelief: number; lockUp: number }; second: { feeDrag: number; taxAtExit: number; depositSideRelief: number; lockUp: number } };
type RunRef = { usedRules: readonly import("@finance-tool/engine").UsedRule[]; flags?: { code: string }[] } | undefined;

/** The figure of one option under the deciding formula (real NIS; the relief is shown as a gain, so its sign is flipped). */
export function decidingFigure(f: string, d: DecidingGaps["top"]): number {
  return f === "deposit-side-relief" ? -d.depositSideRelief : f === "fee-drag" ? d.feeDrag : f === "tax-at-exit" ? d.taxAtExit : d.lockUp;
}

/**
 * A7: "ההבדל הגדול ביותר בין שתי הראשונות": the formula whose gap is the largest (F-80), with both options' figures; when that
 * gap is in the lower option's favour it says so, instead of claiming it as the reason the leader leads.
 */
export function BiggestDifference({ deciding, mk, top, second, shield }: { deciding: DecidingGaps; mk: ResultCtx["mk"]; top: { name: string; run: RunRef }; second: { name: string; run: RunRef }; /** The pair behind a tax gap that is a fee effect (`feeShieldPair`, 2026-10-24): the sentence then says so. */ shield?: { provident: string; securities: string } | null }) {
  const f = deciding.formula;
  if (!f) return null;
  const label = r2.deciding[f]!;
  const formula = decidingFormulaOf(f);
  const against = deciding.gaps[f]! < 0;
  return (
    <>
      {r2.result.biggestLead} {label}, <Num value={mk.nis(decidingFigure(f, deciding.top), formula, label, top.run)} /> {r2.result.biggestAt} <bdi>{top.name}</bdi> {r2.result.reasonFeeVs} <Num value={mk.nis(decidingFigure(f, deciding.second), formula, label, second.run)} /> {r2.result.biggestAt} <bdi>{second.name}</bdi>
      {against && (
        <>
          {" "}
          ({r2.result.biggestAgainst} <bdi>{top.name}</bdi>)
        </>
      )}
      .
      {f === "tax-at-exit" && shield && <FeeShieldNote shield={shield} />}
    </>
  );
}

/** Why a tax gap between a provident-family option and a securities account is the fee's doing, not a lower rate (2026-10-24, Doron's case; F-08 step 5, TXS-06). */
export function FeeShieldNote({ shield }: { shield: { provident: string; securities: string } }) {
  return (
    <>
      {" "}
      <Tpl t={r2.result.feeShield} vars={{ provident: <bdi>{shield.provident}</bdi>, securities: <bdi>{shield.securities}</bdi> }} /> <RuleRef id="TXS-06" />
    </>
  );
}

/** The third line of the headline: how many options could not be checked, and what to enter for them (A3). */
export function UnevaluatedLine({ state, onField }: { state: HeadlineState; onField: (field: FieldKey) => void }) {
  if (state.unevaluated === 0 || state.fields.length === 0) return null;
  const profile: FieldKey[] = ["age", "salary", "employment"];
  return (
    <p className="text-sm text-muted-foreground">
      {countPhrase(state.unevaluated, r2.result.headlineUnevaluated)} {r2.result.headlineEnter}{" "}
      {state.fields.map((f, i) => (
        <Fragment key={f}>
          {i > 0 && " / "}
          {profile.includes(f) ? (
            <Link to="/goal" className="text-link hover:underline">
              {r2.result.headlineFields[f]}
            </Link>
          ) : (
            <button type="button" className="text-link hover:underline" onClick={() => onField(f)}>
              {r2.result.headlineFields[f]}
            </button>
          )}
        </Fragment>
      ))}
      {state.fixable < state.unevaluated && <> {scnCompare.headlineSome}</>}
    </p>
  );
}

/** The line with its sentence's Hebrew prefix kept apart from a name ("ל" + name): the name is isolated. */

/** The limitation first (scenario fix 2026-10-24): the years are long enough for shares by P-04, no return is entered, so only the liquid options were ranked. */
function LimitationLine({ ctx, onField }: { ctx: ResultCtx; onField: (f: FieldKey) => void }) {
  const t = scnCompare.limitation;
  return (
    <div className="flex flex-col gap-1" data-limitation-first>
      <p className="text-lg font-medium">
        <Tpl t={t.text} vars={{ years: <Num value={goalValueObjects(ctx.bundle, ctx.g).horizon} display={fmt.number(ctx.g.horizonYears)} /> }} />
      </p>
      <p className="text-sm flex flex-wrap items-center gap-x-4">
        <button type="button" className="text-link min-h-9 inline-flex items-center hover:underline" onClick={() => onField("return")}>
          {t.enterReturn}
        </button>
        <button type="button" className="text-link min-h-9 inline-flex items-center hover:underline" onClick={() => onField("horizonYears")}>
          {t.orYears}
        </button>
      </p>
    </div>
  );
}

/** The leader runs on a site parameter rate while a rival's rate is sourced or entered: say so, with the control to enter another rate (scenario fix 2026-10-24). */
function ParameterRateLine({ ctx }: { ctx: ResultCtx }) {
  const lead = parameterRateLead(ctx.view, ctx.bundle, ctx.g);
  const [open, setOpen] = useState(false);
  if (!lead) return null;
  const own = ctx.g.ownRates?.[lead.id];
  const t = scnCompare.parameterRate;
  return (
    <div className="flex flex-col gap-1.5 text-sm" data-parameter-rate>
      <p className="flex flex-wrap items-center gap-x-1.5">
        <Tpl t={t.text} vars={{ rate: <Num value={lead.rate} />, name: <bdi>{lead.name}</bdi> }} />
        {!open && (
          <button type="button" className="text-link min-h-9 inline-flex items-center hover:underline" onClick={() => setOpen(true)}>
            {t.enter}
          </button>
        )}
      </p>
      {open && (
        <div className="max-w-xs">
          <PercentField label={t.label} value={own ?? null} isEntered={own !== undefined} range={{ min: 0, max: 50 }} onCommit={(n) => ctx.setOwnRate?.(lead.id, n)} onReset={() => ctx.setOwnRate?.(lead.id, undefined)} optional />
        </div>
      )}
    </div>
  );
}

/** The currency caution and the fall filter, as words: used by product mode and exposure mode (scenario fix 2026-10-24). */
export function EnteredReturnCaveat({ returnV, currency, filterOff, sameReturn }: { returnV: ValueObjectLike; currency: string | null; filterOff: boolean; sameReturn?: boolean }) {
  const t = scnCompare.enteredReturn;
  return (
    <div className="flex flex-col gap-1 text-sm" data-entered-return>
      <p>
        <Tpl t={t.text} vars={{ r: <Num value={returnV as never} /> }} />
        {currency && (
          <>
            {" "}
            <Tpl t={t.currency} vars={{ inCurrency: scnCompare.currencyIn[currency] ?? `ב־${currency}`, rate: scnCompare.currencyRate[currency] ?? `בשער ה־${currency}` }} />
          </>
        )}
        {filterOff && <> {t.filterOff}</>}
      </p>
      {sameReturn && <p>{t.sameReturn}</p>}
    </div>
  );
}
type ValueObjectLike = Parameters<typeof Num>[0]["value"];

/** A known-date goal's purchase cost against the leader's value in today's money (scenario fix 2026-10-24); it enters no ranking. */
function TargetCostLine({ ctx }: { ctx: ResultCtx }) {
  const { targetCost, view, mk, mode } = ctx;
  const top = view.ranked[0];
  // review fix 2026-10-24: the figure is in today's money (real), so the line is hidden in nominal mode, as RealTermsLine is
  if (mode !== "real" || !targetCost || typeof targetCost.value !== "number" || !top) return null;
  const about = r2.realLabel;
  const sf = shortfall(targetCost.value, top.real);
  const t = scnCompare.targetCost;
  const value = <Num value={mk.nis(top.real, "F-06", about, top)} />;
  const cost = <Num value={targetCost} />;
  return (
    <p className="text-sm" data-target-cost>
      {sf.enough ? <Tpl t={t.enough} vars={{ value, cost }} /> : <Tpl t={t.short} vars={{ value, cost, gap: <Num value={mk.nis(sf.gap, "F-06", about, top, { [about]: mk.nis(top.real, "F-06", about, top), [scnCompare.targetCostLabel]: targetCost })} /> }} />}
    </p>
  );
}

/** What to do in the meantime with a lump sum (scenario fix 2026-10-24): F-60 over the leading cash option's rate and the current account's. */
function NextStepLine({ ctx }: { ctx: ResultCtx }) {
  const { g, view, bundle } = ctx;
  const row = useMemo(() => {
    if (!(g.amountNow > 0)) return null;
    // review fix 2026-10-24: the deposit the comparison ranked runs on the rate the person entered for it (A8), as the ranking does
    const own = g.ownRates?.["bank-deposit"];
    const ownRate = own !== undefined && Number.isFinite(own) ? own : null;
    const idle = buildIdle(bundle, g.amountNow, g.available, ownRate);
    if (idle.kind !== "ok") return null;
    const rowOf: Record<string, string> = { "bank-deposit": ownRate !== null ? "bank-deposit:own-offer" : "bank-deposit:average", "money-market-fund-daily": "money-market-fund-daily", makam: "makam" };
    const lead = view.ranked.find((o) => o.cashLike && rowOf[o.id] && idle.rows.some((r) => r.id === rowOf[o.id]));
    const picked = lead ? idle.rows.find((r) => r.id === rowOf[lead.id]) : idle.rows.length > 0 ? idle.rows.reduce((a, b) => (b.monthlyCost > a.monthlyCost ? b : a)) : null;
    return picked && picked.monthlyCost > 0 ? picked : null;
  }, [bundle, g.amountNow, g.available, g.ownRates, view.ranked]);
  const top = view.ranked[0];
  if (!row || !top) return null;
  const t = scnCompare.nextStep;
  return (
    <p className="text-sm flex flex-wrap items-center gap-x-1.5" data-next-step>
      <Tpl t={t.text} vars={{ x: <Num value={row.cost} /> }} />
      {!top.cashLike && <span>{t.stocks}</span>}
      <Link to={`/idle-cash?balance=${g.amountNow}&keep=${g.available}`} className="text-link min-h-9 inline-flex items-center hover:underline">
        {t.link}
      </Link>
    </p>
  );
}

/** In today's money: what the amount now is worth after the years if it does not grow (F-06; scenario fix 2026-10-24). */
function RealTermsLine({ ctx }: { ctx: ResultCtx }) {
  const { g, mk, mode } = ctx;
  if (mode !== "real" || !(g.amountNow > 0)) return null;
  const infl = mk.goal.inflation;
  if (typeof infl.value !== "number") return null;
  const y = realOfIdle(g.amountNow, infl.value, g.horizonYears);
  return (
    <p className="text-sm text-muted-foreground" data-real-terms>
      <Tpl t={scnCompare.realTerms} vars={{ i: <Num value={infl} />, amount: <Num value={mk.goal.amountNow} />, y: <Num value={mk.nis(y, "F-06", scnCompare.realTermsAbout)} />, n: fmt.number(g.horizonYears) }} />
    </p>
  );
}

/**
 * The headline (A3): the leader and how many were ranked; the first move that would change the answer (when the sensitivity has run); how many
 * were not checked and what to enter for them. A cash-only ranking says so first; with years at or above P-04's equity minimum it leads with the
 * limitation and the cash verdict follows (scenario fix 2026-10-24). Then the caveats: an entered return, a site-parameter rate, the purchase
 * cost, the next step.
 */
export function WhyHeadline({ ctx, onWhy, sens, onField }: { ctx: ResultCtx; onWhy: (el: HTMLElement) => void; sens: SensitivityView | null; onField: (field: FieldKey) => void }) {
  const { view, mk, g, bundle } = ctx;
  const { ranked, headline } = view;
  const top = ranked[0];
  const second = ranked[1];
  const theta = thetaValue(ctx);
  const state = headlineState(view);
  const limitation = headline !== "only-baseline" && limitationFirst(view, g, bundle);
  let body: ReactNode = null;
  let showWhy = true;
  let reason: ReactNode = null;
  switch (headline) {
    case "excludes-all":
    case "nothing-ranked":
      return null;
    case "only-baseline": {
      const reasons = view.coverageRows.filter((r) => r.kind !== "ranked" && r.tier === 1).slice(0, 1);
      body = (
        <>
          {r2.result.onlyBaseline}{" "}
          {reasons.map((r) => (
            <span key={r.id}>
              {r.name}: {r.reasons[0] ? r2.outcomes[r.kind] : null}
            </span>
          ))}
        </>
      );
      showWhy = false;
      break;
    }
    case "single":
      body = (
        <>
          {r2.result.headlineSingle} <NameLink id={top!.id} name={top!.name} />.
        </>
      );
      showWhy = false;
      break;
    case "all-tied": {
      const gap = relativeGap(top!.real, ranked[ranked.length - 1]!.real);
      void gap;
      body = (
        <>
          {r2.result.allTied} <Num value={theta} />.
        </>
      );
      break;
    }
    case "tie": {
      const tied = ranked.filter((o) => view.topTie.includes(o.id));
      const gap = relativeGap(tied[0]!.real, tied[tied.length - 1]!.real) * 100;
      body = (
        <>
          {joinNames(tied.map((o) => <OptionName key={o.id} ctx={ctx} id={o.id} name={o.name} />))} {r2.result.tieMid} <Num value={mk.pct(gap, "F-80", r2.result.tieMid, {})} />
          {r2.result.tieThen} <Num value={theta} />.
        </>
      );
      break;
    }
    case "winner": {
      body = limitation ? (
        <Tpl t={scnCompare.cashVerdict} vars={{ name: <OptionName ctx={ctx} id={top!.id} name={top!.name} /> }} />
      ) : (
        <Tpl t={ranked.length === 2 ? r2.result.headlineLeadTwo : r2.result.headlineLead} vars={{ n: <Num value={mk.count(ranked.length, r2.result.headlineLead)} />, name: <OptionName ctx={ctx} id={top!.id} name={top!.name} /> }} />
      );
      const deciding = view.topTwo?.deciding;
      if (deciding?.formula && second) {
        reason = <BiggestDifference deciding={deciding as unknown as DecidingGaps} mk={mk} top={{ name: top!.name, run: top }} second={{ name: second.name, run: second }} shield={feeShieldPair(bundle, top!, second)} />;
      }
      break;
    }
  }
  const secondary = headline === "winner" && top!.secondaryRules.length > 0;
  const flip = sens?.rows.find((r) => r.flip);
  const lead = headline === "only-baseline" ? null : enteredLead(view, bundle, g, ctx.subjectCurrency);
  const showCaveats = headline !== "only-baseline";
  return (
    <div className="flex flex-col gap-2 max-w-measure" key={headline + (top?.id ?? "")}>
      {limitation ? <LimitationLine ctx={ctx} onField={onField} /> : state.lead === "cash-only" && headline !== "only-baseline" && <p className="text-lg font-medium">{r2.result.headlineCashOnly}</p>}
      <p className="text-lg">
        {body}
        {secondary && (
          <>
            {" "}
            <Tag tone="caution" icon={<IconAlert size={14} />}>
              {r2.result.secondarySource}
            </Tag>
          </>
        )}
      </p>
      {reason && <p className="text-sm text-muted-foreground">{reason}</p>}
      {flip && (
        <p className="text-sm">
          <FlipSentence row={flip} ctx={ctx} />
        </p>
      )}
      {lead && <EnteredReturnCaveat returnV={lead.returnV} currency={lead.currency} filterOff={g.acceptedFall === null || g.acceptedFall === undefined} />}
      {showCaveats && <ParameterRateLine ctx={ctx} />}
      <UnevaluatedLine state={state} onField={onField} />
      {showCaveats && <TargetCostLine ctx={ctx} />}
      {showCaveats && <RealTermsLine ctx={ctx} />}
      {showCaveats && <NextStepLine ctx={ctx} />}
      {showWhy && ranked.length > 1 && (
        <button type="button" onClick={(e) => onWhy(e.currentTarget)} className="text-link min-h-target self-start px-2 -ms-2 rounded-md hover:underline">
          {r2.result.why}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- breakdown rows

type Row = { key: keyof Breakdown; label: string; formula: string; deciding: boolean };

function rowsFor(ctx: ResultCtx, deciding: string | null | undefined, a: RankedOption): Row[] {
  const w = ctx.bundle.wrappers.find((x) => x.id === a.id)!;
  return [
    { key: "relief", label: r2.result.whyRows.relief, formula: "F-30", deciding: deciding === "deposit-side-relief" },
    { key: "fees", label: r2.result.whyRows.fees, formula: "F-61", deciding: deciding === "fee-drag" },
    { key: "taxDuring", label: r2.result.whyRows.taxDuring, formula: w.record.tax_during.formula, deciding: deciding === "tax-at-exit" },
    { key: "taxExit", label: r2.result.whyRows.taxExit, formula: w.record.tax_at_exit.formula, deciding: deciding === "tax-at-exit" },
    { key: "lockUp", label: r2.result.whyRows.lockUp, formula: "B3", deciding: deciding === "lock-up" },
    { key: "result", label: r2.result.whyRows.result, formula: "F-06", deciding: false },
  ];
}

/** The dimensions the rules of one option carry and the other's do not (the "what differed" rows). */
function differing(ctx: ResultCtx, a: RankedOption, b: RankedOption): string[] {
  const dims = (o: RankedOption) => new Set(o.usedRules.flatMap((u) => u.dimensions));
  const da = dims(a);
  const db = dims(b);
  const names = new Map(ctx.bundle.checklist.map((r) => [r.id, r.name]));
  return [...new Set([...da, ...db])].filter((d) => da.has(d) !== db.has(d)).map((d) => names.get(d) ?? d);
}

export function WhySheetBody({ ctx, headId }: { ctx: ResultCtx; headId: string }) {
  const { view, mk } = ctx;
  // any two ranked options can be set side by side (scenario fix 2026-10-24), not only the top two; the default is the top two
  const [pair, setPair] = useState<[string, string]>([view.ranked[0]!.id, view.ranked[1]!.id]);
  const order = view.ranked.map((o) => o.id);
  const [a, b] = [...pair].sort((x, y) => order.indexOf(x) - order.indexOf(y)).map((id) => view.ranked.find((o) => o.id === id) ?? view.ranked[0]!) as [RankedOption, RankedOption];
  const isTop = a === view.ranked[0] && b === view.ranked[1];
  const tied = isTop && view.topTie.length > 1;
  const d = useMemo(() => rankCandidates([a.candidate, b.candidate], { theta: view.evaluated.theta, ctx: view.evaluated.ctx }).topTwo?.deciding.formula, [a, b, view.evaluated]);
  const deciding = tied ? null : d;
  const rowsA = rowsFor(ctx, deciding, a);
  const rowsB = rowsFor(ctx, deciding, b);
  const diff = differing(ctx, a, b);
  const gross = grossReturnRow(a, b);
  const rules = [...new Set([...a.usedRules, ...b.usedRules].map((u) => u.id))];
  const choose = (slot: 0 | 1, id: string) => setPair((p) => (slot === 0 ? [id, p[1] === id ? p[0] : p[1]] : [p[0] === id ? p[1] : p[0], id]));
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headId} className="text-lg font-semibold">
        {r2.result.whyTitle} <bdi>{a.name}</bdi> {r2.result.whyBefore} <bdi>{b.name}</bdi>
      </h2>
      {view.ranked.length > 2 && (
        <div className="grid grid-cols-2 gap-3" role="group" aria-label={scnCompare.pick.label} data-why-picker>
          {([0, 1] as const).map((slot) => (
            <label key={slot} className="flex flex-col gap-1 text-sm text-muted-foreground">
              {slot === 0 ? scnCompare.pick.first : scnCompare.pick.second}
              <select className="min-h-11 rounded-md border border-input bg-card text-foreground px-2" value={(slot === 0 ? a : b).id} onChange={(e) => choose(slot, e.target.value)}>
                {view.ranked.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_auto_auto] gap-x-4 text-sm items-baseline">
        <span />
        <span className="font-medium text-end"><bdi>{a.name}</bdi></span>
        <span className="font-medium text-end"><bdi>{b.name}</bdi></span>
        {rowsA.map((r, i) => (
          <Fragment key={r.key}>
            <span className={cx("py-2 border-b border-border flex items-center gap-2", r.deciding && "bg-computed-subtle -mx-2 px-2 rounded-s-md")}>
              {r.label}
              {r.deciding && !rowsA[i - 1]?.deciding && <Tag tone="computed">{r2.result.whyDeciding}</Tag>}
            </span>
            <span className={cx("py-2 border-b border-border text-end", r.deciding && "bg-computed-subtle")}>
              <Num value={mk.nis(a.breakdown[r.key], r.formula, r.label, a)} />
            </span>
            <span className={cx("py-2 border-b border-border text-end", r.deciding && "bg-computed-subtle -me-2 pe-2 rounded-e-md")}>
              <Num value={mk.nis(b.breakdown[rowsB[i]!.key], rowsB[i]!.formula, r.label, b)} />
            </span>
          </Fragment>
        ))}
      </div>
      {gross && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-sm items-baseline">
          <span className="flex flex-col">
            <span>{r2.result.whyGross}</span>
            <span className="text-xs text-muted-foreground">{r2.result.whyGrossNote}</span>
          </span>
          <span className="text-end">{gross.a ? <Num value={gross.a} /> : "—"}</span>
          <span className="text-end">{gross.b ? <Num value={gross.b} /> : "—"}</span>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">{r2.result.whyDiffers}</h3>
        {diff.length === 0 ? (
          <p className="text-sm text-muted-foreground">{r2.result.whyNone}</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {diff.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <IconCheck size={16} className="text-positive" />
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
      <RulesLine ids={rules} />
    </div>
  );
}

/** The decomposition of one option (F-61 style): what each part took, the rules, the dimensions its rules carry. */
export function DetailSheetBody({ ctx, option, headId }: { ctx: ResultCtx; option: RankedOption | ListedOption; headId: string }) {
  const { mk } = ctx;
  const ranked = "run" in option;
  const breakdown = option.breakdown;
  const run = ranked ? (option as RankedOption).run : (option as ListedOption).candidate.run;
  const w = ctx.bundle.wrappers.find((x) => x.id === option.id)!;
  const rows: Row[] = [
    { key: "relief", label: r2.result.whyRows.relief, formula: "F-30", deciding: false },
    { key: "fees", label: r2.result.whyRows.fees, formula: "F-61", deciding: false },
    { key: "taxDuring", label: r2.result.whyRows.taxDuring, formula: w.record.tax_during.formula, deciding: false },
    { key: "taxExit", label: r2.result.whyRows.taxExit, formula: w.record.tax_at_exit.formula, deciding: false },
    { key: "lockUp", label: r2.result.whyRows.lockUp, formula: "B3", deciding: false },
    { key: "result", label: r2.result.whyRows.result, formula: "F-06", deciding: false },
  ];
  const rules = (ranked ? (option as RankedOption).usedRules : (option as ListedOption).usedRules).map((u) => u.id);
  const dims = new Set((ranked ? (option as RankedOption).usedRules : (option as ListedOption).usedRules).flatMap((u) => u.dimensions));
  const names = ctx.bundle.checklist.filter((r) => dims.has(r.id));
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headId} className="text-lg font-semibold">
        <bdi>{option.name}</bdi>
      </h2>
      {breakdown && run ? (
        <dl className="readout">
          {rows.map((r) => (
            <div key={r.key} className="readout-row">
              <dt>{r.label}</dt>
              <dd>
                <Num value={mk.nis(breakdown[r.key], r.formula, r.label, { usedRules: ranked ? (option as RankedOption).usedRules : (option as ListedOption).usedRules, flags: run.flags })} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {names.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {names.map((d) => (
            <li key={d.id} className="flex items-center gap-2">
              <IconCheck size={16} className="text-positive" />
              {d.name}
            </li>
          ))}
        </ul>
      )}
      <RulesLine ids={rules} />
      {!ranked && (option as ListedOption).blockedBy.length > 0 && <Callout tone="blocked">{r2.result.listedBlockedBefore} {(option as ListedOption).blockedBy.join(", ")}</Callout>}
    </div>
  );
}

// ---------------------------------------------------------------- home question card 2026-10-24

/**
 * "לא ידעתם כמה שנים": the years come from the starting point (a site parameter), with the way to change them. With `figures` the note also gives the
 * leader's value after one year and after the years used (scenario fix 2026-10-24), so the person sees that the horizon moves the answer.
 */
export function HorizonDefaultedNote({ bundle, g, presetName, onChange, figures }: { bundle: ResultCtx["bundle"]; g: ResultCtx["g"]; presetName: string; onChange: () => void; figures?: { a: ReactNode; b: ReactNode } | null }) {
  if (!g.fromPreset.horizon) return null;
  const h = r2.result.horizonDefaulted;
  return (
    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5" data-horizon-defaulted>
      <Sentence as="span">
        {h.before} <Num value={goalValueObjects(bundle, g).horizon} display={fmt.number(g.horizonYears)} /> {h.mid}
        <bdi>{presetName}</bdi>
        {h.after}
      </Sentence>
      {figures && (
        <span data-horizon-figures>
          <Tpl t={scnCompare.horizonFigures.first} vars={{ a: figures.a }} />; <Tpl t={scnCompare.horizonFigures.rest} vars={{ n: fmt.number(g.horizonYears), b: figures.b }} />.
        </span>
      )}
      <button type="button" className="text-link min-h-9 inline-flex items-center hover:underline" onClick={onChange}>
        {h.change}
      </button>
    </div>
  );
}

/** The leader's value in today's money after one year and after the years used, from the chart's series (the same runs, one per year). */
export function horizonFigures(ctx: ResultCtx): { a: ReactNode; b: ReactNode } | null {
  const { view, g, mk } = ctx;
  const top = view.ranked[0];
  const line = view.series.find((l) => l.id === top?.id) ?? view.series[0];
  if (!line || g.horizonYears < 2) return null;
  const at = (y: number) => line.points.find((p) => p.year === y)?.real;
  const a = at(1);
  const b = at(g.horizonYears);
  if (a === undefined || b === undefined) return null;
  const run = view.ranked.find((o) => o.id === line.id);
  return { a: <Num value={mk.nis(a, "F-06", r2.realLabel, run)} />, b: <Num value={mk.nis(b, "F-06", r2.realLabel, run)} /> };
}

/**
 * The site cannot say whether the years are enough for shares (no expected return, no sourced fall: D9, D11); it can quote P-04's
 * table. Shown in product mode while the horizon is below the equity row's minimum. Both figures are site parameters.
 */
export function HorizonHonestLine({ ctx, fit }: { ctx: ResultCtx; fit: FitTableData | undefined }) {
  const row = fit?.rows.find((r) => r.classification === "מניות");
  const min = row && typeof row.minYears.value === "number" ? row.minYears : null;
  if (!row || !min || !showsHorizonHonestLine(ctx.g.horizonYears, min.value as number)) return null;
  const t = r2.result.horizonHonest;
  const drop = row.maxFallPct ?? null;
  return (
    <p className="text-sm max-w-measure" data-horizon-honest>
      <Tpl t={t.cannot} vars={{ years: <Num value={goalValueObjects(ctx.bundle, ctx.g).horizon} display={fmt.number(ctx.g.horizonYears)} /> }} />{" "}
      {drop && <Tpl t={t.can} vars={{ min: <Num value={min} display={fmt.number(min.value as number)} />, drop: <Num value={drop} /> }} />}{" "}
      {t.linkBefore}{" "}
      <Link to="/goal/compare?mode=exposure" className="text-link hover:underline">
        {t.link}
      </Link>
      .
    </p>
  );
}

/**
 * MKT-01 (scenario fix 2026-10-24): the published past record of the S&P 500 by holding length, under the P-04 line and whenever equity options
 * are unranked for want of a return. A past record, not a forecast; nothing from it feeds a run or fills a field (D9, D11).
 */
export function PastRecordLine({ ctx, fit }: { ctx: ResultCtx; fit: FitTableData | undefined }) {
  const rec = ctx.bundle.pastRecord;
  if (!rec) return null;
  const f = rec.figures;
  const keys = ["rolling_5y_min", "rolling_5y_max", "rolling_10y_min", "rolling_10y_max", "rolling_20y_min", "rolling_20y_max"] as const;
  if (keys.some((k) => !f[k])) return null;
  const row = fit?.rows.find((r) => r.classification === "מניות");
  const min = row && typeof row.minYears.value === "number" ? row.minYears.value : null;
  const honest = min !== null && showsHorizonHonestLine(ctx.g.horizonYears, min);
  const noReturn = headlineState(ctx.view).fields.includes("return");
  if (!honest && !noReturn) return null;
  // one strength mark for the whole sentence (below), so the six figures carry none of their own
  const n = (k: (typeof keys)[number]) => <Num value={f[k]!} mark={false} />;
  const strength = strengthOf(f.rolling_5y_min!);
  const weak = strength === "secondary" || strength === "institution";
  return (
    <p className="text-sm max-w-measure text-muted-foreground" data-past-record>
      <Tpl t={scnCompare.pastRecord.text} vars={{ src: <bdi dir="ltr">J.P. Morgan Asset Management, 1950–2025</bdi>, min5: n("rolling_5y_min"), max5: n("rolling_5y_max"), min10: n("rolling_10y_min"), max10: n("rolling_10y_max"), min20: n("rolling_20y_min"), max20: n("rolling_20y_max") }} />{" "}
      {weak && <StrengthLabel strength={strength} />}{" "}
      <a href={rec.source.url} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline">
        {scnCompare.pastRecord.link}
        <IconExternal size={14} />
      </a>
    </p>
  );
}
