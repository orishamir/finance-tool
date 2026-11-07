// "יובא ב־{תאריך}" (design-system 7.8): a muted tag with the download icon, on holding cards, goal chips and names.
import { r3holdings } from "../../copy";
import { IconDownload } from "../holdings/icons";
import { Tag, When } from "../kit";

export function ImportedTag({ date, className }: { date: string; className?: string }) {
  return (
    <Tag tone="neutral" icon={<IconDownload size={14} />} className={className}>
      <When iso={date} lead={r3holdings.importedTag} />
    </Tag>
  );
}
