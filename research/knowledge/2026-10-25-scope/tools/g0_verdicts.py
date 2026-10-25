#!/usr/bin/env python3
"""g0_verdicts.py: the reviewer's own verdicts for the CAT records (group G0), written to work/verdicts-G0.json."""
import json, os

C = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf"
DICT = "https://data.gov.il/api/3/action/datastore_search?resource_id=76ad9eed-d076-46d6-96e2-a4eb8e045444&limit=100"
LIST = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_word.docx"
TASE = [{"name": "Tel Aviv Stock Exchange", "name_he": "הבורסה לניירות ערך בתל אביב"}]


def gen(quote, url, loc, read="fetched"):
    return {"quote": quote, "url": url, "locator": loc, "read": read}


V = [
 {"id": "CAT-06", "scope": "general",
  "general_source": gen("שיעור דמי ניהול ממוצעת שנתי – נכסים", DICT, "field dictionary, row 18 AVG_ANNUAL_MANAGEMENT_FEE (row 19 AVG_DEPOSIT_FEE: \"שיעור דמי ניהול ממוצעת- הפקדות\")"),
  "company_doc_needed": False,
  "note": "The fields and their names are the CMA's own dataset (general, true for every row). The text no longer uses Meitav's period label; the period is carried by CAT-36 from the CMA portals and circulars, so the Meitav page adds nothing to the current text.",
  "text_issue": "\"The value changes every January\" rests on two Meitav tracks in the data plus CAT-36; say so or point to CAT-36. The Meitav reports page can be dropped."},
 {"id": "CAT-09", "scope": "general",
  "general_source": gen("מספר מס הכנסה של קופת הגמל. זיהוי יחודי לקופה.", DICT, "field dictionary, row FUND_ID; and the circular's model form, p.10: \"שם מסלול ההשקעה בו חוסך העמית ,ומספר מס הכנסה של המסלול\" (" + C + ")"),
  "company_doc_needed": False,
  "note": "Statement about how the regulator's dataset is built, true for every row. Checked over every row, not one company: cat09_join.py found all 764 distinct Gemel-Net FUND_IDs of 202609 among the 790 track numbers ('מספר מסלול השקעה') of the CMA's own transfer_bank dataset (85 of them are also a fund number, i.e. the fund and track share a number). So the CMA's transfer_bank dataset proves the claim and Meitav's merger notice is only a named example.",
  "text_issue": "The text names the transfer dataset ('קובץ ההעברות הבנקאיות') but does not cite it; cite https://data.gov.il/api/3/action/package_show?id=transfer_bank (CMA, 'פרטי קופות לצורך העברת כספים בין גופים מוסדיים') in place of Meitav's notice."},
 {"id": "CAT-10", "scope": "general",
  "general_source": gen("האם מיועדת לכלל האוכלוסייה או לעובדי מפעל/גוף מסויים (ענפיות)", DICT, "field dictionary, row TARGET_POPULATION; rows FUND_CLASSIFICATION and SPECIALIZATION list the value sets"),
  "note": "Field values of the regulator's dataset; general. Source [5] (Meitav's 2023 rows) is an example of the null specialization before 2024.",
  "text_issue": "The five datastore_search_sql links now return an HTML page instead of JSON (tested 2026-10-26), so they no longer reproduce the values; use datastore_search with filters or fields."},
 {"id": "CAT-15", "scope": "general",
  "general_source": gen("שמו של מסלול השקעה יותאם למדיניות ההשקעה התקנונית בהתאם למפורט ברשימת מסלולי ההשקעה", C, "p.7, s.9(א)"),
  "note": "CMA circular; binds every institution.",
  "text_issue": "Stale: 'הרשימה עצמה לא הושגה'. The CMA list is on gov.il: 'רשימת מסלולי השקעה' (20.12.2022) https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-6545/he/list-of-investment-tracks_pdf.pdf and its amendment of 16.4.2024 https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_PDF.pdf (found by gov.il site search). The per-name policies can now come from the CMA, not from company bylaws."},
 {"id": "CAT-16", "scope": "general",
  "general_source": gen("בשם מטעה או העולה ממנו הבטחה להשגת או עמידה בקריטריון איכותי או כמותי או בשם שניתן להסיק ממנו על אופן ניהול ההשקעות בקופה או במסלול .לדוגמא :בטוחה ,רווחית ,סולידית ,יציבה ,איתנה ,אגרסיבית", C, "p.7, s.8"),
  "note": "CMA circular."},
 {"id": "CAT-17", "scope": "general",
  "general_source": gen("מסלול כללי – מסלול השקעה שאינו מסלול מתמחה ,אינו מסלול ברירת מחדל ואינו מסלול למקבלי קצבה", C, "pp.2-3, s.2 (definitions, clusters 1-5)"),
  "company_doc_needed": False,
  "split": "The closing clause 'הקיבוץ של הראל לשמות הסטנדרטיים לא מלא' is a statement about Harel's own web page: drop it, or move it to an institution record (Harel). The standard track names under each cluster are in the CMA list (notice-2023-069, e.g. 'אשכול 4 - מסלולים עוקבי מדדים ... מסלול עוקב מדדים – גמיש'), which replaces Harel's grouping as the source.",
  "note": "Definitions and clusters are the CMA circular's. The category names 'in the data' come from Gemel-Net's SPECIALIZATION values (general dataset). Harel's page is used only to say Harel's own grouping is incomplete."},
 {"id": "CAT-18", "scope": "general",
  "general_source": gen("גוף מוסדי יקבע בתקנון קופת גמל להשקעה או בפוליסה שאינה קופת ביטוח ,מסלול השקעה ברירת מחדל", C, "p.6, s.7(ב)"),
  "note": "CMA circular."},
 {"id": "CAT-19", "scope": "general",
  "general_source": gen("החל ביום התחילה יצרף גוף מוסדי עמית חדש לאחד ממסלולי ברירת המחדל המתאים לגילו ,אלא אם כן ביקש עמית חדש להצטרף למסלול אחר", C, "p.4, s.4(ב)"),
  "note": "CMA circular.",
  "text_issue": "The closed general track is cited to s.3(ד), which by its words is about 'פוליסות ביטוח שהן קופות ביטוח ששווקו לפני שנת 2004'. For annuity provident funds the CMA says it in the 2024 list amendment's explanatory part: 'המסלול הכללי (שסגור למצטרפים חדשים בקופות גמל לקצבה)' (" + LIST + "). Cite that, or narrow the sentence."},
 {"id": "CAT-20", "scope": "general",
  "general_source": gen("עמית שבחר במסלול השקעה כספי יבחר בעת הצטרפותו למסלול כלהלן", C, "p.6, s.6א(א)"),
  "note": "CMA circular. Whether s.6א reaches a kupat gemel lehashkaa stays open, as the record says."},
 {"id": "CAT-23", "scope": "general",
  "general_source": gen("נכסי המסלול יהיו חשופים לנכסים הבאים אשר אינם צמודים ואינם חשופים לסיכוני מטבע (פרט למטבע השקל החדש): פיקדונות שקליים, מלוות ממשלתיות נקובות בש\"ח, הלוואות שקליות ואג\"ח שקליות (סחירות ושאינן סחירות), בשיעור שלא יפחת מ-75% ולא יעלה על 120% מנכסי המסלול", LIST, "CMA 'רשימת מסלולי השקעה – תיקון' (16.4.2024), cluster 1, 'מסלול כספי (שקלי)'; the same list carries 'מסלול אשראי ואג\"ח', 'אשראי ואג\"ח עם מניות (עד 25% מניות)', 'מסלול עוקב מדדים – גמיש', 'מסלול כללי' and the age-dependent tracks"),
  "company_doc_needed": False,
  "note": "Searched: web search for 'רשימת מסלולי השקעה' and '2024-1471' (only company documents, which cite '2024-1471 רשימת מסלולי השקעה - תיקון מיום 17.4.2024'); then gov.il site search through govil-page.sh, which lists the CMA items notice-2022-6545 (the list, 20.12.2022), notice-2023-069 (the amendment, 16.4.2024) and notice-2022-1117 (draft). The amendment's Word file holds every policy text the record quotes from Meitav (struck-through text excluded). So the content is the CMA's, binding on every manager by circular 2022-9-30 s.9(ב). The record's own sources are only Meitav's: general once re-sourced.",
  "text_issue": "Title and text say the CMA list was not read and the content is 'unsettled'; re-source to the CMA list and compare each track's wording with it (the 2024 amendment, for example, adds governments and deposits explicitly to 'אשראי ואג\"ח' and a 75% debt condition on debt funds from 1.7.2024, and removed 'מתמחה גמיש'). Meitav can stay as a named example."},
 {"id": "CAT-24", "scope": "general",
  "general_source": gen("מדיניות ההשקעה התקנונית – מדיניות ההשקעה הקבועה בתקנון הקופה במקרה של קופת גמל שאינה קופת ביטוח ,או בנספח מסלולי ההשקעה במקרה של קופת ביטוח או של פוליסה שאינה קופת ביטוח; מדיניות השקעה צפויה – כמשמעותה בחוזר גופים מוסדיים ,2009-9-13", C, "p.2, s.2 (definitions)"),
  "company_doc_needed": False,
  "note": "The distinction is the circular's. 'The same standard name differs widely between managers' has a general basis in the CMA's own data over every manager: cat24_spread.py, Gemel-Net 202609, 'משולב סחיר' in kupat gemel lehashkaa: 11 managers, equity exposure 23.9% (Ayalon) to 99.1% (Infinity) of assets, foreign exposure 1.2% (Meitav) to 109.4% (Analyst); Harel's own row (15288) shows 97.9% foreign. Meitav's notice may stay as a named example; Harel's page is not needed.",
  "text_issue": "Meitav's page is titled 'שינוי מדיניות השקעה תקנונית': the regulatory policy itself changed under the same name (within the CMA list's bounds), which is not the same as the actual mix moving within an unchanged policy, as the sentence says. Replace the Meitav-versus-Harel comparison with the count over every manager from the CMA data."},
 {"id": "CAT-35", "scope": "general",
  "general_source": gen("שיעור דמי ניהול ממוצע שנתי - נכסים % כולם נמוך - עד 0.5 בינוני - מעל 0.5 עד 1", "https://gemelnet.cma.gov.il/views/gemelTsuot.aspx", "Gemel-Net report form, advanced-search filter"),
  "note": "CMA portals and dataset; general.",
  "text_issue": "'שדה ריק אינו אפס' rests on CAT-40, which is not a record in data/rules (dangling reference); none of CAT-35's sources supports it."},
 {"id": "CAT-36", "scope": "general",
  "general_source": gen("את הדיווח יש להגיש עד ליום ה-15 בינואר של כל שנה עוקבת לשנת הדיווח", "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1703/he/regulation_2002-11.pdf", "p.2, s.6; with circular 2003/13 p.2 field 'שיעור דמי ניהול שנתיים שגבתה הקופה'"),
  "note": "General: CMA portals, datasets and circulars. The portal label 'לשנת 2025' appears only in a submitted report, which curl cannot reproduce (recorded from the Chrome reading); the earlier-years mapping is an inference, as the record says."},
 {"id": "CAT-37", "scope": "general",
  "general_source": gen("יש לפרט את שיעור דמי הניהול הממוצעים שגבתה קרן הפנסיה בפועל מכלל העמיתים באותה הקרן בשנת הדוח", "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf", "p.128, pension annual report s.7"),
  "note": "CMA circular; the identity with the dataset field is an inference, as the record says."},
 {"id": "CAT-38", "scope": "general",
  "general_source": gen("שיעור דמי ניהול רבעוניים שנוכו מסך נכסי הקרן", "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1446/he/regulation_h_2015-9-9.pdf", "p.15, s.5ה(6) (KT948); p.20 table"),
  "note": "CMA circular."},
 {"id": "CAT-39", "scope": "general",
  "general_source": gen("dataset check, no sentence: cat39_pairs.py over Pension-Net 202609 (293 track rows, 18 funds) finds one non-empty fee pair per fund", "https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&limit=1000&filters={\"REPORT_PERIOD\":202609}", "every row, grouped by PARENT_COMPANY_ID", "fetched (dataset count)"),
  "note": "A statement about how the regulator's dataset is built, checked over every row.",
  "text_issue": "Four funds (Altshuler Shaham new and general, Mor new and general) also have tracks with empty fees, so 'every track carries the fund's pair' holds for the tracks that have a value. The Pensia-Net 'מושגים' page did not return the quoted 'עד 6%' to curl (script-rendered)."},
 {"id": "CAT-42", "scope": "institution", "institutions": TASE,
  "note": "Judgement call. The only source is TASE's own platform (Maya): its filter panel, its export button and the counts its filters return. No law or exchange rule is involved. The counts are a count over every fund (they belong in data/ as a count, which TASE's terms bar from republishing, CAT-43); the download path is TASE's own channel. If counts read from the exchange's official list are treated as general, as the market-list records ETF-43 and BRK-32 were by another helper, this becomes general with 'recorded only' (Maya is script-rendered and cannot be fetched by curl).",
  "text_issue": "Source kind 'institution_doc' with strength 'primary' is inconsistent; the page is not fetchable by curl, so the counts rest on the Chrome reading."},
 {"id": "CAT-43", "scope": "institution", "institutions": TASE,
  "note": "TASE's terms of use for its websites are the company's own contract terms as a site operator, not the exchange's rulebook or guidelines approved by the Securities Authority.",
  "text_issue": "Source kind 'exchange_rules' is wrong: website terms of use are not exchange rules."},
]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "work", "verdicts-G0.json")
json.dump(V, open(out, "w"), ensure_ascii=False, indent=1)
print(len(V), "verdicts written to", out)
