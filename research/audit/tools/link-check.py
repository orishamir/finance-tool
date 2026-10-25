#!/usr/bin/env python3
"""Link check (2026-10-25, the founder: the source link of track 12538 was broken; data.gov.il moved its dataset pages).

Collects every unique http(s) URL
  - in data/**/*.json (every string value, so a URL inside a note counts),
  - in site/app/** (the source; URLs that appear only in *.test.* files are fixtures and are not fetched),
  - and, with --build DIR, every external href of the pre-rendered site (this catches links the code builds at run time),
fetches each one and writes a class per URL:

  ok       the final answer is 2xx on the same document (a redirect that only adds https, www or a slash is still ok)
  moved    a redirect lands on a different address that works (the new address is recorded)
  broken   404, 410, a DNS failure, a page whose title says "not found", or a redirect to a known not-found page
  blocked  403 or a bot challenge (not worked around; a person opens these in a browser)
  error    a timeout, a TLS or connection problem, or any other status
  skipped  a placeholder host (a.example, https://x/...) or an address built from a template

How each kind of address is checked:
  - data.gov.il: through the CKAN API (package_show / resource_show), and for a dataset page also the new address
    https://data.gov.il/he/datasets/<organization>/<name>; an old-format dataset address (/dataset/<name>) is reported as
    broken together with the new address to use. The HTML pages are also fetched once, but only the API decides.
  - www.gov.il HTML pages: research/audit/tools/govil-page.sh (FlareSolverr, gov.il only, ~15 s each, one at a time).
    Files under /BlobFolder/ and other non-HTML files are fetched with curl like any other site.
  - everything else: curl, GET, browser user agent, redirects followed, a size cap, 2 parallel requests per site with a
    pause between them. A bot check on any other site is reported as `blocked` and never worked around.

The site's own links (--build DIR, base path /finance-tool/): every internal href and src in the pre-rendered HTML must
resolve to a pre-rendered page or file; a #fragment must exist as an id on the target page.

    python3 -I research/audit/tools/link-check.py --out research/audit/2026-10-25-link-check.json \\
        --build /path/to/site/build/client [--cache /path/cache.jsonl] [--only-internal] [--skip-govil]

Run it from the repository root. Needs curl (8.x) and python 3. Nothing in data/ or site/ is changed. --cache FILE (JSON lines)
lets a rerun skip the addresses already checked.
"""
import argparse
import collections
import concurrent.futures
import glob
import html
import json
import os
import re
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse

ROOT = os.getcwd()
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
GOVIL_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "govil-page.sh")
BASE = "/finance-tool/"
MAX_BODY = 3_000_000  # curl stops after this many bytes; the status is already known by then
PER_HOST = 2  # parallel requests per site
HOST_GAP = 0.5  # seconds between two request starts on one site

# 2 or 3 labels: the "site" that the politeness limit applies to (tase.co.il covers maya., mayafiles., market., ...).
SECOND_LEVEL = {"co", "gov", "org", "ac", "com", "net", "muni"}

URL_RE = re.compile(r"https?://(?:[^\s\"'<>`\\{}]|\{[^{}]*\})+")
# a value in a JSON file is not quoted by ', so an apostrophe belongs to the address (Knesset OData filters: substringof('...',Name))
URL_RE_JSON = re.compile(r"https?://(?:[^\s\"<>`\\{}]|\{[^{}]*\})+")
NOT_FOUND_URL = re.compile(r"/(404|not-?found|page-?not-?found|pagenotfound|error)(/|\.|$|\?)|/he/dataset/", re.I)
NOT_FOUND_TITLE = re.compile(r"(^|\W)(404|not found|page not found|does not exist|no longer available)(\W|$)|לא נמצא|שגיאה|אינו קיים|אינה קיימת|העמוד שחיפשת|הדף המבוקש", re.I)
CHALLENGE_TITLE = re.compile(r"just a moment|attention required|access denied|are you a robot|robot or human|security check|checking your browser|captcha|verify you are human|request unsuccessful|incapsula|radware", re.I)
CHALLENGE_BODY = re.compile(r"cf-browser-verification|cf-challenge|challenge-platform|_incapsula_|px-captcha|g-recaptcha|h-captcha|cf-mitigated|Pardon Our Interruption", re.I)
PLACEHOLDER_HOST = re.compile(r"^(?:[a-z]|example\.[a-z.]+|e\.com)$", re.I)


