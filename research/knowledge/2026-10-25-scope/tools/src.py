#!/usr/bin/env python3
"""src.py: fetch a source once, then read or search it (independent scope review, 2026-10-25).

  python3 src.py get  URL                      fetch (cached) and print type, size, pages
  python3 src.py text URL [--page N] [--max C] print the text (one PDF page, or the whole HTML/JSON)
  python3 src.py find URL "QUOTE" [--page N]   is this quoted span in the source? prints the pages and the sentence around it
  python3 src.py grep URL REGEX [--page N]     regex over the normalised text, with context and page numbers

Fetching: gov.il HTML pages (not /BlobFolder/) go through research/audit/tools/govil-page.sh (FlareSolverr, gov.il
only, allowed by the founder 2026-10-25). Everything else by plain curl. A Cloudflare or captcha page is reported,
never worked around. Cache: $SRC_CACHE or the session scratchpad. Matching ignores everything but Hebrew letters,
Latin letters and digits, and also tries the reversed span (some Hebrew PDFs extract in visual order).
"""
import argparse, hashlib, html, json, os, re, subprocess, sys, urllib.parse

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
CACHE = os.environ.get("SRC_CACHE", "/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/srccache")
REPO = "/home/ori/dev/finance-tool"
os.makedirs(CACHE, exist_ok=True)


def enc(u):
    return urllib.parse.quote(u, safe=":/?&=%#+~;,@!$'()*[]")


def is_govil_html(u):
    return re.match(r"^https://(www\.)?gov\.il/", u) and "/BlobFolder/" not in u and not u.lower().split("?")[0].endswith(".pdf")


def fetch(url):
    url = url.split("#")[0]
    key = hashlib.sha1(url.encode()).hexdigest()
    path = os.path.join(CACHE, key)
    meta = path + ".meta"
    if os.path.exists(meta):
        return path, json.load(open(meta))
    tmp = path + ".tmp%d" % os.getpid()
    if is_govil_html(url):
        r = subprocess.run([os.path.join(REPO, "research/audit/tools/govil-page.sh"), url], capture_output=True, timeout=150)
        open(tmp, "wb").write(r.stdout)
        info = {"url": url, "status": r.stderr.decode(errors="replace").strip()[-200:], "ctype": "text/html", "via": "flaresolverr"}
    else:
        r = subprocess.run(["curl", "-g", "-sS", "-L", "-A", UA, "--max-time", "120", "-o", tmp, "-w", "%{http_code} %{content_type}", enc(url)],
                           capture_output=True, timeout=150)
        out = r.stdout.decode(errors="replace").split(" ", 1)
        info = {"url": url, "status": out[0], "ctype": out[1] if len(out) > 1 else "", "via": "curl", "err": r.stderr.decode(errors="replace")[-200:]}
    head = open(tmp, "rb").read(5) if os.path.exists(tmp) else b""
    info["pdf"] = head.startswith(b"%PDF")
    os.replace(tmp, path) if os.path.exists(tmp) else open(path, "wb").close()
    json.dump(info, open(meta, "w"))
    return path, info


