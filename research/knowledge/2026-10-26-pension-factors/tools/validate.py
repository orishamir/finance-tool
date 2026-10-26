"""Check extracted old-age conversion tables.

For each table and row:
 1. text check: the row's values, in the header's left-to-right order, appear as one run of tokens on a line of
    the page's `pdftotext -layout` text (an independent read of the same page);
 2. staircase: the filled cells of a row are contiguous and start at the youngest birth-year column
    (older cohorts are blank, "-" or "0.00" at the younger ages);
 3. monotonic: within a row the factor rises from older to younger cohort; within a column it falls with age.
Prints one line per table and a total. usage: python3 -I validate.py <pdf> <tables.json>"""
import json
import re
import subprocess
import sys

pdf, tj = sys.argv[1], sys.argv[2]
tables = json.load(open(tj, encoding="utf-8"))
pages = {}


def layout(p):
    if p not in pages:
        t = subprocess.run(["pdftotext", "-layout", "-f", str(p), "-l", str(p), pdf, "-"], capture_output=True, text=True).stdout
        t = re.sub("[‎‏‪-‮]", "", t)
        pages[p] = [l.split() for l in t.split("\n")]
    return pages[p]


def blank(v):
    return v is None or v in ("", "-", "--", "–", "0.00", "0")


tot = {"rows": 0, "text_ok": 0, "stair_bad": 0, "mono_bad": 0}
for n, t in enumerate(tables):
    hdr = [h["label"] for h in sorted(t["header"], key=lambda h: h["x"])]  # left-to-right
    years = sorted(hdr, key=int)
    text_ok = stair_bad = mono_bad = 0
    issues = []
    rows = [r for r in t["rows"] if any(not blank(v) for v in r["cells"].values())]
    lines = layout(t["page"])
    for r in rows:
        seq = [r["cells"].get(h) for h in hdr]
        vals = [v for v in seq if not blank(v)]
        # 1. text check
        ok = False
        for toks in lines:
            for s in range(0, len(toks) - len(vals) + 1):
                if toks[s:s + len(vals)] == vals:
                    ok = True
                    break
            if ok:
                break
        text_ok += ok
        if not ok:
            issues.append(f"text:{r['key']}")
        # 2. staircase over years ascending (oldest cohort first): blanks then values, no gaps
        f = [not blank(r["cells"].get(y)) for y in years]
        first = f.index(True)
        if not all(f[first:]):
            stair_bad += 1
            issues.append(f"stair:{r['key']}")
        # 3. monotonic in cohort
        nums = [float(r["cells"][y]) for y in years if not blank(r["cells"].get(y))]
        if any(b < a for a, b in zip(nums, nums[1:])):
            mono_bad += 1
            issues.append(f"cohort:{r['key']}")
    # 3b. monotonic in age within each column
    for y in years:
        col = [(r["key"], float(r["cells"][y])) for r in rows if not blank(r["cells"].get(y))]
        col.sort()
        if any(b[1] > a[1] for a, b in zip(col, col[1:])):
            mono_bad += 1
            issues.append(f"age:{y}")
    tot["rows"] += len(rows); tot["text_ok"] += text_ok; tot["stair_bad"] += stair_bad; tot["mono_bad"] += mono_bad
    print(f"#{n} p{t['page']} rows={len(rows)} text_ok={text_ok} stair_bad={stair_bad} mono_bad={mono_bad} {' '.join(issues[:8])}")
print("TOTAL", tot)
