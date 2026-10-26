"""Extract a keyed numeric table whose column labels are not numbers (e.g. sex x insurance end age), by column order.

Rows are lines that carry an integer key (an age, 15-99) in the key column at the left or right edge of the numeric
block; value columns are found by clustering the x positions of the numbers on those rows, and are returned
left-to-right. The caller labels the columns after reading the page (labels are not guessed here).

usage: python3 -I cols.py <pdf> <page> [y_from y_to] > out.json
Output: {page, key_x, columns:[{x, n}], rows:[{key, values:[text or null per column]}]}"""
import json
import re
import sys

sys.path.insert(0, __import__("os").path.dirname(__file__))
from tables import NUM, words, lines_of  # noqa: E402


def extract(pdf, page, y0=None, y1=None):
    ls = lines_of(words(pdf, page))
    if y0 is not None:
        ls = [l for l in ls if y0 <= l["y"] <= y1]
    isnum = lambda t: bool(NUM.match(t)) or t in ("-", "--", "–")
    toks = [(l, w) for l in ls for w in l["w"] if isnum(w["t"])]
    xs = sorted(w["xc"] for _, w in toks)
    # cluster x with a gap of 9pt
    cl = []
    for x in xs:
        if cl and x - cl[-1][-1] <= 9:
            cl[-1].append(x)
        else:
            cl.append([x])
    cents = [sum(c) / len(c) for c in cl]
    # key cluster: an edge cluster of integers 15..99 with >= 5 hits
    def is_key_cluster(c):
        ts = [w["t"] for _, w in toks if min(abs(w["xc"] - y) for y in c) < 1e-6]
        return len(ts) >= 5 and sum(1 for t in ts if re.match(r"^\d{1,2}$", t) and 15 <= int(t) <= 99) >= 0.9 * len(ts)
    big = [i for i, c in enumerate(cl) if len(c) >= 5]
    key_i = None
    for i in (big[-1], big[0]) if big else ():
        if is_key_cluster(cl[i]):
            key_i = i
            break
    if key_i is None:
        return {"page": page, "error": "no key column"}
    key_x = cents[key_i]
    rows = []
    for l in ls:
        k = [w for w in l["w"] if abs(w["xc"] - key_x) <= 9 and re.match(r"^\d{1,2}$", w["t"])]
        if not k:
            continue
        rows.append((l, int(k[0]["t"])))
    # value columns: clusters (other than the key) with numbers on at least 3 keyed rows
    keyed_y = {round(l["y"], 1) for l, _ in rows}
    vcols = []
    for i, c in enumerate(cl):
        if i == key_i:
            continue
        n = sum(1 for l, w in toks if round(l["y"], 1) in keyed_y and min(abs(w["xc"] - y) for y in c) < 1e-6)
        if n >= 3:
            vcols.append({"x": round(cents[i], 1), "n": n, "members": c})
    out_rows = []
    for l, key in rows:
        vals = [None] * len(vcols)
        for w in l["w"]:
            if not isnum(w["t"]) or abs(w["xc"] - key_x) <= 9:
                continue
            for j, c in enumerate(vcols):
                if min(abs(w["xc"] - y) for y in c["members"]) < 1e-6:
                    vals[j] = w["t"] if vals[j] is None else vals[j] + " " + w["t"]
        out_rows.append({"key": key, "y": round(l["y"], 1), "values": vals})
    return {"page": page, "key_x": round(key_x, 1),
            "columns": [{"x": c["x"], "n": c["n"]} for c in vcols], "rows": out_rows}


if __name__ == "__main__":
    pdf, page = sys.argv[1], int(sys.argv[2])
    y0 = float(sys.argv[3]) if len(sys.argv) > 4 else None
    y1 = float(sys.argv[4]) if len(sys.argv) > 4 else None
    json.dump(extract(pdf, page, y0, y1), sys.stdout, ensure_ascii=False, indent=1)