def pages_of(path, info):
    txt = path + ".pages.json"
    if os.path.exists(txt):
        return json.load(open(txt))
    if info.get("pdf"):
        r = subprocess.run(["pdftotext", "-enc", "UTF-8", path, "-"], capture_output=True)
        pages = r.stdout.decode("utf8", errors="replace").split("\f")
        if pages and not pages[-1].strip():
            pages = pages[:-1]
    elif open(path, "rb").read(4) == b"PK\x03\x04":  # docx / xlsx: text from the XML parts
        import zipfile
        z = zipfile.ZipFile(path)
        parts = [n for n in z.namelist() if re.match(r"(word/document|word/footnotes|xl/sharedStrings|xl/worksheets/sheet\d+)\.xml$", n)]
        def body(n):
            x = z.read(n).decode("utf8", errors="replace")
            # drop tracked deletions and struck-through runs (CMA redlines mark deleted text with strike formatting)
            x = re.sub(r"<w:del\b.*?</w:del>", " ", x, flags=re.S)
            x = re.sub(r"<w:r\b(?:(?!</w:r>).)*?<w:strike(?![^>]*w:val=\"(?:0|false)\")[^>]*/>(?:(?!</w:r>).)*?</w:r>", " ", x, flags=re.S)
            x = re.sub(r"</w:p>", "\n", x)
            return re.sub(r"<[^>]+>", "", x)
        t = " \n".join(body(n) for n in parts)
        pages = [html.unescape(re.sub(r"[ \t]+", " ", t))]
    elif open(path, "rb").read(4) == b"\xd0\xcf\x11\xe0":  # old Word .doc: text runs stored as UTF-16LE
        b = open(path, "rb").read()
        t = b.decode("utf-16-le", errors="ignore")
        runs = re.findall(r"[֐-׿A-Za-z0-9 .,;:()\"'%\-–/‎‏\n\r]{6,}", t)
        pages = ["\n".join(r for r in runs if re.search(r"[א-ת]{2}|[A-Za-z]{3}", r))]
    else:
        raw = open(path, "rb").read().decode("utf8", errors="replace")
        if raw.lstrip().startswith("{") or raw.lstrip().startswith("["):
            try:
                pages = [json.dumps(json.loads(raw), ensure_ascii=False, indent=1)]
            except Exception:
                pages = [raw]
        else:
            t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", raw)
            t = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</li>|</tr>|</h\d>", "\n", t)
            t = re.sub(r"<[^>]+>", " ", t)
            t = html.unescape(t)
            t = re.sub(r"[ \t\r]+", " ", t)
            t = re.sub(r"\n\s*\n+", "\n", t)
            pages = [t]
    json.dump(pages, open(txt, "w"), ensure_ascii=False)
    return pages


def norm(t):
    t = re.sub(r"[‎‏‪-‮⁦-⁩]", "", t)
    t = t.replace("״", '"').replace("”", '"').replace("“", '"').replace("׳", "'").replace("’", "'")
    t = re.sub(r"[֑-ׇ]", "", t)
    return re.sub(r"\s+", " ", t)


def squash_map(t):
    keep, idx = [], []
    for i, ch in enumerate(t):
        if re.match(r"[א-תA-Za-z0-9]", ch):
            keep.append(ch.lower())
            idx.append(i)
    return "".join(keep), idx


def warn_block(info, pages):
    body = " ".join(pages)[:4000]
    if re.search(r"(?i)just a moment|cf-chl|captcha|attention required|access denied|are you a robot", body):
        print("WARNING: this looks like a bot-check or block page; do not work around it.", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["get", "text", "find", "grep"])
    ap.add_argument("url")
    ap.add_argument("arg", nargs="?")
    ap.add_argument("--page", type=int)
    ap.add_argument("--max", type=int, default=12000)
    ap.add_argument("--ctx", type=int, default=300)
    a = ap.parse_args()
    path, info = fetch(a.url)
    pages = pages_of(path, info)
    warn_block(info, pages)
    sel = [(a.page, pages[a.page - 1])] if a.page and a.page <= len(pages) else list(enumerate(pages, 1))
    if a.cmd == "get":
        print(json.dumps(info, ensure_ascii=False), "pages:", len(pages), "chars:", sum(len(p) for p in pages))
    elif a.cmd == "text":
        if info.get("pdf"):
            out = "\n".join("[page %d]\n%s" % (n, p) for n, p in sel)
        else:
            out = "\n".join(norm(p) for _, p in sel)
        print(out[: a.max])
    elif a.cmd == "find":
        q, _ = squash_map(norm(a.arg))
        hits = 0
        for n, p in sel:
            pn = norm(p)
            s, idx = squash_map(pn)
            for cand, label in ((q, "as is"), (q[::-1], "reversed")):
                if len(cand) < 6:
                    continue
                probe = cand[:80]
                pos = s.find(probe)
                if pos >= 0:
                    hits += 1
                    st = idx[pos]
                    en = idx[min(pos + len(cand), len(idx)) - 1]
                    print("FOUND page %s (%s): ...%s..." % (n, label, pn[max(0, st - a.ctx): en + a.ctx].strip()))
                    break
        if not hits:
            print("NOT FOUND (%d pages searched)" % len(sel))
    elif a.cmd == "grep":
        rx = re.compile(a.arg)
        k = 0
        for n, p in sel:
            pn = norm(p)
            for m in rx.finditer(pn):
                k += 1
                print("page %s: ...%s..." % (n, pn[max(0, m.start() - a.ctx): m.end() + a.ctx].strip()))
                if k > 40:
                    print("(more matches cut)")
                    return
        if not k:
            print("NO MATCH (%d pages searched)" % len(sel))


main()
