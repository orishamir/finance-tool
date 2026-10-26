"""Build the data files of the cash-data branch (2026-10-26) from the downloads in work/.
Every figure is read from a downloaded file (Leumi's and Discount's 447A pages, Hapoalim's, Discount's and Mizrahi's 447 feeds,
the Ministry of Finance issuance CSV); only the Meitav Trade tariff lines are copied by hand from the PDF text (quoted in notes).
usage: python3 -I tools/build_records.py <repo-root>"""
import csv
import html
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1])
HERE = Path(__file__).resolve().parent
WORK = HERE.parent / "work"
DATA = ROOT / "data"
TODAY = "2026-10-26"


def write(rel, obj):
    p = DATA / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", p.relative_to(ROOT))


def vo(value, unit, src, *, eff=None, rule_ids=None, notes="", update_rule="provider-set", checked=TODAY):
    o = {"value": value, "unit": unit, "source": src, "checked": checked, "effective_from": eff, "effective_to": None,
         "tax_year": None, "update_rule": update_rule}
    if rule_ids:
        o["rule_ids"] = rule_ids
    o["state"] = "sourced"
    o["notes"] = notes
    return o


# ------------------------------------------------------------------ sources read today
leumi_rows = {json.loads(l)["fund"]: json.loads(l) for l in open(WORK / "leumi-mmf.jsonl", encoding="utf-8")}
disc_mmf = json.load(open(WORK / "discount-mmf.json", encoding="utf-8"))
disc_rows = {r["-Key"]: r for r in disc_mmf["data"]}
DISC_MMF_AT = disc_mmf["lastUpdatedAt"]  # 2026-10-26T10:04:03...
assert DISC_MMF_AT.startswith("2026-10-26"), DISC_MMF_AT

LEUMI_URL = "https://www.leumi.co.il/he/savings/money-market-products"
DISC_MMF_PAGE = "https://www.discountbank.co.il/private/savings-investments/savings-interest/"
DISC_MMF_FEED = "https://www.discountbank.co.il/api/MoneyMarket/MoneyMarketFunds?pageId=2620c969-c063-45bf-8ea4-7efe7b4e5210"


def leumi_src(name, num, col="דמי ניהול קרן"):
    return {"url": LEUMI_URL,
            "title": f"בנק לאומי, 'מוצרי שוק הכסף' (פרסום לפי הוראה 447A), טבלת 'קרנות כספיות שקליות', שורת '{name}, מספר הקרן: {num}' (סוג 'יומיות'), עמודת '{col}'",
            "publisher": "Bank Leumi le-Israel B.M. (Directive 447A display of the fee as reported by the fund manager)",
            "strength": "institution"}


def disc_src(name, num, col):
    return {"url": DISC_MMF_PAGE,
            "title": f"בנק דיסקונט, 'מוצרי שוק הכסף' (פרסום לפי הוראה 447A; הטבלה נטענת בדף מ-{DISC_MMF_FEED}, 'lastUpdatedAt' {DISC_MMF_AT[:16]}), טבלת 'קרנות כספיות שקליות', שורת '{name}' ({num}), עמודת '{col}'",
            "publisher": "Israel Discount Bank Ltd. (Directive 447A display of the figures as reported by the fund manager)",
            "strength": "institution"}


def pct(s):
    m = re.fullmatch(r"(-?\d+(?:\.\d+)?)%", s.strip())
    return float(m.group(1)) if m else None


def num(s):
    return float(s) if s not in (None, "") else None


# ------------------------------------------------------------------ manager pages checked today (fee not printed or not readable)
MANAGER_PAGE = {
    "altshuler": ("https://www.as-invest.co.il/interstedin/קרנות-נאמנות/קרנות-כספיות/",
                  "The manager's page (https://www.as-invest.co.il/interstedin/קרנות-נאמנות/קרנות-כספיות/, read 2026-10-26) lists only each fund's name and TASE number and links its details to Maya and its prospectus to Magna, which block scripts; it prints no fee."),
    "harel": (None, "The manager's site (https://www.harel-group.co.il/investment/mutual-funds/) answered a script with HTTP 466 'הגישה נדחתה' on 2026-10-26; not read (needs a person in a browser)."),
    "meitav": (None, "The manager's mutual-funds page (https://www.meitav.co.il/mutual_funds/, read 2026-10-26) has no fund table and prints no fund's fee; no fund page was found in the site map."),
    "yalin": (None, "The manager's site (https://www.yl-invest.co.il/) returns an Imperva (Incapsula) block page to scripts (2026-10-26); not read."),
    "kesem": (None, "The manager's own site was not located (a search returned only aggregators; ksm.co.il is unrelated), so no manager page was read."),
    "ayalon": (None, "The manager's own site was not located (a search returned only aggregators and news), so no manager page was read."),
    "analyst": (None, "The manager's mutual-funds page (https://www.analyst.co.il/mutual-funds/, read 2026-10-26) has no fund table and prints no fund's fee."),
    "ibi": (None, "The manager's mutual-funds page (https://www.ibi.co.il/mutual-funds/, read 2026-10-26) has no fund table and prints no fund's fee."),
}

# The ten largest shekel daily money-market funds by Discount's 447A feed field 'AssetWorth' (not displayed on the page), 2026-10-26.
DAILY = [
    ("5140918", "altshuler", "אלטשולר - שחם ניהול קרנות נאמנות בע\"מ", ["אלטשולר שחם (00) כספית ניהול נזילות"], "00"),
    ("5127790", "harel", "הראל קרנות נאמנות בע\"מ", [], None),
    ("5136544", "meitav", "מיטב קרנות נאמנות בע\"מ", [], None),
    ("5139258", "yalin", "ילין לפידות - ניהול קרנות נאמנות בע\"מ", ["ילין לפידות (00) כספית ניהול נזילות"], "00"),
    ("5137740", "kesem", "קסם קרנות נאמנות בע\"מ", [], None),
    ("5117700", "ayalon", "איילון קרנות נאמנות בע\"מ", [], None),
    ("5141452", "yalin", "ילין לפידות - ניהול קרנות נאמנות בע\"מ", [], None),
    ("5120852", "analyst", "אנליסט אי.אמ.אס. ניהול קרנות בנאמנות (1986) בע\"מ", [], None),
    ("5137732", "ibi", "אי.בי.אי קרנות נאמנות בע\"מ", [], None),
    ("5127881", "kesem", "קסם קרנות נאמנות בע\"מ", [], None),
]

YL_PROSPECTUS = "https://mayafiles.tase.co.il/rpdf/1629001-1630000/P1629214-00.pdf"
YL_PROSPECTUS_TITLE = "תשקיף קרן חדשה 'ילין לפידות (00) כספית ניהול נזילות' (מספר בורסה 5139258), תאריך התשקיף 26 בנובמבר 2024, ילין לפידות - ניהול קרנות נאמנות בע\"מ (Maya filing 1629214, PDF), עמ' 1"


