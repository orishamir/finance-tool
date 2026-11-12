// A house on the index page: its name as a link to its page, and its record by id.
import type { InvestView, ProviderInfo } from "../../lib/invest";
import { brokeragePagePath } from "../../lib/site-paths";
import { TextLink } from "../kit";

export const providerName = (view: InvestView, id: string): ProviderInfo | undefined => view.providers.find((p) => p.id === id);

/** The house's name as a link to its page; `short` writes the short name (the rows of a list), the full name otherwise; `muted` in the muted ink (a step of the stairs that is not the account's). */
export function ProviderLink({ p, short, muted }: { p: ProviderInfo; short?: boolean; muted?: boolean }) {
  const name = short ? p.short : p.name;
  return p.hasPage ? (
    // on this page a house is a securities account: its name opens its company page at that account
    <TextLink to={brokeragePagePath(p.id)} tone={muted ? "muted" : "link"}>
      {name}
    </TextLink>
  ) : (
    <span className={muted ? "text-muted-foreground" : undefined}>{name}</span>
  );
}
