# Rules and figures of one institution shown as general: a sweep (2026-10-25)

Read-only sweep for the founder's note of 2026-10-25 (KH-15 in "שווה לדעת" and Altshuler Shaham's 4 business days on the study-fund guide). Nothing in site code, data or docs was changed.

## Summary

- 77 rule records have strength `institution`. On the rule base's own evidence, 33 are general rules that only happen to rest on a company's document (A), 24 are one institution's own terms (B), and for 20 the rule base does not say (C). Another 11 records with `primary` strength carry a figure that belongs to one institution (A 3, B 5, C 3), and 37 primary records add a sentence about one named institution (A 18, B 11, C 8).
- The site shows these items in at least 15 generic places. The worst five: child savings shows Harel's 0.23% fee as a legal cap; the idle-cash page measures everyone's current account against Leumi's conditional 1%; seven provident and child pages say "תוך כמה זמן הכסף אצלכם: עד 4 (or 3) ימי עסקים" from one company's form or channel; KH-15, PEN-15 and CS-18 sit in "שווה לדעת"; guide timelines and the comparison's deposit cards run on Leumi and Meitav without naming them.
- Cause: one field, `strength`, answers "how good is the evidence". Nothing answers "who does this hold for". Records mix a general rule with one company's term. Wrapper fields have no shape for "differs by institution". Every selector picks by id list, file or dimension. The only label, "לפי החברה", names no company.
- Recommended: make scope its own data. Add `scope` (general / institution / unsettled, with the institutions named) to rule records, an `institution` field to value objects, and a "varies by institution" shape for wrapper fields. Split mixed records. The validator then keeps generic lists general, and institution items appear named ("אצל אלטשולר שחם: …") or on that company's page. Six quick fixes can ship before the schema work.

## 1. Method

- Read all 500 records under `data/rules/`, all wrapper and exposure records, `data/parameters/`, `data/terms/` (glossary and the 3 Leumi deposit records), and the P-05 instrument map. Checked `data/fees/`, `data/funds/` and `data/catalog/` for where they stand in for a product.
- A record was a candidate if its strength is `institution`, if any figure's source is an institution, if its Hebrew text names a bank, manager, broker or issuer, or if a value it holds has `update_rule: "provider-set"`.
- Classified against `.claude/skills/il-finance/references/`: the rule text, its conditions, and the open questions of its file. The test used:
  - **A**: by law, regulation, an exchange rule or definition, the content is the same at every institution. The company's document only evidences it.
  - **B**: the institution sets the content itself (its service times, fees, forms, product features, policies, statements). The record says others were not read, or that they differ.
  - **C**: the content could be a uniform rule or the company's own choice, and the rule base leaves it open. The table says what would settle it.
- Site contexts were traced through the code and checked on the live pages for the study fund, both child-savings pages, comprehensive pension, savings plan and current account (fetched 2026-10-25).
- Files of the in-progress second wave of visuals (`site/app/components/guide-signature/{keren-hishtalmut,kupat-gemel-lehashkaa,pension,g2-parts}.tsx`, `site/app/lib/guide-signature*.ts`) were not reviewed. `site/app/copy.ts` is being edited too, so copy is cited by key, not by line.

## 2. The classified list

### 2.1 The 77 records with strength `institution`

A = general, labelling issue only. B = this institution's customers only. C = open. "Mixed" means the record joins a general part and a company part. The class given is the part a generic page would show.

