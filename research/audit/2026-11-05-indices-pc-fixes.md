# Indices page: fixes from the PC review (issue #190)

Branch `indices-pc-fixes`, 2026-11-05. This report covers section A, items 1 to 8, of
`research/audit/2026-11-05-indices-pc-review.md`. Sections B and C are out of scope and were not touched.

Screenshots of each fix are in `2026-11-05-indices-pc-fixes/`. Every name is `before-…` or `after-…`. The before shots come from the
build of 0138efc, the after shots from this branch. Both were served under `/finance-tool/` and captured at 1440x900 and at 390 px
with the same steps, by `cap-all.mjs` and `cap-move.mjs` in the session scratchpad.

## 1. Names

**What the reader saw.** Thirteen fund names were scrambled, for example "MTF סל (S&P 500 (4D" and "קסם (4A) ETF ת"א 90". The
stairs chart split "(4D)" into "(D4)". Latin-led names such as "MTF סל (4D) S&P 500" were laid out left to right inside Hebrew
lines.

**What changed.**
- **Fund records.** All 13 records were corrected from each fund's annual report in `research/library/`. They are 1143734,
  1146331, 1146356, 1146570, 1149772, 1150333, 1165810, 1165844, 1201003, 5122569, 5129283, 5139696 and 5140165. The fix
  covers `names.he[0]`, the glued aliases and the source titles that quoted the bad names.
- **Rule citations.** Five rule citations were corrected the same way: `data/rules/etf-64`, `-65`, `-66`, `-68` and `-69`.
- **Data check.** A new check, `checkFundNames` in `packages/pipeline/src/validate.ts`, fails on brackets that do not pair up
  and on a Hebrew letter glued to the outside of a bracket. Its tests are in `test/fund-names.test.ts`.
- **Chart text.** The kit's `isoNumbers`, in `stairs-chart.tsx`, now isolates only free-standing figures, never digits inside
  a name.
- **New kit piece, `MixedName`.** It is in `kit/name.tsx`, with a gallery entry and a ratchet, "a name in a plain bdi". It
  gives any name that contains Hebrew a right-to-left direction. It is used for fund, house and manager names on the page.

**How it was checked.**
- Every corrected name was read from the report's own text, never typed from memory. No name was left unconfirmed.
- The validator passes.
- Shots: `before/after-01-funds-pc.png` and `after-02-result-pc.png`.

**Left for the file's owner.** `.claude/skills/il-finance/references/etfs-and-index-funds.md`, lines 611, 638 and 677, still
quotes the malformed names. That file belongs to its owner, so I did not edit it.

## 2. Before any pick, nothing is called "yours"

**What the reader saw.** Before anything was picked, the tile said "הבחירה שלכם" and the stairs said "עכשיו". The tiles and bars
named no fund.

**What changed.**
- **Tiles.** `PairResult` takes `chosen`. Before a pick, the first tile says "★ הזוג הזול ביותר לתוכנית שלכם", "אחד משני
  הזוגות הזולים…" when the two pairs are tied, or "הזוג שמשאיר הכי הרבה, בלי דירוג". The blue frame is kept for a real pick.
  Each tile names its account and its fund on one line, held at two lines on a phone.
- **Cost bars.** Each bar row says its role, its house and its fund.
- **Stairs.** When nothing is picked, the stairs start from `middleStart(g)`, which is the middle Israeli fund at the middle
  account. It moves with the sliders and is never the reader's. The stairs now say "לדוגמה" and "נקודת התחלה לדוגמה:", and the
  table head reads "לעומת הדוגמה". A line under the stairs title says where the start comes from.

**Files.** `pair.tsx`, `stairs.tsx` and `routes/invest.tsx`, with a render test.

**Shots.** `before/after-02-result-pc.png` and `before/after-02-result-phone.png`.

## 3. The tie threshold (P-01)

**What changed.** The page now uses P-01's threshold through the engine's `isTie` and `tieThreshold`, in `lib/invest.ts`
(`tieShareOf`, `placesOf`).
- Two pairs within the threshold share the top, and no star crowns either. The first is called "הזוג הראשון".
- Equal figures share a place.
- An account tied for first place shows "תיקו" on a computer. On a phone the two equal place numbers say it alone, because the
  word wrapped the row.

