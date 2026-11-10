// The company page's parts (components/company/): which of the company's document entries belong to which of its products, and which part of
// the page an address's `#id` lands in. Pure.

export interface DocGroup {
  key: string;
  title: string;
  ids: string[];
  /** The products a product record names an entry under, by entry (`CompanyTermGroup.about`). */
  about?: Record<string, readonly string[]>;
}

/**
 * The products a group of document entries is about, by the rule base's file the group stands for. A group about several products (a bank's
 * "עובר ושב ופיקדונות") is shown under each of them that the page has; a group about none of the page's products (switching between
 * companies, tax) stays in the overview's "עוד במסמכים".
 */
const DOC_PRODUCTS: Record<string, readonly string[]> = {
  "bank-current-account-deposits.md": ["bank-deposit", "savings-plan", "current-account"],
  "brokerage-account.md": ["brokerage"],
  "kupat-gemel-lehashkaa.md": ["kupat-gemel-lehashkaa"],
  "keren-hishtalmut.md": ["keren-hishtalmut"],
  "pension-and-gemel-lekitzba.md": ["pension-comprehensive", "pension-general", "provident-for-annuity"],
  "child-savings.md": ["child-savings-provident"],
  "etfs-and-index-funds.md": ["funds-etf", "funds-tracking"],
  "mutual-funds-and-money-market-funds.md": ["funds-money-market", "funds-other"],
};

/**
 * The groups by product (only the page's products), and those that belong to none of them. An entry a product record names stands only
 * under the products whose records name it (BANK-38, the savings plans'); an entry no record names stands under each of its group's.
 */
export function splitDocGroups(groups: readonly DocGroup[], products: readonly string[]): { byProduct: Record<string, DocGroup[]>; rest: DocGroup[] } {
  const have = new Set(products);
  const byProduct: Record<string, DocGroup[]> = {};
  const rest: DocGroup[] = [];
  for (const g of groups) {
    const to = (DOC_PRODUCTS[g.key] ?? []).filter((p) => have.has(p));
    if (to.length === 0) rest.push(g);
    for (const p of to) {
      const ids = g.ids.filter((id) => {
        const named = (g.about?.[id] ?? []).filter((x) => to.includes(x));
        return named.length === 0 || named.includes(p);
      });
      if (ids.length) (byProduct[p] ??= []).push({ ...g, ids });
    }
  }
  return { byProduct, rest };
}

/** The ids of the entries in some groups (each is an element id on the page, a link's `#id`). */
export const entryIds = (groups: readonly DocGroup[] | undefined): string[] => (groups ?? []).flatMap((g) => g.ids);

/**
 * The part of the page that holds an element an address names: the first part listing it, else null (the id is in every part, or none).
 * `parts` maps a part's id ("" for the overview) to the ids it holds.
 */
export function partOf(hash: string, parts: readonly { id: string; anchors: readonly string[] }[]): string | null {
  if (!hash) return null;
  return parts.find((p) => p.anchors.includes(hash))?.id ?? null;
}

/**
 * A product's id in a company page's address (`?product=`). The regulator's two types the site has no product page for are named by their
 * Hebrew type; their address is a Latin word, as every other product's is. The Hebrew one still opens the product (`fromAddress`).
 */
const ADDRESS: Record<string, string> = { "מרכזית לפיצויים": "central-severance", "מטרה אחרת": "other-purpose" };
export const addressId = (id: string): string => ADDRESS[id] ?? id;
/** An address's product as the page names it now: an old Hebrew address becomes its Latin word. */
export const currentAddress = (asked: string): string => ADDRESS[asked] ?? asked;
