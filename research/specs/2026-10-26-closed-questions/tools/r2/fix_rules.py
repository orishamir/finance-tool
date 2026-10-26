"""r2 (2026-10-26): rule records whose Hebrew or notes still call a closed question open, aligned with the references.
Each replacement asserts its old text, so a re-run on changed data fails loudly instead of guessing."""
import json, pathlib
R = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/data/rules')

def edit(rid, fn):
    p = R / f'{rid}.json'
    d = json.loads(p.read_text())
    fn(d)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print('edited', rid)

def rep(s, old, new):
    assert old in s, (old[:80], s[:200])
    return s.replace(old, new)

# KH-12: the s.3 reading is the law's own definition (KH OQ8 and TXH OQ5 closed 2026-10-26)
def kh12(d):
    d['text_he'] = ("פקודת מס הכנסה מגדירה את 'גיל הפרישה' בהפניה לחוק גיל פרישה, והחוק נותן את השם 'גיל הפרישה' רק לגיל שבסעיף 3: "
                    "גיל לגברים וגיל לנשים, עם לוח של גילים נמוכים יותר לנשים לפי תאריך לידה. לגיל הפרישה המוקדמת ולגיל פרישת החובה "
                    "החוק נותן שמות אחרים, ולכן זה הגיל שמקצר את תקופת ההמתנה; רשות המסים מציגה את לוח הגילים לנשים כשינוי ב'גיל הפרישה'.")
    f = d['figures']
    f['retirement_age_men']['notes'] = rep(f['retirement_age_men']['notes'],
        "Inference from the Ordinance's defined term (tax-hishtalmut.md open question 5; keren-hishtalmut.md open question 8).",
        "The law names only this age \"גיל הפרישה\" (s.3; the early age is \"גיל הפרישה המוקדמת\", s.5, and the mandatory age \"גיל פרישת חובה\", s.4), so the Ordinance's term points here (tax-hishtalmut.md open question 5 and keren-hishtalmut.md open question 8, closed 2026-10-26).")
    f['retirement_age_women']['notes'] = rep(f['retirement_age_women']['notes'], "Same inference as retirement_age_men.",
        "Same s.3 age as retirement_age_men; the Tax Authority prints the women's schedule as the change in \"גיל הפרישה\" (deductions booklet 2026, p.7).")
edit('kh-12', kh12)

# TXH-10: the 3-year route opens at the s.3 age (TXH OQ5 closed 2026-10-26); study evidence stays open (TXH OQ6)
def txh10(d):
    d['text_he'] = rep(d['text_he'], "'גיל הפרישה' מוגדר בפקודה לפי חוק גיל פרישה; איזה גיל מהחוק חל, ואיזה אישורים הקרן דורשת להשתלמות, לא ממוקרים.",
        "'גיל הפרישה' מוגדר בפקודה לפי חוק גיל פרישה, והחוק נותן את השם הזה רק לגיל שבסעיף 3, לגברים ולנשים, עם לוח לנשים לפי תאריך לידה; "
        "לגיל הפרישה המוקדמת ולגיל פרישת החובה הוא נותן שמות אחרים, ולכן המסלול המקוצר נפתח בגיל שבסעיף 3. איזה אישורים הקרן דורשת להשתלמות לא ממוקר.")
    n = d['figures']['lock_years']
    n['notes'] = rep(n['notes'], "Which age in the Retirement Age Law applies is open question 5 (KH-12 infers s.3: 67 men, 65 women).",
        "The retirement age is the s.3 age of the Retirement Age Law (67 men, 65 women, with a schedule for women born up to 1969), the only age that law names \"גיל הפרישה\" (KH-12; open question 5 closed 2026-10-26).")
edit('txh-10', txh10)

# TXP-11: circular 4/2019 applies the ceiling monthly (TXP OQ5 closed 2026-10-26)
def txp11(d):
    n = d['figures']['severance_ceiling']
    n['notes'] = rep(n['notes'], "How the \"salary on the deposit date\" limb is applied over a year is open question 5.",
        "Income Tax circular 4/2019 s.2.1.1 applies it monthly: the lower of the salary on the deposit date times 8.33% and 1/12 of this yearly amount, tested on all employers' severance deposits together (open question 5 closed 2026-10-26).")
edit('txp-11', txp11)

# TXS-12: a falling CPI does not enlarge the base (TXS OQ15 closed 2026-10-26, answered in TXS-02); requests.md asks the editor to update TXS-12 (e)
def txs12(d):
    d['text_he'] = rep(d['text_he'], "אם ירידת מדד משנה את בסיס המס לא נמצא.",
        "כשהמדד יורד בתקופת ההחזקה, הסכום האינפלציוני הוא אפס ולא שלילי, ולכן המס חל על כל הרווח הנומינלי ולא יותר ממנו, ובהפסד, החלק ששווה לירידת המדד לא מותר בקיזוז .")
