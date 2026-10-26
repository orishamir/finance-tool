"""Extract numeric factor tables from bylaw annex pages, using word coordinates (pdftotext -bbox).

A table is a header line of birth years (or another numeric header, see --header) with rows below it;
each row has a key (age) in a key column at one side of the table, and values aligned under the header
columns. Cells are assigned to the nearest header column by x position, so blank cells stay blank.

usage: python3 -I tables.py <pdf> <first_page> <last_page> [--header years|ages|any] > out.json

Output: a JSON list, one object per table: page, header (labels and x), key_x, rows [{key, cells{label: text}}],
context_above (text lines between the previous table and this header, Hebrew re-ordered for reading),
context_below (lines after the table until the next table or 12 lines). Cell text is copied as printed
("-", "0.00" and blanks are kept as found; blank = missing key)."""
import json
import re
import subprocess
import sys
from html import unescape

NUM = re.compile(r"^-?\d{1,3}(?:,\d{3})*(?:\.\d+)?%?$|^-?\d+(?:\.\d+)?%?$")
YEAR = re.compile(r"^(19[2-9]\d|20[0-3]\d)$")
HEB = re.compile(r"[֐-׿]")


def words(pdf, page):
    out = subprocess.run(["pdftotext", "-bbox", "-f", str(page), "-l", str(page), pdf, "-"],
                         capture_output=True, text=True).stdout
    ws = []
    for m in re.finditer(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', out):
        x0, y0, x1, y1 = map(float, m.groups()[:4])
        t = unescape(m.group(5))
        t = re.sub("[‎‏‪-‮]", "", t)
        if HEB.search(t):
            t = t[::-1]  # bbox output is visual order; reverse Hebrew words for reading
        ws.append({"x0": x0, "x1": x1, "y0": y0, "y1": y1, "xc": (x0 + x1) / 2, "t": t})
    return ws


def lines_of(ws, tol=2.2):
    ws = sorted(ws, key=lambda w: (w["y0"], w["x0"]))
    lines = []
    for w in ws:
        if lines and abs(lines[-1]["y"] - w["y0"]) <= tol:
            lines[-1]["w"].append(w)
        else:
            lines.append({"y": w["y0"], "w": [w]})
    for l in lines:
        l["w"].sort(key=lambda w: w["x0"])
        # join number fragments the PDF stores as separate words ("200" + ".15")
        out = []
        for w in l["w"]:
            if out:
                a = out[-1]
                frag = (re.match(r"^-?[\d.,]+%?$", a["t"]) and re.match(r"^[\d.,]+%?$", w["t"])
                        and (w["t"].startswith(".") or a["t"].endswith(".")))
                if frag and -0.5 <= w["x0"] - a["x1"] < 1.5:
                    a["t"] += w["t"]; a["x1"] = w["x1"]; a["xc"] = (a["x0"] + a["x1"]) / 2
                    continue
            out.append(dict(w))
        l["w"] = out
    return lines


def line_text(l):
    # right-to-left reading: words by descending x; numbers keep their own text
    return " ".join(w["t"] for w in sorted(l["w"], key=lambda w: -w["x0"]))


def header_cols(l, mode):
    if mode == "years":
        c = [w for w in l["w"] if YEAR.match(w["t"])]
        return c if len(c) >= 4 else None
    if mode == "ages":
        c = [w for w in l["w"] if re.match(r"^\d{2}$", w["t"]) and 15 <= int(w["t"]) <= 70]
        return c if len(c) >= 4 else None
    c = [w for w in l["w"] if NUM.match(w["t"])]
    return c if len(c) >= 4 else None


def extract(pdf, first, last, mode="years"):
    tables = []
    for p in range(first, last + 1):
        ls = lines_of(words(pdf, p))
        i = 0
        prev_end = 0
        while i < len(ls):
            cols = header_cols(ls[i], mode)
            if not cols:
                i += 1
                continue
            cols = sorted(cols, key=lambda w: w["xc"])
            xs = [c["xc"] for c in cols]
            gaps = [b - a for a, b in zip(xs, xs[1:])]
            step = sorted(gaps)[len(gaps) // 2]
            # a header word merged with a neighbouring label sits off its column: put it one step from its neighbour
            if gaps[-1] > 1.4 * step:
                xs[-1] = xs[-2] + step
            if gaps[0] > 1.4 * step:
                xs[0] = xs[1] - step
            zlo, zhi = xs[0] - 2.5 * step, xs[-1] + 2.5 * step
            isnum = lambda t: bool(NUM.match(t)) or t in ("-", "--", "\u2013")
            # pass A: the lines that belong to this table
            body = []
            j = i + 1
            started = False
            while j < len(ls) and not header_cols(ls[j], mode):
                toks = [w for w in ls[j]["w"] if zlo <= w["xc"] <= zhi and isnum(w["t"])]
                if len(toks) >= 2:
                    body.append((ls[j], toks))
                    started = True
                elif started:
                    break
                j += 1
            # pass B: cluster token x positions into columns
            allx = sorted((w["xc"], w["t"]) for _, toks in body for w in toks)
            clusters = []
            for x, t in allx:
                if clusters and x - clusters[-1]["xs"][-1] <= 0.3 * step:
                    clusters[-1]["xs"].append(x); clusters[-1]["ts"].append(t)
                else:
                    clusters.append({"xs": [x], "ts": [t]})
            for c in clusters:
                c["x"] = sum(c["xs"]) / len(c["xs"])
                c["int"] = len(c["ts"]) >= 3 and all(re.match(r"^\d{1,3}$", t) and 15 <= int(t) <= 99 for t in c["ts"])
            inner_lo, inner_hi = xs[0] - 0.25 * step, xs[-1] + 0.25 * step
            keys = [c for c in clusters if c["int"] and (c["x"] < inner_lo or c["x"] > inner_hi)]
            key_c = min(keys, key=lambda c: min(abs(c["x"] - xs[0]), abs(c["x"] - xs[-1]))) if keys else None
            vals = [c for c in clusters if c is not key_c and len(c["xs"]) >= 2
                    and xs[0] - 0.6 * step <= c["x"] <= xs[-1] + 0.6 * step]
            # systematic offset between header words and value columns
            offs = []
            for c in vals:
                k = min(range(len(xs)), key=lambda q: abs(xs[q] - c["x"]))
                offs.append(c["x"] - xs[k])
            off = sorted(offs)[len(offs) // 2] if offs else 0.0
            sx = [x + off for x in xs]
            assign = {}
            mapping = "order" if len(vals) == len(cols) else "nearest-shifted"
            for q, c in enumerate(vals):
                if mapping == "order":
                    assign[id(c)] = cols[q]["t"]
                else:
                    k = min(range(len(sx)), key=lambda r: abs(sx[r] - c["x"]))
                    if abs(sx[k] - c["x"]) <= 0.5 * step:
                        assign[id(c)] = cols[k]["t"]
            if len(set(assign.values())) != len(assign):
                mapping += "-COLLISION"
            def cluster_of(x):
                for c in vals:
                    if min(abs(x - y) for y in c["xs"]) < 1e-6:
                        return c
                return None
            key_x = None if key_c is None else key_c["x"]
            rows = []
            for l, toks in body:
                key = None
                cells = {}
                for w in toks:
                    if key_c is not None and abs(w["xc"] - key_x) <= 0.3 * step and re.match(r"^\d{1,3}$", w["t"]):
                        key = int(w["t"])
                        continue
                    c = cluster_of(w["xc"])
                    if c is not None and id(c) in assign:
                        lab = assign[id(c)]
                        cells[lab] = (cells.get(lab, "") + " " + w["t"]).strip()
                if key is not None:
                    rows.append({"key": key, "cells": cells, "y": round(l["y"], 1)})
            above = [line_text(l) for l in ls[prev_end:i]]
            below = []
            k = j
            while k < len(ls) and len(below) < 12 and not header_cols(ls[k], mode):
                below.append(line_text(ls[k]))
                k += 1
            tables.append({
                "page": p,
                "header": [{"label": c["t"], "x": round(c["xc"], 1)} for c in cols],
                "key_x": None if key_x is None else round(key_x, 1),
                "mapping": mapping,
                "value_columns_found": len(vals),
                "header_y": round(ls[i]["y"], 1),
                "rows": rows,
                "context_above": above[-14:],
                "context_below": below,
            })
            prev_end = j
            i = j
    return tables


if __name__ == "__main__":
    pdf, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    mode = "years"
    if "--header" in sys.argv:
        mode = sys.argv[sys.argv.index("--header") + 1]
    json.dump(extract(pdf, a, b, mode), sys.stdout, ensure_ascii=False, indent=1)
