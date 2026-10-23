# Discovery: problems worth solving

Written 2026-10-22 after four research tracks and a founder interview.
Status: **discovery output, not a product decision.** `docs/product.md` does not exist yet. Nothing here commits the site to a feature, page or data source.

Inputs:

- `research/discovery/domain-landscape.md` (products, institutions, regulators)
- `research/discovery/tax-landscape.md` (tax treatment and benefits)
- `research/discovery/ux-landscape.md` (decisions, pain points, existing tools)
- `research/discovery/data-landscape.md` (public data sources and access)
- Founder interview, 2026-10-22 (summarised in section 1)

Every claim from research below points to one of those files. Nothing is filled in from memory. No tax or financial rule is stated here; where a rule is relevant, the tax report's section is named instead.

---

## 1. The founder, as stated in the interview

| Fact | Detail |
|---|---|
| Age and status | 22. Salaried employee. Israeli tax only (no US person or dual residency). |
| Holds today | Pension and keren hishtalmut via the employer. Several kupot gemel and a child-savings plan (חיסכון לכל ילד), all set up by parents, none self-chosen. Cash in the bank current account. |
| Has done | No self-directed investment yet. Has not bought a security since starting to learn about finance. Considering opening accounts at other brokers. |
| Why not yet | "I can't be sure if I know enough." Fear of acting on a picture that is missing a dimension (a tax rule, a fee type, a product difference). |
| Live goals | Apartment down payment (horizon not given). Long-term wealth beyond the mandatory pension. Emergency fund and a lump sum expected later. |
| Audience | **"Me and a few friends" (and family).** Not commercial. This contradicts the "personal use only, I am the only user" line in `CLAUDE.md`; see open question O1. |
| Decisions faced | All four: which pension or hishtalmut provider and track; where to open a brokerage account; where to keep cash; what to buy (ETF vs mutual fund, which exchange, which domicile). |
| How decides today | Self-research. The founder gave an example of reaching one conclusion (ETF in a brokerage beats a provident fund because of custody fees), then reversing it after learning about an age-60 exemption and tax-free track switching inside a provident fund. |
| Pain in own words | "I can't know what else I'm not considering when choosing." "I don't know which battles to fight: do I negotiate the holdings fee? conversion fee? deposit fee? Some are negligible and some are a 200,000 NIS difference." |
| Stance wanted | Explain and compare, then say which option is best for the stated goal, with every number sourced. Not "compare only", not "tell me what to do step by step". |
| Format wanted | Visual: graphs the reader understands at a glance, not only text. Hebrew, phone and PC (fixed constraints). |
| Success test, in own words | "If I can learn from the site about different financial instruments, what they are for, how they work, when they are better or worse than other instruments, and then which bank or broker offers the best deal." All four concrete outcomes were also ticked: invested the idle cash; know what I'm not considering; negotiated or ignored the right fees; a friend made a decision alone. |

### 1.1 Contradictions raised during the interview, and how they were resolved

| Contradiction | Resolution |
|---|---|
| "Also for friends" vs `CLAUDE.md` "personal use only, I am the only user" | Founder confirmed: a small known group of friends and family. The constraint in `CLAUDE.md` needs a founder decision (O1). Not changed by this document. |
| "I don't invest yet" vs ticking brokerage and deposits as holdings | Clarified: the kupot gemel and child savings are parental defaults. No self-directed investment exists. The brokerage tick meant intent, not a funded account. |
| Founder's example: a provident fund "doesn't pay the 25% tax if you withdraw after 60" | The tax report (section 3.3) found the exemption for kupat gemel lehashkaa applies when the money is taken as an annuity, not on a lump-sum withdrawal after 60. The founder's conclusion may or may not survive that correction. This is exactly the kind of rule the site must take from a sourced rule base, never from memory. Logged as evidence for problem D. |
| Saving for an apartment while most cash sits in a current account | Not disputed by the founder. It is the idle-money pattern the Bank of Israel describes (UX report 4.6). Logged as evidence for problem F. |
| Goal-to-instrument ranked first, yet "for me it is a one-time learning thing" | Founder's reasoning: for himself it is learned once and remembered; it is ranked first because friends and family need it. For his own repeated use, the provider workbench and fee materiality matter more. Both readings are recorded in section 3. |
| Reviewing existing holdings left off the list, although the only fees he pays today are on parental kupot gemel and child savings | Founder: "maybe I'm wrong"; at 22 the future matters more, but "older people may find that very important". Added as problem E, ranked after the first three. |

