#!/usr/bin/env python3
"""Writes data/sources/institutions.json (spec 2026-10-25-rules-scope §3): every company a rule's Scope line names, plus every bank,
broker and managing company the site has a page for that a future Scope line may name. Hebrew names follow data/sources/publishers.json
where it has the company, else the short name the site already uses (providers.ts SHORT_NAMES) or the CMA name without the suffix."""
import json, os
ROOT = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope"
# Where each company's own documents live (review, 2026-10-26): the hosts of its sites as the rule sources, fee snapshots and deposit
# records use them (tools/own-docs-survey.py, tools/hosts-survey.py), and for a fund manager the names its Maya filings open with.
# A company none of whose documents is collected has no host: a record about it from the press or a forum is not its own document.
OWN = {
  "altshuler-shaham": ["as-invest.co.il"], "harel": ["harel-group.co.il"], "meitav": ["meitav.co.il"], "mor": ["moreinvest.co.il"],
  "phoenix": ["fnx.co.il"], "infinity": ["infinity.co.il"], "analyst": ["analyst.co.il"], "yachad-rofim": ["krn-rofim.co.il"],
  "huji-provident": ["gemel.huji.ac.il"], "leumi": ["leumi.co.il", "bankleumi.co.il"], "hapoalim": ["bankhapoalim.co.il"],
  "discount": ["discountbank.co.il"], "mizrahi-tefahot": ["mizrahi-tefahot.co.il"], "fibi": ["fibi.co.il"], "mercantile": ["mercantile.co.il"],
  "massad": ["bankmassad.co.il"], "yahav": ["bank-yahav.co.il"], "jerusalem": ["bankjerusalem.co.il"], "one-zero": ["onezerobank.com"],
  "ibi": ["ibi.co.il"], "meitav-trade": ["meitav.co.il"], "altshuler-trade": ["as-invest.co.il"], "psagot": ["psagot.co.il"],
  "excellence": ["xnes.co.il"], "fair": ["fair.co.il"], "interactive-israel": ["inter-il.com"], "interactive-brokers": ["interactivebrokers.com"],
  "ib-ireland": ["interactivebrokers.ie"], "meitav-funds": ["meitav.co.il"], "ishares": ["ishares.com"], "blackrock": ["blackrock.com"],
  "jpmorgan-am": ["am.jpmorgan.com"], "tase": ["tase.co.il"], "sp-dji": ["spglobal.com"], "nasdaq": ["indexes.nasdaqomx.com"],
  "msci": ["msci.com"], "isa": ["isa.gov.il"], "phoenix-insurance": ["fnx.co.il"], "reit1": ["reit1.co.il"],
}
FILINGS = {
  "ibi-funds": ["IBI", "אי.בי.אי"], "harel-funds": ["הראל"], "mor-funds": ["מור"], "yalin-funds": ["Yalin Lapidot", "ילין לפידות"],
  "migdal-funds": ["MTF", "מגדל קרנות נאמנות"], "meitav-funds": ["תכלית"], "kesem": ["קסם"],
}
def row(id, he, kind, names, cma=None, fees=None, bank=None, note=None):
    r = {"id": id, "name_he": he, "kind": kind, "scope_names": [n if isinstance(n, dict) else {"name": n} for n in names], "cma_legal_id": cma, "fees_id": fees, "deposit_bank_id": bank, "own_hosts": OWN.get(id, [])}
    if id in FILINGS: r["filing_names"] = FILINGS[id]
    if note: r["note"] = note
    return r
