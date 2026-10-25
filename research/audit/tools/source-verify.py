#!/usr/bin/env python3
"""Source check, closing pass (2026-10-25): every rule source and every figure source in data/rules/.

  python3 research/audit/tools/source-verify.py OUT.json CACHE_DIR

For each source: GET the link (browser user agent, braces and spaces percent-encoded as a browser does; a 403 from a
site that blocks scripts is reported, not judged). For a PDF (by content type or by its first bytes): the cited file
page (`page`, `#page=N` in the URL, or `p.N` in a figure source's title) must exist, and a quoted span of a rule source
must be on that page (exact match of Hebrew letters and digits, else the share of 8-character shingles found).
Nothing in data/ is changed. Needs curl, pdfinfo and pdftotext.
"""
import glob, hashlib, json, os, re, subprocess, sys, urllib.parse
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
out_path, cache = sys.argv[1], sys.argv[2]
os.makedirs(cache, exist_ok=True)


def walk(n, p, out):
    if isinstance(n, dict):
        if isinstance(n.get("source"), dict) and "url" in n["source"]:
            out.append((p, n))
        for k, v in n.items():
            if k != "source":
                walk(v, f"{p}.{k}", out)
    elif isinstance(n, list):
        for i, v in enumerate(n):
            walk(v, f"{p}[{i}]", out)


items = []
for f in sorted(glob.glob("data/rules/*.json")):
    r = json.load(open(f))
    for i, s in enumerate(r.get("sources", [])):
        items.append({"rule": r["id"], "where": f"sources[{i}]", "url": s["url"], "page": s.get("page"), "quote": s.get("quote"),
                      "locator": s.get("locator"), "strength": s["strength"], "checked": s["checked"], "title": s.get("title_he") or s["title"]})
    figs = []
    walk(r.get("figures") or {}, "figures", figs)
    for p, n in figs:
        s = n["source"]
        m = re.search(r"(?<![A-Za-z])pp?\.\s*(\d+)", s.get("title", ""))
        items.append({"rule": r["id"], "where": p, "url": s["url"], "page": int(m.group(1)) if m else None, "quote": None,
                      "locator": None, "strength": s.get("strength"), "checked": n.get("checked"), "title": s.get("title")})

for it in items:
    frag = re.search(r"#page=(\d+)", it["url"])
    if frag and not it["page"]:
        it["page"] = int(frag.group(1))
    it["fetch"] = it["url"].split("#")[0]


def enc(u):
    return urllib.parse.quote(u, safe=":/?&=%#+~;,@!$'()*[]")


def get(url):
    path = os.path.join(cache, hashlib.sha1(url.encode()).hexdigest())
    if not os.path.exists(path + ".meta"):
        r = subprocess.run(["curl", "-g", "-sS", "-L", "-A", UA, "--max-time", "90", "-o", path, "-w", "%{http_code} %{content_type}", enc(url)],
                           capture_output=True, text=True)
        meta = r.stdout.strip() or ("error " + r.stderr.strip()[:80])
        open(path + ".meta", "w").write(meta)
    meta = open(path + ".meta").read()
    is_pdf = os.path.exists(path) and open(path, "rb").read(5) == b"%PDF-"
    return meta, (path if is_pdf else None)


urls = sorted({it["fetch"] for it in items})
with ThreadPoolExecutor(12) as ex:
    res = dict(zip(urls, ex.map(get, urls)))

pages_cache = {}


def norm(t):
    t = re.sub(r"[‎‏‪-‮⁦-⁩]", "", t)
    return re.sub(r"[^א-ת0-9]", "", re.sub(r"[֑-ׇ]", "", t))


def page_text(path, n):
    key = (path, n)
    if key not in pages_cache:
        pages_cache[key] = norm(subprocess.run(["pdftotext", "-f", str(n), "-l", str(n), path, "-"], capture_output=True, text=True).stdout)
    return pages_cache[key]


npages = {}
for it in items:
    meta, pdf = res[it["fetch"]]
    it["status"] = meta
    if not pdf:
        continue
    if pdf not in npages:
        m = re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout)
        npages[pdf] = int(m.group(1)) if m else 0
    it["pdf_pages"] = npages[pdf]
    if it["page"]:
        if it["page"] > npages[pdf]:
            it["page_check"] = f"out-of-range ({npages[pdf]} pages)"
        elif it["quote"]:
            q = norm(it["quote"])
            text = page_text(pdf, it["page"])
            if q[:80] in text:
                it["page_check"] = "quote on page"
            else:
                sh = {q[i:i + 8] for i in range(max(1, len(q) - 7))}
                score = sum(1 for x in sh if x in text) / max(1, len(sh))
                near = [p for p in range(max(1, it["page"] - 2), min(npages[pdf], it["page"] + 2) + 1) if q[:80] in page_text(pdf, p)]
                it["page_check"] = f"quote share {score:.2f}" + (f"; exact on p.{near}" if near else "")
        else:
            it["page_check"] = "in range"

json.dump(items, open(out_path, "w"), ensure_ascii=False, indent=1)
bad = [i for i in items if not i["status"].startswith("200")]
oor = [i for i in items if str(i.get("page_check", "")).startswith("out-of-range")]
weak = [i for i in items if str(i.get("page_check", "")).startswith("quote share")]
print(f"sources {len(items)}, links {len(urls)}, not 200: {len(bad)}, PDF page citations {sum(1 for i in items if i['page'])}, "
      f"out of range: {len(oor)}, quotes checked {sum(1 for i in items if i.get('quote') and i.get('page_check'))}, quotes not found exactly: {len(weak)}")
