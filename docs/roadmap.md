# Roadmap

Written 2026-10-22 from `docs/product.md` (confirmed the same day, decisions D1 to D13, open to revision). Updated 2026-10-23 for D17, "no blind spots" (product.md appendix E).
Status: **approved by the founder on 2026-10-22.** Updated 2026-10-24: all five releases are built, release 1 to release 5, each to the extent its data allows. The dated "Status" paragraphs under each release say what exists and what is open; the closing section "After release 5" says what work continues. Updated 2026-10-26: "After release 5" now ends with what was built on 2026-10-25 and 2026-10-26 and the current list of open work.

How to read it:

- Every capability in `docs/product.md` section 3 appears exactly once below, by its number. Where a capability has parts (modes, presets, outputs), each part is placed separately so nothing disappears inside a heading. The "Not planned" section lists what is not planned, with reasons.
- Releases are cumulative. Each one is usable on its own and is judged against the "done when" criteria in `docs/product.md` section 2.
- "Depends on" lists data, rules and other capabilities. A dependency on an open rule means the release cannot ship until that rule is closed (D10).
- No figure, rate or fee appears here. Where one matters, the rule or data file is named.

Capability map (product.md number, short name, release):

| # | Capability or part | Release |
|---|---|---|
| 3.8 | Rule base (`il-finance`) | R1 |
| 3.8 | Site parameters (`data/parameters/`) | R1 (first values), signed off per release as they are used |
| 3.8 | Method (`docs/method.md`) and test cases (`tests/golden/`) | R1 (for what R1 computes), extended every release |
| 3.8 | Reader-facing rule link, rules page, parameters page | R1 |
| ~~3.8~~ | ~~Change log~~ | removed 2026-10-24, D24 |
| 3.1 | Instrument guide, tier-1 wrappers and exposures | R1 |
| 3.1 | Tier-2 "not covered yet" page | R1 |
| 3.1 | Term matching (`data/terms/`) | R1 |
| 3.3 | Dimension checklist | R1 |
| 3.10 | Catalogue of every option, managers in the CMA data | R1 |
| 3.10 | Catalogue of every option, bank products and mutual funds | R4 |
| 3.10 | Catalogue fit mark against a saved goal | R2 |
| § 6 | Data refresh and snapshots, CMA and `data/catalog/` | R1 |
| § 6 | Data refresh, Bank of Israel, CBS, Ministry of Finance series | R2 |
| § 6 | Data refresh, tariff and `data/funds/` snapshots, and the fund lists (Maya, TASE foreign funds) | R4 |
| 3.2 | Goal comparison, wrapper mode | R2 |
| 3.2 | Idle-cash preset | R2 |
| 3.2 | Sensitivity panel (shared engine feature) | R2 |
| 3.2 | Goal presets and free-form attributes (D13) | R2 |
| 3.2 | Exposure mode | R5 |
| 3.9 | Saved state, local, automatic | R2 |
| 3.9 | Export and import as a file | R3 |
| 3.9 | Revisit against the stored versions (change log removed 2026-10-24, D24) | R5 |
| 3.5 | Fee materiality | R3 |
| 3.6 | Holdings review | R3 |
| 3.4 | Workbench, tracks | R3 |
| 3.4 | Workbench, providers | R4 |
| 3.4 | Workbench, fund variants (`data/funds/`) | R4 |
| 3.7 | Switching playbook | R4 |
| D2 | Tier-2 graduation to tier 1 | R5 and ongoing |

---

## Release 1: understand

**The smallest set the founder would actually use.** It puts every track the managing companies offer into the site's catalogue, all 16 tracks of the kupat gemel lehashkaa behind the Meitav app's "open a new saving" included (the app itself shows eight), so that every comparison from R2 on starts aware of every option (D17). It also delivers the first half of his success test: learn what each instrument is for, how it works, and when it beats another, with graphs.

**In it**

- **3.8 Rule base, parameters, method (change log removed 2026-10-24, D24).** The `il-finance` rule base seeded from the tax report (sections 1 to 9) and the domain report (ceilings, liquidity, caps), each rule with source, strength and date, and the 22 tax and 23 domain open questions marked open. First site parameters with founder sign-off. `docs/method.md` covering only what R1 computes (the illustrative timeline on guide pages: compounding, fee bases, tax at exit, the deflator). `tests/cases/` for those. The reader-facing rule link next to every rule-dependent number, the rules page, the parameters page.
- **3.1 Instrument guide**, one page per tier-1 wrapper and exposure type in the fixed structure, with the illustrative timeline visual, and the tier-2 "not covered yet" page naming the open question per instrument. Term matching from `data/terms/`.
- **3.3 Dimension checklist**, hand-maintained in `data/dimensions/`, shown on every guide page with each dimension marked covered, not applicable or blocked by an open rule.
- **3.10 Catalogue of every option** for every managing company in the CMA datasets: the complete list of funds and tracks per manager with classification and fee, plus `data/catalog/` for the names the CMA data does not hold (an institution's own name for a track), starting with Meitav's. Output: wrapper, fund record, exposure in plain Hebrew, why a person might pick it, dimension checklist, near-duplicates resolved from the data. The fit mark against a saved goal waits for R2.
- **§ 6 Data refresh** for the CMA datasets (monthly) and `data/catalog/` (manual), with the stale flag.

**Why first.** Everything later computes on top of the rule base; it cannot be skipped. The guide and checklist are the founder's stated first need, and the catalogue is the set of options every later comparison chooses from. All three run on the single best data source in the landscape (CMA fund-level data, free, monthly, history from 1999). They need no expected return, no tariff and no blocked register. They are usable for a friend on day one: "what is this fund or track my manager is offering".

**Depends on**

- Data: CMA fund datasets with field definitions confirmed (product.md dependency 4; discovery O11). `data/instruments/` wrapper and exposure records (dependency 3). `data/catalog/` seeded with the names the CMA data does not hold, starting with Meitav's (dependency 6a). `data/terms/`, `data/dimensions/`.
- Rules: tier-1 wrapper tax treatment from the tax report. Open rules do not block R1 pages; they are shown as blocked dimensions.
- Other: `CLAUDE.md` already updated (dependency 10).

**Risks**

- The CMA field definitions (gross or net, percent or fraction, how averages are computed) are unconfirmed. Until they are, no fee or yield can be shown; the catalogue would show names and classification only. Mitigation: confirm first, from the regulator's "sources and assumptions" pages, by hand if blocked.
- The illustrative timeline on guide pages is a computation and needs method.md and a test case per wrapper before it can be shown. Risk of shipping pages without the visual the founder asked for.
- Track names can repeat or nearly repeat within a manager (CAT-12). If the CMA data does not disambiguate them, the catalogue must say so rather than guess.
- Hebrew labelling of tracks: the 2022 track-naming reform changed names; statements and apps may still use old names. `data/terms/` must carry both.

**Done when** the catalogue part of product.md criterion 5 holds for the Meitav app (all 16 tracks of its kupat gemel lehashkaa in the catalogue, each explained; the comparisons that consider them arrive in R2 and R3), and a friend can read the money-market fund page and say what it is, how to buy it, what it costs, how it is taxed and when a deposit beats it (3.1 "works when").

**Status 2026-10-23: built, with data.** Every release 1 screen is built from `docs/design-spec.md` (guide list, 17 guide pages, 7 exposure pages, the not-covered page, companies, company and track pages, rules, parameters, search). The data behind them is written: all 17 wrapper records and 7 exposure records in `data/instruments/`; 430 rules in `data/rules/`, each with its rule in plain Hebrew (`text_he`); 449 terms in `data/terms/` and 26 dimensions in `data/dimensions/`, generated from the glossary; `data/catalog/` seeded with 38 Meitav entries; the CMA snapshots of 2026-09 with their fee fields as value objects; the list-fee snapshots of Meitav and Leumi (`data/fees/`), three fund records (`data/funds/`) and Leumi's three deposit terms (`data/terms/deposits/`), which the illustrative scenario names as the representative instrument of each wrapper (P-05 `instruments`, method §2.4). The refresh workflow (`.github/workflows/refresh.yml`, daily, with `refresh-watchdog.yml`) fetches the CMA datasets and commits them, then dispatches the CI workflow. **The CMA fee fields are confirmed** (discovery O11, CAT-35 to CAT-41): percent, the average actually charged over the previous calendar year; how the average is weighted is still open (CAT OQ2), so the site says "ממוצע" and the year, not "משוקלל". The fee column and the per-track fee line are shown, with the year in the heading.

*The acceptance test.* All 16 tracks of Meitav's kupat gemel lehashkaa (fund 7857) are in the catalogue with Meitav's own names, old names and same-name resolutions, the default track marked (`default_at_joining`); the company page lists them with the regulator's fee for each. The money-market fund page exists with its timeline (the daily fund bought through a bank, Altshuler Shaham 5138763 at Leumi's tariff).

