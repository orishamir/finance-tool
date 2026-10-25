# Source check of 2026-10-25: brief for every agent

The founder asked (his words): "validate all sources. You can use my chrome. Also, stop giving a 'for an easy read'
source. ALWAYS prioritize using official government PDFs which are most up to date. If there is a PDF from רשות המיסים
which you can directly link to then use it." And: "For every rule we have, try to get a non-copy source" (many rules
cite Wikisource or Nevo copies of laws, shown on the site as "(עותק)").

The lead of this check (the agent that launched you) owns the integration, `data/sources/*.json`, the main report and
the final verification. Your own scope (which files you own, or which laws you research) is in your prompt.

## 1. How sources are stored (read this before editing anything)

- **Rule base = source of truth.** `.claude/skills/il-finance/references/*.md`, one `### <ID>` block per rule, each with
  one `- Source:` line (continuation lines count until the next `- ` line). Read
  `.claude/skills/il-finance/SKILL.md` and `references/README.md` once.
- **Rule records.** `data/rules/<id>.json` has a `sources` array that is GENERATED from that line by
  `packages/pipeline/scripts/extract-sources.ts`. Never hand-edit `sources`. Edit the markdown line, then run
  `bash research/audit/tools/extract-locked.sh` from the repo root (it runs the extract and `npm run validate` under a
  lock, because several agents share data/rules).
