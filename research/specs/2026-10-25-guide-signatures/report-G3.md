# Report G3, 2026-10-25

Saved by the lead from the builder's final message; merged by the lead onto main after G2 (cherry-pick, full check and screenshots clean).

Branch `worktree-agent-af316ee7101f7f4ab`, commit `a09d0e6` (not pushed). Checks: `npx vitest run site packages/engine` 56 files, 778 tests pass (baseline 754, so 24 added); `npm run typecheck` clean; `npm run validate` "data/ is valid". I did not run `npm run check` or the site build.

## What I built

**Data and schema**
- Published the seven held current-account records to `data/terms/deposits/` (Discount, First International, Hapoalim, Massad, Mercantile, Mizrahi-Tefahot, Yahav). Together with Leumi's that is 8 banks.
- Added optional `conditions_he` to the deposit-terms schema, the exported JSON schema and `docs/data-schema.md` section 3.7. All 8 current-account records carry it, with a plain-Hebrew summary of the printed conditions. The three banks that print the no-interest sentence carry that sentence, quoted.
- **One field beyond the spec:** optional `doubt_he`, one sentence on an open doubt. It is filled for First International (the conditions file says the benefit ran to 31.03.2026, but the 25.10.2026 publication still shows 2%) and Mercantile (it prints 0 beside conditions worded identically to Discount's 3% offer). Reason: you asked for a Mercantile caution flag, and the flag needs text that lives with the record. If you'd rather keep it in `copy.ts`, it is a small change.
- The records' English notes (the researcher's doubts) are untouched. The held copies in `research/.../held-deposits/` are left in place; remove the current-account ones if you want one home.

**F-85, the rate most banks pay**
- New `packages/engine/src/formulas/account-interest.ts`: `mostCommonRate` (ties go to the lower rate; also counts banks paying above 0) and `currentAccountYearlyInterest`.
- Registered as "F-85" and exported. Method notes are in `docs/method.md`: a new F-85 paragraph after F-84, and a dated note on F-26 for the yearly maximum.
- Test file: `packages/engine/test/account-interest.test.ts`.
- On the published data F-85 gives **0%, 4 of 8, 4 paying** (Discount 3%, First International 2%, Leumi 1%, Yahav 0.75%).

**The page**
- `site/app/components/guide-signature/current-account.tsx` leads with: "אחרי 10 שנים, 10,000 ₪ בעו״ש שווים 8,203 ₪ בכסף של היום: 1,797 ₪ פחות." Under it: "רוב הבנקים לא משלמים ריבית על עו״ש…" and "הריבית שרוב הבנקים משלמים: 0%, ב־4 מתוך 8 הבנקים שנאספו."
- The chart:
  - the value axis is fitted to the data, not to 0, with a caption saying it doesn't start at zero;
  - the value labels sit in a left gutter, so they never lie on the start of a line;
  - the gap is filled, bracketed at the right end, and labelled "המחיר של להשאיר" with its number;
  - the dashed starting balance and the two direct labels are kept.
- The conditions switch, the Leumi terms paragraph and "לפי הפרסום של לאומי" are gone from this page.
- Closed fold titled "חלק מהבנקים כן משלמים ריבית, בתנאים ועל סכום קטן בלבד" (no number in the title). Inside:
  - a picker over the 8 banks, tap again to unpick;
  - a table: bank, rate, who gets it (`conditions_he`), and the most it pays in a year on the person's balance after tax;
  - payers first, highest rate first, then one "לא משלמים ריבית" row.
- Picking a bank redraws the account line at its rate and ceiling. A one-line statement under the headline says so ("בהנחה שאתם עומדים בתנאים של הבנק ושהריבית לא משתנה") with a button back to the default, and the headline follows. Nothing is picked by default.
- Your Mercantile and Hapoalim/Mizrahi-Tefahot/Massad instruction:
  - In the "pay nothing" row, Hapoalim, Mizrahi Tefahot and Massad are said to have printed the sentence the Bank of Israel requires when no interest is offered: ״לא מוצעת ריבית על יתרת זכות״, with a BANK-09 reference. The il-finance knowledge file, `research/knowledge/bank-current-account-deposits.md`, says directive 447 requires this wording.
  - Mercantile gets its own line: "מרכנתיל [יש ספק] כתב בפרסום ריבית 0%", then its doubt sentence with the caution icon.
  - First International gets the "יש ספק" tag and its doubt line on its row.
  - Yahav's row shows "עד 31.12.2026".
- Bank detection of "printed the sentence" is read from the record's notes (`noOffer`), not hard-coded to bank names.

**Timeline, ladder, worth knowing**
- The guide timeline on this page now starts at the F-85 rate, injected in `guide-signature-bundle.server.ts`. The hint reads "הריבית ההתחלתית היא הריבית שרוב הבנקים משלמים בעו״ש: 0%, ב־4 מתוך 8 הבנקים שנאספו. ריבית שתזינו תחול על כל היתרה." An entered rate still overrides it. The ceiling is dropped at a rate of 0.
- Ladder row on the daily money-market fund page:
  - it shows the common rate with a "הריבית שרוב הבנקים משלמים" tag and "4 מתוך 8 הבנקים שנאספו מפרסמים ריבית כזאת";
  - it adds "יש בנקים שמשלמים עד 3% (דיסקונט), בתנאים ועל עד 10,000 ₪ בלבד";
  - the page's foot now says the one-year deposit row is Leumi's; the old blanket "only Leumi" line is removed there.