**Evidence** (default plan: 10,000 now, 500 a month, 10 years, 7%):

| Index | Before | After |
|---|---|---|
| S&P 500 | ★ on Psagot with Yelin (86,492) over Psagot with Altshuler (86,449) | tie, no star |
| NASDAQ 100 (86,045 against 85,622, a 0.49% gap) | ★ | tie, no star |
| MSCI World, TA-90 | ★ | tie, no star |
| ACWI, TA-35, TA-125 | ★ | ★ kept (the gap is above the threshold) |
| Hapoalim and Yahav, 81,471 each (S&P 500) | places 6 and 7 | 6 and 6 |
| Discount and Mercantile, 79,901 each | places 9 and 10 | 9 and 9 |
| Yahav on ACWI | place 3 | place 2 |

No expected test numbers changed. Two commits did this work: 22ff4ac and d1bb9da.

## 4. No silent switch

**What the reader saw.** Picking a fund the shown account cannot price changed the account without a word, and the reverse
happened too.

**What changed.**
- `pickHalf` reports what moved.
- The row that was clicked then says "החשבון עבר לאינטראקטיב ישראל" with a button "חזרה לפסגות". On an account row it says
  "גם הקרן הוחלפה." with "חזרה לקודמת".
- Before the click, the grey row already warns "בחירה בה מעבירה את החשבון ל…". A grey account row says "בחירה בחשבון הזה
  מעבירה גם לקרן …, ונשארים …".
- The back buttons have 44 px targets.

**Shots.** `after-04-grey-row-pc.png` and `after-04-moved-row-pc.png`. The before build has no such row text.

## 5. The list's account dialog

**What the reader saw.** "הוספת חשבון בתנאים שקיבלתם" opened a blank form in which an empty field counted as 0, so an account
with missing prices could be starred.

**What changed.**
- The dialog starts with "על בסיס", a choice of house that opens the account card's own panel at that house's price list. Only
  "בנק או בית השקעות שלא ברשימה" shows the bare fields, and their "0" placeholders were removed.
- A blank line is unknown. `unknownLines` and `snapshotOfBroker` mark the account `missing` with "entered-incomplete", so it
  becomes a grey row, "חסרים מחירים…", and is never ranked or auto-picked.
- An old saved entry with an empty fee loses its tariff until the fee is filled.

**Files.** `lib/custom-entries.ts` and `custom-entries.tsx`. The tests in `custom-entries.test.ts` and `own-account.test.ts` were
updated, and the golden figures are unchanged.

**Shots.** `before/after-05-broker-pc.png`.

## 6. The reasons on "אין מחיר כאן" rows

**What the reader saw.** Under the fund list, Psagot's reason said its price list has no line for foreign funds. That is false:
the record holds a doubt, that the European price is not final.

**What changed.** The new `whyNoPrice` takes the reason from the house's record first: the doubt, then the missing-list reason,
then "not possible" in words. Only after those does it use the engine's own reason.

**Checked on every house and index:**
- Psagot and IBI abroad now give their recorded doubt.
- One Zero and Interactive Brokers on Israeli funds give theirs.
- Interactive Israel, where its documents say a kind cannot be bought, says "לפי המסמכים של החברה, אי אפשר לקנות שם …" on the row.

**Shots.** `before/after-06-reasons-pc.png`.

**Not done.** The reasons that depend on the house stay in one block under the list, one line per reason, as the founder's
2026-10-31 code note asks. They are not repeated on each row. Issue #187, Psagot's price for a foreign fund listed in Tel Aviv,
stays open.

## 7. Nothing moves when a number changes

**What changed.**

