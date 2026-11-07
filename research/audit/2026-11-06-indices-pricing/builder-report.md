Indices page pricing decisions D64 to D67: builder's report (2026-11-06)

All four decisions are built and committed on branch `indices-pricing` in worktree `/home/ori/dev/finance-tool/.claude/worktrees/pricing`. Nothing was merged into main or pushed, and no issue was edited. Size: large.

Before release this still needs the finance-reviewer, an independent checker and the Hebrew editor (section 8, items 1 and 2). It also needs the founder's answer on where the D65 and D66 notes stand (item 3).

The report was not saved to `research/audit/2026-11-06-indices-pricing/report.md`, because the file-writing tool refuses report files from a subagent. This text is the report. The evidence files it cites are committed in that folder.

Commits after the merge, in order:

| Commit | What |
|---|---|
| `bcd0b136` | Merge of round 4 (indices-pc-fixes): STEP 0 |
| `4776d4f6` | D64 and D67 in the schema, the validator, the engine (F-102, F-103) and the ten bank records. No figure on the site changes. |
| `b86160ac` | D64 on the indices page. **Ranking change.** |
| `c650fa4f` | D67 in One Zero's record. **Ranking change by rule.** No figure moves today. |
| `00421e3f` | D65 and D66 notes on the account card |
| `5ca31831` | The notes fold under one line, so the list stays near its heading on a phone |
| `fffc8d98` | Wording fixed after fresh readers, plus the evidence files |

`npm run check` passed after `00421e3f`: typecheck, 109 test files, data valid, site build. After the last commit, typecheck, `vitest` (109 files, 1657 passed, 1 todo) and `npm run validate` ("data/ is valid") passed again, and the site build passed on the final code.

## 0. Merge resolution, file by file (`bcd0b136`)

| File | Resolution |
|---|---|
| `CLAUDE.md`, `research/user-lab/metric.md`, `research/user-lab/versions/README.md` | Main's text taken. Main already holds what the branch added: the D62 exception, the "does not do X" rule, and the v1 default and noise lines. |
| `docs/product.md` | Main's text, plus the branch's D44 amendment rewritten in main's clean style: a field left empty is a price not known. The account, or a typed fund with a fee left empty, is listed without a price and never ranked until it is filled, and the row says what is missing. A conversion left empty leaves only the funds bought abroad without a price at that account (D56). |
| `docs/method.md` (F-63) | "a fee left empty is zero" is replaced by: a field left empty is not known, so the account has no price (the conversion alone leaves only `foreign_securities` without one) and no list lines; a typed fund with a fee left empty has no price, reason `fee-unknown`. |
| `docs/design-system.md` | The 2.5a intro is main's. The 2.5a table is main's rows plus the branch's `HoldTallest` row and the row for a list whose rows change with a pick in another list (`PickList` `states`/`cases`, `canShow`), with no dates or issue numbers. The stale `useHeldHeight` "Where" is corrected. The kit catalog row is renamed to `LongestCase`, `useUnseen`, `useHeldHeight`, `HoldTallest`. The `PickList` row gains the branch's hold, states/cases, phone fold and `canShow`. `MixedName` and `AlsoChanged` rows are added. |
| `research/audit/tools/box-check.mjs` | Main's `--whole` and on-screen measure, plus the branch's `--plans`, `--switch`, PLANS and `cuts()`. Each control and each index chip is brought on screen (`onScreen`) before it is changed. |

## 1. What changed, decision by decision

### D64: a bank's current account (issue #182)

- **Data.** Ten bank records (`data/fees/<bank>@2026-11-04.json`) gain `current_account.monthly_minimum` in `nis_per_month`, strength institution, each with its price list page and quote:

  | Bank | ₪ a month | Source date |
  |---|---|---|
  | Hapoalim | 5.30 | 2026-10-05 |
  | Leumi | 5.50 | 2026-10-01 |
  | Discount | 5.90 | 2026-10-01 |
  | First International | 6.30 | 2026-09-06 |
  | Massad | 6.30 | 2026-09-06 |
  | Mercantile | 6.40 | — |
  | Mizrahi-Tefahot | 6.80 | 2026-10-01 |
  | Jerusalem | 9.50, flat | 2026-09-16 |
  | Yahav | 4 | 2026-10-01 |
  | One Zero | 0 | — |

  Checked 2026-11-06, except One Zero, checked 2026-11-04. PEPPER is `part_of` Leumi and has none.
- **Validator.** A bank's own record without `part_of` must carry a current account. No other record may carry one.
- **Method and engine.**
  - New formula F-102 (`currentAccountFee`, `countsCurrentAccount`): `min(a_p, held)` each month, paid by selling units after the account's own fees.
  - It is never deducted from the sale gain (TXS-06).
  - It is its own fee line `account` in F-61, F-63 and F-91.
  - `docs/method.md` holds F-102 and a sentence in F-63.