*Still open.*

- **The study fund's list fee.** No managing company publishes one (Phoenix's snapshot in `data/fees/` records the search), so the study-fund timeline runs on the regulator's average actually charged for the named track (Meitav 880), labelled as such (method §2.4).
- **The renewable money-market fund** with monthly deposits stops on gap G-30 (which series a later deposit buys); its timeline runs only for the amount now.
- **The IRA study fund** has no manager fee collected, so its page shows no timeline.
- **Pension and child-savings pages show no timeline by design:** the pension exit is blocked (G-03, G-06) and child savings runs on the National Insurance amounts, not on P-05 (method §2.4).
- **The Bank of Israel series** are not shown: see the release 2 status and product D20.
- **Two founder settings for the refresh workflow**, both in the repository on GitHub: Settings > Actions > General > "Allow GitHub Actions to create and approve pull requests" (needed only when a refresh fails its sanity check and opens a pull request), and nothing else: the dispatch of the CI workflow after a refresh commit runs with the default token, so no personal token is needed.

---

## Release 2: decide for a goal

**Adds the decision the founder ranked first**, in the mode the data fully supports: the same exposure inside each eligible wrapper at an equal gross return, plus the idle-cash entry point that matches his current state.

**In it**

- **3.2 Goal comparison, wrapper mode**, with goal attributes and presets (D13), the ranked list, the coverage line (D17: every tier-1 wrapper and tier-2 instrument accounted for, with the reason for each one not ranked), the chart, the plain-Hebrew "X is best because Y", ties (D5), the dimension checklist with considered, not applicable and blocked marks, and the **sensitivity panel** as a shared engine feature.
- **3.2 Idle-cash preset**: two inputs plus the person's own deposit offer entered by them; Bank of Israel figures labelled "average paid at this bank last month"; its coverage line names the options outside the preset and why (method F-60, G-28).
- **3.9 Saved state, local and automatic**, so a goal persists between visits. No export yet.
- **3.10 Catalogue fit mark** against the saved goal, with a link to run the comparison.
- **§ 6 Data refresh** for the Bank of Israel series (daily and monthly), CBS CPI (monthly) and Ministry of Finance child-savings rates (daily).

**Why second.** Founder's rank 1 and the second half of his success test. Wrapper mode needs no expected equity return (D9), so it is honest with today's data. The idle-cash preset is the shortest path for a friend and the founder's own situation. Saved state is needed so the catalogue can say "this track fits your goal".

**Depends on**

- R1 in full.
- Rules: the tax treatment of every tier-1 wrapper at the primary or secondary level (D10). **The money-market and mutual-fund taxation rule is an open question in the tax report (Q15) and must be closed before the idle-cash preset can ship**, since it compares deposits with money-market funds. Interest taxation by linkage (tax report section 1) and the wrapper rules (section 3) must be at least secondary.
- Data: Bank of Israel EDGE terms confirmed, or the data.gov.il fallback used (dependency 7); CBS terms. Fee data per wrapper type: CMA averages, the ISA category average for mutual funds and money-market funds.
- Method and test cases extended to the comparison engine, including the founder's apartment case (which also tests the coverage line, F-83) and his ETF-vs-provident case.

**Risks**

- Highest rule exposure of any release. If Q15 stays open, R2 ships without the idle-cash preset and says so.
- Equal-gross-return comparison is only part of the answer when wrappers restrict exposures differently (for example a wrapper that cannot hold a given index). The output must state that exposure choice is deferred to R5.
- Sensitivity bounds and the tie threshold are parameters the founder has not yet set (N1). Without them the engine cannot declare ties.
- The founder's salary and contribution inputs touch ceilings tied to the average wage, which change yearly (tax report 10); the rule base must carry the tax year on each figure.

**Done when** product.md criterion 1 (the founder moves the idle cash using the site) and criterion 2 (he names a dimension he had not thought of) can be attempted, and the test cases pass.

**Status 2026-10-23: engine and design done, screens being built.**

