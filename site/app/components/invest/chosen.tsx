// The card of the receipt's pair, third in the side rail: what the page knows of its account and fund, one fact a line, read from the same
// records the lists read; the lists' rows keep to one short shape, and this card says the rest for these two. The account: its house's
// price list and when it was collected, the price it prints and the figure leaves out, its customer groups with the choice of one (and,
// with one picked, how long the group's price holds), a standing-order or phone-only purchase, and the way to enter a price the person got.
// The fund: its document, number and kind, its labels by group, its gap from the index, its manager, and any note about its price. The
// terms the person typed stand on the typed row of the list, with the way to change them.
import { groupPrices, invest as c } from "../../copy";
import { fmt } from "../../lib/format";
import { isCustomFund } from "../../lib/custom-entries";
import { accountSum, asideLines, gapListFor, type InvestView } from "../../lib/invest";
import { brokeragePagePath } from "../../lib/site-paths";
import { pickableGroups } from "../../lib/group-pick";
import { brokerLabels } from "../../lib/labels";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";
import { receiptAmounts } from "../../lib/receipt";
import { ownBy, sumOf, type SiteValue } from "../../lib/value";
import { Num, StateTag } from "../provenance";
import { useState } from "react";
import { Card, DocLink, FactTile, GroupPriceFold, HelpMark, KeyValue, LabelChip, LabelRow, MixedName, ProductIdLink, SourcedTag, Tag, TileJoin, When, gershayim, type GroupChoice } from "../kit";
import { brands } from "../../copy";
import { OwnAccountButton } from "./own-account";
import { OptionTag } from "./parts";
import { allFunds, asideWords, crownedHouse, GapCell, gapNoteOf, gapStateOf, inTieSet, labelsOf, mayaHrefOf, pairVerdict, phoneOf, pickHalf, priced, unitsLine, type OnPick, type Pick } from "./pair";
import { ProviderLink, providerName } from "./sections";

/** The label families the card gives a line each, in its order; a family the fund has no label in has no line. */
const GROUPS = ["follow", "payout", "currency", "tax"] as const;