| id | What it says | Source | Class | Why |
|---|---|---|---|---|
| BANK-25 | Fixed or variable deposit rates; prime as the usual anchor | Yahav, Leumi, Hapoalim rate pages | A | The disclosure duty is the Bank of Israel's. Prime as anchor was seen at every bank checked |
| BPN-10 | In Hapoalim's savings plans, one rate table and exit points from the start; whole amount only | 4 Hapoalim plan contracts | B | Hapoalim's own contracts; other banks' not read |
| BRK-06 | A foreign broker under a s.49A permit is not supervised by the Israel Securities Authority | Law (primary) plus Interactive Israel and Yahav pages | A | The permit status comes from the law; the two pages are examples |
| BRK-10 | Bank securities are registered through the nominee company and kept apart in the bank's books | Leumi general terms | C | One bank's contract. Settle: a Bank of Israel custody directive or a second bank's terms (REG OQ10) |
| BRK-23 | FX conversion when buying foreign securities, at the bank's rate plus fees | Leumi general terms | B | "Other banks not read" |
| BRK-24 | Non-bank tariffs follow the bank layout and add lines; the tariff is a ceiling | IBI, Excellence, Altshuler Trade, Psagot tariffs | A | A pattern across four tariffs, worded "in the tariffs read". The prices live in `data/fees` |
| BRK-25 | Interest on idle cash is a tariff line; a non-bank member must report it | 3 broker tariffs | A | Tariff pattern plus a TASE rule |
| BRK-28 | Opening an account: conditions and minimums | Leumi, Meitav Trade, Fair, Psagot | B | Each one's own minimum, named |
| BRK-35 | IB Ireland: client-money segregation, Irish compensation scheme | IB Ireland page | B | One broker's protections |
| BRK-36 | Interactive Israel withholds Israeli tax via HYBRID; no custody fee | Its own site | B | Marketing statements of one firm |
| BRK-38 | One Zero tariff: what it trades; no custody fee | One Zero tariff | B | One bank's tariff |
| BRK-40 | Interactive Israel tariff | Its tariff | B | One firm |
| BRK-41 | Interactive Israel: US or Irish account; TASE for institutions only | Its site | B | One firm |
| BRK-42 | IBKR direct: fixed or tiered pricing, no custody, no minimum | IBKR pages | B | One firm |
| BRK-43 | IBKR: which entity holds the account depends on residence | IBKR pages | B | One firm |
| BRK-44 | IBKR blocks US ETFs without a KID for EU/UK residents | IBKR, Interactive Israel | B | How one broker applies an EU rule |
| BRK-45 | IBKR and US tax: W-8BEN, withholding; no Israeli withholding | IBKR pages | B | One firm's account; the general US-tax part is TXF-13 |
| CAT-23 | What standard tracks hold, quoted from Meitav's bylaw notices | Meitav notices | C | Settle: the CMA list of investment tracks (שה 2024-1471), if it fixes each standard track's policy |
| CS-09 | Child-savings default track holds 75%–120% equities | Harel standard bylaw | C | CS OQ7: are all managers on one CMA standard bylaw? Settle: the CMA circular or a second manager's bylaw |
| ETF-06 | An ETF's market price is not its NAV; market maker | One fund's annual report | A | The mechanism of every Israeli ETF |
| ETF-09 | Tracking difference as the annual report shows it, two examples | IBI, Yalin annual reports | A (figures B) | The reporting duty is general. The numbers are two funds' own |
| ETF-10 | An unhedged fund's tracking asset includes the currency | ISA directive (primary) plus reports | A | Set by ISA directive |
| ETF-12 | Exposure code in fund names | Fund reports | A | Naming convention; scale partly open (ETF OQ9) |
| ETF-13 | Cost layers in an Israeli tracking fund | IBI, Yalin reports | A (figures B) | The structure is general. The rates are those funds' own |
| ETF-19 | IBI's S&P 500 ETF accumulates | One annual report | B | The record says it is not a rule for all ETFs |
| ETF-20 | Units in shekels, a security number, "סל"/"מחקה" in the name | 2 reports | A | Market-wide |
| ETF-27 | iShares funds on TASE: accumulating, in shekels | BlackRock leaflet | B | One issuer about its own funds |
| ETF-28 | A UCITS fund has share classes, each with its own ISIN | iShares pages | A (figure B) | The structure is general. CSPX's 0.07% is one fund's |
| ETF-29 | UCITS units are bought through an intermediary | iShares KID | A | True of every UCITS ETF on the secondary market |
| ETF-30 | Example: IVV, quarterly distributions | iShares page | B | One fund, framed as an example |
| ETF-53 | What a swap fund receives and pays | 6 funds' reports | A | Same mechanism across funds |
| ETF-54 | Tracking difference by method: what the reports show | ISA plus 10 reports | A | Observation, hedged |
| IRA-21 | Broker fees inside Meitav's IRA | Meitav tender results | B | One manager's tender |
| IRA-22 | Meitav Trade's in-IRA fees | Meitav tender annex | B | One broker |
| KGL-03 | This year's kupat gemel lehashkaa ceiling, 83,641 ₪ | Harel and four other managers | A | A legal ceiling. KGL-24 (primary) recomputes it from CPI |
| KGL-04 | Ceiling checked at deposit; each company sets its year-end cut-off | Altshuler, Infinity, Yachad Rofim bylaws | C (mixed B) | The check is in three bylaws on one template; the cut-off is each company's. Settle: the CMA standard bylaw |
| KGL-06 | Anyone, any age, can open; in another's name; Meitav: "irrevocable gift" | 3 bylaws and pages | A (mixed C) | Eligibility is the same in every bylaw read. "Gift" is Meitav's wording |
| KGL-08 | Withdraw any time; paid within 4 business days | 3 bylaws plus Meitav; figure from Altshuler | C (likely A) | All three bylaws on one template say 4. Settle: the CMA standard bylaw or payments circular |
| KGL-15 | Meitav's list fee 0.8%, an example, not a cap | Meitav page | B | One manager's price |
| KGL-16 | Fee discount: minimum period, early end | Altshuler, Infinity bylaws | A (B detail) | The CMA circular governs (PF-13). The bylaws' shorter period is their own wording |
| KH-04 | Contribution rates by agreement; common split 7.5% employer, 2.5% employee | Harel bylaw (figures), Altshuler | C | "Common" is not in law. Settle: collective agreements or extension orders (KH OQ3) |
| KH-05 | Employee deposit at least a third of the employer's | Altshuler, Meitav pages | C | KH OQ1: no legal source; Kol Zchut points to a tax condition |
| KH-08 | Self-employed deposits; each company's year-end cut-off | Altshuler, Harel | A (B detail) | Deposits from business income are tax law; the cut-off is each company's |
| KH-09 | Continuing deposits when the employer stops | Harel, Altshuler bylaws | B | The record says the funds differ |
| KH-10 | Withdrawal grounds; early withdrawal is taxed, not forbidden | Altshuler, Harel bylaws and form | A | Mirrors the Ordinance (TXH-09, 10, 13) |
| KH-11 | The first payment date starts the clock | Altshuler, Harel | A (B detail) | Same definition in tax law; Harel's retroactive joining is Harel's |
| KH-13 | Study withdrawals: Altshuler's three cases | Altshuler bylaw and form | B | "בהראל הנוסח שונה" |
| KH-15 | A deposit after a withdrawal opens a new account | Altshuler bylaw s.17 and form | C | The Ordinance closes the account after a withdrawal (TXH-09, primary). Whether every manager books later deposits as a new account was not checked. Settle: Harel's bylaw (already in the sources) or the CMA standard bylaw |
| KH-16 | Withdrawal documents, bank transfer only, paid within 4 business days | Altshuler form | C (mixed B) | The documents and channel are Altshuler's. On the 4 days, the form says the timetable is "set in the law", and Mor, Harel, Infinity and Yachad Rofim print the same 4. KH OQ16: that law was not read. Settle: the regulation or CMA circular on payment times |
| KH-18 | Track switching inside the fund | Law plus Altshuler, Harel | A | PF-23 and TXH-17 |
| KH-19 | Default track is the general track | Altshuler, Harel bylaws | C | KH OQ10: is there a CMA rule? Settle: the CMA investment-tracks circular |
| KH-21 | Loans against the fund, pledges, attachment | Bylaws, form, Meitav loans page | A (B detail) | No transfer or pledge is general; whether loans are offered is company policy |
| KH-25 | Group life cover attached to the fund | Altshuler, Harel bylaws | B | Some managers |
| MF-27 | What bank and broker charge on fund units | ISA guide plus Leumi, IBI, Meitav tariffs | B (A part) | Tariff examples; the ISA guide part is general |
| PEN-09 | Insured salary and determining salary | Mor bylaws | C | PEN OQ13: only Mor's bylaws read; the CMA uniform bylaws not reached |
| PEN-11 | Insurance tracks and default | Mor | C | PEN OQ13 |
| PEN-12 | Disability cover | Mor | C | PEN OQ13 |
| PEN-13 | Survivors' cover | Mor | C | PEN OQ13 |
| PEN-15 | Cost of insurance cover | Mor | C | PEN OQ13 |
| PEN-16 | Insurance extension (5 months) after deposits stop | Mor | C | PEN OQ13 |
| PEN-17 | Investment tracks; age-based default | CMA circular (primary) plus Mor | A | The age-based default is the circular's |
| PEN-19 | Actuarial balancing | Mor bylaw; CMA publishes each fund's result | C (likely A) | Uniform bylaws not read |
| PEN-27 | Old-age pension: start and computation | Mor | C | PEN OQ13 |
| PEN-31 | Severance component on leaving a job | Law (primary) plus Mor | A | In the law |
| PEN-33 | Pension fund service times; withdrawal paid within 4 business days | Mor bylaws | C (likely A) | The same timetable question as KH-16 |
| PEN-35 | Provident fund for annuity vs pension fund | Law plus Mor page and bylaws | A | Structure from law |
| PF-24 | A member who does not choose joins the default track | Altshuler gemel bylaw | C (likely A) | In every bylaw read; no CMA rule found |
| PF-26 | Annual and quarterly reports to members | Law, CMA circular (figures primary), Altshuler | A | Circular figures |
| REG-16 | A non-bank member's client assets | Meitav Trade "about" page | A | TASE rules require segregation (BRK-07, primary). REG-16 is one member's statement of it |
| REG-26 | Foreign broker through an Israeli introducing broker | Interactive Israel | B | One firm's set-up (the general part is BRK-06) |
| SW-34 | Moving securities out of a broker: no cap; price per security | IBI, Altshuler Trade, an article | A (B prices) | "No cap found" is general; the prices are theirs |
| SW-35 | Portfolio transfer: open at the new broker, request at the old | Leumi, Meitav, Altshuler Trade | A (B details) | The order of steps is general. Leumi's conditions and Altshuler Trade's 5 and 14 days are theirs |
| SW-36 | Tax on moving securities between accounts | Altshuler Trade, Leumi, Meitav | A | A tax rule, the same for everyone; only company evidence (SW OQ11) |
| TX2-20 | How one REIT withholds on dividends | Reit 1 | B | One REIT, example figures (tier 2) |
| TXA-28 | What insurers say on savings-policy tax | Clal, Phoenix | A | Tax is general (tier 2) |
| TXK-07 | Kupat gemel lehashkaa lump sum: tax on real gain, withheld by the company | Harel leaflet plus Tax Authority guide | A | A tax rule; company evidence (TXK OQ2, OQ3) |
| TXS-15 | Foreign tax inside an exempt fund is a cost of the fund | 2 prospectuses | A | Mechanism across funds |