- **Engine.** Done: the deposit-side formulas F-30 to F-32, the blocked-wrapper exit F-45, F-48 and F-49, the study fund's early withdrawal F-47, the employer line F-52, the insurance cost F-53, the idle-cash preset F-60, the ranking F-80, the sensitivity panel F-81 and the candidate set F-83 (`packages/engine/src/registry.ts`). Golden scenarios S23 to S30 (study fund, pension, provident for annuity), S39 to S41 (the founder's ETF-vs-provident case, his apartment case, the idle-cash preset) and S50 (tie) pass. Goal presets are P-07 (`data/parameters/goal-presets.json`, product D21).
- **Design.** The release 2 flows, screens and components are specified: `docs/flows.md` §7 to §9, `docs/design-spec.md` §6 to §10, `docs/design-system.md` §6, `docs/copy.md` §6, `docs/glossary.md` §7.
- **Screens.** Built: the goal form (`/goal`) and the comparison result (`/goal/compare`). In progress: the idle-cash screen, the catalogue fit mark and the saved-goal strip.
- **Series.** CBS CPI (`data/series/cbs-cpi.json`, open licence v2.1 confirmed, with the prescribed attribution line) and the Ministry of Finance child-savings rates (`data/series/mof-child-savings-rates.json`, data.gov.il licence confirmed) are collected, with adapters in `packages/pipeline/src/adapters/` and in the daily refresh workflow.
- **The gate that changed.** **The Bank of Israel's terms of use do not permit republication** without the Bank's prior written consent, and the data.gov.il copies the product named as the first fallback (dependency 7) do not exist for any of the three series (policy rate, per-bank deposit averages, makam yields; checked 2026-10-23, discovery O14). So the product's second fallback applies, "link out and show no number" (product D20): the policy rate, the per-bank deposit averages and the makam yields are links to the Bank's pages, the idle-cash preset runs on the rates the person enters (A-26, and A-20 and A-22 as "entered by you"), and the refresh workflow does not fetch EDGE. Writing to the Bank for consent is the founder's call; the "§ 6 Data refresh, Bank of Israel series" row of the capability map waits on it.
- **Still open from "Depends on":** TASE DataHub terms (O13) are not needed by R2 and stay open; the A-21 series dictionary (which EDGE code labels which bank and term) is confirmed only by inference and matters only if consent is given.

---

## Release 3: fees and what you already hold

**Adds the founder's rank 3 and rank 4, and the track half of rank 2.** All three run on the CMA data already refreshed in R1.

**In it**

- **3.5 Fee materiality**: per-fee shekel cost over the horizon, ranked, verdicts from site parameters, regulator average or "no reference available", negotiation text, fee-drag chart, sensitivity panel.
- **3.6 Holdings review**: holdings entered from the statement with "where to find it", classification fit, consolidation per transfer rules, child-savings default check, fees handed to 3.5.
- **3.4 Workbench, tracks**: every track each provider offers for the chosen wrapper, with CMA fee and classification, fit mark, other exposures collapsed, and the coverage line (D17).
- **3.9 Export and import** of saved state as a versioned file, so the founder can help a friend.

**Why third.** The founder's own fee question ("which battles to fight") and his parental kupot gemel are both answerable from data already in hand; neither needs a tariff or a blocked register. Tracks are the part of the provider workbench the CMA data covers completely. Export arrives here because R3 is the first release where a friend's inputs are worth carrying between devices.

**Depends on**

- R1 and R2 (engine, saved state, parameters).
- Rules: fee bases per wrapper (domain report); fee caps where regulated, which are open questions in the domain report and must be sourced or shown as open; transfer and withdrawal rules per wrapper (domain report 4.3, several open); child-savings rules (National Insurance pages).
- Data: CMA classification field confirmed as the fit basis (not asset mix). Regulator fee averages per provider class.
- Parameters: fee-verdict thresholds with founder sign-off.

**Risks**

- Fee caps for provident, hishtalmut and gemel lehashkaa appear only in secondary or blocked sources (domain open question 8). The verdict "worth negotiating" is weaker without them; the page must label the reference as secondary or absent.
- Consolidation advice depends on transfer rules that are partly open. Where open, 3.6 says "transfer rules not sourced" rather than advising.
- "Where to find it on the statement" needs real statements from several managers; the founder's own are the starting set.

**Done when** product.md criterion 3 (the founder negotiated or ignored a fee based on the site's figure) can be attempted, and 3.5 and 3.6 test cases pass on the founder's own holdings.

**Status 2026-10-24: built, with data.**

- **Engine.** Fee materiality F-61 and the verdicts F-62 (thresholds read from the P-03 record), the track workbench F-64, the regulator reference F-68 (the mean and median of the latest CMA period's tracks per class), classification fit F-70 (P-04) and consolidation F-72 (`packages/engine/src/fees/`, `holdings/`). Golden scenarios S42 (the founder's study fund), S43 (a brokerage plan) and S46 (the parental kupot gemel) pass in `packages/engine/test/golden/r3.test.ts`, with F-70 tested on each outcome and F-72 on its own.
- **Screens.** `/fees` (fee materiality, screen 9), `/holdings` (holdings review, screen 10), `/workbench/tracks/:wrapper` (track workbench, screen 11) and `/transfer` (export and import as a page, screen 12; the same panel opens as a sheet from the holdings page, the saved-goal strip and the footer). The export file is `mekor-state` version 3 (3.9, N3). Design: `docs/flows.md` §10 to §12, `docs/design-spec.md` §11 to §15, `docs/design-system.md` §7, `docs/copy.md` §7, `docs/glossary.md` §8.
- **Data.** The fit basis and the per-track reference are the CMA snapshots already refreshed. The CMA's own class averages for 2025 (PF-39, the Commissioner's report on gov.il) are shown beside the computed reference as a single quoted figure with its source (product D22). The ISA's fund-fee averages (MF-55) and TASE's s.45טז fee calculator (BRK-37) are links, not numbers: both sites forbid copying their content (D22).
- **What the research closed.** The uniform statement format: circular 2020-9-22 read in full, the shortened and detailed annual reports and the quarterly report with their exact labels (PF-33 to PF-38), the child-savings annex (CS-27) and the bank's annual report under directive 425 (BANK-32); "where to find it on the statement" rests on the circular, and the founder's own statements are no longer needed as a source (PF OQ5, CS OQ11 closed). The transfer regulation behind consolidation: transferred money keeps its own seniority and two study funds merge into one account only when both are withdrawable (SW-39); pension-to-pension carry-over of payment dates (SW-40, the member-side tax neutrality still unstated).
- **Still open.** Whether the 2025-26 draft of the statement circular was adopted (PF OQ16). The child-savings check cannot tell a parent whether the track was chosen or assigned by default: no statement field says so (CS OQ4, OQ10). The ISA fund averages stay link-only unless the ISA consents (D22). The fee page's reference for banks and brokers is "none available" by design (F-68, D20 and D22).
- **For the founder.** The release 3 strings in `docs/copy.md` §7 are drafts (chosen 2026-10-23, revisable), part of the roughly 400 new UI strings of §7 to §9 to review. The first page now shows four doors: the two he approved on 2026-10-23, the third door added in release 2 (design-system 6.9) and the holdings entry added here; the two additions are not approved.

