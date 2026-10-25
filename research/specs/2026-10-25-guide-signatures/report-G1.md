# Report G1 (Sonnet, medium), 2026-10-25

Saved by the lead from the builder's final message.

REPORT G1. Typecheck, `npx vitest run site packages/engine` (753 pass) and `npm run validate` are green. Not run: `npm run check`, the site build, a browser or phone-width check (the visuals were only server-rendered in vitest), no commit. Nothing was seen on screen: the layout and the 44 px / 390 px behaviour are unchecked, and the 390 px SVG layouts are the likeliest place for label collisions.

## What was built
- **Frame.** Section id `different`, titled "מה מייחד את {שם}", sits after "למה משתמשים בזה" and before "שווה לדעת". It shows the question, the visual in a card, the nearest-alternative line (link to its guide page and to /goal/compare), and the old timeline folded as "שחקו עם המספרים שלכם". A page with no visual (brokerage account, child savings, IRA pages) keeps the timeline open in "מה זה", as you said. The renewable fund has no run (G-30), so it keeps the no-graph line in "מה זה" and shows only the visual.
- **Registry for G2.** Visual components: `signatureRegistry` in `site/app/components/guide-signature/index.tsx`. Page data: `builders[wrapperId]` in `site/app/lib/guide-signature.server.ts`. Page names, questions and alternatives: `guideSignature.pages[id]` in copy.ts. The loader merges the rules a builder cites into the page's rule map.
- **Timeline fixes on the seven cash-like pages.**
  - The field reads "ריבית בשנה" and edits `cash_rate`, kept per page in the own-rates store under goal id "guide".
  - A typed A-01 is ignored there and no longer draws the dashed line.
  - The bank deposit, savings plan and current account run on the record's published rate. Today that is 1.8%, 1.5% and 1.0%; the hint says "נכון ל־25.10.2026".
  - The current account applies its 10,000 ₪ ceiling, which is dropped when the person enters a rate.
  - The current account's fee row and table cell read "לא תלויים ביתרה".
  - Makam, bond and the money-market funds stay on the 3.5% site assumption, shown with the "פרמטר של האתר" tag.
- **Engine.** I added `bondPrice` (price per 100 after a rate change, a dated note under F-25 in docs/method.md). The F-67 note covers the cash-page changes, and no new F-ID was added. `runAtMonths` in `site/app/lib/guide-signature.ts` stops a ledger run after m months.
- **Other shared changes.**
  - `site/app/lib/engine.ts`: `p05Value` no longer tags a bank's rate as a site parameter.
  - `site/app/theme.css`: a new token `--chart-alt` (gold-200).
  - copy.ts: a new `guideSignature` block, plus timeline strings (`cash_rate` labels and hints, `enteredRateCaption`, `feesIndependent`, `perMonthCash`, `balanceCeiling`) and a "different" entry in `guide.sections`.

