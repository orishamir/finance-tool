# Report: a company's figure about its own product carries no caution (D31, 2026-10-26)

The builder (Sonnet) wrote the code in two commits and handed back three times before its on-screen checks. The lead finished them, and fixed one slip: the timeline's terms line named a bank in English.

## What changed
- `site/app/lib/value.ts`:
  - `SiteValue.own` (the company whose own product the figure describes);
  - `isWeak(v)` (secondary, or institution without `own`), with `ownBy`, `ownEach` and `anyWeak`;
  - `computed()`'s weakest input skips an institution figure that carries `own`.
- `site/app/components/provenance.tsx`:
  - `Num`, the sheet's amber block and the weak-input names read `isWeak`;
  - an own figure's sheet shows only its source line (publisher, title, date);
  - `NumberLegend` shows "לפי החברה" only where a page holds a weak figure (`anyWeak`).
- `own` is set at these call sites:
  - guide visuals: bank deposit and account rows, fund name, number and fees, broker names;
  - the renewable money-market timeline: the series date, plus a new line "הסדרה בדוגמה: …";
  - guide timelines: every sourced fee and the published deposit rate. The terms block names the company on a new line, "התנאים והתעריף בדוגמה הם של …", with the Hebrew name from `data/sources/publishers.json` (lead fix);
  - company pages: deposits, tariff lines and dates;
  - the providers workbench: tariff lines, minimums, dates and cost lifts;
  - workbench fund rows;
  - the comparison card: provider tariffs and index-fund fees;
  - the index page's fund fees;
  - idle cash: the deposit row ("פיקדון של {bank}") and the baseline ("העו״ש של {bank} משלם היום").
  - The company's name on those lines comes from `publisherHe` (`lib/publisher-he.server.ts`, lead fix). It reads the publishers table's Hebrew name for the source's host, because tariff and deposit files name their bank in English ("Bank Leumi le-Israel B.M.").
- Tests: `value.test.ts` (`isWeak`, `computed()` weakest) and `own-figures.test.ts` (`Num` icon, sheet block, a fund row, the legend).

## Call sites and verdicts
| Call site | Verdict | Why |
|---|---|---|
| Bank table and picker (current account, deposits) | own | each row names its bank |
| Bank-deposit and savings-plan visuals | own | the copy names the bank |
| Study-fund and provident visuals: fund and broker facts | own | named on the visual |
| Guide timelines' example tariff and fees | own | the terms block names the company |
| Renewable money-market series date | own | the date is in the fund's own name, and the series is named above the timeline |
| Providers workbench, workbench fund rows, company pages | own | each row is the company's or fund's own |
| Comparison card: fund fee and tariff lines | own | the card names its broker and fund |
| Index page fund fees | own | each row names its fund and manager |
| Idle cash: deposit row and baseline | own | the row names the bank |
| `classMinFee` (a minimum over several funds) | out of context | stands for many companies |

## On screen (lead, 1280 px, build of 2026-10-26)
Survey of amber marks per page (`tools/survey.mjs`):
- **No mark:** `/indices/ta35`, `/indices/sp500`, the renewable money-market guide, the bank-deposit, savings-plan, makam, government-bond and current-account guides, `/idle-cash`, `/fees`, `/goal/compare`, the providers workbench.
- **Left, to fix after the merge:**
  - `/guide/keren-hishtalmut` (93,511 ₪) and `/guide/kupat-gemel-lehashkaa` (76,948 ₪): the figure's sheet names "דמי ניהול" as the company input. The fee rate is one company's list price (`providentTerms` in `compare.server.ts`), and these bar visuals don't name that company, so by D31 the mark is right for now. The follow-up names the company on the visual (as the timelines' terms block does), and then the figure is own.
  - `/idle-cash` shows the legend's "לפי החברה" item before an amount is entered, with no marked number on the page.
- **Not this branch's:** `/guide/brokerage-account` shows "אין תקרה בחוק" with a caution mark. That is a statement about the law resting on a weak source, and it belongs to the scope settling (the "no rule exists" records).

Shots, in `shots/`:
- `crop-fund-row.png`: index fund rows with full fee labels and no amber;
- `crop-renewable.png`: the series line and the date without amber;
- `crop-terms.png`: the timeline's terms block, before the Hebrew-name fix;
- full pages: `ta35-*`, `renewable-*`, `brokerage-*`.

## Structure review (lead)
`merge-review.mjs main`: 26 files, 23 of them code or docs, so no second reviewer is needed.
- **Kept:**
  - `OneSource` and `SourceBlock` are parts of the provenance sheet in `provenance.tsx` (the blocks layer), not page components.
  - `NumberLegend` was already there and changed in place.
- **Kept:** Hebrew in `guide-signature*.server.ts`: the facts' `notes` and titles follow those files' existing style. The flagged lines were already there and only gained `ownBy`. Moving them to `copy.ts` belongs to a later copy sweep.
- No hand-built pills, cards or fields; nothing to send back.