---

## 2. Problems worth solving, grouped

Each problem lists: what it is, the evidence, what already exists, and what is missing. "Founder" marks where the interview confirmed it.

### Group 1: choosing

#### A. Goal to instrument, net of fees and tax, over the whole horizon

- **Problem.** Given a goal and horizon (emergency fund, apartment in a few years, long-term wealth, a lump sum), which instrument fits: deposit, money-market fund, makam, bonds, ETF or index fund in a brokerage, kupat gemel lehashkaa, extra pension deposits, savings policy, and so on. The comparison must include lifetime fees, tax at exit, exemptions and what can be changed later without a tax event.
- **Evidence.** The forum's most common capital-market questions are "where do I keep liquid cash", "money-market yields are falling, where now", "what do I do with a lump sum", "saving for an apartment" (UX 3.1, Q1, Q2, Q9, Q11). Answers disagree inside the same thread. Money-market and makam use is low relative to idle cash (UX 4.6). The founder's own example (ETF vs provident fund) shows a conclusion flipping once a tax rule is added. **Founder: ranked 1.**
- **Exists.** Single-product calculators; horizon-first guides abroad (NerdWallet, UK flowchart, MoneySmart) (UX 6, 7). Regulator comparison tools are product-first and compare within one product class (UX 5.1).
- **Missing.** No Israeli tool found that puts a goal next to the main instruments and compares them net of fees and tax. This is an inference from absence (UX 1, point 6).
- **Dependencies.** Tax rules from a sourced rule base (tax report; `il-finance` skill does not exist yet). Instrument terms, ceilings and liquidity from the domain report (4.1 to 4.3). The 2026 arbitrage-committee proposal could merge three of these instruments (UX 4.8, domain 6).

#### B. Provider workbench for a chosen instrument

- **Problem.** Once the instrument is chosen, which bank, investment house or broker offers the best deal, comparing the whole cost structure (trading commission, custody or holding fee, FX conversion, minimums, deposit fees, management fee by track) rather than one headline number.
- **Evidence.** Pension and hishtalmut threads are dominated by provider, fee and switching questions (UX 3.1, Q3, Q6, Q7). The crowd-maintained broker-fee thread has 486K views (UX 5.5). Guides warn the difference between brokers is a cost structure, not a commission (UX 4.2). **Founder: ranked 2.**
- **Exists.** Gemel-Net, Pensia-Net, the CMA fee calculator, the TASE commission calculator, Supermarker, iGemel-Net, RAK, Lirot (UX 5.1, 5.2). Almost all draw on the same CMA data. Several route users to agents (UX 4.3).
- **Missing.** Cross-institution, machine-readable price lists for banks and brokers do not exist; each publishes its own PDF, XLSX or JavaScript page, with no archive (data 2.1, 2.2, 6.3 item 4). The price a given person is offered is negotiated and sometimes withdrawn (UX 4.5). Experienced users say app reliability decides more than small fee differences (UX 4.2).
- **Dependencies.** Per-institution tariff collection (data 2); official lists of banks, exchange members and portfolio managers were blocked (domain 2.1).

#### C. Which fees are worth fighting

- **Problem.** Show the lifetime shekel impact of each fee type so the reader knows which to negotiate, which to avoid by choosing differently, and which to ignore.
- **Evidence.** Founder, verbatim: "I don't know which battles to fight." 58% of Israelis do not know what pension fees they pay (UX 4.2). Teaser fees that rise after a few years exist in index tracks (UX 4.2). **Founder: ranked 3.**
- **Exists.** RAK gives a fairness rating and negotiation kit from statement figures, with a possible referral path (UX 5.2). MoneySmart shows fee impact on a final balance (UX 6).
- **Missing.** A neutral, no-referral view of fee materiality across fee types and across instruments. Negotiated fees are not published anywhere (data 6.3 item 8).

#### D. Knowing what I'm not considering