## Files
- Components: `site/app/components/guide-signature/` has `index.tsx`, `kit.tsx` (shared marker that responds to drag, axis tap and arrow keys; the guide-inputs hook; `GainBars` bracket) and one file per visual: `current-account`, `bank-deposit`, `savings-plan`, `money-market-daily`, `money-market-renewable`, `makam`, `government-bond`.
- Libraries: `site/app/lib/guide-signature.ts` (types and models), `guide-signature.server.ts` (builders), `guide-signature-bundle.server.ts` (the shared bundle builder, moved out of guide.server.ts).
- Edited: `site/app/lib/guide.server.ts` (signature data on the page), `site/app/routes/guide.tsx`, `site/app/components/timeline/Timeline.tsx`.
- Tests: `site/app/lib/guide-signature.test.ts` (each visual's numbers equal an engine run, plus the timeline fixes), `site/app/components/guide-signature/render.test.ts` (server render of all seven visuals), and `packages/engine/test/bond-price.test.ts`.

## Figures on P-05's defaults (10,000 ₪ now, 10 years, 3.5% assumption)
- **Current account.** In today's money after 10 years: account 8,897.60 ₪ (1%, up to 10,000 ₪, conditions met), daily fund 10,982.07 ₪, cost of leaving the money about 2,084 ₪. Without the conditions the account holds 8,203.48 ₪ and the cost is 2,778.59 ₪. The timeline's old default run (10,000 ₪ now plus 500 ₪ a month) now ends at 63,375 ₪, as the sweep predicted.
- **Bank deposit.** 12 months, 1.8%, break not allowed. The deposit pays out 10,153 ₪ and the fund 10,294.72 ₪ at the end, a gap of 141.72 ₪. The fund pays 10,146.25 ₪ if taken out at month 6; the deposit gives nothing before month 12.
- **Savings plan.** 12 deposits of 500 ₪, 36 months, 1.5%. One deposit is worth 519.41 ₪ when it unlocks, and the last one unlocks in month 47. At month 40, 5 deposits are free (2,597.07 ₪) and 7 are locked (3,500 ₪).
- **Ladder.** Rates 1% (up to 10,000 ₪, conditions), 3.5% (daily fund, assumption), 3.5% (renewable fund, assumption), 1.8% (one-year deposit, 12 months).
- **Renewable fund.** Series date 16.11.2026, 22 days from today. After it, the next date is no later than 16.11.2027 (MF-08, at most 12 months between dates; 36 months with the authority's approval).
- **Makam.** At 3.5%, the purchase price is 96.62 per 100, rising to 100 at month 12. A sale at month 6 prices at 98.29 and shows a gain of 173.18 ₪ before tax and fees, 25.98 ₪ tax (TXI-12) and 36 ₪ fees. It leaves 10,111.21 ₪. At redemption the tax is 52.41 ₪ (TXI-11) and the net is 10,278.96 ₪.
- **Bond.** CPI-linked, one coupon a year (GOV-11), coupon 3.5% (assumption), 10 years. A 1-point rise gives a price of 92.09 (−7.9%) against −0.96% on a makam, so a sale today brings 9,208.73 ₪. Holding gives back 10,000 ₪ plus 3,500 ₪ in coupons.

## "עוד לא חושב", and why
- **Deposit break.** The Leumi records say "אין אפשרות שבירה", so there is nothing to compute. Any other penalty kind would show the bank's words and "עוד לא חושב" (the engine does not model a break, G-16).
- **Savings plan, per-deposit lock.** No source says whether each monthly deposit has its own lock (BANK-OQ12). The ladder is the site's F-22 reading, flagged in a caution box that also mentions the other reading, a whole plan opening at an exit point counted from its start.
- **Renewable fund, dates after the series.** The data holds one series date, read from the fund name, and no schedule. Later dates and the renewal period live in the fund agreement and prospectus, which block automatic reading.
- **Daily fund payout.** Business days from the sell order to cash in the account are unknown (MF-OQ4).
- **Makam tax block.** If the makam run is blocked by an open rule, the visual shows that instead of a number.
- **Card-charge figure.** The 7,000 ₪ condition is read from the rate's notes by a pattern. If the notes change, the figure drops out and the visual says so.

## Open points
1. `--chart-alt` (gold against teal) is new and I did not re-run the all-pairs colour validation. It needs a line in docs/design-system.md.
2. The seven new visuals need a check on a real phone and at 390 px. I did not review them by eye.
3. Finding 6 of the sweep (the today's-money contributions line, F-06) is untouched; it was not in section 4.
4. Reading of the 100–10,000 range in the savings-plan record: the table does not say it is per deposit, and the page says so.
5. The startup input hook gives priority: guide-typed value, then the saved goal, then P-05. The source (הזנתם / מהמטרה השמורה / דוגמה של האתר) is printed under the controls.
6. The "years" slider on the bond page is local state and does not write the shared field.
7. docs/copy.md section 10 was not touched, and several strings are mine and need the Hebrew editor's pass. Examples: "נקודות אחוז" (not singular-aware), "שחקו עם המספרים שלכם", and the Callout wording.
8. The product term "פרמטר של האתר" tag is how the assumption is marked, backed by an explicit sentence on each page.

## Doc text for the lead
- **product.md, D29 status:** "Built 2026-10-25 for current account, bank deposit, savings plan, daily and renewable money-market funds, makam and government bond. Study fund, provident for investing and the pension pages are G2's. The timeline is folded under 'שחקו עם המספרים שלכם'. Brokerage, child savings and the IRA pages keep it open."
- **design-system.md:** "Token --chart-alt (gold-200): the nearest alternative's line or bar in a guide page's two-series drawing. Product teal, alternative gold, starting amount a dashed neutral line, a gap filled at 22% opacity with its number written on it. A draggable marker is a slider laid over the plot (drag, tap on the axis, arrow keys, Page Up/Down, Home/End)."
- **method.md:** the F-25 and F-67 notes are already in.
- **Data gaps:** the renewable fund's dates, the deposit break penalty for banks other than Leumi, the makam sale tax split, and the MF-OQ4 payout days are the gaps feeding "עוד לא חושב".
