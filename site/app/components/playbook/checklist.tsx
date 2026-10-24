// The post-switch checklist (design-system 8.5): one checkbox row per SW-38 item that applies to the wrapper, ticks kept on the
// device with the wrapper and the pair (design-spec 16.5), a quiet reset after an inline confirm.
import { useId, useState } from "react";
import { r4playbook as c } from "../../copy";
import { checklistFor, ticksStore, tickKey, type ChecklistItem } from "../../lib/playbook";
import { IconCheck } from "../icons";
import { RuleRef } from "../provenance";
import { Button, cx } from "../ui";
import { StrengthChip } from "./step";
import type { Strength } from "../../lib/playbook";

export function PostSwitchChecklist({ wrapperId, from, to, strengths }: { wrapperId: string; from: string | null; to: string | null; strengths: Record<string, Strength> }) {
  const items = checklistFor(wrapperId);
  const snap = ticksStore.use();
  const key = tickKey(wrapperId, from, to);
  const ticked = new Set(snap.value[key] ?? []);
  const [confirm, setConfirm] = useState(false);
  const uid = useId();
  if (items.length === 0) return null;
  const toggle = (item: ChecklistItem) => {
    const next = new Set(ticked);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    ticksStore.update((all) => ({ ...all, [key]: [...next] }));
  };
  const reset = () => {
    ticksStore.update((all) => {
      const n = { ...all };
      delete n[key];
      return n;
    });
    setConfirm(false);
  };
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col">
        {items.map((item) => {
          const id = `${uid}-${item.id}`;
          const on = ticked.has(item.id);
          const strength = item.ruleIds.map((r) => strengths[r]).find(Boolean) ?? "primary";
          return (
            <li key={item.id} className="border-t border-border first:border-t-0">
              <label htmlFor={id} className="flex items-start gap-3 min-h-target py-2.5 cursor-pointer">
                <input id={id} type="checkbox" checked={on} onChange={() => toggle(item)} className="peer sr-only" />
                <span className={cx("mt-0.5 size-6 shrink-0 rounded-sm border inline-flex items-center justify-center peer-focus-visible:outline-2 peer-focus-visible:outline-ring", on ? "bg-primary border-primary text-primary-foreground" : "border-input bg-card")}>
                  {on && <IconCheck size={16} />}
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <span className={cx("text-sm", on && "text-muted-foreground")}>{item.text}</span>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {item.ruleIds.map((r) => (
                      <RuleRef key={r} id={r} />
                    ))}
                    <StrengthChip strength={strength} />
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {ticked.size > 0 &&
        (confirm ? (
          <p className="flex flex-wrap items-center gap-x-3 text-sm" role="alertdialog">
            <span>{c.checklist.confirm}</span>
            <Button variant="quiet" onClick={reset}>
              {c.checklist.confirmYes}
            </Button>
            <Button variant="quiet" onClick={() => setConfirm(false)}>
              {c.checklist.confirmNo}
            </Button>
          </p>
        ) : (
          <Button variant="quiet" className="self-start text-muted-foreground" onClick={() => setConfirm(true)}>
            {c.checklist.reset}
          </Button>
        ))}
    </div>
  );
}
