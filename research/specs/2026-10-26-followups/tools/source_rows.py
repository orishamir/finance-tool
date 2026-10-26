#!/usr/bin/env python3
"""Requests section 7 (2026-10-26): document rows and publishers for the source labels. Run once from the repo root."""
import json
p='data/sources/documents.json'
text=open(p,encoding='utf-8').read()
lines=text.rstrip('\n').split('\n')
assert lines[0]=='[' and lines[-1]==']'
rows=[json.loads(l.rstrip(',')) for l in lines[1:-1] if l.strip()]
byid={r['id']:r for r in rows}
TASE='הבורסה לניירות ערך בתל אביב'
# TASE's own documents: institution_doc, not exchange rules
for rid in ['tase-terms-of-use-2026','tase-nbcm-guide-2026','tase-index-universe','tase-share-weight','tase-datastore-pricelist','tase-ta125-about']:
    byid[rid]['kind']='institution_doc'
new=[
 {"id":"tase-foreign-bank-member-guide-2026","match":["How to become TASE Foreign Bank Member"],"title_he":"How to become TASE Foreign Bank Member (ינואר 2026)","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-remote-member-guide-2026","match":["How to become TASE Remote Member"],"title_he":"How to become TASE Remote Member (ינואר 2026)","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-members-guide-nbcm-he-2026","match":["מדריך לחברות בבורסה - חש\"ב"],"title_he":"מדריך לחברות בבורסה: חבר בורסה שאינו בנק (ינואר 2026)","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-leading-indices-2025","match":["מדדי הבורסה המובילים"],"title_he":"מדדי הבורסה המובילים (חוברת, 12.5.2025)","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-indices-overview","match":["מדדי הבורסה\""],"title_he":"מדדי הבורסה (מרכז הידע של הבורסה)","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-ta35-about","match":["ת\"א-35 אודות המדד"],"title_he":"ת״א-35: אודות המדד","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-ta90-about","match":["ת\"א-90 אודות המדד"],"title_he":"ת״א-90: אודות המדד","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-data-services","match":["שירותי המידע של הבורסה"],"title_he":"שירותי המידע של הבורסה","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-data-hub","match":["רכישת מנוי וגישה ל-דאטה האב"],"title_he":"רכישת מנוי וגישה לדאטה האב של הבורסה","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"tase-data-store","match":["חנות המידע של הבורסה"],"title_he":"חנות המידע של הבורסה","publisher_he":TASE,"kind":"institution_doc","official_url":None},
 {"id":"provident-amendment-15-bill-2016","match":["הצעת חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), התשע\"ו-2016"],"title_he":"הצעת חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), התשע\"ו-2016 (הצעות חוק הממשלה 1029, דברי הסבר)","publisher_he":"הכנסת","kind":"official_pdf","official_url":"https://fs.knesset.gov.il/20/law/20_ls1_323033.pdf"},
 {"id":"supreme-court-moses-2016","match":["ע\"א 3555/15"],"title_he":"ע״א 3555/15 עודד מוזס ואח׳ נ׳ פקיד שומה למפעלים גדולים (פסק דין, 12.9.2016)","publisher_he":"בית המשפט העליון","kind":"other","official_url":None},
 {"id":"cma-kgl-standard-bylaws-2016","match":["תקנון תקני לקופת גמל להשקעה (רשות שוק ההון"],"title_he":"תקנון תקני לקופת גמל להשקעה (רשות שוק ההון, ביטוח וחיסכון, 29.9.2016)","publisher_he":"רשות שוק ההון, ביטוח וחיסכון","kind":"official_pdf","official_url":None},
 {"id":"cma-child-savings-standard-bylaws-2016","match":["תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד (נספח לחוזר"],"title_he":"תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד (נספח לחוזר גופים מוסדיים 2016-9-20)","publisher_he":"רשות שוק ההון, ביטוח וחיסכון","kind":"circular","official_url":None},
 {"id":"ccpc-ics-protection","match":["How does the Investor Compensation Scheme protect"],"title_he":"תוכנית הפיצוי למשקיעים באירלנד: ממה היא מגנה (רשות התחרות והגנת הצרכן של אירלנד)","publisher_he":"רשות התחרות והגנת הצרכן של אירלנד (CCPC)","kind":"regulator_page","official_url":"https://www.ccpc.ie/consumers/money/investing/ics-protection"},
 {"id":"regulators-remuneration-report-2026","match":["מודלי תגמול בפעילות הציבור בניירות ערך"],"title_he":"מודלי תגמול בפעילות הציבור בניירות ערך – דוח סופי, יוני 2026","publisher_he":"הפיקוח על הבנקים, משרד האוצר ורשות ניירות ערך (עותק באתר פאנדר)","kind":"official_pdf","official_url":None},
]
for r in new:
    assert r['id'] not in byid, r['id']
byid['banking-disclosure-rules-1992']['match'].append("(גילוי נאות ומסירת מסמכים)")
for rid in ['provident-rules-1964','withholding-interest-dividend-regulations-2005','withholding-securities-regulations-2002','capital-gain-computation-regulations-2002','study-fund-withholding-regulations-1997','study-fund-accounts-regulations-1993']:
    assert byid[rid]['publisher_he']=='המוסד לביטוח לאומי (נוסח משולב)', rid
    byid[rid]['publisher_he']='שר האוצר (נוסח משולב באתר המוסד לביטוח לאומי)'
rows += new
open(p,'w',encoding='utf-8').write('[\n' + ',\n'.join('  '+json.dumps(r,ensure_ascii=False,separators=(',',':')) for r in rows) + '\n]\n')

q='data/sources/publishers.json'
t=open(q,encoding='utf-8').read()
anchor='  "msci.com": {'
assert anchor in t and '"ccpc.ie"' not in t
t=t.replace(anchor, '  "ccpc.ie": { "publisher": "Competition and Consumer Protection Commission (Ireland)", "publisher_he": "רשות התחרות והגנת הצרכן של אירלנד (CCPC)", "kind": "regulator_page", "mirror": null },\n'+anchor,1)
open(q,'w',encoding='utf-8').write(t)
json.load(open(q)); json.load(open(p))
print('rows', len(rows))
