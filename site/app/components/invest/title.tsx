// The index page's title row: the page's title with the index picker inside it ("איפה ואיך הכי זול להשקיע במדד [S&P 500 ⌄] לאורך זמן",
// nothing preselected, D27), one line under it about the index chosen, and the "מדד אחר" flow for a custom index.
import { useId, useMemo, useState } from "react";
import { invest as c } from "../../copy";
import { customIdOf, customIndexPath, indexPath, indexSuggestions, matchKnownIndex, type CustomIndex, type IndexRef } from "../../lib/invest";
import type { IndicesBundle } from "../../lib/providers";
import { Button, Card, MenuPicker, Tag, type MenuItem } from "../kit";

/** The index name in the picker: it follows the title's "במדד", so a leading "מדד" is dropped. */
export const pillName = (name: string): string => name.replace(new RegExp(`^${c.title.indexWord}\\s+`), "");

/** The line under the title for one index: its tag, what it is and how it is held, and that the choice is the person's. */
function IndexLine({ index }: { index: IndexRef | null }) {
  if (!index) return <p className="text-sm text-muted-foreground max-w-measure">{c.sub}</p>;
  // an index the person added says nothing of how it is held: each fund on it says whether the index is in shekels
  if (index.custom)
    return (
      <p className="text-sm text-muted-foreground">
        {c.custom.savedNote} · {c.chips.ownChoice}
      </p>
    );
  const held = index.israeli ? c.header.israeliNote : c.header.foreignNote;
  return (
    <p className="text-sm text-muted-foreground">
      <Tag tone="outline" className="me-2 align-baseline">
        {index.israeli ? c.title.tag.israeli : c.title.tag.foreign}
      </Tag>
      {index.oneLine ? `${index.oneLine} ${held}` : held} {c.chips.ownChoice}
    </p>
  );
}

/**
 * The title with the picker, and the line under it. `others`: the known indices, whose lines are laid out unseen in the same place, so
 * the line is as tall as the longest at any width and a switch of index never moves the page.
 */
export function TitleRow({ known, customs, index, others, bundle, onRemove, onRename, onSave, onGo }: {
  /** The indices the site knows, by name (from the loader: the picker works before the data arrives). */
  known: IndexRef[];
  customs: CustomIndex[];
  index: IndexRef | null;
  /** The known indices with their lines (the data's), to hold the line's height; none before the data arrives. */
  others: IndexRef[];
  bundle: Pick<IndicesBundle, "exposures"> | null;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onSave: (c: CustomIndex) => void;
  onGo: (path: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  // the picker's list is drawn after the heading, under its button: a heading holds no list of controls
  const [listHost, setListHost] = useState<HTMLDivElement | null>(null);
  const items: MenuItem[] = [
    ...known.map((i) => ({ id: i.id, label: pillName(i.name), href: indexPath(i.id) })),
    ...customs.map((i) => ({ id: i.id, label: pillName(i.name), href: customIndexPath(i.id), editable: true })),
  ];
  return (
    <header className="flex flex-col gap-3">
      <div className="relative">
        <h1 className="text-2xl lg:text-3xl font-semibold leading-[1.5]">
          {c.title.lead}{" "}
          <MenuPicker
            name={c.title.picker}
            placeholder={c.title.choose}
            items={items}
            value={index?.id ?? null}
            words={{ confirm: c.chips.confirm, confirmYes: c.chips.confirmYes, confirmNo: c.chips.confirmNo, rename: c.chips.rename, remove: c.chips.remove, renameField: c.chips.renameField }}
            onRename={onRename}
            onDelete={onRemove}
            onFollow={onGo}
            add={bundle ? { label: c.custom.heading, onClick: () => setAdding(true) } : undefined}
            listHost={listHost}
          />{" "}
          {c.title.tail}
        </h1>
        <div ref={setListHost} className="absolute inset-x-0 top-0" />
      </div>
      <div className="grid">
        <div className="[grid-area:1/1]">
          <IndexLine index={index} />
        </div>
        {others
          .filter((o) => o.id !== index?.id)
          .map((o) => (
            <div key={o.id} aria-hidden="true" inert className="[grid-area:1/1] invisible">
              <IndexLine index={o} />
            </div>
          ))}
      </div>
      {adding && bundle && <CustomPanel bundle={bundle} customs={customs} onCancel={() => setAdding(false)} onSave={(x) => { setAdding(false); onSave(x); onGo(customIndexPath(x.id)); }} onKnown={(k) => { setAdding(false); onGo(indexPath(k)); }} />}
    </header>
  );
}

function CustomPanel({ bundle, customs, onCancel, onSave, onKnown }: { bundle: Pick<IndicesBundle, "exposures">; customs: CustomIndex[]; onCancel: () => void; onSave: (c: CustomIndex) => void; onKnown: (id: string) => void }) {
  const id = useId();
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const names = useMemo(() => [...new Set(indexSuggestions(bundle).map((x) => pillName(x.name)))], [bundle]);
  const go = () => {
    const typed = name.trim();
    if (!typed) return;
    const known = matchKnownIndex(bundle, typed) ?? matchKnownIndex(bundle, `${c.title.indexWord} ${typed}`);
    if (known) {
      onKnown(known.id);
      return;
    }
    if (customs.some((x) => x.id === customIdOf(typed))) return setNote(c.custom.nameTaken);
    // only the name: whether the index is in shekels is asked of each fund added on it
    onSave({ id: customIdOf(typed), name: typed, added: new Date().toISOString().slice(0, 10) });
  };
  return (
    <Card pad="tight" className="flex flex-col gap-3 max-w-measure" role="group" aria-label={c.custom.heading}>
      <label htmlFor={`${id}-n`} className="text-sm font-medium">
        {c.custom.field}
      </label>
      <div className="flex flex-wrap gap-2">
        <input id={`${id}-n`} list={`${id}-l`} value={name} autoFocus onChange={(e) => { setName(e.target.value); setNote(null); }} onKeyDown={(e) => e.key === "Enter" && go()} placeholder={c.custom.placeholder} className="h-field flex-1 min-w-48 rounded-md bg-card border border-input px-3" />
        <datalist id={`${id}-l`}>
          {names.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <Button variant="primary" onClick={go} disabled={!name.trim()}>
          {c.custom.go}
        </Button>
        <Button variant="quiet" onClick={onCancel}>
          {c.custom.cancel}
        </Button>
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </Card>
  );
}
