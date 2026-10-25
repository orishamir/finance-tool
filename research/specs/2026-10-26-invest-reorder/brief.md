# Brief: the index page, broker first (2026-10-26)

## Why
The founder, on `/invest/index-ta35`:

> someone in the /invest page is wondering where would be best to track the index. currently, we suggest the cheapest option, which is good. but you know, sometimes you dont want to sign up to Psagot because you never heard of them and neither do you, your parents, your friends … (א) - the options - is currently treated as some sort of major choice for the user. its really more of a side note. honestly i dont really mind if what i buy is an ETF or mutual fund. that is the byproduct of what is cheapest … maybe even a simple label of "traded throughout the day (but shorter)" would be enough. Also, same goes for "מה כל בחירה שווה בתוכנית שלכם" this information is nice to have, but the comparison between different funds is more important. Same for the "איזה בית השקעות הכי זול לכל אפשרות" which is in a really weird placement because its *after* the choice between ETF and mutual fund

He approved the sketch: headline, then every investment house with the cheapest way at it, then the funds at a chosen house, with the fund type as a tag and the rest folded. On the worth sentence he said "its not really clear what that means", so it becomes the two lines below.

## The page, top to bottom
1. **Unchanged above the result:** the index pills, the plan chips, the dollar line, the account select, and `IndexHeader`.
2. **Headline** (`Headline`): the cheapest complete way, as today, plus the fund type as a small tag next to the fund (see "Type tags").
3. **Two lines on what matters**, replacing the `Worth` section's place:
   - "**בית ההשקעות משנה הכי הרבה:** אצל היקר ביותר יישארו לכם בסוף {broker gap} פחות מאשר אצל הזול."
   - "**הקרן משנה פחות:** בין הקרנות על המדד, עד {fund gap}."
   - and under them: "בעוד {n} שנים, בכסף של היום, לפי התוכנית שלמעלה."
   - **Broker gap:** the largest minus the smallest of each Israeli house's own cheapest way (item 4), among houses that compute.
   - **Fund gap:** the largest minus the smallest value among all funds on the index at the headline's house, across every Israeli type.
   - Both are computed `Num`s. Add their definitions to `docs/method.md`, in F-63's paragraph on the index page ("The worth lines"), replacing what the old bars defined only where it changed.
   - Edge wordings: if the houses' gap is the larger one, keep the order above. If the fund gap is the larger, swap which line says "הכי הרבה". With one house or one fund, say so plainly instead of a zero.
4. **(1) Every investment house, with the cheapest way at it.** This replaces the options cards (א) and `BrokerGrid` (ב).
   - A row per house that computes for this index: name (`ProviderLink`), "החשבון שלכם" when it is the account the person chose, the house's own cheapest way across the Israeli options (fund name and type tag), what's left (`Num`), and the gap from the cheapest overall (computed `Num`; empty for the top row).
   - Sorted by what's left. Show the top 5 and the person's own house; the rest sit under "ועוד N בתי השקעות".
   - Foreign brokers form their own group under the Israeli ones ("בחו״ל"), with today's labels (self-reported tax, blocked parts) kept.
   - Houses that don't compute (not comparable, not available) are listed last with their reason, as today.
   - Clicking a row picks that house for section 5 and scrolls to it.
   - At 390 px each row is a stacked card.
5. **(2) The funds on the index, at the chosen house.** Heading: "הקרנות על המדד, אצל {house}".
   - A picker of houses: `ChoiceChips` if it fits, otherwise the kit's select once it exists, or a plain select styled like `invest/chips.tsx`'s account select. Default: the person's own house if set, else the cheapest.
   - Every fund on the index, across the Israeli types, ranked by what's left at that house, with its type tag and its fee lines under full names: "דמי ניהול קבועים", "דמי ניהול משתנים", "שכר נאמן" (`copy.ts`, the `funds` strings: today "קבועים", "משתנים", "נאמן").
   - A foreign house shows the funds abroad.
   - Keep today's fund labels, filters (hedged and unhedged) and empty state.
6. **Folded at the bottom**, each a kit `Disclosure`:
   - "מה כל בחירה שווה, בפירוט": today's `Worth` bars, unchanged;
   - "קרן סל או קרן מחקה: מה ההבדל": today's options content (how each is bought, priced and taxed, with its rules), as a short comparison;
   - "מה עושים עכשיו": today's `Steps`.
   - `Foot` and the rules line stay last.

## Type tags
One short tag per fund, from sourced rules, never typed facts:
- Israeli ETF: "קרן סל · נסחרת כל היום".
- Israeli tracking fund: "קרן מחקה · נקנית פעם ביום".
- Foreign fund on TASE: "קרן זרה בת״א".
- Abroad: "בחו״ל".

The tag opens the same explanation the options cards gave (rule chips included), so nothing sourced is lost. Reuse the options' existing strings and rule ids.

## Rules
- Use the kit for every piece (`site/app/components/kit/`, gallery at /kit): `Card`, `Disclosure`, `ChoiceChips`, `Stat`, `Sentence`, `RankBadge`, `Tag`. The structure review (CLAUDE.md) will look for anything hand-built. The ratchets and guards must keep passing.
- Every number is a `Num`; any new computed number needs its definition in `docs/method.md`.
- Hebrew copy goes in `site/app/copy.ts` under `invest`, in the plural imperative and in the style of `docs/copy.md` section 10. Put the strings above as written.
- Don't touch `site/app/components/provenance.tsx`: another builder is changing it now.

## Check on screen (required)
Build your worktree (`npm run build -w site`), serve on port 4235, and photograph at 1280 and 390 px:
- `/invest/index-ta35`, `/invest/index-sp500`: the whole page, in parts under 1800 px;
- with the account select set to a bank: its row marked, and its funds shown in section 5;
- a click on a house row: section 5 follows;
- a foreign house picked;
- each fold opened.

Look at every shot yourself. Write `report.md` beside this brief, with the shots in `shots/` (inside your worktree, never /tmp).

## Files you own
- `site/app/components/invest/*`
- `site/app/routes/invest.tsx`
- `site/app/lib/invest.ts` and its tests (for the gaps and per-house best way, if the view lacks them)
- `site/app/copy.ts` (only under `invest`)
- `docs/method.md` (only F-63's index-page paragraph)

Anything else goes in `requests.md` beside this brief.

## Commands
- Run `npx vitest run site packages/engine` and `npm run typecheck`. Don't run `npm run check`, and never `pkill`.
- Keep shell commands simple: scripts in files, then run them.
- Commit on your branch, ending the message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; the lead reviews and merges.
