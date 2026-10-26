"""Apply the 2026-10-26 closures (SW OQ1, OQ5, OQ10, OQ16; TXA OQ15) to the il-finance references. Each replacement must match once.
usage: python3 -I apply_closures.py <references dir>"""
import re, sys
from pathlib import Path
ref = Path(sys.argv[1])

POA18 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-721/he/regulation_h_2018-10-8.pdf"
POA16 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1048/he/regulation_h_2016-10-12.pdf"
REGS12 = "https://olaw.org.il/takanot/takanot-7157.pdf"
C2018923 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-730/he/regulation_h_2018-9-23.pdf"
C2020 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-530/he/regulation_h_2020-9-2-clean.pdf"
BOIFEES = "https://boi.org.il/information/fees/"

def edit(path, pairs):
    p = ref / path
    t = p.read_text(encoding="utf-8")
    for old, new in pairs:
        n = t.count(old)
        if n != 1:
            sys.exit(f"{path}: expected one match, found {n}: {old[:80]!r}")
        t = t.replace(old, new)
    p.write_text(t, encoding="utf-8")

def line_starting(path, prefix):
    for line in (ref / path).read_text(encoding="utf-8").splitlines():
        if line.startswith(prefix):
            return line
    sys.exit(f"{path}: no line starting {prefix!r}")

def source_line_after(path, heading):
    lines = (ref / path).read_text(encoding="utf-8").splitlines()
    i = next(k for k, l in enumerate(lines) if l.startswith(heading))
    return next(l for l in lines[i + 1:] if l.startswith("- Source:"))

sw = "switching-and-transfers.md"
txa = "tax-insurance-and-amendment-190.md"

sw17_src = source_line_after(sw, "### SW-17 ")
sw18_rule = line_starting(sw, '- Rule: "מערכת סליקה פנסיונית מרכזית תמסור ללקוח')
sw18_src = source_line_after(sw, "### SW-18 ")
sw33_src = source_line_after(sw, "### SW-33 ")
sw41_src = source_line_after(sw, "### SW-41 ")
txa19_src = source_line_after(txa, "### TXA-19 ")

