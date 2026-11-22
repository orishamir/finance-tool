// The fee page (method §10.6): the head, the bar of the deal, and under it the deal's editor (editor.tsx) with the strip of what the deal is
// about, then the reading, which opens with the picks it is read for. The deal is kept on this device, saved as it changes from its first
// fee or a typed name. It opens from the address (a deal in `#d=`, or in `?d=` as links were written before, the saved one where the link's
// deal is one already; a kind in `?wrapper=`, a track in `?track=`), else the deal last worked on, else an empty deal with the kinds to
// choose from. "Today" is the device's day, read after the page loads: the pre-rendered page shows the head and the words that it is
// loading, never a deal of another day. The bar's end opens another saved deal or a new one, and copies the deal's link. A link pasted into
// the address while the page is open opens as a fresh load would. A link that does not open says why above the kind chooser, and one whose
// fees do not all open opens the rest and names the ones left out. The strip's "לבחור תעריפון" opens the template picker, where a price list
// opens a new deal beside this one; its track's button opens the tracks, and the track picked is set on the deal on screen (`pickTrack`). A
// deal with no kind shows its kinds to choose from alone, a deal with a kind the line over its fees, in the card's one place, so the first
// fee moves nothing; the toolbox comes with a fee open, and the reading with the first fee. The reading leaves out each fee switched off in
// its card's corner (lib/fee-deal/off.ts), and says so where every fee with a price is off.
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { feeDeal as copy } from "../../copy";
import { newDeal, type FeeDeal } from "../../lib/fee-deal/model";
import { kindById } from "../../lib/fee-deal/kinds";
import { dealOfAddress, type AddressDeal } from "../../lib/fee-deal/link";
import { withLaterFillsAll } from "../../lib/fee-deal/templates";
import { dealStore, unreadDeals } from "../../lib/fee-deal/store";
import type { DealUndo } from "../../lib/fee-deal/undo";
import type { FeesData } from "../../lib/fee-page-data";
import { Breadcrumb } from "../shell";
import { Callout, LinkButton, PageHead, ReadForBand, Section } from "../kit";
import { isAccountDeal } from "../../lib/deal-account/plan";
import { dealOnIndexPath, lastIndexStore } from "../../lib/deal-account/last-index";
import { DealBar } from "./bar";
import { BarEnd, useCopyLink } from "./bar-end";
import { DealNotices, type NoticeLine } from "./deal-notices";
import { pickItems, useDealEditor } from "./editor";
import { FeeLinksProvider } from "./links";
import { UndoLine } from "./undo-line";
import { READING_ID } from "./left-out";
import { ReadingCards } from "./reading";
import { useOpenedDeal } from "./use-deal-document";
import { feeName } from "./words";
import { todayLocal } from "../../lib/today";

/**
 * Where the focus goes from a saved deal's undo line, after "ביטול" or when it goes: the saved deals' menu, else (no deal saved, so no
 * menu) the deal's name in the bar.
 */
const dealsMenuOrName = () => document.querySelector<HTMLElement>("[data-deals-menu] button") ?? document.querySelector<HTMLElement>("[data-deal-bar] input");

function Head() {
  return <PageHead title={copy.title} lede={copy.lede} crumb={<Breadcrumb parent={{ href: "/", label: "" }} current={copy.crumb} />} />;
}

/** The page: the head at once; the bar and the columns once the data and the device's deals are read. */
export function FeeDealPage({ data, failed }: { data: FeesData | null; failed: boolean }) {
  const store = dealStore.use();
  // each saved deal with what its house's list fills that it has not had (`withLaterFills`)
  const saved = useMemo(() => withLaterFillsAll(store.value, data), [store.value, data]);
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayLocal()), []);
  // the deal the address names, read once the page has what it needs (a deal in the fragment is opened by the browser's own decompression,
  // which takes a moment): `undefined` while it is read
  const { search, hash } = useLocation();
  const [address, setAddress] = useState<AddressDeal | null | undefined>(undefined);
  useEffect(() => {
    if (!data || !today || address !== undefined) return;
    let on = true;
    // a link that cannot be read at all (the browser's decompression refused it) is a broken link, said as any other is
    dealOfAddress(search, hash, data, today).then(
      (a) => on && setAddress(a),
      (e: unknown) => {
        console.error(e);
        if (on) setAddress({ deal: newDeal(null), given: false, left: [], failed: "broken" });
      },
    );
    return () => {
      on = false;
    };
  }, [data, today]);
  return (
    <div className="flex flex-col gap-6">
      <Head />
      {failed ? (
        <Callout tone="caution">{copy.failed}</Callout>
      ) : data && today && store.ready && address !== undefined ? (
        <Deal data={data} today={today} saved={saved} writable={store.writable} address={address} />
      ) : (
        <p className="text-muted-foreground">{copy.loading}</p>
      )}
    </div>
  );
}

/**
 * The deal on screen and its views: its document (use-deal-document.ts), the fee open in place (use-open-case.ts), the template picker
 * (use-template-picker.ts), and the deal read once for every view, of which the columns, the toolbox, the menus and the reading are drawn.
 */
/** What a link that did not open whole says: why it failed, else the fees it carried that did not open, each with why; null where it opened whole. */
function linkWords(a: AddressDeal | null): string | null {
  if (!a) return null;
  if (a.failed) return copy.end.failed + copy.end.failedWhy[a.failed]!;
  if (a.left.length === 0) return null;
  const w = copy.end.left;
  const what = a.left.map((l) => (l.kind === null ? w.kind : feeName(l.kind) + (l.why === "prices" ? w.prices : ""))).join("; ");
  return a.left.length === 1 ? w.one(what) : w.many(a.left.length, what);
}