def daily_fund(n, mkey, manager, extra_names, code):
    lr, dr = leumi_rows[n], disc_rows[n]
    assert lr["section"] == "shekel" and lr["kind"] == "יומיות", lr
    assert dr["CurrencyCode"] == "ILS" and dr["ForexExpose"] == "0" and dr["PeriodLengthInDays"] == "1", dr
    lname, dname = lr["name"], dr["HebName"]
    fee = pct(lr["fee"])
    dfee = num(dr["YearlyManagmentFee"])
    page_url, page_note = MANAGER_PAGE[mkey]
    agree = "the same figure" if dfee == fee else f"{dr['YearlyManagmentFee']} (Leumi prints two decimals; the difference is rounding of the same report)" if abs(dfee - fee) < 0.006 else f"{dr['YearlyManagmentFee']} (CONFLICT)"
    tax_note = ("Exempt tax track: TXS-24 (Maya's export of 2026-10-22 lists two taxable money-market funds, named in TXS-26: 5103403 and 5137559); "
                "this fund is not one of them (its presence in the export was not re-checked). Discount's feed field 'TaxStatusAsMeta' (not displayed on the page) also reads 'פטורה'.")
    if n == "5139258":
        tax_note = "Exempt tax track: the fund's prospectus of 26.11.2024 (TXS-26) prints 'מסלול המס: פטורה'; Discount's feed field 'TaxStatusAsMeta' (not displayed on the page) also reads 'פטורה'."
    fm_notes = (f"Fee as printed on Leumi's Directive 447A page ('{lr['fee']}'), which states 'המידע המוצג הוא בהתאם לדיווח שבוצע על ידי מנהלי הקרנות' and that for daily funds it shows the management fee the managers charge; "
                f"the page's as-of date is filled by script ('{{asOfDate}}') and was not visible, so effective_from is unknown. Discount's 447A feed (lastUpdatedAt {DISC_MMF_AT[:16]}) prints {agree}. "
                f"Whether the figure includes the trustee fee is not stated (read as the manager's fee only). {page_note} {tax_note}")
    if n == "5139258":
        fm_notes += (" CONFLICT, kept as a note: the manager's prospectus of 26.11.2024 prints 'שכר מנהל הקרן: 0.12% מהשווי הנקי השנתי הממוצע של נכסי הקרן' with footnote 4: "
                     "'מנהל הקרן יהיה רשאי להעלות את השכר בקרן ביום 01.01.2026'. Both banks' current displays print 0.19%, so the current figure is the banks' and the prospectus figure is history.")
    src_l = leumi_src(lname, n)
    gen = {"url": LEUMI_URL, "title": f"בנק לאומי, 'מוצרי שוק הכסף' (פרסום לפי הוראה 447A), טבלת 'קרנות כספיות שקליות', שורת '{lname}, מספר הקרן: {n}'",
           "publisher": "Bank Leumi le-Israel B.M.", "strength": "institution"}
    if n == "5139258":
        trustee = vo(0.01, "pct_per_year", {"url": YL_PROSPECTUS, "title": YL_PROSPECTUS_TITLE + ", 'שכר נאמן'", "publisher": "ילין לפידות - ניהול קרנות נאמנות בע\"מ", "strength": "institution"},
                     eff="2024-11-26", rule_ids=["MF-20"],
                     notes="'שכר נאמן: 0.01% מהשווי הנקי השנתי הממוצע של נכסי הקרן' as of the prospectus date (26.11.2024). The manager fee in the same document has since changed (see fixed_management), so this figure may be out of date; no later document was read.")
        prospectus = {"url": YL_PROSPECTUS, "date": "2024-11-26"}
        legal = "קרן פתוחה, קרן כספית (prospectus of 26.11.2024: 'סוג הקרן: קרן פתוחה, קרן כספית'; 'סיווג הקרן בפרסום: קרן כספית, כספית שקלית, כספית שקלית עם קונצרני'); a daily fund (Leumi's 447A table 'יומיות': bought and redeemed on every trading day)"
    else:
        trustee = vo(None, "pct_per_year", gen, rule_ids=["MF-20"], notes=f"Trustee fee not printed on Leumi's or Discount's 447A pages. {page_note}")
        prospectus = {"url": f"https://maya.tase.co.il/he/funds/mutual-funds/{n}", "date": None}
        legal = "קרן נאמנות כספית יומית (daily money-market fund: units bought and redeemed on every trading day, per Leumi's 447A table 'יומיות' and Discount's 'זמין לרכישה / לפדיון בכל יום מסחר'); open/closed form not printed on the pages read"
    names = [lname] + [x for x in [dname] + extra_names if x != lname]
    rec = {
        "id": n,
        "names": {"en": [], "he": list(dict.fromkeys(names)), "tase": [n]},
        "identifiers": {"isin": None, "tase_number": n, "cusip": None, "ticker": {}},
        "manager": manager,
        "domicile": "IL",
        "legal_form": legal,
        "exposure_id": "shekel-cash",
        "currency": "NIS",
        "trading_currency_on_tase": None,
        "distribution_policy": None,
        "tax_status": {"il_fund_tax_track": "exempt", "tase_foreign_fund_90pct_test": None},
        "fees": {
            "fixed_management": vo(fee, "pct_per_year", src_l, rule_ids=["MF-16", "MF-34", "MF-39", "TXS-24"] + (["TXS-26"] if n == "5139258" else []), notes=fm_notes),
            "trustee": trustee,
            "variable_management": vo(None, "pct_per_year", gen, rule_ids=["ETF-14"], notes="Not printed. A variable management fee exists only in tracking funds (ETF-14); a money-market fund is not one, but the prospectus was not read for this purpose, so the value is left null rather than 0."),
            "tracking_difference_12m": vo(None, "pct_per_year", gen, rule_ids=["MF-07"], notes="Not applicable: not a tracking fund (money-market fund, MF-07)."),
            "median_spread": vo(None, "pct_of_trade", gen, rule_ids=["MF-09"], notes="Not applicable: open fund, units bought and redeemed at the manager's price, not traded on the exchange (MF-09, ETF-04)."),
            "fund_level_withholding_drag": vo(None, "pct_per_year", gen, rule_ids=["MF-43", "MF-29"], notes="Shekel money-market fund (Leumi's table 'קרנות כספיות שקליות'); no foreign withholding applies and no computation is made here."),
        },
        "dimensions": {"fund-tax-track": "covered:TXS-24", "liquidity-lockup": "covered:MF-34", "fee-custody": "covered:BRK-17",
                       "fee-management-balance": "covered:MF-16", "protection": "covered:MF-02", "currency": "covered:MF-43"},
        "prospectus": prospectus,
        "exposure_code": code,
        "distribution_fee_type": None,
        "creation_redemption_fee_category": None,
        "snapshot": TODAY,
    }
    write(f"funds/{n}@{TODAY}.json", rec)