def registrable(host):
    labels = host.lower().split(".")
    if len(labels) >= 3 and labels[-1] == "il" and labels[-2] in SECOND_LEVEL:
        return ".".join(labels[-3:])
    return ".".join(labels[-2:])


def clean(u):
    while u and u[-1] in ".,;:!?'\"":
        u = u[:-1]
    while u.endswith(")") and u.count(")") > u.count("("):
        u = u[:-1]
    return u


def urls_in(text, json_value=False):
    return [clean(m.group(0)) for m in (URL_RE_JSON if json_value else URL_RE).finditer(text)]


# ---------------------------------------------------------------------------------------------------------------- collect
def walk_json(node, path, out, file):
    if isinstance(node, str):
        for u in urls_in(node, json_value=True):
            out.append((u, file, path))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk_json(v, path + [str(i)], out, file)
    elif isinstance(node, dict):
        for k, v in node.items():
            walk_json(v, path + [k], out, file)


def collect(build):
    hits = []  # (url, file, ref)
    for dp, dn, fn in os.walk(os.path.join(ROOT, "data")):
        for f in sorted(fn):
            if not f.endswith(".json"):
                continue
            p = os.path.join(dp, f)
            doc = json.load(open(p, encoding="utf8"))
            local = []
            walk_json(doc, [], local, os.path.relpath(p, ROOT))
            ident = doc.get("id") if isinstance(doc, dict) else None
            for u, file, path in local:
                hits.append((u, file, ident or "/".join(path[:3])))
    for dp, dn, fn in os.walk(os.path.join(ROOT, "site/app")):
        for f in sorted(fn):
            p = os.path.join(dp, f)
            try:
                text = open(p, encoding="utf8").read()
            except (UnicodeDecodeError, OSError):
                continue
            rel = os.path.relpath(p, ROOT)
            for i, line in enumerate(text.splitlines(), 1):
                for u in urls_in(line):
                    hits.append((u, rel, f"line {i}"))
    if build:
        pages = 0
        for dp, dn, fn in os.walk(build):
            for f in fn:
                if f.endswith(".html"):
                    pages += 1
                    t = open(os.path.join(dp, f), encoding="utf8").read()
                    rel = os.path.relpath(os.path.join(dp, f), build)
                    for m in re.finditer(r'\bhref="(https?://[^"]*)"', t):
                        hits.append((html.unescape(m.group(1)), "site build", "/" + rel.replace("index.html", "")))
    uses = collections.defaultdict(lambda: collections.defaultdict(lambda: {"count": 0, "refs": []}))
    for u, file, ref in hits:
        e = uses[u][file]
        e["count"] += 1
        if ref not in e["refs"] and len(e["refs"]) < 6:
            e["refs"].append(ref)
    return uses


def skip_reason(url, files):
    p = urllib.parse.urlsplit(url)
    host = p.hostname or ""
    if "${" in url or ("{" in url and "}" not in url):
        return "template or truncated address"
    if "." not in host or PLACEHOLDER_HOST.match(host):
        return "placeholder host"
    if all(f.endswith((".test.ts", ".test.tsx")) for f in files):
        return "test fixture only"
    return None


# ---------------------------------------------------------------------------------------------------------------- fetch
_host_state = {}
_state_lock = threading.Lock()


def host_slot(host):
    with _state_lock:
        if host not in _host_state:
            _host_state[host] = {"sem": threading.Semaphore(PER_HOST), "last": 0.0, "lock": threading.Lock()}
        return _host_state[host]


class polite:
    def __init__(self, url):
        self.s = host_slot(registrable(urllib.parse.urlsplit(url).hostname or ""))

    def __enter__(self):
        self.s["sem"].acquire()
        with self.s["lock"]:
            wait = self.s["last"] + HOST_GAP - time.time()
            if wait > 0:
                time.sleep(wait)
            self.s["last"] = time.time()

    def __exit__(self, *a):
        self.s["sem"].release()


