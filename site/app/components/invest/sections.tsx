// A house on the index page: its name as a link to its page, and its record by id.
import type { InvestView, ProviderInfo } from "../../lib/invest";
import { brokeragePagePath } from "../../lib/site-paths";
import { TextLink } from "../kit";

export const providerName = (view: InvestView, id: string): ProviderInfo | undefined => view.providers.find((p) => p.id === id);

/** The house's name as a link to its page; `short` writes the short name (the rows of a list), the full name otherwise. */
export function ProviderLink({ p, className, short }: { p: ProviderInfo; className?: string; short?: boolean }) {
  const name = short ? p.short : p.name;
  return p.hasPage ? (
    // on this page a house is a securities account: its name opens its company page at that account
    <TextLink to={brokeragePagePath(p.id)} className={className}>
      {name}
    </TextLink>
  ) : (
    <span className={className}>{name}</span>
  );
}
