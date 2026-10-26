#!/usr/bin/env python3
"""gen_review_md.py: write ../review.md from review.json, work/compare.json and the reviewer's prose below."""
import collections, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
rev = json.load(open(os.path.join(HERE, "..", "review.json")))
R = {v["id"]: v for v in rev}
cmp_ = json.load(open(os.path.join(HERE, "work", "compare.json")))
recs = {r["id"]: r for r in json.load(open(os.path.join(HERE, "work", "records.json")))}


def names(v):
    return ", ".join(i["name"] if isinstance(i, dict) else i for i in v.get("institutions") or [])


def cell(t, n=None):
    t = re.sub(r"\s+", " ", str(t or "")).replace("|", "/")
    return t if n is None or len(t) <= n else t[: n - 1].rstrip() + "…"


def pre(i):
    return i.split("-")[0]


cnt = collections.Counter(v["scope"] for v in rev)
by = collections.defaultdict(collections.Counter)
for v in rev:
    by[v["reviewed_by"]][v["scope"]] += 1
order = ["reviewer", "helper G1", "helper G2", "helper G3", "helper G4", "helper G5"]
groups = {"reviewer": "CAT (18)", "helper G1": "PF, KGL, KH, CS (100)", "helper G2": "PEN, SW, INS (100)",
          "helper G3": "BRK, ETF, MKT (99)", "helper G4": "BANK, BPN, MF, REG, GOV, IRA (127)", "helper G5": "tax: TX2, TXA, TXF, TXG, TXH, TXI, TXK, TXP, TXS (133)"}
qc = collections.Counter((v.get("quote_check") or "")[:28] for v in rev if v["scope"] == "general")

L = []
w = L.append
w("# Independent scope review of the rule records, 2026-10-25/26")
w("")
w("The independent reviewer's pass under `research/specs/2026-10-25-rules-scope/spec.md` section 2: every one of the 577 records in `data/rules/` read with its sources against the definition in section 1, its scope written down (`review.json`), and only then compared with the editor's `- Scope:` lines. Nothing in `data/`, the references or the code was changed.")
w("")
w("## 1. Method")
w("")
w("- **Independence.** Before the verdicts were written, nobody on the review side opened the editor's `- Scope:` lines, the other files in this folder (applied, provident, pension, markets, tax-bases, brief) or the 2026-10-25 git history. The records were read through bundles (`tools/bundle.py` → `tools/work/records.json`, viewed with `tools/ref.py`) that hold each record's JSON and its references block with every `- Scope:` line and every inline \"2026-10-25 (scope pass ...)\" note cut out (151 records carried such a note). The comparison script (`tools/compare.py`) was written and run after `review.json` existed.")
w("- **Who read what.** The reviewer took the 18 CAT records and the three specific checks. Five helpers (Opus, xhigh effort, the founder's research setting) took the rest, each with the same brief (`tools/helper-brief.txt`: the section 1 definition, the edge cases, the independence rules, the quote rule and a few practical readings, such as \"a regulator's dataset that shows one company's track menu is that company's\"). Groups: " + "; ".join(f"{k.replace('helper ', '')}: {groups[k]}" for k in order[1:]) + ".")
w("- **The quote rule.** Every `general` verdict carries the general source's own sentence, its URL and its locator, read in the fetched source with `tools/src.py` (gov.il HTML pages through `research/audit/tools/govil-page.sh` only; gov.il PDFs and every other site by plain curl; a bot check or block page was recorded and never worked around). The reviewer then re-checked every quote by script (`tools/verify_quotes.py`): of 467 quotes marked as read in the fetched source, 465 were found whole; the other two (KGL-01, PF-28, Knesset PDFs with an interleaved text layer) the reviewer read on the rendered pages. Two more were read on rendered pages by a helper (PEN-03, an image scan; SW-24, a scrambled gazette page), two are quotes recorded in the record from a page that blocks scripts (ETF-50, GOV-22), one is a count over every row of a CMA dataset (CAT-39), and **two have no quote at all (TXI-25, a Supreme Court ruling whose site resets the connection; TXS-24, Maya): general is not proven for those two.**")
w("- **Checks over every row.** Where a record's claim was about the regulator's own data, it was checked over every row instead of one company's example: `tools/cat09_join.py` (CAT-09), `tools/cat24_spread.py` (CAT-24), `tools/cat39_pairs.py` (CAT-39).")
w("- **What a verdict says.** `general` means a general source says the record's main statement and binds everyone it names; it does not certify every sentence of the record. Errors inside records are listed separately (section 7). For `institution` verdicts the helpers did not always re-open the company's PDF; the scope then rests on the kind of document cited.")
w("")
w("## 2. Counts")
w("")
w("| Scope | Records |")
w("|---|---|")
for s in ("general", "institution", "unsettled"):
    w(f"| {s} | {cnt[s]} |")
