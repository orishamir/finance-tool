// A value of the person's own typed into a list of a thing to change by (method §10.6, F-114), the one form for it wherever a list takes
// one: the question of a thing being added (ask-thing.tsx) and a slot's menu in the open case (open-case.tsx). For what is bought or held,
// the value also says where it is bought and its currency, which the reading takes it by.
import { feeDeal as copy } from "../../copy";
import { BOUND_CURRENCIES, NAME_MAX, type BoundCurrency, type OwnPlace } from "../../lib/fee-deal/model";
import { Button, InlineSelect, TextField } from "../kit";

/** A value of the person's own being typed: its name, and for what is bought or held, where it is bought and its currency. */
export interface OwnTyped {
  name: string;
  place: OwnPlace["place"];
  currency: BoundCurrency;
}

/** A value of the person's own as its form opens: no name yet, bought abroad, in dollars. */
export const NEW_OWN: OwnTyped = { name: "", place: "abroad", currency: "USD" };

/**
 * The form: the name (`nameLabel`) with the button that adds it (`add`, its words; it waits for a name), and where `place` is set, where it
 * is bought and its currency. `value` is the value being typed, which the caller holds (`onChange`).
 */
export function OwnValueForm({ value, nameLabel, place, add, onChange, onAdd }: { value: OwnTyped; nameLabel: string; place: boolean; add: string; onChange: (v: OwnTyped) => void; onAdd: () => void }) {
  const s = copy.cases.slot;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <TextField label={nameLabel} value={value.name} maxLength={NAME_MAX} onChange={(name) => onChange({ ...value, name })} />
        <Button variant="outline" disabled={!value.name.trim()} onClick={onAdd}>
          {add}
        </Button>
      </div>
      {place && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <InlineSelect label={s.ownPlace} options={(["israel", "abroad"] as const).map((x) => ({ id: x, name: s[x] }))} value={value.place} onChange={(v) => v && onChange({ ...value, place: v as OwnPlace["place"] })} />
          <InlineSelect label={s.ownCurrency} options={BOUND_CURRENCIES.map((x) => ({ id: x, name: copy.panel.currencies[x]! }))} value={value.currency} onChange={(v) => v && onChange({ ...value, currency: v as BoundCurrency })} />
        </div>
      )}
    </div>
  );
}
