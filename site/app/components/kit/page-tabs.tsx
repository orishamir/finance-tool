// The tabs at the top of a page that is one of a few views of the same subject (with the track browser: "לפי חברה" and "לפי
// מוצר" over the companies and the tracks). Each tab is a page of its own, so each is a link; the one you are on is marked. It was the
// workbench's tabs, a segmented control; the look is now the underline the site's menu has. The weight is the same on every tab, so
// choosing another moves nothing.
import { Link } from "react-router";
import { cx } from "./cx";

export interface PageTab {
  key: string;
  label: string;
  href: string;
}

export function PageTabs({ tabs, current, ariaLabel, className }: { tabs: PageTab[]; current: string; ariaLabel: string; className?: string }) {
  return (
    <nav aria-label={ariaLabel} className={cx("flex gap-6 border-b border-border", className)}>
      {tabs.map((t) => (
        <Link
          key={t.key}
          to={t.href}
          aria-current={t.key === current ? "page" : undefined}
          className={cx("min-h-target inline-flex items-center border-b-2 -mb-px font-medium whitespace-nowrap", t.key === current ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