w(f"| total | {len(rev)} |")
w("")
w("| Read by | Records | general | institution | unsettled |")
w("|---|---|---|---|---|")
for k in order:
    w(f"| {k} | {groups[k]} | {by[k]['general']} | {by[k]['institution']} | {by[k]['unsettled']} |")
w("")
splits = [v["id"] for v in rev if v.get("split")]
w(f"Mixed records with a part to split off: {len(splits)} ({', '.join(splits)}). Each entry's `split` field says what goes and with which scope.")
w("")
div = collections.defaultdict(list)
for v in rev:
    div[(recs[v['id']]['strength'], v['scope'])].append(v['id'])
w("Where the record's own strength label and the scope part ways:")
w(f"- marked `primary` but company-scoped: {', '.join(div[('primary','institution')])} (institution) and {', '.join(div[('primary','unsettled')])} (unsettled). None of them has an editor Scope line (section 4), and every one has a first or only source labelled with a general-looking kind and strength `primary` (`exchange_rules` for TASE brochures and site terms, `other` for the S&P, MSCI and Nasdaq rulebooks, `institution_doc`/`primary` for TASE's own report and Maya, `official_pdf`/`regulator_page` for the Securities Authority's own site terms), so a validator that reads only the source label would pass them as general;")
w(f"- marked `institution` but general once the general source found by the review is cited: {', '.join(div[('institution','general')])}.")
w("")
w("## 3. Disagreements with the editor")
w("")
w(f"The editor wrote a Scope line for {cmp_['editor_lines']} rules; three of them (TXA-03, TXA-05, TXA-08) are rules in `tax-insurance-and-amendment-190.md` that are not records in `data/rules/`. Of the {cmp_['agree'] + len(cmp_['disagree'])} records both sides scoped, the readings agree on {cmp_['agree']} and differ on {len(cmp_['disagree'])}: four in kind, three in the companies named, one in the companies an unsettled record was seen at. Company names were compared as groups (Mor = Mor Investment House, Meitav Trade = Meitav, Altshuler Shaham Trade = Altshuler Shaham, Interactive Brokers Ireland = Interactive Brokers, BlackRock = iShares, Yelin = Yalin Lapidot); the entity-level spellings differ in 20 records and are a naming choice for the institution registry, not a disagreement.")
w("")
DIS = [
 ("CAT-23", "kind",
  "unsettled: the CMA list of investment tracks, amendment 2024-1471 of 17.4.2024 (its gov.il file); seen at: Meitav",
  "general",
  "The editor's own settling source exists and was read. A gov.il site search (through govil-page.sh) lists the CMA items 'רשימת מסלולי השקעה' (notice-2022-6545, 20.12.2022) and 'רשימת מסלולי השקעה - תיקון' (notice-2023-069, dated 16.4.2024 on gov.il). The amendment's Word file carries every track policy the record quotes from Meitav, for example 'מסלול כספי (שקלי) ... נכסי המסלול יהיו חשופים לנכסים הבאים אשר אינם צמודים ואינם חשופים לסיכוני מטבע (פרט למטבע השקל החדש): פיקדונות שקליים, מלוות ממשלתיות נקובות בש\"ח ... בשיעור שלא יפחת מ-75% ולא יעלה על 120% מנכסי המסלול' (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_word.docx; the file marks deleted text by strike-through, which src.py now drops). Circular 2022-9-30 s.9(ב) binds every manager to the list's policy for a list name.",
  "General, re-sourced to the CMA list; Meitav stays as a named example. Re-check each track's wording against the 2024 text (it adds governments and deposits to 'אשראי ואג\"ח', a 75% debt condition on debt funds from 1.7.2024, and drops 'מתמחה גמיש')."),
 ("KGL-27", "kind",
  "unsettled: the CMA joining circular, or a rule that names kupat gemel lehashkaa for a minor's account; seen at: Altshuler Shaham, Meitav",
  "general (helper G1), with Meitav's sentence split off as institution: Meitav",
  "The CMA standard bylaw for kupat gemel lehashkaa, s.11, p.5: 'החברה המנהלת תשלם את הכספים שהצטברו בחשבונו של עמית בקופת גמל להשקעה או בחשבונו של ילדו הקטין ,אם הוא אפוטרופסו' (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-2829/he/regulation_hm_takanongemel.pdf). Altshuler Shaham's clause 11 copies it; the record's search looked at rule 38 and circular 2017-9-17 but not the standard bylaw.",
  "General, citing the standard bylaw. Worth one check by the lead that this 2016 standard bylaw clause is still the version in force (see KGL-30, where a later circular overrode another clause of the same bylaw)."),
 ("KGL-28", "kind",
  "unsettled: the CMA standard bylaw for kupat gemel lehashkaa (gov.il), read for these two clauses; seen at: Altshuler Shaham, Infinity, Yachad Rofim",
  "general (helper G1)",
  "The editor's settling source was read: standard bylaw s.13, p.6: 'החברה המנהלת תשלח לעמית מושך דוח על המשיכה ,וזאת תוך 10ימי עסקים מיום תשלום הכסף לעמית', and s.14.1-14.2 for late payment (same file as KGL-27).",
  "General. The helper also notes that s.14.2 pays the difference whenever the value at actual payment is higher, not only after a fall, so the record's wording should be tightened."),
 ("TXK-26", "kind",
  "unsettled: reg. 3 of the 2005 withholding regulations as in force today in Reshumot, or a Tax Authority instruction to managing companies on withholding from kupat gemel lehashkaa withdrawals; seen at: Harel",
  "general for the regulation (reg. 3(א), 20%), with Harel's 25% split off as institution: Harel, saying it departs from the regulation's text (helper G5)",
  "Reg. 3(א) in the NII consolidated copy (to 27.12.2017), p.2: 'קופת גמל המשלמת ליחיד ריבית ,תנכה ממנה מס בשיעור של ,20%' (https://www.btl.gov.il/Laws1/02_0103_100269.pdf); the 2012 amendment (ק\"ת 7076) moved regs 4 and 5 to 25% and did not touch reg. 3. Neither side established whether a later amendment exists.",
  "This one turns on a source fact, not on judgement: if reg. 3 was amended after 2017 to 25%, Harel does not depart from anything. Until the current Reshumot text is read, keep the regulation's rate labelled 'as consolidated to 27.12.2017' and Harel's 25% as Harel's. The site's net figures do not depend on it (the final tax is TXK-07); only a sentence such as 'the manager withholds 25%' does."),
 ("PF-40", "institutions",
  "institution: Altshuler Shaham, The Phoenix",
  "institution: The Phoenix (helper G1), with Altshuler Shaham's part moved to the general record PF-23",
  "Altshuler Shaham's clauses (switch within 3 business days; deferral to the 4th business day at the start of a month; deposit into each track) are the CMA standard bylaw word for word, s.20.1-20.4 and s.10, p.7: 'אם חל מועד העברת הכספים באחד משלושת ימי העסקים הראשונים בחודש פלוני ,רשאית החברה המנהלת לדחות את מועד העברת הכספים ליום העסקים הרביעי באותו חודש' (regulation_hm_takanongemel.pdf). Only The Phoenix's valuation date ('השינוי יבוצע לפי מדד השקעות אחרון הידוע ליום השינוי', its FAQ) is a company's own.",
  "The Altshuler part is general. Which part keeps the id is the lead's call: the spec says the general part keeps it (then PF-40 becomes general and The Phoenix's sentence gets a new id); the helper did the reverse because only one sentence is left on each side. The same choice arises in KGL-26."),
 ("IRA-21", "institutions",
  "institution: Meitav",
  "institution: Meitav, Meitav Trade, Bank Leumi, Mizrahi Tefahot Bank, First International Bank, Bank Hapoalim (helper G4)",
  "All five sources are Meitav's documents (the results of Meitav's competitive process for its IRA); the figures are each broker's price to Meitav's IRA members. The IRA regulations (reg. 12 process, reg. 7 charges) set no tariff.",
  "By the letter of the definition ('found only in one institution's documents') the scope is Meitav, with the brokers named in the text; listing the banks would put the record on their company pages too, which is a presentation choice. Recommendation: Meitav."),
 ("REG-26", "institutions",
  "institution: Interactive Israel",
  "institution: Interactive Israel, Interactive Brokers (helper G4)",
  "The only source is Interactive Israel's own 'about' page; the record itself says Interactive Brokers' own protection pages were not opened and the amounts are 'as the introducer states'.",
  "After the comparison the reviewer sides with the editor: Interactive Israel only. No Interactive Brokers document supports the record."),
 ("PEN-40", "seen-at",
  "unsettled: a CMA circular or approval that changed the orphans' share in s.94 of the standard pension bylaw; seen at: Mor, Harel, Altshuler Shaham, Meitav, Menora Mivtachim",
  "unsettled, seen at the same five plus Infinity (helper G2: its 2023 bylaw has the same 40% split)",
  "Same kind and settling source; the helper's search found one more company bylaw with the same wording.",
  "Add Infinity to the seen-at list. Still unsettled: six bylaws are a count over some companies, never a general statement."),
]
for i, kind, ed, rv, ev, rec in DIS:
    w(f"### {i} ({kind})")
    w(f"- Editor: {ed}")
    w(f"- Review: {rv}")
    w(f"- Evidence: {ev}")
    w(f"- Recommendation: {rec}")
    w("")
