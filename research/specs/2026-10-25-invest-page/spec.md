# Build spec: "השקעה במדד" (v1), 2026-10-25

Approved by the founder on 2026-10-25: "for a first version of this, this is more than great. finalize the plan for it, then start using subagents to build it. for programming subagents use sonnet on medium effort".

The design, its reasons and the mockups' content are in `research/discovery/2026-10-25-sp500-routes-facts.md`, sections 8 to 10.9. Read sections 9.6 and 10.1 to 10.9 before you start. Product decisions: D18 note, D26 (exchange rates from the ECB), D27 (never recommend an index), D28 (this page) in `docs/product.md`.

## 1. What the page is

A new top-level page, "השקעה במדד", in the main menu after "מה כבר יש לכם". For an index the person chooses, or one they add, it answers:
- (a) what are my options for owning it;
- (b) which broker is cheapest for each option;
- the cheapest complete way (broker + fund) for the person's plan.

Address:
- `/invest` opens with no index chosen (D27). Its chips list the known indices; nothing is preselected.
- `/invest/:exposureId` opens one known index (pre-rendered for every exposure record).
- A custom index lives on the device and opens client-side at `/invest?custom=<id>`.

### Sections, top to bottom (mockup "index_page_full_sp500")
1. **h1** "איפה ואיך הכי זול להשקיע במדד, לאורך זמן" and a muted line "לפי התעריפון של כל בנק ובית השקעות ולפי הדוח של כל קרן".
2. **Index chips:** every exposure record whose kind is `equity_index`, then the person's saved custom indices (each with ×), then "אחר". The line beside them reads "הבחירה שלכם; האתר לא ממליץ על מדד" (D27).
3. **Plan chips:**
   - the amount, monthly deposit and years (from the saved goal, else P-05 marked as the site's);
   - "החשבון שלכם" (the person's current broker; optional, stored on the device);
   - the return (entered, else see §4.4).
   Under them: the dollar rate and its source and date (D26), and inflation.
4. **Index header:** the facts that hold for every way, once: name; Israeli or foreign; one line from `one_line_he`; for a custom index, "מדד שהוספתם, שמור במכשיר הזה" with "שינוי התשובה". Currency and region appear only as "לידיעתכם".
5. **Headline card:**
   - With fund records: "הדרך הזולה ביותר לתוכנית שלכם", the broker and fund, the value left in today's shekels, and, when the person's broker is known, "ב{ברוקר}, עם אותה קרן: X ₪ פחות".
   - Without fund records (custom index): "בית ההשקעות הזול ביותר לקרן ישראלית על המדד: {ברוקר}", the cost range, and why there is no full ranking.
6. **"מה כל בחירה שווה בתוכנית שלכם":** bars, each with its range:
   - the broker (max−min broker cost in the headline's option);
   - the fund (max−min value among funds at the best broker);
   - ETF against tracking fund (best of each);
   - "בארץ או בחו״ל" (the best Israeli option against the best abroad option).
   A bar that cannot be computed is dashed with its reason ("בחישוב", "אין רשומות").
7. **(א) The options,** one card per way of owning the index:
   - title;
   - the labels that hold for the option (§3);
   - how many funds the site holds in it;
   - its best broker and best fund with the value (or the broker cost alone when there is no fund);
   - "עוד לא חושב" with the reason when it can't run.
   Clicking a card selects it for section ג.
8. **(ב) Broker × option grid:**
   - rows are brokers, sorted by the cheapest cell; columns are options;
   - each cell is the broker's 20-year cost for that option in today's shekels, or "לא זמין" (sourced availability false), or "אין שורה בתעריפון", or "—" (option has no candidate);
   - green marks the cheapest cell per column;
   - the person's broker is highlighted;
   - the top rows are shown, with "עוד N בתי השקעות" to expand.
9. **(ג) The funds in the chosen option:**
   - rows: rank, name, the fund's fees (fixed, variable, trustee), labels, value at the option's best broker;
   - filters "בלי נטרול מט״ח / רק מנוטרלות" and "מה אומרות התוויות?";
   - "הפרש העקיבה של הקרנות עוד לא נאסף ונלקח כאפס" while it is not collected;
   - empty state for a custom index: "עוד לא נאספו קרנות על המדד הזה", with "לחיפוש במאיה" (Maya's fund search link) and "בקשו שנאסוף" (copies a request text, as flow 10).
10. **"מה עושים עכשיו":** three steps:
    1. open an account at the broker (or stay, with the difference);
    2. buy the fund by its security number (copy button), or for a custom index "בוחרים קרן במאיה לפי דמי הניהול";
    3. a standing order of the monthly amount.
11. **Footnote:** the return used and its state; "המספרים מהמנוע על הנתונים של היום".

The custom index flow (mockups "custom_index_one_question" and "index_page_full_custom_nikkei"):
- "אחר" opens a field with suggestions from known index names and aliases.
- A typed name that matches a known exposure selects that exposure.
- Otherwise there is one question, "החברות במדד ישראליות?" (כן/לא), with optional currency and region "לידיעתכם בלבד".
- Saving stores the index on the device. It shows as a chip and travels in the export file.

## 2. The options (routes) and where they come from

| Option id | Hebrew title | Exists when | Instrument class (tariff) | Funds |
|---|---|---|---|---|
| `il-tracking` | קרן מחקה ישראלית | always | `mutual_fund_units` | records with domicile IL and an open tracking-fund legal form |
| `il-etf` | קרן סל ישראלית | always | `etf_units` | records with domicile IL and an ETF legal form |
| `tase-foreign` | קרן חוץ בת״א | the index is foreign (ETF-31) | `etf_units` (bought in shekels on TASE) | records not IL with `trading_currency_on_tase` set |
| `abroad` | בחו״ל | the index is foreign | `foreign_securities` | records not IL bought abroad (UCITS, US ETF) |

- Israeli or foreign comes from the new exposure field `constituents_israeli`, or the custom index's answer.
- An Israeli index has only the first two options (ETF-51: Israeli funds on Israeli indices hold the shares; ETF-31: no foreign fund specialises in Israel).
- v1 shows one `abroad` card. Its funds say whether they trade in London or the US.

## 3. Labels

One system of labels, each with an icon and two or three words.
- Tones: neutral (fact), caution (asks something of you or a risk), open (rests on an open rule: lock icon).
- Colour never alone.
- Tapping a label opens a short sheet: one or two sentences, the rule chips, and a link to the term.
- Labels are defined in one module, with id, text, icon, tone, explanation and rule ids, and computed from records, never typed per row.
- **Row labels are only what differs between ways.** What holds for all ways sits in the index header.

| Family | Labels (Hebrew) | Computed from | Rules |
|---|---|---|---|
| Where held | קרן ישראלית · קרן חוץ בת״א · נקנית בחו״ל | domicile, `trading_currency_on_tase` | ETF-24, ETF-31 |
| How it trades | קרן סל: נסחרת כל היום · קרן מחקה: פעם ביום | legal form | ETF-04 |
| How it follows | מחזיקה את המניות · עסקת החלף · חוזים עתידיים | the new `replication` field | ETF-51, ETF-52, ETF-53 |
| Currency | חשיפה לדולר (or the fund's currency) · מנוטרלת מט״ח | hedged flag (the names, or a new field) | ETF-12 |
| Tax | מס גם על שינויי המטבע (Israeli fund on a foreign index) · מס דיבידנד 15% בקרן (Irish fund on US shares) · מס על כל חלוקה (distributing) · מס רק במכירה (accumulating foreign fund: **open**, lock, TXF OQ1) | domicile, distribution policy, index | TXS-09, TXF-16, TXF-08, TXF-11 |
| What it asks / risk (caution) | דיווח עצמי למס (bought abroad) · מס עיזבון אמריקאי (US-domiciled) · לא בפיקוח רשות ני״ע (foreign fund, foreign broker) · צריך טופס W-8BEN (US ETF) | domicile, broker class | TXF-22, TXF-27, ETF-24, BRK-06, TXF-13 |
| Availability | לא זמין בבית ההשקעות הזה | snapshot `availability` | BRK-40 to BRK-45 |

## 4. The computation (site, on top of the engine)

1. **Broker cost per option** uses a *generic fund* for the option's class: zero fund fees, accumulating, in shekels for the Israeli and TASE options and in the dollar for `abroad`. So it works for a custom index with no fund. It is the engine's provider workbench run (F-63, `horizonCost`) over every bank, broker and foreign broker snapshot.
2. **A complete way's value** is the engine run of (fund, broker) with the fund's own class and costs. For each option, compute it for every fund at the option's cheapest broker, and at the person's broker when known.
   - The headline is the best value over options.
   - Each fund is priced with **its own instrument class**: this fixes the funds page's shared `etf_units` tariff, `site/app/lib/variants.ts:232-236`.
3. **Exchange rates** come from the site's ECB series (D26). A fund bought in a foreign currency and every foreign-currency minimum use it. The person never types a rate. The rate's future change (A-03) stays zero unless the person changes it.
4. **The return.**
   - An entered return (goal or page) is used, in blue, as everywhere.
   - With none, the page uses P-05's illustrative return, labelled "תשואה לדוגמה" (as the guide pages do). It checks that the order of options, of brokers in each option and of funds in each option holds at 0% and at 10%. It says "הסדר נשמר בכל תשואה בין 0% ל־10%", or names what flips.
   - This is a provisional reading of D9, flagged to the founder: a statement about costs, not a forecast.
5. **Per-broker failures** never fail the page. A broker the engine can't run is a "not comparable" cell with its reason (§6, engine change E5).

## 5. Comparison integration (goal page)

- The securities-account card on `/goal/compare` names no index by default (D27). It shows the index chips.
- Before a choice, the card shows "בין X ל־Y לפי המדד שתבחרו": the account's value over the known indices, each through its cheapest way. The wrapper ranking places the account by the lowest of these (the conservative reading, D10). A line says so.
- After a choice (stored with the goal), it runs on that index and shows the summary "הדרך הזולה: {ברוקר} · {קרן}" with "כל הדרכים להשקיע במדד ←" to `/invest/{id}`, carrying the plan.
- This is provisional and flagged to the founder.

## 6. Foundations (schema, engine, data)

**Schema** (`packages/schema`), all optional and backward compatible:
- **S1** fees `provider.class`: add `foreign_broker`. `provider.regulator`: add `foreign`, with `provider.regulator_foreign: { name: string, name_he: string, country: string }` required when `foreign`.
- **S2** units (`value.ts`): add `usd_per_share`, `usd_per_trade`, `gbp_per_trade`. A fee line gets an optional `cap` value object (unit `pct_of_trade`): commission = min(cap × trade, max(min, rate × base)).
- **S3** fees snapshot: optional `availability: Array<{ applies_to: string[]; available: boolean; source: { url, title, checked }; note?: string }>`. With no entry for a class, availability is derived from whether a trade line applies (today's behaviour).
- **S4** funds: optional `replication: { method: "physical" | "swap" | "futures" | "mixed"; source: { url, page?, checked } }` and optional `hedged: boolean`; optional `share_price` (value object, currency unit) for per-share commissions.
- **S5** exposures: optional `constituents_israeli: boolean`.
- **S6** series: an FX series for the ECB rates (§6, FX).

**Engine** (`packages/engine`):
- **E1** buildTariff reads `usd_per_share`, using the fund's `share_price`; without one, the row is not comparable with "needs-share-price".
- **E2** buildTariff reads `usd_per_trade` and `gbp_per_trade` minimums and maximums, converted at a run input `fx: Record<ISO, number>` (NIS per unit).
- **E3** buildTariff reads `cap`.
- **E4** fund-variants: a fund whose trading currency differs from the exposure's currency runs. The return is in the exposure's currency with A-03 (zero by default); the FX line and TXF-03's tax base use the trading currency.
- **E5** providers/workbench: a `RecordInputError` for one provider becomes a not-comparable row (`record-error`, with the message), not a throw for the whole run.
- Each change goes into `docs/method.md` with a dated note. Golden tests must stay green with unchanged expected values.

**FX** (D26):
- A pipeline script fetches `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml` into a series file under `data/series/`, with the date, each currency per euro, `terms_of_use` confirmed (ECB copyright, read 2026-10-25) and attribution "הבנק המרכזי האירופי".
- A site helper gives NIS per unit for any ISO code as a cross rate (ILS per EUR ÷ code per EUR), as a computed value with its source and date.
- It replaces every place a person was asked for a start rate ("שער USD היום" on the funds page, `fxStart`).

**Data:**
- Fill S3 for the two foreign brokers (BRK-40 to BRK-45: Interactive Israel sells no TASE units to private clients; both sell foreign securities).
- Fix their regulator (S1).
- Express their per-share and dollar lines (S2).
- Set `replication` and `hedged` on every fund record from the agents' notes (the text after `REPLICATION:` in `legal_form`).
- Set `constituents_israeli` on every exposure (TA indices true; S&P 500, NASDAQ-100, MSCI World and ACWI false).

## 7. Ownership (no file has two owners)

| Agent | Phase | Owns | Must not touch |
|---|---|---|---|
| A1 schema-data (Sonnet, medium) | A | `packages/schema/src/**`, `packages/pipeline/src/validate.ts`, `data/fees/**`, `data/funds/**`, `data/instruments/exposures/**`, `docs/data-schema.md` | engine, site, `packages/schema/json` (the lead regenerates) |
| A3 fx (Sonnet, medium) | A | `packages/pipeline/scripts/fetch-ecb-rates.ts` (new), `packages/pipeline/package.json` scripts, `data/series/ecb-fx*.json` (new), `site/app/lib/fx.ts` + `fx.server.ts` (new), and, to remove the typed rate, `site/app/lib/variants.ts`, `site/app/lib/providers.ts` (fxStart only), `site/app/components/workbench/funds/**` | schema files (S6 goes through requests.md to A1), method.md (text through requests.md) |
| A2 engine (Sonnet, medium) | A, after A1 | `packages/engine/src/**`, `packages/engine/test/**` (not golden expected values), `docs/method.md` | site, schema, data |
| B1 invest page (Sonnet, medium) | B, after A | `site/app/lib/invest.ts` + tests (new), `site/app/lib/labels.ts` (new), `site/app/routes/invest.tsx` (new), `site/app/components/invest/**` (new), `site/app/routes.ts`, `site/app/lib/paths.server.ts`, `site/app/lib/state.ts` (custom indices, current broker), `site/app/copy.ts` (new `invest` block and the nav entry only), `site/app/lib/search-aliases.ts`, the funds-page per-class fix in `site/app/lib/variants.ts`, and `fundRun` in `site/app/lib/providers.ts` (after A3 is done) | compare files, engine, schema, data |
| B2 compare (Sonnet, medium) | B, after B1's `invest.ts` API | `site/app/lib/compare*.ts`, `site/app/components/compare/**`, `site/app/routes/goal-compare.tsx` | invest files |
| Lead | all | `docs/product.md`, `docs/design-spec.md`, `docs/flows.md`, `docs/design-system.md`, `docs/copy.md`, `docs/architecture.md` (amendments from the agents' notes), `packages/schema/json` (regenerate), publishing the held data, `npm run check`, smoke tests, commits | — |

**Cross-file needs** are appended to `research/specs/2026-10-25-invest-page/requests.md` (owner, file, what, why). The owner applies them; the lead routes them.

**Rules for every agent:**
- Run your package's tests, `npm run typecheck` and `npm run validate`. Only the lead runs `npm run check` and the site build.
- Never `pkill`.
- Don't commit.
- Write a short report in this folder (`report-<agent>.md`) listing what changed, the tests, what's open, and the doc text the lead should add.

## 8. Done when
- `/invest/index-sp500` shows the sections of §1 with engine numbers. The cheapest way for the founder's plan (6,000 + 400 × 20 years) is Psagot Trade with a tracking fund, priced with the fund's own class. The grid shows "לא זמין" for Interactive Israel in the TASE columns, and the abroad column has numbers or a per-broker reason, never a page error.
- A custom index ("ניקיי 225", not Israeli) saves on the device and shows broker costs per option, the empty funds state, and the request button.
- `/invest` with no index chooses nothing (D27).
- The funds page and the brokers page agree with the invest page for the same plan and broker.
- No page asks for an exchange rate (D26).
- `npm run check` passes, and the lead's smoke test of the built site passes at 1280 and 390 wide.
