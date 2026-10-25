# Report: every bank's 447 rates (researcher on Opus), 2026-10-25

Saved by the lead from the researcher's final message. Lead's notes at the end.

## Deposit terms from the banks' rate publications (Bank of Israel directive 447), read 2026-10-25

I wrote 21 records, three for each of seven banks, into `/home/ori/dev/finance-tool/research/specs/2026-10-25-guide-signatures/held-deposits/`. All 21 pass the `depositTerms` schema check (a one-off script, `/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/scripts/check.ts`). The three Leumi records pass the same check. I did not run `npm run validate`, because these files are outside `data/`. Nothing under `data/` was touched and nothing was committed. Every record has `checked` 2026-10-25, notes quoting the printed text, and conditions, amount ranges, break terms and exit points as published.

Banks I couldn't read: Jerusalem, One Zero and Bank Esh. They are listed under "Not found or not reached" below.

**How the data was fetched.** Except for Yahav (a PDF), each bank's 447 page is a shell that loads its table from a feed on the bank's own site. I read those feeds with plain GET requests. FIBI's and Massad's feed requires a request-id header that the page itself fills with a random UUID; I sent one. It is a tracking id, not a bot check or a login. Each record names both the public page and the feed URL. Treat this as a judgement call you may want to review.

### Hapoalim (feed prints "המידע נכון ל-26.10.2026", one day after the read date, like Leumi's)
| Item | Rate | Terms |
|---|---|---|
| Current account | 0 (see doubts) | The page says "לא מוצעת ריבית על יתרת זכות בחשבון" |
| פיקדון לשנה, fixed | 1.74% | From 100 NIS, no break, no exit points |
| חיסכון צומח לעתיד (monthly standing order) | 2.6% "לאחר 36 חודשים" | 2.4% after 12 months, 2.5% after 24; from 50 NIS; exits monthly after 12 months; plan term not printed |

Source: https://www.bankhapoalim.co.il/forms/he/savings/deposit-interest (feed `/forms/he/_api/deposit-products-data`)

### Discount (feed updated 2026-10-25 18:00)
| Item | Rate | Terms |
|---|---|---|
| Current account | 3.0% fixed | Automatic for individual and small-business tariffs if total assets in the account are at most 30,000 NIS; interest on 0 to 10,000 NIS; credited quarterly |
| פקדון לשנה, code 0122 | 2.25% | From 250 NIS, break with penalty, no exit points, branch and phone only |
| חיסכון ליעד ארוך, code 0669, 3–4 years | 1.25% fixed | 50 to 30,000 NIS, break with penalty, no exit points |

Source: https://www.discountbank.co.il/private/savings-investments/deposits-savings/classic/interest-rate-tables/

