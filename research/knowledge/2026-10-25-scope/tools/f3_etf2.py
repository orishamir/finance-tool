#!/usr/bin/env python3
# F3 ETF batch 2: ETF-37 to ETF-54, MKT-01; splits ETF-40, ETF-43, ETF-47 (-> ETF-68), ETF-49 (-> ETF-69), ETF-53 (settling pass 2026-10-26)
from f3_rec import setf, heading, replace_in, getf, insert_after, _load, _save, _span

F = "etfs-and-index-funds.md"
GL = "[הבורסה, \"הנחיות על פי החלק השביעי לתקנון\" (מדריך מעו\"ף, עמודים מעודכנים עד 4.8.2026)](https://content.tase.co.il/media/iftghzjt/274765-1.pdf)"
NB_ISA = " Not binding: this is the Securities Authority's yearly report describing the fund market (פרסום של רשות ניירות ערך); it binds no one, so the site words it as the Authority's description, not as law (2026-10-26, scope settling)."


def sub_all(rid, old, new):
    text = _load(F)
    a, b = _span(text, rid)
    block = text[a:b]
    n = block.count(old)
    if n == 0:
        raise SystemExit("%s: %r not found" % (rid, old))
    _save(F, text[:a] + block.replace(old, new) + text[b:])
    return n


# ---- index providers' rulebooks: institution
for rid in ["ETF-37", "ETF-38", "ETF-39"]:
    sub_all(rid, "· primary (index provider", "· institution (index provider's own document")
    setf(F, rid, "Scope", "- Scope: institution: S&P Dow Jones Indices")

# ETF-40: the Israeli funds' sentence is ETF-58's
heading(F, "ETF-40", "### ETF-40 The three S&P 500 return versions: price, gross total return, net total return")
replace_in(F, "ETF-40", " The Israeli S&P 500 funds in ETF-10 define their tracking asset as the net total return version (ticker SPTR500N): their benchmark already assumes dividends reinvested after a withholding tax, so a fund that collects dividends and pays no more than that tax can match it.", "")
replace_in(F, "ETF-40", "Which version a given Israeli fund tracks is in its prospectus (ETF-10), not in the index.",
           "Which version a given Israeli fund tracks is in its own prospectus (ETF-10), not in the index; two S&P 500 funds' wording (the net total return, SPTR500N) is ETF-58. Split on 2026-10-26 (scope settling): the funds' sentence was dropped here; it is ETF-58's (institution: IBI, Yalin Lapidot).")
sub_all("ETF-40", "· primary (index provider", "· institution (index provider's own document")
replace_in(F, "ETF-40", "Which version the Israeli funds track: ETF-10 (institution).", "Which version two Israeli funds track: ETF-58 (institution).")
setf(F, "ETF-40", "Scope", "- Scope: institution: S&P Dow Jones Indices")

# ETF-41: the guidelines; TASE's index page only repeated them
replace_in(F, "ETF-41", " The index page confirms \"מגבלת משקל 5%\", \"מס' ני\"ע במדד 125\", \"אוכלוסייה: מאגר רימון\", \"תנאי סף נוספים: מניות הנכללות במדד ת\"א-35 או במדד ת\"א-90\", \"קריטריון דירוג החלפה: שווי שוק\", and that the fast entry track for IPOs and dual listings applies.", "")
c = getf(F, "ETF-41", "Conditions")
setf(F, "ETF-41", "Conditions", c.rstrip() + " 2026-10-26 (scope settling): TASE's index page, which repeated the guidelines (cap, population, rank criterion), was dropped as a source.")
setf(F, "ETF-41", "Source", "- Source: " + GL + ", pp.28-33, annexes 1, 3, 4 (\"ועדת מדדים החליטה כי תקרת המשקל של המדד תהיה 5%\") · primary (exchange rules, ISA-approved) · checked 2026-10-26.")
setf(F, "ETF-41", "Scope", "- Scope: general")

# ETF-42: the guidelines carry the formula, the launch, the base and the 15 seconds; the index page only the identifiers
replace_in(F, "ETF-42", "Published \"רציף, כל 15 שניות במהלך יום המסחר\".",
           "The index committee decided that the continuous indices are computed and published \"בתדירות של 15 שניות\" (guidelines p.15, footnote).")
replace_in(F, "ETF-42", "Index code 137, ISIN IL00BIDX1378, Bloomberg TA-125, Reuters .TA125.",
           "TASE's index page gives index code 137, ISIN IL00BIDX1378, Bloomberg TA-125, Reuters .TA125.")