w("## 4. Records with no Scope line")
w("")
no = cmp_["no_scope_line"]
nc = collections.Counter(R[i]["scope"] for i in no)
w(f"{len(no)} of the 577 records have no `- Scope:` line. The review reads {nc['general']} of them as general, {nc['institution']} as institution and {nc['unsettled']} as unsettled. The non-general ones matter most, because nothing marks them today:")
w("")
w("| Record | Review | Companies | Why |")
w("|---|---|---|---|")
for i in no:
    v = R[i]
    if v["scope"] != "general":
        w(f"| {i} | {v['scope']} | {cell(names(v))} | {cell(v.get('settle') if v['scope']=='unsettled' else v['note'], 260)} |")
w("")
w("All records with no Scope line, by prefix (non-general ones in bold):")
w("")
bp = collections.defaultdict(list)
for i in no:
    bp[pre(i)].append(f"**{i}**" if R[i]["scope"] != "general" else i)
for p in sorted(bp):
    w(f"- {p} ({len(bp[p])}): {', '.join(bp[p])}")
w("")
w("## 5. Judgement calls the founder should see")
w("")
JUD = [
 ("Index rules", "The Tel Aviv exchange's own index rules (TA-35, TA-125 and so on) are read as exchange rules, so general (ETF-33 to 36, 41, 42, 44, 45), while the S&P, MSCI and Nasdaq index rulebooks are company documents, so institution (ETF-37 to 40, 46 to 49). Both describe what an index holds; the difference is that the exchange's rules are part of its rulebook. If you want every index treated alike, the eight TASE records become 'institution: Tel Aviv Stock Exchange'."),
 ("The exchange as a company", "Where the exchange acts as a company and not as a rule-maker, the review reads it as an institution: its website terms (CAT-43, BRK-37), its paid data products (BRK-39), its Maya fund list and download button (CAT-42), its nominee company (BRK-13). Two records about how the exchange runs the market rest only on its annual report, not on its rulebook (BRK-12, the clearing house; BRK-29, the Monday-to-Friday trading week): unsettled until the rule text is read. The other reading is that, as the only exchange, whatever it does is true for everyone."),
 ("'No rule exists' records", "Several records say that something does not exist: no deposit insurance (BANK-23), no minimum balance in a self-directed provident fund (IRA-10), no rule on keeping a client from leaving (SW-19), no fee cap at non-bank brokers (SW-34), no Israeli rule on foreign brokers (SW-37). An absence has no sentence to quote. The review scores the first three general because a law that covers everyone was read and is silent (BANK-23 leans on a 2026 law that orders the minister and the governor to examine whether deposit insurance is needed), and the last two unsettled. A cleaner home for all of them may be the open questions, not the rule set."),
 ("Regulator texts that bind no one", "The definition counts a regulator's published guidance as general. In practice that includes texts that bind nobody: the Securities Authority's yearly report describing the fund market (ETF-11, 17, 18, 26, 52), a voluntary 2016 outline that fee increases happen only on 1 January (MF-17), the pension regulator's drafts and plans (IRA-26, IRA-27), the Finance Ministry chief economist's paper (TXH-04, 17, 22) and National Insurance's FAQ on a pension route whose legal basis the record itself doubts (TXK-25). They are general in scope (nobody's own term) but the site should not present them as law."),
 ("Company clauses copied from a regulator's standard bylaw", "Many company bylaw clauses turn out to be the regulator's standard bylaw word for word (KGL-27, KGL-28, PF-40's Altshuler part, PEN-10, PEN-21, PEN-26). Once the standard bylaw is quoted they are general. Where only the company's copy was found but it still carries the regulator's drafting note (PEN-44, Mor's loans clause), the review stays at unsettled. KGL-30 is the reverse case: the two-year discount wording is the regulator's own 2016 standard bylaw, later overridden by a 2017 circular, so the companies that kept it depart from the current rule. A lead for the lead: the regulator also has a standard bylaw for savings provident funds, 'תקנון תקני קופת גמל לחיסכון', amended by circular גמל 2021-2-1 of 21.10.2021 (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2021-2-1/he/takanon-tikni-kupat-gemel-lehisachon-tikun-pdf.pdf, found by gov.il site search). Its base text, which is the editor's settling source for PEN-44, was not found in this pass, and whether it reaches study funds was not established; helper G1 found no standard study-fund bylaw, so KH-09, KH-13, KH-25 and KH-27 to KH-32 rest on company bylaws."),
 ("Who a broker's price inside Meitav's IRA belongs to", "IRA-21: the editor names only Meitav (its documents, its tender); the review also named the five brokers (their prices). This decides which company pages show it."),
 ("Things that are not rules", "Forum posts (SW-X01 to X04), press reports about two IRA managers (IRA-28), a published past-return series (MKT-01), the Securities Authority's own website terms (MF-55) and many counts over the market (ETF-43, ETF-50, BRK-32, CAT-42, TXS-24, IRA-03, IRA-17, MF-18, MF-52, REG-03) are in the rule set. The schema forces a scope on each, and none fits well. They belong in data, notes or open questions."),
 ("Partial counts", "Two pension records state a figure seen in several companies' bylaws but in no regulator text: a 12.5% floor on insured salary (PEN-37, four bylaws) and the orphans' share (PEN-40, six bylaws). By the definition they stay unsettled and cannot appear in the guide."),
]
for t, body in JUD:
    w(f"- **{t}.** {body}")
