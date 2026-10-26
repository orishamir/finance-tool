"""Print every <tr> of an HTML fragment as a list of its cells (text, empty cells kept, rowspan noted, link hrefs kept).
usage: python3 -I tools/table_rows.py <file.html>"""
import json
import sys
from html.parser import HTMLParser


class T(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.row, self.cell, self.attrs, self.skip = [], None, None, {}, 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "tr":
            self.row = {"class": a.get("class", ""), "cells": []}
        elif tag in ("td", "th") and self.row is not None:
            self.cell = {"text": [], "rowspan": a.get("rowspan"), "href": None}
        elif tag == "a" and self.cell is not None:
            self.cell["href"] = a.get("href")
        elif tag == "br" and self.cell is not None:
            self.cell["text"].append(" / ")

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip -= 1
        if tag in ("td", "th") and self.cell is not None and self.row is not None:
            c = self.cell
            c["text"] = " ".join("".join(c["text"]).split())
            self.row["cells"].append(c)
            self.cell = None
        elif tag == "tr" and self.row is not None:
            self.rows.append(self.row)
            self.row = None

    def handle_data(self, data):
        if self.skip or self.cell is None:
            return
        self.cell["text"].append(data)


t = T()
t.feed(open(sys.argv[1], encoding="utf-8", errors="replace").read())
for r in t.rows:
    if not any(c["text"] for c in r["cells"]):
        continue
    print(json.dumps([c["text"] + (f" [rowspan={c['rowspan']}]" if c["rowspan"] else "") + (f" <{c['href']}>" if c["href"] else "") for c in r["cells"]], ensure_ascii=False))