def encode(url):
    """Percent-encode what is not ASCII (Hebrew in wikisource addresses); keep the rest, drop the fragment."""
    u = urllib.parse.urldefrag(url)[0]
    return urllib.parse.quote(u, safe="%/:?#[]@!$&'()*+,;=~-._")


def curl_get(url, tries=2, insecure=False):
    """One GET with redirects. Returns dict: code, final, ctype, size, exit, err, title, challenge, redirects."""
    fetch = encode(url)
    out = {}
    for attempt in range(tries):
        fd, body = tempfile.mkstemp(prefix="linkcheck-")
        os.close(fd)
        try:
            with polite(url):
                r = subprocess.run(
                    ["curl", "-g", "-sS", "-L", *(["-k"] if insecure else []), "--max-redirs", "10", "-A", UA, "--compressed", "-m", "45", "--connect-timeout", "15",
                     "--max-filesize", str(MAX_BODY), "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                     "-H", "Accept-Language: he-IL,he;q=0.9,en;q=0.8", "-o", body,
                     "-w", "%{http_code}\t%{url_effective}\t%{num_redirects}\t%{content_type}\t%{size_download}", fetch],
                    capture_output=True, text=True, timeout=70)
            parts = (r.stdout.strip().split("\t") + [""] * 5)[:5]
            code = int(parts[0]) if parts[0].isdigit() else 0
            out = {"code": code, "final": urllib.parse.unquote(parts[1]) if parts[1] else "", "redirects": int(parts[2] or 0),
                   "ctype": parts[3].split(";")[0].strip().lower(), "size": parts[4], "exit": r.returncode, "err": r.stderr.strip()[:160]}
            title, text = "", ""
            if out["ctype"] == "application/pdf" and os.path.getsize(body) > 0:
                out["not_pdf"] = open(body, "rb").read(5) != b"%PDF-"
            if out["ctype"] in ("text/html", "application/xhtml+xml", "") and os.path.getsize(body) > 0:
                text = open(body, "rb").read(200_000).decode("utf-8", "replace")
                m = re.search(r"<title[^>]*>(.*?)</title>", text, re.S | re.I)
                title = html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()[:120] if m else ""
            out["title"] = title
            out["challenge"] = bool(CHALLENGE_TITLE.search(title)) or bool(CHALLENGE_BODY.search(text[:60_000]) and code != 200)
            out["small_html"] = bool(text) and len(text) < 600
        except subprocess.TimeoutExpired:
            out = {"code": 0, "final": "", "redirects": 0, "ctype": "", "size": "0", "exit": 28, "err": "timeout", "title": "", "challenge": False}
        finally:
            os.unlink(body)
        retry = out["exit"] in (28, 52, 56, 35, 18) or out["code"] in (429, 500, 502, 503, 504)
        if out["challenge"] or not retry or attempt == tries - 1:
            break
        time.sleep(4)
    return out


def canon(u):
    p = urllib.parse.urlsplit(urllib.parse.unquote(urllib.parse.urldefrag(u)[0]))
    host = (p.hostname or "").lower()
    host = host[4:] if host.startswith("www.") else host
    path = p.path.rstrip("/") or ""
    return (host, path.lower(), p.query)


