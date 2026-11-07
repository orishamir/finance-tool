# Interface day, 2026-11-07: what each page's research and data support

A map for choosing what to build today. For each guide page and the indices page: how well the rule base answers the six
questions of the Guides goal, what data feeds the page, what is held back on it, and a verdict. Read-only survey of `main`
at c8ba1b1d; nothing was built or opened in a browser.

**Sources read.** The six-question grades are copied from the living table in
`.claude/skills/il-finance/references/coverage.md` ("The six things", graded 2026-11-06, re-graded 2026-11-07). Question
status from `data/open-questions.json`. Blocked marks from `data/instruments/**`. Counts from `data/cma/`, `data/fees/`,
`data/funds/`, `data/terms/deposits/`, `data/series/` and `docs/data-inventory.md`. Held items from
`site/app/lib/review.ts` and issues #45 to #48. Other issues from `gh issue list` and `gh issue view`.

**Grades**, in the order *what it is · tax · cost · getting the money out · if the company fails · moving it*:
**L** answered from the law or a regulator; **C** only from a copy of the law or from companies' own papers; **O** open;
**–** does not apply; **!** an open part can change a reader's result (a figure, a date, or which choice is better).

**Verdicts.** **Solid**: ready for interface work. **Thin**: works, but a reader will notice the gaps named. **Open**: the
page lacks an answer it needs.

**Branches in flight** (marked in the "Branch" column):
- **deposits**: `guides-deposits`. Adds 17 more one-year deposit records at Discount, Hapoalim and Mizrahi-Tefahot, plus a
  line on what breaking a deposit costs. It touches the bank-deposit guide and the bank company pages. Its last commit
  (2026-11-06 20:30) records its second independent check as a **fail**: a deposit's exit points show as none, and the
  break line's link points at a held page. Not merged.
- **kgl-prices**: `data-kgl-prices`. Adds the published list fees of five more provident-fund-for-investing managers:
  Harel, Mor, Analyst, Altshuler Shaham and The Phoenix (read 2026-11-06). Today only Meitav's are on `main`. Not merged.
- **followups**: `guides-research-followups`. No commits yet; its worktree holds one uncommitted test-harness edit. Its
  brief covers the provident fund for annuity, the provident fund for investing, the shared open-tax notes and the
  "site's reading" mark. The shared open-tax note on whether a loss offsets anything shows on four guides: the provident
  fund for investing, child savings in a provident fund, and both self-managed funds. Today the "site's reading" mark is
  used only on the fee page, so where the branch puts it was not checked.

## 1. Data behind the pages: what exists and how fresh

