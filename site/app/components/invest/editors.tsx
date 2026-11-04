// What the index page's entry panels share (D44, 2026-11-04): the one panel's state and the world it prices in, reached by the buttons and the rows
// under it through a context. Kept apart from the panels so the rows can read it without importing them.
import { createContext, useContext, useRef, useState } from "react";
import { invest as root } from "../../copy";
import { Button } from "../kit";
import type { CustomBroker, CustomFund } from "../../lib/custom-entries";
import type { CustomIndex, IndexRef, InvestView } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";

export type Editing = { kind: "broker"; id: string | null } | { kind: "fund"; id: string | null } | { kind: "own"; houseId: string; from: string };

/** What the account panel prices on: the page's own data, plan and view. */
export interface PanelWorld {
  /** The bundle without the person's entries, and the one with them. */
  wb: WorkbenchBundle;
  bundle: WorkbenchBundle;
  index: IndexRef;
  /** The plan the page's lists are priced on (settled). */
  plan: WorkbenchInputs;
  view: InvestView;
  customs: readonly CustomIndex[];
}

export interface Editors {
  addBroker: () => void;
  addFund: () => void;
  /** The account panel, started from a house's price list or one of its groups (`list`, `group:<n>`). */
  openOwn: (houseId: string, from?: string) => void;
  edit: (e: Editing) => void;
  brokers: readonly CustomBroker[];
  funds: readonly CustomFund[];
  world: PanelWorld | null;
}

export const EditorsContext = createContext<Editors | null>(null);
export const useEditors = () => useContext(EditorsContext);

/** The draft and a ref of it: a number still waiting out the typing pause is committed by the save, and read at once. */
export function useDraft<T>(start: () => T) {
  const [draft, setDraft] = useState<T>(start);
  const now = useRef(draft);
  const set = <K extends keyof T>(k: K, v: T[K]) => {
    now.current = { ...now.current, [k]: v };
    setDraft(now.current);
  };
  /** Several fields at once, in one change. */
  const setMany = (patch: Partial<T>) => {
    now.current = { ...now.current, ...patch };
    setDraft(now.current);
  };
  return { draft, now, set, setMany };
}

export const isInvalid = (form: HTMLElement | null) => !!form?.querySelector('[aria-invalid="true"]');

const c = root.customEntries;
/** A typed amount cannot be negative. */
export const nisCheck = (n: number) => (n < 0 ? c.errors.negative : null);

export function Actions({ entry, name, writable, onSave, onCancel, onRemove, saveLabel }: { entry: boolean; name: string; writable: boolean; onSave: () => void; onCancel: () => void; onRemove: () => void; saveLabel?: string; }) {
  const [asking, setAsking] = useState(false);
  return (
    <div className="flex flex-col gap-2 pt-1">
      {!writable && <p className="text-xs text-caution-foreground">{c.noStorage}</p>}
      {asking ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm w-full">{c.removeAsk(name)}</p>
          <Button variant="destructive" onClick={onRemove}>
            {c.removeYes}
          </Button>
          <Button variant="quiet" onClick={() => setAsking(false)}>
            {c.cancel}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={onSave}>
            {saveLabel ?? c.save}
          </Button>
          <Button variant="quiet" onClick={onCancel}>
            {c.cancel}
          </Button>
          {entry && (
            <Button variant="destructive" className="ms-auto" onClick={() => setAsking(true)}>
              {c.remove}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


/** The quiet "edit" button of an entry's row. */
export function EditButton({ editing }: { editing: Editing }) {
  const e = useEditors();
  if (!e) return null;
  return (
    <Button variant="quiet" className="text-sm" onClick={() => e.edit(editing)}>
      {c.edit}
    </Button>
  );
}