def classify_curl(url, r):
    """Returns (class, note)."""
    code, final = r["code"], r["final"]
    if r["exit"] == 6:
        return "broken", "DNS failure (host does not resolve)"
    if r["challenge"] and code not in (404, 410):
        return "blocked", f"bot challenge ({code}{', ' + r['title'] if r['title'] else ''})"
    if code in (404, 410):
        return "broken", f"HTTP {code}"
    if code == 403:
        return "blocked", "HTTP 403"
    if r["exit"] not in (0, 63) or code == 0:
        return "error", (r["err"] or f"curl exit {r['exit']}")[:120]
    if not (200 <= code < 300):
        return "error", f"HTTP {code}"
    if NOT_FOUND_URL.search(urllib.parse.urlsplit(final).path) and not NOT_FOUND_URL.search(urllib.parse.urlsplit(url).path):
        return "broken", f"redirect to a not-found page ({final})"
    if r.get("not_pdf"):
        return "error", "the content type says PDF but the body is not a PDF"
    if r["title"] and NOT_FOUND_TITLE.search(r["title"]) and (r["ctype"] or "text/html") == "text/html":
        return "broken", f"page says not found: \"{r['title']}\""
    if canon(final) != canon(url):
        a, b = canon(url), canon(final)
        note = f"redirects to {final}"
        if b[1] in ("", "/he", "/en", "/index.html", "/he/pages") and a[1] not in ("", "/he", "/en"):
            note += " (a generic landing page: the document may be gone)"
        return "moved", note
    return "ok", ("redirects within the same address (https, www or slash)" if r["redirects"] else "")


# ---------------------------------------------------------------------------------------------------------------- data.gov.il
def ckan(action, **params):
    q = urllib.parse.urlencode(params)
    r = curl_json(f"https://data.gov.il/api/3/action/{action}?{q}")
    return r


def curl_json(url):
    with polite(url):
        r = subprocess.run(["curl", "-g", "-sS", "-L", "-A", UA, "-m", "40", "-w", "\n%{http_code}", url], capture_output=True, text=True)
    body, _, code = r.stdout.rpartition("\n")
    try:
        j = json.loads(body)
    except ValueError:
        j = None
    return {"code": int(code) if code.isdigit() else 0, "json": j}


def check_datagov(url):
    p = urllib.parse.urlsplit(url)
    path = urllib.parse.unquote(p.path)
    api = None
    new = None
    m_old = re.fullmatch(r"/dataset/([^/]+)/?", path)
    m_new = re.fullmatch(r"/(?:he|en|ar)/datasets/([^/]+)/([^/]+)/?", path)
    m_res = re.fullmatch(r"/dataset/([^/]+)/resource/([^/]+)/download/.*", path)
    if m_old or m_new:
        ident = m_old.group(1) if m_old else m_new.group(2)
        pkg = ckan("package_show", id=ident)
        res = (pkg["json"] or {}).get("result") if pkg["json"] and pkg["json"].get("success") else None
        if res:
            org = (res.get("organization") or {}).get("name", "")
            new = f"https://data.gov.il/he/datasets/{org}/{res['name']}"
            api = f"package_show ok: name={res['name']}, organization={org}"
        else:
            return {"class": "broken", "status": pkg["code"], "final": "", "note": f"package_show finds no dataset '{ident}'", "method": "api"}
        g = curl_get(url, tries=1)
        if m_old:
            return {"class": "broken", "status": g["code"], "final": g["final"], "suggested": new,
                    "note": f"old address format ({'redirects to ' + g['final'] + ', ' if g['final'] else ''}HTTP {g['code']}); {api}", "method": "api+curl"}
        if new.rstrip("/") != url.rstrip("/"):
            return {"class": "moved", "status": g["code"], "final": new, "suggested": new, "note": f"organization or name differs from the API; {api}", "method": "api+curl"}
        c, n = classify_curl(url, g)
        return {"class": "ok" if c in ("ok", "blocked", "error") else c, "status": g["code"], "final": g["final"], "note": api + ("" if c == "ok" else f"; page fetch: {c} {n}"), "method": "api+curl"}
    if m_res:
        rid = m_res.group(2)
        res = ckan("resource_show", id=rid)
        j = res["json"] or {}
        if not j.get("success"):
            return {"class": "broken", "status": res["code"], "final": "", "note": f"resource_show finds no resource {rid}", "method": "api"}
        r = j["result"]
        g = curl_get(url, tries=1)
        c, n = classify_curl(url, g)
        note = f"resource_show ok (package {r.get('package_id')}, state {r.get('state')}); file fetch: {c}"
        if r.get("package_id") and r["package_id"] != m_res.group(1):
            return {"class": "moved", "status": g["code"], "final": g["final"], "note": note + "; the dataset id in the address differs from the resource's package_id", "method": "api+curl"}
        return {"class": c, "status": g["code"], "final": g["final"], "note": note + (f" ({n})" if n else ""), "method": "api+curl"}
    g = curl_get(url, tries=1)
    c, n = classify_curl(url, g)
    note = n
    if path.startswith("/api/3/action/") and c == "broken" and "datastore_search" in path:
        rid = dict(urllib.parse.parse_qsl(p.query)).get("resource_id")
        if rid:
            chk = ckan("datastore_search", resource_id=rid, limit=1)
            if chk["json"] and chk["json"].get("success"):
                return {"class": "ok", "status": 200, "final": url, "note": f"the example filters make the call fail ({g['code']}); the resource {rid} answers without them", "method": "api"}
    return {"class": c, "status": g["code"], "final": g["final"], "note": note, "method": "curl"}