edit(sw, [
    # SW-17: removing an agent (open question 16)
    ("  - No source was found on how a member removes an agent already attached to an account (open question 16).",
     "  - Removing an agent (open question 16, closed 2026-10-26): the client sends a written cancellation to the institution, or to the agent, who passes it on \"תוך חמישה ימי עסקים\". The institution treats the earlier power of attorney as void \"החל מתום חמישה ימי עסקים\" from receiving the notice, and within three business days if the client sent it through the pension clearing house; it tells the agent in writing within three business days of the cancellation. A new continuing power to another licensee cancels an earlier one over the same product, except an information-only power. An all-products continuing power (annex ב1) also covers a product the client later joins directly, for up to ten years, unless cancelled. Exception: a managing company that bought insurance cover for an active member keeps its earlier power (CMA circular 2016-10-12 as amended by 2018-10-8, s.5(ד) to (י); annex ב1 ss.1, 3). A draft circular of 30.11.2025 proposes a change; it was not final on 2026-10-26."),
    (sw17_src, sw17_src + f"; [חוזר סוכנים ויועצים 2018-10-8 – ייפוי כוח לבעל רישיון – תיקון (רשות שוק ההון)]({POA18}) p.7, s.5(ד) to (י); pp.12-13, annex ב1 ss.1, 3 \"יראה בייפוי הכוח הקודם כבטל, החל מתום חמישה ימי עסקים\" · checked 2026-10-26 · primary"),
    # SW-18: how the clearing house checks it is you (open question 5)
    ('Regulations are to cover "בדיקת קיומה של בקשה מטעם הלקוח או של ייפוי כוח" (s.31טז(ד)(1)).',
     'Regulations are to cover "בדיקת קיומה של בקשה מטעם הלקוח או של ייפוי כוח" (s.31טז(ד)(1)), and they do (open question 5, closed 2026-10-26): the clearing house identifies a client by "תעודה אלקטרונית לאימות" or "אמצעי זיהוי חד־ערכי אישי אחר של הלקוח כפי שיורה הממונה" (2012 regulations, reg. 17(ג)); the CMA says the most common method combines an ID number with credit-card details, and an identifier can also be collected in person (circular 2018-9-23, s.1). It handles a licensee\'s request for a client\'s information from all institutions "רק אם הציג לפניה ייפוי כוח תקף ... התואם את הבקשה" (reg. 18(א)), and checks the power\'s authenticity by a certificate or another unique identifier of the client (reg. 18(ג)). A one-time information power (annex א of the power-of-attorney circular) lasts three months and is not sent to the clearing house (circular 2016-10-12 as amended by 2018-10-8, ss.4(ב), 5(א), 6(ב)).'),
    (sw18_src, sw18_src + f"; [תקנות הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים) (אבטחת מידע במערכת סליקה פנסיונית מרכזית), התשע\"ב-2012, קובץ התקנות 7157 (עותק הסריקה באתר olaw)]({REGS12}) gazette p.1629, regs. 17(ג), 18(א), 18(ג) · checked 2026-10-26 · primary (third-party scan of the gazette); [חוזר גופים מוסדיים 2018-9-23 – אימות זהות לקוח על ידי מערכת סליקה פנסיונית מרכזית]({C2018923}) p.1, s.1 · checked 2026-10-26 · primary; [חוזר סוכנים ויועצים 2018-10-8 – ייפוי כוח לבעל רישיון – תיקון]({POA18}) ss.4(ב), 5(א), 6(ב) · checked 2026-10-26 · primary"),
    # SW-33: the supervised price (open question 10)
    ("The rules make the same-client price a supervised item but do not state the amount. The order that sets the supervised price was not found (open question 10);",
     "The rules make the same-client price a supervised item but do not state the amount. The Bank of Israel's own page on fees states it: \"סכום העמלה המרבי שניתן לגבות בעד השירות יהיה 5 שקלים חדשים, בתוספת החזר ההוצאה ששילם התאגיד הבנקאי לצד שלישי (כגון: בורסה או ברוקר בחו\"ל) בשל ביצוע השירות\", for a move \"מחשבון בבנק אחד לחשבון אותו לקוח בגוף פיננסי אחר\", including to a joint account the client is one of the owners of (open question 10, closed 2026-10-26);"),
    ("- Figures: NIS 10 cap on closing (rules, consolidated to 9.4.2025).",
     "- Figures: NIS 5 for the service plus the third party's cost, to the same client's account at another financial body (Bank of Israel fees page, read 2026-10-26); NIS 10 cap on closing (rules, consolidated to 9.4.2025)."),
    (sw33_src, sw33_src + f"; [בנק ישראל, מידע ושירות לציבור: עמלות]({BOIFEES}), section \"העברת ניירות ערך לחשבון אחר של אותו לקוח בגוף פיננסי אחר\" \"סכום העמלה המרבי שניתן לגבות בעד השירות יהיה 5 שקלים חדשים\" · checked 2026-10-26 · primary"),
    # SW-41: which circular is in force (open question 1)
    ("Which number the CMA treats as the circular in force, and whether 2017-9-17 has been amended since, was not settled (open question 1, narrowed): the 2016-9-11 text was not opened.",
     "The circular in force is 2016-9-11 (19.7.2016). 2017-9-17 (2.10.2017) is its amendment, and 2020-9-2 (1.3.2020) amended it again and attached a consolidated text (circular 2020-9-2, p.1, ss.1-2). The CMA's regulation collector lists nothing later under \"העברת כספים בין קופות גמל\": its latest item there is of 3.3.2020 (searched in a browser 2026-10-26) (open question 1, closed 2026-10-26)."),
    (sw41_src, sw41_src + f"; [חוזר גופים מוסדיים 2020-9-2 – העברת כספים בין קופות גמל – תיקון]({C2020}) p.1, ss.1-2 · checked 2026-10-26 · primary"),
])

