// The transfer sheet (design-spec 15): a full-height bottom sheet on a phone, a centred card on PC, opened from the
// holdings page's save line, the saved-goal strip's menu and the footer. By link, the same panel is the page /transfer.
import { useId } from "react";
import { Sheet } from "../Sheet";
import { TransferPanel } from "./panel";

export function TransferSheet({ open, onClose, anchor, site }: { open: boolean; onClose: () => void; anchor?: HTMLElement | null; site?: { version: string; data: string } }) {
  const id = useId();
  return (
    <Sheet open={open} onClose={onClose} anchor={anchor} pc="center" height={100} labelledBy={id}>
      {open && <TransferPanel site={site} headingId={id} />}
    </Sheet>
  );
}

export { TransferPanel } from "./panel";
export { ImportedTag } from "./imported-tag";