# ------------------------------------------------------------------ renewing funds (Discount's 447A page only; Leumi lists none)
def renewing(n, old=None, manager_key=None, manager=None, legal=None):
    dr = disc_rows[n]
    assert dr["PeriodLengthInDays"] == "30" and dr["Name"] == "חודש", dr
    name = dr["HebName"]
    fee, exp, nxt = num(dr["YearlyManagmentFee"]), dr["Value"], dr["LastDealTimeAsFund"]
    page_url, page_note = MANAGER_PAGE[manager_key]
    fm = vo(fee, "pct_per_year", disc_src(name, n, "דמי ניהול קרן (%)"), eff=DISC_MMF_AT[:10], rule_ids=["MF-16", "MF-35", "MF-37", "BANK-15"],
            notes=(f"Fee as printed on Discount's Directive 447A page ('{dr['YearlyManagmentFee']}'); the page says 'המידע המוצג הוא בהתאם לדיווח שבוצע על ידי מנהלי הקרנות'. "
                   f"The same row prints 'שיעור התשואה הצפויה נטו (נומינלי שנתי)' {exp} (the column's note: reported by the manager, not guaranteed, before capital-gains tax and bank fees, net of the management and trustee fees; MF-37) "
                   f"and the next date 'המועד הקרוב לביצוע הפעולות הבאות' {nxt}, renewal '{dr['Renewal']}'. fundRecord has no field for the expected yield or the next date (see the branch report). "
                   f"Leumi's 447A page lists no renewing fund. {page_note} Whether the figure includes the trustee fee is not stated. "
                   "The series' TASE number belongs to this monthly series only; the next series gets its own number (MF-35)."))
    if old:
        rec = json.loads(json.dumps(old))
        rec["names"]["he"] = list(dict.fromkeys(rec["names"]["he"] + [name]))
        rec["fees"]["fixed_management"] = fm
        for k in ("trustee", "variable_management", "tracking_difference_12m", "median_spread", "fund_level_withholding_drag"):
            v = rec["fees"][k]
            v["checked"] = TODAY
            v["notes"] = v["notes"].replace("Leumi's 447A page does not list this series (it shows only renewable funds that report an expected yield).",
                                            "Leumi's 447A page lists no renewing fund; Discount's 447A page prints the management fee only (re-read 2026-10-26).")
        rec["snapshot"] = TODAY
    else:
        gen = {"url": DISC_MMF_PAGE, "title": f"בנק דיסקונט, 'מוצרי שוק הכסף' (פרסום לפי הוראה 447A), טבלת 'קרנות כספיות שקליות', שורת '{name}' ({n})",
               "publisher": "Israel Discount Bank Ltd.", "strength": "institution"}
        rec = {
            "id": n,
            "names": {"en": [], "he": [name], "tase": [n]},
            "identifiers": {"isin": None, "tase_number": n, "cusip": None, "ticker": {}},
            "manager": manager,
            "domicile": "IL",
            "legal_form": legal,
            "exposure_id": "shekel-cash",
            "currency": "NIS",
            "trading_currency_on_tase": None,
            "distribution_policy": None,
            "tax_status": {"il_fund_tax_track": None, "tase_foreign_fund_90pct_test": None},
            "fees": {
                "fixed_management": fm,
                "trustee": vo(None, "pct_per_year", gen, rule_ids=["MF-20"], notes=f"Trustee fee not printed on Discount's 447A page. {page_note}"),
                "variable_management": vo(None, "pct_per_year", gen, rule_ids=["ETF-14"], notes="Not printed; a variable fee exists only in tracking funds (ETF-14), but the prospectus was not read, so left null rather than 0."),
                "tracking_difference_12m": vo(None, "pct_per_year", gen, rule_ids=["MF-07"], notes="Not applicable: not a tracking fund."),
                "median_spread": vo(None, "pct_of_trade", gen, rule_ids=["MF-35"], notes="Not applicable: open fund with liquidity only on the fixed date (MF-35), not exchange-traded."),
                "fund_level_withholding_drag": vo(None, "pct_per_year", gen, rule_ids=["MF-43", "TXS-24"],
                                                  notes="Shekel money-market fund (Discount's table 'קרנות כספיות שקליות'); no foreign withholding; no computation made here. Tax track not printed on the page; Discount's feed field 'TaxStatusAsMeta' (not displayed) reads 'פטורה', and this series' presence in the 2026-10-22 Maya export behind TXS-24 is not certain, so il_fund_tax_track is left null."),
            },
            "dimensions": {"liquidity-lockup": "covered:MF-35", "fee-custody": "covered:BRK-17", "fee-management-balance": "covered:MF-16",
                           "protection": "covered:MF-02", "currency": "covered:MF-43"},
            "prospectus": {"url": f"https://maya.tase.co.il/he/funds/mutual-funds/{n}", "date": None},
            "exposure_code": None,
            "distribution_fee_type": None,
            "creation_redemption_fee_category": None,
            "snapshot": TODAY,
        }
    write(f"funds/{n}@{TODAY}.json", rec)


# ------------------------------------------------------------------ deposits (Directive 447 publications)
TAX_BUCKET = {
    "value": "unlinked_15", "unit": "text",
    "source": {"url": "https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf",
               "title": "פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים, עמ' 204, סעיף 125ג(ג)(1): 15% על ריבית מנכס שאינו צמוד למדד; read through il-finance TXI-03 and TXI-04 (checked 2026-10-25)",
               "publisher": "Israel Tax Authority (gov.il)", "strength": "primary"},
    "checked": "2026-10-25", "effective_from": None, "effective_to": None, "tax_year": None, "update_rule": "fixed in law",
    "rule_ids": ["TXI-03", "TXI-04", "TXI-08"], "state": "sourced",
    "notes": "Unlinked shekel deposit: interest taxed at 15% of the nominal interest (TXI-03); 'linked' means CPI or exchange rate, so an unlinked or prime-linked shekel deposit is in this bucket (TXI-04); the bank withholds 15% (TXI-08). Copied from the rule base (TXI-03's source, read 2026-10-25), not re-read today.",
}


def deposit(rid, bank, names447, type447, src, eff, term, rate_type, rate, rate_notes, spread, spread_notes, amin, amin_src, amin_notes, amax, amax_src, amax_notes,
            brk, exits, renew, rate_rules):
    rec = {
        "id": rid, "bank": bank,
        "names": {"447": names447, "app": [], "ad": [], "abbrev": []},
        "type_447": type447, "wrapper_id": "bank-deposit",
        "term_months": vo(12, "months", src(term[1]), eff=eff, rule_ids=["BANK-27"], notes=term[0]),
        "rate_type": rate_type,
        "anchor": "prime" if spread is not None else None,
        "spread": vo(spread, "pct_per_year", src(spread_notes[1]), eff=eff, rule_ids=["BANK-25"], notes=spread_notes[0]) if spread is not None else None,
        "rate_offered": vo(rate, "pct_per_year", src(rate_notes[1]), eff=eff, rule_ids=rate_rules, notes=rate_notes[0]),
        "linkage": "none",
        "tax_bucket": json.loads(json.dumps(TAX_BUCKET)),
        "amount_range": {"min": vo(amin, "nis", amin_src, eff=eff, rule_ids=["BANK-27"], notes=amin_notes),
                         "max": vo(amax, "nis", amax_src, eff=eff, rule_ids=["BANK-27"], notes=amax_notes) if amax is not None else None},
        "break": brk,
        "exit_points": exits,
        "auto_renew": renew,
        "snapshot": TODAY,
        "source": src(""),
    }
    write(f"terms/deposits/{rid}.json", rec)