IBI_FUNDS = ["ETF-19", "ETF-55", "ETF-56", "ETF-57", "ETF-58", "ETF-59", "ETF-60", "ETF-61", "ETF-62", "ETF-64", "ETF-65", "ETF-66", "ETF-68", "ETF-69"]
rows = [
  # managing companies (CMA)
  row("altshuler-shaham", "אלטשולר שחם", "provident-manager", ["Altshuler Shaham"], cma="513173393"),
  row("harel", "הראל", "provident-manager", ["Harel"], cma="512267592"),
  row("meitav", "מיטב", "provident-manager", ["Meitav"], cma="512065202", fees="meitav"),
  row("mor", "מור", "provident-manager", ["Mor"], cma="514956465"),
  row("phoenix", "הפניקס", "provident-manager", ["The Phoenix"], cma="513026484", fees="phoenix"),
  row("migdal", "מגדל", "provident-manager", ["Migdal"], cma="512237744"),
  row("clal", "כלל", "provident-manager", ["Clal"], cma="512244146"),
  row("menora-mivtachim", "מנורה מבטחים", "provident-manager", ["Menora Mivtachim"], cma="512245812"),
  row("infinity", "אינפיניטי", "provident-manager", ["Infinity"], cma="513621110"),
  row("analyst", "אנליסט", "provident-manager", ["Analyst"], cma="511880460"),
  row("yachad-rofim", "יחד רופאים", "provident-manager", ["Yachad Rofim"], cma="510930654"),
  row("huji-provident", "קופת הגמל של עובדי האוניברסיטה העברית", "provident-manager", ["Hebrew University provident fund"], cma="510960586"),
  row("slice", "סלייס", "provident-manager", ["Slice"], cma="514767490"),
  row("globalnet", "גלובלנט", "provident-manager", ["Globalnet"], cma="516463635"),
  # banks
  row("leumi", "בנק לאומי", "bank", ["Bank Leumi"], fees="leumi", bank="leumi"),
  row("hapoalim", "בנק הפועלים", "bank", ["Bank Hapoalim"], fees="hapoalim", bank="hapoalim"),
  row("discount", "בנק דיסקונט", "bank", ["Discount Bank"], fees="discount", bank="discount"),
  row("mizrahi-tefahot", "בנק מזרחי טפחות", "bank", ["Mizrahi Tefahot Bank"], fees="mizrahi-tefahot", bank="mizrahi-tefahot"),
  row("fibi", "הבנק הבינלאומי", "bank", ["First International Bank"], fees="fibi", bank="fibi"),
  row("mercantile", "בנק מרכנתיל דיסקונט", "bank", ["Mercantile Discount Bank"], fees="mercantile", bank="mercantile"),
  row("massad", "בנק מסד", "bank", ["Bank Massad"], fees="massad", bank="massad"),
  row("yahav", "בנק יהב", "bank", ["Bank Yahav"], fees="yahav", bank="yahav"),
  row("jerusalem", "בנק ירושלים", "bank", ["Bank of Jerusalem"], fees="jerusalem"),
  row("one-zero", "וואן זירו", "bank", ["One Zero Bank"], fees="one-zero"),
  # brokers
  row("ibi", "אי.בי.אי", "broker", ["IBI"], fees="ibi", note="The broker (IBI Trade). In the fund records IBI is the fund manager: ibi-funds."),
  row("meitav-trade", "מיטב טרייד", "broker", ["Meitav Trade"], fees="meitav-trade"),
  row("altshuler-trade", "אלטשולר שחם טרייד", "broker", ["Altshuler Shaham Trade"], fees="altshuler-trade"),
  row("psagot", "פסגות", "broker", ["Psagot"], fees="psagot"),
  row("excellence", "אקסלנס", "broker", ["Excellence"], fees="excellence"),
  row("fair", "פייר", "broker", ["Fair"], note="No fee snapshot collected yet, so no page."),
  row("interactive-israel", "אינטראקטיב ישראל", "foreign-broker", ["Interactive Israel"], fees="interactive-israel", note="A foreign broker: the site gives foreign brokers no company page (invest.ts hasPage)."),
  row("interactive-brokers", "Interactive Brokers", "foreign-broker", ["Interactive Brokers"], fees="interactive-brokers"),
  row("ib-ireland", "Interactive Brokers Ireland", "foreign-broker", ["Interactive Brokers Ireland"]),
  # fund managers (no page yet: a fund manager's page comes with a fund list, company.tsx)
  row("ibi-funds", "אי.בי.אי קרנות נאמנות", "fund-manager", [{"name": "IBI", "only_records": IBI_FUNDS}], note="The fund records name the manager אי.בי.אי קרנות נאמנות בע\"מ."),
  row("harel-funds", "הראל קרנות נאמנות", "fund-manager", [{"name": "Harel", "only_records": ["ETF-64", "ETF-66", "TXS-26"]}]),
  row("mor-funds", "מור קרנות נאמנות", "fund-manager", [{"name": "Mor", "only_records": ["ETF-64", "ETF-65", "ETF-66", "ETF-68"]}]),
  row("yalin-funds", "ילין לפידות קרנות נאמנות", "fund-manager", ["Yalin Lapidot"], note="Every record that names Yalin Lapidot is about its funds; its provident company (CMA 513611509) is named by none yet. A record about the provident company needs a row of its own and only_records here."),
  row("migdal-funds", "מגדל קרנות נאמנות", "fund-manager", ["Migdal Mutual Funds", "MTF"], note="MTF is Migdal's fund brand: the fund records name the manager מגדל קרנות נאמנות בע\"מ."),
  row("meitav-funds", "מיטב קרנות נאמנות", "fund-manager", ["Tachlit", {"name": "Meitav", "only_records": ["MF-56"]}], note="Tachlit is Meitav's fund brand: the fund records name the manager מיטב קרנות נאמנות בע\"מ. MF-56 quotes Meitav's fund pages."),
  row("kesem", "קסם קרנות נאמנות", "fund-manager", ["Kesem"]),
  row("ishares", "iShares", "fund-manager", ["iShares"]),
  row("blackrock", "BlackRock", "fund-manager", ["BlackRock"]),
  row("jpmorgan-am", "J.P. Morgan Asset Management", "fund-manager", ["J.P. Morgan Asset Management"]),
  # others
  row("tase", "הבורסה לניירות ערך בתל אביב", "exchange", ["Tel Aviv Stock Exchange"], note="The exchange as a company (settled.md §3): its own documents about itself, its subsidiaries and its data products."),
  row("sp-dji", "S&P Dow Jones Indices", "index-provider", ["S&P Dow Jones Indices"]),
  row("nasdaq", "Nasdaq", "index-provider", ["Nasdaq"]),
  row("msci", "MSCI", "index-provider", ["MSCI"]),
  row("isa", "רשות ניירות ערך", "regulator", ["Israel Securities Authority"], note="As a site owner: its terms about its own content (MF-55)."),
  row("phoenix-insurance", "הפניקס חברה לביטוח", "insurer", [{"name": "The Phoenix", "only_records": ["TXA-29"]}], note="TXA-29 is about a Phoenix investment policy, an insurance product."),
  row("reit1", "ריט 1", "other", ["Reit 1"]),
]
ids = [r["id"] for r in rows]
assert len(ids) == len(set(ids))
assert set(OWN) <= set(ids) and set(FILINGS) <= set(ids)
with open(os.path.join(ROOT, "data/sources/institutions.json"), "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
    f.write("\n")
print(len(rows), "rows")