---

## Release 4: providers, funds and switching

**Adds the parts of rank 2 whose data is hardest**, and the playbook for acting on R3 and R4 results.

**In it**

- **3.4 Workbench, providers**: tariff-based total cost per provider over the holding period, three fee levels (D4), ties, minimums, supervision and protection status, cumulative-cost chart, "not comparable, data missing" rows.
- **3.4 Workbench, fund variants**: every Israeli fund for the exposure from the Maya fund list, every foreign fund traded on TASE from TASE's list, plus the foreign-domiciled funds traded abroad in `data/funds/`, compared on fee, domicile and distribution policy, with blocked dimensions where the tax rule is open (accumulating foreign funds, tax report Q1). A fund whose details are not in `data/funds/` yet is shown as not evaluated (D17); foreign-domiciled funds traded abroad are named as a group, since no complete list exists.
- **3.10 Catalogue, bank products and mutual funds**: deposit and savings-plan names from tariff snapshots and product pages mapped to wrapper records; each fund manager's Israeli funds from the Maya fund list.
- **3.7 Switching playbook**: steps rendered from rule-base entries, post-switch checklist, reminder to record offers.
- **§ 6 Data refresh**: tariff snapshots (manual, at least quarterly), the fund lists from Maya and TASE (monthly, by hand) and `data/funds/` versions.

**Why fourth.** Founder's rank 2, placed after R3 only because its data is the weakest in the landscape: per-institution PDFs with no archive, blocked registers, no regulator average for non-bank brokers, and for funds only a list read by hand (Maya) with each fund's details collected one by one. Starting with the providers whose tariffs are structured (Leumi, Mizrahi, Discount) gives a usable table early; the rest fill in as snapshots are collected. The playbook comes here because this is the release after which people switch.

**Depends on**

- R1 to R3.
- Data: tariff snapshots (dependency 5; Meitav, Yalin Lapidot, One Zero, Jerusalem, Clal, Infinity blocked or not located); blocked registers fetched by hand for the provider list (dependency 8: bank list, TASE members, ISA licensees); the Maya fund-list export, TASE's foreign-fund list and their republication terms (dependencies 6 and 7; CAT-34, ETF-32); `data/funds/` details seeded for the exposures named first (N4); TASE DataHub terms if any TASE data is used (dependency 7).
- Rules: which fee types apply to which wrapper; clearing-house and consent rules for the playbook, which need a manual source pass because gov.il blocks scripts (dependency 9); transfer rules.
- Parameters: tie threshold applied to provider totals.

**Risks**

- The largest data risk in the roadmap. Tariffs go stale within a quarter; without snapshots, D3's stale flag fires constantly. Mitigation: ship with few providers and say so, rather than many with stale numbers.
- Negotiated prices are not published; the table shows list, average and "entered by you" only. The founder's expectation of "the best deal" must be set to "the best listed deal, unless you enter an offer".
- Fund variants depend on a tax rule that is open (Q1). Accumulating foreign funds may remain "blocked" for a long time.
- Most Israeli funds will show as "not evaluated: details not collected" until `data/funds/` grows, and foreign-domiciled funds traded abroad have no complete list (ETF OQ4). The table says so rather than looking complete. If the Maya terms do not allow republishing, the table links out to Maya for the full list and says how many funds it holds.
- The playbook cannot state a process rule without a regulator source; if the source pass fails, the playbook ships as experience-only content, labelled as such.
- The bank-product catalogue has no regulator list behind it (N6); completeness is whatever the catalogue holds.

**Done when** for "ETF in a brokerage account with a given monthly purchase" the table ranks the providers with collected tariffs and shows which fee type decides, every provider without a tariff is listed as missing, every Israeli fund that tracks the chosen index appears (compared or not evaluated), and a person switching a hishtalmut can follow the playbook without the forum.

**Status 2026-10-24: built, with the data that could be collected.**

- **Engine.** The provider workbench F-63 (`packages/engine/src/providers/workbench.ts`), fund variants F-65 and the switching cost F-66 (`variants/`). Golden scenarios S44 (one trade against ten a month), S45 (an entered fee) and S38 (brokerage switch against a provident track switch) pass in `packages/engine/test/golden/r4.test.ts`; F-63 is also run over the real snapshot shapes and F-65 over a five-row fixture list. One formula of the method is still not implemented, F-18 (the interest and dividend handling fee at full tariff detail); it is the only entry left in the registry's `pending`.
- **Screens.** `/workbench/providers/:wrapper` (screen 13), `/workbench/funds/:exposure` (screen 14), `/switch/:wrapper` (the playbook, screen 15: steps rendered from the SW rule records in the rule base's order, the post-switch checklist SW-38, the switching-cost line F-66, the reminder to record offers) and the companies list with the bank and fund-manager pages (screen 16). Design: `docs/flows.md` §13 to §15, `docs/design-spec.md` §16 to §20, `docs/design-system.md` §8, `docs/copy.md` §8, `docs/glossary.md` §9.
- **Data.** `data/fees/` holds 20 snapshots for 17 providers: ten banks (Leumi, Hapoalim, Discount, Mizrahi-Tefahot, FIBI, Massad, Mercantile, Yahav, Bank of Jerusalem, One Zero), four brokers with a tariff (Altshuler Trade, Excellence, IBI, Psagot) and the two managers of release 1 (Meitav; Phoenix as a missing record). Yahav's, Bank of Jerusalem's and One Zero's tariffs were obtained today in the founder's Chrome after scripts were blocked (discovery O12), each with its 2026-10-23 missing record kept beside it. **Meitav Trade publishes no tariff** (BRK OQ18): its snapshot stays `missing: true` and the table lists it as "not comparable, data missing". `data/funds/` holds four records (Altshuler Shaham 5138763 and 1223866, IBI 1148162 on the S&P 500, Meitav 1143718 on the TA-125, added today). **No fund list is shipped** (`data/fund-lists/` does not exist): TASE's terms of August 2026 forbid republishing the Maya export or building a database from it (CAT-43), so the fund-variant page shows the counts with a link and the by-hand download path, 2,009 Israeli funds on Maya (CAT-42) and 40 foreign funds traded on TASE (ETF-43). The bank catalogue (3.10) holds Leumi's three deposit products from `data/terms/deposits/` (N6).
- **What the research closed.** The official switching sources (dependency 9), all read on gov.il and boi.org.il today: the CMA transfer circular 2017-9-17 is identical to the third-party copy read earlier, deadlines confirmed (SW-41); transfer information passes through the pension clearing house since 23.2.2020 and the regulator may defer the ten-day deadline (SW-42); directive 448 version 4 changes disclosure only (SW-43, SW OQ15 closed); the clearing-house payment circular 2026-10-6 caps what the clearing house may charge a saver from 1.1.2027 (SW-44, SW OQ5 closed). TASE's Data Hub is a licensed, mostly paid store (BRK-39), which answers discovery O13: no free route to display the fund lists exists.
- **Still open.** Meitav Trade's tariff. The fund list, until TASE consents (the founder's call, as with the Bank of Israel series). Moving holdings in kind from one provider to another (SW OQ11): only institutions describe it, so the playbook's "cash or in kind" step shows the rule as it stands. The "ambiguous lines" at One Zero and Psagot were resolved later the same day: the engine prefers the standard (unbanded) line over a plan line unless a plan is asked for, and Psagot's bonds line applies to bonds only (method F-63, 2026-10-24); both providers now rank, and the site keeps its "ambiguous lines" row only for a genuine ambiguity. Who tells the employer where to deposit after a transfer (SW OQ6). The CMA register of financial-service providers is still unread (REG OQ3).
- **Saved state.** Release 4 kept its three stores beside the state document rather than inside it: the entered offers (`mekor.v2.offers`), the fund-variant assumptions (`mekor.v2.variants`) and the playbook ticks (`mekor.v2.playbook-ticks`), each through `site/app/lib/device-store.ts`. The merge into the state document that `docs/design-spec.md` 16.5 describes is pending; until then the three travel neither in the export file nor in an import.
- **For the founder.** The release 4 strings in `docs/copy.md` §8 are drafts (chosen 2026-10-24, revisable). The checklist ticks of the playbook are kept on the device, although product.md 3.9 lists the inputs of 3.2, 3.4, 3.5 and 3.6 as saved state and not 3.7; design-spec 16.5 records this as a product note for him.

