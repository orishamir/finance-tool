// The add-holding sheet (design-system 7.5, flow 22): "מה זה" (product, company, track), "כמה" (balance, fees,
// deposits) and "מהדוח" (the statement's date, a study fund's first deposit), each statement field with the disclosure
// "איפה זה בדוח". A bottom sheet on a phone, a centred dialog on PC. The track comes from the company's tracks in the
// regulator's data, or from a name pasted as the statement writes it; a name that matches nothing is kept as typed.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { WrapperId } from "@finance-tool/schema";
import { r3holdings as copy } from "../../copy";
import { IconSearch } from "../icons";
import { Sheet } from "../Sheet";
import { NumberField, flushPendingFields } from "../timeline/fields";
import { Button, SegmentedControl, cx } from "../ui";
import { Num, RuleRef } from "../provenance";
import { feeYear, type SiteValue } from "../../lib/value";
import { IconCopy } from "../icons";
import {
  autoLink,
  checkDraft,
  companiesFor,
  draftOf,
  emptyDraft,
  holdingOf,
  isChild,
  matchCompanies,
  matchTracksKind,
  prefillFees,
  tracksFor,
  type Draft,
  type DraftError,
  type HTrack,
  type HoldingsBundle,
} from "../../lib/holdings";
import { fmt, parseNumber } from "../../lib/format";
import { isoToday, rememberName, type Holding } from "../../lib/state";
import { BarsDisclosure, DateField, RawWatch, SelectField, TextField } from "./fields";
import { ClearingHouseDisclosure, StatementDisclosure } from "./statement";
import type { RuleMap } from "./shared";

type WrapperChoice = WrapperId | "child";

const choiceOf = (w: WrapperId | null): WrapperChoice | null => (w === null ? null : isChild(w) ? "child" : w);

export function AddHoldingSheet({ open, onClose, hb, rules, value, onSave }: { open: boolean; onClose: () => void; hb: HoldingsBundle; rules: RuleMap; value: Holding | null; onSave: (h: Holding) => void }) {
  // the form starts fresh each time the sheet opens
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  // audit A67: Escape, the backdrop, the X and "ביטול" ask before they throw a filled form away
  const [asking, setAsking] = useState(false);
  const dirty = useRef(false);
  if (open !== wasOpen) {
    // adjusted while rendering, so the form that appears is already the fresh one
    setWasOpen(open);
    if (open) {
      setSession((s) => s + 1);
      setAsking(false);
      dirty.current = false;
    }
  }
  const requestClose = () => {
    if (dirty.current) setAsking(true);
    else onClose();
  };
  const titleId = useId();
  return (
    <Sheet open={open} onClose={requestClose} pc="center" height={100} labelledBy={titleId}>
      <Body key={session} titleId={titleId} onClose={onClose} requestClose={requestClose} asking={asking} onKeep={() => setAsking(false)} dirtyRef={dirty} hb={hb} rules={rules} value={value} onSave={onSave} />
    </Sheet>
  );
}

/** Under the fee fields: the track's average as the sourced number it is (state, source and date through `Num`), and what a save keeps. */
function PrefillLine({ lead, value, note }: { lead: string; value: SiteValue; note: string }) {
  const year = feeYear(value);
  return (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
      <span>{lead}</span>
      <Num value={value} />
      {year && (
        <span>
          {copy.feePrefill.year} <bdi dir="ltr">{year}</bdi>.
        </span>
      )}
      <span>{note}</span>
    </p>
  );
}

/** "3 מסלולים" with the one and two as words. */
const trackCountWord = (n: number) => (n === 1 ? copy.trackCount.one : n === 2 ? copy.trackCount.two : null);

