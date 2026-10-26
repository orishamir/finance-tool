# Report: the index page, broker first (2026-10-26)

Changes: data layer (`lib/invest.ts`: every fund priced at every house, `houses`, `worth`), new `components/invest/houses.tsx`, rewritten `funds.tsx`, `sections.tsx` (Matters, WorthBars, OptionsCompare), `parts.tsx` (OptionTag), `chips.tsx` (HouseSelect, pillName), route, copy, method.md F-63 "worth lines", tests, ratchet (sections.tsx card leftover removed). `grid.tsx` deleted.

Lead's later changes included: the two lines measured as slices through the headline's cell, "חשבון ניירות ערך" wording, manager line, pills without "מדד", Maya fund-page link (ETF and tracking fund only).

Shots in `shots/` (1280 = -d, 390 = -m): index-ta35, index-sp500 (parts), bank-houses/bank-funds (account = Mizrahi), click-leumi, foreign (+ foreign-funds), folds (all three open), fundcard (Maya link beside the security number).
Tools in `tools/`.

Open: the "almost every fund is sold at each house" half-sentence was dropped (data shows tracking funds sold at only some houses; no rule says it). Foreign brokers on S&P show a broker cost only (abroad funds not priced yet). Israeli index: foreign brokers listed under "cannot compute".

## Structure review (lead, 2026-10-26)

`merge-review.mjs main`, first run on 5a26a5f (14 code or docs files, no second reviewer needed), second run on 71be0d7 (19 files).

**Sent back, fixed in 71be0d7:**
- the gaps' sheet labels in `invest.ts` still said "בית השקעות אחר": moved to `copy.ts` with the account wording;
- `HousesSection` and `FundsSection` hand-built their heading: now the kit's `Section` (`level="card"`);
- the house rows used the long legal names: `ProviderLink short`;
- fund names starting with Latin letters aligned left inside a flex column: wrapped in a span;
- scratch files deleted.

**Promoted:** `HouseSelect` became the kit's `SelectField` (`kit/fields.tsx`, gallery, design-system section 11). A `select` ratchet lists the four raw selects left (`workbench/funds/controls.tsx`, `playbook/strip.tsx`, `compare/why.tsx`, `holdings/fields.tsx`).

**Kept:**
- `HouseItem`, `FundRow`, `FundList`, `FundsSection`, `HousesSection`, `NoWay`, `FeeValue`, `Matters`: this page's assemblies of kit pieces (`Card`, `RankBadge`, `Tag`, `KeyValue`, `Sentence`, `Tpl`, `Disclosure`, `Section`).
- `WorthBars`, `OptionsCompare` and `OptionCard`: today's worth bars and option cards, moved into folds unchanged.
- `Figure`: a label and figure that is a row on a phone and a column on desktop, used only in the house rows. It is a candidate for kit round 2's ranked-row piece, together with the fees page's and workbench's provider rows.
- `OptionTag`: built on the page's existing `LabelChip`. Kit round 2's Tag variants will take the clickable tag (the builder's request).
- `pillName`'s `מדד` and the `מדד ${typed}` lookup: they match the data's index names and are not shown as words.
- The Maya and source links (`text-link … IconExternal`): the existing hand-written external-link pattern. Kit round 2's TextLink will take it.

Screenshots compared with the gallery: cards, rank badges, tags, the select and the segmented control match their gallery states. Nothing left to send back.