replace_in(F, "ETF-42", "Launched 2.1.1992 at base 100 as TA-100; expanded from 100 to 125 shares at the close of 9.2.2017, when the base of TA-125 was set equal to the closing TA-100 of that day.",
           "Launched 2.1.1992 at base 100 as TA-100; expanded from 100 to 125 shares at the close of 9.2.2017, the base of TA-125 on 12.2.2017 being the closing TA-100 of 9.2.2017 (annex 3 ss.7-8).")
replace_in(F, "ETF-42", "The index page says the update is published \"לפחות חמישה ימי מסחר לפני מועד העדכון\", while the knowledge-centre page behind ETF-35 says two weeks before; the two were not reconciled.",
           "The guidelines publish the universe list and the fixed parameters at least five trading days before an update (s.3ח, s.9א(6)), as the index page says; reconciled 2026-10-26 (ETF-35 corrected, it said two weeks).")
setf(F, "ETF-42", "Source", "- Source: " + GL + ", p.31, annex 3 ss.6-8 (\"המדד יחושב לפי נוסחת מדד תשואה כוללת ברוטו\"); pp.14-15, chapter א s.7 and footnote 1 · primary (exchange rules, ISA-approved) · checked 2026-10-26. [הבורסה, \"ת\"א-125 אודות המדד\" (מדד 137)](https://market.tase.co.il/he/market_data/index/137/about) · institution (TASE's market-data page; read in Chrome; for the identifiers) · checked 2026-10-25.")
setf(F, "ETF-42", "Scope", "- Scope: general")

# ETF-43: a dated count; the regulator's total first; the no-republishing sentence is CAT-43's
heading(F, "ETF-43", "### ETF-43 TASE's foreign-funds list on 23/10/2026: 40 funds, 29 in the equity market and 11 in the bond market")
replace_in(F, "ETF-43", "TASE's terms (CAT-43) forbid republishing the list; the site shows the counts with a link to the page and lists only the funds that have a `data/funds/` record.",
           "Republishing the list is governed by TASE's site terms (CAT-43, institution: Tel Aviv Stock Exchange); the site shows the counts with a link to the page and lists only the funds that have a `data/funds/` record. The Securities Authority counts 40 foreign ETFs traded on the exchange at end-2025. 2026-10-26 (scope settling): a dated count over the exchange's list, not a rule; it belongs in data/ (request to the lead).")
setf(F, "ETF-43", "Source", "- Source: [פעילות קרנות נאמנות בישראל 2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf), p.3 (\"מתוכן 40 קרנות מסוג ETF שנסחר בבורסה ו 6- קרנות פתוחות\") · primary · checked 2026-10-26. [הבורסה, קרנות חוץ נסחרות](https://market.tase.co.il/he/market_data/f-etfs) · primary (the exchange's list; read in Chrome; 40 records on 23/10/2026) · checked 2026-10-25. [הבורסה, קרנות חוץ נסחרות בשוק האג\"ח](https://market.tase.co.il/he/market_data/f-etfs?dType=1&oId=18) · primary (the exchange's list; read in Chrome; 11 records on 23/10/2026) · checked 2026-10-25. Site terms: CAT-43.")
setf(F, "ETF-43", "Scope", "- Scope: general")

# ETF-44, ETF-45: the guidelines first; TASE's index page is TASE's description
for rid, page, code in [("ETF-44", "pp.28-29, annex 1", "142"), ("ETF-45", "pp.32-33, annex 4", "143")]:
    src = getf(F, rid, "Source")
    idx_link = src.split(" · ")[0].replace("- Source: ", "")
    setf(F, rid, "Source", "- Source: " + GL + ", " + page + "; p.15, footnote 1 (15 seconds) · primary (exchange rules, ISA-approved) · checked 2026-10-26. " + idx_link + " · institution (TASE's market-data page; read in Chrome; for its description and identifiers) · checked 2026-10-25.")
    setf(F, rid, "Scope", "- Scope: general")
replace_in(F, "ETF-44", "published \"רציף, כל 15 שניות במהלך יום המסחר\",", "published every 15 seconds (the index committee's decision, guidelines p.15),")
c = getf(F, "ETF-44", "Conditions")
setf(F, "ETF-44", "Conditions", c.rstrip() + " 2026-10-26 (scope settling): the rule is cited from the guidelines first; TASE's index page stays for its own description and the identifiers. The guidelines also publish the update at least five trading days before (ETF-35).")
c = getf(F, "ETF-45", "Conditions")
setf(F, "ETF-45", "Conditions", c.rstrip() + " 2026-10-26 (scope settling): the rule is cited from the guidelines first; TASE's index page stays for its own description and the identifiers.")

# ETF-46, ETF-48: institution
sub_all("ETF-46", "· primary (index provider)", "· institution (index provider's own document)")
setf(F, "ETF-46", "Scope", "- Scope: institution: Nasdaq")
sub_all("ETF-48", "· primary (index provider)", "· institution (index provider's own document)")
setf(F, "ETF-48", "Scope", "- Scope: institution: MSCI")

