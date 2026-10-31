# Job 5: investment houses' published customer terms

Issue 123, brokers, provident managers and fund managers. Read 2026-10-31. Library only: nothing in `data/`, `packages/`, `site/` or the rule base changed, and `data/sources/documents.json` was not edited. A page number is the file's page. Quotes below are recorded with `cite` under the plan's topic unless marked otherwise.

Each company's document speaks only for that company. A shared wording below is a fact about the companies named, not about the market. Nothing in any document addressed me.

## How far the reading goes

- **Word search, then the passage.** I searched each document for the plan's topics and read passages in some, not every page. "No clause found" means the search found none; it is not a statement that the company has no such term.
- **Standard clauses, matched by words.** For the 12 regulations in the second table I read the passages of Altshuler's provident fund for investing in full context and a few others. In the rest, a script found seven fixed phrases and recorded the page, with `cite` confirming the words are on it. Read the page before relying on one of those rows.
- **Other kinds of fund.** `6c4d5c9e68e81223`, `6a8dc1fc65af780e`, `83b5d939341c7795` and `5cd25f41d0b64025` are not provident funds for investing. The phrases matched there, but I did not read how each clause applies to that kind of fund.
- **Tariffs.** The text of the PDF tariffs is a jumbled table. I recorded where each line sits and did not re-read prices; prices are in `data/fees/` from earlier jobs. Check the page before taking a figure from these cites.
- **Thin text.** Clal's study fund (`90d993be13451de5`) drops digits in its extracted text; its fee cap is cited by the words, the figure is unconfirmed. Meitav's portfolio management annex (`45d1515cd19ed9e7`) has poor text and was not read.
- **Migdal's links.** Its regulations page names files by an internal id; the two links filed are built from that id. Each file opened and its heading confirms what it is.

## Table

