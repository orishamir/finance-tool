# Indices page: what the houses advertise against their price lists (issue 181, D57)

Builder's brief, 2026-11-04. Read `CLAUDE.md` first: the kit-first rule, "nothing moves", the structure review, full words, no how-to steps, no feminine Hebrew.

## What the founder asked for

The indices page's rows show only what each house's price list allows, with no caveat on any row. One block on the page says what the site found when it read the houses' advertising against their binding documents: for example Psagot's "פטור מלא מדמי ניהול ללא הגבלת זמן" against its price list's custody of 0.12% a year. The block also says that a better price can often be had by negotiating with the house, and that a price someone got can be added as their own broker on the same page (the existing "add a broker" control, `AddEntryButton kind="broker"` in `site/app/components/invest/custom-entries.tsx`), where it is compared like any other. It gives no steps for negotiating. Decision D57 in `docs/product.md`; the pricing rule behind it is D56.

## The findings: data, never typed into the page

The findings are in `research/2026-11-04-binding-prices/`: one report per house (or pair). Each has a claims-and-verdicts table, and the later ones end with a list of contradicted advertising. Use these verdicts:

- **contradicted**: a binding document prints the fee the advert says is not charged (Psagot's custody, IBI's custody, a conversion fee where the advert says "ללא עמלות המרה");
- **offer**: the advert reads as for everyone, but the binding terms give it only to some customers, or for a time, or let the house withdraw it (Altshuler Trade's and Meitav Trade's exemptions);
- **not found**: no binding document says it at all.

A claim the documents guarantee is not a finding and is not shown. Show a finding only when it is about a fee this page counts (buying and selling, custody, handling or account fees, conversion, a standing order); leave out slogans that name no fee ("רבע מעמלות הבנקים") and offers for one profession or community. The reports: `psagot.md`, `one-zero.md`, `ibi.md`, `leumi.md` (also Pepper), `altshuler-trade.md`, `meitav-trade.md` (the first round, verdict tables only; `review.md` is the independent check of those six), then `discount-mercantile.md`, `fibi-massad.md`, `hapoalim.md`, `mizrahi-tefahot.md`, `jerusalem.md`, `yahav.md`, `excellence.md`, `interactive.md` (each ends with a list of contradicted advertising). Where a report's verdict and the house's record disagree, the record wins and you say so in your report.

Already on the page since 2026-11-04: each house's group or joining-offer note under its row opens with a "לא בחישוב" tag (`GroupLine` in `site/app/components/invest/pair.tsx`). Leave it as it is.

1. **Schema.** Add an optional `advertising` array to the fee record (`packages/schema/src/collections/fees.ts`, documented in `docs/data-schema.md`), one entry per finding. Proposed fields; improve them if the reports need it:
   - `claim_he`: the advert's own words, exactly as printed;
   - `claim_source`: `{ url, title, seen }`, the page where the advert stands and the date it was seen;
   - `verdict`: `"contradicted" | "offer" | "not_found"`;
   - `binding_he`: the binding document's own words that differ (empty for `not_found`);
   - `binding_source`: `{ url, title, page?, row?, dated, checked }`, with `dated` the document's own date (printed, or the file's date) as the report gives it;
   - `fee`: which fee it is about (custody, handling, conversion, trade and so on), so the block can name it in words.
   Export the JSON Schema again (`packages/schema/json/`).
2. **Fill it** for every house whose report has such a finding, from the report. Before writing a quote, confirm its words in the document's copy in the library (`node research/library/library.mjs find <words>`; files under `research/library/store/`) or on the page itself; a Hebrew PDF's text can come out reversed. Do not change any other field of the records: prices, availability, groups and left_out stay as the researchers left them.
3. **Guards.** In the validator (`packages/pipeline/src/validate.ts`): a `binding_source` must be a binding document (the house's price list, terms, fee annex or promotion terms); `contradicted` and `offer` need `binding_he`. A test beside the group-prices one in `packages/pipeline/test/price-premises.test.ts` that the page's calculation never reads `advertising` (the engine and `site/app/lib` stay blind to it, as they are to `groups`).

## The block

- Where: on the indices page, near the houses and the group-prices block (`GroupPrices` in `site/app/routes/invest.tsx`). Choose the place a reader comparing houses meets it; say why in the report.
- What: a short heading and one or two plain sentences, then the findings house by house: the house, the fee, the advert's words with a link to where they stand, the binding document's words with a link to its page, and the verdict in words (a label chip, never colour alone). Then the sentence about negotiating and the sentence about adding one's own broker, with the existing add-a-broker control.
- Build it from the kit (`site/app/components/kit/`, gallery at `/kit`; `docs/design-system.md` section 11). `site/app/components/invest/groups.tsx` is the nearest model: the same table on a desktop and one row per house on a phone, the same source links. A new pattern goes into the kit with its gallery entry.
- With about a dozen houses the findings are long: a visible heading and lead, and the house-by-house findings folded (as `GroupPrices` folds its list) with the count in the opener.
- Hebrew in `site/app/copy.ts` only, plural or impersonal, full words, no process language (no decision ids, no "D56"). Read each new sentence as someone who knows only the page: true of the method is not enough, it must be understood. The lead will have a Hebrew editor review your strings after you finish; list every new string in your report.
- Nothing on the block depends on the page's inputs; it must not move when an index, slider or field changes. Check it with the box-comparison script the other invest blocks use.
- Check on PC and at 390 px, 44 px touch targets, nothing that depends on hover. Take screenshots of both and look at them before reporting (a word alone on a line, a link that wraps badly).

## Finish

`npm run check` passes. Run `node research/audit/tools/merge-review.mjs <base>` and put its list in the report. Do not commit. Write `research/specs/2026-11-04-advertising-block/report.md`: what was built, the records filled (house, verdict, fee), the screenshots' paths, the merge-review list, and anything the founder must decide. Final message to the lead under 200 words.

## Amendment (founder, 2026-11-04, sent to the builder mid-build)

"also improve upon https://orishamir.github.io/finance-tool/companies/513173393?product=brokerage and each company's brokerage account page, thats where the detailed information should be". The indices-page block becomes short (the finding in plain words with at most one named example, negotiating, adding one's own broker, and each house with findings as one entry linking to its brokerage-account page). Each house's brokerage card (`brokerage-card.tsx`, on company pages and bank pages) gains: who the price is for, what can and cannot be bought there with the reason, each fee line with where it stands and "not limited" where so, the advertising findings with both sources, and the offers and group prices (the `groups.tsx` rendering, shared rather than copied). `left_out` stays data only.