def hapoalim():
    raw = json.load(open(WORK / "hapoalim-dep.json", encoding="utf-8"))
    d = json.loads(raw) if isinstance(raw, str) else raw
    acc = [r for r in d["acceptable"] if isinstance(r, dict)]
    asof = next(r["messageDescription"] for r in acc if r.get("messageDescription"))
    assert "26.10.2026" in asof, asof
    rows = [r for r in acc if r.get("productName") == "פיקדון לשנה" and r.get("currencyCode") == 0 and r.get("linkageTypeDescription") == "ללא הצמדה"]
    fixed = next(r for r in rows if r["interestBaseDescription"] == "קבועה")
    var = next(r for r in rows if r["interestBaseDescription"] == "משתנה")
    page = "https://www.bankhapoalim.co.il/forms/he/savings/deposit-interest"
    feed = "https://www.bankhapoalim.co.il/forms/he/_api/deposit-products-data"

    def src(extra):
        return {"url": page,
                "title": f"בנק הפועלים, 'שיעורי ריבית על סוגי הפיקדונות השקליים המקובלים ועל יתרות זכות בחשבון' (פרסום לפי הוראה 447, {page}; הטבלה נטענת בדף מ-{feed}), '{asof}', טבלת הפיקדונות המקובלים" + (f", {extra}" if extra else ""),
                "publisher": "Bank Hapoalim B.M.", "strength": "institution"}

    amin = int(re.search(r"(\d+)", html.unescape(fixed["amountDescription"])).group(1))
    m = re.fullmatch(r"(\d+(?:\.\d+)?)%", fixed["interestCalculatingDescription"])
    frate = float(m.group(1))
    mv = re.fullmatch(r"(\d+(?:\.\d+)?)% = (\d+(?:\.\d+)?)% - פריים", var["interestCalculatingDescription"])
    vrate, vspread = float(mv.group(1)), -float(mv.group(2))
    common = "renewal column '-' (not printed for one-year types; auto_renew false is the schema's placeholder), exit points 'לא קיימת', break 'אין אפשרות לשבירת הפיקדון', common-deposit column '-'."
    brk = {"allowed": False, "penalty": "not_allowed", "mechanism_text": "'אפשרות לשבירת פיקדון: אין אפשרות לשבירת הפיקדון' (447 table column).", "rule_ids": ["BANK-06"]}
    exits = {"exists": False, "every_months": None}
    renew = {"value": False, "max_renewals": None}
    deposit("hapoalim-pikadon-leshana-kavua", "hapoalim", ["פיקדון לשנה"], "פיקדון לשנה", src, "2026-10-26",
            ("Printed as 'פיקדון לשנה' (a one-year deposit); recorded as 12 months.", "שורת 'פיקדון לשנה' (קבועה, ללא הצמדה)"),
            "fixed", frate,
            (f"Nominal annual rate before tax as printed ('{fixed['interestCalculatingDescription']}') for the fixed unlinked 'פיקדון לשנה' row; {common} "
             f"Sister row: the variable one-year deposit '{var['interestCalculatingDescription']}' (record hapoalim-pikadon-leshana-prime). The publication says 'המידע נכון למועד הצגתו ולפני חישוב מס רווחי הון'.",
             "שורת 'פיקדון לשנה' (קבועה, ללא הצמדה), עמודת שיעור הריבית"),
            None, None,
            amin, src("שורת 'פיקדון לשנה', 'טווח סכום להפקדה'"), f"Printed '{html.unescape(fixed['amountDescription'])}'.", None, None, None,
            brk, exits, renew, ["BANK-13", "BANK-25"])
    deposit("hapoalim-pikadon-leshana-prime", "hapoalim", ["פיקדון לשנה"], "פיקדון לשנה", src, "2026-10-26",
            ("Printed as 'פיקדון לשנה' (a one-year deposit); recorded as 12 months.", "שורת 'פיקדון לשנה' (משתנה, ללא הצמדה)"),
            "variable", vrate,
            (f"Printed '{var['interestCalculatingDescription']}': the offered nominal annual rate before tax ({vrate}%) equals prime less {abs(vspread)} points, fixed for the deposit's life (BANK-25). "
             f"The bank defines prime itself (BANK-34). {common} Sister row: the fixed one-year deposit '{fixed['interestCalculatingDescription']}' (record hapoalim-pikadon-leshana-kavua).",
             "שורת 'פיקדון לשנה' (משתנה, ללא הצמדה), עמודת שיעור הריבית"),
            vspread, (f"Printed '{var['interestCalculatingDescription']}': spread from prime -{abs(vspread)} percentage points.", "שורת 'פיקדון לשנה' (משתנה), המרווח מהפריים"),
            amin, src("שורת 'פיקדון לשנה' (משתנה), 'טווח סכום להפקדה'"), f"Printed '{html.unescape(var['amountDescription'])}'.", None, None, None,
            brk, exits, renew, ["BANK-13", "BANK-25", "BANK-34"])