- **Site.**
  - The indices page alone sets `plan.currentAccounts = { own }` (`site/app/lib/providers.ts`, `site/app/lib/invest.ts` `currentAccountOf`), so every other page leaves the current account out.
  - An account built on a bank (F-101) and a group's account read the bank's current account and its mark.
  - The account card has a kit `SelectField`, "הבנק שבו כבר יש לכם חשבון עו״ש". Its options are the banks whose record prices a current account, plus "לא באחד מהבנקים האלה".
  - Under the list, one `LongestCase` line says which rows count the current account.
  - The choice is kept in the state's existing `bank` field (`setOwnBank`), so it lives on the device and in the export file.
  - The same control is on the account list of an index with no fund.
  - On the bars, the line takes the account fee's colour (`--chart-cost-fixed`), so no new hue was added. Its part is named "דמי ניהול חשבון עו״ש", and the legend item is "דמי ניהול חשבון ניירות ערך ועו״ש".
- **Tests.**
  - `packages/engine/test/pricing-d64-d67.test.ts`
  - `site/app/lib/invest.test.ts`: four tests
  - `site/app/lib/own-account.test.ts`: an account built on Mercantile
  - `site/app/lib/state.test.ts`: store and export file
  - `site/app/components/invest/render.test.ts`: the list's options and lines

### D65 and D66: what a price for a fund bought abroad leaves out (issues #178, #183)

- **Where the notes stand.** The account card of an index with funds bought abroad has a fold, "מה לא נכנס למחיר של קרן שנקנית בחו״ל" (kit `Disclosure` and `NoteList`), under the note on which price each row shows. The fold says each point once and puts no mark on any row.
- **The first point (D65)** names the houses that print a limit, read from the records' conversion lines with a numeric `spread`: אי.בי.אי, אלטשולר טרייד, מיטב טרייד.
- **The second point (D66)** says that what bodies abroad charge the house is passed on, mostly with no ceiling, and is not in the calculation.
- **Indices with no funds bought abroad** do not show the fold (TA-125).
- **Copy.** The strings are in `site/app/copy.ts` (`invest.pair.abroadTitle`, `abroadSpread`, `abroadOthers`).

### D67: One Zero's charge per corporate event (issue #179)

- **Schema and validator.** New unit `usd_per_event` and new base `corporate_event`.
- **Method and engine.** New formula F-103 (`corporateEventFee`): on each distribution month of a fund bought abroad that pays dividends, it charges `min(c × S_m, held)`. It sits in the custody line and is not deducted from the gain.
- **Data.** One Zero's record gains `one-zero-custodian-corporate-event`: 50 `usd_per_event`, `foreign_securities`. The source is the price list in force from 26.7.2026, part 11, PDF page 17, read in the founder's Chrome on 2026-11-04. The `left_out` entry now keeps only what is still not priced.

## 2. Ranking changes, with evidence

**D64** (`b86160ac`). The evidence is in `d64-rankings.json` (script `rankings-script.ts.txt`): every known index at two plans, 6,000 ₪ plus 400 ₪ a month and 100,000 ₪ plus 0, both over 20 years at 7%.

- **No headline changed** on any index at either plan.
- **Cost per bank.** At 6,000 ₪ plus 400 ₪ a month, a bank's way leaves less in today's shekels: about 1,000 ₪ less at Yahav and 2,500 ₪ less at Jerusalem. For example, on MSCI ACWI Hapoalim leaves 1,392 ₪ less, Leumi 1,405 ₪ and Mizrahi-Tefahot 1,763 ₪.
- **Places move by one at most:**
  - Yahav passes Hapoalim on every index, at both plans.
  - IBI passes Discount and Mercantile at 6,000 ₪ plus 400 ₪ a month, and passes Mizrahi-Tefahot at 100,000 ₪.
  - On the Nasdaq-100 at 6,000 ₪ plus 400 ₪ a month, Interactive Brokers passes Leumi.
- **Marking Leumi** gives Leumi back its figure from before, and leaves every other bank's figure unchanged. On the page's default plan for the S&P 500, Leumi goes from 82,723 ₪ in third place to 83,396 ₪ in second, above One Zero's 83,141 ₪.
- **Expected numbers.** No earlier expected number changed. The new expected values come from this evidence.

**D67** (`c650fa4f`). The evidence is in `d67-one-zero.json` and `d67-one-zero-sp500-abroad.json` (script `d67-script.ts.txt`).

- **No figure, place or headline changes on any index at either plan.**
- **Why nothing moves:**
  - One Zero sells only securities traded in the US.
  - The Irish distributing funds trade elsewhere, so their rows at One Zero are grey ("other-venue").
  - The US funds have no price because of an open tax rule.
