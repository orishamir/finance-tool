# Build spec: what makes each product different (guide pages), 2026-10-25

Decision D29 in `docs/product.md`. The founder, 2026-10-25: "start building the rest of the visualizations you suggested. i think it would be best to have them on the live site and then when i have time ill look at each, mostly for understanding the thing myself". The visuals are for him to learn from as much as for friends, so each one must explain itself without the chat around it.

Background: `research/discovery/2026-10-25-guide-pages-sweep.md` (what the old chart gets wrong). Founder's rules for charts: below, section 2.

## 1. Where it goes

- The fixed skeleton of the guide page stays (`site/app/routes/guide.tsx`, sections in `copy.ts` `sections`).
- A new block, titled "מה מייחד את {המוצר}" (wording to fit the copy guide), sits directly after "למה משתמשים בזה" and before "שווה לדעת". Full width of the content column. One visual per product, from section 3.
- The old illustrative timeline (Timeline.tsx and its assumptions panel) moves below the new block, collapsed by default, as "שחקו עם המספרים שלכם" (wording to the copy guide). Opening it shows it as today, with the fixes in section 4.
- A page without a visual in section 3 keeps the old timeline open where it is now (brokerage account, child savings, IRA study fund, IRA provident).

## 2. Rules for every visual (the founder's, 2026-10-25)

1. **One question per product.** One or two controls, two to four figures, one chart or drawing. It must make sense to someone who has never heard of the product.
2. **Name the holding.** A container (study fund, provident fund, pension) has no cost or result of its own without a named track or fund. Say on screen what it holds; the nearest-alternative contrast holds the same thing in another container.
3. **Exact vs range.** What is the same everywhere (tax mechanics, locks, exemptions) is exact. What depends on the institution (a bank's rate, a fund manager's fee) is a range across the collected institutions by default and the person's own number once they pick theirs. While only one institution is collected (today Leumi for deposits and the current account), say so on the visual ("לפי הפרסום של לאומי; בנקים אחרים עוד לא נאספו") and build the bank choice so more records slot in.
4. **Fills only when they mean a number.** A faded area only for a gap, a range or a stacked part, and the number is written on it. No decorative fill under a single line.
5. **Ceilings are not rates.** Where a figure is "up to" (25% tax, a fee cap), show what it depends on, from the rule base.
6. **Show the difference as a difference.** Two values with a bracket or bar between their ends and the difference on it; never a third box that reads like a third option (the founder misread one).
7. **Every number** goes through `Num` with its state (sourced, computed, entered). Figures come from the engine and `data/`, never from the sketches. A figure the site assumes (P-05's 3.5% `cash_rate` for money-market funds, makam and the bond, D20) is labelled as the site's assumption. Never fill a financial or tax rule from memory: read `.claude/skills/il-finance` and the rule records; a rule that's missing is named on the page as "עוד לא חושב" with the gap, not guessed.
8. **Design system.** Tokens only, logical properties, chart colours from `docs/design-system.md` (teal value, orange fees, rose tax, neutral contributions; blue and violet are never series colours; direct labels; time left to right). Controls are 44 px touch targets; a draggable marker also works with a tap on the axis and with the keyboard (arrow keys). Works at 390 px wide.
9. **The person's own values.** Start from the saved goal or the guide inputs when present (amount, monthly, years, age, employment), else P-05, and mark which.

## 3. The visuals

| Page | The question | The visual and its controls | Nearest alternative (same holding) | Builder |
|---|---|---|---|---|
| Current account | What does money cost me while it sits there? | Balance and years controls; a switch "אתם עומדים בתנאים של הבנק" (the record's rate up to its `amount_range.max`, and the conditions from the record's notes; without the conditions, no interest). Two lines in today's money (the account, and a daily money-market fund) with a dashed line at the starting balance; the gap between them filled and labelled "המחיר של להשאיר". Figures: the account, the fund, the cost | Daily money-market fund | G1 |
| Bank deposit | What do I give up by locking the money? | A draggable "when you need the money" marker on the deposit's term (the record's `term_months`). At the end: the full rate; before: what the record's break terms give (its `break` field; if the terms aren't computable, show the bank's words and "לא חושב"). Beside it the daily money-market fund, available any day | Daily money-market fund | G1 |
| Savings plan | When can I take my money out? | A ladder: each monthly deposit as a small bar with its own unlock date (term from the record; exit points from `exit_points`). A draggable date shows how much is free without losing interest and how much is still locked | Bank deposit, one lump sum | G1 |
| Daily money-market fund | How fast can I get my money, and what does it pay? | A ladder of cash products by how fast the money comes back (same day, next business day, at a fixed date, at the end of a term) against what each pays, this product highlighted; each yield with its state (bank's published rate, or the site's assumption, D20) | The current account and a one-year deposit, on the ladder | G1 |
| Renewable money-market fund | When can I leave? | A timeline of the fund's fixed exit dates (from its record and rules); a draggable "when you need it" marker shows the next date and the wait | Daily money-market fund | G1 |
| Makam | What happens if I sell before redemption? | The price climbing to 100 at redemption at the assumed yield (P-05, labelled); a draggable "sell on day X" marker shows the price and the gain so far, and the tax on it (rules TXI, GOV) | One-year deposit | G1 |
| Government bond | What happens to the price if rates move? | A control "rates change by X percentage points" (−3 to +3) shows the price change today if sold, against "hold to the end and get what was promised"; the bond's terms from the series P-05 names (GOV-11) | Makam (short) | G1 |
| Study fund | What does the 6-year lock buy me? | The draggable year on a 12-year timeline (locked to year 6, exempt after); two bars, the study fund and a brokerage account holding the same index, with the difference on a bracket; salaried vs self-employed from the guide's employment (the employer's share for salaried, its rules) | Brokerage account, same index | G2 |
| Provident fund for investing | What are my ways out? | A draggable "age you take the money" marker: before 60 a lump sum with tax on the real gain; from 60 a fork between a lump sum (taxed) and a monthly pension (tax-exempt), each with its figure (rules TXK) | Brokerage account, same index | G2 |
| Comprehensive pension, general pension, provident fund for a pension | Where does each shekel of the deposit come from, and what does it buy? | A salary control; a stacked bar of the monthly deposit (you, your employer, severance) with the tax credit that returns part of yours, then the monthly pension it buys at retirement from the engine's run; the comprehensive pension also shows its insurance slice (A-17 is entered by the person, so it is a control or "לא חושב") | none (required for salaried people); say so | G2 |