/**
 * The deal on screen, in the shared editor (editor.tsx): under the bar the notices, the columns with the strip of what the deal is about,
 * and the reading, which opens with the picks it is read for.
 */
function Deal({ data, today, saved, writable, address }: { data: FeesData; today: string; saved: readonly FeeDeal[]; writable: boolean; address: AddressDeal | null }) {
  const first = useOpenedDeal(address, saved, today);
  // what the link the page opened from, or one pasted since, did not open: it stands until it is closed or another deal opens
  const [linkNote, setLinkNote] = useState<string | null>(() => linkWords(address));
  // saved deals that do not open (lib/fee-deal/store.ts), said until closed
  const [unreadClosed, setUnreadClosed] = useState(false);
  const ed = useDealEditor({
    data,
    today,
    saved,
    writable,
    first,
    onShown: () => {
      setLinkNote(null);
      link.closeBlocked();
    },
  });
  const { doc, deal, kind, views, said, setSaid, refusal, onUndo, open, onDelete, oc } = ed;
  const { shown, words, lines } = ed.undo;
  const change = doc.change;
  const link = useCopyLink(deal);
  const lastIndex = lastIndexStore.use();
  // a link pasted into the address while the page is open (a change of the fragment alone loads nothing): its deal opens as on a fresh
  // load, saved as a deal, the one on screen kept among the saved ones; the address is cleared again
  const navigate = useNavigate();
  useEffect(() => {
    let on = true;
    const onHash = () => {
      if (!new URLSearchParams(window.location.hash.replace(/^#/, "")).has("d")) return;
      void dealOfAddress("", window.location.hash, data, today).then((a) => {
        if (!on || !a) return;
        doc.openGiven(a);
        setLinkNote(linkWords(a));
        navigate({ search: "", hash: "" }, { replace: true, preventScrollReset: true });
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      on = false;
      window.removeEventListener("hashchange", onHash);
    };
  });
  // the reading's picks: one for each thing the deal's fees change by that it picks, each changed on the deal (its link carries them)
  const picks = views?.reading?.picks;
  // the lines that stand under the bar until closed or no longer true
  const unread = unreadDeals();
  const notices: NoticeLine[] = [
    ...(linkNote ? [{ key: "link", text: linkNote, onClose: () => setLinkNote(null) }] : []),
    ...(doc.deletedElsewhere ? [{ key: "deleted", text: copy.end.deletedElsewhere, action: { label: copy.end.keepAnyway, onClick: doc.keepAnyway } }] : []),
    ...(unread > 0 && !unreadClosed ? [{ key: "unread", text: copy.end.unread(unread), onClose: () => setUnreadClosed(true) }] : []),
    ...(link.tooLong ? [{ key: "too-long", text: copy.end.tooLong, onClose: link.closeBlocked }] : []),
  ];

  return (
    <FeeLinksProvider value={oc.links}>
      <DealBar
        deal={deal}
        kind={kind}
        writable={writable}
        onDeal={change}
        end={
          <BarEnd
            deal={deal}
            saved={saved}
            kindName={(d) => kindById(data.kinds, d.kind)?.name ?? null}
            copied={link.copied}
            onCopy={() => void link.copyLink()}
            onOpen={(id) => {
              const d = saved.find((x) => x.id === id);
              if (d) open(d);
            }}
            onNew={() => open(newDeal(null))}
            onRename={doc.rename}
            onDelete={onDelete}
          />
        }
      />
      {/* for a screen reader: what the undo line says, else what the page just did (a price list opened a new deal, the link was copied);
          where the browser would not copy the link, the link to copy by hand */}
      <DealNotices
        status={words ?? refusal?.words ?? said ?? (link.copied ? copy.end.copied : "")}
        lines={notices}
        undoLine={
          lines.deal && (
            <UndoLine key={`undo:deal:${(shown as DealUndo).deal.id}`} as="div" onUndo={onUndo} onHold={doc.undo.setHolding} take={doc.undo.take(shown!)} refocusOnUndo refocus={dealsMenuOrName}>
              {lines.deal}
            </UndoLine>
          )
        }
        said={said}
        blocked={link.blocked}
        onDismiss={() => setSaid(null)}
      />
      {ed.picker}
      {ed.columns(
        // a saved securities account's strip ends with one link: the deal against every house, on the index last shown (F-128)
        isAccountDeal(deal) && saved.some((d) => d.id === deal.id) ? (
          <>
            {ed.setupStrip}
            <LinkButton variant="framed" to={dealOnIndexPath(deal.id, lastIndex.value)} className="mt-2 self-start">
              {copy.end.onIndices} ↗
            </LinkButton>
          </>
        ) : (
          ed.setupStrip
        ),
      )}
      {ed.menus}
      {views?.reading && (
        <Section id={READING_ID} title={copy.reading}>
          {picks && (
            <div className="mb-4">
              <ReadForBand
                lead={picks.title}
                note={picks.line}
                picks={pickItems(picks.things, ed.onPick)}
              />
            </div>
          )}
          {/* the chart's chosen period belongs to the deal it was chosen on: another deal starts from its own */}
          <ReadingCards
            key={deal.id}
            reading={views.reading}
            saved={ed.saves}
            fx={data.fx}
            none={ed.none}
            unitPrice={ed.unitPrice}
            onUnitPrice={ed.onUnitPrice}
            left={views.left}
            foreign={ed.countedRead.engine.foreign}
          />
        </Section>
      )}
      {/* the toolbox where it has no column, pinned to the foot of the screen, keeps its room at the end of the document */}
      {ed.footSheet}
    </FeeLinksProvider>
  );
}
