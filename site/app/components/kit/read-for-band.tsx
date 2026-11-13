// The reading's first row (design-system 11, "Cases and parts"): in the cases' blue, which case the deal is read for, one pick for each
// thing its fees change by that the reading has to choose (what is bought, the channel, the track, a range that is not the action's
// size), and a line under them. A deal whose fees do not change shows none.
import type { ReactNode } from "react";
import { Split } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { MenuPicker, type MenuItem } from "./menu-picker";

export interface ReadPick {
  /** The thing, spoken ("מה קונים"). */
  name: string;
  items: MenuItem[];
  value: string;
  onSelect: (id: string) => void;
}

/** `picks`: one `MenuPicker` each, in the order the deal's band names the things; `note`, the line under them. Nothing where there are no picks. */
export function ReadForBand({ picks, note, lead = copy.read.lead }: { picks: ReadPick[]; note?: ReactNode; lead?: ReactNode }) {
  if (picks.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-when-edge bg-when-fill px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 font-medium text-when-ink">
          <Split size={16} strokeWidth={2} aria-hidden className="shrink-0" />
          {lead}
        </span>
        {picks.map((p) => (
          <MenuPicker key={p.name} name={p.name} items={p.items} value={p.value} placeholder={p.name} onSelect={p.onSelect} />
        ))}
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}
