# Finishing the guides: map and plan

2026-11-06. Mapping only: read from the repository on this date, nothing downloaded or collected. Read: the Guides goal and its issues, the holding-related milestones (6 to 9, 12, 4), the guide pages and their content files, the held list (`site/app/lib/review.ts`), the rule base (all 31 files and its index), `data/open-questions.json`, `docs/data-inventory.md`, `docs/method.md`, `docs/glossary.md`, and the regulator's track data under `data/cma/`. Counts came from short scripts over those files. The marks in the table below are my reading of each file's open questions, not a rule-base field. Where I inferred, I say so.

Weighting, as you set it today: **the research foundation comes first** (for each kind of holding, are the rules a reader needs recorded from the law or the regulator?). **Page quality comes second.** Guides you have looked at: current account, money-market fund, provident fund for investing (partly), study fund. Every other guide is treated as unreviewed.

---

## 1. Every kind of holding, and how well the project knows it

**28 kinds of holding** in the rule base's landscape (the 43 closed companies are left out). **16 have a guide page; 12 do not.** 9 of those 12 are the "not covered yet" list; 3 are on no list at all (single shares, structured notes, Israel Bonds).

**What a reader needs to know about each one (six things):** what it is · tax · costs · getting the money out · who protects it if the company fails · moving it.
Marks: **L** recorded from the law, a regulator or the exchange · **P** recorded, with an open part that can change a reader's result · **C** only companies' own documents · **O** open, not recorded · **–** does not apply.
"Open questions" = unresolved (open or narrowed) in the kind's own rule file and its tax file. Several kinds share a file, so they share the count.

### Cash and bank

