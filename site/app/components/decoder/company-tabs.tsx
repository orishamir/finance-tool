// The two ways into the companies and their tracks (2026-11-03): by company (the list of companies) or by product (every company's
// tracks of one product). Both pages show the tabs; the menu item "חברות ומסלולים" lights on both.
import { trackBrowser as t } from "../../copy";
import { PageTabs } from "../kit";

export function CompanyTabs({ current }: { current: "company" | "product" }) {
  return (
    <PageTabs
      ariaLabel={t.tabs.aria}
      current={current}
      tabs={[
        { key: "company", label: t.tabs.byCompany, href: "/companies" },
        { key: "product", label: t.tabs.byProduct, href: "/tracks" },
      ]}
    />
  );
}
