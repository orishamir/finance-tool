# Brief: a company's figure about its own product carries no caution (D31, 2026-10-26)

## Why
The founder, on the index page's fund rows (fixed fee 0.24%, variable 0.1%, trustee 0.005%, each with the amber "לפי החברה" icon):

> in this case, we know that we are talking about a "fact" of a specific broker. so we dont need to have a "warning" there. a warning seems like we have incomplete data … harel says that harel ta-35 has 0.25% fee. so its official in that context. also the "קבועים" "משתנים" "נאמן" isnt clear that its talking about fees that much

The decision is recorded as D31 in `docs/product.md`, with matching lines in CLAUDE.md's number states and `docs/design-system.md`. Read D31 and D30 first.

## The rule
- **Own figure:** a company's figure about its own product, shown on the row, card or page that names that product or company. It is the official source for that fact. Show it as sourced (solid grey underline, no caution icon); its sheet names the document in a neutral line ("מקור: הדוח של הראל על הקרן, 30.9.2026").
- **Out of context:** a company's figure used as an example or stand-in for the market or a product type, or a company's statement about something it doesn't decide. It keeps the amber "לפי החברה", exactly as today. Examples: P-05's representative tariff in the guide's illustrative timeline; a company's rate inside a generic computation, such as CS-30 in the child-savings ledger.
- **A computed value** built only from own figures of the products its row names (for example "נשאר בפסגות" for a Harel fund at Psagot) is not weakened by them. One out-of-context input keeps the caution, and the sheet names that input.

## What to build
1. `SiteValue` (`site/app/lib/value.ts`) gets `own?: string`, the name of the company whose own product the figure describes. Only the code that builds a value for a named product's row sets it. A helper decides weakness in one place, `isWeak(v)`: true for secondary, or for institution without `own`. `Num`, the sheet, `weakInputs` and `NumberLegend` use it instead of testing `strength === "institution"`. `computed()`'s `weakest` skips inputs that are institution with `own`.
2. **The sheet** (`provenance.tsx`): for an own figure, a neutral source line naming the company and the document instead of the amber block. Out-of-context figures keep the amber block.
3. **Set `own` at every call site that shows a company's figure on its own product.** List each call site in your report with the verdict (own, or out of context, and why):
   - fund records: fees and the fund's own figures on fund rows (index page, workbench funds, holdings);
   - tariff lines on a provider's row (workbench providers, the index page broker grid, the fees page provider rows, the comparison card that names its broker);
   - a bank's own deposit and current-account terms on that bank's line (guide visuals' bank table and picker, idle cash).
   - The guide's illustrative timeline and any P-05 representative input stay out of context.
4. **`NumberLegend`** shows the "לפי החברה" item only on a page that has an out-of-context company figure.
5. **Fee labels on fund rows:** "קבועים", "משתנים", "נאמן" (`copy.ts`, around the index page's `funds` strings) become "דמי ניהול קבועים", "דמי ניהול משתנים", "שכר נאמן". Search for other short fee labels that stand alone without the word "דמי" (workbench rows, holdings) and use the full names from `copy.ts`'s fee-type names. Check that the rows still read well at 390 px.
6. **Tests:**
   - `isWeak` cases;
   - `Num` renders no caution icon for an own institution figure, and one for an out-of-context figure;
   - `computed()`'s `weakest` with own and non-own inputs;
   - a render test of a fund row with no caution icon.
7. **Not here:** rule cards and their strength labels belong to the rules-scope layout builder (research/specs/2026-10-25-rules-scope/spec.md), which shows a company's rule on its company page with a neutral scope chip. Leave `StrengthLabel` as it is.

## Check on screen (required)
Build your worktree, serve on port 4234, and photograph at 1280 and 390 px:
- `/invest/index-ta35`: fund rows with no amber icons; a fee's sheet shows the neutral source line;
- the providers workbench for the brokerage account: tariff numbers with no amber icons;
- `/guide/current-account`: the bank table's rates with no amber icons;
- a guide page's illustrative timeline: the representative tariff keeps "לפי החברה";
- `/fees`;
- the legend on each of those pages.

Look at every shot. Write `report.md` beside this brief, with the shots in `shots/`.

## Files you own
- `site/app/lib/value.ts` and its tests
- `site/app/components/provenance.tsx`
- the value-building call sites you list (lib and component files that build values for rows)
- `site/app/copy.ts` (fee labels and the new sheet line only)

Anything else goes in `requests.md` beside this brief.

## Rules
- Use the kit. The ratchets in `kit/ratchets.test.ts` and the guards must keep passing.
- Run `npx vitest run site packages/engine` and `npm run typecheck`. Don't run `npm run check`, and never `pkill`.
- Keep shell commands simple: scripts in files, then run them.
- Put screenshots and large files inside your worktree, never in /tmp.
- Commit on your branch, ending the message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; the lead reviews and merges.