export function ChosenPair({ view, bundle, plan, pick, chosen, onPick, group = null }: { view: InvestView; bundle: IndicesBundle; plan: WorkbenchInputs; pick: Pick; chosen: boolean; /** Picks a customer group of the house (the account tile's fold); without it the fold only shows the groups. */ onPick?: OnPick; /** The house's group picked: `pick.house` is then the held account priced at it, and this its house and the group's name. */ group?: { house: string; key: string; name: string } | null }) {
  // the house's customer groups open and close at the person's tap; an address that names a group opens them, so the picked one is in view
  const [groupsOpen, setGroupsOpen] = useState(!!group);
  const v = pairVerdict(view, bundle, plan, pick, chosen);
  const pc = v.pc;
  // the tile describes the house: with a group picked, `pick.house` is the group's held account, priced at its prices, and the house is its base
  const baseId = group?.house ?? pick.house;
  const house = providerName(view, baseId);
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  if (!pc || !house || !fund) return null;
  const today = bundle.today;
  // the house's own record (its price list, its date, its groups); the priced figure's (`at`), the group's account where one is picked
  const snap = bundle.snapshots.find((s) => s.id === baseId);
  const pricedSnap = bundle.snapshots.find((s) => s.id === pick.house);
  const at = fund.byHouse[pick.house];
  const price = priced(at) ? at : null;
  const r = receiptAmounts(pc);
  // the account's and the fund's figures as the receipt writes them, added (F-91, without the tax)
  const together = sumOf({ [c.receipt.parts.account]: accountSum(pc, c.receipt.parts.account, today, Math.round), [c.receipt.parts.fund]: pc.fund }, "F-91", { today, about: c.chosen.togetherAbout, round: Math.round });
  // the star the account list gives: the house every pair of the tie set is at, on a pair of the set
  const crownHouse = crownedHouse(view, v.best, v.theta);
  const crowned = !group && crownHouse === pick.house && inTieSet(view, v.best, { house: crownHouse, fund: pick.fund }, v.theta);
  const aside = price ? asideWords(asideLines(pricedSnap, price.aside), pc.priced.house) : null;
  const phone = phoneOf(view, bundle, pick);
  // the fund's document: where its fees come from, the annual report for a fund listed here
  const doc = isCustomFund(fund.rec) ? null : (fund.rec.fees.fixed_management?.source ?? null);
  const labels = labelsOf(view, fund, bundle);
  const list = gapListFor(bundle, fund.rec);
  const state = gapStateOf(fund.rec, list);
  const isin = fund.rec.identifiers?.isin;
  const twin = isin ? allFunds(view).find((x) => x !== fund && x.rec.identifiers?.isin === isin) : undefined;
  const units = fund.noUnitPrice ? c.pair.unitPriceMissing : price ? unitsLine(price.units) : null;
  // the house's groups, which the fold lists with the choice of one (D43, lib/group-pick)
  const groups = snap?.groups?.state === "prices" ? snap.groups.entries : [];
  const can = pickableGroups(snap, fund.option);
  const choice: GroupChoice | undefined =
    onPick && can.size > 0 ? { can: (k) => can.has(k), selected: group?.house === baseId ? group.key : null, onChoose: (k) => pickHalf(view, pick, { house: baseId }, (p, m) => onPick({ ...p, group: k }, m)) } : undefined;
  const cautions = [price?.open ? c.pair.openRow : null, units, twin ? c.pair.sameFundAs(twin.number, twin.option === "abroad") : null].filter((x): x is string => !!x);
  return (
    <Card as="section" pad="tight" className="flex flex-col gap-3" aria-label={c.shownPair(chosen).cardTitle}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{c.shownPair(chosen).cardTitle}</h2>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {c.chosen.together.before} <Num value={together} display={fmt.nisWhole(r.account + r.fund)} /> {c.chosen.together.after}
        </span>
      </div>
      <div className="flex flex-col">
        <FactTile
          edge="border-chart-by-account"
          head={c.pair.accountSlot}
          link={house.custom ? <StateTag state="entered" /> : snap && <DocLink source={snap.tariff} className="text-xs">{gershayim(c.pair.tariff)}</DocLink>}
          foot={
            <>
              {/* what the house's price is for this purchase: a standing order's, where the monthly deposit is bought on one */}
              {price?.standing && plan.monthly > 0 && <Tag>{c.pair.standingTag}</Tag>}
              <LabelRow labels={brokerLabels(house, false)} />
              {/* the picked group's price holds for a time, then the price list's (F-101) */}
              {group && <p className="text-sm text-muted-foreground">{groupPrices.pickedLine(group.name)}</p>}
              {groups.length > 0 && <GroupPriceFold className="self-stretch" entries={groups} house={house.short} href={brokeragePagePath(baseId)} open={groupsOpen} onOpenChange={setGroupsOpen} {...(choice ? { choice } : {})} />}
              {phone && (
                <p className="text-xs text-muted-foreground">
                  <SourcedTag value={phone}>{c.pair.phoneTag}</SourcedTag> {c.pair.phoneLine(house.short)}
                </p>
              )}
              {!house.custom && snap && (
                <OwnAccountButton houseId={house.id} house={house.short} className="self-start -ms-2">
                  {c.pair.ownPrice}
                </OwnAccountButton>
              )}
            </>
          }
          name={
            <span className="flex items-baseline justify-between gap-2">
              <span className={house.custom ? "text-entered" : undefined}>
                <ProviderLink p={house} />
              </span>
              {house.id === view.yourBroker && <span className="shrink-0 text-sm font-normal text-entered">{c.pair.yoursTag}</span>}
              {crowned && <span className="shrink-0 text-sm font-medium text-primary">{c.pair.cheapestTag}</span>}
            </span>
          }
        >
          {snap && !house.custom && (
            <KeyValue size="xs" label={c.chosen.collected}>
              <When iso={snap.snapshot} />
            </KeyValue>
          )}
          <KeyValue size="xs" label={c.chosen.aside}>
            {aside ? <span className="block text-start">{aside}</span> : c.chosen.none}
          </KeyValue>
        </FactTile>
        <TileJoin />
        <FactTile
          edge="border-chart-by-fund"
          head={c.pair.fundSlot}
          link={doc && <DocLink source={doc} className="text-xs">{c.chosen.isReport(doc.title) ? c.chosen.fundDoc : c.chosen.fundDocOther}</DocLink>}
          foot={
            <>
              {fund.rec.manager && (
                <p className="text-xs text-muted-foreground">
                  {c.funds.manager}: <MixedName>{fund.rec.manager}</MixedName>
                </p>
              )}
              {cautions.map((x) => (
                <p key={x} className="text-xs text-caution-foreground">
                  {x}
                </p>
              ))}
            </>
          }
          name={<MixedName className={isCustomFund(fund.rec) ? "text-entered [overflow-wrap:anywhere]" : "[overflow-wrap:anywhere]"}>{fund.name}</MixedName>}
        >
          {fund.number && (
            <KeyValue size="xs" label={c.chosen.number}>
              <ProductIdLink id={fund.number} href={mayaHrefOf(fund)} label={brands.funds.mayaLink(fund.number)} />
            </KeyValue>
          )}
          <KeyValue size="xs" label={c.chosen.kind}>
            <OptionTag option={fund.option} />
          </KeyValue>
          {/* a fund that pays out: its yield as its manager reports it */}
          {fund.rec.distribution && (
            <KeyValue size="xs" label={c.pair.colYield}>
              <Num value={ownBy(fund.rec.distribution.yield as SiteValue, fund.rec.manager)} size="inline" />
            </KeyValue>
          )}
          {GROUPS.map((g) => {
            const of = labels.filter((l) => l.family === g);
            return of.length === 0 ? null : (
              <KeyValue key={g} size="xs" label={c.chosen.groups[g]}>
                <span className="text-end">
                  {of.map((l, i) => (
                    <span key={l.id}>
                      {i > 0 && " · "}
                      <LabelChip label={l} words />
                    </span>
                  ))}
                </span>
              </KeyValue>
            );
          })}
          <KeyValue
            size="xs"
            label={
              <span className="inline-flex items-center gap-1">
                {state === "net" || state === "gross" ? c.kinds.gapHead[state] : c.kinds.colGap}
                <HelpMark about={c.kinds.colGap} text={gapNoteOf([fund.rec], [state])} />
              </span>
            }
          >
            <GapCell rec={fund.rec} today={today} list={list} />
          </KeyValue>
        </FactTile>
      </div>
    </Card>
  );
}
