# Round 4 of the indices page fixes (#190): brief

Written 2026-11-06 by the lead. The branch `indices-pc-fixes` (worktree `.claude/worktrees/pc-fixes`) is not merged:
the independent review of rounds 2 and 3 (`../2026-11-05-indices-pc-fixes-review-r3.md`) found defects this branch
caused. This round fixes them and finishes the work the founder approved today. Read CLAUDE.md's rules on stable
layout (with D62), the kit, Hebrew and screen sizes, and `docs/design-system.md` 2.5a, before starting.

## 1. Defects the review found and a refuter confirmed (must be fixed)

1. **High.** On a computer, the note "החשבון עבר ל…" that appears after a fund pick changes the account is drawn on top
   of the fund's identifier in the row (19 px overlap, `components/invest/pair.tsx` around 1039).
2. **Medium.** On a phone, the fund list's fold holds a height that depends on the fund the page opened on
   (`components/kit/pick-list.tsx`: a heading row counts toward the places only while selected, around 135; the held
   height takes the tallest `shown.length` rows and leaves out folded `data-cannot` rows, around 167-168;
   `pair.tsx` around 1070 sets `canShow:false` on a row that does stand in the default fold). Opening
   `/indices/msci-acwi/?fund=1147362` and picking another fund moves everything below by 233 px; choosing the only
   hedged fund on S&P 500 shrinks the list by 170 px. The held height must be the same whichever row the page opened on.
3. **Medium.** The new pair line in the top tiles (`pair.tsx` around 352) cuts the start of a foreign fund's name, so
   the reader cannot tell which fund was picked.
4. **Low.** The stairs list a typed account whose conversion was left empty under "יש ספק אם נמכרת שם"; it belongs
   under no price (`lib/custom-entries.ts` around 401, `stairs.ts` around 61).

## 2. Findings not checked by a refuter (check each; fix what is real, say why for what is not)

- With the sliders at their ends (40 years, 12%) the steps section grows 38 px on a phone and stays grown.
- Amount 0 with deposit 0 removes a sentence from the hedge section; what follows moves 45 px (phone), 23 px (computer).
- On a phone the stairs section moves on a pick and on a plan change.
- The top card says the pick is one of three tied pairs but shows two, and the third is named nowhere (readers of round
  3 tripped on "3 הזוגות" for the same reason).

A move that was already on the live site is still a defect of this page under the rule; fix it in this round if the fix
is in the page's own pieces, and list it apart if it is not.

## 3. Approved today

- **D62** (`docs/product.md`): switching index on a phone may move what lies below the switch, with a short, gentle
  transition instead of a jump. Build that transition in the kit (look at `useFlip` and the kit's motion tokens first),
  under 100 ms to the first visible response (ground rule 5), with no motion when the reader asks for reduced motion.
  Every other change still moves nothing.
- **The blank under the account list on a phone** (about 430 to 470 px as the page opens on the foreign indices):
  shrink it while nothing moves within an index. Find what makes the longest state that much taller and lay it out so
  the states differ less; a list keeps one height across the states and plans of the index it shows, not across indices.
- **Words the round-3 readers tripped on** (`round3/readers/key.md` and the six reports): the two "way back" lines
  (readers were unsure whether the link undoes both changes), "המסומנת" (marked by whom?), and the tied pairs (above).
  New Hebrew goes in `copy.ts`, follows `docs/copy.md` section 10, plural or impersonal, and goes through the Hebrew
  editor before fresh readers see it.

## 4. Before you report

- A movement script (keep it in `round4/`): every pick in both lists after loading every `?fund=` and `?house=`
  address of every index, plans at the sliders' ends, amount and deposit 0, typed accounts and funds with blanks, the
  panels, reloads; at 1440 and 390. Everything below a change must move 0 px, except an index switch on a phone, which
  must animate. Report the largest move per case, before (main) and after.
- Before and after screenshots at 1440 and 390 of every fixed defect, in `round4/`.
- `npm run check` passes; `node research/audit/tools/merge-review.mjs main` with a verdict on each item.
- Commit on the branch with `(#190)` in each message; do not merge, do not push.
