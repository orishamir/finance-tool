# Binding prices: one house at a time (2026-11-04)

The brief every researcher of this job gets. The house is named in the prompt.

## The rule you work under (D56 in `docs/product.md`, founder, 2026-11-04)

The site prices a house at **the most its binding documents let it charge an ordinary customer**. Advertising is a claim to check, never a price.

- **Binding documents:** the price list (תעריפון), the account agreement and its fee annex (נספח עמלות), and a promotion's terms (תקנון מבצע). A landing page, an about page, a banner, an app-store text, a FAQ or a news item is advertising.
- **Silence is not zero.** If the price list waives the conversion fee but prints no limit on the conversion spread (מרווח המרה), the spread is "not limited by the documents", never zero. The same for any cost the documents leave to the company.
- **A cost under another name counts.** A house that advertises "no custody" (ללא דמי משמרת) may still print a handling fee (דמי טיפול), an account-management fee (דמי ניהול חשבון / דמי ניהול תקופתיים), a minimum per month or quarter, an inactivity fee, a fee for a standing order, for dividends, for transferring out, for real-time data that the trading screen needs. Read every line of the price list, not only the one the advertisement names.
- **"Up to" is priced at the ceiling** (עד 80 ₪ means 80 ₪).
- **An exemption that is conditional** (new customers only, a minimum deposit, "active trading", "לפי שיקול דעתה הבלעדי", "רשאית לשנות או להפסיק ללא הודעה", a group such as soldiers or students, an end date) **is an offer**: it is recorded with its conditions, never in the ranked price.
- **What customers paid on average** (the exchange's fee calculator) is a sourced fact, not a price.
- **Dates both ways.** The price list you find may be older than the advertisement (an ad can promise what no current binding document says, or a newer price list may exist that the site does not link); a promotion's terms may have ended or been replaced; the exchange's calculator has its own "updated" date. For every document record: the date printed on it, the PDF's own dates (`pdfinfo`: CreationDate, ModDate), the HTTP `Last-Modified` header where given, and, for an advertisement, when it first appeared if the Wayback Machine (web.archive.org) can tell. The newest binding document rules; say which one that is and why.
- **No legal judgement.** Do not say whether a clause would hold in court. Say only what the documents say.

Be skeptical. "Zero custody", "פטור מלא ללא הגבלת זמן", "ללא עמלות נסתרות" are claims to disprove. No one is that generous: look for the catch (a condition, an end date, a fee under another name, a spread, a minimum, discretion) and say plainly when you found none.

## The reader the price is for

An ordinary new retail customer, Israeli resident, self-directed online account, no group benefit, who:
1. buys an Israeli tracking fund (קרן נאמנות מחקה) or an ETF (קרן סל) on the S&P 500, traded in Tel Aviv, in shekels, either as one sum or once a month by standing order where the house offers one, and holds for years;
2. or buys a fund abroad (an ETF in the US or Europe), which needs a currency conversion.

For both, every cost that applies: trade commission and its minimum; custody, handling or account fees and their minimums and period; conversion fee **and spread**; standing-order fee; dividend or distribution handling; transfer out; inactivity; anything the account needs to work (data, platform).

## What to read, in this order

1. The house's current record in `data/fees/` (the newest snapshot for the house) and what the site does with it: the record's lines, `availability`, `groups`, `left_out`, `price_for_he`.
2. The house's own pages: the self-trading landing page, the about page, the joining or promotion page, the price list page, the terms or legal page, every asterisk and footnote, every linked terms PDF. Collect every fee claim with its exact words and URL.
3. The binding documents: the newest price list (search the site and the web for a newer one than the record's), every promotion's terms, the account agreement or fee annex if anywhere published, the "גילוי נאות" page.
4. The exchange's fee calculator, `https://market.tase.co.il/he/market_data/trading_fees`, the house's sheet: the list fees, their "updated" date, and the averages actually charged. It needs a real browser (see Tools).
5. Where something is still open, search the web (forums, news, comparisons) for a customer's own report of being charged, and say it is a report, not a document.

## Tools and house rules

- **The document library first.** `node research/library/library.mjs find <words>` before downloading; file every new document with `library.mjs add <file> --publisher X --title Y --kind K --url U` (kinds used: tariff, promotion-terms, page, terms, disclosure); `library.mjs tried "what" --result "what came of it" --where W` for every search that found nothing. Downloads go into a new empty folder under your scratchpad, never into the repo.
- **The founder's Chrome is allowed** (the `mcp__claude-in-chrome__*` tools; load them with ToolSearch in one call). Never click a download button in it: read a PDF in its own tab, or copy its link and fetch it with curl. Use Chrome for pages that refuse scripts and for the exchange's calculator. Close the tabs you open.
- **curl** with a browser User-Agent for plain pages and PDFs; `pdftotext -layout` and `pdfinfo` for PDFs. Hebrew PDF text can come out reversed; check a quote against the page image (`pdftoppm -png -r 80 -f N -l N`) before relying on it.
- **Every figure you report carries its source** (URL, page, the document's own words) and its date. Tell what you read apart from what you infer.
- Never fill a tax or financial rule from memory (`il-finance` skill). This job is about the house's own terms.

## What to change, and what not to

- **Update the house's fee record** to match the binding documents, following `docs/data-schema.md` and the `data-update` skill: a new snapshot file `data/fees/<id>@2026-11-04.json` when you read the price list again (copy the newest snapshot, change what changed, every value with its source, quote, page and `checked: 2026-11-04`). Record each conditional exemption under `groups` or `left_out` with its conditions and the document's words, never as a line's price. A cost the documents leave unlimited: say so in the line's notes and in your report; do not invent a number and do not record zero.
- Run `npm run validate` and `npx vitest run` and report what failed. **Do not change any test, any site or engine code, and do not commit.** The lead updates the tests and commits, each ranking change with its evidence.
- Do not touch other houses' records. If you find something about another house, put it in your report.

## Your report

Write `research/2026-11-04-binding-prices/<house-id>.md`, at most about 200 lines:

1. **Claims and verdicts.** A table: every fee claim the house advertises (words, where, date seen) → what the binding documents say (document, page, words) → verdict: *guaranteed* (binding, for every ordinary customer, no end date), *offer* (binding but conditional or withdrawable; the conditions), *contradicted* (a binding document prints the fee anyway) or *not found* (no binding document says it).
2. **The documents.** Each binding document: URL, version or printed date, PDF dates, library id, which is newest.
3. **The ordinary customer's price** for the two reader cases above: every cost, the most the documents allow, with source; "not limited" where the documents are silent.
4. **What changed in the record**, line by line, and why.
5. **Still open**, and what would settle it (a written answer from the company, a customer's statement).

Your final message to the lead: under 250 words. The verdicts in one line each, the record's changes that move a price, the test failures, and anything the founder must decide.
