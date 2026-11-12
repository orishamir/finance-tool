// The end of the fee page's bar: the deals this device keeps (open one, start a new one, rename or delete one after a question, as the
// site's other lists of the person's own items do), a link to the deal on screen, and the template picker's button where the deal's kind has
// templates. Copying the link says it was copied; where the browser refuses the clipboard, the page shows the address to copy by hand.
import { useRef, useState } from "react";
import { feeDeal as copy } from "../../copy";
import { dealPath } from "../../lib/fee-deal/link";
import type { FeeDeal } from "../../lib/fee-deal/model";
import { siteAddress } from "../../lib/site-paths";
import { IconCopy } from "../icons";
import { Button, MenuPicker } from "../kit";

const w = copy.end;

/** How a saved deal is listed: its name, else its template's, else the bar's placeholder for its kind. */
export const dealLabel = (d: FeeDeal, kindName: string | null): string => d.name.trim() || d.template?.name || copy.bar.namePlaceholder(kindName);

/** The deal's address to copy, on this site's origin and base. */
export const dealLink = (deal: FeeDeal): string => siteAddress(window.location.origin, import.meta.env.BASE_URL, dealPath(deal));

/** Copying a deal's link: `copied` for a moment after it worked, `blocked` holding the address where the clipboard refused it. */
export function useCopyLink() {
  const [copied, setCopied] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyLink = async (deal: FeeDeal) => {
    const text = dealLink(deal);
    try {
      await navigator.clipboard.writeText(text);
      setBlocked(null);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setBlocked(text);
    }
  };
  return { copied, blocked, copyLink, closeBlocked: () => setBlocked(null) };
}

export function BarEnd({ deal, saved, kindName, copied, onCopy, onOpen, onNew, onRename, onDelete, onTemplates }: {
  deal: FeeDeal;
  saved: readonly FeeDeal[];
  kindName: (d: FeeDeal) => string | null;
  copied: boolean;
  onCopy: () => void;
  onOpen: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  /** Opens the template picker from the button tapped (its anchor), where the deal's kind has templates. */
  onTemplates: ((from: HTMLElement) => void) | null;
}) {
  return (
    <>
      <MenuPicker
        name={w.dealsName}
        items={saved.map((d) => ({ id: d.id, label: dealLabel(d, kindName(d)), editable: true }))}
        value={deal.id}
        placeholder={w.deals}
        buttonLabel={`${w.deals} · ${saved.length}`}
        words={w.words}
        onSelect={onOpen}
        onRename={onRename}
        onDelete={onDelete}
        add={{ label: w.newDeal, onClick: onNew }}
      />
      <Button variant="quiet" onClick={onCopy}>
        <IconCopy size={18} /> {copied ? w.copied : w.link}
      </Button>
      {onTemplates && (
        <Button variant="quiet" onClick={(e) => onTemplates(e.currentTarget)}>
          {w.template}
        </Button>
      )}
    </>
  );
}
