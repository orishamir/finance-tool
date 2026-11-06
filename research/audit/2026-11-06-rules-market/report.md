# Rules: ETF market makers (#135) and a clearing member's failure (#136)

Domain-specialist, 2026-11-06, branch `rules-market`. Every source below was read on 2026-11-06; the TASE files were downloaded again that day and are byte-identical to the library copies, except doc. 274701, which has no known link.

## What was recorded

### #135: ETF-82, the duties of an ETF's statutory market maker (`etfs-and-index-funds.md`)

- General rule, primary, from the exchange's own rules: the guidelines to part three of the TASE rules, ch.י"ב1 ([274698 p.89](https://content.tase.co.il/media/mwsduioc/274698.pdf#page=89)), and TASE's board decisions (doc. 274701, library `57c057ab60c247db`, pp.10 to 13). No fund house's prospectus is used.
- What it says: the manager notifies the TASE member and TASE; at most two members per manager; TASE monitors and reports the findings to the ISA and to the manager monthly; quotes at all times during trading at the minimum quantity and within the maximum spread; the eight-row table (NIS 30,000 at 0.6% for a government-bond index; NIS 30,000 at 1.5% for A- corporate bonds, TA-125 shares and foreign indices with active overlapping derivatives; NIS 10,000 at 3.0% for the rest, short and leveraged, and currency-neutral funds); up to five prices a side; presence (4 of 5 pre-opening minutes; at most 100 minutes absent a day, 60 on Fridays and Hol HaMoed; monthly breach counts); no quoting on days the manager reported as non-calculation days; the exemptions (technical failure, halts, TA-35 moves of 5% and 12%, the general manager's exemption).
- ETF-03's stale sentence ("TASE rules ... were not reached") now points to ETF-82. ETF open question 2, already closed, notes the record.
- Site record: `data/rules/etf-82.json` (text only, no figures; see open question 34 below).

### #136: what a private holder gets when a clearing member fails (`brokerage-account.md`, `regulators-and-protection.md`)

Both parts of the clearing-house bylaws were read: [part A](https://content.tase.co.il/media/r1phfszz/274625.pdf) (membership, risk fund, collateral, default arrangements) and [part B](https://content.tase.co.il/media/t3coscsb/274627.pdf) (services, member accounts, the clearing house's guarantee), with the Securities Law ss.50א-50ג ([ISA's copy, p.93](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/IsaFile_8276.pdf#page=93)).

- **BRK-12 corrected** (unsettled → general, primary). It said the clearing-house rules had not been read and rested on TASE's report and brochure. Now it cites the bylaws: the guarantee runs to members and excludes interest and dividends; the risk fund (every member but the Bank of Israel and custodial members; at least NIS 400 m; quarterly; each share 100% cash at the Bank of Israel; collateral from the member's own means); the default waterfall (defaulter's repo and lending collateral, then its risk-fund collateral, then the clearing house's own money under an ISA directive, then other members up to their shares).
- **BRK-58 new** (general, primary): the client side. Client securities are registered in the clearing member's name "as trustee for its clients" (and for a non-clearing TASE member and its clients); a client sub-account apart from the nostro, wholly separate for securities; the clearing house may move missing securities from the nostro into the client sub-account; cash is settled jointly with the member's own ("במאוחד וללא הפרדה"); no claim on the risk fund and no compensation; a failing member must prevent harm to clients as far as possible; nothing on moving client accounts, paying clients or a shortfall.
- **What a private holder gets, as an inference stated in the record and not a text's words:** their TASE securities stay in the member's name as trustee, apart from the member's own; the clearing house's guarantee and risk fund protect the settlement of the member's trades, not the holder's account; client cash is a claim on the member, held in trust at a bank (BRK-08) and settled jointly at the clearing house; no Israeli scheme pays a shortfall.
- **BRK-59 new** (institution: Tel Aviv Stock Exchange): TASE's own description (21 members, custodial members, the ISA's CPMI-IOSCO confirmation), split from BRK-12 with its count figure.
- REG-15 and REG-16 conditions, the REG summary and the brokerage summary point to BRK-12 and BRK-58. **REG open question 11 closed** (the risk fund covers no end client). REG open question 9 narrowed (what the bylaws say; still open: who moves the accounts, who bears a shortfall, a court decision, the broker-dealer bill).
- Site records: `data/rules/brk-12.json` rewritten (scope general, Hebrew text, the risk-fund minimum as its figure; the member count moved to `brk-59.json`); `brk-58.json` and `brk-59.json` new; `reg-15.json`'s last sentence, which called the risk-fund question open, now says the fund gives a client nothing.

