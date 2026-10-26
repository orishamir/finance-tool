"""List every published taxation-decision summary in one field (all pages), or open one summary.

usage: python3 -I tools/rulings_list.py list <tchum> ["<words>"]   # tchum 320 capital market, 200 international, 325 individuals
       python3 -I tools/rulings_list.py open <num>                 # num as in OpenAbs('20060013')
"""
import http.cookiejar
import re
import sys
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
BASE = "https://secapp.taxes.gov.il/TMMISUYWEB/"
URL = BASE + "frmAbsSearch.aspx?cur=4"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
jar = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
op.addheaders = [("User-Agent", UA)]


def text_of(html):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
    t = re.sub(r"<(br|tr|p|div|li|td|h\d)[^>]*>", "\n", t)
    t = unescape(re.sub(r"<[^>]+>", " ", t))
    return [l for l in (" ".join(x.split()) for x in t.splitlines()) if l]


def hidden(name, html):
    m = re.search(r'name="%s"[^>]*value="([^"]*)"' % re.escape(name), html) or re.search(
        r'value="([^"]*)"[^>]*name="%s"' % re.escape(name), html)
    return unescape(m.group(1)) if m else ""


def post(html, extra):
    form = {k: hidden(k, html) for k in ("__VIEWSTATE", "__VIEWSTATEGENERATOR", "__EVENTVALIDATION", "ctl00$HiddenSessionId", "ctl00$HiddenPageName")}
    form.update({"__EVENTTARGET": "", "__EVENTARGUMENT": "", "__LASTFOCUS": ""})
    form.update(extra)
    req = urllib.request.Request(URL, data=urllib.parse.urlencode(form).encode(), headers={"Referer": URL})
    return op.open(req, timeout=90).read().decode("utf-8", "replace")


def rows(html):
    nums = re.findall(r"OpenAbs\('(\d+)'\)", html)
    lines = text_of(html)
    try:
        i = next(i for i, l in enumerate(lines) if l.startswith("תמצית") and i > 0 and lines[i - 1].startswith("ת. פרסום"))
    except StopIteration:
        return []
    body, out = lines[i + 1:], []
    k = 0
    while k + 4 < len(body) and re.match(r"^\d{1,5}/\d\d$", body[k]):
        out.append(" | ".join(body[k:k + 5]))
        k += 5
    return list(zip(nums, out))


cmd = sys.argv[1]
if cmd == "open":
    num = sys.argv[2]
    raw = op.open(BASE + f"frmShowLinkedAbs.aspx?num={num}&new=true", timeout=60).read()
    if raw[:5] == b"%PDF-":
        out = HERE / "work" / f"ruling-{num}.pdf"
        out.write_bytes(raw)
        import subprocess
        subprocess.run(["pdftotext", "-layout", str(out), str(out) + ".txt"], check=True)
        txt = (Path(str(out) + ".txt")).read_text(encoding="utf-8")
        txt = re.sub("[\u202a-\u202e\u2066-\u2069\u200e\u200f]", "", txt)
        txt = re.sub(r"\n\s*\n+", "\n", txt)
        txt = re.sub(r" {3,}", " ", txt)
        (Path(str(out) + ".txt")).write_text(txt, encoding="utf-8")
        print(txt)
    else:
        html = raw.decode("utf-8", "replace")
        (HERE / "work" / f"ruling-{num}.html").write_text(html, encoding="utf-8")
        print("\n".join(text_of(html)))
    sys.exit()

tchum = sys.argv[2]
words = sys.argv[3] if len(sys.argv) > 3 else ""
page = op.open(URL, timeout=60).read().decode("utf-8", "replace")
html = post(page, {
    "ctl00$ContentUsersPage$Select": "rdbAdvance", "ctl00$ContentUsersPage$ddlTchum": tchum,
    "ctl00$ContentUsersPage$ddlCat": "0", "ctl00$ContentUsersPage$ddlDateType": "0",
    "ctl00$ContentUsersPage$txtdes1": words, "ctl00$ContentUsersPage$ddlSearchType": "3",
    "ctl00$ContentUsersPage$btnGo.x": "10", "ctl00$ContentUsersPage$btnGo.y": "10"})
seen = set()
for _ in range(40):
    new = [r for r in rows(html) if r[0] not in seen]
    if not new:
        break
    for n, r in new:
        seen.add(n)
        print(n, "|", r)
    # next page: the pager links are __doPostBack('...dgAbs$ctlNN$ctlMM',''); take the one right after the current page
    targets = re.findall(r"__doPostBack\(&#39;(ctl00\$ContentUsersPage\$dgAbs\$ctl\d+\$ctl\d+)&#39;|__doPostBack\('(ctl00\$ContentUsersPage\$dgAbs\$ctl\d+\$ctl\d+)'", html)
    pager = [a or b for a, b in targets]
    pager = [p for p in pager if not p.endswith("$ctl02$ctl00") and "$ctl02$" not in p]
    moved = False
    for p in pager:
        h2 = post(html, {"__EVENTTARGET": p})
        if any(n not in seen for n, _ in rows(h2)):
            html, moved = h2, True
            break
    if not moved:
        break