Count: A 33, B 24, C 20. Of the C items, 5 lean A (KGL-08, PEN-19, PEN-33, PF-24, KH-16's timetable).

### 2.2 Records with strength `primary` whose figure is one institution's

| id | Figure | Source | Class | Why |
|---|---|---|---|---|
| CS-18 | `fee_after_21` 0.23% a year after the last grant | Harel bylaw, Altshuler Q&A | C, and never a cap | CS OQ8: whether every manager charges 0.23% was not checked. The National Insurance Institute pays managers 0.23% until 21 (primary), so a tender term is possible. Settle: the Ministry of Finance tender terms or a third bylaw. The fee regulations do not name child savings, so there is no legal cap (the wrapper value's own note says so) |
| CS-14 | `provident_payout_business_days` 4 | Harel bylaw | C | Same as KH-16 |
| CS-14 | `bank_payout_business_days` 3 | Leumi withdrawal page | B | Leumi's digital channel (it closes the account) |
| CS-11 | `track_switch_business_days` 3 | Harel | C (likely A) | Matches the 3-day regulation (PF-23); whether it covers child-savings funds is not said |
| IRA-10 | `suitability_minimum` 200,000 ₪ | Meitav page | B | One manager's recommendation |
| SW-07 | `phoenix_cancel_window_business_days` 10 | Phoenix Q&A | B | The general rule (cancel until the money moves) is the circular's |
| SW-09 | `phoenix_confirmation_business_days` 14 | Phoenix | B | The circular says 15 |
| SW-18 | `leumi_report_available_months` 3 | Leumi | B | Leumi's service |
| SW-24 | Meitav Trade transfer fees 20 ₪, 99 ₪ cap, $10 | Meitav Trade | B | One broker |
| IRA-08 | IRA cap 6,303,528 ₪, determining amount, minimum pension | Meitav, Mor | A | A formula in regulation; companies print the year's numbers (IRA OQ8) |
| PEN-08 | Monthly deposit ceiling 5,645.29 ₪ | Harel table | A | Derived from the regulations |
| TXH-11 | `real_base` true | Mor, Clal | A | A tax base question (TXH OQ1) |

### 2.3 Records with strength `primary` that add a sentence about one named institution

Each of these is a general rule plus an example or a company's practice. The class is that of the added sentence.

| Class | Records |
|---|---|
| A (example of a general rule) | BANK-06 (Discount break example), BRK-08 (Fair), CAT-09, CAT-17, CAT-24 (Meitav, Harel examples), ETF-11, ETF-24, ETF-52, IRA-02, IRA-17, KGL-09, KH-07 (Harel table), KH-14 (Altshuler form wording), MF-15, PF-03, PF-04 (Menora), SW-06, SW-08 (Phoenix) |
| B (the company's own practice) | ETF-04 (IBI: no order minimum), IRA-05, IRA-12 (Meitav forbids writing options), PEN-23 (Mor's fee alternatives), PF-13 (Altshuler's shorter discount period), PF-14, PF-23, SW-02, SW-10 (Phoenix), SW-17 (Mizrahi earns distribution fees; Phoenix routes to an agent), SW-33 (Discount 5 ₪) |
| C | BRK-27 (Leumi terms on withholding), CS-10 (rate fixed at opening, from Yahav's agreement), IRA-11 (Meitav: approved country means BBB or OECD), IRA-23, KGL-10 and KGL-11 (Altshuler bylaw), KH-02 (Meitav: employees join only through an employer; KH OQ2), PEN-30 ("the pension bylaw adds" is Mor's) |

Another 63 primary records list an institution's document among their sources but state only the general rule. They need no change.

### 2.4 Other data that stands for a product

| Data | What it is | Class | Where it stands for the product |
|---|---|---|---|
| `data/terms/deposits/leumi-*.json` (3) | Leumi's one-year fixed deposit 1.8%, 3-year plan 1.5%, current account 1.0% | B | Guide timelines, comparison cards and the idle-cash page (section 3). The current-account 1.0% applies only up to 10,000 ₪, and only to customers whose salary goes into Leumi and who hold a Leumi mortgage, card spending or securities. Of the 8 banks' publications collected (`research/specs/2026-10-25-guide-signatures/held-deposits/`), 4 pay 0% on a current account (Hapoalim, Mizrahi-Tefahot, Massad, Mercantile; Mercantile with a doubt). One-year deposits run 1.05% to 2.25%, plans 0.9% to 3.0% |
| `data/fees/leumi@2026-10-23.json` | Leumi's tariff | B | Guide timelines of brokerage account, both money-market funds, makam and government bond (P-05) |
| `data/fees/meitav@2026-10-23.json` | Meitav's list fees | B | Wired as P-05's fees for kupat gemel lehashkaa (0.8%), comprehensive pension (1% and 0.22%) and the study fund's deposit fee. Those guide pages show no graph yet (pending formulas), but the comparison's provident cards run on these fees |
| Gemel-Net and Pensia-Net per-track averages | Tracks 880, 2158, 923, all Meitav's | B by scope, primary by strength | The study-fund timeline (live) shows "ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת 2025 (לא תעריפון) 0.6%", which reads as the market's average. General pension and provident fund for annuity are wired the same way and have no graph yet |
| `data/funds/` representative funds (5138763, 1223866, 5139282) | One fund each | B | Timelines of money-market funds and brokerage. Named in the comparison and the brokerage prose; unnamed in the timeline's list of terms |
| Wrapper `lawful_exit.payout_business_days` | 4 days (study fund, kupat gemel lehashkaa: Altshuler; three pension wrappers: Mor; child savings provident: Harel), 3 days (child savings bank: Leumi) | C (bank: B) | The guide's money-in-and-out row (section 3) |
| Wrapper `fee_caps.balance` of child-savings-provident | 0.23% | C, and not a cap | The guide's fee table (section 3) |
| Wrapper `ceiling.amount` (kupat gemel lehashkaa 83,641; comprehensive pension 5,645.29; both IRA 6,303,528) | Harel, Harel, Meitav prints | A | Labelling only |
| `data/catalog/` (38 entries) | Meitav's names | B | Only on Meitav's pages and the decoder, so already named. No issue |
| Glossary (`data/terms/*.json`) | 52 entries sourced to a company | Mostly fine | Most meanings already scope themselves ("שחלק מהקופות", "שם שמיטב נותנת"). Two generalise: "מתנה בלתי חוזרת" (Meitav's wording, C) and "ארכת ביטוח" (Mor, C) |

Not in scope: 7 secondary records (MKT-01, TXK-23 and the four forum accounts SW-X01 to SW-X04, already labelled as experience; IRA-28 reports events at named managers, a news item), SW-37 (open) and TXF-04 (mirror). These raise evidence questions, not scope questions.

## 3. Where the site shows them in a generic context

| Page | Code path | Item | What the reader sees |
|---|---|---|---|
| Study fund guide, "שווה לדעת" | `data/parameters/pinned-rules.json` `guide_blocks["keren-hishtalmut"]` → `site/app/routes/guide.tsx:66` → `site/app/components/guide/worth-knowing.tsx:17-27` (rows: title, first figure, weak tag from rule strength) | KH-15 (C, Altshuler) | "הפקדה אחרי משיכה פותחת חשבון חדש KH-15 לפי החברה" (live) |
| Comprehensive and general pension guides, "שווה לדעת" | same path, `guide_blocks["pension-comprehensive"]`, `["pension-general"]` | PEN-15 (C, Mor) | "עלות הכיסוי הביטוחי PEN-15 לפי החברה" |
| Both child-savings guides, "שווה לדעת" | same path, `guide_blocks["child-savings-provident"]`, `["child-savings-bank"]` | CS-18 with Harel's figure (rule is primary, so no tag text) | "דמי הניהול: מי משלם ועד מתי 0.23%" on both pages. On the bank page this is not even the bank route's fee |
| (validator gap behind the three rows above) | `packages/pipeline/src/validate.ts:266-279` | P-09 | Only a row's first rule is checked for a primary source. `guide_blocks` get an existence check only, though P-09's rationale says every pinned rule has a primary source |
| Study fund, kupat gemel lehashkaa, three pension guides, both child-savings guides: "כסף נכנס ויוצא" | `guide.tsx:178-190` reads `record.lawful_exit.payout_business_days` | KH-16 / KGL-08 (Altshuler), PEN-33 (Mor), CS-14 (Harel; Leumi on the bank page) | "תוך כמה זמן הכסף אצלכם: עד 4 ימי עסקים" (bank page: "עד 3 ימי עסקים"), an amber icon, no company named |
| Same five provident pages: fee table, exit row | `guide.tsx:224`: the exit row takes its tag from `weakTag(payout_business_days.rule_ids)` | The general "no exit fee" rule (PF-01, primary) tagged by KH-16 / KGL-08 / PEN-33 | "דמי יציאה · כשמושכים · אין · לפי החברה · PF-01 KH-16". A legal fact labelled as a company's |
| Child savings (provident) guide: fee table | `guide.tsx:200-221` from wrapper `fee_caps.balance` | Harel's 0.23% (the value's note: "NOT A REGULATORY CAP") | "דמי ניהול מחיסכון · עד 0.23% בשנה" under the column "תקרה", above the note "אלה התקרות שבחוק" (copy `guide.feeNote`). A false legal claim |
| Study fund guide, "מה זה" | `site/app/content/guide/keren-hishtalmut.tsx:15-16` | KH-04 (C, Harel's figures) | "בדרך כלל 7.5% מהמעסיק ו־2.5% מכם", amber icons |
| Study fund guide, risks | `keren-hishtalmut.tsx:55-56` | KH-15 (C) | "אחרי משיכה החשבון נסגר להפקדות, והפקדות חדשות פותחות חשבון עם ותק חדש", stated as general |
| Child savings (provident) guide, risks | `site/app/content/guide/child-savings-provident.tsx:58` | CS-09 (C, Harel) | "במסלול ברירת המחדל רוב הכסף במניות…", stated as general |
| Government bond, makam and brokerage guides, risks | `government-bond.tsx:61`, `makam.tsx:72`, `brokerage-account.tsx:96` | BRK-10 (C, Leumi's contract) | "בבנק ניירות הערך רשומים דרך החברה לרישומים ומופרדים בספרי הבנק…", for every bank |
| Savings plan guide, "מה זה" and the exit details | `savings-plan.tsx:15`; `site/app/lib/guide.server.ts:172` (`exitTextRules` from the wrapper's exit sentence) | BPN-10 (B, Hapoalim) | "בתוכניות שנקראו ברמת החוזה, בבנק אחד…" (hedged, unnamed). The exit disclosure prints BPN-10's text, which names Hapoalim |
| Pension guides, prose | `pension-comprehensive.tsx:20,54-58` | PEN-11, PEN-15, PEN-19 (C, Mor) | Insurance and actuarial lines stated as general |
| Guide timelines (8 live pages; collapsed under the visual on 6 of them) | P-05 `instruments` (`data/parameters/illustrative-scenario.json`) → `guide.server.ts:96-128` (provident), `site/app/lib/guide-signature-bundle.server.ts:60` (deposits), `site/app/lib/instruments.server.ts:530-573` (one track's average) → `site/app/components/timeline/Timeline.tsx:326-363` | Leumi rates and tariff (bank deposit, savings plan, current account, daily money-market fund, makam, government bond, brokerage); Meitav track 880 (study fund) | "תנאי המוצר בדוגמה · הערכים האלה נלקחו מהנתונים של האתר", values unnamed. "הריבית שהבנק פרסם" (copy `values.hints.cashPublished`). "ממוצע דמי הניהול … (לא תעריפון) 0.6%" on the study fund. Breaks D21 ("the page names it") and D29 ("never one institution standing for the product"). Only the brokerage prose and the G1 visuals (`guideSignature.common.onlyLeumi`) name Leumi. Kupat gemel lehashkaa and the pension pages will show Meitav's fees the same way once their graphs run |
| Goal comparison: bank deposit, savings plan and current account cards | `site/app/lib/compare.ts:273-277` (`cashRateFor`), `:1143` (chip); `site/app/lib/compare.server.ts:154-166` (`representativeOf` names a fund or track, and returns nothing for a deposit-terms entry) | Leumi's published rates | Chip "ריבית הבנק, בתוקף מ־25.10.2026". No bank named on the card, though the brokerage card names its provider |
| Idle-cash page | `site/app/lib/idle.ts:117-121` (baseline = the current account's rate), rows from the bank deposit's rate | Leumi current account 1.0% (conditional), Leumi deposit 1.8% | "העו״ש משלם היום 1.00%." (copy `idle.baselineBefore`), and a "פיקדון" row "בתוקף מ־…". For a customer of the four banks that pay 0%, the monthly cost of idle cash is understated |
| Questions page, row 5 | `pinned-rules.json` row (TXH-09, KH-15) → `site/app/routes/questions.tsx:66-84` | KH-15 | "…ולפי תקנון של חברה הפקדה אחרי משיכה נספרת כחשבון חדש", tag "לפי החברה" |
| Questions page, row 4 | row (KGL-02, KGL-03) | KGL-03 (A) | Tagged "לפי החברה", though the ceiling is the law's and KGL-24 confirms it from official CPI. A labelling issue only |
| Rules page, product chips | `site/app/lib/rule-uses.server.ts:284` (`ruleProducts`: a rule joins a product by file or wrapper citation), `site/app/lib/rule-shelves.ts:150` | KH-09, KH-13, KH-15, KH-16, KH-25 under study fund; BRK-35 to BRK-45 (IBKR, Interactive Israel) under brokerage; PEN-09 to PEN-33 under pensions | Mixed in among the general rules, ordered by a score with no scope term (`rule-uses.server.ts:241`). Labelled only "לפי החברה" |
| Switching playbooks | `site/app/lib/playbook.ts:259` (`FIGURES`) | SW-18 (Leumi), SW-24 (Meitav Trade), SW-35 (Altshuler Trade); Phoenix sentences in SW-02, SW-07, SW-09, SW-10 | Named in the figure labels (a good pattern), but shown as steps of a generic process. Low |
| Exposure pages | `site/app/content/exposure/general-track.tsx:21`; `index-sp500.tsx:61`; exposure records' `rule_ids` | PF-24 (C), BRK-23 (B, Leumi), ETF-19 (B, IBI) | "בקרן השתלמות הוא אחת משתי האפשרויות לברירת מחדל", sourced to one company's bylaw. ETF-19 listed on every index exposure. Low |
| Guide checklist "מה נבדק" | `guide.tsx:332-345` | Every rule with the dimension, B items included | Company terms counted as "considered" for the product. Low |
| Glossary popups | `data/terms/mtnh-blty-chvzrt.json`, `arkt-bytvch.json` | Meitav's and Mor's wording | Stated as general. Low |

Already right, and worth keeping as patterns: the fees page names the track and company it runs on (`site/app/components/fees/parts.tsx`). The comparison's brokerage card names the provider and lets the person change it. The G1 visuals say "לפי הפרסום של לאומי; בנקים אחרים עוד לא נאספו". The playbook's figure labels carry the company name.

## 4. Why the code cannot tell them apart

1. **One axis is used for two questions.** `strength` (`packages/schema/src/value.ts:47`; rules: `packages/schema/src/collections/rules.ts`) records how good the evidence is. Under D23 an `institution` rule computes with the label "institution source". Nothing records who the content holds for. So KGL-03 (a legal ceiling every company must apply) and KH-16 (Altshuler's service time) carry the same marker.
2. **Strength is not a scope proxy in either direction.** It flags 33 general rules (A) as if they were company terms. It misses company content inside primary records (CS-18's 0.23%, CS-14's Leumi 3 days, SW-07/09/18/24). It misses single-company values that come from primary sources: a Gemel-Net average for one Meitav track has publisher CMA and strength primary, but it is one company's number.
3. **Records mix scopes.** KH-16, KGL-04, KH-08, KH-11, KH-21, SW-35, MF-27 and the 37 records of 2.3 join a general rule and one company's practice in one text. A decision at record level is wrong for half of each.
4. **Value objects do not name the institution.** Some figures carry the name only in free text (`figure_names_he`: "ימי עסקים לתשלום המשיכה (אלטשולר שחם)"; `notes`). When a wrapper record copies the figure into a product field (`lawful_exit.payout_business_days`, `fee_caps.balance`), the name is lost and the field means "the product's". `update_rule: "provider-set"` comes close, but it is used inconsistently: it is set on the kupat gemel lehashkaa payout days but not the study fund's, and it is also set on index-provider rules and on CMA circular figures (PF-26).
5. **Wrapper fields have no shape for "differs by institution".** The schema types payout days, fee caps and ceilings as single product facts, so research filled them with the one company it read.
6. **Selectors pick by id list, file or dimension, never by scope.** P-09 `guide_blocks` and rows, `worthRows`, the money-in-and-out list, `FeeTable`, the exit row's tag, `exitTextRules`, prose `RulesLine`s, `ruleProducts` and the checklist all pick this way. The only scope-like tools are ad hoc: `isExperience` (a regex on SW-X ids) and the playbook's `ONLY_FOR` (one sentence kept to one wrapper).
7. **The label answers the wrong question.** "לפי החברה: המספר מבוסס על מסמך של החברה" (copy `numbers.legend.institution`, `provenance.weak`) names no company and reads as "your company says so". It never says "only at Altshuler Shaham".
8. **The representative instruments are silent.** D21 says the page names the representative record. D29 says no institution may stand for the product. Only the G1 visuals do this. The timeline, the comparison's deposit cards and the idle-cash page do not, and the idle-cash baseline is built on one bank's conditional offer.

## 5. Fix

### Options

| Option | For | Against |
|---|---|---|
| 1. Treat strength `institution` as scope: keep such rules out of generic places | One line per selector | Wrong both ways. It drops A items (KGL-03 ceiling, TXK-07 tax base, KH-10 withdrawal grounds, SW-36), keeps CS-18's 0.23%, the Phoenix and Leumi figures and the Meitav track averages, and leaves the wrapper fields as they are |
| 2. Fix by hand (pinned list, wrapper fields, prose, copy) | Fast; needed now in any case | Comes back the next time research adds a bylaw-based rule; nothing checks it |
| 3. Scope as data: a rule field, a value field, a wrapper shape and an institution registry, with validator gates and display rules | Records exactly the founder's distinction. Matches the existing precedents (forum entries as "experience", `ONLY_FOR`, D29's "same everywhere or depends on the institution"). Gives company pages content | Schema work. About 130 records to review (77 institution rules plus the primary records with company sources or clauses); the rest default to general |
| 4. Split mixed records only, with no field (id conventions such as SW-X) | Lighter | Opaque ids; values still carry no scope |

**Recommended: option 3**, which includes option 4's splitting. Ship option 2's six quick fixes first (step 0).

### Step 0: quick fixes, no schema change

1. `data/parameters/pinned-rules.json`: in `guide_blocks`, replace KH-15 (study fund), PEN-15 (both pensions) and CS-18 (both child pages) with general rules that have a primary source, as P-09's rationale already requires. In row 5's answer, drop the KH-15 clause; TXH-09 already says the account closes.
2. `data/instruments/wrappers/child-savings-provident.json` `fee_caps.balance`: no legal cap, so set it to `null` or "no cap in the regulations". The 0.23% moves to a sentence that names Harel and Altshuler.
3. Wrapper `lawful_exit.payout_business_days` (7 wrappers): remove it, or show it named ("בתקנונים שנקראו: עד 4 ימי עסקים: אלטשולר שחם, מור, הראל"; bank page: "בלאומי, בבקשה דיגיטלית: עד 3 ימי עסקים").
4. `site/app/routes/guide.tsx:224`: stop tagging the exit-fee row with the payout rule's strength.
5. Prose: the study fund's risks (KH-15) and "בדרך כלל 7.5%/2.5%" (KH-04: name the source or show the legal limits only); child savings' default track (CS-09, name Harel); the bank-custody sentence on three pages (BRK-10, name Leumi or drop it); the savings plan's "בבנק אחד" (name Hapoalim).
6. Name the institution wherever a run rests on one: the timeline's list of terms (`Timeline.tsx:326`), the cash-rate hint, the comparison's deposit chip ("ריבית לאומי, …"), and the idle-cash baseline ("בלאומי, ללקוחות שעומדים בתנאים: 1% עד 10,000 ₪").

### Step 1: the schema

- **Rule records** (`packages/schema/src/collections/rules.ts`, `docs/data-schema.md` §3.1):
  - `scope`: `"general" | "institution" | "unsettled"`, required.
  - `scope_institutions`: `[{ id, name_he }]`. Required for `institution`; for `unsettled` it lists where the content was seen.
  - `scope_settle`: English, what would settle it. Required for `unsettled`.
  - Author it in the rule base as a `- Scope:` line under each rule (README vocabulary), extracted the way sources are (`packages/pipeline/scripts/extract-sources.ts` or a sibling).
  - Strength stays as it is: A items are `scope: general` with strength `institution`.
- **Split mixed records** in the rule base so that one record has one scope. For example, KH-16 becomes Altshuler's documents and channel (institution) plus a timetable record (unsettled; seen at Altshuler, Mor, Harel, Infinity, Yachad Rofim). Likewise KGL-04, KH-08, KH-11, KH-21, KGL-06, KGL-16, SW-34, SW-35, MF-27, the fund-specific figures of ETF-09, ETF-13 and ETF-28, and the company clauses and figures of section 2.2.
- **Value objects** (`packages/schema/src/value.ts`): an optional `institution: { id, name_he }` whose own term the value is. It is separate from `source.publisher`, so a CMA dataset can carry a Meitav track's number. The site sets it when it builds a value from `data/fees`, `data/terms/deposits` or `data/funds`, or from a per-track CMA row.
- **Wrapper fields** (`packages/schema/src/collections/wrappers.ts`, §3.3): a product field holds only general values. Where the value depends on the institution, the field takes `{ varies: true, seen: [value objects with institution], rule_ids }`. This applies first to `lawful_exit.payout_business_days` and `fee_caps.balance` of child savings.
- **Institution registry**: a new `data/sources/institutions.json` mapping an id to its Hebrew name, CMA legal id, fee-snapshot id, deposit-terms bank id and hosts. Scope ids then resolve to `/companies/:id`, which already serves both managing companies (by legal id) and banks or brokers (by snapshot id).
- **Validator** (`packages/pipeline/src/validate.ts`):
  - (a) Every rule has a scope; `institution` names known ids; `unsettled` has `scope_settle`.
  - (b) P-09 rows and `guide_blocks` hold only `general` rules with a primary or mirror source (this closes the gap at line 266).
  - (c) A wrapper product field never holds a value with `institution`.
  - (d) A warning lists every site file that cites a non-general rule, for review.

### How each place treats an institution item

| Place | General (and A) | Institution (B) | Unsettled (C) |
|---|---|---|---|
| "שווה לדעת", questions page, home blocks | As today | Left out (validator) | Left out until settled |
| Guide money-in-and-out, fees, tax | As today; a cap only if legal | A `varies` field shows "תלוי בחברה" with the seen values named ("אצל אלטשולר שחם: עד 4 ימי עסקים") and a link to company pages. Never a cap, never "the product's" | "בתקנונים שנקראו: … (names)"; "אם זה כך בכל החברות לא נבדק" |
| Guide prose | As today | Allowed only in a sentence that names the institution | "נבדק רק אצל …" |
| Rules page | First in each product group | Kept (it is the full set), in a sub-group "אצל חברות מסוימות", with a scope line "חל רק על לקוחות אלטשולר שחם"; a filter "רק מה שחל על כולם" | Scope line "נבדק רק אצל מור; אם זה כך בכל הקרנות לא ידוע" |
| Labels | The evidence mark names the publisher: "לפי מסמך של הראל" in place of "לפי החברה" | A second, separate mark: "רק ב־{name}" | "נבדק רק ב־{name}" |
| Guide timeline, comparison, idle cash | — | Every term of a representative run is named where it appears (D21). For figures that vary by bank (deposit and current-account rates), D29's rule applies beyond the visuals: after review, move the 21 held records from `research/specs/2026-10-25-guide-signatures/held-deposits/` into `data/terms/deposits/`; show the range across collected banks by default and the person's own bank once they pick it (as the brokerage card does with providers); the idle-cash baseline becomes the person's bank, picked or entered, with the range as context | Same |
| Company pages (`/companies/:id`) | — | A new block, "מה נמצא במסמכים של {name}", lists rules and figures scoped to that id: for Altshuler KH-13, KH-16 and KH-25; for Interactive Israel and IBKR BRK-35 to BRK-45; One Zero BRK-38; Hapoalim BPN-10; Phoenix SW-07 and SW-09; Leumi SW-18 and BRK-23; Harel CS-09 and CS-18 | Listed too, marked "נבדק כאן; בחברות אחרות לא נבדק" |

### Files the fix would touch

- Decisions and docs:
  - `docs/product.md`: a new decision recording that scope is separate from strength and that generic places show only general items; amend D7 and D23's label wording; extend D29's rule to the timeline, the comparison and idle cash.
  - `docs/data-schema.md`: §3.1, the value object, §3.3, §4, and the new registry.
  - `docs/copy.md`: the labels. `docs/design-system.md`: the scope mark beside the D7 states.
  - `.claude/skills/il-finance/references/README.md` and the domain files: a `- Scope:` line per rule, and splits of the mixed rules.
- Schema and pipeline: `packages/schema/src/value.ts`, `collections/rules.ts`, `collections/wrappers.ts`, a new `collections/institutions.ts`, the JSON export; `packages/pipeline/scripts/extract-sources.ts`; `packages/pipeline/src/validate.ts`.
- Data:
  - `data/rules/*.json`: scope on all 500, about 130 needing review.
  - `data/instruments/wrappers/`: keren-hishtalmut, kupat-gemel-lehashkaa, pension-comprehensive, pension-general, provident-for-annuity, child-savings-provident and child-savings-bank.
  - `data/parameters/pinned-rules.json`; a new `data/sources/institutions.json`; `data/terms/deposits/` (the held banks); two glossary entries.
- Site:
  - Guide page: `site/app/components/guide/worth-knowing.tsx`; `site/app/routes/guide.tsx` (days row, fee caps, exit-row tag, strength tags); `site/app/lib/guide.server.ts`.
  - Labels, questions and rules page: `site/app/components/provenance.tsx` (label and legend); `site/app/routes/questions.tsx`; `site/app/routes/rules.tsx`, `site/app/lib/rules-filter.ts`, `site/app/lib/rule-uses.server.ts`.
  - Timeline and runs: `site/app/components/timeline/Timeline.tsx`; `site/app/lib/instruments.server.ts` (`institution` on per-track values); `site/app/lib/compare.server.ts` (`representativeOf` for deposit terms); `site/app/lib/compare.ts` (chip).
  - Idle cash and company pages: `site/app/lib/idle.ts`, `site/app/components/compare/idle.tsx`; `site/app/lib/institutions.server.ts`, `site/app/routes/company.tsx` (company block).
  - Prose: `site/app/content/guide/{keren-hishtalmut,child-savings-provident,government-bond,makam,brokerage-account,savings-plan,pension-comprehensive}.tsx`, `site/app/content/exposure/general-track.tsx`.
  - Copy: `site/app/copy.ts`, keys `numbers.legend.institution`, `provenance.weak`, `guide.feeNote`, `values.hints.cashPublished`, `guideBlocks.terms`, `r2.result.bankPublished`, `idle.baselineBefore`. This file and the guide-signature files are being edited by another builder now, so their changes go through that builder.

## 6. What would settle the C items

| Question | Items | Where the answer probably is |
|---|---|---|
| Is the 4-business-day withdrawal payment a legal timetable? | KH-16, KGL-08, PEN-33, CS-14 (Harel), the wrapper payout fields | The regulation or CMA circular that Altshuler's form calls "the timetable set in the law" (KH OQ16) |
| Are pension funds on CMA uniform bylaws? | PEN-09, 11, 12, 13, 15, 16, 19, 27, PEN-30's clause | The CMA uniform-bylaws circular (PEN OQ13) |
| Is there a CMA standard bylaw for child savings, and what does it fix (default-track equity band, fee after 21)? | CS-09, CS-18, CS-11 | The CMA circular on the standard bylaw; the Ministry of Finance tender terms; a third manager's bylaw (CS OQ7, OQ8) |
| Do kupat gemel lehashkaa bylaws follow a CMA template? | KGL-04, KGL-08, KGL-10, KGL-11, PF-24 | The CMA standard bylaw for kupat gemel lehashkaa (PF OQ2, OQ11) |
| Study fund: new account after a withdrawal; default track; the employee third; joining without an employer | KH-15, KH-19, KH-05, KH-02 | Harel's bylaw (already among the sources) for KH-15; the CMA tracks circular (KH OQ10); the 1964 approval rules or a collective agreement (KH OQ1, OQ2) |
| Is the 2.5% / 7.5% split "common"? | KH-04 | Extension orders and collective agreements (KH OQ3) |
| Bank custody of client securities | BRK-10, BRK-27 | A Bank of Israel proper-conduct directive; a second bank's general terms (REG OQ10) |
| What standard tracks hold | CAT-23 | The CMA list of investment tracks (שה 2024-1471) |
| IRA approved countries; seniority on transfer | IRA-11, IRA-23 | The IRA regulations' definitions (IRA OQ1) |
