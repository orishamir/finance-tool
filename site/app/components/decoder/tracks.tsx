// Company page components (design-spec 5, flows 6.11): the paste card. A company's tracks are the tracks page's
// list over the company (components/tracks/company-browser.tsx).
import { useId } from "react";
import { company as copy } from "../../copy";
import { useOpenSearch } from "../shell";
import { Card, SearchField, cx } from "../kit";

export function PasteCard({ className }: { className?: string }) {
  const id = useId();
  const open = useOpenSearch();
  return (
    <Card as="section" aria-labelledby={`${id}-h`} className={cx("flex flex-col gap-2.5 lg:p-5", className)}>
      <h2 id={`${id}-h`} className="text-lg font-semibold">
        {copy.paste.title}
      </h2>
      <SearchField label={copy.paste.label} placeholder={copy.paste.placeholder} onChange={(v, input) => v && open(input, v)} onFocus={(e) => e.target.value && open(e.currentTarget, e.target.value)} />
    </Card>
  );
}
