// Company page components (design-spec 5 as redrawn on 2026-10-23, flows 6.11): the paste card. The track list that stood here gave way
// on 2026-11-03 to the tracks page's list over the company (components/tracks/company-browser.tsx).
import { useId } from "react";
import { company as copy } from "../../copy";
import { IconSearch } from "../icons";
import { useOpenSearch } from "../shell";
import { Card, cx } from "../kit";

export function PasteCard({ className }: { className?: string }) {
  const id = useId();
  const open = useOpenSearch();
  return (
    <Card as="section" aria-labelledby={`${id}-h`} className={cx("flex flex-col gap-2.5 lg:p-5", className)}>
      <h2 id={`${id}-h`} className="text-lg font-semibold">
        {copy.paste.title}
      </h2>
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {copy.paste.label}
      </label>
      <div className="field-box text-muted-foreground">
        <IconSearch size={18} />
        <input id={id} dir="rtl" placeholder={copy.paste.placeholder} className="field-input !text-start text-mixed" onChange={(e) => e.target.value && open(e.currentTarget, e.target.value)} onFocus={(e) => e.target.value && open(e.currentTarget, e.target.value)} />
      </div>
    </Card>
  );
}
