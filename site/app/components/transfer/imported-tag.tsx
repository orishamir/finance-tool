// "יובא ב־{תאריך}" (design-system 7.8): a muted tag with the download icon, on holding cards, goal chips and names.
import { r3holdings } from "../../copy";
import { fmt } from "../../lib/format";
import { LeadTail } from "../provenance";
import { IconDownload } from "../holdings/icons";
import { Tag } from "../kit";

export function ImportedTag({ date, className }: { date: string; className?: string }) {
  return (
    <Tag tone="neutral" icon={<IconDownload size={14} />} className={className}>
      <LeadTail lead={r3holdings.importedTag}>
        <bdi dir="ltr">{fmt.date(date)}</bdi>
      </LeadTail>
    </Tag>
  );
}
