// The code of a house's terms on a company page (company-terms.tsx, the deal editor above all) as a script of its own: most company
// pages, with no securities account, never draw them. Loaded once, by whoever asks first: a company page's loader where the page has
// terms, so the pre-render draws them; the browser before it hydrates a page whose first view shows them (entry.client.tsx), so hydration
// finds the code in and keeps them in place; and the account's card when it shows them later (brokerage-card.tsx, `LoadedTerms`).

type TermsCode = typeof import("./company-terms");

let code: TermsCode | null = null;
let loading: Promise<TermsCode> | null = null;

/** The attribute that marks the house's terms on a page, which the browser looks for before it hydrates. */
export const TERMS_MARK = "data-house-terms";

/** The terms' code, once loaded. */
export const termsCode = (): TermsCode | null => code;

/** Loads the terms' code, once; a failed load is tried again at the next call. */
export function loadTermsCode(): Promise<TermsCode> {
  loading ??= import("./company-terms").then(
    (m) => (code = m),
    (e: unknown) => {
      loading = null;
      throw new Error("the house's terms' code did not load", { cause: e });
    },
  );
  return loading;
}
