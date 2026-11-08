#!/usr/bin/env python3
"""Runs evident-charts' SVG checks (vendor/scripts/check_svg.py, unchanged) on measurements check.mjs has already
taken in Playwright's Chrome, so no Chrome is started per chart. Standard library only.

An HTML chart has no svg to measure: check.mjs measures its text on the page and sends its data colours, which get the same colour-distance
check as an svg's (check_svg.check_cvd: protan, deutan and tritan simulation against check_palette's floor for bars), with colour as the
only cue.

A colour drawn through opacity (a dimmed year) is told from the colour it was given: two drawn colours of one given colour are one series,
and the colour-blindness check doesn't take them for two (check.mjs sends each drawn colour with its given one, `bases`).

stdin:  [{"id": ..., "width": <the chart's px on the page>, "measure": <measure_svg.js's JSON>,
          "bases": [["#drawn", "#given"], ...]}                                                         an svg chart
         {"id": ..., "hexes": ["#RRGGBB", ...], "back": "#RRGGBB"}, ...]                                  an HTML chart
stdout: [{"id": ..., "findings": [{check, severity, where, detail, fix}, ...]}, ...]
"""
import json
import re
import sys
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "vendor" / "scripts"))
import check_svg  # noqa: E402
from check_palette import CVD_FACTOR, DE_FLOOR, Color, de  # noqa: E402

MIN_TEXT_PX = 13  # the site's smallest text (text-xs)


def html_cvd(hexes: list) -> list:
    """check_svg.check_cvd for the colours of an HTML chart's parts (bar marks, no other cue)."""
    found = []
    floor = DE_FLOOR["bar"] * CVD_FACTOR
    for a, b in combinations(hexes, 2):
        ca, cb = Color(a), Color(b)
        d = {v: de(ca, cb, v) for v in ("protan", "deutan", "tritan")}
        red_green = [v for v in ("protan", "deutan") if d[v] < floor]
        if not red_green and d["tritan"] >= floor:
            continue
        v = min(red_green or ["tritan"], key=d.get)
        found.append({"check": "cvd", "severity": "fail" if red_green else "warn", "where": f"{a} x {b}",
                      "detail": f"dE00 {d[v]:.1f} under {v} (floor {floor:.1f}; normal {de(ca, cb):.1f}); color is the only cue",
                      "fix": "Use colours that stay distinct, or say which part is which in words."})
    return found


def given(drawn: str, bases: list) -> str:
    """The colour a drawn colour was given: itself, or the given colour of a drawn one within 3 per channel (rounding)."""
    rgb = [int(drawn[i:i + 2], 16) for i in (1, 3, 5)]
    for d, g in bases:
        if max(abs(a - int(d[i:i + 2], 16)) for a, i in zip(rgb, (1, 3, 5))) <= 3:
            return g.upper()
    return drawn.upper()


def one_series(f: dict, bases: list) -> bool:
    """A cvd finding about two drawn colours of one given colour: one series at two opacities."""
    if f["check"] != "cvd":
        return False
    pair = re.findall(r"#[0-9A-Fa-f]{6}", f["where"])
    return len(pair) == 2 and given(pair[0], bases) == given(pair[1], bases)


out = []
for item in json.load(sys.stdin):
    if "hexes" in item:
        out.append({"id": item["id"], "findings": html_cvd(item["hexes"])})
        continue
    m = item["measure"]
    # each chart is judged at its own width on the page, so small-text reads the px the reader sees
    check_svg.PRESETS["native"] = {**check_svg.PRESETS["blog"], "desc": "the chart's own width on the page",
                                   "width_in": item["width"] / 100, "display_px": item["width"],
                                   "min_text_px": MIN_TEXT_PX}
    if m.get("error"):
        out.append({"id": item["id"], "error": m["error"], "findings": []})
        continue
    c = check_svg.Chart(m, "native")
    for fn in check_svg.SVG_CHECKS:
        fn(c)
    out.append({"id": item["id"], "findings": [f for f in c.findings if not one_series(f, item.get("bases", []))]})
json.dump(out, sys.stdout)
