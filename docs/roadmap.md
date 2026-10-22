# Roadmap

Written 2026-10-22 from `docs/product.md` (confirmed the same day, decisions D1 to D13, open to revision).
Status: **approved by the founder on 2026-10-22.** Nothing is built. R1 starts only when the founder says so.

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
| 3.8 | Method (`docs/method.md`) and test cases (`tests/cases/`) | R1 (for what R1 computes), extended every release |
| 3.8 | Reader-facing rule link, rules page, parameters page | R1 |
| 3.8 | Change log | R1 (written), R5 (read by saved-state revisit) |
| 3.1 | Instrument guide, tier-1 wrappers and exposures | R1 |
| 3.1 | Tier-2 "not covered yet" page | R1 |
| 3.1 | Term matching (`data/terms/`) | R1 |
| 3.3 | Dimension checklist | R1 |
| 3.10 | Product decoder, managers in the CMA data | R1 |
| 3.10 | Product decoder, bank products | R4 |
| 3.10 | Decoder fit mark against a saved goal | R2 |
| § 6 | Data refresh and snapshots, CMA and `data/catalog/` | R1 |
| § 6 | Data refresh, Bank of Israel, CBS, Ministry of Finance series | R2 |
| § 6 | Data refresh, tariff and `data/funds/` snapshots | R4 |
| 3.2 | Goal comparison, wrapper mode | R2 |
| 3.2 | Idle-cash preset | R2 |
| 3.2 | Sensitivity panel (shared engine feature) | R2 |
| 3.2 | Goal presets and free-form attributes (D13) | R2 |
| 3.2 | Exposure mode | R5 |
| 3.9 | Saved state, local, automatic | R2 |
| 3.9 | Export and import as a file | R3 |
| 3.9 | Revisit against the change log | R5 |
| 3.5 | Fee materiality | R3 |
| 3.6 | Holdings review | R3 |
| 3.4 | Workbench, tracks | R3 |
| 3.4 | Workbench, providers | R4 |
| 3.4 | Workbench, fund variants (`data/funds/`) | R4 |
| 3.7 | Switching playbook | R4 |
| D2 | Tier-2 graduation to tier 1 | R5 and ongoing |

---

## Release 1: understand

**The smallest set the founder would actually use.** It answers his first concrete use case from the interview: open the Meitav app, press "open a new saving", and understand what the button opens and what every one of the eight tracks is. It also delivers the first half of his success test: learn what each instrument is for, how it works, and when it beats another, with graphs.

**In it**

- **3.8 Rule base, parameters, method, change log.** The `il-finance` rule base seeded from the tax report (sections 1 to 9) and the domain report (ceilings, liquidity, caps), each rule with source, strength and date, and the 22 tax and 23 domain open questions marked open. First site parameters with founder sign-off. `docs/method.md` covering only what R1 computes (the illustrative timeline on guide pages: compounding, fee bases, tax at exit, the deflator). `tests/cases/` for those. The reader-facing rule link next to every rule-dependent number, the rules page, the parameters page. The change log is written from the first data refresh, though nothing reads it yet.
- **3.1 Instrument guide**, one page per tier-1 wrapper and exposure type in the fixed structure, with the illustrative timeline visual, and the tier-2 "not covered yet" page naming the open question per instrument. Term matching from `data/terms/`.
- **3.3 Dimension checklist**, hand-maintained in `data/dimensions/`, shown on every guide page with each dimension marked covered, not applicable or blocked by an open rule.
- **3.10 Product decoder** for every managing company in the CMA datasets: the complete list of funds and tracks per manager with classification and fee, plus `data/catalog/` seeded from the founder's own apps, starting with the Meitav menu. Output: wrapper, fund record, exposure in plain Hebrew, dimension checklist, near-duplicates resolved from the data. The fit mark against a saved goal waits for R2.
- **§ 6 Data refresh** for the CMA datasets (monthly) and `data/catalog/` (manual), with the stale flag.

**Why first.** Everything later computes on top of the rule base; it cannot be skipped. The guide, checklist and decoder are the founder's stated first need and run on the single best data source in the landscape (CMA fund-level data, free, monthly, history from 1999). They need no expected return, no tariff and no blocked register. They are usable for a friend on day one: "what is this thing my bank is offering".

**Depends on**

- Data: CMA fund datasets with field definitions confirmed (product.md dependency 4; discovery O11). `data/instruments/` wrapper and exposure records (dependency 3). `data/catalog/` seeded from the founder's apps (dependency 6a). `data/terms/`, `data/dimensions/`.
- Rules: tier-1 wrapper tax treatment from the tax report. Open rules do not block R1 pages; they are shown as blocked dimensions.
- Other: `CLAUDE.md` already updated (dependency 10).

**Risks**

