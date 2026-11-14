// A fee copied from another house's price list (method §10.6: the site's price lists only fill a deal's fields): "מתעריפון אחר" at the
// palette's end opens the houses, a house its fees, and a fee comes into the deal as that list prints it, with its sources. Where the deal
// has that kind of fee already, it asks first: replace it (kept for the undo), or add the new one beside it, the two read as two fees.
import { useState } from "react";
import { dealCases as words } from "../../copy";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import { Button, ChoiceChips } from "../kit";
import { feeName } from "./words";

export interface HouseToCopy {
  id: string;
  name: string;
  kinds: FeeKindId[];
}

/**
 * The houses (`houses`), whether the deal has a fee of a kind (`has`), why a second fee of a kind cannot stand beside the first (`alone`:
 * the law caps the kind, F-113, and the method does not say how two such fees meet one cap; null where one can), and the copy (`onCopy`:
 * the house, the kind, beside or in place).
 */
export function CopyFee({ houses, has, alone, onCopy }: { houses: readonly HouseToCopy[]; has: (kind: FeeKindId) => boolean; alone: (kind: FeeKindId) => string | null; onCopy: (house: string, kind: FeeKindId, how: "beside" | "replace") => void }) {
  const w = words.copyFee;
  const [open, setOpen] = useState(false);
  const [house, setHouse] = useState<string | null>(null);
  const [kind, setKind] = useState<FeeKindId | null>(null);
  if (houses.length === 0) return null;
  const close = () => {
    setOpen(false);
    setHouse(null);
    setKind(null);
  };
  const copy = (k: FeeKindId, how: "beside" | "replace") => {
    onCopy(house!, k, how);
    close();
  };
  const h = houses.find((x) => x.id === house);
  return (
    <div data-copy-fee="" className="flex flex-col gap-2">
      <Button variant="quiet" aria-expanded={open} onClick={() => (open ? close() : setOpen(true))} className="self-start">
        {w.open}
      </Button>
      {open && (
        <div className="flex flex-col gap-2">
          <ChoiceChips wrap ariaLabel={w.houses} ids={houses.map((x) => x.id)} labels={Object.fromEntries(houses.map((x) => [x.id, x.name]))} value={house} onChange={(id) => (setHouse(id), setKind(null))} />
          {h && (
            <ChoiceChips
              wrap
              ariaLabel={w.fees}
              ids={h.kinds}
              labels={Object.fromEntries(h.kinds.map((k) => [k, feeName(k)]))}
              value={kind}
              onChange={(k) => {
                if (has(k)) setKind(k);
                else copy(k, "beside");
              }}
            />
          )}
          {h && kind && (
            <div role="group" aria-label={w.have.replace("{fee}", feeName(kind))} className="flex flex-col gap-2 text-sm">
              <p>{alone(kind) ? `${w.haveAlone.replace("{fee}", feeName(kind))} ${alone(kind)}` : w.have.replace("{fee}", feeName(kind))}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => copy(kind, "replace")}>
                  {w.replace}
                </Button>
                {!alone(kind) && (
                  <Button variant="outline" onClick={() => copy(kind, "beside")}>
                    {w.beside}
                  </Button>
                )}
                <Button variant="quiet" onClick={close}>
                  {w.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
