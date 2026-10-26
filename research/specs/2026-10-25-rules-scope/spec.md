# Build spec: who a rule applies to, and where it may appear (D30), 2026-10-25

The founder approved the layout on 2026-10-25 with one condition: "just as long as we make sure we define/characterize it correctly and accurately." Section 1 is that definition; section 2 how it is checked; sections 3 and 4 what gets built. Inputs: the sweep (`research/discovery/2026-10-25-institution-rules-sweep.md`), the scope research (`research/knowledge/2026-10-25-scope/`), and the editor's `applied.md` in the same folder.

## 1. The definition

Every rule record has exactly one **scope**, decided by what its sources say, never by where the record happens to be used.

| Scope | It is this when | Cited from | Examples |
|---|---|---|---|
| `general` | A law, a regulation, a regulator's circular, standard bylaw or published guidance, or an exchange rule says it, and it binds every institution of that kind. | That general source, first; a company document only as a named example, never as the source. | Payout within 4 business days (Income Tax Rules 1964, r.41יא); the provident fund's fee cap of 1.05% (fee regulations, r.2); track switching is not a tax event. |
| `institution` | It is found only in one institution's documents and no general source requires it: its forms and channels, its own figure inside a legal range, its own deadline shorter than the legal one, its track menu, its tariff. | That institution's document, with the institution named. | Altshuler Shaham's withdrawal form and bank-transfer-only channel; Harel's and Altshuler's 0.23% child-savings fee after 21; Mor's track menu. |
| `unsettled` | It reads like a general rule, but only institution documents (or the press) support it, and a recorded search found no general source. | The institution document, named, with what was searched and what would settle it. | Until research settles them: the tax base of a kupat gemel lehashkaa lump sum (pending `tax-bases.md`), CAT-23. |

Two more kinds of statement are not rule records:
- **A count over the collected institutions** ("4 of 8 banks pay no interest on a current account"): computed from `data/` with the count written out, through `Num`, with the method formula. It may appear in product contexts.
- **An example of a general rule** (a company document showing how it applies the general rule): the record is `general`, cites the general source, and may carry the company detail as a named example ("לדוגמה, אצל פניקס: …").

Edge cases, decided:
- **A legal maximum with each company's own figure:** two records, the maximum `general`, the figure `institution` (the child-savings fee).
- **A company's wording that contradicts a general rule** (Meitav's IRA manager clause against reg. 3(ג)): the general rule is shown; the company's clause, if kept, is `institution` and says that it departs from the rule.
- **A mixed record** is split: the general part keeps the id, the company part gets a new id (the editor's step).
- **A third-party copy of a regulator's text** (prisha.co.il hosting a CMA standard bylaw) is a general source with the host named ("primary, third-party host"); the scope is `general`.
- **A count over only some institutions** ("in the three bylaws we read") is not a count over every collected institution: it is `unsettled` or several `institution` records, never a general statement.
- **A record that rests only on the press, a forum or a regulator's announcement about a company** (2026-10-26, review round 3): a company's section lists only records that cite that company's own document (its site in the registry's `own_hosts`, or its Maya filing), and the validator fails a record that is not general, is not a not-rule, and cites no own document of a company it names. So an `unsettled` or `institution` record whose only sources are press reports, forum posts or a regulator's announcement can exist only as a not-rule (`notRules`, listed on /companies under "לא נכלל ככלל"). To keep it as a rule, find the company's own document, or a general source that makes it `general`.

## 2. How the classification is checked

1. The editor writes `- Scope:` for every touched record (`general`, `institution: <names>`, `unsettled: <what would settle it>`).
2. **An independent reviewer** (not the editor, not told the editor's reasoning) reads every rule record with its sources and the definition above, and writes its own scope for each. Every disagreement is listed with both readings; the lead settles each from the sources, and the founder sees any that turn on a judgement. No record goes to `general` on the reviewer's word alone: the general source must be quoted.
3. The validator then enforces it (section 3).

## 3. Data and checks

- Rule schema (`packages/schema/src/collections/rules.ts`, `docs/data-schema.md` §3.1): required `scope` (`general` | `institution` | `unsettled`), `scope_institutions` (ids and Hebrew names; required for `institution`, the documents seen for `unsettled`), `scope_settle` (required for `unsettled`). Extracted from the `- Scope:` lines like the sources (`packages/pipeline/scripts/extract-sources.ts` or a sibling).
- An institution registry `data/sources/institutions.json` (id, Hebrew name, CMA legal id, fee-snapshot id, deposit-terms bank id) so a scope resolves to `/companies/:id`.
- Validator (`packages/pipeline/src/validate.ts`):
  - every rule has a scope;
  - a `general` rule's first source is a general one (law, regulation, circular, regulator page, exchange rule, dataset), never an institution document;
  - `institution` names known institutions; `unsettled` has `scope_settle`;
  - the questions page rows (P-09) and the guide blocks hold `general` rules only;
  - a wrapper's product field never holds a value whose source is one institution's document.

## 4. Where each kind appears

| Place | `general` | `institution` and `unsettled` |
|---|---|---|
| Guide pages: cards, "שווה לדעת", tax and fee sections, prose references | yes | no. Where a property varies by company, the guide says "תלוי בחברה" and links to the companies that have it |
| "חוקים וכללים" and its product filters | yes | no. One line points to the company pages |
| The questions page | yes | no |
| Search | first group, "חוקים וכללים" | a second group, "אצל חברות מסוימות", each row naming the company |
| The rule card (the sheet that opens on a rule's chip) | "חל על כולם", the general source first, link to the product's rules | "של {company}" or "לא הוכח שחל על כולם", the document, a line that it may differ elsewhere, link "לכל מה שמצאנו אצל {company}"; the chip shows the company's name, not a code |
| Company pages (`/companies/:id`, managing companies, banks and brokers) | no new block | a new section "מה כתוב במסמכים של {company}", grouped by product, each item with its document and checked date; `unsettled` items marked "אולי כך בכל החברות; לא מצאנו לזה מקור רשמי" |
| The "לפי החברה" number tag | | names the company: "לפי מסמך של {company}" |
| Comparisons, provider rows, price lists | unchanged: a provider's own figures are already in that provider's context, named | |

## 5. Builder
One builder (Sonnet, medium) for sections 3 and 4, in a worktree the lead creates, after the editor's branch and the reviewer's settled list are merged. Screenshots of the guide, the rules page, a rule card of each kind, search, and two company pages, at 1280 and 390 px.