## 4. Fixes to the old timeline (from the sweep)

On the cash-like pages (current account, deposit, savings plan, money-market funds, makam, bond): the field reads "ריבית בשנה" and edits the rate the run actually uses, kept per page; the deposit-family pages run on the record's published rate with its date (A-21); the current account applies its ceiling and its fee row says the account's fees don't depend on the balance. The design of the reverted fix is in the sweep note; the engine's `balanceCeiling` already exists. Market pages keep "תשואה בשנה" (A-01).

## 5. Ownership

| Builder | Owns | After |
|---|---|---|
| G1 (Sonnet, medium) | `site/app/components/guide-signature/**` (new: the shared frame, the registry by wrapper id, the G1 visuals), `site/app/routes/guide.tsx` (the slot and the collapsed timeline), `site/app/components/timeline/**`, `site/app/lib/guide.server.ts`, `site/app/lib/engine.ts`, `site/app/lib/guide-signature*.ts` (new), copy.ts blocks `guideSignature` (new) and the guide/timeline strings, method notes in `docs/method.md` (a dated note on F-67 and one formula note per visual that computes something new) | — |
| G2 (Sonnet, medium) | its own visual files in `site/app/components/guide-signature/` and their lib files, its entries in the registry, its strings in `guideSignature` | G1 |
| Lead | `docs/product.md`, `docs/design-spec.md`, `docs/design-system.md`, `docs/copy.md`, `npm run check`, smoke tests, commits | — |

Rules for every builder: run `npx vitest run site packages/engine`, `npm run typecheck`, `npm run validate`; never `npm run check` or the site build, never pkill, never commit. Copy edits only with exact-string Edit. Engine changes only if a visual needs a formula the engine lacks: write it as a formula with a method note, and say so in the report. Report as the final message.