def discount():
    d = json.load(open(WORK / "discount-dep.json", encoding="utf-8"))
    at = d["lastUpdatedAt"]
    assert at.startswith("2026-10-25"), at
    acc = [r for r in d["data"] if r.get("ProductFamily") == 1]
    fixed = next(r for r in acc if r["ProductCode"] == "0122" and r["ProductName"] == "פקדון לשנה")
    var = next(r for r in acc if r["ProductCode"] == "0213" and r["ProductName"] == "פקדון לשנה")
    others = [r for r in acc if r["ProductName"] == "פקדון לשנה" and r is not fixed and r is not var]
    page = "https://www.discountbank.co.il/private/savings-investments/deposits-savings/classic/interest-rate-tables/"
    feed = "https://www.discountbank.co.il/api/MoneyMarket/Saving?pageId=6c03bad7-2f01-4a73-bcf3-8c3599a58221"
    prime = fixed["CurrentPrimeRate"]

    def src(extra):
        return {"url": page,
                "title": f"בנק דיסקונט, 'פרסום מרוכז - שיעורי ריבית בפקדונות ויתרות זכות בחשבון' (פרסום לפי הוראה 447; הטבלאות נטענות בדף מ-{feed}, 'lastUpdatedAt' {at[:16]}), פריים {prime}%, טבלת 'שיעורי ריבית על סוגי הפיקדונות השקליים המקובלים ועל יתרות זכות בחשבון'" + (f", {extra}" if extra else ""),
                "publisher": "Israel Discount Bank Ltd.", "strength": "institution"}

    def other_line(r):
        o = r["OfferedInterest"]
        sub = f" ({r['OfferedInterestSub']})" if r.get("OfferedInterestSub") not in (None, "") else ""
        return f"code {r['ProductCode']} {r['InterestTypeDesc']}, exit points '{r['ExitPoints']}' {r['ExitPointsFreq']}: {o}{sub}"

    sis = "; ".join(other_line(r) for r in others)
    amin = int(re.search(r"(\d+)", fixed["PlacementAmountRange"]).group(1))
    brk = {"allowed": True, "penalty": "with_penalty", "mechanism_text": f"'אפשרות לשבירת פיקדון: {fixed['ImmediateWithdrawalDesc']}' (447 table column).", "rule_ids": ["BANK-06", "BANK-14"]}
    exits = {"exists": False, "every_months": None}
    renew = {"value": False, "max_renewals": fixed["MaxRenewals"]}
    assert fixed["ExitPoints"] == "ללא תחנות יציאה" and var["ExitPoints"] == "ללא תחנות יציאה"
    assert fixed["ImmediateWithdrawalDesc"] == var["ImmediateWithdrawalDesc"] and var["MaxRenewals"] == fixed["MaxRenewals"]
    m = re.fullmatch(r"p-(\d+(?:\.\d+)?)", var["OfferedInterest"])
    vspread, vrate = -float(m.group(1)), float(var["OfferedInterestSub"])
    deposit("discount-pikadon-leshana-0122", "discount", ["פקדון לשנה"], "פקדון לשנה", src, at[:10],
            (f"Printed 'פקדון לשנה', period '{fixed['MaturityPeriodDesc']}'; recorded as 12 months.", f"שורת 'פקדון לשנה' קוד {fixed['ProductCode']}"),
            "fixed", float(fixed["OfferedInterest"]),
            (f"Nominal annual rate before tax, printed {fixed['OfferedInterest']} for 'פקדון לשנה' code {fixed['ProductCode']} ({fixed['InterestTypeDesc']}, '{fixed['LinkageTypeDesc']}', '{fixed['ExitPoints']}'); "
             f"common-deposit column empty; renewal '{fixed['Renewals']}' ({fixed['MaxRenewals']}); deposit channels '{fixed['AvailablePlacementChannelDesc']}' only. "
             f"Other one-year rows in the same table: {sis}; the prime-linked one without exit points is record discount-pikadon-leshana-prime-0213.",
             f"שורת 'פקדון לשנה' קוד {fixed['ProductCode']}, 'שיעור הריבית המוצעת'"),
            None, None,
            amin, src(f"שורת 'פקדון לשנה' קוד {fixed['ProductCode']}, 'טווח סכום להפקדה'"), f"Printed '{fixed['PlacementAmountRange']}'.", None, None, None,
            brk, exits, renew, ["BANK-13", "BANK-25"])
    deposit("discount-pikadon-leshana-prime-0213", "discount", ["פקדון לשנה"], "פקדון לשנה", src, at[:10],
            (f"Printed 'פקדון לשנה', period '{var['MaturityPeriodDesc']}'; recorded as 12 months.", f"שורת 'פקדון לשנה' קוד {var['ProductCode']}"),
            "variable", vrate,
            (f"Printed '{var['OfferedInterest']}' with {var['OfferedInterestSub']} beside it: the offered nominal annual rate before tax is prime ({prime}%) less {abs(vspread)} points = {vrate}% (BANK-25); "
             f"code {var['ProductCode']} ({var['InterestTypeDesc']}, '{var['LinkageTypeDesc']}', '{var['ExitPoints']}'); 'שיעור הריבית לפיקדון שכיח' {var['NominalInterest']} ({var['NominalInterestSub']}); "
             f"renewal '{var['Renewals']}' ({var['MaxRenewals']}); channels '{var['AvailablePlacementChannelDesc']}'. The bank defines prime itself (BANK-34). "
             f"Other one-year rows in the same table: {sis}; the fixed one without exit points is record discount-pikadon-leshana-0122.",
             f"שורת 'פקדון לשנה' קוד {var['ProductCode']}, 'שיעור הריבית המוצעת'"),
            vspread, (f"Printed '{var['OfferedInterest']}': spread from prime -{abs(vspread)} percentage points.", f"שורת 'פקדון לשנה' קוד {var['ProductCode']}, 'שיעור הריבית המוצעת'"),
            amin, src(f"שורת 'פקדון לשנה' קוד {var['ProductCode']}, 'טווח סכום להפקדה'"), f"Printed '{var['PlacementAmountRange']}'.", None, None, None,
            brk, exits, renew, ["BANK-13", "BANK-25", "BANK-34"])