| Case | Fix | Measured with `box-check.mjs` |
|---|---|---|
| An error line pushed the result down (B4) | A slider row's typing error takes the place of the reset under its label (kit `RangeField` with `NumberField`'s new `errorOut`; gallery example in `KnobStrip`) | "abc" in the amount box: page height **+23 before, 0 after** |
| A 23 px shift between foreign and Israeli indices (G8) | The steady-dollar line keeps its place, empty, on an Israeli index | The cost title is at y 911 on all 7 indices (before: 862 on foreign, 839 on Israeli) |
| Cut figures on large plans (G5) | The change chart's value margin is sized from its widest label, fading labels included. The stairs margin likewise, with "M" for millions on a phone. The account list's figure column is 7.5rem on a computer and 6.5rem on a phone, with the kit's new `figureFit` stepping the size down past 8 or 9 digits. The tile figure steps down on a phone at a held height. The cost beside each bar is as wide as the longest in the list. The compact box is 152 px and holds "50,000,000". The fund list has a fixed figure column on a phone. The year bars keep room for the last label. | Plans 500,000 / 10,000 / 40 / 12%, 1,000,000 / 10,000 / 30 / 7% and 50,000,000 / 100,000 / 40 / 12%: **CUT and page-wider lines go from 40 before to 0 after** on a computer, apart from the phone case under "Not fixed" |
| Agorot while figures glide (G9) | `Num` glides through whole shekels when the figure lands on whole shekels | Every frame sampled during three slider moves: **977 frames with agorot before, 114 after**. All 114 are one fee per trade, sourced at 3.16 ₪, which has agorot of its own |
| The stairs' 4 px change (D14) | Both stairs cards hold their tallest height on the index (`useHeldHeight`). The no-price reasons are held at their longest case over every account (B4b). | Account picks: the stairs section 1,715 then 1,669 before; unchanged after |
| (found in passing) The plan line lost a line when a first number was entered, on a phone | The line is held at its longest case | Amount slider at max on a phone: −18 then 0 |

**The tools.** `research/audit/tools/box-check.mjs` gains two flags. `--plans` types whole plans, past the slider ends too,
then "abc" and "-5". It lists every figure cut by its box and every chart label outside its chart. `--switch` presses every
index chip. `jump-check.mjs pc /indices/sp500` gives the same result before and after: 80 controls, and 2 grey account rows
that move into the list when picked, which is by design.

**Speed.** I timed each slider from its input event to the painted frame, 12 moves each. The median is 17 to 22 ms and the worst
is 29 ms. Before the branch the figures were 16 to 21 ms and 27 ms. All are under 100 ms.

**Shots.**
- `before/after-07-error-pc.png` and `before/after-07-error-phone.png`
- `before/after-07-large-result-phone.png`
- `before/after-07-large-accounts-pc.png`
- `before/after-07-large-change-pc.png`

**Not fixed. Found while measuring, and present before the branch:**
- **Return at 0%.** The page's own pair moves to a foreign fund, and the lists change height: +28 on a computer and about +450
  on a phone, the same as before the branch. This is the page's unpicked pair following the plan, not a held block.
- **The "מה הכי משנה" table on a phone.** With a plan typed past the sliders (50,000,000), its 10-digit figures run past their
  columns inside the table's scroller.

## 8. Wording

**The year count.** One helper in `copy.ts`, used by `yearsSpan` and `inYears`, writes "שנה", "שנתיים" or "N שנים", and
"בשנה אחת", "בשנתיים" or "ב־N שנים". The tiles, the cost title, the account line and the dollar card now read "בעוד שנה" and
"בשנה אחת".

**Internal ids.** A US fund now shows its ticker, for example "VOO" or "IVV", through `numberOf` in `lib/invest.ts`. It never
shows the record id.

**The fee source sheet.**
- `mostlyHebrew` now also needs a Hebrew first word. The English note "Trustee fee (שכר נאמן): p. 1 '…'" no longer shows. It
  stays in the data.
- A Maya citation inside a Hebrew title now reads "(דיווח במאיה ⁦1725200⁩)", through `hebrewCitation` used by `shownTitle` and
  `sourceLabel`. The data keeps its own words.
- Both have tests.

**Rule ids and "המנוע".**
- The foot now reads "המספרים מחושבים מהנתונים של היום."
- A rule chip that stands alone in reader text now shows its Hebrew title before the id, through `IdRef` and `RuleRef` with
  `titled`. This applies to ETF-75 in the dollar card and to the label sheet's "מקורות".

**Monthly deposit of 0.**
- The deposit line reads "סכום חד־פעמי, בלי הפקדה חודשית".
- The standing-order note becomes "בלי הפקדה חודשית אין קנייה בהוראת קבע…", in one held slot.
- The "מחיר להוראת קבע" tags go, on both account lists.
- Shots: `after-08-monthly0-result-pc.png` and `after-08-monthly0-accounts-pc.png`.

