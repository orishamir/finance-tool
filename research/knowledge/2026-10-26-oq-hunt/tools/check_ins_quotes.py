"""Check insurance.jsonl quotes word by word against the local text layer of each source.

usage: python3 -I tools/check_ins_quotes.py insurance.jsonl
For each source, every Hebrew word (2+ letters) of the quote must appear somewhere in the mapped local text
(word order is not checked: two-column gazette pages interleave in the text layer). Prints OK or the missing words.
Scanned gazettes have OCR slips in their text layer, so a short MISS list is read against the page image by hand.
"""
import json
import os
import re
import sys

W = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "work")
MAP = {
    "Policy_IncomeTaxInst_hoz19-2002": "ins/circ/hoz19-2002.pdf.txt",
    "Policy_IncomeTaxInst_hoz02-2013": "h2/circ2-2013.pdf.txt",
    "15_lsr_300605": "ins/law132.pdf.txt",
    "15_lsr_300606": "ins/law132fix.pdf.txt",
    "16_ls1_831122": "ins/bill147.pdf.txt",
    "16_lsr_299994": "ins/law147.pdf.txt",
    "16_ls1_830958": "ins/pfbill2005.pdf.txt",
    "02_0103_100269": "wh2005.pdf.txt",
    "LegalInformation_kesher": "ordinance.pdf.txt",
    "Guides_IncomeTax_da-2025": "guide2025.pdf.txt",
    "press_13022025": "h2/mof-team-2025.pdf.txt",
    "arbitrage_committee-07-2026": "ins/arb2026.pdf.txt",
    "adif-web-bucket": "ins/cma2024.pdf.txt",
    "2024-The-cost-of-living-104-Hon": "sw/mevaker2024.pdf.txt",
    "migdal-insurance_12-2024": "ins/migdal2024.pdf.txt",
    "credit-claim41075": "ins/fnx-class41075.txt",
    "savings-routes/faq": "ins/fnx-invest-faq.txt",
    "wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(ביטוח)_(תנאים_בחוזי_ביטוח)": "ins/ws-contract-terms.wiki",
}
BIDI = re.compile("[‪-‮⁦-⁩‎‏֑-ׇ]")


def words(t):
    t = BIDI.sub("", t).replace("׳", "'").replace("״", '"')
    return [w for w in re.findall("[א-ת]+", t) if len(w) >= 2]


cache = {}
for line in open(sys.argv[1], encoding="utf-8"):
    o = json.loads(line)
    for s in o["sources"]:
        key = next((k for k in MAP if k in s["url"]), None)
        if not key:
            print(f"NOMAP {o['code']:12} {s['url'][:80]}")
            continue
        path = os.path.join(W, MAP[key])
        if path not in cache:
            cache[path] = set(words(open(path, encoding="utf-8", errors="replace").read()))
        q = re.sub(r"\[[^\]]*\]", " ", s["quote_he"])
        miss = [w for w in words(q) if w not in cache[path]]
        status = "OK  " if not miss else "MISS"
        print(f"{status} {o['code']:12} {s['locator'][:60]:60} " + (" ".join(miss[:12]) if miss else ""))
