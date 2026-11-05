# Three claims for the rules page decision audit (lead only; never shown to readers)

Captured 2026-11-05 from https://orishamir.github.io/finance-tool/rules. Each claim comes from a question the
page itself lists (site parameter P-09, `data/parameters/pinned-rules.json`). Rule text below is from the
il-finance rule base (`.claude/skills/il-finance/references/`), read today; nothing is from memory.

| # | Claim as typed | Money at stake | Verdict by the rule base |
|---|---|---|---|
| 1 | קרן השתלמות פטורה ממס אחרי 6 שנים | large: the whole fund balance and its gains | true, with conditions |
| 2 | על רווח בבורסה משלמים 25% מס | medium: tax on a securities account's gain | half-true |
| 3 | מעבר מסלול בקרן השתלמות לא עולה כלום | small: at most a fee discount that ends | true, with one catch |

## Claim 1: "קרן השתלמות פטורה ממס אחרי 6 שנים" (reader: new-phone)

P-09 question: "מתי אפשר למשוך קרן השתלמות בלי מס?" (pinned ids TXH-09, KH-15).

- TXH-09 (tax-hishtalmut.md): amounts withdrawn are exempt once 6 years have passed since the account's first
  payment date (the earlier of the end of the month paid and the month paid for, not before the start of that tax
  year). The exemption covers all principal, but gains only on the benefited deposit (up to the ceiling).
  Ordinance s.9(16א). Likely to change: TXH-22 proposals (not law) would end the exemption on gains after year 6.
- TXH-11: gains on deposits above the ceiling are interest income, taxed at up to 25% of the real gain.
- KH-15: any withdrawal closes the account to further deposits (except a study withdrawal of up to a third, once in
  12 months); new deposits go to a new account with its own clock.
- TXH-10: 3 years suffice at retirement age or for study (the page's own example claim, "אחרי 3 שנים", is this).

What a reader should come away with: yes for money within the ceiling; gains on money above the ceiling are taxed;
the clock is per account; a withdrawal closes it.

On the page: 26 rules found, TXH-09 first; one company card (KH-13, Altshuler Shaham and Harel study withdrawal);
the company documents table says nothing matched. This is the claim whose company card was opened (state d).

## Claim 2: "על רווח בבורסה משלמים 25% מס" (reader: pension-pc)

P-09 question: "כמה מס משלמים על רווח בבורסה?" (pinned ids TXS-01, TXS-02).

- TXS-01 (tax-securities-israeli.md): an individual pays on the real capital gain at the s.121 rates, but at no
  more than 25%, the gain treated as the top slice of taxable income; a substantial shareholder (10% or more of a
  means of control, now or in the 12 months before) pays up to 30%. Ordinance s.91(ב).
- TXS-02: the gain splits into the real gain and the inflationary amount; the inflationary amount accrued after
  1993 is exempt, the pre-1994 part taxed at 10%.
- TXS-03: unlinked bonds and other unlinked debt: 15% of the whole gain (a different rate, not 25%).

Why half-true: 25% is a ceiling on the real gain, not a flat rate on the whole gain; inflation is not taxed;
substantial shareholders pay up to 30%; unlinked bonds are 15% on the nominal gain.

On the page: 7 rules found (TXS-01 first, then TXS-09, TXS-07, TXF-05, TXS-19, TXF-22, BANK-34); TXS-02, the
inflation rule the half-truth turns on, is not among them. The one company card offered is BANK-34 (nine banks'
prime rate), which has nothing to do with the claim.

## Claim 3: "מעבר מסלול בקרן השתלמות לא עולה כלום" (reader: careful-pc)

P-09 question: "עוברים מסלול בתוך הקופה: משלמים מס או עמלה?" (pinned ids TXH-17, TXK-04, PF-23).

- TXH-17 (tax-hishtalmut.md): changing tracks inside a study fund is not a tax event (tax deferred).
- PF-23 (provident-family-common.md): money moves between tracks within three business days unless the bylaws set
  less; reg. 33ב sets no fee and no limit on the number of switches.
- PF-14 case 2, with PF-13: a full or partial transfer to another investment track in the same fund lets the
  manager raise the fee before a discount's minimum period ends (after notice).
- TXK-04: the same holds for a kupat gemel lehashkaa (switch and transfer are not withdrawals).

What a reader should come away with: no tax, no switch fee; the one cost is that a fee discount can end early.

On the page: 5 rules found (KH-18, TXH-17, TXS-21, IRA-02, TXS-12); PF-23 (no fee) and PF-14 (the discount
catch) are not among them; no company section.

## State (c) and (d)

- (c) filter: the question chip "מה המדינה לוקחת" (175 rules) with nothing typed; the groups stay folded. The
  product chip "קרן השתלמות" (42 rules) was tried first and opened every card (autoOpenLimit 120), a 29,171 px page
  at 1440 px and 52,909 px on a phone, too tall to give readers; the lead may want that measured as a finding.
- (d) card: in claim 1's results, the fold "KH-13 · אלטשולר שחם והראל: משיכה להשתלמות לפי התקנון" opened; the
  shots are cropped to 400 px above the fold to 80 px below it. Its title shows twice (the fold's summary and the
  card's own header).
