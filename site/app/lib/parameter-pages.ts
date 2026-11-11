// Which page on the site reads each site parameter (data/parameters/), by the parameter's method id. The parameters page shows
// only the parameters named here, each with links to its pages; a parameter file no live page reads stays in data/parameters/
// and leaves the page. parameter-pages.test.ts checks every entry against site/app/routes.ts and the code each route loads.

/**
 * A page that reads site parameters: where its link goes, and the route in routes.ts whose code reads them ("" is the index).
 * Its name is the key's entry in `parametersPage.pages` (copy.ts). The guides' link goes to their list; the pages that read are
 * each guide's own.
 */
export const parameterPageRoutes = {
  home: { href: "/", route: "" },
  guide: { href: "/guide", route: "guide/:id" },
  rules: { href: "/rules", route: "rules" },
  fees: { href: "/fees", route: "fees" },
  indices: { href: "/indices", route: "indices/:slug?" },
  deposits: { href: "/deposits", route: "deposits" },
} as const;

export type ParameterPage = keyof typeof parameterPageRoutes;

/** Per parameter, the pages that read it, the one that leans on it most first. */
export const parameterPages: Readonly<Record<string, readonly ParameterPage[]>> = {
  // the tie between two price lists: the indices page's pairs, and the guides that name the account that leaves the most (F-80)
  "P-01": ["indices", "guide"],
  // the fee page's "what moves the answer" panel; the indices page's range for the dollar against the shekel
  "P-02": ["fees", "indices"],
  // the fee page's verdicts
  "P-03": ["fees"],
  // the starting plan of the guides' graphs, the fee page and the indices page, and the amount the deposits page starts at
  "P-05": ["guide", "fees", "indices", "deposits"],
  // the rules page's did-you-know facts and each guide's worth-knowing block
  "P-09": ["rules", "guide"],
  // the kinds of saving the first page names
  "P-10": ["home"],
  // the deposits page's quick amounts
  "P-11": ["deposits"],
};

/** Whether the parameters page shows this parameter. */
export const isShownParameter = (methodId: string): boolean => Object.hasOwn(parameterPages, methodId);