# ---------------------------------------------------------------------------------------------------------------- gov.il
GOVIL_FILE = re.compile(r"/BlobFolder/|\.(pdf|xlsx?|docx?|csv|zip|pptx?)(\?|#|$)", re.I)


def is_govil_html(url):
    p = urllib.parse.urlsplit(url)
    return (p.hostname or "") in ("www.gov.il", "gov.il") and not GOVIL_FILE.search(url)


def check_govil(url):
    fetch = urllib.parse.urldefrag(url)[0]
    try:
        r = subprocess.run(["bash", GOVIL_SCRIPT, fetch], capture_output=True, text=True, timeout=150)
    except subprocess.TimeoutExpired:
        return {"class": "error", "status": 0, "final": "", "note": "FlareSolverr timed out", "method": "flaresolverr"}
    line = (r.stderr.strip().splitlines() or [""])[-1]
    parts = line.split(" ", 2)
    status = parts[1] if len(parts) > 1 else ""
    final = parts[2] if len(parts) > 2 else ""
    page = r.stdout
    m = re.search(r"<title[^>]*>(.*?)</title>", page, re.S | re.I)
    title = html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()[:120] if m else ""
    base = {"status": int(status) if status.isdigit() else 0, "final": final, "title": title, "method": "flaresolverr"}
    if not status.isdigit():
        return {**base, "class": "error", "note": f"FlareSolverr gave no answer ({line or r.stderr.strip()[:100]})"}
    code = int(status)
    if code in (404, 410) or (title and NOT_FOUND_TITLE.search(title)) or NOT_FOUND_URL.search(urllib.parse.urlsplit(final).path):
        return {**base, "class": "broken", "note": f"HTTP {code}{', title: ' + title if title else ''}"}
    if code != 200:
        return {**base, "class": "error", "note": f"HTTP {code}"}
    if len(page) < 3000:
        return {**base, "class": "error", "note": f"only a bare page frame came back ({len(page)} bytes); open it in a browser"}
    if final and canon(final) != canon(url):
        return {**base, "class": "moved", "note": f"redirects to {final}"}
    return {**base, "class": "ok", "note": ""}


# ---------------------------------------------------------------------------------------------------------------- run
def check_url(url):
    host = urllib.parse.urlsplit(url).hostname or ""
    try:
        if host == "data.gov.il":
            return check_datagov(url)
        if is_govil_html(url):
            return check_govil(url)
        r = curl_get(url)
        c, n = classify_curl(url, r)
        if c == "error" and r["exit"] == 60:
            # diagnostic only: is the content there when the certificate chain is not checked? (a server that omits its intermediate
            # certificate fails in curl but usually opens in a browser, which fetches the missing one)
            k = curl_get(url, tries=1, insecure=True)
            n += f" | without certificate checking: HTTP {k['code']}, {k['ctype'] or 'no content type'}" + (f", title \"{k['title']}\"" if k["title"] else "")
        return {"class": c, "status": r["code"], "final": r["final"], "note": n, "ctype": r["ctype"], "title": r["title"], "method": "curl"}
    except Exception as e:  # never lose a whole run to one address
        return {"class": "error", "status": 0, "final": "", "note": f"checker failed: {type(e).__name__}: {e}"[:200], "method": "none"}


