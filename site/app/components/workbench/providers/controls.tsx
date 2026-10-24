// The behaviour card, the fee-level switch and the subject strip (design-system 8.1, design-spec 16.3).
import { Link } from "react-router";
import { buttons, r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import { ORDERS_MAX, ORDERS_MIN, type Channel, type ProviderWorkbenchView, type SubjectFund, type UiLevel, type WorkbenchInputs, type RefLink } from "../../../lib/providers";
import { IconDown, IconUp } from "../../compare/icons";
import { IconExternal, IconReset } from "../../icons";
import { Num } from "../../provenance";
import { NumberField, ParameterLine } from "../../timeline/fields";
import { Button, Card, SegmentedControl, cx } from "../../ui";

// ---------------------------------------------------------------- subject strip

export function SubjectStrip({ subject, exposureName }: { subject: SubjectFund; exposureName: string }) {
  const t = c.providers;
  const cls = c.instrumentClasses[subject.instrumentClass] ?? subject.instrumentClass;
  return (
    <Card className="!p-3.5 md:!p-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
      <p className="min-w-0">
        {subject.fromP05 ? t.subjectP05 : t.subject.before}
        <bdi className="font-medium">{subject.name}</bdi>
        {t.subject.sep}
        <bdi dir="ltr" className="slashed-zero">{subject.number}</bdi>
        {!subject.fromP05 && (
          <>
            {t.subject.sep}
            {cls}
          </>
        )}
      </p>
      <Link to={`/workbench/funds/${subject.exposureId}`} className="text-link hover:underline shrink-0 min-h-target inline-flex items-center" title={exposureName}>
        {t.changeFund}
      </Link>
    </Card>
  );
}

// ---------------------------------------------------------------- behaviour card

export function AmountChips({ inputs, onOpen }: { inputs: WorkbenchInputs; onOpen: () => void }) {
  const t = c.providers.behaviour.chips;
  const v = inputs.values;
  const chips = [
    { key: "amount", label: t.amount, text: fmt.nisWhole(v.amount.value as number), entered: v.amount.state === "entered" },
    { key: "monthly", label: t.monthly, text: fmt.nisWhole(v.monthly.value as number), entered: v.monthly.state === "entered" },
    { key: "years", label: t.years, text: fmt.years(v.years.value as number), entered: v.years.state === "entered" },
  ];
  return (
    <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible flex md:flex-wrap gap-2 pb-1 scrollbar-none">
      {chips.map((x) => (
        <button key={x.key} type="button" onClick={onOpen} className={cx("a-chip shrink-0", x.entered && "a-chip-entered")}>
          <span className="text-muted-foreground">{x.label}</span>
          <bdi dir="ltr" className={cx("font-medium", x.entered && "text-entered")}>
            {x.text}
          </bdi>
        </button>
      ))}
      <button type="button" onClick={onOpen} className="a-chip shrink-0">
        {t.all}
      </button>
    </div>
  );
}

export function BehaviourCard({ view, inputs, onOrders, onChannel, onOpenAssumptions }: { view: ProviderWorkbenchView; inputs: WorkbenchInputs; onOrders: (n: number | null) => void; onChannel: (ch: Channel | null) => void; onOpenAssumptions: () => void }) {
  const t = c.providers.behaviour;
  const b = view.behaviour;
  const enteredOrders = b.orders.state === "entered";
  const enteredChannel = b.channel.state === "entered";
  return (
    <Card as="section" className="flex flex-col gap-4 lg:flex-1 min-w-0" aria-labelledby="beh-title">
      <h2 id="beh-title" className="text-lg font-semibold">
        {t.title}
      </h2>
      <AmountChips inputs={inputs} onOpen={onOpenAssumptions} />
      <ParameterLine />
      <div className="grid gap-4 grid-cols-[minmax(0,1fr)] sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <NumberField
                label={t.orders}
                unit="count"
                value={b.ordersN}
                isEntered={enteredOrders}
                validate={(n) => (!Number.isInteger(n) || n < ORDERS_MIN || n > ORDERS_MAX ? c.providers.offer.errors.orders(ORDERS_MIN, ORDERS_MAX) : null)}
                onCommit={(n) => onOrders(n)}
                onReset={() => onOrders(null)}
                inputMode="numeric"
                optional
                hint={undefined}
              />
            </div>
            <Button variant="icon" className="border border-input h-field w-11 shrink-0" aria-label={t.ordersDown} disabled={b.ordersN <= ORDERS_MIN} onClick={() => onOrders(b.ordersN - 1)}>
              <IconDown size={18} />
            </Button>
            <Button variant="icon" className="border border-input h-field w-11 shrink-0" aria-label={t.ordersUp} disabled={b.ordersN >= ORDERS_MAX} onClick={() => onOrders(b.ordersN + 1)}>
              <IconUp size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
            {b.ordersN === 1 ? (
              <span>{t.ordersHint.one}</span>
            ) : b.ordersN === 2 ? (
              <span>{t.ordersHint.two}</span>
            ) : (
              <span>
                {t.ordersHint.before}
                <Num value={b.orders} size="cell" display={fmt.number(b.ordersN)} />
                {t.ordersHint.many}
              </span>
            )}
            {enteredOrders && (
              <Button variant="quiet" className="text-xs -ms-2 min-h-9" onClick={() => onOrders(null)}>
                <IconReset size={14} /> {buttons.resetOne}
              </Button>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="field-label" id="beh-channel">
            {t.channel}
          </span>
          <SegmentedControl<Channel> labelledBy="beh-channel" value={b.channelId} onChange={onChannel} options={(["direct", "branch"] as const).map((v) => ({ value: v, label: t.channelOptions[v] }))} />
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
            {b.anyBroker && <span>{t.channelBrokers}</span>}
            {enteredChannel && (
              <Button variant="quiet" className="text-xs -ms-2 min-h-9" onClick={() => onChannel(null)}>
                <IconReset size={14} /> {buttons.resetOne}
              </Button>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>{b.fxCurrency ? t.fxForeign(b.fxCurrency) : t.fxShekels}</p>
        <p>
          <Num value={b.deposits} size="cell" display="12" />
          {t.deposits.replace(/^12/, "")}
        </p>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- fee-level switch

export function FeeLevelSwitch({ level, averagesAvailable, averageSource, offerCount, links, onChange, onEnter, hasOffers }: { level: UiLevel; averagesAvailable: boolean; averageSource: "BoI" | "TASE" | null; offerCount: number; links: { boi: RefLink | null; tase: RefLink | null }; onChange: (l: UiLevel) => void; onEnter: () => void; hasOffers: boolean }) {
  const t = c.providers;
  const linkCls = "text-link hover:underline inline-flex items-center gap-1 min-h-9";
  return (
    <div className="sticky top-14 lg:static z-[var(--z-sticky)] bg-background/95 backdrop-blur lg:backdrop-blur-none -mx-gutter px-gutter py-2 lg:mx-0 lg:px-0 lg:py-0 flex flex-col gap-1.5 border-b border-border lg:border-b-0 lg:flex-1 min-w-0">
      <SegmentedControl<UiLevel>
        label={t.levelAria}
        value={level}
        onChange={onChange}
        options={[
          { value: "list", label: c.levels.list },
          { value: "average", label: c.levels.average, disabled: !averagesAvailable },
          { value: "entered", label: offerCount > 0 ? t.entered.count(offerCount) : c.levels.entered },
        ]}
      />
      <p className="text-xs text-muted-foreground flex flex-col gap-0.5">
        {level === "list" && <span>{t.levelLine.list}</span>}
        {level === "average" && <span>{t.levelLine.averageSome(averageSource === "BoI" ? c.regulators.BoI! : "הבורסה")}</span>}
        {level === "entered" && <span>{t.levelLine.entered}</span>}
        {level === "entered" && !hasOffers && (
          <span className="flex flex-wrap items-center gap-x-2">
            {t.entered.none}
            <button type="button" onClick={onEnter} className="text-link hover:underline min-h-9">
              {t.entered.link}
            </button>
          </span>
        )}
        {!averagesAvailable && (
          <>
            <span>{t.levelLine.averageNone}</span>
            <span className="flex flex-wrap gap-x-4">
              {links.boi && (
                <a href={links.boi.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {c.noAverageLinks.boi} <IconExternal size={14} />
                </a>
              )}
              {links.tase && (
                <a href={links.tase.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  {c.noAverageLinks.tase} <IconExternal size={14} />
                </a>
              )}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