- **Figure sources.** Each figure value object in `figures` of a record carries its own hand-written `source`
  `{url, title, publisher, strength}` and `checked`. The site's number sheet shows exactly this. Change it ONLY with
  `python3 research/audit/tools/figsrc.py list|set ...` (same lock; it refuses to touch anything but `source` and
  `checked`). Never change `value`, `unit`, `effective_*`, `tax_year`, `update_rule` or `notes`. Give a figure the
  same official source you give its rule for that point: `--strength primary`, the official document's title with the
  file page or section in it (as the existing titles do, e.g. "פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים, p.89,
  s.9(16א)"), `--publisher` the publisher's name, `--checked 2026-10-25`.
- **What the extract reads from a Source line** (see the script for the exact rules):
  - every markdown link `[title](url)` is one source; a link-less mention ("Ordinance s.3(e), Wikisource") is NOT
    extracted and the site never shows it. Turn a link-less mention into a linked official citation or delete it.
  - the locator is the text after the link up to the next `·` (or `;`): `p.89`, `pp.88-97`, `p.4, ss.5-7`,
    `s.9(16A)(a)`, `reg. 3(א)(11א)`. A 4+ letter English word that is not a locator word cuts the locator there.
  - `p.N`/`pp.N` on a PDF link (a `.pdf` path or a gov.il BlobFolder) becomes `page` and the site opens `#page=N`.
    The word `printed` in the locator suppresses the page. **N must be the PDF FILE page** (what `#page=N` opens and
    `pdftotext -f N -l N` reads), never the number printed on the page and never a gazette page number
    (ספר החוקים / קובץ התקנות pages such as "p.1138").
  - strength: `· primary`, `· institution`, `· secondary` after the locator; `primary (mirror)` / `(copy)` in the
    qualifier, or a Wikisource/Nevo host, makes it a copy (`primary-mirror`). A gov.il, boi.org.il, knesset.gov.il,
    isa.gov.il, btl.gov.il, tase.co.il host is never a copy. Give every link its own strength word: a trailing word
    after a run of links applies to all of them (this is how institution FAQs and bylaws were mislabelled as copies).
  - `· checked YYYY-MM-DD` after a segment is that source's checked date. **Set `checked 2026-10-25` on every source
    you have verified today** (and only those).
  - a Hebrew quoted span ("...", 8 to 240 characters, no ellipsis) in the segment is shown as the quote: if you keep
    or add a quote, it must be verbatim from the cited page.
  - the title is the link text. A Hebrew title is shown as is; an English one is shown only through a matching row of
    `data/sources/documents.json` (title tokens, longest match wins). For a new official document, write the link
    title in Hebrew exactly as the document names itself (balanced brackets are fine), or request a documents.json
    row (section 5).

## 2. The standard you apply

1. **Page = file page, verified on the page.** Download the PDF with curl and a browser user agent, run
   `pdftotext -f N -l N file.pdf -` (or `python3 -I research/audit/tools/pdfpages.py file.pdf` once, then
   `bestpage.py PAGES.json "text"`), and confirm the cited text is on that page. Fix ranges too.
2. **Newest official edition.** If a newer official edition of a cited document exists, move the citation to it with
   a verified file page. If the newer document gives a different number than the rule's figures, do NOT change the
   figure or the rule text: list it under "Figures that differ" (rule id, figure name, value in the record, value in
   the newer source, source URL and file page).
3. **No copies "for an easy read".** For each copy (Wikisource, Nevo, a re-hosted PDF on a third-party site):
   - if an official source already on the rule states the same point, delete the copy (from the Source line, and
     replace it in any figure source);
   - otherwise replace it with an official government-hosted text, preferring a PDF linked directly with its file
     page: the regulator's or ministry's own document (Tax Authority, Bank of Israel, ISA, National Insurance,
     Capital Market Authority, Ministry of Finance on gov.il), else the official gazette PDF (ספר החוקים, קובץ התקנות,
     ילקוט הפרסומים on fs.knesset.gov.il or gov.il) of the law or amendment that set the cited section's current
     wording; the Knesset's legislation database tells which amendment that is;
   - keep a copy only when no official text of that point can be found, and record what you searched.
4. **Every remaining source**: it opens (a 403 to curl is not "broken": check it in Chrome), it says what the rule
   says, and its locator (page, section) is right. Then set its checked date to 2026-10-25.
5. **Never state, fill or change a financial or tax rule from memory**, and never edit rule text, figures, the rule's
   own `strength`/`checked`, docs/, site/ or packages/. If a source contradicts the rule text, report it; do not fix
   the rule.

## 3. What is already known (lead, 2026-10-25)

- **Tax Authority guide "דע זכויותיך וחובותיך"**: the 2025 edition (tax year 2025, file
  `Guides_IncomeTax_da-2025.pdf`, 152 pages) is the newest on gov.il (the page, updated 05.07.2026, lists 2025 and
  2024 only). Every printed page there is file page minus 2. All citations of it in Source lines (`p.N` and
  `printed p.N`) were already converted to file pages (+2) by the lead, and 55 quoted spans were found on the new
  pages; you still check that the page says the rule's point.
- **TASE periodic report 2025**: file page = printed + 3; citations converted. **Debt-management unit annual report
  2025**: printed number = file page (no shift needed; the automatic pass was wrong about it).
- **Gazette PDFs on fs.knesset.gov.il**: file page 1 is the cover; the printed gazette page is at the bottom of each
  page (`python3 -I research/audit/tools/edges.py file.pdf` prints each page's edge numbers).
- **Income Tax Ordinance, official consolidated text**: the Tax Authority publishes "פקודת מס הכנסה [נוסח חדש]" on
  gov.il (page `https://www.gov.il/he/pages/law_pkudat_mas_hachnasa`, published 15.01.2023; the page says the most
  current text is the gazette). PDF (312 pages, consolidated up to Amendment 262, late 2022), download with `curl -g`:
  `https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20[%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9]%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf`
  (in a markdown link, write `[` as `%5B` and `]` as `%5D`). National Insurance's copy (btl.gov.il/Laws1/02_0103_000000.pdf)
  is from 2013: do not use it. All 367 Ordinance amendments with their gazette PDF links:
  `research/audit/2026-10-25-source-check/ito-amendments.json` (from the Knesset OData; the latest is No. 288 in the
  2026 Economic Efficiency Law, ס"ח 3511).
- **Knesset OData** (works with curl): `https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw()?$filter=substringof('<name>',Name)&$format=json`
  gives the IsraelLawID; `python3 -I research/audit/tools/knesset_amend.py <IsraelLawID> out.json` lists every
  amending law with its ספר החוקים number, page and PDF (it works for primary laws; regulations are not in it).
- **data.gov.il**: dataset pages moved to `https://data.gov.il/he/datasets/<org>/<name>` (already replaced for
  gemelnet, pensia-net, savingsplaninterest, 375). The datastore API links work in a browser; the automatic check
  failed on unencoded braces and quotes. Spaces inside link URLs were encoded as %20 (the extract cut URLs at a space).
- **Not 200 to scripts, check in Chrome before judging**: onezerobank.com, spglobal.com, calcalist.co.il, gov.il HTML
  pages (403 to curl), the Supreme Court download link of TXI-25.
- **Official-text maps** in `research/audit/2026-10-25-source-check/maps/`: `ito.json` (Income Tax Ordinance, 135
  subsections, complete; read `R-ito.md` for its findings), `other.json` (investment-trust law and regulations,
  Securities Law, Banking Ordinance, National Insurance Law and child-savings regulations, State Loan law and
  regulations; nearly complete). `prov.json` (provident-fund, pension, insurance and labour laws, regulations, CMA
  circulars and reports) and `taxregs.json` (income-tax regulations, orders, rules, VAT) are being built.
- **Reshumot file service**: קובץ התקנות PDFs are served by the Ministry of Justice at
  `https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/<id>=`
  (application/pdf; keep the trailing `=`). The extract does not see these as PDFs, so write the file page into the
  URL itself: `...Documents/<id>=#page=3` (the site then opens that page), and keep `p.3` in the locator.
- **Title hijack**: documents.json rows match by substring and the longest token wins, so a generic law row can give
  an amendment the base law's title (the lead removed the generic Hebrew law-name tokens on 2026-10-25 for this
  reason). After your extract, look at the `title_he` the record got for each source you added; if it is wrong, put
  a row with a longer, specific token in your requests file.
- `research/audit/2026-10-25-source-check/copy-groups.txt`: every copy, rule source or figure source, grouped by URL.
- `research/audit/2026-10-25-source-check-auto.json`: the automatic pass (status, page checks) from before the fixes.

## 4. Tools and limits

- Downloads: `curl -g -sS -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" -o FILE URL`
  into your own scratchpad, one new directory per download batch; run Python on downloaded files with `python3 -I`.
- Helpers in `research/audit/tools/`: `pdfpages.py` (normalized page texts), `bestpage.py` (which page holds a text),
  `edges.py` (printed numbers per page), `verify_quotes.py` (quotes of one document's citations vs its pages),
  `shift_pages.py` (shift one document's page citations by an offset; dry run without --write), `knesset_amend.py`,
  `figsrc.py`, `extract-locked.sh`, `source-check.py`.
- Search: WebSearch if you have it; the founder's Chrome (claude-in-chrome) for Google and for pages that block
  scripts. In Chrome: load the tools with ONE ToolSearch call, open your OWN tab with tabs_create_mcp, use only that
  tab id, prefer get_page_text / find / javascript_tool over clicks, never click a download button (read the link and
  curl it), never touch or close other tabs, close your tab when done.
- Keep tool output short (scripts that print summaries, `cut -c1-200`): your context is limited. If it runs long,
  stop cleanly at a family (file) boundary and say exactly where you stopped.
- Do not commit or push. Do not run `npm run check`, `npm run build` or a dev server.

## 5. Requests to the lead (shared tables)

Do not edit `data/sources/documents.json` or `data/sources/publishers.json`. Append the rows you need to your own file
`research/audit/2026-10-25-source-check/requests/<your-name>.json` (a JSON list of
`{"file": "documents.json", "row": {"id", "match": [...], "title_he", "publisher_he", "kind", "official_url": null}}`
or `{"file": "publishers.json", "host": "...", "row": {"publisher", "publisher_he", "kind", "mirror": null}}`).
The lead applies them and reruns the extract. Look at the existing rows first; reuse a document id when it fits.

## 6. Your report

Write your report part to `research/audit/2026-10-25-source-check/<your-name>.md` (plain words, no rule-id-only
sentences; ids beside the words are fine) and return a short summary as your final message. Per file or law: what
changed, counted by kind (page fixed, link fixed, edition moved, copy replaced, copy removed, copy kept, figure source
replaced, verified unchanged), every copy kept with what you searched, "Figures that differ", anything that needs the
founder's decision, and what is left.