w("")
w("## 6. The three specific checks")
w("")
w("### 6.1 The child-savings fee after 21 (CS-30 in the ledger)")
w("")
w("`packages/engine/src/ledgers/child-savings.ts` (formula F-54) takes `book.rate(\"CS-30\", \"fee_after_21\")`, 0.23% a year, and charges it on every provident-route balance after the last grant, whatever the manager. The figure's own source is Harel's child-savings bylaw (its fill-in of the regulator's blank) and Altshuler Shaham's Q&A (`data/rules/cs-30.json`, figure `fee_after_21`, strength institution, `update_rule: provider-set`). The ledger's input has no manager, so the result presents two companies' rate as the provident route's. **By the CLAUDE.md rule ('a company's term is never general ... never as a fact about a product') that is a company term used as a fact about the product.** The guide page does it right: it names Harel and Altshuler Shaham beside the figure and says the other companies were not checked.")
w("")
w("The general alternatives:")
w("- **The legal cap (CS-18).** After 21 the general provident-fund cap applies: up to 1.05% a year of the balance (fee regulations reg. 2(א)(1), quoted in CS-18) and up to 4% of deposits, which is moot after 18 because deposits stop. It is general and sourced, but it is a ceiling, so a result built on it is a worst case and must say 'up to'. The standard child bylaw leaves the rate blank for each company ('בשיעור ____', s.31.1), and the 0.23% NII pays until 21 is NII's payment, not a rate after 21.")
w("- **A count over every collected institution.** Not available today. The regulator's Gemel-Net data cannot give it: in 202609 the 41 child-savings tracks of the ten managers (Infinity, Altshuler Shaham, Analyst, The Phoenix, Harel, Clal, Migdal, Mor, Meitav, Menora) show average asset fees of 0 to 0.02%, because NII pays until 21 for almost every member. A count would need each of the ten managers' child-savings bylaws (the blank each one filled). Two of ten is a partial count, which the spec says is never general.")
w("- **The person's own manager.** The rule 'every number is sourced, computed, or entered' also allows the rate to be entered by the person (from their own manager's bylaw), with the cap as the bound, or a named example ('at Harel and Altshuler Shaham: 0.23%') shown with the company's name.")
w("")
w("Materiality: the fee matters only for money left in the fund after 21 (the ledger charges nothing before the last grant month). Left there for nine more years, the gap between 0.23% and the 1.05% cap is about 7% of the balance. Recommendation for the lead (no code was changed): run the provident route on the legal cap labelled 'up to', or on an entered rate bounded by the cap, and show Harel's and Altshuler Shaham's 0.23% only as a named example; collecting the other eight managers' bylaws would make a real range possible.")
w("")
w("### 6.2 CAT-09, CAT-17, CAT-24 (read by the reviewer)")
w("")
w("None of the three has an editor Scope line. All three are general, and in each the company document is not needed:")
w("- **CAT-09** (a Gemel-Net 'fund' row is a track). General: it is about how the regulator's dataset is built. Gemel-Net's own dictionary defines FUND_ID as 'מספר מס הכנסה של קופת הגמל. זיהוי יחודי לקופה.', and the regulator's model joining form refers to 'מספר מס הכנסה של המסלול' (circular 2022-9-30 p.10). Checked over every row instead of Meitav's example: all 764 distinct FUND_IDs of 202609 appear as track numbers ('מספר מסלול השקעה') in the regulator's own transfer dataset `transfer_bank` (85 also equal a fund number, where fund and track share one). So the regulator's dataset proves the claim; Meitav's merger notice can stay only as a named example. The record names that dataset in its text but does not cite it.")
w("- **CAT-17** (track categories). General: circular 2022-9-30 s.2 defines the general track ('מסלול כללי – מסלול השקעה שאינו מסלול מתמחה ,אינו מסלול ברירת מחדל ואינו מסלול למקבלי קצבה') and the five clusters. Harel's page is used only for the last clause, that Harel's own grouping of names is incomplete: that is a statement about Harel's page, to drop or split off as Harel's. The standard names under each cluster are in the regulator's list (notice-2023-069), which replaces Harel as the source.")
w("- **CAT-24** (regulatory versus expected policy; one name, different mixes). General: the circular's definitions of 'מדיניות ההשקעה התקנונית' and 'מדיניות השקעה צפויה' (s.2, p.2). 'The same standard name differs widely between managers' has a general basis in the regulator's own data: in Gemel-Net 202609 the kupat gemel lehashkaa track 'משולב סחיר' of 11 managers ranges from 23.9% (Ayalon) to 99.1% (Infinity) of assets in equities and from 1.2% (Meitav) to 109.4% (Analyst) abroad; Harel's own row shows 97.9% abroad. So Harel's description is not needed, and Meitav's notice may stay as a named example. One wording issue: Meitav's notice changes the regulatory policy itself under the same name ('שינוי מדיניות השקעה תקנונית'), which is not the 'actual mix moving within an unchanged policy' the sentence claims.")
w("")
prim = [v["id"] for v in rev if recs[v["id"]]["strength"] == "primary" and "inst" in recs[v["id"]]["mix"] and any(m != "inst" for m in recs[v["id"]]["mix"])]
notneeded = [i for i in prim if R[i].get("company_doc_needed") is False]
needed = [i for i in prim if R[i].get("company_doc_needed") is True]
other = [i for i in prim if R[i]["scope"] != "general"]
w("### 6.3 Records marked primary that cite a company document beside a general one")
w("")
w(f"{len(prim)} records are marked primary and cite at least one company document next to a general source. In **{len(notneeded)}** the general source carries every statement that keeps the id, so the company document is not needed (at most a named example): {', '.join(notneeded)}.")
w("")
w(f"In {len(needed)} it is still needed, each for a sentence the general source lacks, which is the part to split off as that company's: " + "; ".join(f"{i} ({cell(R[i].get('split') or R[i].get('note'), 140)})" for i in needed) + ".")
w("")
w(f"The other {len(other)} are not general at all, because their 'general' source is the exchange's own corporate document or an index provider's: " + ", ".join(f"{i} ({R[i]['scope']})" for i in other) + ".")
w("")
w("A few patterns behind the 'not needed' cases: a company brochure cited for a tax rule that is in the Ordinance (TXS-07 to TXS-14, TXS-19, TXS-22 lean on one Migdal prospectus; TXK-04 on a Harel brochure; TXI-17 on Discount and Mercantile where withholding regulation 9(א) says it); a company page cited where the regulator's standard bylaw has the same clause (CS-04, CS-06, KGL-02, PEN-10, PEN-21, PEN-26); average-wage figures taken from Harel instead of National Insurance (PEN-04, PEN-07).")
w("")
w("## 7. What is wrong in the rules' own text or sources")
w("")
ti = [v for v in rev if v.get("text_issue")]
w(f"{len(ti)} records carry a `text_issue`. The ones that change what a reader would be told (each checked against the source by the reviewer where marked ✓):")
w("")
SER = [
 ("GOV-16 ✓", "Says the state buys bonds back early 'at the market price on the day'. The 2007 amendments the record itself cites replaced exactly that tail in every bond type's early-redemption clause: 'במקום הסיפה החל במילים \"ובמחיר השוק\" יבוא ...' (KT 6597 pp.3-5). No price rule is left."),
 ("BANK-06 ✓", "Says that when a bank agrees to an unplanned early break the form must state the exact consequences. The Disclosure Rules s.10(ב) say the opposite: 'ואין צורך לפרט את התוצאות המדוייקות הנוגעות לפקדון המסויים' (BoI 151.pdf p.6)."),
 ("PEN-28 ✓", "Inverts the condition of the 25%-for-5-years commutation: the standard bylaw s.51(א)(2) (Mor's p.44 identical) allows it only 'ובלבד שסכום קצבת הזקנה נמוך מסכום הקצבה המזערי או שווה לו'. The record says 'provided the remaining pension is not below the minimum', which is the survivors' clause. It also dates the yearly update of the minimum annuity to 1 January where the 2008 law says 1 March."),
 ("PEN-29", "Inverted the same way: law s.23(ב)(3)(ג) requires annuities paid to be above the minimum annuity amount, not 'up to' it; and Mor's bylaw is listed first among the sources."),
 ("SW-17", "States a flat ban on percentage-based pay for a pension adviser; s.28(ב) as enacted allows it during the advice period set in the agreement."),
 ("SW-14", "Drops the condition in reg. 9(ד) that the receiving fund is also a new fund."),
 ("PEN-18", "Says it is unknown whether the target is CPI-linked; the same law page defines it as 5.15% compounded plus the CPI rise."),
 ("CAT-19", "The closed general track is cited to s.3(ד) of circular 2022-9-30, which by its words is about insurance policies sold before 2004; for annuity provident funds the regulator says it in the 2024 track-list amendment ('המסלול הכללי (שסגור למצטרפים חדשים בקופות גמל לקצבה)')."),
 ("CAT-15, CAT-23", "Say the regulator's list of investment tracks was not obtained; it is on gov.il (notice-2022-6545 and its 2024 amendment notice-2023-069)."),
 ("TXK-26", "The withholding rate on a kupat gemel lehashkaa lump sum is 20% in the regulation as consolidated to 27.12.2017 and 25% in Harel's flyer; whether a later amendment exists is still open (section 3)."),
 ("BRK-45", "Misquotes the IRS: the W-8BEN validity runs 'ending on the last day of the third succeeding calendar year', not 'until ...'."),
 ("BRK-47", "Leumi's clause that it need not keep a client's securities apart may depart from the Supervisor of Banks' custody guidance (BRK-10); if kept, the record should say so."),
 ("IRA-05, IRA-29", "Cite reg. 3(ג) where the clause is reg. 3(ב)."),
 ("IRA-09, TXI-17, TXK-04, TXS-07, TXS-09, TXS-12, CS-05, CS-16, KH-01, PF-06, TXA-27", "A company's term or practice worded as if it were general."),
 ("CS-27", "The 2022 circular re-issued the annual-statement template: one row now reads 'ששולמו עבור העמית' where the record has 'שנגבו מהעמית'."),
 ("CAT-35", "'An empty field is not zero' rests on CAT-40, which is not a record in data/rules."),
 ("GOV-03, MF-32, MF-34, MF-37, MF-39", "Call Bank of Israel directive 447A a draft; the cited file is the final 04/25 version."),
 ("CAT-10", "Its five `datastore_search_sql` links now return an HTML page, not data."),
]
for i, t in SER:
    w(f"- **{i}**: {t}")