def mizrahi():
    page = "https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/"
    feed = "https://www.mizrahi-tefahot.co.il/umbraco/surface/NabatDeposits/GetNabatDeposits?depositType=fixed"
    h = open(WORK / "mizrahi-fixed.html", encoding="utf-8").read()
    pop = re.search(r'id="populationDateFixed" value="([^"]+)"', h).group(1)
    assert pop.startswith("26/10/2026"), pop
    rows = [json.loads(l) for l in open(WORK / "mizrahi-fixed.rows", encoding="utf-8")]

    def block(code):
        i = next(i for i, r in enumerate(rows) if r[0].startswith(f"{code} - "))
        head = rows[i]
        n = int(re.search(r"rowspan=(\d+)", head[0]).group(1))
        return head, rows[i + 1:i + n]

    def clean(c):
        return re.sub(r" \[rowspan=\d+\]| <[^>]+>", "", c)

    def src(extra):
        return {"url": page,
                "title": f"בנק מזרחי טפחות, 'מוצרי שוק הכסף' (פרסום לפי הוראה 447/447א; טבלת 'פיקדונות מקובלים' נטענת בדף מ-{feed}), 'כל המידע המוצג נכון לתאריך ושעה' {pop[:16]}" + (f", {extra}" if extra else ""),
                "publisher": "Mizrahi Tefahot Bank Ltd.", "strength": "institution"}

    def terms_src(code, pdf):
        return {"url": pdf, "title": f"בנק מזרחי טפחות, תנאי הפיקדון ({code}), 'סכום הפקדה מזערי' / 'סכום הפקדה מקסימלי' (מקושר משם הפיקדון בטבלת 447)",
                "publisher": "Mizrahi Tefahot Bank Ltd.", "strength": "institution"}

    out = {}
    for code in ("131", "231"):
        head, subs = block(code)
        cells = [clean(c) for c in head]
        pdf = re.search(r"<([^>]+)>", head[0]).group(1)
        out[code] = (cells, subs, pdf)
    # terms PDFs (read 2026-10-26): min 1,000 and max 10,000,000 for both
    for code, f in (("131", "mizrahi-131.pdf.txt"), ("231", "mizrahi-231.pdf.txt")):
        t = open(WORK / f, encoding="utf-8").read()
        assert "1,000" in t and "10,000,000" in t and "לא ניתן למשוך את הפיקדון לפני מועד פירעונו המוסכם" in t, code
    brk = {"allowed": False, "penalty": "not_allowed", "mechanism_text": "447 table: 'לא ניתן לשבור'; terms document: 'לא ניתן למשוך את הפיקדון לפני מועד פירעונו המוסכם'.", "rule_ids": ["BANK-06"]}
    exits = {"exists": False, "every_months": None}
    renew = {"value": False, "max_renewals": None}

    c131, s131, p131 = out["131"]
    rates131 = [c131[12]] + [s[1] for s in s131]
    assert len(set(rates131)) == 1, rates131
    r131 = pct(c131[12])
    tiers131 = [c131[4]] + [s[0] for s in s131]
    sisters = "Sister fixed one-year rows in the same table: '165 - דובדבן-חודשי קבועה שנה' 2.00% (effective 2.02%); '189 - ליצ'י קבועה שנה' '1.50% / 1.51% / 1.52% / 1.53%' with exit points every 3 months."
    deposit("mizrahi-tefahot-pomelit-kvua-shana-131", "mizrahi-tefahot", [c131[0], "פומלית- קבועה שנה", "פומלית - ריבית קבועה לשנה"], c131[1], src, "2026-10-26",
            (f"Printed '{c131[1]}'; the terms document says '12 חודשים עד 12.5 חודשים'. Recorded as 12 months.", f"שורת '{c131[0]}', 'סוג מוצר (לפי תקופה)'"),
            "fixed", r131,
            (f"Nominal annual rate printed '{c131[12]}' for every amount tier of the row (tiers printed as upper bounds, 'לא כולל': {', '.join(tiers131)}); effective rate column '{c131[14]}'; "
             f"anchor and spread '{c131[10]}'; renewal '{c131[6]}'; exit points '{c131[8]}'. {sisters} The prime-linked one-year row without exit points is record mizrahi-tefahot-pomelit-prime-shana-231.",
             f"שורת '{c131[0]}', 'שיעור הריבית המוצע (נומינלי שנתי)'"),
            None, None,
            1000, terms_src("131", p131), "Terms document: 'סכום הפקדה מזערי ₪ 1,000'.",
            10000000, terms_src("131", p131), "Terms document: 'סכום הפקדה מקסימלי ₪ 10,000,000'. The 447 table prints tier upper bounds only.",
            brk, exits, renew, ["BANK-13", "BANK-25"])

    c231, s231, p231 = out["231"]
    spreads = [c231[11]] + [s[1] for s in s231]
    rates = [c231[12]] + [s[2] for s in s231]
    assert len(set(spreads)) == 1 and len(set(rates)) == 1, (spreads, rates)
    sp = float(re.fullmatch(r"P-(\d+(?:\.\d+)?)%", c231[11]).group(1))
    r231 = pct(c231[12])
    tiers231 = [c231[4]] + [s[0] for s in s231]
    psis = ("Other prime-linked one-year rows in the same table: '256 - רימונים- חודשי פריים לשנה' P-3.74% = 1.01% with monthly exit points; "
            "'287 - רימונים- יומי פריים לשנה' P-4.65% = 0.10% with daily exit points after 7 days; '261 - דובדבן-חודשי פריים שנה' P-3.03% = 1.72% (effective 1.73%).")
    deposit("mizrahi-tefahot-pomelit-prime-shana-231", "mizrahi-tefahot", [c231[0], "פומלית- פריים שנה", "פומלית - פריים לשנה"], c231[1], src, "2026-10-26",
            (f"Printed '{c231[1]}'; the terms document says '12 עד 12.5 חודשים'. Recorded as 12 months.", f"שורת '{c231[0]}', 'סוג מוצר (לפי תקופה)'"),
            "variable", r231,
            (f"Printed anchor '{c231[10]}', spread '{c231[11]}', offered nominal annual rate '{c231[12]}' for every amount tier (upper bounds {', '.join(tiers231)}); effective '{c231[14]}'. "
             f"The terms document: 'פיקדון שקלי בריבית ניידת כמרווח קבוע מהפריים'. Renewal '{c231[6]}'; exit points '{c231[8]}'. {psis} The fixed one-year row is record mizrahi-tefahot-pomelit-kvua-shana-131.",
             f"שורת '{c231[0]}', 'שיעור הריבית המוצע (נומינלי שנתי)'"),
            -sp, (f"Printed 'מרווח מעוגן' '{c231[11]}': prime less {sp} points, fixed for the deposit's life (terms: 'מרווח קבוע מהפריים').", f"שורת '{c231[0]}', 'מרווח מעוגן'"),
            1000, terms_src("231", p231), "Terms document: 'סכום הפקדה מזערי ₪ 1,000'.",
            10000000, terms_src("231", p231), "Terms document: 'סכום הפקדה מקסימלי ₪ 10,000,000'. The 447 table prints tier upper bounds only.",
            brk, exits, renew, ["BANK-13", "BANK-25", "BANK-34"])


# ------------------------------------------------------------------ government bond auctions (data.gov.il, Ministry of Finance)
def bonds():
    url = "https://data.gov.il/dataset/d3c80c46-9d99-41a9-8b62-50b590011a60/resource/c92fdda2-0939-4110-8ebc-edfcf35e8723/download/file.csv"
    text = open(WORK / "mof-issuance.csv", "rb").read().decode("cp1255")
    rows = list(csv.DictReader(io.StringIO(text)))
    src = {"url": url, "title": "הנפקת אג\"ח סחירות בשוק המקומי (data.gov.il goverment-domesticdebt, resource c92fdda2-0939-4110-8ebc-edfcf35e8723, file.csv, Windows-1255)",
           "publisher": "Ministry of Finance via data.gov.il", "strength": "primary"}
    obs = []
    for t in sorted({r["BONDS"] for r in rows}):
        mine = [r for r in rows if r["BONDS"] == t]
        latest = max(r["ISSUANCEDATE"] for r in mine)
        for r in mine:
            if r["ISSUANCEDATE"] != latest:
                continue
            date = r["ISSUANCEDATE"][:10]
            for field, metric in (("COUPON", "coupon"), ("GROSSAVGYIELD", "gross_avg_yield"), ("GROSSCUTOFFYIELD", "gross_cutoff_yield")):
                o = {"value": float(r[field]), "unit": "pct_per_year", "source": src, "checked": TODAY, "effective_from": date, "effective_to": None,
                     "update_rule": "market", "state": "sourced",
                     "notes": f"{field} as printed for series {r['SERIES']} ({t}), auction of {date}: original term {r['ORIGINALTERMTOMATURITY']} years, remaining {r['ACTUALTERMTOMATURITY']}, redemption {r['REDEMTIONDATE']}, "
                              f"offered {r['OFFEREDQUANTITY']}, purchased {r['PURCHASEDQUANTITY']}, average price {r['AVERAGEPRICE']}, cut-off price {r['CUTOFFPRICE']}, cover ratio {r['COVERRATIO']}.",
                     "date": date, "key": f"{t}|{r['SERIES']}|{r['REDEMTIONDATE']}|{metric}"}
                obs.append(o)
    obs.sort(key=lambda o: (o["date"], o["key"]))
    rec = {
        "id": "mof-gov-bond-auctions",
        "names": {"he": ["הנפקת אג\"ח סחירות בשוק המקומי", "נתוני החוב הממשלתי המקומי"], "en": ["Domestic tradable government bond issuance (auction results)"]},
        "publisher": "Ministry of Finance via data.gov.il",
        "flow": "data.gov.il package goverment-domesticdebt (id d3c80c46-9d99-41a9-8b62-50b590011a60), organization mof (משרד האוצר)",
        "series_code": "resource c92fdda2-0939-4110-8ebc-edfcf35e8723, file.csv",
        "unit": "pct_per_year",
        "cadence": "on change",
        "stale_after_days": 14,
        "terms_of_use": {
            "status": "confirmed",
            "fallback": "none needed",
            "terms_url": "https://data.gov.il/he/terms-of-use",
            "read_on": TODAY,
            "attribution": "מקור המידע: משרד האוצר, מאגר \"נתוני החוב הממשלתי המקומי\", משאב \"הנפקת אג\"ח סחירות בשוק המקומי\", data.gov.il (https://data.gov.il/dataset/goverment-domesticdebt), לפי רישיון השימוש במאגרי המידע באתר Data.gov.il",
        },
        "rule_ids": ["GOV-19"],
        "notes": ("The latest auction per bond type in the Ministry of Finance's issuance file (columns ISSUANCEDATE, BONDS, SERIES, COUPON, GROSSAVGYIELD, GROSSCUTOFFYIELD and others; 1,942 rows from 10/01/2022 to 20/10/2026 when read). "
                  "Each observation's key is '<bond type as printed in BONDS>|<SERIES (TASE number)>|<REDEMTIONDATE>|<metric>', metric one of coupon (COUPON), gross_avg_yield (GROSSAVGYIELD) and gross_cutoff_yield (GROSSCUTOFFYIELD). "
                  "The resource's notes describe 'תשואות ממוצעות והתשואות הסגירה שנקבעו בהתאם למחיר' but state no unit; the values are kept as printed and read as percent a year (an interpretation, not printed). "
                  "Bond types in the file: ממשלתית (fixed-rate unlinked), ממשלתית צמודה (CPI-linked), ממשלתית בריבית משתנה (floating), ממשלתית קצרה (short; its latest auction in the file is 15/09/2025). "
                  "Licence: the package shows 'אחר (פתוח)' with no licence text attached, so the Data.gov.il licence applies (https://data.gov.il/he/terms-of-use, 'תאריך עדכון: 30/08/2025', read 2026-10-26): "
                  "'אתה רשאי להעתיק את המידע, להפיץ אותו, להעמיד אותו לרשות לציבור ... אתה רשאי לעשות שימוש במידע באופן מסחרי ובאופן שאינו מסחרי', with the source named ('ציון מקור המידע') and no misleading display. "
                  "stale_after_days 14 is the collector's choice (auctions are held about weekly; the resource is updated daily), not a published figure. Staged on branch data-cash; no page reads it yet."),
        "observations": obs,
    }
    write("series/mof-gov-bond-auctions.json", rec)


