// The end of the fee page's bar: the deals this device keeps (open one, start a new one, rename one, or delete one at once, which the page
// can undo), each row with its product and the day it was saved under its name; and a link to the deal on screen once it has a kind. A
// control that could do nothing is not drawn: no list before a deal is saved. Copying the link says so on its button for a moment; where the browser refuses the
// clipboard, the page shows the address to copy by hand, and where the deal is too big for a link that opens, it says so and copies nothing.
import { useEffect, useRef, useState } from "react";
import { feeDeal as copy } from "../../copy";
import { encodedDealPath } from "../../lib/fee-deal/link";
import type { FeeDeal } from "../../lib/fee-deal/model";
import { siteAddress } from "../../lib/site-paths";
import { IconCopy } from "../icons";
import { fmt } from "../../lib/format";
import { Button, MenuPicker } from "../kit";

const w = copy.end;

/** How a saved deal is listed: its name, else its template's, else the bar's placeholder for its kind. */
export const dealLabel = (d: FeeDeal, kindName: string | null): string => d.name.trim() || d.template?.name || copy.bar.namePlaceholder(kindName);

/** The deal's address to copy, on this site's origin and base; null where it would be too long to open (`packDeal`). */
export async function dealLink(deal: FeeDeal): Promise<string | null> {
  const path = await encodedDealPath(deal);
  return path === null ? null : siteAddress(window.location.origin, import.meta.env.BASE_URL, path);
}

/**
 * Copying the link of the deal on screen: `copied` for a moment after it worked, `blocked` holding the address where the clipboard refused
 * it, and `tooLong` where the deal is too big for a link that opens, so nothing is copied. The link is compressed as the deal changes, so
 * a press writes it at once, in the press itself, as a browser asks of the clipboard. `blocked` and `tooLong` belong to the deal as it was
 * when copied: any change to it, or another deal, takes them away, so the box never holds a link of another state of the deal.
 */
export function useCopyLink(deal: FeeDeal) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState<{ deal: FeeDeal; text: string | null } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ready = useRef<{ deal: FeeDeal; text: string | null } | null>(null);
  useEffect(() => {
    let on = true;
    void dealLink(deal).then((text) => {
      if (on) ready.current = { deal, text };
    });
    return () => {
      on = false;
    };
  }, [deal]);
  const copyLink = async () => {
    const text = ready.current?.deal === deal ? ready.current.text : await dealLink(deal);
    if (text === null) {
      setCopied(false);
      setFailed({ deal, text: null });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setFailed(null);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setFailed({ deal, text });
    }
  };
  const now = failed?.deal === deal ? failed : null;
  return { copied, blocked: now?.text ?? null, tooLong: !!now && now.text === null, copyLink, closeBlocked: () => setFailed(null) };
}

/** A saved deal's line under its name in the list: its product, and the day it was last saved. */
export const dealMeta = (d: FeeDeal, kindName: string | null): string => [kindName ?? copy.bar.namePlaceholder(null), d.saved ? `${w.savedOn}${fmt.date(d.saved)}` : null].filter(Boolean).join(" · ");

export function BarEnd({ deal, saved, kindName, copied, onCopy, onOpen, onNew, onRename, onDelete }: {
  deal: FeeDeal;
  saved: readonly FeeDeal[];
  kindName: (d: FeeDeal) => string | null;
  copied: boolean;
  onCopy: () => void;
  onOpen: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      {saved.length > 0 && (
        <span data-deals-menu="" className="contents">
          <MenuPicker
            name={w.dealsName}
            items={saved.map((d) => ({ id: d.id, label: dealLabel(d, kindName(d)), meta: dealMeta(d, kindName(d)), editable: true }))}
            value={deal.id}
            placeholder={w.deals}
            buttonLabel={`${w.deals} · ${saved.length}`}
            words={w.words}
            onSelect={onOpen}
            onRename={onRename}
            onDelete={onDelete}
            deleteAsks={false}
            add={{ label: w.newDeal, onClick: onNew }}
          />
        </span>
      )}
      {deal.kind && (
        <Button variant="outline" onClick={onCopy}>
          <IconCopy size={18} />
          {/* both words laid out in one cell, so the button keeps its width while it says the link was copied */}
          <span className="inline-grid *:[grid-area:1/1]">
            <span aria-hidden="true" className="invisible">
              {w.copied.length > w.link.length ? w.copied : w.link}
            </span>
            <span>{copied ? w.copied : w.link}</span>
          </span>
        </Button>
      )}
    </>
  );
}