function Body({ titleId, onClose, requestClose, asking, onKeep, dirtyRef, hb, rules, value, onSave }: { titleId: string; onClose: () => void; requestClose: () => void; asking: boolean; onKeep: () => void; dirtyRef: { current: boolean }; hb: HoldingsBundle; rules: RuleMap; value: Holding | null; onSave: (h: Holding) => void }) {
  const [d, setD] = useState<Draft>(() => (value ? draftOf(value, hb) : emptyDraft()));
  const initial = useRef(d);
  const ref = useRef(d);
  ref.current = d;
  const [filter, setFilter] = useState("");
  const [pasted, setPasted] = useState("");
  const [active, setActive] = useState(-1);
  // audit A15: the errors appear with the first save and then follow the fields, so a filled field loses its message at once
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [focusTick, setFocusTick] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  // what is typed in a number field that refused it ("abc", "150%"): the draft still holds the field's old value
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const badRef = useRef(bad);
  badRef.current = bad;
  dirtyRef.current = JSON.stringify(d) !== JSON.stringify(initial.current) || filter !== "" || pasted !== "" || Object.values(bad).some(Boolean);
  const watch = (key: string, validate: (n: number) => ReactNode | null) => (t: string) =>
    setBad((b) => {
      const v = t.trim() !== "" && (Number.isNaN(parseNumber(t)) || validate(parseNumber(t)) !== null);
      return !!b[key] === v ? b : { ...b, [key]: v };
    });
  const allErrors = (draft: Draft, b: Record<string, boolean>, todayIso: string): DraftError[] => {
    const badFields = Object.keys(b).filter((k) => b[k]);
    return [...checkDraft(draft, todayIso, hb).filter((e) => !badFields.includes(e.field)), ...badFields.map((f) => ({ field: f as keyof Draft, code: "invalid" as const }))];
  };
  const errors: DraftError[] = attempted ? allErrors(d, bad, isoToday()) : [];
  useEffect(() => {
    if (focusTick === 0) return;
    const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center" });
  }, [focusTick]);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const choice = choiceOf(d.wrapperId);
  const child = d.wrapperId !== null && isChild(d.wrapperId);
  const wrapperForTracks: WrapperId | null = child ? (d.childRoute === "bank" ? null : "child-savings-provident") : d.wrapperId;
  const percentOver = (
    <>
      {copy.errors.percentOver.before}
      <bdi dir="ltr">{fmt.pct(100)}</bdi>
      {copy.errors.percentOver.after}
    </>
  );
  const err = (field: DraftError["field"]): ReactNode | null => {
    const e = errors.find((x) => x.field === field);
    if (!e) return null;
    const m = copy.errors;
    return {
      "balance-negative": m.balanceNegative,
      "percent-over": percentOver,
      "statement-future": m.statementFuture,
      "first-future": m.firstFuture,
      "first-after-statement": m.firstAfter,
      "no-track": m.noTrack,
      required: field === "wrapperId" ? m.wrapperRequired : m.required,
      "gain-over-balance": m.gainOverBalance,
      invalid: m.invalid,
    }[e.code];
  };

  const options = [...hb.wrappers.filter((w) => !isChild(w.id)).map((w) => ({ value: w.id as WrapperChoice, label: copy.wrapperHints[w.id] ? `${w.name} (${copy.wrapperHints[w.id]})` : w.name })), { value: "child" as WrapperChoice, label: copy.child.heading }];
  const pickWrapper = (v: WrapperChoice) => {
    const wrapperId = v === "child" ? ("child-savings-provident" as WrapperId) : v;
    set({ wrapperId, childRoute: v === "child" ? "provident" : null, companyId: null, companyName: "", fundId: null, typedName: "", ...(wrapperId !== "keren-hishtalmut" ? { firstDeposit: "", firstDepositOver: false } : {}) });
    setFilter("");
    setPasted("");
  };
  const companies = wrapperForTracks ? companiesFor(hb, wrapperForTracks) : [];
  const cm = useMemo(() => matchCompanies(companies, filter), [companies, filter]);
  const noMatch = filter.trim() !== "" && cm.list.length === 0;
  // a filter that matches nothing keeps the whole list below its message (audit A17)
  const shown = (noMatch ? companies : cm.list).slice(0, 40);
  const pickCompany = (c: { id: string; name: string }) => set({ companyId: c.id, companyName: c.name, fundId: null });
  const tracks: HTrack[] = wrapperForTracks && d.companyId ? tracksFor(hb, wrapperForTracks, d.companyId) : [];
  const dupNames = new Set(tracks.filter((t, i) => tracks.findIndex((x) => x.n === t.n) !== i).map((t) => t.n));
  const found = wrapperForTracks && pasted.trim() ? matchTracksKind(hb, wrapperForTracks, pasted, d.companyId ?? undefined).tracks : [];
  const chosenTrack = d.fundId !== null ? hb.tracks.find((t) => t.id === d.fundId) : undefined;

  const pickTrack = (t: HTrack) => {
    const co = hb.companies[t.c]!;
    set({ fundId: t.id, typedName: "", companyId: co.id, companyName: co.name });
    setPasted("");
  };
  const submit = () => {
    // audit A15: a second click while the first is being saved stores nothing
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    flushPendingFields();
    // the fields commit after their typing pause; read the draft once they have
    window.setTimeout(() => {
      const today = isoToday();
      // audit A17: a name or fund number that is exactly one track links to it
      const draft = autoLink(hb, ref.current);
      const errs = allErrors(draft, badRef.current, today);
      setAttempted(true);
      if (errs.length > 0) {
        saving.current = false;
        setBusy(false);
        setFocusTick((t) => t + 1);
        return;
      }
      const h = holdingOf(draft, hb, today, value ?? undefined);
      if (!h.track && h.typedName && !isChild(h.wrapperId)) rememberName(h.typedName, hb.wrappers.find((w) => w.id === h.wrapperId)?.name);
      onSave(h);
    }, 0);
  };

  // scenario fix 2026-10-24: the regulator's averages for the picked track fill the two fee fields until the person types
  const pre = prefillFees(hb, d);
  const preBalance = pre.balance && typeof pre.balance.value === "number" ? pre.balance.value : null;
  const preDeposit = pre.deposit && typeof pre.deposit.value === "number" ? pre.deposit.value : null;
  const pctValidate = (n: number) => (n < 0 || n > 100 ? percentOver : null);
  const nisValidate = (n: number) => (n < 0 ? copy.errors.amountNegative : null);
  const today = isoToday();
  const problems = new Set(errors.map((e) => e.field)).size;

  return (
    <form
      ref={formRef}
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <h2 id={titleId} className="text-xl font-semibold">
        {value ? copy.sheetTitleEdit : copy.sheetTitleNew}
      </h2>

      <fieldset className="flex flex-col gap-4 min-w-0">
        <legend className="text-lg font-semibold mb-2">{copy.groups.what}</legend>
        <SelectField label={copy.fields.wrapper} value={choice} onChange={pickWrapper} options={options} placeholder="—" error={err("wrapperId")} />
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-1.5">
          <span>{copy.wrappersLater}</span>
          <RuleRef id="BANK-32" />
        </p>

        {child && (
          <div className="flex flex-col gap-1.5">
            <span className="field-label" id="child-route">
              {copy.childRoute}
            </span>
            <SegmentedControl
              labelledBy="child-route"
              value={d.childRoute}
              onChange={(v) => set({ childRoute: v, companyId: null, companyName: "", fundId: null, typedName: "" })}
              options={[
                { value: "provident", label: copy.childRouteOptions.provident },
                { value: "bank", label: copy.childRouteOptions.bank },
              ]}
            />
          </div>
        )}

        {d.wrapperId && (!child || d.childRoute === "provident") && (
          <>
            <TextField
              label={child ? copy.childFund : copy.fields.company}
              value={d.companyName}
              onChange={(v) => {
                setFilter(v);
                setActive(-1);
                set({ companyName: v, companyId: null, fundId: null });
              }}
              placeholder={copy.companyFilter}
              icon={<IconSearch size={18} className="text-muted-foreground" />}
              error={d.companyId === null ? err("track") : null}
              onKeyDown={(e) => {
                if (d.companyId !== null || shown.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, shown.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, -1));
                } else if (e.key === "Enter") {
                  const c = active >= 0 ? shown[active] : filter.trim() !== "" && !noMatch && shown.length === 1 ? shown[0] : undefined;
                  if (c) {
                    e.preventDefault();
                    pickCompany(c);
                  }
                }
              }}
            />
            {d.companyId === null && (
              <div className="flex flex-col gap-1">
                {noMatch && <p className="text-sm text-muted-foreground">{copy.companyNotFound}</p>}
                {cm.partial && !noMatch && <p className="text-sm text-muted-foreground">{copy.companyPartial}</p>}
                {shown.length > 0 && (
                  <ul className="flex flex-col max-h-48 overflow-auto rounded-md border border-border">
                    {shown.map((c, i) => (
                      <li key={c.id}>
                        <button type="button" className={cx("w-full text-start min-h-target px-3 hover:bg-accent flex items-center justify-between gap-2", i === active && "bg-accent")} onClick={() => pickCompany(c)}>
                          <bdi>{c.name}</bdi>
                          <span className="text-xs text-muted-foreground">{trackCountWord(c.count) ?? `${fmt.number(c.count)} ${copy.trackCount.many}`}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {child && d.childRoute === "bank" && <TextField label={copy.childFundBank} value={d.companyName} onChange={(v) => set({ companyName: v, companyId: null })} error={err("track")} />}

        {wrapperForTracks && d.companyId && (
          <div className="flex flex-col gap-2">
            <span className="field-label">{copy.fields.track}</span>
            {tracks.length === 0 ? (
              <p className="text-sm text-muted-foreground">{copy.trackNoneForCompany}</p>
            ) : (
              <>
                {dupNames.size > 0 && <p className="text-sm text-caution-foreground">{copy.pasteSeveral}</p>}
                <ul className="flex flex-col max-h-56 overflow-auto rounded-md border border-border" role="radiogroup" aria-label={copy.trackPick}>
                  {tracks.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={d.fundId === t.id}
                        onClick={() => pickTrack(t)}
                        className={cx("w-full text-start min-h-target px-3 py-1.5 flex flex-col hover:bg-accent", d.fundId === t.id && "bg-accent font-medium")}
                      >
                        <bdi>{t.n}</bdi>
                        <span className="text-xs text-muted-foreground">
                          {copy.cardFundLine} <bdi dir="ltr" className="num-id">{t.id}</bdi>
                          {(t.ss || t.s) && <> · {t.ss || t.s}</>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {d.wrapperId && !(child && d.childRoute === "bank") && (
          <div className="flex flex-col gap-2">
            <TextField label={copy.paste} value={pasted} onChange={(v) => { setPasted(v); if (d.fundId === null) set({ typedName: v }); else if (v) set({ fundId: null, typedName: v }); }} icon={<IconSearch size={18} className="text-muted-foreground" />} error={d.companyId !== null ? err("track") : null} />
            {pasted.trim() !== "" && found.length === 1 && (
              <p className="text-sm flex flex-wrap items-center gap-x-2">
                <span>{copy.pasteOne}</span>
                <button type="button" className="text-link font-medium hover:underline min-h-target" onClick={() => pickTrack(found[0]!)}>
                  <bdi>{found[0]!.n}</bdi>
                </button>
                <span className="text-muted-foreground">
                  {copy.cardFundLine} <bdi dir="ltr" className="num-id">{found[0]!.id}</bdi>
                </span>
              </p>
            )}
            {pasted.trim() !== "" && found.length > 1 && (
              <div className="flex flex-col gap-1">
                <p className="text-sm">{copy.pasteSeveral}</p>
                <ul className="flex flex-col rounded-md border border-border">
                  {found.map((t) => (
                    <li key={t.id}>
                      <button type="button" className="w-full text-start min-h-target px-3 py-1.5 hover:bg-accent flex flex-col" onClick={() => pickTrack(t)}>
                        <bdi>{t.n}</bdi>
                        <span className="text-xs text-muted-foreground">
                          <bdi>{hb.companies[t.c]!.name}</bdi> · {copy.cardFundLine} <bdi dir="ltr" className="num-id">{t.id}</bdi>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pasted.trim() !== "" && found.length === 0 && (
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
                <span>{copy.pasteNone}</span>
                <Button variant="quiet" className="text-sm" onClick={() => void navigator.clipboard?.writeText(pasted).catch(() => {})}>
                  <IconCopy size={16} /> {copy.pasteCopy}
                </Button>
              </p>
            )}
            {chosenTrack && (
              <p className="text-sm">
                <span className="text-muted-foreground">{copy.trackSelected}: </span>
                <bdi className="font-medium">{chosenTrack.n}</bdi> · {copy.cardFundLine} <bdi dir="ltr" className="num-id">{chosenTrack.id}</bdi>
              </p>
            )}
            <StatementDisclosure field="fundNumber" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
          </div>
        )}
        {child && <p className="text-xs text-muted-foreground">{copy.childPlansNote}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-4 min-w-0">
        <legend className="text-lg font-semibold mb-2">{copy.groups.how}</legend>
        <div className="flex flex-col gap-1.5">
          <RawWatch onRaw={watch("balance", nisValidate)}><NumberField label={copy.balance} unit="nis" value={d.balance} isEntered={d.balance !== null} validate={nisValidate} onCommit={(n) => set({ balance: n })} onReset={() => set({ balance: null })} optional externalError={err("balance")} /></RawWatch>
          <StatementDisclosure field="balance" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
        </div>
        {!child && (
          <>
            <fieldset className="flex flex-col gap-1.5 min-w-0">
              <legend className="field-label mb-1.5">{copy.fees}</legend>
              <div className="grid grid-cols-2 gap-3">
                <RawWatch onRaw={watch("feeBalance", pctValidate)}><NumberField label={copy.feeBalance} unit="pct_per_year" value={d.feeBalance ?? preBalance} isEntered={d.feeBalance !== null} validate={pctValidate} onCommit={(n) => set({ feeBalance: n })} onReset={() => set({ feeBalance: null })} optional externalError={err("feeBalance")} /></RawWatch>
                <RawWatch onRaw={watch("feeDeposit", pctValidate)}><NumberField label={copy.feeDeposit} unit="pct_of_deposit" value={d.feeDeposit ?? preDeposit} isEntered={d.feeDeposit !== null} validate={pctValidate} onCommit={(n) => set({ feeDeposit: n })} onReset={() => set({ feeDeposit: null })} optional externalError={err("feeDeposit")} hint={preDeposit !== null ? copy.feePrefill.depositHint : copy.feeDepositHint} /></RawWatch>
              </div>
              {pre.balance && (
                <PrefillLine lead={copy.feePrefill.balance} value={pre.balance} note={d.feeBalance === null ? copy.feePrefill.balanceKept : copy.feePrefill.balanceEntered} />
              )}
              {pre.deposit && d.feeDeposit === null && <PrefillLine lead={copy.feePrefill.deposit} value={pre.deposit} note={copy.feePrefill.depositKept} />}
              <StatementDisclosure field="feeBalance" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
              <StatementDisclosure field="feeDeposit" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
            </fieldset>
            <div className="flex flex-col gap-1.5">
              <RawWatch onRaw={watch("directExpenses", pctValidate)}><NumberField label={copy.directExpenses} unit="pct_per_year" value={d.directExpenses} isEntered={d.directExpenses !== null} validate={pctValidate} onCommit={(n) => set({ directExpenses: n })} onReset={() => set({ directExpenses: null })} optional externalError={err("directExpenses")} /></RawWatch>
              <StatementDisclosure field="direct" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
            </div>
            {d.wrapperId === "kupat-gemel-lehashkaa" && (
              <div className="flex flex-col gap-1.5">
                <RawWatch onRaw={watch("embeddedGain", nisValidate)}><NumberField label={copy.embeddedGain} unit="nis" value={d.embeddedGain} isEntered={d.embeddedGain !== null} validate={nisValidate} onCommit={(n) => set({ embeddedGain: n })} onReset={() => set({ embeddedGain: null })} optional hint={copy.embeddedGainWhy} externalError={err("embeddedGain")} /></RawWatch>
                <StatementDisclosure field="embeddedGain" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
              </div>
            )}
            <RawWatch onRaw={watch("monthlyOwn", nisValidate)}><NumberField label={copy.monthlyOwn} unit="nis_per_month" value={d.monthlyOwn} isEntered={d.monthlyOwn !== null} validate={nisValidate} onCommit={(n) => set({ monthlyOwn: n })} onReset={() => set({ monthlyOwn: null })} optional externalError={err("monthlyOwn")} /></RawWatch>
            <RawWatch onRaw={watch("monthlyEmployer", nisValidate)}><NumberField label={copy.monthlyEmployer} unit="nis_per_month" value={d.monthlyEmployer} isEntered={d.monthlyEmployer !== null} validate={nisValidate} onCommit={(n) => set({ monthlyEmployer: n })} onReset={() => set({ monthlyEmployer: null })} optional externalError={err("monthlyEmployer")} /></RawWatch>
          </>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4 min-w-0">
        <legend className="text-lg font-semibold mb-2">{copy.groups.report}</legend>
        <div className="flex flex-col gap-1.5">
          <DateField label={copy.statementDate} value={d.statementDate} max={today} onChange={(v) => set({ statementDate: v })} error={err("statementDate")} />
          <StatementDisclosure field="statementDate" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
        </div>
        {d.wrapperId === "keren-hishtalmut" && (
          <div className="flex flex-col gap-1.5">
            {!d.firstDepositOver && <DateField label={copy.firstDeposit} value={d.firstDeposit} max={today} onChange={(v) => set({ firstDeposit: v })} hint={copy.firstDepositWhy} error={err("firstDeposit")} />}
            <label className="flex items-start gap-3 min-h-target text-sm cursor-pointer">
              <input type="checkbox" checked={d.firstDepositOver} onChange={(e) => set({ firstDepositOver: e.target.checked, ...(e.target.checked ? { firstDeposit: "" } : {}) })} className="size-5 mt-2.5 accent-[var(--primary)]" />
              <span className="flex flex-col py-2.5">
                <span>{copy.firstDepositOver}</span>
                {d.firstDepositOver && <span className="text-xs text-muted-foreground">{copy.firstDepositOverWhy}</span>}
              </span>
            </label>
            <StatementDisclosure field="firstDeposit" wrapperId={d.wrapperId} rules={rules} spellings={hb.spellings} />
          </div>
        )}
        {!child && <ClearingHouseDisclosure rules={rules} />}
        {!child && <BarsDisclosure bars={d.bars} onChange={(bars) => set({ bars })} text={rules["PF-17"]?.text_he ?? ""} />}
      </fieldset>

      <div className="sticky bottom-[calc(-28px-env(safe-area-inset-bottom,0px))] lg:-bottom-5 z-10 -mx-4 lg:-mx-5 px-4 lg:px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] lg:pb-3 bg-popover border-t border-border flex flex-col gap-2">
        {asking ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-medium">{copy.closeAsk.text}</span>
            <Button variant="secondary" onClick={onClose}>
              {copy.closeAsk.yes}
            </Button>
            <Button variant="primary" onClick={onKeep}>
              {copy.closeAsk.no}
            </Button>
          </div>
        ) : (
          <>
            {problems > 0 && (
              <p role="alert" className="text-sm text-destructive">
                {problems === 1 ? copy.saveProblems.one : problems === 2 ? copy.saveProblems.two : (
                  <>
                    <bdi>{fmt.number(problems)}</bdi> {copy.saveProblems.many}
                  </>
                )}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button variant="primary" type="submit" className="flex-1 md:flex-none" disabled={busy}>
                {copy.save}
              </Button>
              <Button variant="secondary" onClick={requestClose}>
                {copy.cancel}
              </Button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