# The open-question list of the switching file: strike the four answered items.
closures = {
    "1. ": "1. ~~**Current version of circular 2017-9-17.**~~ Closed 2026-10-26: the circular is 2016-9-11, amended by 2017-9-17 and by 2020-9-2 with a consolidated text; the CMA's collector lists nothing later (SW-41).",
    "5. ": "5. ~~**Clearing house: how consent is checked.**~~ Closed 2026-10-26: by an electronic certificate or another unique identifier the Commissioner sets, in practice ID number and credit-card details; an agent's request only against a valid matching power of attorney (2012 regulations, regs. 17(ג), 18; circular 2018-9-23; SW-18). The price of a direct request is SW-44.",
    "10. ": "10. ~~**The supervised price for moving securities.**~~ Closed 2026-10-26: at most NIS 5 for the service plus the third party's cost, to the same client's account at another financial body (Bank of Israel fees page; SW-33).",
    "16. ": "16. ~~**Removing an agent already attached to a provident account.**~~ Closed 2026-10-26: a written cancellation voids the agent's power after five business days, or three through the clearing house; an all-products power also covers a product joined directly later, until cancelled (power-of-attorney circular 2016-10-12 as amended by 2018-10-8, s.5; SW-17).",
}
p = ref / sw
lines = p.read_text(encoding="utf-8").splitlines(keepends=True)
start = next(k for k, l in enumerate(lines) if l.startswith("1. **Current version of circular 2017-9-17.**"))
done = set()
for k in range(start, len(lines)):
    for prefix, new in closures.items():
        if prefix not in done and lines[k].startswith(prefix) and "~~" not in lines[k][:12]:
            lines[k] = new + "\n"
            done.add(prefix)
if done != set(closures):
    sys.exit(f"switching open questions: replaced {sorted(done)} of {sorted(closures)}")
p.write_text("".join(lines), encoding="utf-8")

# TXA-19 and open question 15
ORD = "https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf"
edit(txa, [
    ("The promised circular on the recognized annuity was not found (open question 12).",
     "The promised circular on the recognized annuity was not found (open question 12). The surtax (open question 15, closed 2026-10-26): the relative profit component taxed at 15% is taxable income for s.121ב, which applies \"על אף האמור בכל חיקוק\", and the Tax Authority applies the surtax to income taxed at a limited rate (instruction 5/2025 s.2; instruction 9/2015 s.4). So it counts toward the surtax threshold and bears the 3% above it. It is not income from a capital source for the further 2% (s.121ב(א1)) when the annuity is one of paras (1) to (4) of \"הכנסה מיגיעה אישית\" in s.1, which counts \"סכום המתקבל עקב היוון קיצבה\" of such an annuity as personal-exertion income; para (2) is an annuity from a provident fund for annuity \"בשל עבודה, או מכוח חברות בה במשך חמש שנים לפחות\". A commutation outside those paragraphs would be capital-source income. See TXG-10."),
    (txa19_src, txa19_src + f" [פקודת מס הכנסה, נוסח משולב (רשות המסים)]({ORD}) p.201, s.121ב(ג), (ה) · checked 2026-10-26 · primary. [חוק לתיקון פקודת מס הכנסה (תיקון מס' 274), 2024 (ספר החוקים)](https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf) p.2, s.1(2)(ג), (ה)(3): s.121ב(א1) and \"הכנסה חייבת ממקור הוני\" · checked 2026-10-26 · primary. [רשות המסים, הוראת ביצוע 5/2025](https://www.gov.il/BlobFolder/policy/inst-05-2025/he/IncomeTax_inst-05-2025.pdf) pp.1-2, s.2 · checked 2026-10-26 · primary. [הוראת ביצוע 9/2015 (עותק באתר capitax)](https://www.capitax.co.il/Attachments/08032016.pdf) p.3, s.4 · checked 2026-10-26 · secondary (third-party copy; gov.il copy not found)"),
    ("14 and 15 (NII and surtax on the result).",
     "14 (NII on the result); 15, the surtax, closed 2026-10-26 (TXA-19)."),
])
t = (ref / txa).read_text(encoding="utf-8")
m = re.search(r"^15\. \*\*Surtax and brackets\*\*.*$", t, re.M)
if not m:
    sys.exit("txa: question 15 line not found")
t = t[:m.start()] + "15. ~~**Surtax and brackets**: does the 15% commutation income count toward s.121B surtax, and is it \"income from capital sources\" for the extra 2%?~~ Closed 2026-10-26: it counts toward the 3% surtax; it is not capital-source income for the 2% when the annuity is personal-exertion income under s.1 paras (1) to (4) (TXA-19)." + t[m.end():]
(ref / txa).write_text(t, encoding="utf-8")
print("applied")
