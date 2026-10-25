# Link check, 2026-10-25

The founder found that the source link of track 12538 ("מור גמל להשקעה - כללי") was broken: `https://data.gov.il/dataset/gemelnet` now redirects to a "page not found" on the new data.gov.il portal. This check looks at every link the site shows or stores, to find the same kind of failure elsewhere. It was made with `research/audit/tools/link-check.py` (method and rerun command in section 9), against the pre-rendered build of the site at commit 54fd558 (`wt-g2/site/build/client`, 1,224 pages).

## 1. Result in short

- 802 unique addresses: 722 ok, 8 moved, 3 broken, 43 blocked, 1 error, 25 skipped (placeholders and test fixtures that are not real addresses).
- **Broken: 3, all the same cause** (an old-format data.gov.il dataset address: `gemelnet`, `pensia-net`, `savingsplaninterest`). All three are fixed. Nothing else answered 404, 410 or failed to resolve.
- Moved: 8. Three were fixed (ECB terms page, two Bank Leumi pages); five were left because the old address keeps working and is the stable one (3 forum threads, 2 iShares fact sheets).
- Blocked: 43 addresses on 6 sites (TASE Maya, BOI, Bank Massad, Calcalist, One Zero, S&P Global). A person has to open them; section 4.
- Error: 1 (Tazkirim, a certificate-chain problem on the site's side).
- 48 of the 'ok' are weak: the site is a single-page app that answers 200 for any path, so only the address is known to answer (section 6).
- Internal links: 79,891 links on 1,224 pages, 2,027 distinct targets. **1 target does not resolve** (a provider page that is not pre-rendered) and **1 anchor has no element** (`/rules#switching-and-transfers`); section 7.

### Counts by class

| | ok | moved | broken | blocked | error | skipped | total |
|---|---:|---:|---:|---:|---:|---:|---:|
| Before the fixes | 722 | 8 | 3 | 43 | 1 | 25 | 802 |
| After the fixes | 725 | 7 | 0 | 43 | 1 | 25 | 801 |

After the fixes the two Bank Leumi addresses still show as `moved` only because the pre-rendered build used here was made before the fix; they are used nowhere in `data/` any more and disappear at the next build.

Where the addresses come from: data+site build: 460; data: 303; site/app: 25; site build: 9; data+site build+site/app: 2; data+site/app: 2. `data/**/*.json` holds the bulk; `site/app` has only 29 addresses, 25 of them placeholders (`https://a/1`, `example.org`) and test fixtures; the 9 that are only in the build are links the code assembles at run time (company deposit-rate pages).

### By site

| Site | addresses | ok | moved | blocked | error |
|---|---:|---:|---:|---:|---:|
| free-justice.openapi.gov.il | 146 | 146 | 0 | 0 | 0 |
| mayafiles.tase.co.il | 58 | 58 | 0 | 0 | 0 |
| fs.knesset.gov.il | 54 | 54 | 0 | 0 | 0 |
| www.gov.il | 50 | 50 | 0 | 0 | 0 |
| maya.tase.co.il | 42 | 15 | 0 | 27 | 0 |
| data.gov.il | 35 | 35 | 0 | 0 | 0 |
| www.meitav.co.il | 33 | 33 | 0 | 0 | 0 |
| he.wikisource.org | 25 | 25 | 0 | 0 | 0 |
| www.btl.gov.il | 25 | 25 | 0 | 0 | 0 |
| www.boi.org.il | 16 | 12 | 0 | 4 | 0 |
| boi.org.il | 14 | 14 | 0 | 0 | 0 |
| www.leumi.co.il | 13 | 11 | 2 | 0 | 0 |
| www.as-invest.co.il | 11 | 11 | 0 | 0 | 0 |
| market.tase.co.il | 10 | 10 | 0 | 0 | 0 |
| www.inter-il.com | 10 | 10 | 0 | 0 | 0 |
| www.new.isa.gov.il | 10 | 10 | 0 | 0 | 0 |
| content.tase.co.il | 9 | 9 | 0 | 0 | 0 |
| knesset.gov.il | 9 | 9 | 0 | 0 | 0 |
| www.bankjerusalem.co.il | 9 | 9 | 0 | 0 | 0 |
| www.irs.gov | 9 | 9 | 0 | 0 | 0 |
| www.bankhapoalim.co.il | 8 | 8 | 0 | 0 | 0 |
| www.interactivebrokers.com | 8 | 8 | 0 | 0 | 0 |
| www.moreinvest.co.il | 8 | 8 | 0 | 0 | 0 |
| www.nevo.co.il | 8 | 8 | 0 | 0 | 0 |
| www.bankmassad.co.il | 7 | 3 | 0 | 4 | 0 |
| www.ishares.com | 5 | 3 | 2 | 0 | 0 |
| www.hasolidit.com | 4 | 1 | 3 | 0 | 0 |
| www.calcalist.co.il | 3 | 0 | 0 | 3 | 0 |
| www.onezerobank.com | 3 | 0 | 0 | 3 | 0 |
| www.spglobal.com | 2 | 0 | 0 | 2 | 0 |
| www.tazkirim.gov.il | 1 | 0 | 0 | 0 | 1 |
| 66 other sites | 131 | 131 | 0 | 0 | 0 |

## 2. Broken (3 before, 0 after)

| Address | Where used | Found | What I did |
|---|---|---|---|
| `https://data.gov.il/dataset/gemelnet` | `cma/gemelnet@2026-09.json` x1529 | old address format (redirects to https://data.gov.il/he/dataset/gemelnet, HTTP 404); package_show ok: name=gemelnet, organization=cma | Replaced by `https://data.gov.il/he/datasets/cma/gemelnet` in the 1,529 source objects of `data/cma/gemelnet@2026-09.json`, in the adapter (`datasetPageUrl` in `packages/pipeline/src/adapters/cma.ts`, so the next refresh writes the new form), its test and the `docs/data-schema.md` example. The new address: `package_show?id=gemelnet` answers name gemelnet, organization cma; the page answers 200. |
| `https://data.gov.il/dataset/pensia-net` | `cma/pensia-net@2026-09.json` x587 | old address format (redirects to https://data.gov.il/he/dataset/pensia-net, HTTP 404); package_show ok: name=pensia-net, organization=cma | Replaced by `https://data.gov.il/he/datasets/cma/pensia-net` in the 587 source objects of `data/cma/pensia-net@2026-09.json` (same adapter fix). `package_show?id=pensia-net` answers name pensia-net, organization cma; the page answers 200. |
| `https://data.gov.il/dataset/savingsplaninterest` | `series/mof-child-savings-rates.json` | old address format (redirects to https://data.gov.il/he/dataset/savingsplaninterest, HTTP 404); package_show ok: name=savingsplaninterest, organization=mof | Replaced by `https://data.gov.il/he/datasets/mof/savingsplaninterest` in the attribution text of `data/series/mof-child-savings-rates.json` and in `packages/pipeline/src/adapters/mof-child-savings.ts` (the text the licence asks to name). `package_show` answers organization mof; `data/rules/cs-22.json` already used the new form. |

The old address redirects to `/he/dataset/<name>` (the portal's former path with the language prefix added), which answers 404. The new form is `/he/datasets/<organization>/<name>`; the organization comes from the API (`package_show`), not from a guess. Every other data.gov.il address was checked through the API and all are ok: 3 resource downloads (`resource_show` ok and the file answers), 4 `package_show` calls, 23 `datastore_search` / `datastore_search_sql` calls (all answer success), 4 dataset pages in the new form (name and organization match the API) and the terms page.

## 3. Moved (8 before, 7 after; 2 of those 7 are the stale build)

| Address | Where used | Lands on | What I did |
|---|---|---|---|
| `https://www.ecb.europa.eu/services/disclaimer/html/index.en.html` | `series/ecb-fx.json` | `https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html` | Updated to the address it redirects to; opened it: title "Disclaimer & copyright", the ECB's terms of use. Changed in `data/series/ecb-fx.json` (`terms_url`) and in `packages/pipeline/scripts/fetch-ecb-rates.ts` (the constant that writes it). |
| `https://www.hasolidit.com/kehila/threads/.36752/` | SW-X02, site pages /documents/ | `https://www.hasolidit.com/kehila/threads/הרעת-דמי-ניהול-במעבר-מעסיקים-ד-נ-ללא-קשר-למעסיק-כשלהו-לגיטימי.36752/` | Not changed: the forum software redirects a thread id to the thread's full title address; the short address keeps working. A secondary source (forum thread). |
| `https://www.hasolidit.com/kehila/threads/.36841/` | SW-X01, site pages /documents/ | `https://www.hasolidit.com/kehila/threads/התייעצות-בדבר-שני-סיפורים-מקוממים-על-מעבר-קופות.36841/` | Not changed: same as above. |
| `https://www.hasolidit.com/kehila/threads/.37102/` | SW-X04, site pages /documents/ | `https://www.hasolidit.com/kehila/threads/קרן-פנסיה-עם-דמי-ניהול-אטרקטיביים-אבל-ללא-סוכן-—-האם-יש-כאן-חיסרון.37102/` | Not changed: same as above. |
| `https://www.ishares.com/uk/individual/en/literature/fact-sheet/cspx-ishares-core-s-p-500-ucits-etf-fund-fact-sheet-en-gb.pdf` | `funds/ie00b5bmr087@2026-10-24.json` x5, ETF-11, ETF-27, ETF-28, and 6 more | `https://www.ishares.com/gls-download/literature/fact-sheet/cspx-ishares-core-s-p-500-ucits-etf-fund-fact-sheet-en-gb.pdf` | Not changed: iShares serves its public literature address by redirecting to its download path (`/gls-download/...`) and returns the PDF; the public address is the stable one to keep. |
| `https://www.ishares.com/uk/individual/en/literature/fact-sheet/sgln-ishares-physical-gold-etc-fund-fact-sheet-en-gb.pdf` | `terms/etc.json`, site pages /not-covered/ | `https://www.ishares.com/gls-download/literature/fact-sheet/sgln-ishares-physical-gold-etc-fund-fact-sheet-en-gb.pdf` | Not changed: same as above. |
| `https://www.leumi.co.il/Lobby/pension_information/36830` | SW-18, site pages /documents/ | `https://www.leumi.co.il/he/pension-advising/pension-information/pension-advising/pension-information` | Updated to `https://www.leumi.co.il/he/pension-advising/pension-information/pension-advising/pension-information` (the page's own canonical address). Opened both: the title is "עושים סדר בפנסיה - בנק לאומי" (the cited title) and the page holds the cited sentence "המידע יהיה זמין לצפייה במשך שלושה חודשים בלבד". Markdown changed in `.claude/skills/il-finance/references/switching-and-transfers.md` (2 places), `sources` of SW-18 regenerated with `npm run extract:sources`, the `figures` source of SW-18 edited in place. |
| `https://www.leumi.co.il/Saving-Kids` | `instruments/wrappers/child-savings-bank.json`, CS-14, site pages /documents/ | `https://www.leumi.co.il/he/Withdrawing-savings-for-your-kids` | Updated to `https://www.leumi.co.il/he/Withdrawing-savings-for-your-kids` (canonical). Opened both: "משיכת כספי חיסכון לכל ילד - בנק לאומי", the cited page (withdrawal from 18, parent's signature before 21). Markdown changed in `references/child-savings.md` (2 places), `sources` of CS-14 regenerated, the `figures` source of CS-14 and `data/instruments/wrappers/child-savings-bank.json` edited in place. |

## 4. Blocked (43)

Not worked around. A 403 or a challenge page says nothing about whether the page exists: a made-up TASE address (`/he/funds/etfs/9999999`) gets the same 403 as the real ones.

| Address | Where used | Answer | What I did |
|---|---|---|---|
| `https://maya.tase.co.il/he/funds/etfs/1143700` | `funds/1143700@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1143734` | `funds/1143734@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1143783` | `funds/1143783@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1144237` | `funds/1144237@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1144336` | `funds/1144336@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1144385` | `funds/1144385@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1145804` | `funds/1145804@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1146331` | `funds/1146331@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1146356` | `funds/1146356@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1146471` | `funds/1146471@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1146505` | `funds/1146505@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1146570` | `funds/1146570@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1147362` | `funds/1147362@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1148808` | `funds/1148808@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1148899` | `funds/1148899@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1148907` | `funds/1148907@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1148931` | `funds/1148931@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1149020` | `funds/1149020@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1149772` | `funds/1149772@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1150184` | `funds/1150184@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1150259` | `funds/1150259@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1150283` | `funds/1150283@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1150333` | `funds/1150333@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1165810` | `funds/1165810@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1165844` | `funds/1165844@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1201003` | `funds/1201003@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://maya.tase.co.il/he/funds/etfs/1209444` | `funds/1209444@2026-10-25.json` | HTTP 403 | Not changed. Open in a browser. |
| `https://www.bankmassad.co.il/private/depositsandsavings/interestratesondeposits/` | site pages /companies/massad/ | bot challenge (200, Radware Bot Manager Captcha) | Not changed. Open in a browser. |
| `https://www.bankmassad.co.il/private/depositsandsavings/openingthedepositaccount/` | BANK-21, site pages /documents/ | bot challenge (200, Radware Bot Manager Captcha) | Not changed. Open in a browser. |
| `https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/` | BANK-27, BANK-28, site pages /documents/ | bot challenge (200, Radware Bot Manager Captcha) | Not changed. Open in a browser. |
| `https://www.bankmassad.co.il/private/general/commissionsrate/individuals/` | `fees/massad@2026-10-23.json` | bot challenge (200, Radware Bot Manager Captcha) | Not changed. Open in a browser. |
| `https://www.boi.org.il/information/bank-paymnts/savingsandinvestmentproducts/makam/` | GOV-22, `terms/mkm.json`, site pages /documents/ | bot challenge (200, Radware Page) | Not changed. Open in a browser. |
| `https://www.boi.org.il/roles/statistics/makamandbonds/actions-and-balances/` | GOV-23, site pages /documents/ | bot challenge (200, Radware Page) | Not changed. Open in a browser. |
| `https://www.boi.org.il/roles/supervisionregulation/nbt/nbt425/` | BANK-32, site pages /documents/ | bot challenge (200, Radware Page) | Not changed. Open in a browser. |
| `https://www.boi.org.il/roles/supervisionregulation/nbt/nbt448/` | SW-43, site pages /documents/ | bot challenge (200, Radware Page) | Not changed. Open in a browser. |
| `https://www.calcalist.co.il/article/hj55ri2pgx` | SW-33, SW-34, site pages /documents/ | bot challenge (403, Access Denied) | Not changed. Open in a browser. |
| `https://www.calcalist.co.il/local_news/article/skys1wkozg` | TXH-22, site pages /documents/ | bot challenge (403, Access Denied) | Not changed. Open in a browser. |
| `https://www.calcalist.co.il/market/article/bjnkrerfa` | IRA-25, IRA-28, site pages /documents/ | bot challenge (403, Access Denied) | Not changed. Open in a browser. |
| `https://www.onezerobank.com/` | site pages /companies/one-zero/ | bot challenge (403, Just a moment...) | Not changed. Open in a browser. |
| `https://www.onezerobank.com/company/information/2250` | `fees/one-zero@2026-10-23.json` x2, `fees/one-zero@2026-10-24.json`, BRK-38, site pages /documents/ | bot challenge (403, Just a moment...) | Not changed. Open in a browser. |
| `https://www.onezerobank.com/warehouse/userUploadFiles/Image/01-%20%D7%AA%D7%A2%D7%A8%D7%99%D7%A4%D7%95%D7%9F%20%D7%94%D7%A2%D7%9E%D7%9C%D7%95%D7%AA%20%D7%94%D7%9E%D7%9C%D7%90%20-%20%D7%9E%D7%94%D7%93%D7%95%D7%A8%D7%94%20%D7%9E%D7%99%D7%95%D7%9D%2026.7.26_announcement.pdf` | `fees/one-zero@2026-10-24.json` x24, BRK-38, site pages /companies/one-zero/, /documents/ | bot challenge (403, Just a moment...) | Not changed. Open in a browser. |
| `https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf` | ETF-37, ETF-38, ETF-39, ETF-40, and 1 more | bot challenge (403, Access Denied) | Not changed. Open in a browser. |
| `https://www.spglobal.com/spdji/en/indices/equity/sp-500/` | ETF-37, ETF-39, site pages /documents/ | bot challenge (403, Access Denied) | Not changed. Open in a browser. |

## 5. Error (1)

| Address | Where used | Answer | What I did |
|---|---|---|---|
| `https://www.tazkirim.gov.il/s/legislativeworkactivity/a133Y00000LPZM1QAP` | TXH-13, `data/sources/documents.json`, site pages /documents/ | curl: (60) SSL certificate OpenSSL verify result: unable to get local issuer certificate (20) (the server does not send its intermediate certificate). Read without certificate checking, as a diagnosis only: HTTP 200, title "Tazkirim". | Not changed. Browsers usually complete the chain themselves, so it probably opens; a person should confirm. |

## 6. Ok, but only the address was checked (48)

These sites are single-page apps (or the page has no title): the server answers 200 with the same page for every path, so a wrong address would also show 200. Each is `ok` in `research/audit/2026-10-25-link-check.json` with a `weak` field. They need a person with a browser if the exact page matters; the list is by site.

- **maya.tase.co.il** (15): `https://maya.tase.co.il/he/funds/mutual-funds`; `https://maya.tase.co.il/he/funds/mutual-funds/5112628`; `https://maya.tase.co.il/he/funds/mutual-funds/5122569`; `https://maya.tase.co.il/he/funds/mutual-funds/5124482`; `https://maya.tase.co.il/he/funds/mutual-funds/5124573`; `https://maya.tase.co.il/he/funds/mutual-funds/5127527`; `https://maya.tase.co.il/he/funds/mutual-funds/5128905`; `https://maya.tase.co.il/he/funds/mutual-funds/5129275`; `https://maya.tase.co.il/he/funds/mutual-funds/5129283`; `https://maya.tase.co.il/he/funds/mutual-funds/5130638`; `https://maya.tase.co.il/he/funds/mutual-funds/5130661`; `https://maya.tase.co.il/he/funds/mutual-funds/5139100`; `https://maya.tase.co.il/he/funds/mutual-funds/5139282`; `https://maya.tase.co.il/he/funds/mutual-funds/5139696`; `https://maya.tase.co.il/he/funds/mutual-funds/5140165`
- **market.tase.co.il** (10): `https://market.tase.co.il/he/about_tase/tase_members/tase_members_list`; `https://market.tase.co.il/he/market_data/etfs`; `https://market.tase.co.il/he/market_data/f-etfs`; `https://market.tase.co.il/he/market_data/f-etfs?dType=1&oId=18`; `https://market.tase.co.il/he/market_data/index/137/about`; `https://market.tase.co.il/he/market_data/index/142/about`; `https://market.tase.co.il/he/market_data/index/143/about`; `https://market.tase.co.il/he/market_data/security/1201656/major_data`; `https://market.tase.co.il/he/market_data/security/1218916/major_data`; `https://market.tase.co.il/he/market_data/trading_fees`
- **www.tase.co.il** (7): `https://www.tase.co.il/he/content/about/terms_of_service`; `https://www.tase.co.il/he/content/knowledge_center/calculating_shares_weight/`; `https://www.tase.co.il/he/content/knowledge_center/index_universe/`; `https://www.tase.co.il/he/content/knowledge_center/indices_overview/`; `https://www.tase.co.il/he/content/products_lobby/data_services`; `https://www.tase.co.il/he/content/products_lobby/data_services_hub/`; `https://www.tase.co.il/he/content/products_lobby/datastore_pricelist/`
- **chart.bursagraph.co.il** (4): `https://chart.bursagraph.co.il/funds.shtml?m=4`; `https://chart.bursagraph.co.il/funds.shtml?m=5`; `https://chart.bursagraph.co.il/funds.shtml?m=6&inav=0705`; `https://chart.bursagraph.co.il/funds.shtml?m=8`
- **fundscenter.co.il** (2): `https://fundscenter.co.il/funds.shtml?m=3`; `https://fundscenter.co.il/funds.shtml?m=9`
- **pensyanet.cma.gov.il** (2): `https://pensyanet.cma.gov.il/Home/Concepts`; `https://pensyanet.cma.gov.il/Parameters`
- **www.fnx.co.il** (2): `https://www.fnx.co.il/gemel/gemelhashkaa/faq/`; `https://www.fnx.co.il/savings/savings-routes/faq/`
- **www.interactivebrokers.com** (2): `https://www.interactivebrokers.com/lib/cstools/faq/`; `https://www.interactivebrokers.com/lib/cstools/faq/#/content/1136192471`
- **www.new.isa.gov.il** (2): `https://www.new.isa.gov.il/nav-index/supervised-general/takanon2`; `https://www.new.isa.gov.il/nav-index/supervised-mutualfunds/mutualfundsActivities`
- **mayafiles.tase.co.il** (1): `https://mayafiles.tase.co.il/rhtm/1767001-1768000/H1767979.htm`
- **supremedecisions.court.gov.il** (1): `https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/14/860/074/l09&fileName=14074860_l09.txt&type=2`

## 7. The site's own links

Read from the pre-rendered build: 79,891 `href` and `src` values on 1,224 pages, 2,027 distinct targets under the base path `/finance-tool/`. A target resolves when a file, `<path>.html` or `<path>/index.html` exists. A `#fragment` must be an `id` on the target page; the rules page draws its cards in the browser and scrolls to `#<RULE-ID>` after drawing, so the 1,353 links of that kind were checked against the rule records instead (every one names an existing rule).

| Link | On | Cause | What I did |
|---|---|---|---|
| `/finance-tool/workbench/providers/child-savings-provident` | `workbench/tracks/child-savings-provident/index.html` | The "לפי ספק" tab (`site/app/components/workbench/workbench.tsx:136`) points every wrapper at `/workbench/providers/<wrapper>`, but `providerWrapperIds()` (`site/app/lib/providers.server.ts:79`) pre-renders only the brokerage account and the five wrappers in `PROVIDENT_WRAPPERS`; `child-savings-provident` has a track page and no provider page. | Not changed (a product choice: add the page, or hide the tab for this wrapper). |
| `/finance-tool/rules#switching-and-transfers` | the switch page of each of the 12 wrappers (`site/app/routes/switch.tsx:215`), 12 links | The rules page's groups are named `<shelf>-<file>` (`site/app/lib/rules-filter.ts`, e.g. `costs-switching-and-transfers`); no element is called `switching-and-transfers`, so the link opens the top of the rules page. The file sits on four shelves (state, costs, access, protection). | Not changed (which of the four groups the link should open is a choice). |

Everything else resolves, including all assets, fonts, the favicon and the 1,353 rule anchors.

## 8. What needs a person

1. **Blocked sites to open in a browser** (section 4): TASE Maya (27 ETF pages, the source link of 27 fund records in `data/funds/`), Bank of Israel (4 pages, a Radware page that answers 200 with a check page), Bank Massad (4 pages, same), Calcalist (3 articles), One Zero (3 pages), S&P Global (2 pages: the methodology PDF and the S&P 500 page). The BOI, Massad and S&P pages are cited by rules (GOV-22, GOV-23, BANK-21, BANK-27, BANK-28, BANK-32, SW-43, ETF-37 to ETF-39).
2. **Tazkirim** (section 5): open once to confirm it works in a browser.
3. **Single-page-app sites** (section 6): `maya.tase.co.il` (15), `market.tase.co.il` (10), `www.tase.co.il` (7) and a few others answer 200 for any path. Only a browser shows whether the page is the one the rule cites.
4. **Two internal-link defects** (section 7): the missing provider page for child savings in a provident fund, and the `#switching-and-transfers` anchor.
5. **No document was found that moved with no clear replacement.** The research notes under `research/knowledge/` and `research/discovery/` still show the old data.gov.il form in prose and tables (about 20 places); they are dated notes, not read by the site or the validator, and were left as they are.

## 9. Method and rerun

`research/audit/tools/link-check.py` (Python 3 and curl, no other dependencies):

- Collects every `http(s)` address from the string values of `data/**/*.json`, from `site/app/**` (addresses that appear only in `*.test.*` files are fixtures and are not fetched) and, with `--build DIR`, from every external `href` of the pre-rendered site, which also catches links the code assembles at run time.
- GET with a browser User-Agent, redirects followed (10), 45 s timeout, one retry on a timeout or 5xx, a 3 MB body cap, 2 parallel requests per site with a pause between starts. The body is read only for the title (a title that says not found is `broken`) and for a bot-check page (`blocked`, never worked around).
- `data.gov.il`: through the CKAN API (`package_show`, `resource_show`, `datastore_search`); an old-format dataset address is reported `broken` with the new address to use.
- `www.gov.il` HTML pages: through `research/audit/tools/govil-page.sh` (FlareSolverr, gov.il only), one at a time. 8 pages; all ok. The 42 other gov.il addresses are PDFs under `/BlobFolder/` and went through curl.
- Internal links: parses every `href` and `src` in the build's HTML and resolves it against the files.

```
python3 -I research/audit/tools/link-check.py --out research/audit/2026-10-25-link-check.json \
    --build <site/build/client> [--cache cache.jsonl] [--skip-govil] [--only-internal]
```

The full result, one record per address (class, status, final address, where used, `weak`), is `research/audit/2026-10-25-link-check.json`. It was produced after the fixes below; the "before" tables above come from the first full run, in which the three old data.gov.il addresses were broken.

## 10. What changed in the repository

- data.gov.il: `data/cma/gemelnet@2026-09.json`, `data/cma/pensia-net@2026-09.json` (only the `source.url` strings), `data/series/mof-child-savings-rates.json` (attribution text), `packages/pipeline/src/adapters/cma.ts` (new `datasetPageUrl`), `packages/pipeline/src/adapters/mof-child-savings.ts`, `packages/pipeline/test/cma-adapter.test.ts`, `packages/engine/test/golden/r3.test.ts` (fixture), `docs/data-schema.md` (example).
- ECB terms page: `data/series/ecb-fx.json`, `packages/pipeline/scripts/fetch-ecb-rates.ts`.
- Bank Leumi: `.claude/skills/il-finance/references/switching-and-transfers.md`, `.claude/skills/il-finance/references/child-savings.md`; then `npm run extract:sources -w @finance-tool/pipeline` regenerated the `sources` of `data/rules/sw-18.json` and `data/rules/cs-14.json`; the two `figures` source URLs in those records and `data/instruments/wrappers/child-savings-bank.json` were edited in place (they are not generated from the markdown).
- No figure, date or `checked` value was changed.

Checks after the fixes: `npx vitest run site packages/engine packages/pipeline` (881 passed), `npm run typecheck`, `npm run validate` (data is valid).