## What is open

- **ETF OQ34: the web address of TASE doc. 274701.** For the founder: TASE's rules pages on www.tase.co.il answer with an Incapsula check, which was not worked around. Open TASE's rules page (מדריך המסחר) in Chrome and copy the link of "מדריך המסחר - החלטות דירקטוריון והחלטות מנכ"ל" (file 274701). With it, ETF-82's table can become figures in `etf-82.json`, and ETF OQ1 and GOV-24's hours get a link too.
- ETF OQ35: what follows a statutory market maker's breach (the rules' part three, ch.ט'1, was not read).
- ETF OQ36: a foreign fund's appointed market maker's quantity and spread (none in the board decisions).
- BRK OQ22: the size of the clearing house's own share (an ISA directive under Securities Law s.50ג(ב)).
- BRK OQ23: whether the clearing house's lien and set-off reach what a failing member holds as trustee for clients.
- REG OQ9 (narrowed): who moves the accounts and who bears a shortfall when a member fails; REG OQ10: securities at a bank that fails (not touched).

## Checks and side effects

- `npm run validate`: data/ is valid. `npm test`: under a load average of 87, 16 timeouts in site tests; each failing file passed when run alone (`packages/pipeline` 171 of 171). The open-question count test goes from 529 to 534 (five new questions).
- `data/open-questions.json` was regenerated. It also takes in KH OQ12 and KGL OQ11, which were already closed (2026-11-03) in main's markdown but not in the file.
- `extract:sources` was run for the new records and then undone for 17 other records it would have rewritten (it drops hand-added quotes and titles, for example in `brk-54.json` and `gov-24.json`). Those records already differ from the markdown on main.
- Hebrew in the four `text_he` and `title_he` lines and in `reg-15.json` follows `docs/copy.md` section 10 and waits for the Hebrew editor's batch.

## For the lead (outside these issues)

- `brokerage-account.md` has two records numbered BRK-54 and two numbered BRK-55: the bank-notice and calculator records in the Rules section, and PEPPER and the First International promotion, which sit after the Sources section. One pair needs new numbers. Not changed here.
- No tax finding.
- New ids taken on this branch: ETF-82, BRK-58, BRK-59, ETF OQ34 to OQ36, BRK OQ22 to OQ23. Check them against the other two branches.

## Sources used

| Document | Publisher | Strength | Checked |
|---|---|---|---|
| [חוקי העזר של מסלקת הבורסה, חלק א'](https://content.tase.co.il/media/r1phfszz/274625.pdf) | TASE Clearing House | primary | 2026-11-06 |
| [חוקי העזר של מסלקת הבורסה, חלק ב'](https://content.tase.co.il/media/t3coscsb/274627.pdf) | TASE Clearing House | primary | 2026-11-06 |
| [מדריך המסחר: הנחיות על פי החלק השלישי לתקנון](https://content.tase.co.il/media/mwsduioc/274698.pdf) | TASE | primary | 2026-11-06 |
| מדריך המסחר: החלטות דירקטוריון והחלטות מנכ"ל, doc. 274701 (library copy, update 148 to 1.6.26; no link) | TASE | primary | 2026-11-06 |
| [מדריך לחברי הבורסה: החלק הראשון לתקנון](https://content.tase.co.il/media/q2mhob4u/274690.pdf), ss.75-83א (re-read) | TASE | primary | 2026-11-06 |
| [חוק ניירות ערך (נוסח רשות ניירות ערך, 2012)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/IsaFile_8276.pdf), ss.50א-50ג | ISA | primary | 2026-11-06 |
| [חוק ניירות ערך (תיקון מס' 61)](https://fs.knesset.gov.il/20/law/20_lsr_382400.pdf): the definition of "הסדרי כשל"; a search of its text layer finds no "לקוח" in either reading direction | Knesset | primary | 2026-11-06 |

The library has new `cite` records under the topics `clearing-default` and `etf-market-making`, and two `tried` lines: the 274701 link, and the bylaws' silence on what a client gets.
