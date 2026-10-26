"""Write tools/official.json: for each law key, the official files to compare against.

usage: python3 -I tools/build_official.py <wiki-dir> <booklets.json> <out.json>

Consolidated texts published by a government body are listed by hand below (publisher, date, coverage).
Gazette files are added from the Wikisource page's own publication boxes: every ספר החוקים link on
fs.knesset.gov.il (the Knesset's copy of the official gazette), and every קובץ התקנות booklet for which the
repo already holds a Reshumot file-service link (booklets.json). Booklets without such a link are listed
under "booklets_without_official_link".
"""
import json
import re
import sys

wdir, bkfile, outfile = sys.argv[1:4]
bk = json.load(open(bkfile, encoding="utf-8"))

TA = "https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf"
ISA = "https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/"
BTL = "https://www.btl.gov.il/Laws1/"
BOI = "https://boi.org.il/media/"


def c(name, url, publisher, date, covers):
    return {"name": name, "url": url, "publisher": publisher, "kind": "consolidated", "date": date, "covers": covers}


CONS = {
    "ito": [c("ito-btl", BTL + "00_0103_000000.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "file 21.6.2026", "amendments to No. 292 (ס\"ח 3531, 8.6.2026)"),
            c("ito-ta", TA, "רשות המסים", "file 15.1.2023", "amendments to No. 262")],
    "adv": [c("adv-isa", ISA + "al_lobby-628ce07f9490d/Yiutz01.pdf", "רשות ניירות ערך (הוצאת הלכות)", "file 26.8.2026, pages dated to 1.7.2026", "amendment list ends ס\"ח 3510 (31.3.2026)")],
    "sec": [c("sec-isa", ISA + "al_lobby-628ce07f9490d/Nyarot01.pdf", "רשות ניירות ערך (הוצאת הלכות)", "file 26.8.2026", "to be read from its amendment list")],
    "jit": [c("jit-isa", ISA + "al_lobby-628ccfb552dac/Hashka01.pdf", "רשות ניירות ערך (הוצאת הלכות)", "file 31.8.2026, pages dated to 1.4.2026", "amendment list ends Amendment 31 (ס\"ח 3232, 3.7.2024)")],
    "nii": [c("nii-btl", BTL + "00_0001_000000.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "file 7.7.2026", "to be read from its amendment list")],
    "wh-int": [c("wh-int-btl", BTL + "02_0103_100269.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "cg-calc": [c("cg-calc-btl", BTL + "02_0103_100223.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "pf-rules64": [c("pf-rules64-btl", BTL + "02_0103_100022.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "file 18.8.2025", "")],
    "wage": [c("wage-btl", BTL + "00_0106_000000.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "filing": [c("filing-btl", BTL + "02_0103_100009.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "wh-sec": [c("wh-sec-btl", BTL + "02_0103_100228.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "wh-hish": [c("wh-hish-btl", BTL + "02_0103_100097.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "hish-accounts": [c("hish-accounts-btl", BTL + "02_0103_100048.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "health": [c("health-btl", BTL + "00_0003_000000.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "vat": [c("vat-btl", BTL + "00_0022_000000.pdf", "המוסד לביטוח לאומי (נוסח משולב)", "", "")],
    "bank-lic": [c("bank-lic-boi", BOI + "1l3izmkj/124.pdf", "בנק ישראל, קובץ חקיקה בנקאית פריט 124 (הוצאת הלכות)", "file 24.8.2026", "")],
    "bank-cs": [c("bank-cs-boi", BOI + "nvadftgk/150.pdf", "בנק ישראל, קובץ חקיקה בנקאית פריט 150 (הוצאת הלכות)", "file 14.4.2026", "")],
    "bank-disc": [c("bank-disc-boi", BOI + "rvzi1ngd/151.pdf", "בנק ישראל, קובץ חקיקה בנקאית פריט 151", "file 2.2.2015", "amendments to 30.12.2014")],
    "bank-ord": [c("bank-ord-boi", BOI + "s5ub1z12/103.pdf", "בנק ישראל, קובץ חקיקה בנקאית פריט 103", "file 14.1.2025", "amendment lists end at התשפ\"ד")],
}
# laws whose official text is the gazette: take every Knesset gazette link in the Wikisource boxes
GAZETTE_LAWS = {"pfl", "retage", "ins", "pen-adv", "rating", "regfin", "eff-2017"}
# consolidated laws: Knesset gazettes published after the consolidation (by booklet number)
AFTER = {"jit": 3232, "ito": 3531, "adv": 3510}

laws = json.load(open("tools/laws.json", encoding="utf-8"))
out = {}
for l in laws:
    k = l["key"]
    if k == "search":
        continue
    w = json.load(open(f"{wdir}/{k}.json", encoding="utf-8"))
    files = list(CONS.get(k, []))
    missing = []
    for b in w["boxes"]:
        if len(b) < 3:
            continue
        label, title, url = b[0], b[1], b[2]
        if "fs.knesset.gov.il" in url and (k in GAZETTE_LAWS or k in AFTER):
            if k in AFTER:
                # keep only gazettes later than the consolidation: Knesset 25 files after the cut, judged by year label
                if not re.search(r"תשפ״ו|תשפ״ז", label):
                    continue
            name = k + "-" + url.rsplit("/", 1)[1].rsplit(".", 1)[0]
            if not any(f["url"] == url for f in files):
                files.append({"name": name, "url": url, "publisher": "הכנסת (ספר החוקים)", "kind": "gazette", "date": label, "covers": title})
        m = re.search(r"takanot-(\d+)", url)
        if m:
            n = m.group(1)
            if n in bk:
                if not any(f["url"] == bk[n]["url"] for f in files):
                    files.append({"name": f"{k}-kt{n}", "url": bk[n]["url"], "publisher": "רשומות, משרד המשפטים (קובץ התקנות)", "kind": "gazette", "date": label, "covers": title, "booklet": n})
            else:
                missing.append({"booklet": n, "label": label, "title": title})
    out[k] = {"title": l["wikisource_title"], "files": files, "booklets_without_official_link": missing}
json.dump(out, open(outfile, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, v in out.items():
    print(k, len(v["files"]), "files;", len(v["booklets_without_official_link"]), "booklets without link")