| Institution | Kind | Status | Filed |
|---|---|---|---|
| Altshuler Shaham | provident | Found | study `cb47eb96599da3b6`, 12/2024; for investing `bfc11b85c7c46f9f`, 3/2025; provident `6c4d5c9e68e81223`, 1.3.2025 |
| Harel | provident | Found; for-investing edition old | study 154 `77e6710134e2dd4b`, 07/2024; for investing 8207 `9712b9e0b83c701f`, 02/2021, no newer one found |
| Meitav | provident | Found | study 880 `78f673e2d702b2c3`, 7.24, its approval date left blank; for investing 7857 `198f860765e1341d`, 7.24; hubs `87d429a893e0f194`, `6fe0bd4993b33e38` |
| More | provident | Found; for investing not found | study `80d8e568a1753148`, 18.2.2026; savings provident `5cd25f41d0b64025`, 18.2.2026; hub `e330b0e5d024dc2d` |
| The Phoenix | provident | Found; study text is a draft; for investing not found | study 399 `d0d5c6e2702e96bd`, headed "טיוטת תקנון", 1.7.2024; provident 102 `6a8dc1fc65af780e`, 7.2024; hub `0493aecdce4d177e` |
| Migdal | provident | Found | study 579 `9dd9166f7474a9c2`, 11.2024; for investing 7930 `0a3aebbc03fc067d`, 05.2024; hub `3b0128d6719e380d` lists older editions too |
| Clal | provident | Found | study 456 `90d993be13451de5`, 2.2025; for investing 7987 `5c541c524f825912`, 2.2025 |
| Analyst | provident | Found | study 560 `c70a1a1b094749f4`, 1.7.2024; for investing `ff176e24a68be23a`, undated in the index; provident 811 `83b5d939341c7795`; hub `1f2c91d5d0b58333` |
| Yachad Rofim | provident | Found | study 419 `04f44175419382f5`, 21.2.2024; for investing `7900a3bce1e25cc5`, 25.7.2024 |
| Infinity | provident | Partly | for investing `a38f5bc1af151220`, 1.7.2024; study regulations not found on its forms and study pages |
| Menora Mivtachim | provident | **Blocked** | not checked; Radware check; on `chrome-list.md` |
| Yalin Lapidot | provident | **Blocked** | not checked; `yl-invest.co.il`, a host I guessed, answers with an Imperva check; on `chrome-list.md`. `ylp.co.il` is an unrelated contractor |
| Hebrew University fund | provident | Not found | join form `7ac1401241603d0a`, May 2026; reports page holds statements, no regulations |
| Slice | provident | Not found | no site identified; `slice.co.il` answers 404 |
| Globalnet | provident | Not found | no site identified; `globalnet.co.il` gave no answer |
| IBI | broker | Partly: no account agreement found | tariff `1b2d30fbf999c143`; terms `0d6938e57c002846`; disclosure `1a56a7f62317af7f`; moving article `4c491702ea6ac300` |
| Meitav Trade | broker | Partly: no account agreement found | tariff `3ec196cf860a522c`, 04/2026; site terms `22e0cc917fa5d0d2`, `c2ffb63b8b686ffb`; disclosures `85adc8bda24d2823`, `747bc0e5e8694a59`; transfer article `b0208670f321644d` |
| Altshuler Trade | broker | Partly: no account agreement found | tariff `500b2b74e04bd53e`; terms `a5c3366aa5a4f555`; disclosure `6ed57f3c590773d3`; promotion `e99ac8ffb6741bb3` |
| Psagot | broker | Partly: no account agreement found | tariff page `95671307abfe64f1`; terms `1f7dc79b4eb58e99`; disclosure `8f49d05f670d4168` |
| Excellence | broker | Partly: no account agreement found | tariff `6c9ec0ada66f77d8`; terms `a2126e27f586a0ac` |
| Fair | broker | Partly: no account agreement found | tariff page `f97c08b6915868c1`, updated 03/06/2026; terms `15db8d8146816f24` |
| Interactive Israel | foreign broker | Partly | user agreement `23e694465701bd30`; tariff `58a938374a90ac29`, 23.9.2026; risk `a442d2ad84b9c3cf`, 10/2023 |
| Interactive Brokers | foreign broker | Found | Client Agreement, form 3203, `b866cea6e6d76d50`, 10.1.2025; fee pages `b17986382a1c06f6`, `c5f542f1016bbc38` |
| Interactive Brokers Ireland | foreign broker | Found | Customer Agreement, form 4750, `8344401953b5e137`, 24.4.2024; page `18c68f8629378125` |
| IBI funds, Harel funds, More funds, Yalin funds, Migdal funds, Meitav funds, Kesem (7) | fund managers | **Not checked**: documents sit on Maya | none. Maya refuses automated browsing and is already on `chrome-list.md` from job 3 for the founder's hand. IBI's, More's and Meitav's fund pages list no fund document. Yalin's site is blocked. I could not identify Kesem's or Migdal funds' own site: `kesem.co.il` is a hotel, `tachlit.co.il` a marketing firm |
| iShares, BlackRock | fund managers | Partly | job 3's factsheets, such as `2460e00d3df1b43d`, `42f663b2cc0e8cc1`; no prospectus read in this job |
| J.P. Morgan Asset Management | fund manager | Partly | guide `718986082f02db33` only; no fund fee document |

Totals, 34 institutions: 11 found, 11 partly, 2 blocked, 3 not found, 7 fund managers not checked.

**Not reached**, a limit of this run and no statement about what exists: Meitav Trade's customer service pages, Altshuler's `/trade/faq_transfer/`, IBI's `/trade/money-in-commissions/`, a current Harel for-investing edition, The Phoenix's and More's for-investing regulations by another route, and any fund-level prospectus.

## What each says, by topic

"—" means no clause found by the search.

### Provident funds for investing and provident funds

These share one wording, the regulator's standard form. Page per clause:

| Document | Fee cap | "לפחות שנתיים" | "בתום חודשיים" | Withdrawal | "ארבעה ימי עסקים" | Tax | Transfer out |
|---|---|---|---|---|---|---|---|
| Altshuler `bfc11b85c7c46f9f` | 10 | 10 | 11 | 5 | 5 | 5 | 6 |
| Altshuler provident `6c4d5c9e68e81223` | 12 | 12 | 12 | 6 | 7 | 7 | 7 |
| Harel `9712b9e0b83c701f` | 10 | 10 | 11 | 5 | 6 | 6 | 6 |
| Meitav `198f860765e1341d` | 9 | 9 | 9 | 5 | 5 | 5 | 6 |
| More savings `5cd25f41d0b64025` | 13 | 13 | 14 | 7 | 8 | 8 | 8 |
| Migdal `0a3aebbc03fc067d` | 10 | 10 | 11 | 5 | 6 | 6 | 6 |
| Clal `5c541c524f825912` | 10 | 10 | 10 | 5 | 5 | 6 | 6 |
| Infinity `a38f5bc1af151220` | 10 | 10 | 10 | 5 | 5 | 6 | 6 |
| Analyst `ff176e24a68be23a` | 10 | 10 | 10 | 5 | 5 | 6 | 6 |
| Analyst provident `83b5d939341c7795` | 13 | 13 | 13 | 7 | 8 | 8 | 8 |
| Phoenix provident `6a8dc1fc65af780e` | 14 | 14 | 15 | 7 | 8 | 9 | 9 |
| Yachad `7900a3bce1e25cc5` | 10, actual costs | — | — | 5 | 6 | 6 | 6 |

Yachad's clause differs: "לפי הוצאות שהוציאה בפועל" (p.10).

Words used: "שיעור או סכום דמי הניהול השנתי המרבי"; "תקופה של לפחות שנתיים"; "תחילתה של העלאה כאמור תהיה בתום חודשיים"; "תשלם את הכספים שהצטברו בחשבונו"; "בתוך ארבעה ימי עסקים"; "תנכה מכספים המשולמים לעמית"; "רשאי להעביר כספים מחשבונו בקופה לקופת גמל אחרת".

### Study funds

| Company | דמי ניהול | תנאי משיכה | העברה לגוף אחר | ניכוי מס | שינוי והודעה |
|---|---|---|---|---|---|
| Altshuler `cb47eb96599da3b6` | p.11 "שלא יעלה על שיעור או סכום דמי הניהול השנתי המרבי" | p.7 "החל מתום שש שנים" | — | — | — |
| Harel `77e6710134e2dd4b` | p.10 "לא יעלה על" 2/12%, "שני אחוז אפקטיבי לשנה" | p.2 "בתום 6שנות חברות" | p.2 "העברה מקרן אחת לקרן אחרת" | — | — |
| Meitav `78f673e2d702b2c3` | p.15 | p.11 "עמית זכאי למשוך כספים" | — | p.14 "הקרן תנכה מס במקור" | p.15 "תקופה של שנתיים או יותר"; "הודעה אודות שינוי בדמי הניהול" |
| More `80d8e568a1753148` | p.8 "דמי הניהול יהיו אחידים לכל העמיתים" | p.5 "אם חלפו 6שנים" | p.7 | p.7 | p.8 "במועד החוקי המוקדם ביותר" |
| The Phoenix (draft) `d0d5c6e2702e96bd` | p.9 "שיעור דמי הניהול המרביים" | p.6 | — | p.9 | — |
| Migdal `9dd9166f7474a9c2` | p.13 "שלא יעלה על שני אחוזים" | p.9 | — | p.9 | — |
| Clal `90d993be13451de5` | p.9 "שני אחוזים חלקי שתים עשרה"; digits missing from the text | p.3 "בטרם חלפו שש שנות חברות" | p.3 | p.4 | — |
| Analyst `c70a1a1b094749f4` | p.9 "דמי הניהול המירביים" | p.7 | — | p.8 | — |
| Yachad `04f44175419382f5` | p.10 "דמי הניהול יהיו בגובה הוצאותיה בפועל", not for profit | — | p.5 "סייג להעברת הכספים" | — | — |

### Brokers

