#!/usr/bin/env python3
"""Source check, first pass (2026-10-25, the founder: TXH-09 cites "עמוד 87" of the Tax Authority guide, but the text is on the
PDF's page 89, which carries the printed number 87).

For every source of every rule in data/rules/:
  - opens the link (a browser user agent; a 403 from a site that blocks scripts is reported, not judged), and
  - for a PDF with a `page`, downloads the file once and compares the cited page with the page numbers printed on the pages:
    "ok" when the file's page N prints N (or prints nothing), "printed" when another file page prints N (the citation used
    the printed number: the link opens the wrong page), "out-of-range" when the file is shorter.

    python3 research/audit/tools/source-check.py OUT.json [CACHE_DIR]

Needs curl and pdftotext. Nothing in data/ is changed.
"""
import glob
import hashlib
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
out_path = sys.argv[1]
cache = sys.argv[2] if len(sys.argv) > 2 else "/tmp/source-check-cache"
os.makedirs(cache, exist_ok=True)

sources = []
for f in sorted(glob.glob("data/rules/*.json")):
    rule = json.load(open(f))
    for i, s in enumerate(rule.get("sources", [])):
        sources.append({"rule": rule["id"], "i": i, **{k: s.get(k) for k in ("url", "title_he", "publisher_he", "kind", "strength", "mirror_host", "locator_he", "page")}})


def is_pdf(url):
    return bool(re.search(r"\.pdf($|[?#])", url or "", re.I)) or "/pdf/" in (url or "")


def fetch_status(url):
    r = subprocess.run(["curl", "-sS", "-L", "-o", "/dev/null", "-A", UA, "--max-time", "40", "-w", "%{http_code} %{content_type}", url], capture_output=True, text=True)
    return r.stdout.strip() or ("error " + r.stderr.strip()[:80])


def download(url):
    path = os.path.join(cache, hashlib.sha1(url.encode()).hexdigest() + ".pdf")
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        subprocess.run(["curl", "-sS", "-L", "-A", UA, "--max-time", "120", "-o", path, url], capture_output=True)
    ok = os.path.exists(path) and open(path, "rb").read(5) == b"%PDF-"
    return path if ok else None


def page_count(path):
    r = subprocess.run(["pdfinfo", path], capture_output=True, text=True)
    m = re.search(r"Pages:\s+(\d+)", r.stdout)
    return int(m.group(1)) if m else 0


def printed_numbers(path, n):
    """The numbers standing apart on one of the first or last three lines of each page: the printed page number, when there is one."""
    labels = {}
    for p in range(1, n + 1):
        text = subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), "-layout", path, "-"], capture_output=True, text=True).stdout
        lines = [re.sub(r"[‎‏‪-‮]", "", l).strip() for l in text.splitlines()]
        lines = [l for l in lines if l]
        edge = lines[:3] + lines[-3:]
        # alone on the line, or set apart from a running title by a wide gap ("87    דע זכויותיך וחובותיך")
        nums = set()
        for l in edge:
            m = re.fullmatch(r"(\d{1,4})", l) or re.match(r"(\d{1,4})\s{3,}\S", l) or re.search(r"\S\s{3,}(\d{1,4})$", l)
            if m:
                nums.add(int(m.group(1)))
        if nums:
            labels[p] = sorted(nums)
    return labels


urls = sorted({s["url"] for s in sources if s["url"]})
with ThreadPoolExecutor(12) as ex:
    status = dict(zip(urls, ex.map(fetch_status, urls)))

pdf_urls = sorted({s["url"] for s in sources if s["page"] and is_pdf(s["url"])})
pdf_info = {}
for url in pdf_urls:
    path = download(url)
    if not path:
        pdf_info[url] = {"error": "not downloaded as a PDF"}
        continue
    n = page_count(path)
    pdf_info[url] = {"pages": n, "labels": printed_numbers(path, n)}

for s in sources:
    s["status"] = status.get(s["url"], "")
    if s["page"] and s["url"] in pdf_info:
        info = pdf_info[s["url"]]
        if "error" in info:
            s["page_check"] = info["error"]
            continue
        p, labels = s["page"], info["labels"]
        if p > info["pages"]:
            s["page_check"] = f"out-of-range (file has {info['pages']} pages)"
        elif p in labels.get(p, []) or p not in labels:
            printed_elsewhere = [q for q, ns in labels.items() if p in ns and q != p]
            s["page_check"] = f"printed: file page {printed_elsewhere[0]} prints {p}" if printed_elsewhere and p not in labels.get(p, []) else "ok"
        else:
            printed_elsewhere = [q for q, ns in labels.items() if p in ns]
            s["page_check"] = f"printed: file page {printed_elsewhere[0]} prints {p}" if printed_elsewhere else f"page {p} prints {labels[p]}"

json.dump(sources, open(out_path, "w"), ensure_ascii=False, indent=1)
bad = [s for s in sources if not s["status"].startswith("200")]
printed = [s for s in sources if str(s.get("page_check", "")).startswith("printed")]
print(f"sources {len(sources)}, links {len(urls)}, not 200: {len(bad)}, PDF page citations {sum(1 for s in sources if s['page'])}, printed-number citations: {len(printed)}")
