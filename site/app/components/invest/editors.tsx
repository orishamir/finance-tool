// What the index page's fund panel shares (D44): the panel's state and the world its preview prices in, reached by the button and the rows
// under it through a context. Kept apart from the panel so the rows can read it without importing it.
import { createContext, useContext, useRef, useState } from "react";
import { invest as root } from "../../copy";
import { Button } from "../kit";
import type { CustomFund } from "../../lib/custom-entries";
import type { CustomIndex, IndexRef, InvestView } from "../../lib/invest";
import type { IndicesBundle, WorkbenchInputs } from "../../lib/providers";

export type Editing = { kind: "fund"; id: string | null };

/** What a fund's preview prices on: the page's own data, plan and view. */
export interface PanelWorld {
  /** The bundle without the person's entries, and the one with them. */
  wb: IndicesBundle;
  bundle: IndicesBundle;
  index: IndexRef;
  /** The plan the page's lists are priced on (settled). */
  plan: WorkbenchInputs;
  view: InvestView;
  customs: readonly CustomIndex[];
}

export interface Editors {
  addFund: () => void;
  edit: (e: Editing) => void;
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