**Inflation.**
- The button reads "אינפלציה 2% בשנה", in blue ink once the reader enters a value. It is not a `Num`, because a button cannot hold
  the figure's own button. The value's source is in the dialog it opens.
- The button's height is still 36 px, as before the branch.
- Shot: `before/after-08-plan-pc.png`.

**The return.** The plan line says "התשואה לפני אינפלציה, דמי ניהול, עמלות ומס". `docs/method.md` defines A-01 as the exposure's
gross annual return, with fees, tax and inflation computed apart.

**Cost column head.** "מה החשבון גובה ב־N שנים" now sits over the bar and its figure in every layout. In a narrow list, where the
bar is on its own line, the head is on its own line too. Shot: `after-03-accounts-pc.png`.

**Dates.**
- The footer reads "הנתון האחרון באתר נבדק ב־05.11.2026". It is the newest `checked` date across `data/`, which is not the date of
  any one page's prices.
- The account card reads "התעריפון ↗ · נאסף ב־04.11.2026".
- The account list reads "התעריפונים נאספו בין … ל־…", from its snapshots.
- Shot: `before/after-08-footer-pc.png`.

## New and changed strings

Every string below went through the Hebrew review (the hebrew-content-writer skill) before the last commit. Four were reworded by
it: `tieWhy`, `elsewhere`, `startExample` and `brokerSub`.

| Key | Old | New |
|---|---|---|
| `site.footerAsOf` | נתונים נכון ל־ | הנתון האחרון באתר נבדק ב־ |
| `provenance.maya` | | דיווח במאיה · פורסם · דף הקרן במאיה · מאיה |
| `customEntries.brokerSub` | …שדה ריק נחשב אפס. | …שדה ריק הוא מחיר לא ידוע, והחשבון לא ידורג עד שתמלאו אותו. עמלה שלא גובים מכם: כתבו 0. |
| `customEntries.brokerStart` | | בחרו את הבנק או בית ההשקעות. מתחילים מהתעריפון שלו ומשנים רק את המחירים שקיבלתם. |
| `customEntries.basis` / `basisNone` / `basisNotListed` | | על בסיס / בחרו / בנק או בית השקעות שלא ברשימה |
| `customEntries.incomplete` | | חסרים מחירים, ולכן החשבון לא מדורג. השלימו אותם בעריכה. |
| `customEntries.unknownLine(list)` | | לא הזנתם, ולכן לא ידוע: {list}. |
| `plan.knobs.othersAt(pct)` | (אינפלציה) | אינפלציה {pct} בשנה |
| `plan.knobs.retBefore` | | התשואה לפני אינפלציה, דמי ניהול, עמלות ומס |
| `pair.paidInOnce` | | סכום חד־פעמי, בלי הפקדה חודשית |
| `pair.left(y)` | נשאר לכם בעוד {y} שנים | נשאר לכם בעוד {שנה / שנתיים / y שנים} |
| `pair.costTitleBoth(y)` | כמה זה עולה לכם ב־{y} שנים, … | כמה זה עולה לכם {בשנה אחת / בשנתיים / ב־y שנים}, … |
| `pair.colCharges(y)` | מה החשבון גובה ב־{y} שנים | מה החשבון גובה {בשנה אחת / בשנתיים / ב־y שנים} |
| `pair.vsCheapest` | | לעומת הזוג הזול ביותר |
| `pair.openTop` | | הזוג שמשאיר הכי הרבה, בלי דירוג |
| `pair.tieTop` | | אחד משני הזוגות הזולים ביותר לתוכנית שלכם |
| `pair.tieWithNext` | | שקולה לזוג הבא בתור |
| `pair.firstPair` / `vsFirst` | | הזוג הראשון / לעומת הזוג הראשון |
| `pair.gapLeadFirst` / `gapLeadCheapest` | | העלות בזוג הראשון / הזול ביותר, לעומת הזוג הבא בתור: |
| `pair.tieWhy` | | ההפרש קטן מכדי לקבוע איזה זוג זול יותר, ולכן שני הזוגות שקולים. |
| `pair.tieTag` | | תיקו |
| `pair.collectedOn(d)` | | נאסף ב־{d} |
| `pair.collectedSpan(a,b)` | | התעריפונים נאספו בין {a} ל־{b}. / התעריפונים נאספו ב־{a}. |
| `pair.noMonthly` | | בלי הפקדה חודשית אין קנייה בהוראת קבע, ולכן כל החשבונות מחושבים במחיר הרגיל. |
| `pair.elsewhere` | בקרן אחרת, | בחירה בחשבון הזה מעבירה גם לקרן |
| `pair.elsewhereLeft` | | ונשארים |
| `pair.notPossibleWhy(kind)` / `notPossibleAny` | | לפי המסמכים של החברה, אי אפשר לקנות שם {kind} / קרן על המדד הזה. |
| `pair.pickMoves(h)` / `movedHouse(h)` / `moveBackTo(h)` | | בחירה בה מעבירה את החשבון ל{h} / החשבון עבר ל{h} / חזרה ל{h} (with "ל־" before a Latin name) |
| `pair.movedFund` / `moveBack` | | גם הקרן הוחלפה. / חזרה לקודמת |
| `foot.engine` | המספרים מהמנוע, על הנתונים של היום. | המספרים מחושבים מהנתונים של היום. |
| `stairs.nowExample` / `hereExample` | | לדוגמה / נקודת התחלה לדוגמה: |
| `stairs.startExample` | | עוד לא בחרתם קרן וחשבון, ולכן המדרגות מתחילות מקרן ומחשבון מאמצע הרשימות. בחרו ברשימות למעלה, והמדרגות יתחילו ממה שבחרתם. |
| `stairs.startPicked` | | המדרגות מתחילות מהקרן ומהחשבון שבחרתם ברשימות למעלה. בחירה אחרת שם מתחילה אותן מחדש. |
| `stairs.rowHead.versusExample` | | לעומת הדוגמה |
| `dollar.cancelsStretch(h,…)` | בממוצע של {h} שנים רצופות: … | בשנה אחת: … / בממוצע של {שנתיים / h שנים} רצופות: … |
| `dollar.cancelsNoStretch(h)` | עוד אין נתונים ל־{h} שנים רצופות. | עוד אין נתונים לשנה אחת. / לשנתיים רצופות. / ל־{h} שנים רצופות. |
| `kit uses.MixedName` | | שם של קרן או חברה בתוך שורה בעברית… |
| `kit uses.KnobStrip` | …אחד בטלפון. | …אחד בטלפון. מספר שלא עובר בדיקה מקבל את ההודעה שלו מתחת לשם השדה, במקום כפתור האיפוס, כך שהשורה לא גדלה. |

