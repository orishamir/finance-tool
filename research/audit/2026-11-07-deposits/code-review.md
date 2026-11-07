# Code review: guides-deposits (2026-11-07)

Lens: the code (correctness, the shared pieces, the structure rules). Diff `git diff main...guides-deposits` at `bd519430`: 268 files, 57 of them
code or docs. The page, the numbers and the Hebrew belong to the other checker.

What I ran: `npx vitest run` on the engine, pipeline, review, product-row, named-bank, guide-signature, kit guards and kit ratchets test files
(7 of 8 files pass, 173 of 174 tests); `npx tsc --noEmit` on site, engine, schema and pipeline (all clean); `merge-review.mjs main`; a script
over `data/` that lists every value whose value is null and whose source strength is `open`; `buildInstitution("discount")` through tsx; and a
copy of the review guard's logic run on `content/guide/bank-deposit.tsx` with its gate taken out.

## Must fix

1. **`npm run check` fails: the open-question count is stale.** `packages/pipeline/test/validate.test.ts:453` expects 555 items. The last
   commit (`bd519430`) added TXI OQ19 to `tax-interest-deposits-bonds.md` and `data/open-questions.json`, so there are now 556. The test
   fails with "expected 556 to be 555". Fix: 556, with a "plus TXI OQ19" line beside the other comments.

2. **The closed-system label's rule never reaches Discount's page.** `lib/deposit-kind.ts:31` keeps a kind's rule only when the page's `known`
   set holds it. But `lib/institutions.server.ts:303-307` builds `cited` only from the records' `rule_ids`, and neither 0513 nor 0523 cites
   BANK-21 there (BANK-21 appears only in their English notes). `buildInstitution("discount").rules` has no BANK-21 (checked: `false`). So on
   `/companies/discount` the "בלי חשבון בבנק" sheet shows no rule, although `docs/design-system.md` section 11 says the sheet gives "the rule
   where the site holds one", and the site does hold `data/rules/bank-21.json`. Two things hide this:
   - the gallery state (`kit/gallery.tsx:1324`) passes `new Set(["BANK-21"])` by hand;
   - `product-row.test.ts:21` renders every row with `known: new Set()`.

   Fix: export each kind's rule ids from `deposit-kind.ts` and add them to `cited` for each record's `variant`. Have the test render with
   `new Set(Object.keys(buildInstitution(id).rules))` and assert that 0513's sheet has BANK-21.

   Data-side note for the other checker: BPN-09, which the best-of kind and WIN WIN's `tax_bucket.rule_ids` both cite, has no rule record
   (`data/rules/` holds only `bpn-10.json`). It is dropped without a word wherever it is cited.

## Should fix

3. **The guard "every link to a held anchor is gated by shown()" works line by line and misses the very link it was written for.** At
   `lib/review.test.ts:61-72`, a line is checked only when its `href=` or `to=` and the anchor (a literal `#x` or `#${copy.…}`) are on that
   same line. The break line's link builds its href in a variable on one line (`content/guide/bank-deposit.tsx:180`,
   `const listHref = …`) and uses it on another (`:188`, `href={listHref}`). With `shown(listHref, review)` replaced by `true`, the guard's
   logic still finds nothing ungated (simulated). There is a second gap: any `shown(` in the 8 lines above counts, even one about another
   address, such as `shown("/idle-cash")`. So the guard catches only an inline literal link with no `shown` nearby.

   Fix: make it a render-level guard. Render every guide page and every route that links into guides, without review, and assert that no
   `href` ends in `#<held anchor>`. `named-bank.test.ts:40` already does this for one page.