# ETF-47 split: Nasdaq's versions keep the id; the funds' wording goes to ETF-68
rule47 = getf(F, "ETF-47", "Rule")
funds_sentence = " The Israeli NASDAQ-100 funds whose annual reports were read (IBI open tracking fund 5127766, Mor 5117585, MTF 5134531) define the tracking asset as Nasdaq 100 at 100% plus the U.S. dollar at 100%, with \"אופן חישוב המדד: מדד השקעה נטו ממס (NTR)\"; IBI and Mor give the ticker as NNDX."
assert funds_sentence in rule47
src47 = getf(F, "ETF-47", "Source")
parts = src47.replace("- Source: ", "").split(". [")
nasdaq_src = parts[0] + ". [" + parts[1] + "."
fund_srcs = "[" + ". [".join(parts[2:])
heading(F, "ETF-47", "### ETF-47 NASDAQ-100 return versions: price (NDX), gross total return (XNDX) and a notional net total return that reinvests 70% of dividends")
setf(F, "ETF-47", "Rule", rule47.replace(funds_sentence, ""))
setf(F, "ETF-47", "Conditions", "- Conditions / exceptions: The document also lists a Nasdaq-100 EUR net version (XNDXEURN) that deducts withholding at the rates of Nasdaq's withholding-tax appendix, which was not read. Which version a fund tracks is in its own report; three Israeli funds' wording (a net version, NNDX) is ETF-68. Split on 2026-10-26 (scope settling): the funds' sentence and the NNDX question moved to ETF-68; this record is Nasdaq's own document.")
setf(F, "ETF-47", "Source", "- Source: " + nasdaq_src.replace("· primary (index provider)", "· institution (index provider's own document)") + " The funds' wording: ETF-68.")
setf(F, "ETF-47", "Scope", "- Scope: institution: Nasdaq")
insert_after(F, "ETF-47", "\n".join([
    "### ETF-68 IBI, Mor and MTF: how their NASDAQ-100 funds word the tracking asset (a net version, NNDX)",
    "- Rule:" + funds_sentence,
    "- Conditions / exceptions: Split from ETF-47 on 2026-10-26 (scope settling). The reports give \"NNDX\" while Nasdaq's own documents name XNDXNNR; whether NNDX is the same series under a data vendor's code was not confirmed (open question 26). If it is Nasdaq's notional net version, these funds' benchmark already assumes dividends taxed at about 30% before reinvestment (ETF-47). That every Israeli NASDAQ-100 fund words it the same way is proven only for these three. General rule: ETF-10; the index's versions: ETF-47.",
    "- Figures: none.",
    "- Source: " + fund_srcs.rstrip() + " The index's versions: ETF-47.",
    "- Scope: institution: IBI, Mor, MTF",
    "- Dimensions: distribution-policy, currency, foreign-withholding-domicile",
    "- Likely to change: possible, if a fund changes its tracking asset.",
]))

# ETF-49 split: MSCI's versions keep the id; the funds' wording goes to ETF-69
rule49 = getf(F, "ETF-49", "Rule")
fs49 = " The Israeli MSCI World and ACWI funds whose reports were read (MTF 5122569, Tachlit 5124573, IBI 5139605; Kesem ETFs 1147073 and 1147362) define the tracking asset as the index at 100% plus the U.S. dollar at 100% (or, for the dollar-hedged ETFs, the index in dollar terms with the hedge effect reported separately), with \"אופן חישוב המדד: מדד השקעה נטו ממס (NTR)\", tickers M1WO (World) and M1WD (ACWI), or \"MSCI AC WORLD INDEX - RT - NTR\"."
assert fs49 in rule49
src49 = getf(F, "ETF-49", "Source").replace("- Source: ", "")
msci_src, rest49 = src49.split(". [", 1)
heading(F, "ETF-49", "### ETF-49 MSCI return versions: gross and net (dividends after the highest non-treaty withholding rate: US 30%, Israel 25%)")
setf(F, "ETF-49", "Rule", rule49.replace(fs49, ""))
replace_in(F, "ETF-49", "Which version a fund tracks is in its own report, not in the index.",
           "Which version a fund tracks is in its own report, not in the index; five Israeli funds' wording (the net version in USD) is ETF-69. Split on 2026-10-26 (scope settling): the funds' sentence moved to ETF-69; this record is MSCI's own document.")
