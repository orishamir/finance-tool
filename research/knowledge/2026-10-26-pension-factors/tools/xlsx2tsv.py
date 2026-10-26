"""Dump every sheet of an .xlsx file (read with the standard library only, no macros run) to TSV files.
usage: python3 -I xlsx2tsv.py <file.xlsx> <outdir>
Writes <outdir>/<n>-<sheetname>.tsv; the first column of each row is the row number; cells are written as stored
(numbers as the XML text, shared strings resolved). Also prints sheet names and sizes."""
import sys, os, re, zipfile
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
z = zipfile.ZipFile(src)
shared = []
if "xl/sharedStrings.xml" in z.namelist():
    for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS):
        shared.append("".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])))
wb = ET.fromstring(z.read("xl/workbook.xml"))
rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
relmap = {r.get("Id"): r.get("Target") for r in rels}
def col2n(c):
    n = 0
    for ch in c:
        n = n * 26 + ord(ch) - 64
    return n
for i, sh in enumerate(wb.find("m:sheets", NS)):
    name = sh.get("name")
    target = relmap[sh.get("{%s}id" % NS["r"])]
    path = "xl/" + target.lstrip("/").replace("xl/", "") if not target.startswith("/xl/") else target.lstrip("/")
    root = ET.fromstring(z.read(path))
    rows = []
    maxc = 0
    for row in root.iter("{%s}row" % NS["m"]):
        cells = {}
        for c in row.findall("m:c", NS):
            ref = c.get("r"); t = c.get("t")
            col = col2n(re.match(r"[A-Z]+", ref).group())
            v = c.find("m:v", NS)
            if t == "s" and v is not None:
                val = shared[int(v.text)]
            elif t == "inlineStr":
                val = "".join(x.text or "" for x in c.iter("{%s}t" % NS["m"]))
            else:
                val = v.text if v is not None else ""
            cells[col] = (val or "").replace("\t", " ").replace("\n", " ")
            maxc = max(maxc, col)
        rows.append((row.get("r"), cells))
    safe = re.sub(r"[^\w֐-׿-]+", "_", name)
    fn = os.path.join(outdir, f"{i+1:02d}-{safe}.tsv")
    with open(fn, "w", encoding="utf-8") as f:
        for r, cells in rows:
            f.write(r + "\t" + "\t".join(cells.get(k, "") for k in range(1, maxc + 1)) + "\n")
    print(f"{i+1:02d}\t{name}\trows={len(rows)}\tcols={maxc}\t{fn}")