- "שווה לדעת" has a new computed-fact row beside the rule rows. `worth-knowing.tsx` takes a `facts` list and `guide.tsx` builds it. The row reads "4 מתוך 8 הבנקים שנאספו משלמים ריבית על יתרה בעו״ש, כולם בתנאים ועל עד 10,000 ₪ בלבד; הכי הרבה: 3%, אצל דיסקונט. לטבלה". Every figure goes through `Num`, and the link opens the fold. The fold also opens when the page loads on `#current-account-banks`. The row says "בנק אחד" for a count of 1, and drops the "all conditional" and "all capped" clauses if the records stop supporting them.

## Figure sources
- Each bank's rate, ceiling and end date: its own record, state sourced, strength institution (the caution icon on every bank figure).
- The rate most banks pay and the three counts: computed by F-85 over those rates, with each bank's rate listed in the number's sheet.
- The 15% tax: TXI-03 rate from `data/rules/`.
- The yearly maximum per bank: computed (F-26 note), `rate × min(balance, ceiling) × (1 − 15%)`. Discount 255, First International 170, Leumi 85, Yahav 63.75 on 10,000 ₪.
- The 8,203 and −1,797: engine run of the page bundle, 10,000 / 1.02^10 (A-02 is P-05's 2%).
- The daily fund's 3.5%: the site's assumption, as before.
- The highest rate and the largest ceiling in the worth fact and the ladder are the sourced values of the bank that holds them.

## Files changed (27)
- `site/app/components/guide-signature/current-account.tsx`, `money-market-daily.tsx`, `render.test.ts`
- `site/app/components/guide/worth-knowing.tsx`, `site/app/components/timeline/Timeline.tsx` (hint only)
- `site/app/copy.ts` (account, ladder, timeline hint, F-85 name, gap text)
- `site/app/lib/guide-signature.ts`, `guide-signature.server.ts`, `guide-signature-bundle.server.ts`, `guide-signature.test.ts`
- `site/app/routes/guide.tsx`
- `packages/engine/src/formulas/account-interest.ts` (new), `index.ts`, `registry.ts`, `packages/engine/test/account-interest.test.ts` (new)
- `packages/schema/src/collections/deposit-terms.ts`, `packages/schema/json/deposit-terms.schema.json`
- `docs/data-schema.md`, `docs/method.md`
- `data/terms/deposits/` (7 new current-account records, Leumi's updated)

## Tests added
- F-85 gives 0 with 4 of 8, 4 paying, read from the real files, plus ties, float noise and an empty list.
- The yearly maximum for each bank on 10,000 ₪ and the ceiling cap.
- The table order (payers first, highest first, then the silent banks) and each bank's text, doubt and end date.
- The picker changes the account line (Discount equals the engine run on the bundle at its rate), and the paying banks' ceiling holds on a 50,000 ₪ balance.
- The timeline's default rate on the current account is 0, computed by F-85 over 8 banks, with no ceiling.
- The headline numbers 8,203 and 1,797.
- The ladder row.
- The worth-knowing row (renders, has the link, five-plus `Num`s, absent without records).
- The fold renders closed, with the 8-chip picker and the doubt tags.
- The old timeline test that expected a gain from idle cash now asserts the equality it has at 0%.

## Screenshots
Everything is in `/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/g3/shots1/` (volatile, not committed):
- `pc_current-account.png`, `phone_current-account.png`
- `pc_money-market-fund-daily.png`, `phone_money-market-fund-daily.png`
- `pc_fold.png`, `phone_fold.png` (fold open)
- `pc_picked-דיסקונט.png`, `phone_picked-דיסקונט.png` (Discount picked)
- `pc_worth.png`, `phone_worth.png`
- `pc_timeline.png`, `phone_timeline.png` (timeline open)
- `pc_row-discount.png`, `pc_row-fibi.png`, `probe_bdi.png` (zoomed)

The scripts I used are in the same scratchpad `g3/` folder: `fold-shots.mjs`, `timeline-shot.mjs`, `interact.mjs`, `probe.mjs`. I read the PNGs. At 390 px there is no horizontal overflow on either page. The only elements outside the viewport are the closed timeline's chips, the same on both pages and not mine. The first chart had the value label lying on the start of the lines and two long column headers, and I fixed both.

## Things to know and open items
1. **Worktree setup:** a plain symlink of `node_modules` resolves `@finance-tool/*` into the main checkout, so my schema edits were invisible to the validator and tests. I made `node_modules` a real directory of links with `@finance-tool/{engine,schema,pipeline}` pointing at this worktree, and gave vite its own cache directories. The dev server also needed `server.fs.allow`, which I put in a throwaway config (deleted). Only the three untracked `node_modules` entries remain untracked; I committed by explicit paths.
2. **Numbers inside the records' Hebrew prose** (conditions and doubts, "3,000 ₪", "31.03.2026") are not `Num`. They are bank-printed text, isolated left to right with a small helper so the shekel sign keeps one order. The rate beside each row is a `Num` whose sheet shows the source. If you want every figure in prose through `Num`, `conditions_he` would need structured figures.
3. **Hapoalim's rate** has `effective_from` 2026-10-26 (its feed's date), one day after today. Its figure therefore carries a "תקף מ־" caution in the sheet until tomorrow.
4. **Yahav's rate is variable** (prime − 4%, offer to 31.12.2026). The picker assumes the printed rate stays for the whole run, and says so.
5. Out of scope and untouched, as the spec says: the goal comparison and idle-cash verdict (still P-05's Leumi record), and the deposit and savings-plan pages. `CLAUDE.md` still says "Leumi's 3 deposit terms"; it is the lead's file and now stale.
6. The `Timeline` change (`cash.common`) and `worth-knowing.tsx` / `guide.tsx` edits are outside G3's original file list, per the spec's worth-knowing paragraph and the timeline hint. They are small and additive.