setf(F, "ETF-49", "Source", "- Source: " + msci_src.replace("· primary (index provider)", "· institution (index provider's own document)") + ". The funds' wording: ETF-69.")
setf(F, "ETF-49", "Scope", "- Scope: institution: MSCI")
insert_after(F, "ETF-49", "\n".join([
    "### ETF-69 MTF, Tachlit, IBI and Kesem: how their MSCI World and ACWI funds word the tracking asset (the net version in USD)",
    "- Rule:" + fs49,
    "- Conditions / exceptions: Split from ETF-49 on 2026-10-26 (scope settling). MSCI's net version assumes the full non-treaty withholding rate (ETF-49), so these funds' benchmark already assumes it. That every Israeli fund on these indices words it the same way is proven only for these five. General rule: ETF-10; the index's versions: ETF-49.",
    "- Figures: none.",
    "- Source: [" + rest49.rstrip() + " The index's versions: ETF-49.",
    "- Scope: institution: MTF, Tachlit, IBI, Kesem",
    "- Dimensions: distribution-policy, currency, foreign-withholding-domicile",
    "- Likely to change: possible, if a fund changes its tracking asset.",
]))

# ETF-50: a count, not a rule
replace_in(F, "ETF-50", "Foreign funds on TASE (ETF-32, ETF-43) were not counted here.",
           "Foreign funds on TASE (ETF-32, ETF-43) were not counted here. 2026-10-26 (scope settling): a count over the exchange's and Maya's complete lists, not a rule; it belongs in data/ as a dated count (request to the lead). Republishing the lists is governed by TASE's site terms (CAT-43).")
setf(F, "ETF-50", "Scope", "- Scope: general")

# ETF-52: not binding; ETF-11 says the same
c = getf(F, "ETF-52", "Conditions")
setf(F, "ETF-52", "Conditions", c.rstrip() + " ETF-11 cites the same page of the 2024 report." + NB_ISA)

# ETF-53 split: the providers' net-version rates are ETF-47 and ETF-49; the regulations go on the source list
replace_in(F, "ETF-53", "An index's net total return version reinvests dividends after a withholding the index provider sets: 30% on U.S. dividends for MSCI (its non-treaty rate) and for Nasdaq (its indicative rate).",
           "An index's net total return version reinvests dividends after a withholding the index provider sets (MSCI: ETF-49; Nasdaq: ETF-47).")
replace_in(F, "ETF-53", "Split on 2026-10-25 (scope pass): the observation across the funds' reports is ETF-65.",
           "Split on 2026-10-25 (scope pass): the observation across the funds' reports is ETF-65. Split on 2026-10-26 (scope settling): the providers' 30% rates are their own methodology (institution: MSCI, Nasdaq) and stay in ETF-49 and ETF-47; the regulations behind the first two sentences are now on the source list.")
setf(F, "ETF-53", "Figures", "- Figures: none of its own (the providers' rates: ETF-47, ETF-49).")
setf(F, "ETF-53", "Source", "- Source: [תקנות השקעות משותפות בנאמנות (נכסים שמותר לקנות ולהחזיק בקרן ושיעוריהם המרביים), התשנ\"ה-1994](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(נכסים_שמותר_לקנות_ולהחזיק_בקרן_ושיעוריהם_המרביים)), reg. 1, definition of \"עסקת החלף שאינה במימון\" · primary (mirror) · checked 2026-10-26. [תקנות השקעות משותפות בנאמנות (קרנות מחקות), התשע\"ח-2018 (קובץ התקנות 8038)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=#page=2), p.2 (gazette p.2394), reg. 1 (\"חלק משכר מנהל הקרן, הנגזר מתשואת הקרן ומהפרש העקיבה שלה\") · primary · checked 2026-10-26. ETF-51, ETF-14, ETF-47, ETF-49, TXS-15, TXF-16.")

# ETF-54: the Wikisource copy for the quote
replace_in(F, "ETF-54", "p.15 (gazette p.1015), reg. 18(ה) · checked 2026-10-25 · primary (mirror of Reshumot).",
           "p.15 (gazette p.1015), reg. 18(ה) · checked 2026-10-25 · primary (mirror of Reshumot); [תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע\"ו-2016 (ויקיטקסט, מראה)](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(דוח_שנתי_של_קרן)), reg. 18(ה) (\"תחת הכותרת\") · checked 2026-10-26 · primary (mirror; the gazette page's text layer is interleaved).")

# MKT-01: a published series, not a rule
setf(F, "MKT-01", "Scope", "- Scope: institution: J.P. Morgan Asset Management")
replace_in(F, "MKT-01", "The bond and 60/40 bars on the same slide were not recorded.",
           "The bond and 60/40 bars on the same slide were not recorded. 2026-10-26 (scope settling): a published return series, not a rule; it belongs with the data series (request to the lead), and its scope is the publisher's (its publication and reuse terms).")
print("ok")