### Mizrahi-Tefahot (page dated 25/10/2026 19:24)
| Item | Rate | Terms |
|---|---|---|
| Current account | 0 | The page says "לא מוצעת ריבית על יתרת זכות" |
| 131 פומלית קבועה שנה | 1.55% | 1,000 to 10,000,000 NIS (from the product's terms PDF); no break |
| 286 ענבים פריים 6 ש' | P−3.75% = 1.00% | Monthly deposit 200 to 100,000 NIS; exit points every 3 months; no three-year monthly plan exists at this bank |

Source: https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/ plus the linked `MiniSites/Pikdonot-Terms/1_99_150_131.pdf` and `1_99_310_286.pdf`

### First International, FIBI (effectiveDate 2026-10-25)
| Item | Rate | Terms |
|---|---|---|
| Current account | 2% fixed | Private customers with a salary of at least 3,000 NIS; account assets at most 50,000 NIS; balance at least 10,000 NIS every day of the month; interest up to 10,000 NIS |
| איתן 311/835, one year fixed | 1.85% | 1,000–249,999 NIS (250,000+ earns 1.95%); no break, no exit points |
| חסכון אופק 287/841, 6-year standing order | P−1.75% = 3.00% | From 100 NIS; exits after 2 years, then yearly |

Source: https://www.fibi.co.il/private/depositsandsavings/interest/ (feed `apps.fibi.co.il/bff-depositmanagement/api/v1/fibi/...`; conditions PDF `https://www.fibi.co.il/helpsys-api?helpId=001&bankNum=031`)

### Massad (same platform, effectiveDate 2026-10-25)
| Item | Rate | Terms |
|---|---|---|
| Current account | 0 | The page says "לא מוצעת ריבית על יתרת זכות בחשבון" |
| איתן 311/835 | 1.85% | 1,000–24,999 NIS tier (same rate up to 249,999); no break |
| אופק להשתלמות 287/841, 6 years | P−2% = 2.75% | From 100 NIS; exits after 2 years, then yearly |

Source: https://www.bankmassad.co.il/private/depositsandsavings/interestratesondeposits/

### Mercantile (feed updated 2026-10-23 22:00)
| Item | Rate | Terms |
|---|---|---|
| Current account | 0.0 as printed (see doubts) | The conditions text beside it is a copy of Discount's |
| פיקדון לשנה, code 0122 | 1.05% | From 50 NIS, break with penalty, no exit points |
| חיסכון ליעד ארוך, code 0669, 3 years | 0.9% fixed | 50 to 30,000 NIS, no exit points |

Source: https://www.mercantile.co.il/private/investments-savings/deposit-savings/classic/interest-tables-new/

### Yahav (rate board 13_26, in effect from 06/10/2026)
| Item | Rate | Terms |
|---|---|---|
| Current account | P−4% = 0.75% variable | Offer runs 01.10.26–31.12.26; salary of at least 5,000 NIS and at least 2,000 NIS a month on Yahav cards; interest on a daily balance up to 10,000 NIS if the monthly average is below 10,000 |
| פיקדון לשנה, fixed | 1.95% | 1,000–50,000 NIS (2.15% / 2.30% / 2.80% for higher tiers); no break |
| מונדיאל, monthly, 4 years | 1.80% in year 1 | Then 2.00% / 2.20% / 2.50%; 100 NIS to 5 million NIS; exits after a year, then every 3 months |

Source: https://www.bank-yahav.co.il/media/bn5jiafl/447.pdf and the rate board https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf; plan terms from https://www.bank-yahav.co.il/investments/savings/

### Not found or not reached
- **Bank of Jerusalem:** the site's pages redirect to a Radware bot check (validate.perfdrive.com), so I stopped. The only rate sheet I found and could read, `https://www.bankjerusalem.co.il/media/6540/pikdonot030925.pdf`, says "בתוקף החל מה-03.09.2025" and uses a prime rate of 6%. It is too old, so I wrote no records. Needs a person in a browser.
- **One Zero:** the site and its PDFs return 403 with a Cloudflare challenge, including the deposit sheet `ONE ZERO - Savings Feb2026.pdf`, which search lists but I could not open. Needs a browser.
- **Bank Esh Israel** (listed in the Bank of Israel register): I found no website.
- **Otsar HaHayal and Pagi:** they share FIBI's platform but are not in the bank register the project uses, so I treated them as merged into FIBI and did not collect them.
- **Exact three-year monthly plans** do not exist at Mizrahi, FIBI, Massad or Yahav, and Hapoalim prints no plan term. For each of those I picked the closest product and explained the choice in its notes.

### Doubts written into the notes
1. **No-interest current accounts (Hapoalim, Mizrahi, Massad).** These pages print a sentence saying no interest is offered, not a number. I recorded 0 and said so in the notes. `rate_type: "fixed"` on these is only there because the schema requires a value.
2. **Mercantile current account.** The feed prints a 0.0 rate next to a conditions text copied from Discount's 3% offer. I stored 0.0, the printed rate.
3. **FIBI current account.** The linked conditions PDF ends "ההטבה בתוקף עד 31.03.2026", but the 2026-10-25 publication still lists 2%. I stored the publication.
4. **FIBI's 10,000 NIS minimum** is a balance you must keep every day to qualify, not a printed minimum on which interest is paid.
5. **Mizrahi 286:** the terms PDF prints the term as "6חודשים", against "6 שנים" in the table and the product name. I stored 72 months.
6. **Yahav מונדיאל:** it has one rate per year of the plan, and the record holds only the first-year 1.80%. No break term is printed; I recorded "not allowed" and marked it unconfirmed. Neither of Yahav's monthly plans appears in its 447 PDF.
7. **Hapoalim צומח לעתיד:** the term is null. It is not stated whether "after 36 months" counts from the plan's start or from each deposit.
8. **Discount savings plan:** term 36 falls in the "3–4 שנים" row. The "2–3 שנים" row excludes 3 years; both rows print 1.25%.
9. **FIBI and Massad איתן:** a 0.15% "הטבה" for this product appears in the publication's benefits list, and it is not stated whether 1.85% includes it.
10. **Per-deposit amounts.** For standing-order plans I read the printed amount range as the amount per monthly deposit; no page says so in words.
11. **Dates.** Hapoalim's feed is dated 26.10.2026 (`effective_from` set to that date). Mercantile's feed is from 23.10.
12. **Discount's 1.25% and Mercantile's 0.9% plans** are fixed with no exit points, like Leumi's. Each bank also has a variable three-year plan, noted in the record: Mercantile's "הו"ק ל-3 שנים" pays 2.0%.

The script that builds the records is `/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/scripts/gen.py`. The raw downloads are in `/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/dl/` (the scratchpad is wiped on reboot).

## Lead's notes (2026-10-25)

- Held, not published: the guide visuals show Leumi alone today ("לפי הפרסום של לאומי; בנקים אחרים עוד לא נאספו"). Publishing these to `data/terms/deposits/` needs the visuals and the comparison to take a range over banks first (spec rule 3), and a review of the twelve doubts above.
- The FIBI and Massad feeds were read with a request-id header that the bank's own page fills with a random UUID. It is not a login or a bot check; flagged to the founder as a judgement call. Jerusalem (Radware) and One Zero (Cloudflare) were not worked around and need a person in a browser.