w("")
w("Recurring, lower-stakes classes: text that still says a law 'was read on Wikisource / Nevo / a copying site' although the sources are now Knesset, Reshumot or gov.il files (44 records mention it, across PEN, SW, TXP, GOV, ETF, PF, KGL, KH, IRA); source kinds mislabelled (TASE brochures and site terms as `exchange_rules`, Banking Rules as `regulator_page` in one place and `regulation` in another, bills as `law`); wrong page numbers (TXA-28, TXF-04, TXF-22, TXS-15); sources with no Hebrew title (`title_he` empty on 117 sources in 63 records; the English `title` is always there); figures from a PDF whose text layer garbles digits (PEN-15, the Codex part 6 file), which a script check of a figure will always fail.")
w("")
w("Every record's text issue in full is in `review.json`; the list below gives the start of each.")
w("")
w("| Record | Issue |")
w("|---|---|")
for v in ti:
    w(f"| {v['id']} | {cell(v['text_issue'], 240)} |")
w("")
w("## 8. Files")
w("")
w("- `review.json`: one entry per record: `id`, `scope`, `institutions`, `general_source` (quote, URL, locator, how it was read), `settle`, `split`, `company_doc_needed`, `note`, `text_issue`, `reviewed_by`, `quote_check`.")
w("- `tools/`: `bundle.py` and `ref.py` (the bundles without the editor's scope material), `helper-brief.txt` (what each helper was told), `src.py` (fetch, read and search a source; strike-through and tracked deletions in Word files are dropped), `verify_quotes.py` (the quote check), `cat09_join.py`, `cat24_spread.py`, `cat39_pairs.py` (checks over every row), `g0_verdicts.py` (the reviewer's CAT verdicts), `merge.py`, `compare.py`, `gen_review_md.py`. `tools/work/` holds the bundles, each group's verdict file and `compare.json`.")
w("- The fetched sources are cached in the session scratchpad, not in the repo.")
open(os.path.join(HERE, "..", "review.md"), "w").write("\n".join(L) + "\n")
print("review.md:", len(L), "lines")