## Stopped on, or left

- **Product decisions.** None were needed.
- **The il-finance reference file** still holds the malformed names (see item 1). It is for its owner.
- **Item 6.** The reasons stay in one block, not on each row (see item 6).
- **Item 7.** Two cases found during measurement are not fixed: return at 0% and the phone table at typed plans (see item 7).
- **Inflation button.** Its height stays 36 px, under the 44 px target. This was true before the branch.

## Checks

- `npm run check` passes: 106 test files and 1,605 tests, plus the data validation and the build.
- `merge-review.mjs main` output is pasted below.

### Structure review

```
51 files changed, 50 of them code or docs (more than 30: add an independent reviewer).
New component outside the kit (11): PlanBlock, Terms, BrokerPanel, NoFundAccountColumn, CostBar, PairResult,
  AccountColumn, FundColumn, StairsSection, IdRef, RuleRef
Hebrew outside copy.ts (1): site/app/lib/source-label.ts:23 mostlyHebrew
New kit piece (1): MixedName
```

**Verdict on each item.**
- **Kept, the 11 components.** All of them existed before this branch and were changed, not created. They are the page's own
  sections, and `IdRef` and `RuleRef` are the provenance chips, which gained `titled`.
- **Kept, the Hebrew in `source-label.ts`.** It is a Unicode range in a test for Hebrew letters, not words for the reader.
- **Promoted, `MixedName`.** It is in the kit with a gallery entry and a ratchet.
- **Also added to the kit, `figureFit`.** It is in `pick-list.tsx` with tests.
- **Sent back.** Nothing.
- **Independent reviewer.** The branch has more than 30 files, so it needs one. That is for the lead.