- **When it starts to count.** The line takes effect once a dividend-paying fund that One Zero sells is priced. The engine test measures it at 20 dividends × 50 dollars.

## 3. Changed files under packages/, data/ and docs/method.md

- `data/fees/discount@2026-11-04.json`
- `data/fees/fibi@2026-11-04.json`
- `data/fees/hapoalim@2026-11-04.json`
- `data/fees/jerusalem@2026-11-04.json`
- `data/fees/leumi@2026-11-04.json`
- `data/fees/massad@2026-11-04.json`
- `data/fees/mercantile@2026-11-04.json`
- `data/fees/mizrahi-tefahot@2026-11-04.json`
- `data/fees/one-zero@2026-11-04.json`
- `data/fees/yahav@2026-11-04.json`
- `docs/method.md`
- `packages/engine/src/fees/materiality.ts`
- `packages/engine/src/formulas/fees.ts`
- `packages/engine/src/ledgers/common.ts`
- `packages/engine/src/ledgers/securities.ts`
- `packages/engine/src/providers/workbench.ts`
- `packages/engine/src/registry.ts`
- `packages/engine/src/result.ts`
- `packages/engine/test/pricing-d64-d67.test.ts` (new)
- `packages/pipeline/src/validate.ts`
- `packages/pipeline/test/price-premises.test.ts`
- `packages/schema/src/collections/fees.ts`
- `packages/schema/src/value.ts`
- `packages/schema/json/*.schema.json`: regenerated. The value-object unit list changed, and every schema that embeds it changed with it.

## 4. Movement check

The tool is `research/audit/tools/box-check.mjs`. The output is in `move/`. These runs used the build from before the last sentence change, which sits inside the closed fold.

| Page | Width | Control | Page height | Moved in view | Boxes changed | Verdict |
|---|---|---|---|---|---|---|
| /indices/sp500 | 390 | own-bank list: Discount, First International, Hapoalim | +0 | 0 | 1 each | The changing box is the shown line inside its `LongestCase` (2 against 3 lines). The held cell keeps its height and nothing below moves. Kept. |
| /indices/sp500 | 1280 | slider 1 max | +0 | 0 | 1 | A line in the plan block ("התשואה בשנה היא לפני אינפלציה…"). Not part of this change. The live site shows the same kind of change on slider 1 (`sp500-main-live.txt`). |
| /indices/sp500 | 1280 | own-bank list (`--switch` run) | +0 | 0 blocks | rows | Hapoalim and Yahav swap places as their figures cross. This is a re-sort, as a slider makes: the chosen row is held and the others slide (`PickList` `holdOnPick`). |
| /indices/ta125 | 390 | own-bank list | +0 | 0 | 1 each | As on the S&P 500 |
| /indices/ta125 | 1280 | all | +0 | 0 | 0 | Nothing changed |
| index chips (`--switch`, 1280) | 1280 | each index | varies | 0 or 1 (the index description) | — | Index switching already changes the page's height on the live site. The fold appearing only where funds are bought abroad adds one 44 px row on those indices. |

## 5. Fresh readers

Three readers ran in sessions with no project context, through `fresh-reader.mjs`:

- 41, on a computer, with a current account and a securities account at their bank;
- 33, on a computer, new to investing;
- 23, a student, on a phone.

The brief and the answer key (`readers/brief.json`, `readers/key.md`) were written before each round ran. The screenshots were whole-page slices of the S&P 500 page: set A as it opens, set B with Leumi chosen, set C with the fold open.

**Round 1** (`readers/reports/`). All three read the list, the line under it and the change in set B as meant: Leumi moved from third to second, its figure went from 82,723 ₪ to 83,396 ₪, and the red part of its bar disappeared. They tripped on:

- **Legend "דמי ניהול חשבון"** (3 of 3): it could mean the securities account's fee or the current account's.
- **"אף אחד מהם"** (1): "no current account at all", or "my bank is not listed"?
- **"פער בשער ההמרה"** (2): a gap against which rate? And "גם": in addition to what?
- **"המספר שבשורה"** (2): which row?
- **"גוף משמרת", "רשות"** (2 to 3): not known.
- **One misread** (student): read the list as stopping a charge "for opening a new current account".

**Fixes** (`fffc8d98`):

- The legend item is now "דמי ניהול חשבון ניירות ערך ועו״ש".
- The empty choice is now "לא באחד מהבנקים האלה".
- The first note says the conversion fee is counted and the gap is the bank's own rate against the market rate.
- The second note names the bodies abroad plainly and ends on "ממה שמחושב כאן".

**Round 2** (`readers/round2/`). The same three briefs on new screenshots. All three read every line, and the legend, as meant. What remains:

- **One reader missed "לא" at a line break** ("רוב… לא / מגבילים"). The sentence now says "אין תקרה לפער הזה". This last wording was not read by readers again.
- **Three readers want the two fees in the red part shown apart.** This would need another hue, and the cost palette already fails the validator for red against orange (ΔE 7.2), so it waits on the founder.
- **One reader still finds "לא באחד מהבנקים האלה" an odd default.** D64 sets no bank marked as the default.
- **Requests outside these decisions:**
  - student prices;
  - the legend sits far from the bars on a phone;
  - how money reaches an investment house, and at what cost;
  - whether the caps of the three named houses are in their figures;
  - fund-tag jargon.

## 6. Structure review

The tool is `node research/audit/tools/merge-review.mjs bcd0b136` (`merge-review.txt`). 54 files changed in total, 48 of them code or docs.

| Item | Verdict |
|---|---|
| `pair.tsx` `OwnBankField` | **Kept.** A one-off composition of the kit's `SelectField` and `LongestCase`, used only by the indices page's two account lists. |
| `pair.tsx` `AbroadNotes` | **Kept.** A one-off composition of the kit's `Disclosure` and `NoteList`. The decisions say it once, on this page only. |
| `pair.tsx` `AccountColumn`, `no-fund.tsx` `NoFundAccountColumn` | **Kept.** Existing feature components. Only a prop was added. |
| Hand-styled pills, cards, fields, literal colours, Hebrew outside the copy file, kit changes without the gallery | None in this change. |

- **Against main.** The run against main lists more items, all from round 4's merge, which round 4 already judged (`round4/merge-review-main.txt`).
- **Screenshots against /kit.** The list, the fold and the note list match their gallery pieces.
- **Nothing is left to send back.**

## 7. Screenshots

The screenshots are in `shots/`, at 1440 and 390, for S&P 500 and TA-125, with no bank marked and with Leumi marked. I looked at the ones that show the new pieces: S&P 500 at both widths, with and without Leumi marked, the TA-125 computer view, and the readers' set C.

- S&P 500 on a computer and on a phone: the fold is closed and the list stands under the note on prices.
- TA-125 on a computer: no fold.
- Leumi's red part goes when Leumi is marked.
- First International's bar shows its current account in red.

The four full-page phone shots (2.5 MB each) were deleted. The readers' phone slices in `readers/` cover the whole phone page.

## 8. Not done, with the reason

1. **finance-reviewer (engine, schema and source changes) and an independent checker of the diff and the built page were not run.** This session has no tool to start another agent. Both are needed before this goes live. Points for them to check:
   - Leumi's quote reads "5.50 ש\"ח לפעולה (בפיקוח)", recorded as the monthly minimum. Check that this is the current account's monthly minimum and not a price per action.
   - F-102 is not deducted from the gain, and F-103 is not deducted from the gain.
   - The nominal minimum is held flat for the whole plan.
2. **The Hebrew editor was not run as a separate agent**, for the same reason. The new lines follow `docs/copy.md` section 10: plural address, gershayim, a field label of 7 words, and no prefix on a bank's short name. Two rounds of fresh readers judged them.
3. **D65 and D66 name a block that no longer exists.** They say "the block on what the houses advertise against their price lists", which D57 removed from the indices page on 2026-11-05. The notes stand once on the account card instead. `docs/product.md` was not changed. The founder may want D65 and D66 to say where the notes stand.
4. **Possible pricing bug found, not fixed.** Altshuler Trade (0.7%) and Meitav Trade (0.8%) print a cap on the spread in their records' `spread` field, and the engine does not price it. IBI's 0.7% is priced, as its rate. This goes against D56 ("up to" is priced at its ceiling), against D65's reading that a limited spread is priced, and against the records' own notes. Fixing it would be a ranking change with its own evidence. Until then the D65 note does not say whether the three houses' caps are in their figures.
5. **Interactive Brokers is not named among the houses that limit the spread.** Its spot order is printed "no mark-ups on quotes", but its record has no `spread` field. Adding a `spread` of 0 with that quote would name it.
6. **D64 changes only the indices page**, as written. A bank's company page, the guides and the goal comparison still price without the current account, so a bank's figure there can differ from its row on the indices page. Whether those pages should count it is a product question not written down.
7. **D67 moves no figure today** (section 2). One Zero's page was not re-read today: the line rests on the 2026-11-04 reading in the founder's Chrome, which is recorded in the record.
8. **The state keeps a dead `broker` field** from the removed "החשבון שלכם" control. It was left as it is, since it is not part of these decisions. The own bank reuses the state's existing `bank` field, which nothing else read.
9. **The final sentence change ("אין תקרה לפער הזה") was not read by fresh readers.** It is a small change to words, so it waits for the next batch.