4. **The guard "every anchor a held visual renders is listed" finds only some anchors.** `lib/review.test.ts:53-54` scans:
   - only the visual's own file;
   - only a fixed list of HTML tags;
   - only `id={copy.x}` or `id="x"`.

   It misses `id={FOLD_ID}` (the pattern `current-account.tsx:28` uses), template ids, ids on kit components (`<Disclosure id=…>`,
   `<Card id=…>`) and anchors in subcomponents from `./kit` or `./g2-parts`. Fix: render each held visual with `renderToStaticMarkup` and
   collect `id="…"` from the HTML, leaving out `useId` ids and SVG pattern ids.

5. **BANK-33 is hard-coded for every bank whose deposits can be broken with a penalty.** At `content/guide/bank-deposit.tsx:205`,
   `VariesByCompany ids={[{ rule: "BANK-33", companies: penaltyIds }]}` puts every such bank under Discount's rule. Scenario: a Leumi or
   Mizrahi-Tefahot record changes to `with_penalty`, and that bank's link cites Discount's break terms. A bank with no `ownTerms` entry also
   gets BANK-33. Fix: carry the rule id in each `ownTerms` entry. Banks with no entry use their records' `break.rule_ids`.

6. **The sweep for PrintedText is not finished (ground rule 7).** `components/guide-signature/bank-deposit.tsx:206` (`ends.top.conditions`)
   and `:236` (`b.conditions`) still render a record's `conditions_he` as raw text. That is the class `PrintedText` was promoted for: figures
   isolated left to right. Discount's text has no figures today, so nothing shows yet. A condition with "10,000 ₪" would break the order.
   Fix: use `PrintedText` in both places, and add a guard in `kit/guards.test.ts` that fails when `.conditions` or `.doubt` is rendered
   outside `PrintedText` or `DoubtNote` in a feature folder.

7. **F-86's pick depends on file order when a bank has two plain records on the same date.** At
   `packages/engine/src/formulas/account-interest.ts:104`, `d.snapshot > prev.snapshot` keeps the first record it meets. With two plain
   one-year records of one bank on one snapshot, the range and the example depend on load order, and nothing says so. No bank has two today
   (checked). Fix: break the tie by `id`, or flag it. Add the case to the test.

8. **The exit-point inputs of F-104 carry the break column's rules and an unrelated note.** In `lib/guide.server.ts:62-65`, `exitInput`
   spreads `breakFact(r)`: the exit value keeps `rule_ids` from `break.rule_ids` (BANK-33 and others) and takes `conditions_he` as its notes.
   Scenario: Discount 0122's line on the `lockedBanksWithExits` sheet says "אין" (no exit points), cites the break rule, and has the note
   "נפתח רק בסניף או בטלבנק", which is not about exits. Fix: `rule_ids: []`, and a note only where the conditions are about exits (or no
   note).

9. **The schema does not tie a null tax bucket to an open source.** `packages/schema/src/collections/deposit-terms.ts:45` lets
   `tax_bucket.value` be null with any strength. The comment says null comes only with `open`, but nothing enforces it. A null bucket at
   `primary` would render "not found in the source" rather than the open question and its lock. Fix: a `.refine`, and a case in
   `validate.test.ts`.

10. **The deposit kinds are typed twice.** `lib/deposit-kind.ts:14` retypes the schema's `variant` enum by hand. Fix: derive it as
    `NonNullable<DepositTerms["variant"]>[number]`, so a new kind in the schema fails the typecheck at `kinds` until it has a label.

## Dead code and leftovers (ground rule 10)

- `site/app/copy.ts:2136`: nothing reads `r4catalogue.exits.months` any more. The card now goes through `exitWords`, which uses
  `fmt.months`.
- `components/guide-signature/current-account.tsx:8`: the `type ReactNode` import is unused, left behind when `Isolated` moved to the kit.
- `components/kit/label-chip.tsx:72-79`: the rules `<p>` was not re-indented inside its new conditional. Format only.
- `lib/guide.server.ts:87`: the suffix loop stacks suffixes ("x (2) (3)") rather than replacing them. It is not reached with today's data
  (all 24 sheet names are distinct, checked).

## Checked and fine