---

## Release 5: exposures, revisiting and growth

**Completes the product**: the mode of goal comparison that needs a return assumption, the revisit promise, and the path for tier-2 instruments.

**In it**

- **3.2 Exposure mode**: which exposure type suits the horizon and the loss filter, with the coverage line over every exposure record (D17); cash-like exposures from sourced series, equity and bond returns entered by the person and labelled so (D9). A sourced scenario file is added only if one with a defensible source exists (N5).
- **3.9 Revisit**: a saved comparison re-run after rule, parameter or data changes, reporting what changed and whether the ranking holds, from the versions it stored (the reader-facing change log was removed 2026-10-24, D24).
- **D2 Tier-2 graduation**: for each tier-2 instrument whose record is sourced and whose tax questions are closed, promotion to tier 1 across 3.1, 3.2, 3.3, 3.4 and 3.10. Ongoing after R5.

**Why last.** Exposure mode is the only capability that cannot be honest with today's sources; it waits until the equal-gross-return comparison has done its work and the person is choosing between asset classes. Tier-2 graduation is gated by tax open questions that close on their own schedule.

**Depends on**

- R1 to R4.
- Rules: the loss filter as a user-set constraint (D11) needs no rule; tier-2 graduation needs the open tax questions for each instrument closed (tax report Q5, Q6, Q9, Q13 and others).
- Data: export format stability (N3).

**Risks**

- Exposure mode with an entered return can be misread as the site's view. The "entered by you" state (D7) must be unmistakable on the chart.
- Tier-2 graduation may never happen for some instruments if the regulator never publishes the rule; the "not covered yet" page stays honest.
- Revisit can produce noise if every data refresh triggers "something changed"; the revisit must distinguish changes that affect a saved ranking from those that do not.

**Done when** product.md criterion 4 (a friend goes from a goal to a concrete choice alone) holds including an exposure choice, and a decision recorded before a rule change shows the re-check notice after it.

**Status 2026-10-24: built; no tier-2 instrument has graduated.**

- **Engine.** The loss filter F-71 and exposure mode (`packages/engine/src/compare/loss-filter.ts`, `exposures.ts`), revisit F-82 (`revisit.ts`). Golden scenarios S48 (revisit after a rule change, over S39) and S49 (exposure mode with entered returns and the loss filter) pass in `packages/engine/test/golden/r5.test.ts`, with `lossFilter` and `diffVersions` tested on their own. The one `it.todo` left in `golden.test.ts` ("S47 pension series: F-30, F-31, F-53") is a leftover: those formulas exist since release 2 and S27 to S30 cover them.
- **Screens.** Exposure mode on `/goal/compare?mode=exposure` with the goal form's return and fall fields (screen 17; each exposure runs through the holding wrapper named by P-08, `data/parameters/exposure-holding-wrapper.json`, signed off 2026-10-24, and the person may change it), the revisit notice and sheet (screen 18, wrapper and exposure mode), the status card on the not-covered page (screen 20). Saved comparisons live in the state document, version 3 under the key `mekor.v2.state` (the key did not change; the document's own `version` says what it is). Design: `docs/flows.md` §16 to §18, `docs/design-spec.md` §21 to §25, `docs/design-system.md` §9, `docs/copy.md` §9, `docs/glossary.md` §10.
- **Data.** Exposure records with collected terms to run: shekel cash through Leumi's published deposit terms, the S&P 500 through IBI 1148162, the TA-125 through Meitav 1143718, the CPI-linked government bond through the GOV-11 series, the general track through a kupat gemel lehashkaa at list fees. Makam and the unlinked government bond are "not evaluated" until a rate is entered (the Bank of Israel series are links, D20; GOV OQ4). Equity and bond returns are entered by the person and drawn as such (D9); no sourced scenario file exists (N5). `data/series/` holds the two confirmed series (CBS CPI, Ministry of Finance child-savings rates).
- **What the research closed.** The tier-2 pass (`r5-tier2`, 2026-10-24) ranked the nine instruments of D2 by distance from graduation: managed and robo portfolios first (the tax side computes, TX2-15 and the VAT rule TX2-17; what remains is a retail-offer pass, an entered or ISA-average fee under D4 and two method formulas), then FX deposits, corporate bonds held to maturity, REITs, gold through funds, savings policies, Amendment 190, structured deposits, and executive insurance last. Eight rules were added (INS-25, INS-26, TXA-27, TXA-28, TX2-17 to TX2-20); product D23 settled how institution-strength rules compute. Two draft wrapper records (managed portfolio, FX deposit) sit in the scratch report, outside `data/`, because their ids are not in the schema and their formulas are not in the method.
- **Still open.** No tier-2 instrument graduated; managed portfolios are nearest. The sensitivity panel is shown in wrapper mode only; exposure mode has none yet. The "what changed" page and the first page's "since your last visit" line were dropped (D24, 2026-10-24); the revisit sheet is the whole "what changed" view. The merge of the three release 4 side stores into the state document (release 4 status).
- **For the founder.** The release 5 strings in `docs/copy.md` §9 are drafts (chosen 2026-10-24, revisable).

