// What a track's cells hold, for every list of tracks (with the track browser: the company page's table and the browser's
// both draw them, so they live here): the regulator's two fee averages, the stock and currency exposure with a bar for each, and the labels
// beside a track's name. Each number goes through the provenance component; an empty one says why in its words and sheet.
import { r3workbench, company as copy, track as trackCopy } from "../../copy";
import { shareFraction, shareText, type ExposureShares } from "../../lib/track-exposure";
import { trackLabels } from "../../lib/track-labels";
import { depositFeeNoneByRule, type SiteValue } from "../../lib/value";
import { IconAlert, IconExternal } from "../icons";
import { Num } from "../provenance";
import { mostlyHebrew } from "../../lib/source-label";
import { ProductFigures, ProductIdLink } from "./product-table";
import { MeterBar } from "./period-bars";
import { Tag } from "./tag";

/** The track's page on the regulator's Gemel-Net (idGuf is the fund number, OCHLUSIYA=1 the general
 * population, which every listed track is). Pensia-Net is a search form with no page per fund: a pension track has no link. */
export function gemelNetUrl(dataset: string, fundId: number | string): string | null {
  return dataset === "gemelnet" ? `https://gemelnet.cma.gov.il/views/perutHodshi.aspx?idGuf=${fundId}&OCHLUSIYA=1` : null;
}

/** A track's fund number, the link out to its page on Gemel-Net where there is one (`13414 ↗`). */
export function TrackFundId({ fundId, dataset }: { fundId: number | string; dataset: string }) {
  return <ProductIdLink id={String(fundId)} href={gemelNetUrl(dataset, fundId)} label={trackCopy.gemelNet.label.replace("{id}", String(fundId))} />;
}

/** The link to the track's page on Gemel-Net, in words, for the track's own page; nothing for a pension track. */
export function GemelNetLink({ fundId, dataset }: { fundId: number | string; dataset: string }) {
  const href = gemelNetUrl(dataset, fundId);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1 min-h-target">
      {trackCopy.gemelNet.page}
      <IconExternal size={14} />
    </a>
  );
}

/** A regulator fee average: the number, "אין" for a deposit fee the product's regulation does not have (PF-06), "—" for an empty one (its sheet heads "עוד לא דווח"; no caution mark), and the caution mark for a negative one. Nothing here ranks a track. */
export function FeeNum({ value, size = "inline" }: { value: SiteValue; size?: "inline" | "cell" }) {
  const none = depositFeeNoneByRule(value);
  const missing = value.value === null && !none;
  const negative = typeof value.value === "number" && value.value < 0;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Num value={missing ? { ...value, notes: mostlyHebrew(value.notes) ? `${r3workbench.missingNote} ${value.notes}` : r3workbench.missingNote } : value} size={size} display={none ? trackCopy.feeNone : missing ? trackCopy.emptyMark : undefined} {...(missing ? { fullWord: trackCopy.feeNotReported } : {})} />
      {negative && <IconAlert size={16} className="text-caution shrink-0" />}
    </span>
  );
}

/** Both fee averages, each with its word: from the balance, then from the deposits (D34). `inline`: on a phone, in one line. */
export function TrackFeeLines({ fee, deposit, size = "inline", inline }: { fee?: SiteValue | undefined; deposit?: SiteValue | undefined; size?: "inline" | "cell"; inline?: boolean }) {
  const lines = [
    { id: "savings", v: fee, word: copy.fees.savings },
    { id: "deposits", v: deposit, word: copy.fees.deposits },
  ].filter((l): l is typeof l & { v: SiteValue } => !!l.v);
  const items = lines.map((l) => ({ id: l.id, figure: <FeeNum value={l.v} size={size} />, word: l.word }));
  return inline ? (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <ProductFigures items={items} inline />
    </span>
  ) : (
    <ProductFigures items={items} />
  );
}

/** F-87 or F-88 (D34) through the provenance component; a share that could not be computed says why in its words and sheet. */
export function ShareNum({ value, size = "inline" }: { value: SiteValue; size?: "inline" | "cell" }) {
  return <Num value={value} size={size} display={shareText(value)} />;
}

/**
 * A track's exposure (D34): a line for stocks and one for foreign currency, each its word, a bar of its share from 0 to 100% in the
 * measure's colour (full above 100%; the eye's alone, the figure carries the meaning) and its figure. The words' column and the bars have
 * one width, so in a list every bar starts at the same edge and has the same length, and the eye runs down the column.
 */
export function ExposureCell({ value, size = "inline" }: { value: ExposureShares; size?: "inline" | "cell" }) {
  const lines = [
    { id: "stocks", v: value.stock, word: copy.stock.stocks, tone: "stocks" as const },
    { id: "currency", v: value.currency, word: copy.stock.currency, tone: "currency" as const },
  ].filter((l): l is typeof l & { v: SiteValue } => !!l.v);
  return (
    <span className="grid grid-cols-[2.5rem_4rem_auto] items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
      {lines.map((l) => (
        <span key={l.id} className="contents">
          <span>{l.word}</span>
          <MeterBar share={shareFraction(l.v)} tone={l.tone} />
          <ShareNum value={l.v} size={size} />
        </span>
      ))}
    </span>
  );
}

/** The default track's tag, then the facts about this track (lib/track-labels.ts: "חדש" for a track opened in or after the fee year). Nothing when there is none. */
export function TrackLabels({ isDefault, track }: { isDefault?: boolean; track: { inception: string | null; reportPeriod: string } }) {
  const labels = trackLabels(track);
  if (!isDefault && labels.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {isDefault && <Tag tone="parameter">{copy.default}</Tag>}
      {labels.map((l) => (
        <Tag key={l}>{copy.labels[l]}</Tag>
      ))}
    </span>
  );
}
