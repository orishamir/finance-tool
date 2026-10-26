// What the founder holds back for review before the site is shared (2026-10-26, docs/roadmap.md "Held for review"): the site
// does not link to a held page or show a held visual, but the address still works, so he can review it. A held page shows a
// note at its top (PageShell); a held "what makes it different" visual shows on its guide page with `?review` in the address.
// Pure: no React, no storage.

/** Pages no menu, door, search result or in-page link leads to. */
export const heldPages: readonly string[] = ["/idle-cash", "/holdings"];

/** Guide pages whose "what makes it different" visual is hidden. */
export const heldSignatures: readonly string[] = ["money-market-fund-renewable", "bank-deposit", "kupat-gemel-lehashkaa"];

/** The query parameter that shows the held visuals on a guide page. */
export const reviewParam = "review";

/** True for a held page's address, with or without a query, hash or trailing slash. */
export const isHeld = (href: string): boolean => heldPages.some((p) => href === p || href.startsWith(`${p}?`) || href.startsWith(`${p}#`) || href.startsWith(`${p}/`));

/** Whether a link to `href` may show: false for a held page. */
export const shown = (href: string): boolean => !isHeld(href);