---

## Not planned

Nothing from `docs/product.md` section 3 is dropped: every capability and part is placed above. The items below are in product.md as exclusions or open questions and stay that way:

| Item | Where in product.md | Reason not planned |
|---|---|---|
| Photo or screenshot input to the catalogue search | 3.10 In | Needs server-side processing, excluded by D1. The person types or pastes the name instead. |
| Multi-profile switching on one device | Appendix A, review item 27 | Cut in review; export and import (R3) cover the founder helping a friend. |
| Offer tracker | Appendix A, review item 26 | Cut in review; the playbook (R4) reminds the person to record offers. |
| Glossary as a separate capability | Appendix A, review item 16 | Folded into 3.1 and 3.6 as `data/terms/` (R1). |
| Service-quality or app-reliability data | Section 4 | No sourced data exists. |
| A sourced expected equity return | D9, N5 | Only if a defensible source appears; otherwise entered by the person (R5). |
| Automatic allocation across goals | D12 | Manual split in the person's order (R2). |
| P2P lending, crypto, derivatives, leveraged FX, private equity, physical real estate, collectibles | D2 | Out of scope by founder decision. |
| Accounts, server-side data, trading, referrals, past-return ranking, step-by-step orders beyond the playbook, mortgages, credit, non-savings insurance, stock picking, general-public use | Section 4 | Excluded by product.md section 4. |

---

## What approval means

Approval of this document fixes the release contents and order. It did not start work: R1 began when the founder said so on 2026-10-22, with the rule base as its first task (product.md dependency 1), and the five releases were built in order on 2026-10-23 and 2026-10-24. Changes to a decision in product.md section 1 may move items between releases; each move is recorded here with the date and reason.

---

## Held for review

*Written 2026-10-26 (D32).* The founder holds these back until he has reviewed their design and UX. They are not linked from anywhere on the site, but their addresses work, with a note at the top saying they are waiting for review. The list is `site/app/lib/review.ts`; to bring an item back, remove it from there and record the change here.

- **The idle-cash page (`/idle-cash`).** The founder finds the page "a bit weird". Held with it: the home card's "כרית ביטחון" chip and its "יש לכם כבר פיקדון" pill (both lead there), the menu item and home door "כסף שיושב בעו״ש", the comparison's next step and the deposit guide's "קיבלתם הצעה מהבנק?" line. **Before it returns:** the founder walks through it as a friend with money in a current account, and says what the page should answer and in what order; the page is reworked to that, keeping F-60 and the D20 rule (entered rates, no Bank of Israel numbers); then where a cushion on the home card should land is decided again.
- **The holdings page (`/holdings`).** Held with it: the home door and menu item "מה כבר יש לכם", the home card's "יש לכם כבר קרן השתלמות" pill, and the links back to it from the fee page, the switching playbook (whose breadcrumb now leads to the product's guide page) and the transfer page. The fee page and the playbook still work when reached from elsewhere. **Before it returns:** the founder enters his own holdings from his annual statements and reviews the flow: adding a holding, the fit mark, consolidation, child savings, and the hand-off to the fee page and the playbook; what he changes is built, and the three side stores are merged into the saved state if he wants that first.
- **Three "מה מייחד" visuals (D29):** the renewable money-market fund, the bank deposit and the provident fund for investing. Their pages keep the timeline open, as a page without a visual does; `?review` in the address shows the visual with a note. **Before they return:** for the provident fund for investing, the founder finds the comparison with the securities account unfair; the comparison is rebuilt so both sides carry the same assumptions (the same index and fund costs, the broker priced the way F-80 prices it, the tax at exit on both sides at the same age) and the founder agrees it is fair. For the renewable fund and the bank deposit, the founder decides what question each visual answers and approves a mockup, by the reading test of design-system 2.3.

## Not final

*Written 2026-10-26.* Built and linked from the site, but not final: the founder has not settled their design and UX, and they may change. Unlike the held items above they stay reachable from the company pages, the guides and search.

- **The workbench pages (`/workbench/*`):** the tracks of a product across every company (`/workbench/tracks/<wrapper>`, F-64), the banks and investment houses for a fund (`/workbench/providers/<wrapper>`, F-63) and the fund variants of an exposure (`/workbench/funds/<exposure>`, F-65). They still carry the saved-goal strip and a fit mark on each track, which D34 moves off the company and track pages to the goals page. **Before they are final:** the founder walks through them and says what each should answer and in what order; whether their goal UI stays or moves with D34 is decided then.

## After release 5

*Written 2026-10-24.*

Every capability of `docs/product.md` section 3 is now placed in a release above and built, to the extent the data allows: the guide, checklist and catalogue (R1), goal comparison in both modes with the idle-cash preset and the sensitivity panel in wrapper mode (R2, R5), saved state with export, import and revisit (R2, R3, R5), fee materiality and the holdings review (R3), the workbench for tracks, providers and fund variants (R3, R4), the switching playbook (R4) and the rule base, parameters and method under all of them. Where a number cannot be shown, the page says why: a publisher's terms (the Bank of Israel series, the ISA averages, the TASE fund lists), a missing record (Meitav Trade's tariff, a fund without details) or an open rule. No new capability is proposed here; the roadmap's job is done.

What continues, none of it a release:

- **Tier-2 graduation (D2)**, in the order of the release 5 pass: managed and robo portfolios, then FX deposits, corporate bonds, REITs, gold through funds; savings policies, Amendment 190 and structured deposits wait on Tax Authority texts, executive insurance on TXA OQ6. Each graduation needs the record fields of data-schema §3.3 sourced, the tax steps computing under D10 and D23, the formulas added to `docs/method.md` with golden cases, the id added to the schema, and then the pages across 3.1, 3.2, 3.3, 3.4 and 3.10. The browser to-dos per instrument are in the pass report.
- **Data growth.** Fund records in `data/funds/` for the funds people actually ask about (N4), one by one from the prospectus; deposit terms of more banks in `data/terms/deposits/` so the bank catalogue (3.10, N6) grows beyond Leumi; the Maya and TASE fund lists only if TASE consents in writing (CAT-43), and the Bank of Israel series only if the Bank does (D20); Meitav Trade's tariff when it is published; the CMA snapshots keep refreshing daily.
- **Refresh of tariffs** at least quarterly and whenever a change notice is seen (product.md section 6), each as a new dated snapshot in `data/fees/`, so the stale flag means what it says.
- **Yahav's tariff for mutual-fund units (founder, 2026-10-27).** `data/fees/yahav@2026-10-24.json` has buy and sell lines for shares, bonds and ETFs, makam and foreign securities, but none for units of a mutual fund. So on the index page a tracking fund (קרן מחקה) cannot be priced at Yahav: Harel's TA-35 tracking fund, first at Psagot, shows "—" with "בתעריפון אין שורה ליחידות של קרן נאמנות", and the ranking at Yahav holds ETFs only. The general rule does not settle it: a bank that distributes a fund may charge for buying, holding or redeeming units of a fund that is not a money-market fund, as long as the fee does not change with the fund's manager (MF-26). Research Yahav's tariff document (the securities chapter, "שירותים נפוצים"; the snapshot already holds the custody line and the distribution-fee lines for `mutual_fund_units`) for what it charges to buy and redeem mutual-fund units, or that it charges nothing, and record it as a new dated snapshot with its source (the `data-update` skill). Then check the other collected tariffs for the same gap.
- **The load on purchase (דמי הוספה) of each tracking fund (founder, 2026-10-27).** The manager of an open fund may add a surcharge to the unit price when you buy; its rate is set in the prospectus, it goes to the manager, not into the fund, and the ISA's guide says most funds charge none (MF-21). The fund records hold no field for it, so the index page cannot say whether a tracking fund (קרן מחקה) charges one. Research, for every tracking fund in `data/funds/`, the load its prospectus or annual report states (or that it is zero), and propose the field for `docs/data-schema.md`. Then the index page shows a "דמי הוספה" label on the funds that charge one and the engine prices it (`research/specs/2026-10-27-invest-improvements/spec.md` 2.2).
- **The founder's approvals**: the UI strings of `docs/copy.md` §7 to §9, the two unapproved doors on the first page, the playbook ticks as saved state, a second look at the parameters he signed off on trust (P-02 to P-08, "do whatever you think fits") once he has used the pages they drive, and the consent letters (Bank of Israel, TASE, ISA) if he chooses to send them.
- **The knowledge layer (2026-10-24, D25).** After the release 5 build the rule base and the documents behind it became something a person can browse and check: every rule record carries its sources, the card puts the source first, the rules page, named "חוקים וכללים", is one page of filters over every rule, the twelve questions (P-09) have their own page with a one-line sourced answer each and a block on the home page (the five shelf pages of the first build were merged the same evening at the founder's request, and the questions left the rules page later that night), a documents page lists what the site read, search covers rules, parameters and documents, and each wrapper guide shows a "שווה לדעת" block. This is the founder's second goal made visible, not a new release. What stays open, each waiting for the founder (`research/knowledge/2026-10-24-synthesis.md` section 5): the conditions ("מתי זה לא חל") in Hebrew on every rule, starting with the 214 figure rules; the official Knesset or gazette publication beside the Wikisource copy for the roughly fifteen laws behind 144 mirror rules; records for the open questions that block a number; Hebrew records for the 360 research rules that have none; claim marks inside guide sentences; the tag "פירוש של האתר" for a conclusion the law does not state in one sentence; and the quoting decision (D22) that gates a cross-provider tariff table and the six rules that quote ISA directives. The pinned list itself shows "ערך זמני" until he signs it.
- **The debts named in the status paragraphs**: F-18, the merge of the three side stores into the state document, the sensitivity panel in exposure mode, and the stale `it.todo`. (The first page's "since your last visit" line and the change-log page were dropped by D24 on 2026-10-24.)
- **The securities account ("חשבון השקעות"), covered better and defined (founder, 2026-10-27).** It is the third group a company's page lists, after kupat gemel lehashkaa and the tracking funds, yet the site has no settled definition of it: what it is as a product (an account at a bank or a broker that holds securities, not a wrapper with its own tax rule), how it relates to the securities held in it (D6 as amended 2026-10-26), and which of its two names the site uses ("חשבון השקעות" on the company pages, "חשבון ניירות ערך" on the index page). Defining it is a product decision for `docs/product.md` first; then its guide page, its rules and its place on the company pages follow.

### 2026-10-25 and 2026-10-26

*Written 2026-10-26.* Still no new release. The work deepened what exists, and most of it came from the founder using the live site.

**Built:**

- **The index page (D27, D28)**, "השקעה במדד":
  - It lives at `/indices` and `/indices/<index>` since 2026-10-26, with no redirect from the old `/invest`.
  - It answers where to hold an index, broker first:
    - the cheapest complete way;
    - two plain lines: the same fund in another securities account, and the same account with another fund;
    - every bank and investment house with its cheapest way;
    - then the funds on the index at a chosen account, with the fund type as a small tag and a link to each fund's Maya page.
  - The plan is editable on the page, and the index pills use the site's one pill design. The worth bars and the ETF-versus-tracking-fund comparison moved into folds.
  - The words separate the securities account ("חשבון ניירות ערך") from the fund's manager ("מנהלת הקרן").
- **The shared component kit** (`site/app/components/kit/`, gallery at `/kit`). Guards and ratchets in its tests keep pages on it, and a structure review runs before every merge (CLAUDE.md). A fix in the kit reaches every page at once. On 2026-10-26 the kit fixed three things everywhere:
  - a field's state line no longer pushes the page down;
  - the chart table scrolls only sideways;
  - the difference between two bars is a sentence that says which side has more.
- **One chip for every id** (`IdRef`): rules, formulas, parameters and open questions all open their own sheet.
- **Scope on every rule (D30).** Each rule is general, a named institution's own term, or unsettled. An independent reviewer re-read them all; settling the disagreements is under way.
- **A company's own figure (D31).** A figure a company publishes about its own product, shown on that product, is plain sourced. The amber "לפי החברה" now marks only a company figure that stands for the market. Guide timelines name the company whose example they run on, and idle cash names the bank.
- **Open questions.** An audit of all 493 open questions in the rule base closed 101 of them: 68 that were already answered and 33 settled from official sources. The tier-2 blockers follow from it:
  - managed portfolios wait on MF-28 alone;
  - FX deposits wait on TX2 OQ2 alone;
  - Amendment 190 waits on TXA OQ14 and OQ15.
- **Sources:**
  - Interactive Brokers' Israeli permit (ISA s.49A) is recorded.
  - 54 glossary entries are re-sourced from company pages to official ones.
  - The documents page links the Income Tax Ordinance's own PDF.

**Landed later on 2026-10-26 (overnight, with the founder's go to merge):**

- **The site stops naming closed questions as open.**
  - `data/open-questions.json` holds all the rule base's questions with their status.
  - The question chips read their status from it.
  - A guard fails the build if a page presents a closed question as open.
  - Guide prose states the answers, and dimensions that waited on them are unblocked.
- **The scope review is settled in the rule base:** 482 general, 101 institution and 13 unsettled records. Its text fixes include rules that were backwards: IRA-09, and PEN-28, PEN-29 and PEN-34. Both researchers' findings closed 8 more questions and narrowed 11.
- **Idle cash.**
  - The headline says the sum is the part not needed at once.
  - The current account runs on the rate most collected banks print (F-85), not one bank's.
  - Sheets name a source's company once, in Hebrew.
  - Every select's option list is readable.
- **Engine follow-ups:**
  - a falling index or currency never raises the taxable gain (TXS-02, TXF-03, circular 10/2025);
  - the relief from 60 at the kupat gemel lehashkaa exit, settled against the manager's 20% withholding (TXK-06, TXK-26);
  - credit points flagged where not applied (G-23);
  - the child-savings fee after 21 at the legal cap, labelled "עד" (CS-18);
  - custody on money-market units at non-bank members (BRK-52);
  - source labels: regulations labelled as regulations.

  All of it was checked by a finance review and an independent review. Golden values come from a separate script.
- **The rules-scope layout (spec sections 3 and 4), merged after four review rounds.**
  - **Where things show:** general rules on guides, the rules page and the questions page. A company's terms only on that company's page, from the company's own documents, with "תלוי בחברה" links naming the companies the record states the property for. Press, forums, counts and site terms sit in a "לא נכלל ככלל" section on /companies.
  - **Labels and chips:** "לפי החברה" drops only on the named company's own sites. Company terms appear on general rule cards as examples, not as derivations.
  - **Search** has two groups.
  - **The validator** enforces all of this, file by file.

- **Wrappers and securities (D6 amended, 2026-10-26, founder: "change D6").** Makam, government bonds and the two money-market funds are securities bought in a securities account, not wrappers. Their records moved to `data/instruments/securities/` with `held_in`; IDs, pages and saved keys stay. What changed for a person:
  - the comparison prices makam and the government bond on the provider that leaves the goal the most, as it already did the account (F-80), with each provider's own lines for the class;
  - makam at a non-bank member pays that member's custody line, and any account's monthly fee follows a security into the account (F-14, F-17); before, the makam run read neither;
  - exposure mode no longer lists the securities account beside makam as a second way that never ran; the makam choice reads "מק״מ, קנייה ישירה בחשבון ניירות ערך";
  - a security's guide page names the account it is bought in, and the account's page lists the securities bought in it; the account's eligibility, supervision and protection text is no longer copied into four records.

  Research and the full list: `research/discovery/2026-10-26-wrappers-and-securities.md`.

**Later on 2026-10-26 (the founder, on the company page, D34):**

- **No goal on the company and track pages.** The saved-goal strip, the fit mark on each track row and the track page's "מתאים למטרה שלכם?" card are gone; goal UI comes back on the goals page. The card's component (`FitMarkCard` in `site/app/components/compare/fit.tsx`) is kept, unused, for that page.
- **Exposure instead.** The track table's last column shows two small rings with their numbers: the share of the track's assets in stocks (F-87) and in foreign currency (F-88) at the end of the latest report period, computed from the CMA's own amounts (CAT-24); the track page shows both as rows. The rings are a kit piece (`ShareRings`). The CMA adapter now keeps `TOTAL_ASSETS` and `STOCK_MARKET_EXPOSURE` as value objects (`holdings`, data-schema 3.13), and the CSV's other numeric columns as received for later use.
- **Fees and labels (D36).** The fee cell shows the savings and the deposit fee on every row; the product's legal caps and the direct-expenses note sit under each table; labels beside a track's name say it is new or only for some employees. A company's page compares nothing with other companies (D35).
- **A fund's "עוקבת אחרי" link** on a company page leads to the index's guide page (`/exposure/<index>`), not to the index comparison.
- **The workbench pages are listed as not final** (section "Not final" above).

**What continues, in order:**

1. **F-48, early pension withdrawal:** re-read TXP-18's official text, then build it.
2. **The money-market and makam rate:** tie it to the Bank of Israel rate minus the fund's fees once a person reads the BoI page, which stops scripts. Today it is a round 3.5%.
3. **The founder's calls:**
   - a credit-points input (G-23);
   - the minimum order that would rank makam and bonds (GOV OQ7, GOV-24);
   - the tax when a refund at 60 is not claimed (the engine assumes 25%, an upper bound);
   - kit round 2;
   - whether the caution on accumulating foreign funds (TXF OQ1) stays.
4. **Rule-base requests:**
   - the source for a falling CPI in the provident products' real gain (`research/specs/2026-10-26-followups/requests.md`);
   - the scope requests (`research/knowledge/2026-10-25-scope/requests.md`);
   - the rules-scope requests (`research/specs/2026-10-25-rules-scope/requests.md`).
5. **Pages for a person to open in a browser:**
   - the Bank of Israel's prime-rate and deposit pages;
   - TASE's content and trading-hours pages;
   - the ISA's foreign-funds search and portfolio-manager register;
   - EUR-Lex;
   - the Supreme Court site;
   - and the link check's 43 links.
6. **Unchanged from the list above:** tier-2 graduation, data growth, the quarterly tariff refresh and the founder's approvals. Corporate bonds and REITs graduate as securities held in the securities account (D6 as amended 2026-10-26), not as wrappers.
7. **Securities in the account, what is left (D6, 2026-10-26):**
   - **The "which bank or investment house" page (F-63) for makam and government bonds.** It still ranks funds only: its run is the fund run and its subject is a fund record. It needs a makam and a bond subject that run the makam and bond ledgers on every provider's lines for their class, as the comparison card's picker already does.
   - **Money-market funds at a non-bank member in the comparison.** The comparison keeps the bank case, where a bank with a distribution agreement charges the holder nothing (MF-26, BANK-18). At a non-bank member that is an investment marketer, MF-26 does not bind and the tariff applies (BRK-52), so a person who already holds an account at such a member is priced as if they bought at a bank. Needs: the provider pick for the money-market securities, with each member's `money_market_units` lines and the bank case as one of the options.
   - **One account or a pick per option.** Makam and the bond each take their own cheapest provider, and a provider the person chose for the securities account does not carry over to them. If the founder means one account for everything held there, the pick becomes one choice shared by the account and its securities.
   - **The general track is not an exposure.** `data/instruments/exposures/general-track.json` names no contents: its own line says the mix is up to each manager's investment committee with no committed equity range, so two general tracks can hold different things. It exists only inside provident wrappers (kupat gemel lehashkaa, keren hishtalmut), which makes it a track, the provident counterpart of a fund in a securities account, and D18 already said track classifications get no exposure page. Today exposure mode asks for a return for an undefined mix and judges it at P-04's "כללי" row. A decision for the founder, since it is exposure mode's only mixed option: drop it from the exposures, or model tracks as the layer inside the provident wrappers and rank them by the asset mix each manager publishes.