def run_all(uses, cache_path, skip_govil, refresh):
    cached = {}
    if cache_path and os.path.exists(cache_path) and not refresh:
        for line in open(cache_path, encoding="utf8"):
            try:
                d = json.loads(line)
                cached[d["url"]] = d
            except ValueError:
                pass
    results = {}
    todo_http, todo_gov = [], []
    for url, files in uses.items():
        why = skip_reason(url, files.keys())
        if why:
            results[url] = {"url": url, "class": "skipped", "note": why, "status": 0, "final": "", "method": "none"}
        elif url in cached:
            results[url] = cached[url]
        elif is_govil_html(url):
            if skip_govil:
                results[url] = {"url": url, "class": "error", "note": "not checked (--skip-govil)", "status": 0, "final": "", "method": "none"}
            else:
                todo_gov.append(url)
        else:
            todo_http.append(url)
    # one URL per fetch key (the fragment is not sent)
    lock = threading.Lock()
    cache_f = open(cache_path, "a", encoding="utf8") if cache_path else None
    done = [0]
    total = len(todo_http) + len(todo_gov)

    def work(url):
        r = {"url": url, **check_url(url)}
        with lock:
            results[url] = r
            done[0] += 1
            if cache_f:
                cache_f.write(json.dumps(r, ensure_ascii=False) + "\n")
                cache_f.flush()
            if done[0] % 25 == 0:
                print(f"  {done[0]}/{total}", file=sys.stderr, flush=True)

    # interleave hosts so one slow site does not hold the queue
    by_host = collections.defaultdict(list)
    for u in todo_http:
        by_host[registrable(urllib.parse.urlsplit(u).hostname or "")].append(u)
    order = []
    while any(by_host.values()):
        for h in list(by_host):
            if by_host[h]:
                order.append(by_host[h].pop(0))
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        futs = [pool.submit(work, u) for u in order]
        gov = threading.Thread(target=lambda: [work(u) for u in todo_gov])
        gov.start()
        for f in futs:
            f.result()
        gov.join()
    return results


def mark_weak(results):
    """A single-page app answers 200 with its shell for any path, so `ok` says only that the address answers. A page whose title
    is empty, or is the same on two or more addresses of one site, is marked weak: it needs a person (or a browser) to be judged."""
    groups = collections.defaultdict(set)
    for r in results.values():
        if r["class"] == "ok" and r.get("method") == "curl" and "html" in (r.get("ctype") or ""):
            groups[(r["host"] if "host" in r else urllib.parse.urlsplit(r["url"]).hostname, r.get("title", ""))].add(r["url"])
    for r in results.values():
        if r["class"] == "ok" and r.get("method") == "curl" and "html" in (r.get("ctype") or ""):
            host = r["host"] if "host" in r else urllib.parse.urlsplit(r["url"]).hostname
            if not r.get("title"):
                r["weak"] = "HTML page without a title (a single-page app shell is possible): the address answers, the page is not judged"
            elif len(groups[(host, r["title"])]) >= 2:
                r["weak"] = f"{len(groups[(host, r['title'])])} addresses of this site give the same title (\"{r['title'][:40]}\"): the address answers, the page is not judged"


