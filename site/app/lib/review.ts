// What the founder holds back for review before the site is shared (D32; issues #45 to #48 say what each needs): the site
// does not link to a held page or show a held visual, but the address still works, so he can review it. A held page shows a
// note at its top (PageShell); a held "what makes it different" visual shows on its guide page with `?review` in the address.
// Pure: no React, no storage.

/** Pages no menu, door, search result or in-page link leads to. */
export const heldPages: readonly string[] = ["/idle-cash", "/holdings", "/goal"]; // "/goal" holds the comparison at /goal/compare too (founder, 2026-11-04)

/** Guide pages whose "what makes it different" visual is hidden. */
export const heldSignatures: readonly string[] = ["money-market-fund-renewable", "bank-deposit", "kupat-gemel-lehashkaa"];

/**
 * Anchors that stand inside a "what makes it different" visual, by the guide page whose visual holds them (2026-11-07, independent check 2
 * of the deposit branch: the break sentence's "(הרשימה)" and the money-market ladder linked to the bank-deposit list while it was held).
 * review.test.ts reads the rendered guide pages: it fails when a held visual renders an anchor missing here, when a guide page links to one
 * of these without `?review`, or when a file outside the guides names one.
 */
export const heldAnchors: Readonly<Record<string, string>> = { "deposit-banks": "bank-deposit" };

/** The query parameter that shows the held visuals on a guide page. */
export const reviewParam = "review";

/** True for a held page's address, with or without a query, hash or trailing slash. */
export const isHeld = (href: string): boolean => heldPages.some((p) => href === p || href.startsWith(`${p}?`) || href.startsWith(`${p}#`) || href.startsWith(`${p}/`));

/** True for a link to an anchor inside a held visual (`#deposit-banks`, `/guide/bank-deposit#deposit-banks`). */
export const isHeldAnchor = (href: string): boolean => {
  const hash = href.split("#")[1];
  const page = hash ? heldAnchors[hash] : undefined;
  return !!page && heldSignatures.includes(page);
};

/**
 * Whether a link to `href` may show: false for a held page, and for an anchor inside a held visual. `review`: the page itself shows its
 * held visuals (`?review`), so a link to an anchor on the same page (`#…`) leads somewhere and shows.
 */
export const shown = (href: string, review = false): boolean => !isHeld(href) && (!isHeldAnchor(href) || (review && href.startsWith("#")));