- **Problem.** The founder's stated blocker. A decision looks settled until a dimension appears that was not on the list: a tax exemption, a tax-free track switch, a domicile rule, a custody fee, a liquidity lock-up, a deposit ceiling.
- **Evidence.** Founder interview (both the ETF-vs-provident example and the explicit sentence). The forum's most-viewed beginner wiki is a sequence of exactly these dimensions, risk, then geography, then instrument, then platform, then wrapper (UX 3.1, Q8). Tax enters even beginner decisions (UX 4.7). The founder's own tax claim about age 60 did not match the tax report (section 1.1 above).
- **Exists.** Education-first content (Kol Zchut, הסולידית wiki, Finanztip) (UX 7). Information alone did not change pension behaviour in one study (UX 4.3).
- **Missing.** A complete, sourced checklist of decision dimensions per instrument, visible at the point of comparison rather than in a separate article.
- **Note.** This is not a separate feature so much as a completeness requirement on A, B and C. It is listed on its own because the founder named it as the reason he has not invested.

### Group 2: holding

#### E. Review what I already hold

- **Problem.** Kupot gemel at several managers and a child-savings plan, all parental defaults. Are they in a sensible track, at a fair fee, and should they be consolidated.
- **Evidence.** 33.1% of child-savings plans are in a track the NII chose (UX 3.1, Q10). After the 2016 default-fund reform, 41 to 43% of inactive savers still paid the maximum fee in 2021 (UX 4.6). Founder holds exactly this pattern and ranked it after A, B, C, noting it matters more for older users.
- **Exists.** Gemel-Net for fees and returns; the clearing-house report for a consolidated view, paid; Cover and bank apps as aggregators (UX 5.1, 5.3).
- **Missing.** A neutral review that joins "what you hold" with "what it costs over your horizon" and with the switching process. CMA open data gives per-track average fees and yields monthly (data 1.2), but field definitions must be confirmed first (data 6.3 item 10).

#### F. Idle money

- **Problem.** Cash in the current account while a goal with a known horizon exists.
- **Evidence.** Founder: apartment goal, cash in the current account. Household current-account balances in the hundreds of billions; few households hold money-market funds; the Bank of Israel says few depositors use its rate comparison (UX 4.6). Since April 2025 banks must show deposits, money-market funds and makam side by side (domain 4.1).
- **Missing.** For the founder this is a symptom of D (fear of acting), not a separate tool need. For friends it may be the first thing to fix. Overlaps A.

### Group 3: moving

#### G. Switching and getting the real price