# ---------------------------------------------------------------------------------------------------------------- internal
def check_internal(build):
    files = set()
    for dp, dn, fn in os.walk(build):
        for f in fn:
            files.add(os.path.relpath(os.path.join(dp, f), build).replace(os.sep, "/"))
    ids_cache = {}
    # The rules page draws its cards in the browser and scrolls to #<RULE-ID> after drawing (site/app/routes/rules.tsx), so
    # the pre-rendered HTML has no such id: a #RULE-ID on /rules is checked against the rule records instead.
    rule_ids = set()
    for f in glob.glob(os.path.join(ROOT, "data/rules/*.json")):
        rule_ids.add(json.load(open(f, encoding="utf8"))["id"])

    def ids_of(rel):
        if rel not in ids_cache:
            t = open(os.path.join(build, rel), encoding="utf8").read()
            ids_cache[rel] = set(re.findall(r'\b(?:id|name)="([^"]*)"', t))
        return ids_cache[rel]

    def target_file(path):
        """None: outside the base path; False: nothing there; else the file that answers this path."""
        if not path.startswith(BASE):
            return None
        rel = urllib.parse.unquote(path[len(BASE):])
        if rel == "" or rel.endswith("/"):
            cands = [rel + "index.html"]
        else:
            cands = [rel, rel + ".html", rel + "/index.html"]
        return next((c for c in cands if c in files), False)

    missing = collections.defaultdict(lambda: {"pages": [], "why": ""})
    missing_frag = collections.defaultdict(lambda: {"pages": [], "why": ""})
    total = 0
    rules_anchors = 0
    uniq = set()
    pages = [f for f in files if f.endswith(".html")]
    for rel in sorted(pages):
        page_url = BASE + rel.replace("index.html", "")
        t = open(os.path.join(build, rel), encoding="utf8").read()
        for m in re.finditer(r'<[a-z]+\b[^>]*?\b(href|src)="([^"]*)"', t, re.I):
            raw = html.unescape(m.group(2)).strip()
            if raw == "" or re.match(r"(https?:|mailto:|tel:|javascript:|data:|//)", raw, re.I):
                continue
            total += 1
            full = urllib.parse.urljoin("https://x" + page_url, raw)
            p = urllib.parse.urlsplit(full)
            key = p.path + (("#" + p.fragment) if p.fragment else "")
            uniq.add(key)
            tf = target_file(p.path)
            if tf is None:
                bucket = missing[p.path]
                bucket["why"] = f"outside the base path {BASE}"
            elif tf is False:
                bucket = missing[p.path]
                bucket["why"] = "no pre-rendered page or file"
            else:
                frag = urllib.parse.unquote(p.fragment)
                client_rule = tf == "rules/index.html" and frag in rule_ids
                if client_rule:
                    rules_anchors += 1
                if p.fragment and tf.endswith(".html") and frag not in ids_of(tf) and not client_rule:
                    bucket = missing_frag[p.path + "#" + p.fragment]
                    bucket["why"] = "page exists, no element with this id (a client-rendered id would be a false alarm)"
                else:
                    continue
            if len(bucket["pages"]) < 8 and rel not in bucket["pages"]:
                bucket["pages"].append(rel)
            bucket["count"] = bucket.get("count", 0) + 1
    return {"pages": len(pages), "links": total, "unique_targets": len(uniq), "rule_anchors_checked_against_records": rules_anchors,
            "unresolved": [{"href": k, **v} for k, v in sorted(missing.items())],
            "fragments_missing": [{"href": k, **v} for k, v in sorted(missing_frag.items())]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--build")
    ap.add_argument("--cache")
    ap.add_argument("--refresh", action="store_true")
    ap.add_argument("--skip-govil", action="store_true")
    ap.add_argument("--only-internal", action="store_true")
    a = ap.parse_args()
    out = {"generated": time.strftime("%Y-%m-%d"), "build": a.build}
    if a.build:
        out["internal"] = check_internal(a.build)
        i = out["internal"]
        print(f"internal: {i['links']} links on {i['pages']} pages, {i['unique_targets']} targets, {len(i['unresolved'])} unresolved, {len(i['fragments_missing'])} missing fragments", file=sys.stderr)
    if not a.only_internal:
        uses = collect(a.build)
        print(f"{len(uses)} unique URLs", file=sys.stderr)
        results = run_all(uses, a.cache, a.skip_govil, a.refresh)
        mark_weak(results)
        rows = []
        for url, r in sorted(results.items()):
            r = dict(r)
            r["host"] = urllib.parse.urlsplit(url).hostname or ""
            r["uses"] = [{"file": f, "count": v["count"], "refs": v["refs"]} for f, v in sorted(uses[url].items())]
            rows.append(r)
        out["counts"] = dict(collections.Counter(r["class"] for r in rows))
        out["weak_ok"] = sum(1 for r in rows if r["class"] == "ok" and r.get("weak"))
        out["results"] = rows
        print(out["counts"], file=sys.stderr)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(out, open(a.out, "w", encoding="utf8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