edit('txs-12', txs12)

# GOV-13: today's "ממשלתית" series are of this type (GOV OQ4 narrowed: only the 1995 "שחר" text and post-2007 amendments stay open)
def gov13(d):
    n = d['figures']['linkage']
    n['notes'] = rep(n['notes'], "that today's \"ממשלתית\" series fall under them is inferred, not confirmed (GOV open question 4, narrowed).",
        "the Accountant General's bond page lists \"אג\"ח ממשלתית\" (first issued 6.11.2006, interest once a year) as the current fixed-rate type with these regulations, so today's \"ממשלתית\" series are of this type (GOV open question 4 now asks only for the 1995 \"שחר\" base text and amendments after 2007).")
edit('gov-13', gov13)

# TXA-30: the ruling binds no one else (references, 2026-10-26)
def txa30(d):
    d['text_he'] = rep(d['text_he'], "ההחלטה נעשתה בהסכם עם חברה מנהלת אחת, אבל רשות המסים מפרסמת את התמציות כעמדתה במקרים דומים,",
        "ההחלטה לא מחייבת: היא נעשתה בהסכם עם חברה מנהלת אחת ולא מחייבת אף אחד אחר, אבל רשות המסים כותבת שהציבור יכול לצפות שתנהג כך גם בנסיבות דומות,")
edit('txa-30', txa30)

# notes that still called a 2026-10-25 closure open
def pen26(d):
    n = d['figures']['retirement_age_women']
    n['notes'] = rep(n['notes'], "(inference from section 3 and the schedule's last row, open question 20)",
        "(s.3 as amended in 2021; the Tax Authority's 2026 booklet, p.7, gives 65 for women born from January 1970; open question 20 closed 2026-10-25)")
edit('pen-26', pen26)

def txh08(d):
    n = d['figures']['self_employed_benefited']
    n['notes'] = rep(n['notes'], "Conflict: the Chief Economist paper (Oct 2025, p.5 note 11) gives 'about 20,538' for 2025 (open question 3). The mechanism that moved the figure from 2024 to 2025 during the freeze is unknown;",
        "The Tax Authority's notice of 30.4.2025 (in its 2024 and 2025 deductions booklets) updated the amount to 20,566 a year, and the s.120ב(ה) freeze keeps it for 2025 to 2027; the Chief Economist's 'about 20,538' is superseded (open question 3 closed 2026-10-25);")
edit('txh-08', txh08)

def txp10(d):
    n = d['figures']['employer_exempt_pct']
    n['notes'] = rep(n['notes'], "The regulations' version currency is unconfirmed (open question 12).",
        "Reg. 19's rates are quoted from the NII's consolidated copy of the regulations on btl.gov.il (open question 12 closed 2026-10-25).")
edit('txp-10', txp10)

# MF-11: reg. 15's foreign-securities line as a figure, so the guides show it through Num (MF OQ4 closed 2026-10-26)
def mf11(d):
    src = next(s for s in d['sources'] if 'wikisource' in s['url'])
    d.setdefault('figure_names_he', {})['foreign_securities_line'] = "שיעור ניירות הערך הזרים בנכסי הקרן שעד אליו כסף מפדיון מועבר ביום ההוראה"
    d.setdefault('figures', {})['foreign_securities_line'] = {
        "value": 10, "unit": "pct",
        "source": {"url": src['url'], "title": src['title'] + ", reg. 15(א): \"" + src['quote'] + "\"", "publisher": src['publisher'], "strength": "primary-mirror"},
        "checked": "2026-10-26", "effective_from": None, "effective_to": None, "tax_year": None,
        "update_rule": "fixed in regulation", "rule_ids": ["MF-11"], "state": "sourced",
        "notes": "Prices regulations 1994, reg. 15 as amended in 1999: in a fund whose investment policy keeps foreign securities at no more than 10% of net assets, the redemption amount is transferred on the day the distributor must pass the order to the clearing house (law s.46(ג)(1)); in any other fund, on the first trading day after it. Crediting the distributor's and the holder's accounts counts as the transfer (reg. 15(ב)). Read in the Wikisource consolidated text and the 1994 and 1999 gazette scans (open question 4 closed 2026-10-26)."}
    # keep key order: figure_names_he after text_he, figures after likely_to_change, as the neighbours do
    order = ['id', 'title', 'title_he', 'text_he', 'figure_names_he', 'strength', 'dimensions', 'likely_to_change', 'recheck_date', 'figures', 'il_finance_file', 'checked', 'sources', 'derived_from']
    rest = [k for k in d if k not in order]
    nd = {k: d[k] for k in order if k in d}
    nd.update({k: d[k] for k in rest})
    d.clear(); d.update(nd)
edit('mf-11', mf11)
