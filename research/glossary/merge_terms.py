"""Merge the glossary parts into one list and check every entry. Prints problems; writes merged.json."""
import json, pathlib, re, sys

DIR = pathlib.Path(__file__).parent / "terms"
PARTS = [
    ("a-cash-bonds.json", "מזומן, פיקדונות, קרנות כספיות ואג״ח ממשלתיות"),
    ("b-securities.json", "ניירות ערך, קרנות סל וחשבון השקעות"),
    ("c-gemel-hishtalmut.json", "קופת גמל להשקעה, קרן השתלמות, ניהול אישי וחיסכון לכל ילד"),
    ("d-pension-tracks.json", "פנסיה, מסלולים ומי מפקח"),
    ("e-tax-dimensions.json", "מס"),
    ("f-tier2.json", "מוצרים שהאתר עוד לא מכסה"),
]
ALLOWED_DIGITS = re.compile(r"S&P 500|ת\"א[- ]?\d+|ת״א[- ]?\d+")

merged, problems = [], []
for fname, group in PARTS:
    f = DIR / fname
    if not f.exists():
        problems.append(f"missing part: {fname}")
        continue
    rows = json.loads(f.read_text())
    for r in rows:
        r["group"] = group if r.get("kind") != "dimension" else "מה לבדוק"
        t = r.get("term_he") or "?"
        e = r.get("explain_he")
        if e is None:
            problems.append(f"[{fname}] no explanation: {t} — {r.get('notes','')[:100]}")
        else:
            if re.search(r"\d", ALLOWED_DIGITS.sub("", e)):
                problems.append(f"[{fname}] digit in explanation: {t}: {e}")
            if len(e.split()) > 22:
                problems.append(f"[{fname}] long ({len(e.split())} words): {t}")
            if re.search(r"[A-Za-z]", ALLOWED_DIGITS.sub("", e)):
                problems.append(f"[{fname}] Latin letters: {t}: {e}")
            if re.search(r"\b(אתה|את)\b(?! ה)", e):
                problems.append(f"[{fname}] singular address?: {t}: {e}")
        s = r.get("source") or {}
        if r.get("kind") != "dimension" and not (s.get("url") and s.get("checked")):
            problems.append(f"[{fname}] incomplete source: {t}")
        merged.append(r)

seen = {}
for r in merged:
    k = (r.get("term_he") or "").strip()
    if k in seen and r.get("kind") != "dimension":
        problems.append(f"duplicate term: {k} ({seen[k]} / {r['group']})")
    seen[k] = r["group"]

(pathlib.Path(__file__).parent / "merged.json")  # read by gen_glossary.py; not committed.write_text(json.dumps(merged, ensure_ascii=False, indent=1))
print(f"{len(merged)} entries, {len(problems)} problems")
for p in problems:
    print(" -", p)
