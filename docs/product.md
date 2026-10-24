# Product definition

Written 2026-10-22 from `docs/discovery.md`, the four reports in `research/discovery/`, and the founder interview. Revised the same day after an independent review (appendix A lists what changed and what was rejected).
Status: **confirmed by the founder on 2026-10-22**, with the note that the decisions in section 1 may change as he acquires more information and context. Any later change is recorded in section 1 with its date and reason, and the capabilities that depend on it are re-checked. This document defines what the site is; the build order in section 7 is a suggestion.

Marking convention for each capability:

- **[R]** supported by research: the problem and the shape of the solution come from the reports or the interview.
- **[P]** my own proposal: not in the reports or interview; included because the site would be incomplete for the stated decisions without it.
- Mixed cases say which parts are which.

No figure, rate, ceiling or fee appears in this document. Where one is needed, the capability names the data file, rule or parameter it will read from.

---

## 1. Decisions

These were open questions in `docs/discovery.md`, or were raised by the review. Each is resolved in the way the interview points to. **All of D1 to D13 were confirmed by the founder on 2026-10-22**, subject to revision as he learns more. The rest of the document follows from them.

| # | Decision | Basis |
|---|---|---|
| D1 (was O1) | **Audience is the founder plus a small known group of friends and family.** No accounts, no server-side personal data. Each person's inputs live in their own browser and can be exported to a file. `CLAUDE.md` must be updated from "personal use only, only user" to this. The no-commercial and no-legal-work rules stay. | Interview: "me and a few friends"; not commercial. |
| D2 (was O2, N2) | **Instrument scope in two tiers, and tier 2 is a list, not pages.** Tier 1 (full support in every capability): current account, bank deposits and savings plans, money-market funds, makam and government bonds, ETFs and index funds (Israeli-listed, foreign-registered on TASE, and foreign-domiciled), active mutual funds, kupat gemel lehashkaa, keren hishtalmut, pension fund (new comprehensive, and the general fund that takes deposits above the comprehensive fund's ceiling; clarified 2026-10-23, D19), provident fund for annuity, child savings, IRA. Tier 2 (named on one "not covered yet" page with what is known, what is open, and why): savings policies, executive insurance, structured deposits, corporate bonds, managed and robo portfolios, foreign-currency deposits, REITs, gold via funds, Amendment 190 deposits. A tier-2 instrument moves to tier 1 when it has a sourced record and its tax questions are closed. Out: P2P lending and crypto (founder: not important; may be added later if a friend asks), derivatives, leveraged FX, private equity, physical real estate, collectibles. **Within every tier-1 wrapper, coverage must be complete at the level of what institutions actually offer**: every product and track a bank or manager offers is in the site's catalogue (3.10), explained in plain Hebrew, and is a candidate in every comparison it is eligible for (principle "no blind spots", section 2). | Interview: founder's success test names tier 1; "support a bit more choices" for friends keeps tier 2 in scope; the tax report leaves most tier-2 taxation open, so honest pages cannot be written yet (review item 25). Founder, second round: P2P and crypto out; completeness at the level of what institutions offer. Founder, 2026-10-23: the point is that the site must be aware of every option, or it cannot recommend among them; decoding an app's own screens was a misreading (appendix E). |
| D3 (was O4) | **Every displayed number carries its date and source, and the page says when it is older than its normal cadence.** Cadences come from the data report: daily for rates and FX, monthly for fund fees and yields, snapshot-with-date for bank and broker tariffs. The site keeps its own dated snapshots because no public archive exists (section 6). | `CLAUDE.md` rule; data report 5.2, 6.3. |
| D4 (was O5) | **Fees are shown at up to three levels: list price, regulator-reported average where one exists for that provider class and fee type, and "entered by you" if the person types their own.** The site never claims to know a negotiated price it was not given, and says "no reference available" where no average exists (for example, non-bank brokers). | UX report 4.2, 4.5; data report 1.3, 6.3. |
| D5 (was O6, N1) | **The site names a best option for the stated goal, and names near-ties as ties.** The tie threshold is a **site parameter** (section 3.8), not a rule: a value with a rationale and a founder sign-off date, shown on the page as "site parameter". | Interview stance; forum evidence that many options are equivalent in practice. |
| D6 (was O7) | **Instruments are modelled as wrappers holding exposures.** A wrapper record holds tax treatment, liquidity, fee bases, ceilings and eligibility with dates (brokerage account, kupat gemel lehashkaa, hishtalmut, deposit, and so on). An exposure is what the money is invested in (a tracked index, a bond type, cash). The same exposure can be compared across wrappers. If the arbitrage reform merges wrappers, a new wrapper record is added and old ones are dated as closed. | Founder's own example (the same index inside a brokerage vs inside a provident fund); UX report 4.8; review item 2. |
| D7 (was O8) | **Three visual states for any number: sourced, computed, entered by you.** A computed number lists the inputs, rules and parameters it came from. | `CLAUDE.md`; review item 33. |
| D8 (was O3) | **The founder's own goals are inputs, not product decisions.** | Interview. |
| D9 (new) | **Expected returns are never guessed by the site.** For cash-like exposures, projections use sourced series (policy rate, deposit-rate averages, makam yields, CPI). For equity and bond exposures, the comparison either runs at an equal gross return across wrappers (which needs no return assumption) or uses a return the person enters, shown as "entered by you". A sourced scenario file may be added later; until then no equity return appears as a sourced number. *Provisional amendment 2026-10-24 (lead, for the founder's confirmation):* a **published past record** of an index (the ranges of outcomes over N-year windows, as a publisher states them, labelled "עבר, לא תחזית", never entering a run, a ranking or a prefilled field) may be shown beside the person's horizon so the site can answer "is N years enough for stocks" honestly (MKT-01, J.P. Morgan Guide to the Markets, D22). The ban on sourced *expected* returns is unchanged. Reason: the scenario audit (research/audit/2026-10-24-scenario-audit.md) found the site could not answer the most common question a young saver asks. A series (Damodaran 1928–2025, 7-year windows, share of losing windows) waits for the founder's reading of its terms. | `CLAUDE.md`; review item 3; scenario audit 2026-10-24. |
| D10 (new) | **Rule strength policy.** A rule sourced from a primary document computes and is shown as "primary". A rule with only a secondary source computes and is labelled "secondary source" wherever it affects a number. A rule marked open does not compute; the page says the comparison is incomplete for that reason. | Tax report strength tags; review item 19. |
| D11 (new) | **Loss tolerance is a filter the person sets, not a score.** The person states the largest fall they would accept over the horizon per exposure type, labelled as their choice. No questionnaire, no sourced mapping is claimed. | UX report 6 (robo questionnaires unreliable); review item 21. |
| D12 (new) | **Goals are evaluated one at a time, in the order the person gives, with a manual split of the available balance across them.** No allocation engine. | Review item 7. |
| D13 (new) | **A goal is a free-form set of attributes, not a type.** The engine works on horizon, amount, contributions, how much must stay available and when, the loss filter and constraints. The named goal types (liquid reserve, purchase at a known date, long-term wealth, a lump sum, a child) are presets that fill those attributes as an easy entry point; the person can start from any of them or from none and change every attribute. | Founder, second round: "there are infinite possibilities for people; the examples serve as an easy entry point". |
| D14 (2026-10-22) | **Health tax (מס בריאות) is outside what the site compares.** The site does not compute it, show it or note it for any instrument. National Insurance stays in, because the rule base sources its exemption for interest, dividends and gains (TXG-27, TXG-28). | Founder, 2026-10-22: the site helps people choose investments and does not advise them on their own health-tax obligations. Checked the same day (TXG-34): the Health Insurance Law charges health tax on the same income as National Insurance, so savings interest, dividends and gains do not attract it. One exception remains: interest taxed at marginal rates, such as study-fund gains withdrawn early, may attract it (method G-27). |
| D15 (2026-10-23) | **The study fund in wrapper mode depends on how the person works.** For an employee, the keren hishtalmut is listed but not ranked, with the reason: "only funded through your employer; you already deposit the tax-free maximum". It still appears in the holdings review (3.6). For a self-employed person it is ranked, for the part of the goal's money up to the benefited deposit of 20,566 NIS a year (TXH-08). Money above that is reported and routed like any other wrapper ceiling (method F-05, D12). | Founder, 2026-10-23, after the independent check (`tests/golden/workings.md` Q12): an employee can pay into a study fund only through the employer, capped at 2.5% of salary, which most already pay (KH-02, TXH-08). Ranking it would name a winner the person cannot act on. |
| D16 (2026-10-23) | **A wrapper still locked at the horizon is shown at its unlock date with deposits stopping at the goal's horizon.** The money already in keeps growing until the unlock date. This applies when a wrapper is listed, not ranked, because its lawful exit comes after the goal's horizon (method B3). | Founder, 2026-10-23, after the independent check (the 4-year study-fund example): the goal ends at its horizon, so the comparison should not assume money the person did not plan to put in. |
| D17 (2026-10-23) | **No blind spots: every comparison chooses from the complete set of options.** The candidates of a comparison are every option the site knows of at that level, not a sample: every tier-1 wrapper and the tier-2 list in the goal comparison (3.2); every provider, every track (from the CMA data) and every fund (from the Maya fund list, CAT-33; TASE's list of foreign funds traded on TASE, ETF-32; and `data/funds/`) in the workbench (3.4); every track in the catalogue for the fit mark (3.10). Each candidate ends in exactly one of: ranked, listed but not ranked (B3), excluded by the person's constraint, not eligible, or not evaluated, each with its reason (method F-83); a group the site knows exists but does not hold one by one (for example foreign-domiciled funds) is named as a group. Each comparison states how many options it considered. | Founder, 2026-10-23: the Meitav example meant "the site must not be blind to these options; how can it recommend things when it is not aware of a lot of options?" Corrects the reading of that example (appendix E). |
| D18 (2026-10-23) | **Exposure guide pages in release 1:** shekel cash, makam, unlinked government bonds, CPI-linked government bonds, the S&P 500, the TA-125, and a general (mixed) track. Foreign-currency cash stays with foreign-currency deposits in tier 2. Track classifications get no exposure page of their own; the track pages cover them. More indices are added when the founder or a friend asks about one. An index page explains the index only once the rule base does (`docs/glossary.md` section 4 lists S&P 500 and "מדד" as missing). | Chosen by Claude at the founder's request (2026-10-23, "do whatever you think fits"). The S&P 500 is the founder's own example (ETF against provident); the TA-125 is the main Israeli index; the rest are the exposures of the tier-1 cash and bond wrappers and of the general provident tracks. |
| D19 (2026-10-23) | **The general pension fund (`pension-general`) is in tier 1**, as part of the pension fund in D2. | Chosen by Claude at the founder's request (2026-10-23). The comprehensive fund moves deposits above its ceiling into the general fund (rule base, pension file), the CMA data lists the general funds, and D17 needs every option in the catalogue. Data-schema already listed its wrapper ID; D2's wording named only the comprehensive fund. |
| D20 (2026-10-23) | **The Bank of Israel series are links, not numbers, until the Bank consents in writing.** The Bank's terms of use (last updated 17/02/2025) do not permit copying or publishing its material without its prior written consent, and the data.gov.il copies that dependency 7 named as the first fallback do not exist for any of the three series (policy rate, per-bank deposit averages, makam yields; checked 2026-10-23). So dependency 7's second fallback applies, "link out and show no number": wherever the site would show a policy rate, a per-bank deposit average or a makam yield, it links to the Bank's page and shows no number; the idle-cash preset (3.2) runs on the rates the person enters, shown as "entered by you" (method A-26, and A-20 and A-22 in that state); the refresh workflow does not fetch EDGE and no Bank series is committed to the repository. CBS CPI and the Ministry of Finance child-savings rates are confirmed and shipped. Asking the Bank in writing for consent is the founder's call; on 2026-10-23 he decided not to ask for now and to hold the series as links. If that changes and consent is granted, the series join the refresh (section 6) and this row is dated closed. | Chosen by Claude at the founder's request (2026-10-23), revisable. Discovery O14 and the research note r2-series of the same day: the terms were read in archived copies because the live page is a script shell; the EDGE data browser links to the same page and has no terms of its own. |
| D21 (2026-10-23) | **The goal presets and the representative instruments are site parameters.** The five presets of D13 (liquid reserve, purchase at a known date, long-term wealth, a lump sum, a child) are P-07, `data/parameters/goal-presets.json`: each fills horizon, monthly deposit, how much must stay available and whether it must be withdrawable at any time, never an amount (the loss filter waits for release 5, D11). The illustrative scenario P-05 names, per wrapper, the collected record the guide-page timeline takes its terms from (`instruments`: Leumi's deposit terms and tariff, two Altshuler Shaham money-market funds and IBI's S&P 500 ETF, Meitav's study-fund track 880 run as self-employed, the GOV-11 bond series) and an annual income for the runs that need one; a wrapper without an entry shows no timeline. | Chosen by Claude at the founder's request (2026-10-23), revisable; values and reasons in `docs/parameters-rationale.md`. The representative instrument is the first collected record of each kind, not a recommendation: the page names it and every term shown carries that record's source. **2026-10-24 (Doron's case):** in the comparison the brokerage account is priced on whichever collected list tariff leaves the goal the most (method F-80), named on the card as the site's pick with "להחליף" beside it; P-05's tariff entry serves the guide page and the fee page only. |
| D22 (2026-10-24) | **A single published figure may be quoted with attribution; a series or a list needs confirmed terms.** An annual average, a cap or a rate printed once in a regulator's or an institution's document is shown on the site with its source and date (fair quotation, as gov.il's terms allow and as the rule base already does). A time series, a dataset or a fund list is republished only when its terms are confirmed (the terms gate, architecture 3.3; D20 for the Bank of Israel). Where a publisher's terms forbid copying its content (the ISA's and TASE's sites, read 2026-10-23), the site shows the figure's existence and a link, not the number, until the publisher consents. | Chosen by Claude at the founder's request (2026-10-24), revisable; it settles how MF-55 (the ISA's fee report), BRK-37 (TASE's fee calculator) and PF-39 (the CMA's report on gov.il) are used in release 3. |
| D23 (2026-10-24) | **Institution-strength rules compute, labelled.** D10 named primary, secondary and open sources only. A rule whose only source is an institution's own binding document (a fund's bylaws, a prospectus, a tariff, an insurer's policy terms) computes like a secondary rule and every number that rests on it carries the label "institution source" (D7's caution state); it never counts as closing a tax question for tier-2 graduation (D2), which still needs a primary or secondary source. | Chosen by Claude at the founder's request (2026-10-24), revisable. It writes down what the engine's figure resolver has done since release 1 (coverage.md F1): the kupat gemel lehashkaa exit base (TXK-07), the ceilings taken from managers' pages, Reit 1's withholding practice (TX2-20) and Phoenix's policy figures (TXA-28) are the cases it covers. |
| D24 (2026-10-24) | **No change log.** The site keeps no change log and shows no "what changed" page: git history, each data file's `checked` date and the raw-download archive are the record, and a saved comparison's revisit (3.9) compares the versions it stored with the current ones. A "news" section for events such as a law passing is a parked idea (section 8, N7), not a capability. | Founder, 2026-10-24. |
| D25 (2026-10-24) | **The rule base and the documents behind it are a user-facing capability.** The rules page opens on a short list of the questions people ask (site parameter P-09 `pinned-rules`, kept by the founder as drafted on 2026-10-24; importance is a judgement, never a strength and never a computed score alone), then every rule on the same page, with filters by the reader's question (five "shelves": what the state takes, what the bank or manager takes, what you can do with the money, who supervises and what is protected, how the product is built), by product, by id prefix and by "about to change", the pinned questions acting as filter presets or direct links (founder, 2026-10-24 evening: "everything under /rules with quality-of-life filters"; the five separate shelf pages of the first build were confusing); the full records load per shelf on demand so the page stays light; **amended the same night:** the questions left the rules page for their own page (`/questions`), each with a one-line answer written from its rules in which every figure is a sourced number, reached from the home page, the menu and a quiet line on the rules page, while the rules page starts at the set itself (founder: "the FAQ is first in the page and doesn't fit well; the rules page should be the entire ruleset with quality-of-life filters, then an FAQ should come in a different way"), and the set is named **"חוקים וכללים"**, a single record carrying no noun and a card reading "id · title" (founder, after turning down כלל, עובדה, סעיף, הוראה, תקנה and תנאים: "something along the lines of guidelines but in a more strict sense… definitely two words make sense here"); every rule shows its sources first (publisher, document, section or page, the quoted words where the record holds them, the date read, a strength word only when the source is weaker than the law; a law read on a mirror is labelled "נוסח החוק (עותק)" and opens at the section); a documents page lists the official documents and the data records the site read, each with the rules that rest on it; the search covers rules (title, id, question phrasings, the figures as numbers), parameters and documents; each wrapper guide shows two or three facts worth knowing from P-09. Every rule record carries `sources` extracted from the rule base by script and checked by the validator. Not built: a cross-provider tariff table, per-rule pages, counts or boasts, a myth section, full-text search over rule bodies. | Founder, 2026-10-24: "make our data directory accessible … the user should be intrigued by browsing the data we hold, not overwhelmed … a user can click a rule and immediately get a link to a government paper"; the six specialist reports and the lead's synthesis in `research/knowledge/`. |

---

## 2. Who it is for and what it must be

**Users.** The founder (22, salaried, Israeli tax only, no self-directed investment yet) and friends and family with similar questions but different ages, employment and holdings. All in Israel. Hebrew speakers. Using a phone at least as often as a PC. Each on their own device.

**The job.** A person has a goal, or money sitting idle, or an instrument already chosen, or holdings they never chose, or a product or track name in a bank or manager app they do not understand. They want to know, in Hebrew, with graphs: what their options are, how each works, what the thing an institution is advertising actually is, which is best for their case net of fees and tax over their horizon, which fund variant and which provider and track to pick for it, which fees are worth fighting, and what they might be failing to consider. Then they want to act and be able to come back later and see whether anything changed.

**Done when** (site-level success, from the founder's interview; reviewed with the founder one quarter after first use):

1. The founder has moved the idle cash into a chosen wrapper and exposure at a chosen provider, using the site.
2. The founder can list what the site considered for that decision and says the list contained at least one dimension he had not thought of.
3. The founder has negotiated or deliberately ignored at least one fee based on the site's shekel figure.
4. One friend has gone from a goal to a concrete choice using the site alone, on a phone, in Hebrew.
5. Every product and track offered by the banks and managers the founder uses is in the site's catalogue, explained in plain Hebrew, and is considered by every comparison it is eligible for, or shown there as not evaluated with the reason (D17). The test case is the Meitav app (not Meitav Trade): its "open a new saving" opens a kupat gemel lehashkaa (fund 7857) whose regulator record lists 16 tracks, one of them "כללי"; all 16 are in the catalogue, so the eight the app shows are among them, and whatever the app's second "כללי" turns out to be, it is one of the Meitav products and names the catalogue holds (CAT-28).

**Fixed constraints** (from `CLAUDE.md`): Hebrew UI, right-to-left; phone and PC; non-commercial; no accessibility, legal or commercial work; every number traces to a file under `data/` with source and date; no financial or tax rule from memory, only from the `il-finance` rule base; lists are starting points.

**Principles the research adds:**

- **Neutral by construction.** No referrals, no agents, no affiliate links. The site can show "the best option that pays nobody" (UX report 4.3, 6).
- **Fees before past returns.** Ranking by past return predicts weakly; fees predict better (UX report 6, Morningstar evidence). Returns are shown as history, not as a ranking key.
- **Collapse equivalent options.** Much of the choice set is noise (UX report 4.4). The site says "these are the same for your purpose" rather than ranking indistinguishable funds.
- **Show the dimension, not just the answer.** The founder's blocker is unknown unknowns. Every comparison shows the list of what it considered.
- **Process is part of the price.** Getting the real fee and switching provider are where people get hurt (UX report 4.5).
- **Real terms by default.** Every projected value is shown in real terms, with nominal available on request; the deflator is defined in `docs/method.md`.

**Principles the founder adds:**

- **Interactive by default** (2026-10-22). Every graph and computed number responds to the person's inputs. The inputs a computation uses (the assumptions in `docs/method.md` §2.2) start from a sourced value or a site parameter, can be changed on the page where the result is shown, and once changed are shown as "entered by you" (D7). Rules from `il-finance` are not inputs and cannot be changed by the person; site parameters that are judgements (the tie threshold, verdict thresholds, sensitivity bounds) are shown, not edited, so a ranking cannot be tuned into a different answer.
- **No blind spots** (2026-10-23, D17). A recommendation is only as good as the options it knows. Every comparison chooses from the complete set of options at its level, accounts for each one with its outcome and reason, and says how many it considered. An option the site knows exists but cannot evaluate yet is shown with the reason, never silently left out.

---

## 3. Capabilities

Ten capabilities. Each: the problem, who supports it, what the user puts in, what they get out, the data, rules and parameters it needs, and how we know it works. "Works when" items point to hand-worked cases in `tests/cases/` (section 3.8) so "correctly" has a reference answer.

### 3.1 Instrument guide [R]

**Problem.** The founder and his friends do not yet know what each instrument is for, how it works, and when it beats another. The founder named this as the first thing the site must do. In a 2019 survey for the regulator, about half of respondents said they understood their pension report little or not at all (UX 4.1).

**In.** Nothing required. Optionally the person's age, employment type and horizon, which highlight the parts that apply to them and also feed the timeline; and the amount now, monthly deposit, return and inflation behind the timeline (see Out).

**Out.** One page per tier-1 wrapper and per exposure type, in a fixed structure so pages can be compared side by side: what it is; who offers it and under which regulator; how money goes in and out (ceilings, lock-ups, exit points); what it costs (every fee type that applies); how it is taxed at deposit, during, and at exit, including exemptions and what changes without a tax event; risks and what is not protected (for example, no deposit insurance in Israel); typical use and horizon; the dimension checklist for it (3.3); the terms a bank, manager or regulator uses for it, matched to what appears on a statement. Each page has a visual: a timeline of money in, growth, fees and tax out, with the rules it used listed beside it. The timeline opens on the illustrative scenario (a site parameter, P-05 in `docs/method.md`), and every value behind it can be changed on the page: amount now, monthly deposit, horizon, return, inflation, age and employment type. A changed value is shown as "entered by you" (D7); a return the person enters is never presented as the site's view (D9). The values the person enters follow them to the catalogue and the goal comparison, so they are not typed twice. The page still shows one wrapper at a time; ranking wrappers against each other stays in 3.2. One further page lists tier-2 instruments with what is known and which open question blocks each (D2).

**Data and rules.** Wrapper and exposure records in `data/instruments/` (domain report 4.1 to 4.5). Tax treatment per wrapper from the rule base (tax report sections 1 to 5). Institution lists per wrapper (domain report 5). Regulator per wrapper (domain report 3). Term list in `data/terms/` drawn from the domain report's Hebrew terms and the CMA dataset field names.

**Works when.** A friend who has never heard of a money-market fund can say, after reading the page, what it is, how to buy one, what it costs, how it is taxed and when a deposit beats it. Every claim on the page links to a dated source. The founder's age-60 example from the interview is answered on the kupat gemel lehashkaa page in a way that matches the tax report. A term copied from a pension statement finds the right page.

### 3.2 Goal to wrapper and exposure comparison [R]

**Problem.** Given a goal and a horizon, which wrapper and exposure fit, net of fees and tax over the whole horizon, including rules such as exemptions and tax-free track switches. The UX report found no Israeli tool doing this, as an inference from absence (UX 1, point 6; 10.1 item 2 leaves open whether the ISA runs a live fund-fee tool). Founder's rank 1.

**Two modes** (D9):

- **Wrapper mode:** the same exposure inside each eligible wrapper, at an equal gross return. Fully supported by sourced fee and tax data. This is the founder's own ETF-vs-provident question.
- **Exposure mode:** which exposure type suits the horizon and the stated loss filter. Cash-like exposures use sourced series. Equity and bond returns are entered by the person and labelled so.

**Presets:** an **idle cash** entry point (the founder's current state and the Bank of Israel's description of households, UX 4.6): two inputs, the current-account balance and the part that must stay available at once, run through the same engine with the "liquid reserve" preset filling the other attributes. Meant to be the first thing a friend sees.

**In.** A goal as attributes (D13): horizon; amount now and monthly contribution; how much must stay available, and from when; optionally a preset (liquid reserve, purchase at a known date, long-term wealth, a lump sum, a child) that fills these as a starting point and can be edited freely; the split of the available balance across the person's goals, in their order (D12); age; employment type; gross monthly salary and current employer and employee contribution rates, with "where to find this on the payslip", because wrapper ceilings and deposit-side benefits depend on them (tax report 3.1, 3.2; domain report 4.3); whether the person already has a pension and hishtalmut through work; the loss filter per exposure type (D11); constraints such as "must be withdrawable at any time" or "must not need an annual tax return". For the idle-cash preset: also the deposit offer the person sees in their own bank app, entered by them, since no public feed of current offers exists (data report 6.3 item 5; banks must display offers since April 2025, domain 4.1).

**Out.** A ranked list of eligible wrappers (or exposures) with, for each: projected real value at the horizon net of fees and tax; the assumptions, each marked sourced or entered; what is locked and when; which rule, fee or parameter decides the ranking; whether the difference to the next option is a tie (D5). A chart of projected value over time for the top options on one axis. A line in plain Hebrew: "X is best for this goal because Y." The dimension checklist (3.3) with every item marked considered, not applicable, or blocked by an open rule (D10). A **sensitivity panel**: which assumption changes would flip the top result and by how much, within bounds set as site parameters; this panel is a shared engine feature also used by 3.4, 3.5 and 3.6. For the idle-cash preset: the computed monthly cost of leaving the money where it is, against the liquid options, with the Bank of Israel figure labelled "average paid at this bank last month" and the person's own offer labelled "entered by you". A link to the provider workbench (3.4) for the chosen wrapper. A **coverage line** (D17, method F-83): how many options were considered, and every tier-1 wrapper that is not ranked, with why (listed but not ranked, excluded by the person's constraint, not eligible, or not evaluated); every tier-2 instrument named as not evaluated, with its open question; the tracks and fund variants inside each wrapper are compared in 3.4, and the line links there.

**Data, rules and parameters.** Wrapper and exposure records; fee data per wrapper type: CMA average fees for provident, hishtalmut and pension tracks (data report 1.2), the ISA's annual average fee by mutual-fund category including money-market funds (domain report 4.2, from the ISA report; this is one category average per year, not per fund), bank and broker tariffs from 3.4's snapshots; the tax rule base for each wrapper's treatment, ceilings and exemptions (tax report sections 1 to 3, 7); sourced series for cash-like projections: Bank of Israel policy rate, per-bank average deposit rates, makam yields, CBS CPI (data report 1.3, 1.5); the tie threshold and sensitivity bounds as site parameters.

**Works when.** `tests/golden/` holds hand-worked cases, checked by the finance-reviewer against `docs/method.md`, including: the founder's apartment goal (every tier-1 wrapper and tier-2 instrument is accounted for in the coverage line, every one that fits is ranked, and the ranking matches the case when horizon or employment type changes); the founder's ETF-vs-provident example in wrapper mode, with the exit-tax and track-switch dimensions marked as considered; a friend's idle-cash case completed on a phone in under a minute. Two people with the same inputs get the same answer and can see why. A reviewer with the tax report in hand finds no rule applied that is not in the rule base. The founder reports that the output includes at least one dimension he had not thought of.

### 3.3 Dimension checklist, or "what you are not considering" [R problem, P form]

**Problem.** The founder's stated reason for not investing: a decision looks complete until a dimension appears that was not on the list. The most-viewed beginner guide on the forum is exactly a sequence of dimensions (UX 3.1, Q8). The research supports the problem; the form here is my proposal.

**In.** A wrapper, an exposure, a fund variant, or a comparison in progress.

**Out.** The full list of dimensions that matter for it, each with a one-line explanation, its source, and a mark showing whether the current comparison has taken it into account, found it not applicable, or is blocked by an open rule. Dimensions include at least: tax at exit, real vs nominal taxation, exemptions by age or use, tax events on switching, loss offsetting, foreign withholding and domicile, distribution policy, every fee type, fee changes over time, liquidity and lock-ups, deposit ceilings, protection and what is not insured, currency exposure, minimums, who the regulator is, and reporting obligations. The list is shown inside 3.1, 3.2, 3.4 and 3.6, not as a separate article.

**Source of truth.** The list is hand-maintained in `data/dimensions/` with a source per dimension, drawn from the domain report (4.x tables), the tax report (sections 1 to 8, 10) and the UX report (Q8). The rule base tags each rule with the dimensions it affects, so a new rule can mark a dimension as covered or open without the list being rewritten.

**Works when.** The founder's ETF-vs-provident case shows the exit-tax and track-switch dimensions marked as considered. A rule entering the rule base as open changes a dimension's mark to blocked without any page edit.

### 3.4 Provider, track and fund-variant workbench [R]

**Problem.** Once the wrapper is chosen, three choices remain that the interview and the forum name together: which provider gives the best deal on the whole cost structure, not one headline fee (UX 4.2); which track inside the provider (passive vs active, index concentration, UX Q4); and, for a brokerage wrapper, which fund variant to buy for a given exposure: Israeli tracking fund, Israeli ETF, foreign-registered fund on TASE, or foreign-domiciled fund, which differ in fees, domicile, distribution policy and the security number the bank asks for (interview; UX Q1, Q13). Founder's rank 2. The data is the weakest in the landscape (data report 2, 6.3), so this capability degrades honestly.

**In.** The wrapper and exposure. The amount and the monthly contribution. Behaviour that drives fees: trades per month, foreign-currency purchases, deposits per year, expected holding period. Optionally the fee the person already has or was offered, entered by them.

**Out.**

- **Providers:** a table of providers that offer the wrapper, with total expected cost per year and over the holding period, broken into fee types; list price, regulator average where one exists for that provider class and fee type, and "entered by you" side by side (D4); the date and source of each tariff; a ties marker (D5); minimums; regulator and protection status (for example, a foreign broker not supervised by the ISA, domain report 4.4). A chart of cumulative cost by provider over the holding period. A clear "not comparable, data missing" row for providers whose tariff could not be obtained, with the reason.
- **Tracks:** for provident, hishtalmut, pension and gemel lehashkaa wrappers, **every** track each provider offers for that wrapper, as listed in the CMA data and as the provider names it (3.10), with the CMA fee and classification per track, and a fit mark against the person's horizon and loss filter using the same logic as 3.6. Tracks for other exposures than the one chosen are shown too, collapsed, so the person can see that they exist and what they are for.
- **Fund variants:** for brokerage wrappers, every fund available for the chosen exposure (D17): every Israeli fund in the Maya fund list (CAT-33, CAT-34) that matches the exposure by classification and reference asset, every foreign fund traded on TASE in TASE's list (ETF-32) that matches it, and the foreign-domiciled funds traded abroad held in `data/funds/`, compared on fee, tax treatment by domicile and distribution policy from the rule base, and the dimension checklist. A fund whose details are not collected yet in `data/funds/` (fund name, security number, manager, domicile, distribution policy, prospectus fee, date) is shown as "not evaluated: details not collected". Foreign-domiciled funds traded abroad have no complete list (ETF OQ4), so the table names them as a group and says how many it holds. If Maya's terms do not allow republishing the list (dependency 7), the Israeli funds without a record are one line with their count and a link to Maya. Where a variant's tax treatment is an open question (for example, accumulating foreign funds, tax report Q1), the variant is shown with that dimension blocked.

**Data, rules and parameters.** Provider list per wrapper from the regulator datasets and reports (domain report 5.1 to 5.5). Tariffs: bank and broker price lists snapshotted per institution with date (data report 2.1, 2.2; Leumi, Mizrahi and Discount publish structured files, others PDF or blocked). Regulator averages: CMA datasets for fund tracks (data report 1.2); Bank of Israel per-bank fee averages for the banks only (data report 1.3); no average exists for non-bank brokers, and the table says so. Fee rules: which fee types apply to which wrapper, and fee caps where regulated (domain report 4.3; the caps are open questions in the domain report and must be sourced first). Protection and supervision status per provider (domain report 4.4, 5.5). The Maya fund-list export as the set of Israeli funds (CAT-34) and TASE's list of foreign funds traded on TASE (ETF-32), and `data/funds/` for each variant's details, hand-collected from prospectuses (data report 6.3 items 2, 3; discovery O13).

**Works when.** For "ETF in a brokerage account with a given monthly purchase", the table ranks the brokers and banks for which tariffs were snapshotted, states total annual cost per provider, and shows which fee type drives the ranking; changing trades per month from one to ten re-ranks as the test case says. Every provider without a tariff is listed as missing, not omitted. A person who typed their own fee sees the comparison shift accordingly. For a hishtalmut, every provider's tracks appear with fee and classification, and none of the tracks the catalogue holds for that wrapper is missing. For a chosen index, every Israeli fund in the Maya list that tracks it appears, compared or marked "not evaluated" with the reason, and the security number is shown.

### 3.5 Fee materiality [R]

**Problem.** "Which battles to fight": some fees are negligible and some are a large lifetime difference, and people cannot tell which (interview; UX 4.2). Founder's rank 3.

**In.** A wrapper or holding; amount and contributions; horizon; each fee type with its current rate, either entered from a statement or taken from the workbench (3.4).

**Out.** For each fee type, its real shekel cost over the horizon, computed and labelled as computed (D7), ranked largest to smallest; a verdict per fee: worth negotiating, worth avoiding by choosing a different provider or wrapper, or not worth the effort, with the verdict thresholds shown as site parameters; the regulator average for that fee type as a reference where one exists (D4), "no reference available" otherwise; what a stated reduction would be worth. A chart of fee drag over time per fee type. Plain-Hebrew text for the negotiation: which fee, what reference to cite, where the reference comes from. The sensitivity panel from 3.2.

**Data, rules and parameters.** Fee types per wrapper and their bases (on deposits, on balance, per trade, per conversion) from the domain report; regulator averages where they exist (data report 1.2, 1.3); caps where sourced; verdict thresholds as site parameters; the compounding and deflation rules in `docs/method.md`.

**Works when.** The founder enters his hishtalmut and a hypothetical brokerage plan and gets a ranked list that says which fee to negotiate first and which to ignore, matching the test case. The thresholds are visible on the page and live in `data/parameters/`, not in code.

### 3.6 Holdings review [R]

**Problem.** Many people hold funds and tracks they never chose: parental kupot gemel, a child-savings plan, a default pension fund. Fees may be at list price and tracks may not fit the horizon (UX 3.1 Q10, 4.6). Founder's rank 4, "important for older people".

**In.** Each holding: wrapper type, managing company, track name, balance, fee on deposits and on balance, as read from the annual statement or the clearing-house report. The site shows where on the statement to find each, using `data/terms/`.

**Out.** Per holding: the track's CMA classification against the person's stated horizon and loss filter (not the asset mix, since CMA holdings data stopped in 2023, data report 6.3 item 9); whether several holdings of the same wrapper type at different managers could be consolidated and what the transfer rules allow; whether the child-savings plan is in a chosen or default track. Everything fee-related is handed to 3.5, which returns the ranked actions by shekel impact. A link to the switching playbook (3.7).

**Data and rules.** CMA fund-level data: fees, yields, assets and track classification per fund, monthly (data report 1.2); the field definitions must be confirmed before display (discovery O11). Wrapper liquidity and transfer rules (domain report 4.3). Child-savings rules from the National Insurance pages (domain report 4.3).

**Works when.** The founder enters his parental kupot gemel and child-savings plan and gets, for each, a classification-fit statement and a consolidation answer, plus 3.5's fee figures, matching the test case. Nothing is shown for a fund that is not in the CMA data; the page says so.

### 3.7 Switching playbook [R problem, P form]

**Problem.** Changing providers is where people get hurt: clearing-house consent, agents, retention calls, offers withdrawn, fees worsening after a job change (UX 4.5). The founder did not raise it; the research did. It becomes relevant the moment 3.4, 3.5 or 3.6 leads to action.

**In.** The wrapper, the current provider, and the target provider or target fee.

**Out.** The ordered steps to switch that wrapper, each with what the person must sign or authorise and what to expect next, including the retention call and whether agent involvement can be declined; a checklist of what to verify after the switch (fee on the first statement, track, transferred balance); a reminder to write down each offer with its date, because quotes get withdrawn. Steps that state a process rule are rendered from rule-base entries, not written as prose (D10); forum-derived expectations are shown as experience, with their source and labelled as such.

**Data and rules.** Transfer and withdrawal rules per wrapper (domain report 4.3; several are open questions and must be sourced). The clearing-house process and consent rules from the regulator; the regulator's pages returned errors to scripts (data report 5.1), so this needs a manual source pass before the playbook can ship (section 5).

**Works when.** A person switching a hishtalmut can follow the steps without visiting the forum. Every step that states a rule links to its rule-base entry.

### 3.8 Rule base, parameters and method (change log removed 2026-10-24, D24) [R as constraint, P as a user-facing capability]

**Problem.** Ten rules are likely to change or be misremembered in the next two years (tax report 10). The founder's own tax claim did not match the report. The `il-finance` rule base named in `CLAUDE.md` does not exist. The site must never state a rule it cannot cite, and must not pass off product judgements as rules.

**Three stores, kept apart:**

- **Rules** (`il-finance`): legal and product facts with text, conditions, exceptions, figures by tax year, source link, date checked, strength (primary, secondary, open) and the dimensions they affect. Seeded from the tax report (sections 1 to 9) and the domain report (ceilings, liquidity, caps). The tax report's 22 open questions and the domain report's 23 become the open list.
- **Parameters** (`data/parameters/`): site judgements such as the tie threshold, fee-verdict thresholds and sensitivity bounds, each with value, rationale and founder sign-off date, shown on the page as "site parameter".
- **Method** (`docs/method.md`): every calculation defined (real vs nominal, the deflator, compounding, fee bases, tax at exit, equal-gross-return comparison), so the finance-reviewer can check the engine against it. `tests/cases/` holds hand-worked expected outputs for every "Works when" above.

**Out, for the reader.** Next to every rule-dependent number, a link that opens the rule, its source, its strength and its date. A rules page listing every rule the site uses, grouped by wrapper, with open questions marked. A parameters page (change log removed 2026-10-24, D24). *Amended 2026-10-24 (D25):* the rules page is a front of pinned questions (P-09) and five shelves by the reader's question, each a page; every rule and every sourced number shows its source block first (publisher, document, locator, quote, date, strength only when weak) and a copy-citation button; a documents page; rules, parameters and documents in the search; a "שווה לדעת" block on each wrapper guide.

**Works when.** A reviewer can take any number on any page back to a rule, a parameter, a data file or "entered by you", each with a date. No calculation uses a rule marked open. Each of the ten "likely to change" rules has a re-check date.

### 3.9 Saved state and revisit [P]

**Problem.** Friends and family use the site on their own devices without accounts (D1), and a decision made on today's rules should be revisitable without redoing the work. Nothing in the research covers this.

**In.** The person's inputs across 3.2, 3.4, 3.5 and 3.6, and the choice they made at the end of a comparison.

**Out.** One local state per browser, saved automatically, exportable and importable as a file so the founder can help a friend without any data on a server. A saved comparison records inputs, assumptions, the rule, parameter and data versions used, the result and the choice. On a later visit, re-running it against the versions it stored (change log removed 2026-10-24, D24) reports which rules, parameters or data points changed since and whether the ranking still holds.

**Data and rules.** The versioned stores in 3.8. The export format is versioned so an old file still imports (N3).

**Works when.** A decision recorded before a rule change shows "re-check: rule X changed on date Y" after it, and shows as unchanged otherwise. An exported file from one phone imports on another and reproduces the same results.

### 3.10 Catalogue of every option: what each institution offers [R: founder interview, second round, corrected 2026-10-23; data report 1.2]

**Problem.** A recommendation can only choose among the options it knows about. Institutions offer many more products and tracks than a generic list of wrappers and exposures names, each under its own names, and the names do not match from one institution to the next. The founder's example: the Meitav app's "open a new saving" leads to a kupat gemel lehashkaa and offers eight tracks, two of them named "כללי". The regulator's data lists 16 tracks for that fund, one of them "כללי" (CAT-25, CAT-28), so an app can show fewer options than exist. A site that knows only what one app shows cannot say which track fits a goal. Most of these names are also unfamiliar to the founder and his friends, so every option needs a plain-Hebrew explanation. The same holds for every bank's deposit and savings-plan names.

**In.** The comparisons (3.2, 3.4) and the fit mark read the catalogue directly: the person does not have to find an option for it to be considered. To browse it: a manager or bank chosen from a list, or a product or track name typed or pasted as it appears in an app, ad or statement. A photo is out of scope (no server-side processing, D1).

**Out.** Per institution: every product and track it offers, grouped by wrapper, each under the name the institution uses. For a track: the CMA fund record it corresponds to (fund number, classification, fee, date), the exposure it holds in plain Hebrew, one line on why a person might pick it, the dimension checklist for it (3.3), and a fit mark against the person's saved goal (3.2) if one exists, with a link to run the comparison. Tracks that share a name are flagged as distinct funds or as one fund listed twice, according to the CMA data, or as unresolved. The "default" or "most common" track is named for what it is. For a product name (for example a bank's deposit name): the wrapper it is, with a link to its guide page (3.1). For a name the site cannot match: "not catalogued yet", recorded in the person's local state, because an unknown name is a gap in coverage. The same screen has a copy button, so the person can send the name to the founder (for example on WhatsApp) before export arrives (appendix D).

**Data and rules.** The complete list of funds and tracks per managing company from the CMA datasets, monthly, with classification and fees (data report 1.2; this is the master catalogue and is already complete for provident, hishtalmut, pension, gemel lehashkaa and child savings). A hand-maintained `data/catalog/` for what the CMA data does not hold: bank deposit and savings-plan products, and an institution's own name for a product or track where it differs from the CMA name. Each entry records the institution, where it was seen and the date seen, and maps to a wrapper record and, where one exists, CMA fund numbers. Bank products from tariff snapshots and product pages (data report 2.1). Israeli mutual funds and ETFs per fund manager from the Maya fund list (CAT-33, CAT-34), so a fund manager's page lists its funds as a provident manager's lists its tracks. The rule base for what each wrapper is.

**Works when.** All 16 tracks of the Meitav kupat gemel lehashkaa (fund 7857) are in the catalogue, each tied to its CMA record and explained in plain Hebrew, so the eight the app shows are among them. Each of them is a candidate in the track comparison (3.4) and the fit mark, or is shown there as not evaluated with the reason. A name the app shows that is not the CMA name (for example an old track name) finds its track, or is recorded as "not catalogued yet". For every bank and manager the founder or a friend uses, every product and track has an entry or a "not catalogued yet" record. A track name typed from a statement finds its fund.

---

## 4. What the site will not do

- Hold accounts or any personal data on a server. No login, no aggregation by credentials, no clearing-house connection.
- Execute anything: no trades, transfers or applications.
- Rank by past return.
- Carry referral, affiliate or agent links of any kind.
- Give step-by-step orders beyond the switching playbook. The site names the best option for the stated goal and stops there (interview stance).
- Show any number it cannot trace to a source, a defined computation, or the person's own entry. In particular it shows no expected equity return of its own, no "app reliability" or service-quality judgement (no sourced data exists; UX 10.1 item 7), and no fund-level fee it has not collected by hand.
- Allocate money across goals automatically (D12).
- Cover mortgages, consumer credit, insurance other than savings policies, stock picking, trading, derivatives, physical real estate, or private-equity products.
- Serve the general public. It is for a known group; no accessibility, legal or commercial work.

---

## 5. Dependencies before any capability can ship

1. **The rule base** (3.8) seeded from the tax and domain reports, with the open questions marked and the strength policy (D10) applied. Nothing that computes can ship before it.
2. **`docs/method.md` and `tests/golden/`** (3.8), so every "Works when" has a reference answer.
3. **Wrapper and exposure records** under `data/instruments/` with sources and dates (D6).
4. **CMA field definitions confirmed** (discovery O11) before any fund fee or yield is displayed.
5. **Tariff snapshots** for the providers in 3.4, with the blocked ones listed as missing (discovery O12). **Status 2026-10-24:** collected: 20 snapshots in `data/fees/` for 17 providers, the banks Leumi, Hapoalim, Discount, Mizrahi-Tefahot, FIBI, Massad, Mercantile, Yahav, Bank of Jerusalem and One Zero, the brokers Altshuler Trade, Excellence, IBI and Psagot, and the managers Meitav and Phoenix (Phoenix as a missing record: no manager publishes a study-fund list fee). Yahav, Bank of Jerusalem and One Zero were read in the founder's Chrome on 2026-10-24. Still missing: Meitav Trade, which publishes no tariff (BRK OQ18); the workbench lists it as "not comparable, data missing".
6. **The Maya fund list** (CAT-33, CAT-34) as the set of Israeli funds the workbench chooses from (D17), and **`data/funds/`** with each fund's details, hand-collected for the exposures the founder and friends actually ask about first, starting with the ones in the interview (N4), and for the foreign funds: those traded on TASE, listed by TASE (ETF-32), and those traded abroad, which have no complete list. **Status 2026-10-24:** the Maya list and TASE's foreign-funds list cannot be republished: TASE's terms of August 2026 forbid publishing the information or a database built from it without written consent (CAT-43), so the fund-variant workbench applies the fallback of dependency 7 in its stricter form, the counts with a link and the by-hand download path, 2,009 Israeli funds (CAT-42) and 40 foreign funds traded on TASE (ETF-43). `data/funds/` holds four records (two Altshuler Shaham money-market funds, IBI's S&P 500 ETF, Meitav's TA-125 ETF); every other fund shows as not evaluated.
6a. **`data/catalog/`** (3.10) seeded with the names the CMA data does not hold for the institutions the founder uses (an institution's own name for a track where it differs from the CMA name, starting with Meitav's), and with each bank's deposit and savings-plan product names. **Status 2026-10-24:** Meitav's 38 entries since 2026-10-23; the bank side holds Leumi's three products (`data/terms/deposits/`) and no fund manager's funds, because the Maya list cannot be republished (item 6).
7. **Data terms** confirmed for Bank of Israel EDGE, CBS, TASE DataHub and the Maya fund-list export (discovery O13, O14; CAT-34). Fallback if EDGE republication is not permitted: use the data.gov.il copies of the same series under the open licence, or link out and show no number. Fallback for Maya: use the export only to build the candidate set and its counts, and link out to Maya for the list itself (3.4). **Status 2026-10-23:** Bank of Israel: not permitted without written consent, and the data.gov.il copies do not exist, so the second fallback applies (D20). CBS: confirmed (open licence v2.1, with its attribution line). data.gov.il (the Ministry of Finance child-savings file, the CMA data): confirmed, source named. TASE DataHub (O13) and the Maya export (CAT-34): still open; neither is needed before release 4. **Status 2026-10-24:** TASE: answered, not permitted. The Data Hub is a licensed, mostly paid store (BRK-39) and TASE's site terms govern Maya too (CAT-43); the site shows counts with links and ships no fund list (D22). The ISA's site forbids copying as well, so its fund-fee averages (MF-55) are a link (D22). Asking TASE, the ISA or the Bank for written consent is the founder's call.
8. **Blocked registers** fetched by hand: bank list, TASE members, ISA licensees, CMA service providers (discovery O10). **Status 2026-10-24:** the bank list is read (data.gov.il dataset 375); the TASE member list and the ISA registers were read in the browser pass of 2026-10-22 (BRK-32); the CMA register of financial-service providers is still unread (REG OQ3). The workbench's provider list is the providers with a snapshot in `data/fees/`.
9. **Regulator sources for the switching process** (3.7), fetched by hand because gov.il blocks scripts. **Status 2026-10-24:** read on gov.il and boi.org.il in the founder's Chrome: the CMA transfer circular 2017-9-17 (SW-41, identical to the copy read earlier), the clearing-house letters and the uniform-structure circular (SW-42), directive 448 version 4 (SW-43) and the clearing-house payment circular 2026-10-6 (SW-44). The playbook renders its steps from these records; the open process questions (SW OQ6, OQ11) are shown as open.
10. **`CLAUDE.md` updated** for D1.

---

## 6. Data refresh and snapshots [P]

Because D3 and 3.9 depend on history that no public source keeps:

| Source | Cadence | What is kept | On fetch failure |
|---|---|---|---|
| CMA fund datasets (data report 1.2) | Monthly, after the new period appears | Each monthly file, dated | Previous period shown with "older than one month" flag |
| Bank of Israel series (data report 1.3) | Daily for rates and FX; monthly for per-bank averages; quarterly for fee averages | Each series value with its date | Last value shown with its date and a stale flag |
| CBS CPI (data report 1.5) | Monthly | Each index value | Same |
| Ministry of Finance child-savings rates (data report 1.4) | Daily | Each day's file | Same |
| Bank and broker tariffs (data report 2) | Manual snapshot, at least quarterly, and whenever a change notice is seen | Every snapshot with date and source URL | Shown with its snapshot date; flagged if older than the stated cadence |
| Maya fund list (CAT-33, CAT-34) and TASE's foreign-fund list (ETF-32) | Monthly, by hand (the pages block scripts), from R4 | Each export, dated | Previous export shown with "older than one month" flag |
| `data/funds/` | Manual, on prospectus change | Every version dated | Same |
| `data/catalog/` (3.10) | Manual, whenever an app, ad or statement shows a name the site does not know; the CMA side refreshes monthly with the fund datasets | Every entry with institution, where seen, date seen | A track in the CMA data with no catalogue entry is still in the catalogue from the data; an institution name with no CMA match shows "not catalogued yet" |

A number whose source is older than its cadence is shown with a stale flag; it is never hidden and never silently replaced.

---

## 7. Suggested order [P]

Not a commitment. Ordered by the founder's ranking, adjusted for data availability.

1. Rule base, parameters, method and test cases (3.8); wrapper and exposure records; the instrument guide (3.1) with the dimension checklist (3.3); the catalogue of every option (3.10) for the managers in the CMA data, seeded with what the founder's own institutions offer. This is the founder's success test, gives every later comparison its full set of options, and uses the best-supported data.
2. Goal comparison (3.2) in wrapper mode, with the idle-cash preset and the sensitivity panel. Founder's rank 1. Shippable only if the tax rules it needs are primary or secondary, not open (D10); the money-market fund rule is currently an open question in the tax report and must be closed first.
3. Fee materiality (3.5) and holdings review (3.6). Founder's rank 3 and 4; both run on CMA data.
4. The workbench (3.4): tracks first (CMA data), then providers whose tariffs are structured, then fund variants from the Maya fund list, with each fund's details added to `data/funds/` over time. Founder's rank 2, placed here only because its data is the hardest.
5. Exposure mode of 3.2, switching playbook (3.7), saved state and revisit (3.9).

---

## 8. Open questions carried forward

From `docs/discovery.md`, still open after this document: O9 (building the rule base; the 22 tax and 23 domain open questions), O10 to O14 (data access and terms). New:

- **N1.** Initial values and rationale for the site parameters (tie threshold, fee-verdict thresholds, sensitivity bounds), to be signed off by the founder.
- **N3.** The saved-state export format must be stable across site versions; the versioning rule is part of 3.9. **Status 2026-10-24:** versioned from the first write; the export file is `mekor-state` version 3 today (one state document under the key `mekor.v2.state`, which did not change when the version did), an older version migrates on load and on import, a newer one is refused. The three release 4 side stores (offers, variant assumptions, playbook ticks) are not in the file yet.
- **N4.** Which exposures get full `data/funds/` records first. Proposed: the ones the founder and friends name in their first three comparisons. Until a fund has a record, the comparison still lists it, as not evaluated (D17). **Status 2026-10-24:** records exist for the S&P 500 (IBI 1148162), the TA-125 (Meitav 1143718) and shekel cash through two Altshuler Shaham money-market funds (5138763, 1223866); the other exposure records run without a fund (the government bonds through their series, the general track through a kupat gemel lehashkaa) or wait for an entered rate (makam).
- **N5.** Whether a sourced equity and bond return scenario file ever exists, and from where. Until then, D9 applies. **Status 2026-10-24:** unchanged; exposure mode runs on returns the person enters.
- **N6.** Bank-side product names (deposits, savings plans) have no regulator catalogue equivalent to the CMA fund data. How complete the catalogue (3.10) can be for banks depends on tariff snapshots and product pages, and on what the founder and friends paste in. The Bank of Israel's uniform deposit-disclosure format since April 2025 (domain 4.1) may help; its machine-readability is unverified. **Status 2026-10-24:** the bank catalogue holds Leumi's three products (a current account, a fixed-rate deposit, a three-year savings plan) from `data/terms/deposits/`; more banks join as their terms are collected, by hand.
- **N7.** A news section, for example when a law passes, is a parked idea of the founder (2026-10-24); not scheduled.

---

## Appendix A: review log, 2026-10-22

An independent reviewer who had not seen the interview reviewed the first draft as a skeptical senior product manager and returned 34 findings. What was done with them:

**Accepted and applied**

- Fund-level "what to buy" was missing: added fund variants to 3.4 with a hand-collected `data/funds/` list, and declared the limit (items 1, 29).
- Flat instrument model could not express the founder's own example: D6 rewritten as wrappers holding exposures (item 2).
- No sourced expected return exists: 3.2 split into wrapper mode at equal gross return and exposure mode with entered returns; D9 added (item 3).
- Income and contribution rates added to 3.2 inputs (item 4).
- Track choice inside a provider added to 3.4 (item 5).
- Site-level "Done when" added to section 2 (item 6).
- Multiple goals: D12, one at a time with a manual split (item 7).
- Data refresh and snapshot process added as section 6 (item 8).
- "Correctly" made testable through `tests/golden/` and `docs/method.md` (item 9).
- Real terms by default stated (item 10).
- Regulator source for the switching process added to dependencies (item 11).
- Sensitivity folded into 3.2's engine; idle cash made a preset of 3.2; decision record and profiles merged into 3.9; 3.6 hands fees to 3.5; glossary folded into 3.1 and 3.6 as `data/terms/`; one change log in 3.8 (items 12 to 17).
- Rules separated from site parameters; D5 corrected (item 18).
- Rule strength policy stated as D10, and the suggested order re-checked against it (item 19).
- Tier 2 made a list, not pages; graduation rule stated (items 20, 25).
- Loss tolerance made a user-set filter, D11 (item 21).
- Dimension list source of truth stated (item 22).
- Research citations softened to match the reports (item 23).
- Service-quality inputs and the app-reliability column cut (item 24).
- Offer tracker cut; a reminder to record offers kept in the playbook (item 26).
- Multi-profile switching cut; single local state with export and import (item 27).
- Idle-cash figures relabelled and the person's own offer added as input (item 28).
- Money-market fee citation corrected to the ISA category average (item 29).
- Track classification used instead of asset mix in 3.6 (item 30).
- Regulator-average availability stated per provider class (item 31).
- Playbook steps rendered from rule-base entries (item 32).
- "Entered by you" added as a third number state, D7 (item 33).
- Fallback for Bank of Israel data terms named (item 34).

**Rejected or only partly applied**

- Item 25 recommended dropping tier 2 in favour of a "not covered yet" list. The list was adopted, but tier 2 stays in scope with a graduation rule, because the founder asked for a wider set of choices for friends and the open questions are expected to close over time.
- Item 7's first option, a step that splits a balance across goals, was not built as an allocation feature. The manual split in the person's own order (the reviewer's second option) was taken instead, to keep the site from making a judgement it cannot source.
- Item 26's reasoning that the founder has never switched was accepted for the tracker, but the playbook itself stays, because 3.4, 3.5 and 3.6 all end in a switch and the research shows that is where people get hurt.

## Appendix B: founder changes, 2026-10-22, second round

After reading section 1 the founder asked for three changes. Applied:

1. **P2P lending and crypto moved from tier 2 to out of scope** (D2). Reason: not important to him. Can return if a friend asks.
2. **Completeness redefined at the level of what institutions offer** (D2, new capability 3.10, success criterion 5, dependency 6a, refresh row, N6; the reading of the Meitav example was corrected on 2026-10-23, appendix E). The founder wants to open any bank or manager app, press any "open a new X" button, and understand what X is, including every track offered, even when names repeat or terminology differs between institutions. His worked example is the Meitav app's "open a new saving" flow with its eight tracks. The CMA fund datasets already list every track of every manager with classification and fees, so the decoder is research-supported for provident-type wrappers; bank products need hand cataloguing. 3.4's track output was widened to every track, not only those for the chosen exposure.
3. **Goal types are presets, not a strict input** (D13; 3.2 inputs and idle-cash preset reworded). The engine works on attributes: horizon, amounts, what must stay available and when, loss filter, constraints. The named types fill those as a starting point.

Not changed: everything else in section 1 remains as drafted and still awaits confirmation.

## Appendix C: founder changes, 2026-10-22, third round

1. **Guide-page timeline made fully editable** (3.1 In and Out). The timeline opens on the illustrative scenario and every value behind it can be changed on the page, with changed values shown as "entered by you". Reason: the founder expects people to change fields and watch graphs on nearly every page, not only in the goal comparison (`docs/architecture.md` gap 8.9, K8).
2. **"Interactive by default" added as a principle** (section 2), generalising item 1 to every capability. Re-check of the capabilities it touches: 3.2, 3.4, 3.5 and 3.6 already take their inputs from the person and recompute; 3.1 now does (item 1); 3.10's fit mark recomputes from the saved goal; 3.3's marks follow the comparison they belong to; 3.7 and the rules and parameters pages of 3.8 show no computed number, so nothing changes there. Exposure mode (3.2, R5) already takes returns as "entered by you" (D9).

## Appendix D: founder changes, 2026-10-23, design pass

1. **The first page is defined** (`docs/flows.md` flow 1): a search field for any product, track or term name, two doors (the guide and the decoder) and a link to the tier-2 "not covered yet" page. Nothing on it needs data of its own. Reason: no section defined the site's entry page, and the flows needed one.
2. **A copy button on "not catalogued yet"** (3.10 Out). Reason: a friend's unmatched names stay in their browser until export (3.9, R3), so without it they cannot reach the founder in R1 and R2. It sends nothing anywhere; the person pastes the name wherever they like (D1).
3. **The site is dark only** (`docs/design-system.md`). No light theme and no theme switch. Reason: founder preference.

## Appendix E: founder correction, 2026-10-23

The founder's Meitav example in the second round was read as "help me understand the buttons and screens of my app". He meant: the site must be aware of every option institutions offer, because a site that does not know an option cannot recommend it. He knows some of the terms, not most, so the plain-Hebrew explanation of each option stays. Applied:

1. **New decision D17, "no blind spots"**, and the matching principle in section 2. Every comparison chooses from the complete set of options at its level and accounts for each one (method F-83).
2. **3.10 is a catalogue of every option, not an app decoder** (title, problem, in, out, data, works when; D2's last sentence; success criterion 5; dependency 6a; section 7; N6). Removed: mirroring an app's screens (the button-by-button "what the app shows" view and the decoding of the app's questions). The regulator data lists 16 tracks for Meitav's kupat gemel lehashkaa, not eight, and only one "כללי" (CAT-28), so the test case is now all 16. Which eight the app shows no longer matters for coverage (CAT open questions 12 and 19 closed as not needed).
3. **Fund variants choose from the whole fund list** (3.4 out, data, works when; dependencies 6 and 7; the refresh table; section 7; N4). The Maya export lists every Israeli open-end fund (CAT-33, CAT-34) and TASE lists the foreign funds traded on TASE (ETF-32); `data/funds/` holds each fund's details. A fund without details is shown as not evaluated rather than left out. Foreign-domiciled funds traded abroad have no complete list and are named as a group.

Re-check of the capabilities that depend on it:

- **3.1 guide:** unchanged. Its "who offers it" list links to the company pages (`docs/flows.md` flow 2).
- **3.2 goal comparison:** gains the coverage line (every tier-1 wrapper and tier-2 instrument accounted for). Test cases S40 and S41 now account for every one.
- **3.3 dimension checklist:** unchanged.
- **3.4 workbench:** providers already listed missing tariffs; tracks already covered every track; fund variants changed (item 3).
- **3.5 fee materiality:** works on the comparison it belongs to, so it inherits that comparison's full set; unchanged.
- **3.6 holdings review:** checks each holding against its own record and ranks no alternatives; a holding not in the data is already reported. Unchanged.
- **3.7 to 3.9:** unchanged.
- **Other documents updated to match:** `docs/method.md` (F-83, F-60, F-65, gaps G-28 to G-30), `tests/golden/` (S40, S41), `docs/roadmap.md`, `docs/architecture.md`, `docs/data-schema.md`, `docs/flows.md`, `docs/copy.md`, `docs/design-system.md` and the `il-finance` rule base's coverage notes. The company-page mockup was redrawn without the app view.
