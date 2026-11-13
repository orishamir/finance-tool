// A self-directed (IRA) fund in the regulator's files. Gemel-Net lists each one as a fund of its own (IRA-04) under the ordinary
// product's type, "תגמולים ואישית לפיצויים" or "קרנות השתלמות" (IRA-03), and only its name tells it apart: every one of them says
// "בניהול אישי" or "IRA" (the 15 of IRA-03's count in 2026-09). The site has a product of its own for each (data/instruments/wrappers/
// ira-provident.json, ira-hishtalmut.json), with its own guide, fee cap and checks. Every page that tells an IRA fund apart asks here.
// Pure: no React, no storage.

/** The name says the fund is self-directed: "בניהול אישי" or the Latin "IRA" as a word of its own. */
export const isSelfDirectedName = (name: string): boolean => /בניהול אישי|(?<![A-Za-z])IRA(?![A-Za-z])/i.test(name);

/** The site's two products for a self-directed fund, in the order a company's page shows them. */
export const SELF_DIRECTED_PRODUCTS = ["ira-provident", "ira-hishtalmut"] as const;
export type SelfDirectedProduct = (typeof SELF_DIRECTED_PRODUCTS)[number];

/** The site's product for a self-directed fund of the regulator's type, by the product the type maps to (IRA-01, IRA-03). */
const IRA_PRODUCT_OF: Readonly<Record<string, SelfDirectedProduct>> = {
  "provident-for-annuity": "ira-provident",
  "keren-hishtalmut": "ira-hishtalmut",
};

/** The site's product of a self-directed fund (`wrapperId`: the product its regulator's type maps to); null for any other fund. */
export function selfDirectedProduct(wrapperId: string | null, name: string): SelfDirectedProduct | null {
  if (!wrapperId || !isSelfDirectedName(name)) return null;
  return IRA_PRODUCT_OF[wrapperId] ?? null;
}
