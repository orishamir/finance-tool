// The goals board above the goal form (design-system "Goals list", D12): the goals as pills in their order, right to
// left. The pill list is the kit's ChipList (2026-10-25): a pill is dragged sideways to change the order; the current goal's
// pill renames and deletes in place (2026-10-24, the founder: the up and down arrows moved chips sideways, and there was no rename or delete).
import { r2 } from "../../copy";
import { isBlank, useGoals } from "../../lib/goal";
import { ChipList } from "../kit";
import { goalTitle } from "./goal-form";

export function GoalsList() {
  const { goals, current, select, add, remove, moveTo, rename } = useGoals();
  // Shown from the first goal on, blank or not: until 2026-10-25 it appeared once the first goal held something, so typing
  // a name or choosing a preset pushed the whole form down under the pointer.
  if (goals.length === 0) return null;
  const many = goals.length > 1;
  const fresh = !many && isBlank(goals[0]!);
  const byId = new Map(goals.map((g) => [g.id, g]));
  return (
    <ChipList
      heading={r2.form.goalsHeading}
      headingId="goals-h"
      items={goals.map((g) => ({ id: g.id, label: goalTitle(g), editable: true, movable: true }))}
      value={current?.id ?? null}
      words={{ confirm: r2.strip.confirm, confirmYes: r2.strip.confirmYes, confirmNo: r2.strip.confirmNo, rename: r2.form.renameGoal, remove: r2.form.deleteGoal, renameField: r2.form.renameField }}
      onSelect={select}
      onRename={(id, name) => rename(id, name)}
      onDelete={remove}
      canRemove={() => !fresh}
      onMove={moveTo}
      renameInitial={(id) => byId.get(id)?.name ?? ""}
      renamePlaceholder={(id) => goalTitle({ ...byId.get(id)!, name: "" })}
      add={{ label: r2.form.addGoal, onClick: add }}
      footer={many ? <p className="text-sm text-muted-foreground max-w-measure">{r2.form.goalsLine}</p> : undefined}
    />
  );
}
