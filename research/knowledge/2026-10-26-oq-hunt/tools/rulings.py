"""Search the Tax Authority's published taxation-decision summaries (secapp.taxes.gov.il) by free text.

usage: python3 -I tools/rulings.py <out-name> "<words>" [tchum] [searchtype]
  tchum: 0 all fields, 320 capital market, 200 international, 325 provident funds and individuals
  searchtype: 1 exact phrase, 2 any word, 3 all words
Writes work/<out-name>.html and prints the result rows (text) and links.
"""
import http.cookiejar
import re
import sys
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
URL = "https://secapp.taxes.gov.il/TMMISUYWEB/frmAbsSearch.aspx?cur=4"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"

out, words = sys.argv[1], sys.argv[2]
tchum = sys.argv[3] if len(sys.argv) > 3 else "0"
stype = sys.argv[4] if len(sys.argv) > 4 else "3"

jar = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
op.addheaders = [("User-Agent", UA)]
page = op.open(URL, timeout=60).read().decode("utf-8", "replace")


def hidden(name, html):
    m = re.search(r'name="%s"[^>]*value="([^"]*)"' % re.escape(name), html) or re.search(
        r'value="([^"]*)"[^>]*name="%s"' % re.escape(name), html)
    return unescape(m.group(1)) if m else ""


form = {k: hidden(k, page) for k in ("__VIEWSTATE", "__VIEWSTATEGENERATOR", "__EVENTVALIDATION", "ctl00$HiddenSessionId", "ctl00$HiddenPageName")}
form.update({
    "__EVENTTARGET": "", "__EVENTARGUMENT": "", "__LASTFOCUS": "",
    "ctl00$ContentUsersPage$Select": "rdbAdvance",
    "ctl00$ContentUsersPage$ddlTchum": tchum,
    "ctl00$ContentUsersPage$ddlCat": "0",
    "ctl00$ContentUsersPage$ddlDateType": "0",
    "ctl00$ContentUsersPage$txtdes1": words,
    "ctl00$ContentUsersPage$ddlSearchType": stype,
    "ctl00$ContentUsersPage$btnGo.x": "10", "ctl00$ContentUsersPage$btnGo.y": "10",
})
data = urllib.parse.urlencode(form).encode()
res = op.open(urllib.request.Request(URL, data=data, headers={"Referer": URL}), timeout=90)
html = res.read().decode("utf-8", "replace")
(HERE / "work" / f"{out}.html").write_text(html, encoding="utf-8")
print("final url:", res.geturl())
text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
text = re.sub(r"<(br|tr|p|div|li|td)[^>]*>", "\n", text)
text = unescape(re.sub(r"<[^>]+>", " ", text))
lines = [" ".join(l.split()) for l in text.splitlines()]
lines = [l for l in lines if l]
try:
    i = next(i for i, l in enumerate(lines) if "תוצאות" in l or "נמצאו" in l)
except StopIteration:
    i = 0
print("\n".join(lines[i:i + 200]))
for m in re.finditer(r'href="([^"]*(?:frmAbs|Abs|\.pdf)[^"]*)"', html):
    print("LINK", unescape(m.group(1)))