- The CMA field definitions (gross or net, percent or fraction, how averages are computed) are unconfirmed. Until they are, no fee or yield can be shown; the decoder would show names and classification only. Mitigation: confirm first, from the regulator's "sources and assumptions" pages, by hand if blocked.
- The illustrative timeline on guide pages is a computation and needs method.md and a test case per wrapper before it can be shown. Risk of shipping pages without the visual the founder asked for.
- Track names repeat within a manager (the founder's "general" twice). If the CMA data does not disambiguate them, the decoder must say so rather than guess.
- Hebrew labelling of tracks: the 2022 track-naming reform changed names; statements and apps may still use old names. `data/terms/` must carry both.

**Done when** product.md criterion 5 holds for the Meitav app, and a friend can read the money-market fund page and say what it is, how to buy it, what it costs, how it is taxed and when a deposit beats it (3.1 "works when").

---

## Release 2: decide for a goal

**Adds the decision the founder ranked first**, in the mode the data fully supports: the same exposure inside each eligible wrapper at an equal gross return, plus the idle-cash entry point that matches his current state.

**In it**

- **3.2 Goal comparison, wrapper mode**, with goal attributes and presets (D13), the ranked list, the chart, the plain-Hebrew "X is best because Y", ties (D5), the dimension checklist with considered, not applicable and blocked marks, and the **sensitivity panel** as a shared engine feature.
- **3.2 Idle-cash preset**: two inputs plus the person's own deposit offer entered by them; Bank of Israel figures labelled "average paid at this bank last month".
- **3.9 Saved state, local and automatic**, so a goal persists between visits. No export yet.
- **3.10 Decoder fit mark** against the saved goal, with a link to run the comparison.
- **§ 6 Data refresh** for the Bank of Israel series (daily and monthly), CBS CPI (monthly) and Ministry of Finance child-savings rates (daily).

**Why second.** Founder's rank 1 and the second half of his success test. Wrapper mode needs no expected equity return (D9), so it is honest with today's data. The idle-cash preset is the shortest path for a friend and the founder's own situation. Saved state is needed so the decoder can say "this track fits your goal".

**Depends on**

- R1 in full.
- Rules: the tax treatment of every tier-1 wrapper at the primary or secondary level (D10). **The money-market and mutual-fund taxation rule is an open question in the tax report (Q15) and must be closed before the idle-cash preset can ship**, since it compares deposits with money-market funds. Interest taxation by linkage (tax report section 1) and the wrapper rules (section 3) must be at least secondary.
- Data: Bank of Israel EDGE terms confirmed, or the data.gov.il fallback used (dependency 7); CBS terms. Fee data per wrapper type: CMA averages, the ISA category average for mutual funds and money-market funds.
- Method and test cases extended to the comparison engine, including the founder's apartment case and his ETF-vs-provident case.

**Risks**

- Highest rule exposure of any release. If Q15 stays open, R2 ships without the idle-cash preset and says so.
- Equal-gross-return comparison is only part of the answer when wrappers restrict exposures differently (for example a wrapper that cannot hold a given index). The output must state that exposure choice is deferred to R5.
- Sensitivity bounds and the tie threshold are parameters the founder has not yet set (N1). Without them the engine cannot declare ties.
- The founder's salary and contribution inputs touch ceilings tied to the average wage, which change yearly (tax report 10); the rule base must carry the tax year on each figure.

**Done when** product.md criterion 1 (the founder moves the idle cash using the site) and criterion 2 (he names a dimension he had not thought of) can be attempted, and the test cases pass.

---

## Release 3: fees and what you already hold

**Adds the founder's rank 3 and rank 4, and the track half of rank 2.** All three run on the CMA data already refreshed in R1.

**In it**

- **3.5 Fee materiality**: per-fee shekel cost over the horizon, ranked, verdicts from site parameters, regulator average or "no reference available", negotiation text, fee-drag chart, sensitivity panel.
- **3.6 Holdings review**: holdings entered from the statement with "where to find it", classification fit, consolidation per transfer rules, child-savings default check, fees handed to 3.5.
- **3.4 Workbench, tracks**: every track each provider offers for the chosen wrapper, with CMA fee and classification, fit mark, other exposures collapsed.
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

---

## Release 4: providers, funds and switching

**Adds the parts of rank 2 whose data is hardest**, and the playbook for acting on R3 and R4 results.

**In it**

- **3.4 Workbench, providers**: tariff-based total cost per provider over the holding period, three fee levels (D4), ties, minimums, supervision and protection status, cumulative-cost chart, "not comparable, data missing" rows.
- **3.4 Workbench, fund variants**: `data/funds/` hand-collected per exposure, compared on fee, domicile and distribution policy, with blocked dimensions where the tax rule is open (accumulating foreign funds, tax report Q1).
- **3.10 Decoder, bank products**: deposit and savings-plan names from tariff snapshots and product pages mapped to wrapper records.
- **3.7 Switching playbook**: steps rendered from rule-base entries, post-switch checklist, reminder to record offers.
- **§ 6 Data refresh**: tariff snapshots (manual, at least quarterly) and `data/funds/` versions.

**Why fourth.** Founder's rank 2, placed after R3 only because its data is the weakest in the landscape: per-institution PDFs with no archive, blocked registers, no regulator average for non-bank brokers, no licensed fund-level feed. Starting with the providers whose tariffs are structured (Leumi, Mizrahi, Discount) gives a usable table early; the rest fill in as snapshots are collected. The playbook comes here because this is the release after which people switch.

**Depends on**

- R1 to R3.
- Data: tariff snapshots (dependency 5; Meitav, Yalin Lapidot, One Zero, Jerusalem, Clal, Infinity blocked or not located); blocked registers fetched by hand for the provider list (dependency 8: bank list, TASE members, ISA licensees); `data/funds/` seeded for the exposures named first (N4); TASE DataHub terms if any TASE data is used (dependency 7).
- Rules: which fee types apply to which wrapper; clearing-house and consent rules for the playbook, which need a manual source pass because gov.il blocks scripts (dependency 9); transfer rules.
- Parameters: tie threshold applied to provider totals.

**Risks**

- The largest data risk in the roadmap. Tariffs go stale within a quarter; without snapshots, D3's stale flag fires constantly. Mitigation: ship with few providers and say so, rather than many with stale numbers.
- Negotiated prices are not published; the table shows list, average and "entered by you" only. The founder's expectation of "the best deal" must be set to "the best listed deal, unless you enter an offer".
- Fund variants depend on a tax rule that is open (Q1). Accumulating foreign funds may remain "blocked" for a long time.
- The playbook cannot state a process rule without a regulator source; if the source pass fails, the playbook ships as experience-only content, labelled as such.
- The bank-product decoder has no regulator catalogue behind it (N6); completeness is whatever the catalogue holds.

**Done when** for "ETF in a brokerage account with a given monthly purchase" the table ranks the providers with collected tariffs and shows which fee type decides, every provider without a tariff is listed as missing, and a person switching a hishtalmut can follow the playbook without the forum.

---

## Release 5: exposures, revisiting and growth

**Completes the product**: the mode of goal comparison that needs a return assumption, the revisit promise, and the path for tier-2 instruments.

**In it**

- **3.2 Exposure mode**: which exposure type suits the horizon and the loss filter; cash-like exposures from sourced series, equity and bond returns entered by the person and labelled so (D9). A sourced scenario file is added only if one with a defensible source exists (N5).
- **3.9 Revisit against the change log**: a saved comparison re-run after rule, parameter or data changes, reporting what changed and whether the ranking holds; the reader-facing "what changed since" view of the change log.
- **D2 Tier-2 graduation**: for each tier-2 instrument whose record is sourced and whose tax questions are closed, promotion to tier 1 across 3.1, 3.2, 3.3, 3.4 and 3.10. Ongoing after R5.

**Why last.** Exposure mode is the only capability that cannot be honest with today's sources; it waits until the equal-gross-return comparison has done its work and the person is choosing between asset classes. Revisit needs a change log with enough history to be worth reading. Tier-2 graduation is gated by tax open questions that close on their own schedule.

**Depends on**

- R1 to R4.
- Rules: the loss filter as a user-set constraint (D11) needs no rule; tier-2 graduation needs the open tax questions for each instrument closed (tax report Q5, Q6, Q9, Q13 and others).
- Data: change log history from R1 onward; export format stability (N3).

**Risks**

- Exposure mode with an entered return can be misread as the site's view. The "entered by you" state (D7) must be unmistakable on the chart.
- Tier-2 graduation may never happen for some instruments if the regulator never publishes the rule; the "not covered yet" page stays honest.
- Revisit can produce noise if every data refresh triggers "something changed"; the change log must distinguish changes that affect a saved ranking from those that do not.

**Done when** product.md criterion 4 (a friend goes from a goal to a concrete choice alone) holds including an exposure choice, and a decision recorded before a rule change shows the re-check notice after it.

---

## Not planned

Nothing from `docs/product.md` section 3 is dropped: every capability and part is placed above. The items below are in product.md as exclusions or open questions and stay that way:

| Item | Where in product.md | Reason not planned |
|---|---|---|
| Photo or screenshot input to the decoder | 3.10 In | Needs server-side processing, excluded by D1. The person types or pastes the name instead. |
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

Approval of this document fixes the release contents and order. It does not start work: R1 begins only when the founder says so, with the rule base as its first task (product.md dependency 1). Changes to a decision in product.md section 1 may move items between releases; each move is recorded here with the date and reason.