- **Engine and method.** `breakTermOf`, `oneYearDeposits`, `breakCount` and `plainOneYearDeposits` match `docs/method.md` F-86 and F-104. On
  the data: D 24, B 4, lockedBanks 3, lockedBanksWithExits 2, Discount 10 of 10 with a penalty. The plain picks are 0122, hapoalim kavua,
  leumi 365 and mizrahi 131. The tests cover the method's worked example, the "a bank with more rows does not weigh more" case, and the rows
  of other terms and other wrappers. `breakTermOf` agrees with the schema's refine (`allowed` is false exactly when the penalty is
  `not_allowed`). F-86's `noExit` now counts over the same records as `N` (only rates that are numbers), as the method says.
- **Review mode is passed everywhere it matters.** I checked every `shown()` call. Only the break line's same-page `#deposit-banks` link
  needs `review`, and it gets `useReviewMode()`. The ladder's cross-page link correctly ignores the other page's `?review`. All other calls
  are about held pages.
- **`isOpenValue` changes nothing else.** It applies only to a sourced value that is null with source strength `open`. Exactly one value in
  `data/` fits: WIN WIN's `tax_bucket`. The rule-level `open` (sw-37) and computed values are untouched. A `display` prop still wins over
  the open label, and the lock is still drawn. The sheet hides its "not found in the source" line only for an open value with English
  notes, and names the question with `IdRef` (TXI OQ19).
- **PrintedText and DoubtNote.** They moved from the current-account visual to `kit/notes.tsx`. The callers are current-account (three) and
  the bank product row. The gallery has states for both, and `docs/design-system.md` section 11 has their row. No copy of the number regex
  is left outside the kit.
- **Label chips.** There is one `LabelSheetHost` on the institution page. `BrandFundList`'s host is on the other branch of the company route,
  never on the same page. A `LabelChip` outside a host is a button that does nothing, but `BankProductRow` is rendered only inside the
  host. An empty rules line is now hidden, and `docLead` is shown in the gallery.
- **Guards and ratchets.** `kit/guards.test.ts`, `kit/ratchets.test.ts` and `unofficial-leftovers.json` are unchanged on this branch. No
  leftover was added to a list. Both test files pass.
- **Hebrew placement.** The new UI strings are in `copy.ts`. The break-line prose is in `content/guide/bank-deposit.tsx`, where guide prose
  belongs.

## Structure review

`merge-review.mjs main` listed 7 items:

| Item | Verdict | Reason |
|---|---|---|
| `product-row.tsx:148`: `״<PrintedText/>״` | kept | Hebrew quotation marks around a bank's quote: punctuation, not words. `printedLine` in `deposit-kind.ts` does the same; one `quote()` helper could serve both, but it is not worth a round. |
| `deposit-kind.ts:43`: the regex with a Hebrew character range | kept | A character class, not a string a reader sees. |
| `deposit-kind.ts:51`: gershayim in `printedLine` | kept | Punctuation, as above. |
| `content/guide/bank-deposit.tsx`: `BankBreakLine` | kept | Prose of one guide page, which lives in its content file (architecture 3.5). It builds from the kit's `Sentence`, `MixedName`, `Num`, `Term` and `VariesByCompany`. |
| `content/guide/bank-deposit.tsx`: `BreakLine` | kept | Same reason. |
| kit: `DoubtNote` | promoted, correctly | Gallery state and design-system row are present. No guard yet (should-fix 6). |
| kit: `PrintedText` | promoted, correctly | Same. |

The kit change to `LabelSheetHost` (the empty rules line hidden, `docLead`) has its gallery state.

**Verdict:** nothing to send back on structure. The branch should not land until must-fixes 1 (the failing count test) and 2 (BANK-21 missing
from the closed-system sheet) are fixed. Should-fixes 3 and 4 matter because the guard that was added after independent check 2 would not
catch a repeat of the bug it was written for.
