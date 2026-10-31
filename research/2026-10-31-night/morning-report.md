# Morning report, night of 31 October 2026

## The one command

```bash
research/2026-10-31-night/fetch-remaining.sh
```

It takes no arguments. It starts FlareSolverr, fetches the 27 gov.il pages on `gov-il-list.tsv` that I could not reach, files them in the library, commits, pushes and prints "Tell Claude it ran." Failures go to `gov-il-failed.tsv`. It was tested only with a fake tool, so a real failure may show up here first.

What rests on those pages:

- **The Tax Authority's list of circulars.** I could not go through it, so I cannot say no circular since 2023 is missing. This is the largest hole in "not missing a rule".
- **The Capital Market Authority's consolidated code.** It is the way into the study fund and provident fund chapters and the circulars list.
- **Whether the draft circular on annual and quarterly reports became final.** Three site records cite it, and on everything read it is a draft.
- **The rest:** service pages (form 747, form 150, form 5329, leaving work), the tax treaties list, the tax reform report and the guides already cited.

Once it has run, tell me. I read what it filed, add digests and topics, and close what those pages settle.

## Save these from a browser

A script is refused on these, and they open normally for you. Save them and give me the folder.

- One Zero's general terms: https://www.onezerobank.com/warehouse/userUploadFiles/Image/One%20Zero%20General%20terms%20and%20conditions_output%20(3)%20(1).pdf
- One Zero's rate table, money-market table and custodians document, all linked from https://www.onezerobank.com/company/information/114
- Massad's terms, chapter C: https://www.bankmassad.co.il/media/r1vmkylx/%D7%97%D7%95%D7%91%D7%A8%D7%AA-%D7%AA%D7%A0%D7%90%D7%99%D7%9D-%D7%9B%D7%9C%D7%9C%D7%99%D7%99%D7%9D-%D7%9C%D7%A0%D7%99%D7%94%D7%95%D7%9C-%D7%97%D7%A9%D7%91%D7%95%D7%9F-%D7%A4%D7%A8%D7%A7-%D7%92.pdf
- Yahav's deposit rates: https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf
- Maya, by your hand, because it refuses automated browsing: the Israeli annexes and tracking fund prospectuses (maximum load, redemption deduction), and the fund whose fee could not be settled on [issue 91](https://github.com/orishamir/finance-tool/issues/91).

## What changed on the site

**The comparison's pick changed.** Nine banks that showed no price for tracking funds now have one, because their tariffs say the exchange line includes them. For a lump sum or a long horizon, One Zero now beats Psagot, which was the pick before.

| Case | One Zero | Psagot |
|---|---|---|
| 67,000 NIS for 8 years | 89,759 | 89,357 |
| 100,000 NIS for 20 years | 218,106 | 214,079 |

Monthly deposits still go to Psagot.

**A code fault leaves those nine banks out of the goal comparison.** They are priced on the indices page, but the comparison's broker list holds only five (Altshuler, Excellence, One Zero, Psagot, IBI). An error is caught silently at `packages/engine/src/providers/workbench.ts:403`, and a test pins the result with a wrong reason. I patched it temporarily, computed, and undid the patch. **The pick does not move:** with all 14 in, the same broker wins all five goals I tried, also with Jerusalem's minimum corrected and with Leumi on its regular line. I did not push the fix, because the list would grow from 5 to 14 rows, and it depends on the Leumi decision below: [issue 127](https://github.com/orishamir/finance-tool/issues/127).

**One record was wrong and is corrected.** Bank of Jerusalem's direct price had no minimum, so a 500 NIS purchase cost 2.50 NIS and it looked nearly the cheapest. Its tariff, page 19, prints a minimum of 20 NIS and a maximum of 20,000, and for makam 20 and 7,500. The record now says so.

Total fees in the indices page's tracking-fund row (10,000 NIS now, 500 a month, 10 years, 7%, 2% inflation). Jerusalem's figure is my arithmetic, 120 purchases at 17.50 NIS more, not a rerun:

| Provider | Fees (NIS) | Before |
|---|---|---|
| Psagot | 1,058 | same |
| Leumi | 4,365 | same, on a line the decision below questions |
| One Zero | 4,549 | no line |
| Jerusalem | about 6,400 | no line |
| Hapoalim | 6,585 | no line |
| Yahav | 6,585 | no line |
| Discount | 8,336 | no line |
| Mercantile | 8,336 | no line |
| Massad | 9,574 | no line |
| IBI | 9,946 | same |
| FIBI | 10,027 | no line |
| Mizrahi-Tefahot | 10,622 | no line |
| Altshuler | 25,098 | same |
| Excellence | 26,624 | not comparable |

Please look at that page first. Nothing else changed in what a screen shows, apart from exact places added to some source lines on rules ("עמוד 17, חלק 4(א)(6)"). On 1,220 pages the visible text stayed identical after the fee values got their pages.

## What the night found

**Two regulator findings came from reading the live lists in a browser:**

- **The "(!)" in a fund's name has a new final text, dated 19 April 2026.** The rule base still called it a proposal, and I rewrote that rule from the directive. A notice in the gazette dated 20.5.2026 sets the start three months later, so about 20.8.2026 (my computation).
- **The Securities Authority's own list has 37 approved foreign funds, all iShares or Invesco.** No Vanguard fund and no iShares MSCI World is on it, which agrees with the exchange's list. The Authority says it does not check these funds' prospectuses or supervise their managers, and Israeli fund law does not apply. The fees on the list are mostly old, some from 2019. It says nothing on buying abroad through a foreign broker. The list is in `isa-foreign-funds.tsv`.

**The Bank of Israel publishes the rate households actually got, per bank.** The source was already named in the rule base; what is new is reading the sheet. In September 2026, a fixed deposit of six months to a year:

| Bank | Rate actually given |
|---|---|
| One Zero | 6.00% |
| Hapoalim | 3.77% |
| Jerusalem | 3.71% |
| Leumi | 3.66% |
| All banks | 3.54% |
| Discount | 3.51% |
| Mizrahi-Tefahot | 3.30% |
| FIBI | 3.30% |
| Yahav | 2.91% |
| Mercantile | 2.90% |
| Massad | 2.79% |

Published offers are far lower (Hapoalim 1.74%, FIBI 1.85%). They are not like-for-like, because the amount, the term and negotiating all differ. It would be useful on the deposit guide: [issue 124](https://github.com/orishamir/finance-tool/issues/124).

**A foreign fund through an Israeli bank is not self-reported.** The bank withholds 25% of the real gain on sale. The site labels iShares Core S&P 500 as "דיווח עצמי למס", which is wrong for that holder: [issue 126](https://github.com/orishamir/finance-tool/issues/126). It needs a mockup.

**Rules and sources:**

- 30 new rules are in the rule base, and none is on the site yet: [issue 125](https://github.com/orishamir/finance-tool/issues/125). They include a survivor's withdrawal of up to 8,000 NIS without a succession order, the half-yearly fee notice, no current-account fee on an account kept only for securities, how capital losses are used, and the tests for trading as a business.
- 291 fee values got their exact page, and none changed. Hapoalim, Yahav and most of One Zero remain without pages.
- 233 law citations moved from Wikisource to a state copy or a gazette page. The Provident Funds Law has no state consolidated copy, which is the largest gap left (52 citations).
- The tax figures for 2026 match the Tax Authority's 2026 booklet at every figure sampled.
- The Bank of Israel's live and cancelled directive lists hold nothing in scope that the rule base lacks.
- Terms of 11 banks: 7 filed and read, Massad partly, Hapoalim filed and unread, One Zero blocked, Esh Israel publishes none.
- Regulations of 34 institutions: 11 found, 11 partly, 2 blocked, 3 not found, 7 not checked (they need Maya).
- 14 of 14 tracking funds charge no load today. Nine foreign fund records are drafted in `funds/`, with no Israeli annex read.

**Not established, and left open rather than guessed:**

- Whether moving securities between one holder's accounts is a sale. No sentence of the Tax Authority was read.
- How excess foreign tax is recovered.
- Whether the joint-account rule of withholding at the highest holder's rate is more than Discount's and Mercantile's own term. The law read gives equal shares.
- Whether the proposal of October 2025 on foreign-index tracking funds became final. The Authority's list shows nothing later than October 2024, and a gazette notice was not checked.

## Waiting on you

1. **Meitav Trade.** Its tariff says custody 0.15%, minimum 270 NIS a quarter; its pages say no custody fee. It stays unpriced until someone asks the company: [issue 42](https://github.com/orishamir/finance-tool/issues/42).
2. **Which price should a tracking fund be compared on when a bank has a cheaper standing-order price?** Today Leumi alone gets one: 5 NIS on a 500 NIS purchase, against 20 to 45 NIS at the other banks. That line is for buying only, yet it also prices Leumi's sales. Massad and FIBI print a 7 NIS standing-order minimum and don't get it. I recommend the regular price for everyone, with a sentence on those three banks' pages. The fix for the nine banks goes in with this: [issue 127](https://github.com/orishamir/finance-tool/issues/127).
3. **The self-report label:** a mockup, then the fix ([issue 126](https://github.com/orishamir/finance-tool/issues/126)).
4. **Five guides use one bank as their example.** They need a mockup replacing it with a range: [issue 112](https://github.com/orishamir/finance-tool/issues/112).
5. **"Minimum" on the makam and government bond pages** is still blocked, though the rule base now answers it (10,000 face value, 10,000 NIS). Go ahead on the wording?
6. **Which held facts earn a place on the guides:** the study fund's death beneficiary, default track, and actual fee of 0.34 to 0.74.
7. **Which foreign funds join the indices page,** now that the Authority's list says which are approved here: [issue 30](https://github.com/orishamir/finance-tool/issues/30). I recommend the Irish ones on that list first.
8. **Three more prices the data doesn't hold:** [issue 128](https://github.com/orishamir/finance-tool/issues/128).
   - Fair (0.08%, minimum 3 NIS on tracking funds; custody not printed). I recommend adding it, with custody shown as unknown.
   - PEPPER, Leumi group's digital bank (4 NIS up to 30,000 NIS an order). Whether that covers a tracking fund isn't stated. I recommend adding it only once someone reads that it does.
   - FIBI's club prices (0.1%, minimum 5 NIS), which are discretionary and end on 31.12.2026. I recommend not pricing them, only a sentence on FIBI's page.

## Smaller things I found

- Two links in the rule base are really dead: the form 161 service files (`itc-161`, `itc-161d`).
- `data/` still holds Wikisource links, which the sources work has not reached: 22 in rules, 96 in terms, 16 in instruments, and the publishers list.
- The law on retirement age pointed at the wrong gazette PDF, the 1987 law, in three files. Corrected.
- One possibly changed fact: the trustee in one corporate bond rule differs between the gazette and the Authority's copy. Not settled.
- Four junk files in the library were filed by mistake, and one is an empty script shell. They are harmless and listed in `job-6.md` and `chrome-notes.md`.
- Files to read later that were filed unread: Hapoalim's general terms and securities chapters, and the Authority's new outsourcing directive of 17 September 2026.

## The meter and the library

The week's meter read 1% before the first job and 5% after the last, against the 25% line for the planned jobs and 40% for extra research.

The library holds 1,914 documents and 24,812 pages, each searchable by page. Of 153 searches during the night, 97 found the answer without a new download.

Each job's report is `job-1.md` to `job-10.md` and `job-tax.md` in this folder.