- **Problem.** The hard part of changing providers is the process: clearing-house consent, agents, retention calls, quotes withdrawn, fees that get worse after an employer change.
- **Evidence.** UX 4.5 (one member's account of Migdal and Clal; fees worsening after a job change). The clearing house is also used by agents in retention plays (UX 5.1).
- **Exists.** Forum folklore. No tool found.
- **Missing.** A switching playbook and a record of offers received. The founder did not raise this; it surfaced only from research. Relevant to B and C once a reader acts.

### Group 4: foundations the site depends on

#### H. Learning, visually

- **Problem.** Founder: the site must explain what each instrument is for, how it works, and when it is better or worse than another, through graphs rather than text alone. For him this is one-time learning; for friends it is the entry point.
- **Evidence.** Interview. Half of Israelis understand their pension report little or not at all; 23% think pension funds are state-owned (UX 4.1). Education-first tools exist but are text-heavy (UX 5.1, 7).
- **Constraint.** Every number in a graph must trace to a file under `data/` with source and date (`CLAUDE.md`). A chart of "fee impact over 40 years" is a calculation on sourced inputs and sourced rules, not a sourced number itself; how to label that is an open question (O8).

#### I. Rules that change and are easy to get wrong

- **Problem.** The tax report lists ten rules most likely to change or be misremembered (tax 10): 2026 brackets, the two-part surtax, the annuity-exemption path, frozen vs wage-linked thresholds, 15% vs 25% on interest, the purchase-tax order ending 31.12.2026, repeated proposals to narrow the hishtalmut exemption, olim changes, National Insurance thresholds, and the rent ceiling. The arbitrage-committee proposal could restructure the instrument set (UX 4.8).
- **Implication.** The site cannot hold rules in page text. It needs a dated, sourced rule base (the `il-finance` skill named in `CLAUDE.md`, which does not exist) and a way to show "as of" dates. 22 tax open questions remain (tax 12), including accumulating foreign ETFs, child-savings withdrawals and savings policies.

#### J. Data that can and cannot be had

- **Free, machine-readable, verified (data 0):** CMA fund-level fees, yields and assets, monthly, history from 1999; Bank of Israel EDGE API (policy rate, FX, makam and bond yields, per-bank average deposit rates and fee averages); CBS CPI; Ministry of Finance child-savings rates by bank.
- **Hard:** bank deposit offers (JavaScript or dated PDFs), broker and bank tariffs (per-institution files, no archive), TASE prices and fund lists (API blocked, DataHub terms unread), ISA registers (JavaScript only), every gov.il page (403), negotiated fees (not published). Commercial aggregators forbid automated collection (data 5.1, 6.3).
- **Implication.** Problems A, C, E, H and I are well supported by open data. Problem B, the founder's second priority, is the one where the needed data is weakest.

---

## 3. What matters to the founder, and why

Ranked as the founder gave it, with his reasoning.

| Rank | Problem | Founder's reason | Research view |
|---|---|---|---|
| 1 | A. Goal to instrument, net of fees and tax (with D as a completeness requirement and H as the format) | "It's the most to me to know my options", but "a one-time learning thing" for himself; ranked first because friends and family need it. | The one gap no Israeli tool fills. Best supported by open data and the tax report. Exposed to the arbitrage reform. |
| 2 | B. Provider workbench for a chosen instrument | The repeated-use need: once the instrument is known, which bank or broker gives the best deal. | Many tools exist on the same data; the differentiator would be the whole cost structure and neutrality. The needed price data is the hardest to obtain and goes stale fast. |
| 3 | C. Which fees are worth fighting | "Some are negligible and some are a 200,000 NIS difference." | Strong fit with the founder's pain and with open fee data; the negotiated-price problem limits how precise "your fee" can be. |
| 4 | E. Review what I already hold | Added after push-back: "older people may find that very important." Low urgency for him at 22. | The founder's own holdings are parental defaults; regulator data covers them well. |
| Not ranked | F. Idle money; G. Switching; I. Rules; J. Data | F and G were not raised by the founder. I and J are constraints rather than user problems. | F is the founder's current state. G becomes relevant the moment B or C leads to action. |

The success test the founder gave combines A, B and H: learn what the instruments are and when each is better, then see which provider offers the best deal, with graphs. The four concrete outcomes he ticked (invested the idle cash; know what I'm not considering; negotiated or ignored the right fees; a friend decided alone) map to F, D, C and the audience decision respectively.

Stance: explain and compare, then say which is best for the stated goal. Not "compare only" and not step-by-step instructions.

---

## 4. Open questions

Product and scope (need the founder):

- **O1. Audience.** `CLAUDE.md` says personal use only and that the founder is the only user. The founder says friends and family will use it. Does the constraint change, and what follows for the no-legal-work rule and for handling someone else's situation (do friends enter their own goals, holdings and fees)?
- **O2. Instrument scope.** The founder wants "everything", including options he does not use yet, for friends. Does that include crypto, real estate, P2P, gold and savings policies, or only the instruments in his success test (deposit, money-market fund, makam, ETF, study fund, provident fund, pension)?
- **O3. Apartment horizon and amounts.** Not given. Needed to make the goal-to-instrument comparison concrete for the founder's own case.
- **O4. Staleness.** What "as of" date is acceptable on a shown number: daily for rates and FX (available), monthly for fund fees (available), and for bank and broker tariffs, which have no feed and no archive?
- **O5. Real price vs list price.** Pension, hishtalmut and provident fees are negotiated. Should the site show list fees, regulator averages, a fair-range estimate (the RAK pattern), or ask the reader to type their statement figures?
- **O6. Recommendation strength.** "Say which is best for the stated goal" was chosen. How should the site handle near-ties, which the forum says are common among money-market funds and among index trackers?
- **O7. Reform exposure.** If the arbitrage-committee proposal becomes law, three instruments merge. Build around today's products and accept rework, or design the instrument model to absorb it?
- **O8. Derived numbers.** A chart of lifetime fee impact is computed from sourced inputs and sourced rules. How should the site label a computed figure so the "every number traces to a source" rule still holds?

Rules and data (need work, not the founder):

- **O9. The `il-finance` rule base** named in `CLAUDE.md` does not exist. The tax report is the starting material; 22 tax questions are open, including accumulating foreign ETFs, child-savings withdrawals, savings-policy taxation, the kupat gemel lehashkaa ceiling from an official source, and whether the age-60 treatment the founder described exists in any form.
- **O10. Blocked registers.** Bank of Israel bank list, TASE member list, ISA licensee search, CMA financial-service-provider registry. Need a browser pass or a manual download.
  - *Status 2026-10-23:* the bank list is read (data.gov.il dataset 375, 17 entries); the TASE member list and the ISA registers were read in the browser pass of 2026-10-22 (coverage §12, BRK-32); the CMA financial-service-provider register is still unread (REG OQ3).
- **O11. CMA field definitions.** Whether fees and yields in the open datasets are gross or net, percent or fraction, and how averages are computed. Must be confirmed before any display. **[2026-10-23: partly confirmed, enough to display. Fees: percent (CAT-35); the average for the latest completed calendar year, labelled "לשנת 2025" on both portals in October 2026, dataset rows of year Y holding year Y−1 (CAT-36); the CMA's definition of the same-named member-report figure is the rate actually charged from all members after discounts, the identity with the field inferred (CAT-37); pension fees are per fund (CAT-39); empty means not reported (CAT-40). Yields: nominal, before management fees, percent, windows ending at the report month (CAT-04, CAT-32, CAT-41). Still open: how the average is weighted and which report feeds it (CAT OQ2, OQ23), whether yields are after direct expenses (CAT-41), risk-measure method (CAT OQ3). Sources and the value-object mapping: the research report of 2026-10-23 (cma-fields).]**
- **O12. Tariff collection.** Which banks and brokers publish machine-readable price lists, and how to snapshot them over time. Meitav, Yalin Lapidot, One Zero, Jerusalem, Clal and Infinity were blocked or not located.
  - *Status 2026-10-23:* first snapshots in `data/fees/` (schema `feesSnapshot`): Leumi's tariff (12 lines) and Meitav's product-page fees; Phoenix recorded as a missing snapshot, because no managing company publishes a study-fund list fee (Yelin Lapidot and Menora block scripts; Altshuler Shaham, Analyst, Harel, Clal, Migdal and More print only averages or no fee). Still open for the release 4 providers.
- **O13. TASE data terms.** Whether the DataHub free tier permits display on a small private site.
  - *Status 2026-10-23:* not researched in this pass (the browser was held by another agent; TASE hosts block scripts). Still open.
- **O14. Terms of use** for Bank of Israel EDGE and CBS data when republished.
  - *Status 2026-10-23:* **Bank of Israel: not permitted** without the Bank's prior written consent. The site terms (https://www.boi.org.il/en/terms-of-use/, Hebrew https://www.boi.org.il/website_terms/, both "last updated 17/02/2025", read in Internet Archive captures of 2025-12-13 and 2026-01-01 because the live pages are a JavaScript shell) say the user may not copy, publish, disseminate, transmit or sell site material without prior written consent; the EDGE data browser's footer links to that page and has no terms of its own. The planned fallback does not exist: data.gov.il holds no copy of the policy rate, the per-bank deposit averages or the makam yields (dataset `381` is a dead link). **CBS: confirmed.** Open licence v2.1 (3 Jan 2016) at https://www.cbs.gov.il/he/Pages/רישיון-שימוש.aspx allows copying, distribution and derived works, commercial or not, with a prescribed attribution line. **data.gov.il (MoF child-savings file, CMA data): confirmed** under https://data.gov.il/he/terms-of-use (updated 30/08/2025), source must be named. Full quotes and per-series specs: scratch report `reports/r2-series.md` of 2026-10-23 (to be moved into `research/`); product decision needed on the BoI series (ask for consent, or ship release 2 with link-outs and entered rates).

Research gaps carried over:

- Reddit, Telegram and Facebook group content was unreachable. Whether friends' questions differ from the forum's is unknown.
- No usage figures for Gemel-Net, Pensia-Net or the TASE calculator beyond the Bank of Israel's "small share" statement.
- The emergency-fund flowchart forum members refer to was not located.
