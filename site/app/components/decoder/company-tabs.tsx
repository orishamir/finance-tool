// The ways into the companies and their products: by company (the list of companies), by product (every company's tracks of
// one product), and the deposits of every bank (D92). Each page shows the tabs; the menu item "חברות ומסלולים" lights on all of them.
import type { Current } from "../shell";
import { trackBrowser as t } from "../../copy";
import { PageTabs } from "../kit";

/**
 * Where the deposits page stands on the site, in one place: the menu item it lights and whether it is a tab here. Moving it elsewhere
 * is a change to these two lines (and to the tabs below).
 */
export const DEPOSITS_PLACE: { menu: Current; tab: boolean } = { menu: "decoder", tab: true };

export function CompanyTabs({ current }: { current: "company" | "product" | "deposits" }) {
  return (
    <PageTabs
      ariaLabel={t.tabs.aria}
      current={current}
      tabs={[
        { key: "company", label: t.tabs.byCompany, href: "/companies" },
        { key: "product", label: t.tabs.byProduct, href: "/tracks" },
        ...(DEPOSITS_PLACE.tab ? [{ key: "deposits", label: t.tabs.deposits, href: "/deposits" }] : []),
      ]}
    />
  );
}