| Data | Collected | Out of | Read on |
|---|---|---|---|
| Regulator's provident-fund tracks (`data/cma/gemelnet@2026-09.json`) | 573 tracks | 764 the regulator lists. The other 191 belong to the 43 closed companies or are closed to joiners, left out by decision | September 2026 report, read 2026-10-26 |
| Regulator's pension tracks (`data/cma/pensia-net@2026-09.json`) | 270 tracks | 293, left out the same way | September 2026 report, read 2026-10-26 |
| Bank and broker price lists (`data/fees/`) | 20 providers: 11 banks with Pepper counted apart, 5 Israeli brokers, 2 foreign brokers, 2 provident managers | How many exchange members exist was not checked | Banks and brokers 2026-11-04, Altshuler Trade 2026-11-05, Meitav provident 2026-10-23. The Phoenix's file is a "not found" record |
| Deposit and current-account terms (`data/terms/deposits/`) | 16 records: 8 banks' current accounts, one-year deposits at 4 banks, one savings plan (Leumi) | 11 banks in the price lists | 2026-10-23 to 2026-10-26 |
| Funds (`data/funds/`) | 60 funds (70 snapshots): 7 indices and 2 money-market funds | No full list. The exchange's terms forbid republishing it | 2026-10-23 to 2026-10-31 |
| Child-savings bank rates (`data/series/mof-child-savings-rates.json`) | 9 banks, Ministry of Finance daily file | All banks in the programme (the file's own list) | Latest row 2026-11-05 |
| Wrapper and security records (`data/instruments/`) | 13 wrappers, 4 securities | — | Most records checked 2026-10-23. Securities account, savings plan, makam and government bond checked 2026-11-07. Marks are regenerated from the rules by the data check |

## 2. Guide pages, one row each

Grades come from the coverage table's row for the kind each page explains (named in brackets where it differs from the page).

| Page | Six grades | Where the open part matters to a reader | Data behind the page | Held, and blocked marks in its record | Rules (open) | Branch | Verdict |
|---|---|---|---|---|---|---|---|
| Current account | L · L! · L · L · L · L | Whether the low-income tax deduction reaches interest in a current account | Terms of 8 of the 11 banks (none for Jerusalem, One Zero or Pepper); timeline on Leumi's terms; read 2026-10-23 to 25 | Nothing held. Blocked: the age-or-use exemption | TXI OQ11 | — | **Solid.** Open issue: the chart says everything three times (#235) |
| Bank deposit | L! · L! · L · L · L · L! | Whether a bank's published rate on a price-linked deposit is real or nominal; whether principal lost to a break penalty is a loss for tax; what the competition directives on moving a deposit say | One-year deposit terms at 4 banks (Leumi, Hapoalim, Discount, Mizrahi-Tefahot), 7 records; timeline on Leumi's one-year fixed deposit | **The "what makes it different" picture is held**, waiting for your question (#48). Blocked marks: none | BANK OQ17, TXI OQ14, BANK OQ6, SW OQ13 | **deposits** | **Thin.** Only 4 banks, and the picture is held. Wait for the branch (a 5th bank's rows: #95; rates banks actually gave: #124) |
| Savings plan | L · L! · L · L! · L · L | Whether each instalment has its own lock, and how a bank prices a break (read for one bank only); when tax is withheld on interest credited inside a plan | One plan, Leumi's three-year plan | Nothing held. No blocked marks | BANK OQ12, TXI OQ14 | — | **Thin.** One bank's plan stands for all (#96). The legend does not explain the striped bars (#236) |
| Daily money-market fund (money-market fund) | L · L · L · L · L! · – | What happens to holders' money while the fund manager or trustee is failing | 2 fund records, both Altshuler Shaham; the hours rule counts 9 managers' prospectuses | Nothing held. No blocked marks | REG OQ22 | — | **Solid.** The open part is rare. A link promises a deposit page it does not open (#244). Friday orders now cite their rule, so #231 looks done but is still open |
| Renewable money-market fund (money-market fund) | L · L · L · L · L! · – | Which managers offer renewable funds, and how many exist: no official list found | 1 fund record (1223866) | **The "what makes it different" picture is held**, waiting for your question (#48) | MF OQ11, REG OQ22 | — | **Thin.** The page cannot say who sells these funds, and the picture is held |
| Makam | L · L! · L · L · L · – | How a sale before redemption splits for tax; whether the unlinked-interest rate holds at 60 and over | Price lists of the 20 providers (2026-11-04); timeline on the price list that leaves the example plan the most | Nothing held. Blocked: the minimum, and the age-or-use exemption. The minimum mark looks stale: #169 says the exchange's minimum order is now known (rule GOV-24) | TXI OQ3, TXI OQ9, GOV OQ7 | — | **Solid** for explaining. A ranking of houses on this page waits on lifting the minimum mark and on how amounts under the minimum show (#56, #169) |
| Government bond | L! · L! · L · L · L · – | Whether a price-linked series has a floor when prices fall; the tax on accrued interest when bought between coupons | Same 20 price lists; timeline on one series | Nothing held. No blocked marks (minimum now covered) | GOV OQ6, TXI OQ5 | — | **Solid.** The open parts are edge cases. Same ranking question as makam (#56) |
| Securities account | L · L! · L · L · L! · L! | Who moves a failed bank's or member's accounts; what happens to foreign securities if the bank fails; whether moving your own securities to another account is a sale for tax | Price lists of the 20 providers; example fund 5139282 | Nothing held. No blocked marks | REG OQ9, REG OQ10, REG OQ23, TXS OQ17, SW OQ11, SW OQ12 | — | **Thin.** Failure and moving both carry real reader questions that no text answers yet. The guide and the comparison price two houses differently (#154) |
| Funds of every kind (active mutual fund; index funds) | L · L · L! · L · L! · – | Loads and variable fees (cost); redemption while the manager fails | None: rules only, no product data | Nothing held | MF OQ7, MF OQ5, REG OQ22 | — | **Solid** as a prose page; it ranks nothing |
| Bond fund that ends on a set date | L! · L! · L · L! · L! · – | No real wind-up seen yet; tax rests on reasoning from several texts; several companies' own terms | None: rules only (6 managers' prospectuses read into the rules) | Nothing held | MF OQ18, MF OQ19, MF OQ20, MF OQ22, TXS OQ21 to OQ23 | — | **Thin.** Four of five answers have an open part. Waits for the first real wind-up notice (#168) |
| Provident fund for investing | L · L! · L · L! · L · L | Whether a withdrawal below the deposits offsets other gains (that it is not taxed is now settled); taking annuity money back out as a lump sum | 143 tracks at 12 companies (regulator, Sept 2026); list fees from Meitav only | **The "what makes it different" picture is held** until its comparison is fair (#47). Blocked: loss offset. The "15% of the nominal gain" tax line is decided out (D73, 2026-11-06); its removal is in the followups branch (#225) | TXK OQ10, TXK OQ4 | **kgl-prices**, **followups** | **Thin.** Prices from 1 of 12 managers today (6 of 12 after the branch); the picture is held |
| Study fund | L · L! · L · L · L · L | National Insurance on money taken out early; how a withdrawal from the taxable part divides | 154 tracks at 15 companies; list fees from Meitav only (The Phoenix publishes none); fee range from the regulator's averages | Nothing held; the drawing is live. No blocked marks | TXH OQ4, TXH OQ15 | — | **Solid.** The drawing's open points are listed in #170. A gap in its form (#240) |
| Self-managed study fund | L · L! · L · L · L! · L | Banks' fees inside the fund; other companies' terms; in whose name the securities sit if the broker fails; loss offset | 7 tracks at 6 companies; one manager's terms; no price-list file | Nothing held; no picture yet (#218). Blocked: loss offset | IRA OQ6, IRA OQ7, IRA OQ11, TXK OQ8, TXK OQ10 | **followups** | **Thin.** Costs and protection are known for one company only |
| Self-managed provident fund | L · L! · L · L · L! · L | As above, and the tax at exit: the site does not compute the annuity, because each fund's conversion factors are not collected | 8 tracks at 7 companies; one manager's terms | Nothing held. Blocked: tax at exit, the age-or-use exemption, loss offset | PEN OQ7, IRA OQ11, TXK OQ10 | **followups** | **Open.** How much the money pays out is missing |
| Child savings, bank route | L · L! · L! · L · L · L | No Tax Authority text names child savings, so the bank route's rates are the site's reading of the law; whether the trust chapter makes the gain the child's; the fee after 21 | Ministry of Finance daily rates, 9 banks, latest 2026-11-05 | Nothing held; no picture yet (#218). Blocked: whether switching is a tax event | TXK OQ1, CS OQ8, CS OQ12 | **followups** (the "site's reading" mark, if it lands here: not checked) | **Thin.** The tax rate is shown as the site's reading. Where to find a child's account waits on you (#69) |
| Child savings, provident route | L · L! · L! · L · L · L | Same trust-chapter question; National Insurance describes an annuity route with no basis found in law; loss offset; the fee after 21 | 41 tracks at 10 companies | Nothing held; no picture yet (#218). Blocked: loss offset | TXK OQ1, TXK OQ10, CS OQ8 | **followups** (shared open-tax note) | **Thin.** The main answers stand; three notes stay open on the page |
| Comprehensive pension fund (pension fund) | L · L! · L · L! · L · L! | The pension a balance buys: each fund's conversion and insurance tables are not collected; the rate behind the statement's expected pension; the qualifying period after a move | 139 tracks at 9 companies; Meitav's list fee | Nothing held; picture live. Blocked: tax at exit | PEN OQ7, PEN OQ29, SW OQ7 | — | **Open** for "how much pension": the page says it cannot compute it. Explaining what the fund is and how it works is solid. Research waits on #85 |
| General pension fund (pension fund) | L · L! · L · L! · L · L! | Same as the comprehensive fund | 131 tracks at 9 companies; timeline on track 2158 | Nothing held; picture live. Blocked: tax at exit | PEN OQ7 | — | **Open**, same reason |
| Provident fund for annuity | L · L! · L · L! · L · L | Who pays the annuity and at what factors (narrowed on 2026-11-07: money moved to a pension fund joins its balance, and no fund has to accept it); the tax on lump sums allowed out | 182 tracks at 15 companies (8 of them self-managed); timeline on track 923 | Nothing held; picture live. Blocked: tax at exit | PEN OQ19, PEN OQ7, TXP OQ9 | **followups** | **Open.** The page says it does not compute the annuity yet |

Exposure pages (`/exposure/<id>`: shekel cash, the S&P 500, TA-125, general track) are outside this map.

## 3. The indices page (`/indices`, `site/app/routes/invest.tsx`)

| Six grades, by kind | Data behind the page | Held, and open decisions | Verdict |
|---|---|---|---|
| Israeli index fund: L · L! · L! · L · L! · –. Foreign fund on the Tel Aviv exchange: L · C! · C · L · L · –. Foreign fund bought abroad: L · L! · C · L · L! · –. Securities account: L · L! · L · L · L! · L!. Where it matters: whether tax waits until the sale on a foreign accumulating fund (the Tax Authority's 2019 letter exists only in a copy); U.S. tax withheld inside an Israeli fund that holds U.S. shares. Rules: TXF OQ10, TXF OQ1, ETF OQ23, TXF OQ8 | Price lists of 18 banks and brokers (2026-11-04 and 11-05). 58 index funds on 7 indices plus 2 money-market funds (2026-10-23 to 10-31). Daily ECB exchange rates. Not collected: Invesco's funds, and iShares TA-35 may not exist (#212). VOO, IVV and iShares ACWI are rows without a price until a U.S. trust-form fund's tax is settled (#152). 17 funds have no yearly record against their index (#163) | Nothing held. The four pricing decisions are built and landed on 2026-11-07: current-account minimums, the exchange spread said once on the page, costs others charge left out, One Zero's charge per dividend. Issues #178, #179, #182 and #183 are still open and can close once you have looked. The #190 checklist is still unticked, though its last comment says the work landed (not checked item by item) | **Solid** for finishing. New features wait, by the work order. Data gaps a reader may notice: Invesco missing, three well-known U.S. funds without a price, and foreign funds' tax resting on a copy |

### What is left on the indices page, checked against the issues and the current code

| Item | Still true? | What the files show |
|---|---|---|
| Student and young-people prices | **Yes** | A house's group prices show under its row as "מחיר אחר ל…" and are marked "לא בחישוב" (`copy.ts`, `groupPrices`). A group can be picked only where its price names fund units and ends after a printed number of months (`lib/group-pick.ts`). A price that ends at an age can never be picked, and nothing says what age counts as "young". Both points come from round 3's readers (`research/audit/2026-11-06-indices-pricing/readers/round3/report.md`). No later commit addresses them. No issue of its own: only #190's last comment |
| Plan values read as the reader's own | **Yes** | The line above the fields still reads "שדה שלא הזנתם הוא ערך התחלתי, פרמטר של האתר." (`copy.ts` line 299, kit `ParameterLine`, used in `components/invest/knobs.tsx`). Two round-3 readers took the values as their own inputs, mislabelled. Unchanged since then |
| Pink and magenta in the pairs bar | **Yes** | In the same cost bar, currency conversion is `--chart-cost-fx` (magenta 400) and tax is `--chart-tax` (rose 600) (`theme.css`; `components/invest/pair.tsx` lines 34 and 174). **Also worth fixing in the same pass:** the same bar draws the fixed account fee in red (`--chart-cost-fixed`, red 500) and fund fees in green (`--chart-cost-fund`, green 300). Ground rule 6 keeps red and green for status, never for a series |
| Fund tags cut on a phone | **Yes, as far as the code shows** | On a phone the kit's label row is one line that scrolls sideways, with no wrap (`components/kit/label-chip.tsx` line 131). It was last changed 2026-11-05, before round 3's reader saw "עסק…, כמו…, כמה ד…". Related: #216 (names cut with an ellipsis in the chip list and the cost bars) |
| 673 ₪ against 742 ₪ | **Yes, as far as the files show** | Round 3 reader: picking Leumi raised its "נשאר" by 673 ₪ but cut its cost by 742 ₪, with nothing saying why. No commit after the round mentions it. Why the two differ was not checked |
| 13-digit amount in the plan box | **Yes** | The movement run after round 3's fixes still reports `CUT box "1,000,000,000,000" (152 > 110 px)`, four times (`research/audit/2026-11-07-readers-round3-fixes/movement-sp500-ta125.txt`) |

Other open indices issues a builder will meet: 44 px touch targets at 390 (#258); the clicked account flying off screen (#238); a plus button that does nothing (#242); a first deposit change that moves a line (#200); one legend per fee bar (#204); the larger redesigns #191 to #195, which are new features and wait.

## 4. Five pages where interface work pays most today

1. **The indices page.** Data and decisions are complete; what is left is the six items above, all interface. Every one is
   confirmed in the code or the latest movement run, and you allowed this work to finish beside the guides.
2. **Study fund.** On the home page's guide door. The rule base answers all six questions, with one open tax point that rarely
   applies. The regulator's data covers 15 companies, and the drawing is live. What is left is interface: the gap in its
   form (#240), plus the drawing's caveats said on the page (#170).
3. **Current account.** All six answers rest on the law, and its data covers 8 banks. The only visible fault is
   interface: the chart repeats itself three times (#235). The same growth-chart fix (amounts on the bands, #234)
   reaches every guide with a timeline.
4. **Daily money-market fund.** One of the six kinds the home page's guide door opens (`data/parameters/home-guide-door.json`); five answers from the law, and the sixth's open
   part is rare. The work is interface: the link that promises a deposit page (#244) and closing #231. The two fund
   records are thin, but the page explains and does not rank.
5. **Child savings (both routes).** Every child has an account; the provident route is on the home page's guide door. Since this morning both routes' tax rests on the law, with the
   bank route labelled the site's reading. Data: 9 banks' daily rates and 10 managers' tracks. The page lacks the picture
   that answers its one question (#218), which is a major visual: drawing first, in two or three options. Coordinate with
   the followups branch, which touches the open-tax note shown on the provident route.

Next in line: makam and the government bond. Their rules are solid and the 20 price lists are in, but a ranking on their
pages is a ranking change (large), and it first needs the minimum mark lifted (#56, #169).

Not worth interface time today: the pension pages and the self-managed provident fund, which lack the conversion
factors; the bank-deposit and provident-fund-for-investing pages, whose branches are in flight and pictures held; the
bond fund with a set end, still waiting for a real wind-up.