| Company | דמי משמרת | קנייה ומכירה | המרת מטבע | סגירת חשבון | העברת ניירות ערך | שינוי והודעה | דיבידנד |
|---|---|---|---|---|---|---|---|
| IBI `1b2d30fbf999c143` | p.4; another block at p.8 | p.3 | p.6 | — | p.5 | — | — |
| Excellence `6c9ec0ada66f77d8` | p.4 | p.3 | p.5 | — | p.4 | — | p.4, reinvestment line, not cited |
| Meitav Trade `3ec196cf860a522c` | p.3, "דמי ניהול פיקדון" | p.2, not cited | p.4, securities conversion, not cited | — | p.3 | — | p.4 |
| Altshuler Trade `500b2b74e04bd53e` | — | p.1 | p.3 | — | p.2 | — | p.2 |
| Psagot `95671307abfe64f1` | p.1 | — | — | — | p.1 | — | — |
| Fair `f97c08b6915868c1` | — | — | — | p.1 "סגירת חשבון – פטור" | p.1 "מפייר לבנק המקור" | p.1, last update date | — |
| Interactive Israel `58a938374a90ac29`, `23e694465701bd30` | — | — | tariff p.6 | — | — | tariff p.7 "התעריפון יעודכן באתר החברה"; agreement p.1 | `90dcd9fae4840561` p.1, tax calculation service |
| Interactive Brokers `b866cea6e6d76d50` | — | — | p.15 "automatic currency conversion" | p.4 "IBKR may terminate Client's use" | — | p.2 "This Agreement may be revised"; p.18 fees "specified on the IBKR website" | — |
| IB Ireland `8344401953b5e137` | — | — | — | — | p.10 "fractional Shares are not transferable to another broker" | p.34 "IBIE may modify this Agreement at any time"; p.22 "Pricing section" | p.15 |

Change of terms, site terms only: Fair `15db8d8146816f24` p.1 "החברה אינה מתחייבת למסור למשתמש הודעה מראש"; Meitav Trade `22e0cc917fa5d0d2` p.1 "בלי למסור על כך הודעה מראש". These govern the website; I did not establish that they govern tariffs.

Interactive Israel's agreement p.1 says it "אינה ה-carrying broker" of the Interactive Brokers account, and points to the direct agreement with the Interactive Brokers entity.

## Findings for the rule base (not edited)

1. **KGL-30 names two companies; more print the same two-year text.** It names Altshuler and Infinity. The same "תקופה של לפחות שנתיים" is on the page in Harel 8207 (p.10), Meitav 7857 (p.9), Migdal 7930 (p.10), Clal 7987 (p.10) and Analyst (`ff176e24a68be23a` p.10), all provident funds for investing. KGL-16 already says the circular's five years govern, so the rule does not change; only the list of companies does.
2. **Meitav's study fund has a two-year term in its own words.** `78f673e2d702b2c3` p.15, "תקופה של שנתיים או יותר", July 2024. The circular's five years are recorded in KGL-16 and PF-13; I did not re-check that the circular covers study funds in the same way, so this needs the owner's reading.
3. **Company wordings missing from the study-fund record on fee wording** (`keren-hishtalmut.md`, the one naming Altshuler, Harel and Meitav): More's "דמי הניהול יהיו אחידים לכל העמיתים" (`80d8e568a1753148` p.8), and Yachad's at-cost, not-for-profit clause (`04f44175419382f5` p.10). Each is that company's term only.
4. **Interactive Brokers' agreements now have exact places.** Form 3203 and form 4750 are filed. I did not establish which entity serves an Israeli resident, so neither should be used for the Israeli reader until that is settled.

## Other things to know

- **No Israeli broker's account agreement turned up** by these searches at any of the six. Site terms, disclosures and tariffs are public; the agreement itself was not found. That is the result of these searches, not a claim that none is published.
- **Meitav Trade's tariff conflict stands.** Line 8 on p.3 prints 0.15%, minimum 270 NIS a quarter, against its own pages' exemption (job 2's finding).
- **Filing gaps.** More's `0c446b4613326122`, one image page, was not filed. Migdal's page `c798ab5e220e41e8`, Phoenix's `263215db4ed9326d`, Clal's two pages and Meitav's disclosures were read only by word search or not filed.
- **Empty searches** are in `research/library/tried.jsonl`.

## Needs the founder

- Maya: the seven Israeli fund managers' fee documents rest on it, already listed from job 3.
- Nothing else. Menora and Yalin Lapidot are on `chrome-list.md` for the lead's pass in Chrome.

Issue 123 stays open: Hapoalim, One Zero, Menora and Yalin Lapidot are unread.