| Kind | Guide | What · Tax · Cost · Out · Protect · Move | Open questions that matter to a reader | Data collected | Formulas |
|---|---|---|---|---|---|
| Current account | Yes, **reviewed** | L · P · L · L · P · L | If the bank fails: no deposit insurance and the state *may* step in; nothing more found. Whether the account's interest gets the deposit tax treatment. (Bank file 15, interest-tax file 10) | Terms at 8 of 11 banks; fees 11 of 11 | Yes |
| Bank deposit | Yes, unreviewed, visual held (#48) | L · P · O · P · P · P | What breaking it early costs and how it is taxed (no general rule); the Competition Authority's deposit-moving order not read | One-year rows at 4 of 11 banks (#153, #95) | Yes, but no early break |
| Savings plan | Yes, unreviewed | L · L · O · P · P · – | Whether each monthly deposit has its own lock, and how breaking is priced | 1 of 11 banks (Leumi only, #96) | Yes |
| Foreign-currency deposit | No (not covered yet) | C · P · O · O · P · – | The legal basis of the 25% withheld (#101); conversion spread vs fee; deposit terms. Only 6 of its 17 rules are from the law | None | None |
| Structured deposit | No (not covered yet) | P · P · O · O · P · – | Whether it is legally a "structured product"; how each payout type is taxed (narrowed) | None | None |

### The state's debt

| Kind | Guide | What · Tax · Cost · Out · Protect · Move | Open questions that matter | Data | Formulas |
|---|---|---|---|---|---|
| Makam | Yes, unreviewed | L · P · L · P · L · – | Tax on the discount, 15% or 20% (two official texts disagree); can a person bid at the auction | Yields are a link only (Bank of Israel terms); broker fees at 18 houses | Yes |
| Government bond | Yes, unreviewed | L · P · L · L · L · – | Accrued interest when bought between coupons (moves a bond's value about 1.1%, so it is listed, not ranked); a falling index | Prices not collected; broker fees at 18 houses | Yes, listed not ranked |
| Israel Bonds (sold through the Bonds organisation) | No, on no list | O · O · O · O · O · O | Whether a resident of Israel can buy them at all | None | None |

### Securities account and what it holds

| Kind | Guide | What · Tax · Cost · Out · Protect · Move | Open questions that matter | Data | Formulas |
|---|---|---|---|---|---|
| Securities account | Yes, unreviewed | L · L · L · L · P · P | Securities at a bank that fails (not found); at a non-bank broker, held apart only by exchange rule; tax when moving your own securities between accounts (only companies say). Half its 59 rules are companies' terms, by design | 11 banks, 5 of the exchange's 8 Israeli broker members, 2 foreign brokers | Yes |
| Money-market fund | Yes, **reviewed**; renewable visual held (#48) | P · L · L · P · P · – | The regulator's final directive read only as a draft; order cut-off hours; what happens to holders if the fund company itself fails | 2 of 66 funds (the fund lists may not be republished) | Yes |
| Index fund and ETF (Israeli, foreign on the exchange, foreign-domiciled) | Inside the funds guide, unreviewed; index pages: 2 of 7 have text | L · P · P · L · P · – | Accumulating foreign funds: only a secondary source says tax waits until sale; US estate tax details; how the variable fee and swap cost work | 60 funds on 7 indices; no complete fund list can be collected | Yes |
| Active mutual fund | The funds guide, unreviewed | L · L · P · L · P · – | How many funds charge a load; holders in a manager's insolvency | No fund collected | General only |
| Bond fund that ends on a set date | Yes, unreviewed | C · P · C · P · P · – | No official name (#166); no real wind-up seen (#168); tax at wind-up is derived, not read; whether it is a comparison option (#167) | List from 9 of 15 managers' prospectuses | None (not an option) |
| Corporate bond | No (not covered yet, #105) | L · P · L · L · P · – | Tax when an issuer defaults; who the registered raters and trustees are; creditor order in insolvency | None | None |
| REIT (real-estate fund on the exchange) | No (not covered yet, #106) | L · P · C · L · P · – | No official list of REITs; National Insurance on its payouts; fees from the press only | None | None |
| Gold through a fund | No (not covered yet, #107) | C · O · C · L · O · – | How each fund holds gold; tax on gold ETCs and US gold trusts. 10 of 23 rules from the law | None | None |
| Single shares | No, on no list | O · L · L · L · P · P | Not in the product scope at all; the tax and trading rules exist, a product file does not | Broker fees only | Shares inside the account's formulas only |
| Structured notes and bonds | No, on no list | O · O · O · O · O · O | Never researched (left out of the corporate-bond file; founder decision F6 still open) | None | None |
| Managed and robo portfolio | No (not covered yet, #103) | L · P · P · P · L · P | Performance and variable fees (#100); termination fees; names of the 131 licensed managers not read | None | None |

### Provident family (regulated by the Capital Market Authority)

| Kind | Guide | What · Tax · Cost · Out · Protect · Move | Open questions that matter | Data | Formulas |
|---|---|---|---|---|---|
| Provident fund for investing | Yes, **partly reviewed**; visual held (#47) | L · P · L · L · L · P | Which withholding regulation applies; a loss at exit; the 15%-of-nominal line still shown (#225); whether the transfer circular covers it | Fees actually charged: all 12 companies in the regulator's data; list prices: Meitav only (#210) | Yes |
| Study fund | Yes, **reviewed** | L · P · L · L · L · P | National Insurance on employer money taken out early (#170); order of withdrawal between taxed and untaxed money; loan terms | Fees charged: all 15 companies in the regulator's data | Yes, with the drawing |
| Self-managed fund (IRA, study or provident) | Yes (2 pages), unreviewed, no visual (#218) | P · P · C · L · O · L | The regulations read only through a paraphrasing tool, and the 2025 draft's status; what protects the assets if the manager or broker fails; other managers' terms not read | 9 companies in the regulator's data; terms of few | Yes (comparison blocked, #90) |
| Child savings (bank or provident route) | Yes (2 pages), unreviewed, no visual (#218) | L · P · P · L · L · L | Exit tax rates rest on a secondary source; the fee after 21; how the default fund is picked | Bank rates: the Finance Ministry's daily series (all banks); provident route: 10 companies | Yes, tax labelled secondary |
| Pension fund (comprehensive and general) | Yes (2 pages), unreviewed | L · L · P · P · L · L | **What the pension will pay**: conversion and insurance factors not collected (#85, #65); self-employed not covered (#66) | Fees charged: 9 companies | Yes; exit value blocked (#89, #88) |
| Provident fund for annuity | Yes, unreviewed | L · L · L · O · L · L | Who pays the annuity, and on what factors | Fees charged: within the 15 companies' provident data | Yes, exit blocked |

### Insurance

| Kind | Guide | What · Tax · Cost · Out · Protect · Move | Open questions that matter | Data | Formulas |
|---|---|---|---|---|---|
| Savings policy | No (not covered yet, #108) | P · O · P · P · L · L | The main tax question: 25% of the real gain or 15% of the nominal (#86); its legal definition | None | None |
| Executive insurance | No (not covered yet, #111) | L · O · P · P · L · – | How growth inside it is taxed; guaranteed annuity factors | None | None |
| Amendment 190 deposits | No (not covered yet, #109) | L · P · – · L · – · – | National Insurance and health on the annuity (#102); death before 75 | None | None |

**Across the whole base.** About 1,020 rules (the index says 1,018); 530 open questions, of which 273 open, 117 narrowed, 140 closed. The tax files are 85 to 100% from the law. The product files that rest most on companies' documents are the securities account (49% from the law), index funds (46%), REITs and gold (43%), foreign-currency and structured deposits (35%). About 73 rules quote the law from a copy (Wikisource or Nevo), and several tax files say the Ordinance was read through a tool that returns short quotes; the rule base's own instruction is to re-read those in the official text before a page relies on them.

**Guide pages in numbers.** 19 guide pages (13 kinds of account, 4 securities, the funds page, the bond-fund page) and 9 index or exposure pages, of which 5 index pages (TA-35, TA-90, NASDAQ-100, MSCI World, MSCI ACWI) show "no text yet". 3 visuals are held. The securities account, child-savings (2) and IRA (2) guides have no visual (#218 asks about four of them); the funds page's picture is a long-horizon question (#177).

**Left out on purpose.** The 43 closed managing companies and every track closed to joiners. Out by your scope decision: crypto, peer-to-peer lending, derivatives, leveraged FX and CFD platforms, leveraged and inverse ETFs, private equity, physical real estate, collectibles. Left out by the rule base as not open to the public or not researched: old pension funds closed to joiners, savings-and-credit cooperatives and gemach deposits, hedge funds in trust and private investment trust funds (named only), real-estate crowdfunding and investment houses' real-estate funds, insurance-plan IRAs (whether any exist is open), payment wallets in foreign currency (covered only as a term).

---

## 2. Terms

- **448 terms** have a sourced explanation a reader can open.
- **30 terms** the site names have none:
  - **20 the rule base already defines** but the glossary has no row for: the seven index names (S&P 500, TA-125, TA-35, TA-90, NASDAQ-100, MSCI World, MSCI ACWI) and 13 others such as the daily money-market fund, the 90% test for a foreign fund, the redemption deduction, the creation and redemption fee, the detailed annual statement. All in #205; two of them wait for switching.
  - **About 10 the rule base cannot explain yet**: structured bonds, annual alpha, standard deviation, Sharpe ratio, "index" in its market sense, the S&P 500 tracker track as a regulated name, bond index and commodity as kinds, notional interest, average direct expenses (glossary section 4).
- Glossary section 4 also lists 11 rule gaps, 6 figures shown only as a link (publishers' terms) and 9 things the method does not model; those are not terms.
- No check finds a term named on a page without a row; the counts above come from the glossary and #205, so the true number may be higher.

---

## 3. Proposed finish line for the Guides goal

> **What is this product, and does it fit me?**
> Done when: for every kind of holding a person in Israel meets (the agreed list), the rule base records, from the law, a regulator or the exchange, what it is, how it is taxed, what it costs, when the money can come out, who protects it if the company fails, and how to move it, each rule re-read in the official text; every open question on those six that can change a reader's result is closed or shown on the page as open with its reason; its data covers every collected company that offers it, or the page says why not; its figures come from checked formulas in the method; every financial term a page names opens a sourced explanation; and its guide page says all of this in plain Hebrew, reviewed by the founder, with no example resting on one company and no visual left held.

The first half is the foundation; the page is its readable face and is finished last.

---

## 4. The work, ranked by what makes the project knowledgeable soonest

Research items change only the rule base or `data/` (size small, finance-reviewer checks them). Page items follow the size rules.

| # | Item | Issue | Size |
|---|---|---|---|
| 1 | **A "six things" table for every kind of holding, kept in the rule base.** Turn section 1 above into a living table in the rule base's coverage file, each cell naming its rules and open questions, so the foundation can be measured and the goal's progress shown. | New: *Rule base: what a reader needs, kind by kind* | Small |
| 2 | **What protects the money if a bank, broker or fund company fails.** Close the gaps shared by about 10 kinds: securities at a failing bank, client assets at a non-bank broker by law, fund holders in the fund company's insolvency, IRA assets, client cash in a broker's bank trust account. | New: *Rules: what protects the money when an institution fails* | Small |
| 3 | **Re-read the law in its official text** wherever the rule base quotes a copy or a short-quote tool (about 73 rules, plus the tax files' wording questions), starting with the rules the guides show. | New: *Rules: re-read every quoted law in its official text* (tax files go to the tax-specialist) | Small |
| 4 | **What a pension will pay.** Conversion and insurance factors per fund, and what a fund's annual report prints for insurance cost. | #85, #65 | Small |
| 5 | **Tier-1 tax questions that still change a result.** Makam 15% or 20%; accrued interest on bonds; tax on a deposit broken early; accumulating foreign funds; child-savings exit rates (secondary only); withholding and losses in the provident fund for investing; National Insurance on early study-fund money. | New: *Tax: the open questions that change a tier-1 result* (tax-specialist), and #170 | Small |
| 6 | **Data from every company, not one.** Provident fund for investing list prices beyond Meitav; savings plans beyond Leumi; the other deposit rows and First International; what breaking a deposit costs from the collected records. | #210, #96, #153, #95, #202 | Small each |
| 7 | **Terms.** Add the 20 rows the rule base already supports, then research the 10 it cannot explain, and add a check that lists any term named without a row. | #205; new: *Glossary: research the terms the rule base cannot explain, and a check for unexplained terms* | Small |
| 8 | **Decide the list of kinds** (questions below), then research the three on no list: single shares, structured notes, Israel Bonds. | New, "you decide": *Which kinds of holding must the guides cover?* | Small |
| 9 | **Close what blocks the not-covered kinds.** Foreign-currency deposit tax; savings-policy tax; National Insurance on an annuity; managed-portfolio fees; a real wind-up of a bond fund with an end date. | #101, #86, #102, #100, #168 | Small each |
| 10 | **Your review pass over the 12 unreviewed guides**, fresh readers first, with the open page questions settled in the same pass: rule codes as clutter, the held visuals, visuals for child savings and the IRA, the self-employed in the pension guide, the 15%-nominal line. | New: *Guides: founder review of the unreviewed guides*; #203, #48, #47, #218, #66, #225 | Medium |

Then, in order: text for the 5 index pages that have none (new, small); the not-covered kinds' pages once their research closes (#104, #105, #106, #107, #110, #103, #108, #109, #111, large each); the bond-fund page's name and comparison place (#166, #167); the guide and comparison pricing a house two ways (#154, small); the funds-guide picture (#177, long horizon); fun facts and the old questions page (#16); where to find a child's account (#69).

### Your decisions

1. **The finish line.** Should the Guides goal's "Done when" become the wording in section 3?
2. **The not-covered kinds.** Today they are a list, not pages (decision D2). Should each get a full guide in this goal, showing its open tax questions as open, while staying out of comparisons until its research closes? I recommend yes: "every kind of holding a person meets" includes a savings policy.
3. **Kinds on no list.** Should the guides cover single shares, structured notes and Israel Bonds? I recommend yes to shares (people meet them, and most rules already exist), research first for structured notes, and Israel Bonds only if a resident can buy them.
4. **What counts as sourced.** Should a guide wait for a law read only from a copy to be re-read in the official text? I recommend yes for every rule a guide shows.
5. **The other milestones.** Should the research issues of the four not-covered milestones (corporate bonds, REITs and gold; foreign-currency and structured deposits; savings policies and Amendment 190; managed portfolios) move into the Guides goal, so one goal shows the whole foundation? I recommend yes.
6. **Already waiting on you:** #225 (drop the 15%-nominal line; I recommend drop), #166 and #167 (the bond fund's name and comparison place), #48 (what the deposit and renewable-fund visuals answer), #66 (self-employed paragraphs; I recommend yes), #69 (link to a child's account lookup; I recommend yes), #177 (funds-guide picture).
