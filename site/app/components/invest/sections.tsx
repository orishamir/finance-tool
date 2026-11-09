// The index page's top sections: the index header, and the headline card an index with no fund records still uses (the linked lists, components/invest/pair.tsx, replaced the rest on).
import { Link } from "react-router";
import { invest as c } from "../../copy";
import { brokeragePagePath, type IndexRef, type InvestView, type ProviderInfo } from "../../lib/invest";
import { cx, Tag } from "../kit";

export const providerName = (view: InvestView, id: string): ProviderInfo | undefined => view.providers.find((p) => p.id === id);

/** The house's name as a link to its page; `short` writes the short name (the rows of a list), the full name otherwise. */
export function ProviderLink({ p, className, short }: { p: ProviderInfo; className?: string; short?: boolean }) {
  const name = short ? p.short : p.name;
  return p.hasPage ? (
    // on this page a house is a securities account: its name opens its company page at that account
    <Link to={brokeragePagePath(p.id)} className={cx("text-link hover:underline", className)}>
      {name}
    </Link>
  ) : (
    <span className={className}>{name}</span>
  );
}

// ---------------------------------------------------------------- 4. the index header

/** What the index is and how it is held: the lines under its name. */
function IndexBlurb({ index }: { index: IndexRef }) {
  // an index the person added says nothing of how it is held: each fund on it says whether the index is in shekels
  if (index.custom)
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground max-w-measure">{c.custom.savedNote}</p>
      </div>
    );
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground max-w-measure">{index.oneLine ?? (index.israeli ? c.header.israeliNote : c.header.foreignNote)}</p>
      {index.oneLine && <p className="text-sm text-muted-foreground max-w-measure">{index.israeli ? c.header.israeliNote : c.header.foreignNote}</p>}
    </div>
  );
}

/**
 * The chosen index's name and lines. `others`: the indices one pill away; their lines are laid out unseen in the same place, so the
 * block is as tall as the longest at any width and a switch of index never moves the page ("make the index
 * description after choosing an index fixed size").
 */
export function IndexHeader({ view, others = [] }: { view: InvestView; others?: IndexRef[] }) {
  const { index } = view;
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl lg:text-2xl font-semibold">{index.name}</h2>
        {!index.custom && <Tag tone="neutral">{index.israeli ? c.chips.israeliTag : c.chips.foreignTag}</Tag>}
      </div>
      <div className="grid">
        <div className="[grid-area:1/1]">
          <IndexBlurb index={index} />
        </div>
        {others
          .filter((o) => o.id !== index.id)
          .map((o) => (
            <div key={o.id} aria-hidden="true" inert className="[grid-area:1/1] invisible">
              <IndexBlurb index={o} />
            </div>
          ))}
      </div>
    </header>
  );
}