# ------------------------------------------------------------------ Meitav Trade tariff (PDF, 'גרסת 04/2026')
def meitav_trade():
    url = "https://www.meitav.co.il/media/zitlfr4f/עמלות-תעריפון-42026.pdf"
    t = open(WORK / "meitav-trade-tariff.pdf.txt", encoding="utf-8").read()
    for s in ("גרסת ‪04/2026", "התעריפון המלא", "0.3%", "270", "0.13%", "עד ‪0.8%", "עד ‪₪ 90"):
        assert s.replace("‪", "") in t.replace("‪", "").replace("‬", ""), s
    title = "התעריפון המלא, מיטב טרייד ('גרסת 04/2026' בתחתית כל עמוד; PDF של 5 עמ', נוצר 23.4.2026), מקושר כ'תעריפון' מ-https://www.meitav.co.il/trade/about/"
    pub = "Meitav Trade Ltd. (מיטב טרייד בע\"מ)"

    def s(part):
        return {"url": url, "title": f"{title}, {part}", "publisher": pub, "strength": "institution"}

    R = ["BRK-24", "BRK-15"]

    def line(i, base, applies, rate, mn, band, names, period=None, mx=None, spread=None, excl=None):
        l = {"id": f"meitav-trade-{i}", "base": base, "applies_to": applies}
        if excl:
            l["excludes"], l["excludes_rule_ids"] = excl
        l.update({"level": "list", "rate": rate, "min": mn, "max": mx})
        if spread is not None:
            l["spread"] = spread
        l.update({"period": period, "channel": None, "band": band, "statement_code": None, "names": {"tariff": names}})
        return l

    p4 = "חלק 4 - ניירות ערך, (4א) שירותים נפוצים"
    lines = [
        line("buy-sell-tase", "trade", ["tase_shares_bonds", "etf_units"],
             vo(0.3, "pct_of_trade", s(f"{p4}, סעיף (1) (עמ' 2)"), rule_ids=R,
                notes="'קניה, מכירה ופדיון של ניירות ערך הנסחרים בבורסה בתל אביב (למעט אופציות מעו\"ף וחוזים עתידיים במעו\"ף)': '0.3%, מינימום 10 ₪ לעסקה', charged 'ביום העסקה'. Notes column: 'לא נגבית עמלה בגין אי ביצוע או ביטול עסקה'; 'עמלת עסקאות מחוץ לבורסה - 0.3%, מינימום 50 ₪'. The tariff has no separate line for Israeli open mutual-fund units, and does not say whether they fall under this line, so mutual_fund_units is not listed."),
             vo(10, "nis_per_trade", s(f"{p4}, סעיף (1), מינימום (עמ' 2)"), rule_ids=R, notes="'מינימום 10 ₪ לעסקה'."),
             None, ["קניה, מכירה ופדיון של ניירות ערך הנסחרים בבורסה בתל אביב (למעט אופציות מעו\"ף וחוזים עתידיים במעו\"ף)"]),
        line("buy-sell-makam", "trade", ["makam"],
             vo(0.1, "pct_of_trade", s(f"{p4}, סעיף (2) (עמ' 2)"), rule_ids=R, notes="'קניה, מכירה ופדיון מק\"מ': '0.1%, מינימום 10 ₪ לעסקה', charged 'ביום העסקה'."),
             vo(10, "nis_per_trade", s(f"{p4}, סעיף (2), מינימום (עמ' 2)"), rule_ids=R, notes="'מינימום 10 ₪ לעסקה'."),
             None, ["קניה, מכירה ופדיון מק\"מ"]),
        line("buy-sell-foreign-us-per-share", "trade", ["foreign_securities"],
             vo(0.01, "usd_per_share", s(f"{p4}, סעיף (5), הערות: 'מסחר בבורסות ארה\"ב: מסלול א'' (עמ' 2)"), rule_ids=R,
                notes="Printed 'מסלול א': 1 סנט למניה, מינימום $ 12 לעסקה' (1 cent = 0.01 USD). The price column reads 'מניות על פי אחד המסלולים כמפורט בהערות'; options '5$, מינימום 25$'. Notes: trades outside trading hours or through an ECN/market maker not in the arrangement pay an additional broker fee; no fee for non-execution. Canada: '3 סנט קנדי למניה, מינימום 50 דולר קנדי לעסקה'."),
             vo(12, "usd_per_trade", s(f"{p4}, סעיף (5), מסלול א', מינימום (עמ' 2)"), rule_ids=R, notes="'מינימום $ 12 לעסקה'."),
             "מסחר בבורסות ארה\"ב: מסלול א'", ["קניה, מכירה ופדיון של ניירות ערך בחוץ לארץ", "מסחר בבורסות ארה\"ב", "מסלול א'"]),
        line("buy-sell-foreign-us-pct", "trade", ["foreign_securities"],
             vo(0.7, "pct_of_trade", s(f"{p4}, סעיף (5), הערות: 'מסלול ב'' (עמ' 2)"), rule_ids=R, notes="Printed 'מסלול ב': 0.7% משווי העסקה, מינימום $ 12 לעסקה'."),
             vo(12, "usd_per_trade", s(f"{p4}, סעיף (5), מסלול ב', מינימום (עמ' 2)"), rule_ids=R, notes="'מינימום $ 12 לעסקה'."),
             "מסחר בבורסות ארה\"ב: מסלול ב'", ["קניה, מכירה ופדיון של ניירות ערך בחוץ לארץ", "מסחר בבורסות ארה\"ב", "מסלול ב'"]),
        line("buy-sell-foreign-other", "trade", ["foreign_securities"],
             vo(0.25, "pct_of_trade", s(f"{p4}, סעיף (5), הערות: 'מסחר בשאר בורסות העולם' (עמ' 3)"), rule_ids=R,
                notes="Printed 'מסחר בשאר בורסות העולם: 0.25%, מינימום 25 במטבע העסקה, יתכן חיוב בעמלות ברוקר/עמלות צד ג' נוספות'. Foreign bonds (item 6): '0.3%, מינימום 25$'."),
             vo(None, "usd_per_trade", s(f"{p4}, סעיף (5), שאר בורסות העולם, מינימום (עמ' 3)"), rule_ids=R,
                notes="Printed 'מינימום 25 במטבע העסקה': 25 units of the trade's currency; the unit vocabulary has no 'per trade in the trade currency' unit, so the value is left null rather than read as dollars."),
             "מסחר בשאר בורסות העולם", ["קניה, מכירה ופדיון של ניירות ערך בחוץ לארץ", "מסחר בשאר בורסות העולם"]),
        line("buy-sell-foreign-fund", "trade", ["foreign_securities"],
             vo(0.2, "pct_of_trade", s(f"{p4}, סעיף (7) (עמ' 3)"), rule_ids=R, notes="'עמלת קרן זרה פתוחה': '0.2%, מינימום 20$', charged 'ביום העוקב ליום העסקה'; notes: 'לא כולל עמלת סליקה ועמלת קורספונדנט'."),
             vo(20, "usd_per_trade", s(f"{p4}, סעיף (7), מינימום (עמ' 3)"), rule_ids=R, notes="'מינימום 20$'."),
             "קרן זרה פתוחה", ["עמלת קרן זרה פתוחה"]),
        line("custody", "custody", ["tase_shares_bonds", "etf_units", "mutual_fund_units", "makam", "money_market_units", "foreign_securities"],
             vo(0.15, "pct_of_balance_per_period", s(f"{p4}, סעיף (8) (עמ' 3)"), rule_ids=R,
                notes="'דמי ניהול פיקדון ניירות ערך (לרבות יחידות השתתפות בקרנות נאמנות)': the price cell reads '0.15%, מינימום 270 ₪' and, on the next line, 'לרבעון'; charged 'ביום העסקה' as printed. "
                      "The tariff does not say whether 0.15% is a quarterly or an annual rate; recorded per quarter as printed, unconfirmed. It prints no exemption of makam or money-market funds; the bank ban (BRK-17) does not apply to a non-bank member (BRK-52). "
                      "CONFLICT: Meitav Trade's own pages say 'ללא דמי משמרת ועמלות נסתרות' (https://www.meitav.co.il/trade/about/) and 'פטור מדמי משמרת' (https://www.meitav.co.il/trade/independent_trading/, both read 2026-10-26); the tariff, the binding list, is stored."),
             vo(270, "nis", s(f"{p4}, סעיף (8), מינימום (עמ' 3)"), rule_ids=R, notes="'מינימום 270 ₪' followed by 'לרבעון' (a minimum per quarter)."),
             None, ["דמי ניהול פיקדון ניירות ערך (לרבות יחידות השתתפות בקרנות נאמנות)"], period="quarter"),
        line("fx-conversion", "fx", ["all"],
             vo(0.13, "pct_of_trade", s("חלק 5 - מטבע חוץ, סעיף (1) 'עמלת חליפין' (עמ' 5)"), rule_ids=R,
                notes="'עמלת חליפין: 0.13%', charged 'ביום העסקה'. CONFLICT: Meitav Trade's page https://www.meitav.co.il/trade/independent_trading/ (read 2026-10-26) says 'פטור מעמלת המרת מט\"ח ושערים אטרקטיביים בהמרה'; the tariff is stored."),
             None, None, ["עמלת חליפין"],
             spread=vo(0.8, "pct_of_trade", s("חלק 5 - מטבע חוץ, סעיף (2) 'מרווח המרה' (עמ' 5)"), rule_ids=R, notes="Printed 'מרווח המרה: עד 0.8%' with the note 'משער ההמרה', charged 'בעת ביצוע העסקה' (a ceiling).")),
        line("account-fee", "fixed_period", ["all"],
             vo(90, "nis_per_month", s("חלק 9 - שירותים ועמלות נוספים, סעיף (1) 'דמי שימוש/ טיפול' (עמ' 5)"), rule_ids=R,
                notes="Printed 'עד ₪ 90', charged 'אחת לחודש' (a ceiling). Item (2): 'תשלום בגין מערכות מסחר מתקדמות/ציטוטים: עד ₪ 3,000' a month. Meitav Trade's pages offer new independent-trading accounts 'פטור לשנתיים מדמי טיפול' (https://www.meitav.co.il/trade/independent_trading/, read 2026-10-26), a promotion, not the list price."),
             None, None, ["דמי שימוש/ טיפול"], period="month"),
    ]
    snap = {
        "id": "meitav-trade",
        "provider": {"name_he": "מיטב טרייד בע\"מ", "class": "broker", "regulator": "ISA", "tase_member": True,
                     "protection_rule_ids": ["BRK-07", "BRK-08", "BRK-09", "BRK-12", "BRK-13", "REG-16"]},
        "tariff": {"url": url, "title": title + "; חלק 4 - ניירות ערך (עמ' 2-4), חלק 5 - מטבע חוץ (עמ' 5), חלק 9 - שירותים ועמלות נוספים (עמ' 5)", "published": None, "format": "pdf"},
        "snapshot": TODAY,
        "missing": False,
        "missing_reason": None,
        "lines": lines,
        "averages": [],
        "minimums": {"account_opening": vo(5000, "nis", {"url": "https://www.meitav.co.il/trade/independent_trading/",
                                                          "title": "מיטב טרייד, 'חשבון מסחר עצמאי', שאלות ותשובות: 'מה סכום ההפקדה הראשוני הנדרש?'",
                                                          "publisher": pub, "strength": "institution"}, rule_ids=R,
                                         notes="'ניתן לפתוח חשבון מסחר עצמאי במיטב טרייד החל מהפקדה של 5,000 ₪ בלבד'. From the company's page, not from the tariff.")},
        "notice_rule_ids": ["BRK-15"],
    }
    write(f"fees/meitav-trade@{TODAY}.json", snap)


if __name__ == "__main__":
    old = json.load(open(DATA / "funds/1223866@2026-10-23.json", encoding="utf-8"))
    renewing("1223866", old=old, manager_key="altshuler")
    renewing("1220227", manager_key="meitav", manager="מיטב קרנות נאמנות בע\"מ",
             legal="קרן כספית מתחדשת (קרן מועדים קבועים), סדרה חודשית ב-13/11/2026 (renewable fixed-date money-market fund, monthly series, per Discount's 447A row: period 'חודש', 'מתחדשת אוטומטית, עד למתן הודעת פדיון על ידי הלקוח'; MF-08, MF-35). The TASE number belongs to this series only; the next monthly series gets its own number")
    for args in DAILY:
        daily_fund(*args)
    hapoalim()
    discount()
    mizrahi()
    bonds()
    meitav_trade()
