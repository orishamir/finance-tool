"""Issue 84: rewrite the Wikisource citations of laws in the rule base to the state's own copies.

Run from the repository root:
  python3 -I research/knowledge/2026-10-26-official-texts/tools/rewrite.py <cit.json> <loc.json> <bag.json> <out-citations.json> <cites.tsv> [--apply]

Three tiers:
 A  a state body publishes a consolidated text: the link moves to it with the file's page per section;
 B  only the gazette original and amendments are the state's: the gazette page goes in front of the Wikisource link,
    which stays, labelled as the only consolidated copy of the current wording (never in a tax file: those are left);
 C  no state copy read: the Wikisource link stays, labelled so.
Without --apply nothing is written. cites.tsv holds what `library.mjs cite` must record, one line per section and page.
"""
import json
import re
import sys
from collections import defaultdict

cit_path, loc_path, bag_path, out_path, cites_path = sys.argv[1:6]
APPLY = "--apply" in sys.argv
ROOT = ".claude/skills/il-finance/references/"
TOOLS = "research/knowledge/2026-10-26-official-texts/tools/"
WIKI = "research/knowledge/2026-10-26-official-texts/work/wiki/"
TODAY = "2026-10-31"

cits = json.load(open(cit_path, encoding="utf-8"))["citations"]
loc = json.load(open(loc_path, encoding="utf-8"))
bag = json.load(open(bag_path, encoding="utf-8"))
laws = json.load(open(TOOLS + "laws.json", encoding="utf-8"))
official = json.load(open(TOOLS + "official.json", encoding="utf-8"))
key_of = {l["wikisource_title"]: l["key"] for l in laws}
index = {}
for line in open("research/library/index.jsonl", encoding="utf-8"):
    d = json.loads(line)
    index[d["id"]] = d

BTL = "National Insurance Institute's consolidated copy"
ISA = "Securities Authority's consolidated copy"
BOI = "Bank of Israel's consolidated copy"
# key: (library id, what the document is, name in the label, the file's own date)
TIER_A = {
    "ito": ("6deb4dc4ee99460c", BTL, "Income Tax Ordinance", "21.6.2026"),
    "nii": ("c6681353c3ff86ab", BTL, "National Insurance Law", "7.7.2026"),
    "wage": ("ba94355d942e602f", BTL, "Wage Protection Law", "27.5.2024"),
    "vat": ("18e1d21d2093d67f", BTL, "VAT Law", "16.7.2026"),
    "pf-rules64": ("c1a910e7108c3769", BTL, "Income Tax Regulations (Rules for Approving and Managing Provident Funds)", "18.8.2025"),
    "wh-int": ("2d313d18dfed9653", BTL, "Income Tax Regulations (Withholding from Interest, Dividend and Certain Gains)", "3.1.2018"),
    "wh-sec": ("8b5fffa5abbe8104", BTL, "Income Tax Regulations (Withholding from Consideration, Payment or Capital Gain)", "3.1.2018"),
    "wh-hish": ("8eea6f57128f4947", BTL, "Income Tax Regulations (Withholding from Amounts Paid from a Study Fund)", "3.1.2018"),
    "hish-accounts": ("d9cbf92117d8dff0", BTL, "Income Tax Regulations (Accounts in a Study Fund Treated as One)", "15.3.2012"),
    "cg-calc": ("351dbb86615f9e87", BTL, "Income Tax Regulations (Capital Gain on a Listed Security)", "31.5.2012"),
    "filing": ("1e08d2496afde076", BTL, "Income Tax Regulations (Exemption from Filing a Return)", "23.12.2025"),
    "adv": ("568097f827d4c026", ISA, "Investment Advice Law", "26.8.2026"),
    "adv-equity": ("88bee84ad057fb9d", ISA, "Investment Advice Regulations (Equity and Insurance)", "2.1.2022"),
    "sec": ("5b5d6552e5f5129e", ISA, "Securities Law", "26.8.2026"),
    "jit": ("d386a692cce2ad86", ISA, "Joint Investment Trust Law", "31.8.2026"),
    "bank-lic": ("66b8e1b142bf13cf", BOI, "Banking (Licensing) Law", "24.8.2026"),
    "bank-cs": ("6bec2669429eb562", BOI, "Banking (Service to Customer) Law", "14.4.2026"),
    "bank-ord": ("78ad661d56a7339f", BOI, "Banking Ordinance", "14.1.2025"),
    "bank-disc": ("a685df20763ac102", BOI, "Banking Rules (Service to Customer) (Fair Disclosure and Delivery of Documents)", "2.2.2015"),
}
# Stale or differing: the Wikisource citation stays. Reason goes to the report.
HOLD = {
    "health": "the National Insurance Institute's copy is dated 16.2.2023 and lacks the amendments to s.14 the rule rests on",
}
# single citations left alone by hand: (context, key)
HOLD_CTX = {
    ("TXI-08", "wh-int"): "the rule reads the mirror's header and amendment list",
    ("TXI-13", "cg-calc"): "the rule reads the mirror's header and amendment list",
    ("BANK-07", "bank-disc"): "the rule reads the mirror's header and section tags",
    ("PEN-08", "pf-rules64"): "the formula is an unrendered image in the state copy",
    ("CORP-05", "sec"): "the quoted s.35ג wording is in the mirror only; the state copy prints the later wording",
}
TAG_A = "primary (state body's consolidated copy, not the binding gazette wording)"
TAG_B = "primary (gazette for the text as enacted or amended there; the Wikisource page, unofficial, is the only consolidated copy of the current wording found)"
LAT = dict(zip("ABCDEFGHIJ", "אבגדהוזחטי"))
LAT.update(dict(zip("abcdefghij", "אבגדהוזחטי")))
BIDI = re.compile("[‎‏‪-‮⁦-⁩]")
wiki_ids = {}
wiki_text = {}


def wiki(key):
    if key not in wiki_ids:
        secs = json.load(open(f"{WIKI}{key}.json", encoding="utf-8"))["sections"]
        wiki_ids[key] = [s["id"] for s in secs]
        wiki_text[key] = {s["id"]: s for s in secs}
    return wiki_ids[key]


def heb(x):
    return "".join(LAT.get(ch, ch) for ch in x)


def resolve(key, tok):
    have = wiki(key)
    m = re.match(r"^(\d+)([A-Za-zא-ת]{0,2})(\d*)((?:\([^)]*\))*)", tok)
    if not m:
        return None
    base = m.group(1) + heb(m.group(2)) + m.group(3)
    parens = re.findall(r"\(([^)]*)\)", m.group(4))
    if parens:
        p = heb(parens[0])
        if re.match(r"^\d", p) and f"{base}.{p}" in have:
            return f"{base}.{p}"
    if base in have:
        return base + "*" if any(h.startswith(base + ".") for h in have) else base
    return None


pages_of = {}


def store(doc):
    if doc not in pages_of:
        pages_of[doc] = BIDI.sub("", open(f"research/library/store/{doc}.txt", encoding="utf-8").read()).split("\f")
    return pages_of[doc]


def span(key, wid, doc):
    """First and last page of a section in the chosen document: pages with at least five matched words, contiguous."""
    s = loc[key]["sections"].get(wid)
    if not s:
        return None
    d = next((x for x in s.get("docs", []) if x["id"] == doc), None)
    if not d or not d.get("pages"):
        return None
    hits = dict((p, h) for p, h in d["pages"])
    good = sorted(p for p, h in hits.items() if h >= 5)
    if not good:
        return None
    # the longest contiguous run with the most hits
    runs, cur = [], [good[0]]
    for p in good[1:]:
        if p <= cur[-1] + 1:
            cur.append(p)
        else:
            runs.append(cur)
            cur = [p]
    runs.append(cur)
    best = max(runs, key=lambda r: sum(hits[p] for p in r))
    pri = s.get("primary") or {}
    lo = pri.get("first") if pri.get("id") == doc and pri.get("first") else best[0]
    a = max(best[0], lo) if lo <= best[-1] else best[0]
    return a, best[-1]


TOK = re.compile(r"[א-ת]{2,}")


def quote_for(doc, page, text):
    """Six words of the section's text in order, each on that page, for `cite`."""
    words = TOK.findall(re.sub("⟦.*?⟧", " ", BIDI.sub("", text)))
    on = set(TOK.findall(store(doc)[page - 1]))
    for i in range(len(words) - 5):
        run = words[i : i + 6]
        if all(w in on for w in run):
            return " ".join(run)
    run = [w for w in words if w in on][:6]
    return " ".join(run) if len(run) >= 4 else None


cites = {}  # (doc, page, topic) -> quote


def page_list(key, wid, doc, locator):
    sp = span(key, wid, doc)
    if not sp:
        return None
    a, b = sp
    # a defined term quoted in the locator narrows a long section to its page
    if b > a:
        terms = re.findall(r"[\"“”״]([א-ת][א-ת ־\-]{2,40})[\"“”״]", locator or "")
        got = sorted({p for t in terms for p in range(a, b + 1) if t in store(doc)[p - 1]})
        if got:
            return got[0], got[-1], got
    return a, b, None


def label_a(key):
    doc, kind, name, date = TIER_A[key]
    return f"{name}, {kind}, file of {date}"


def fmt_pages(a, b, got):
    if got and len(got) > 1:
        return ", ".join(str(x) for x in got)
    return str(a) if a == b else f"{a}-{b}"


def sec_label(wid):
    return wid.rstrip("*")


report = []
by_line = defaultdict(list)
for c in cits:
    by_line[(c["file"], c["line"])].append(c)

files = {}
for f in {c["file"] for c in cits}:
    files[f] = open(ROOT + f, encoding="utf-8").read().split("\n")


def gazette_label(key, doc_name):
    for f in official.get(key, {}).get("files", []):
        if f["name"] == doc_name:
            ref = (f.get("date") or "").strip()
            if not re.search("[א-ת]", ref):
                ref = doc_name.split("-")[-1]
            return ref, f["url"]
    return None, None


def row_cells(line, publisher, tag):
    """A row of a Sources table: publisher cell, strength cell, date cell."""
    cells = line.split("|")
    for k, cell in enumerate(cells):
        if "http" in cell:
            continue
        if publisher and re.search(r"Wikisource|ויקיטקסט", cell) and not re.search(r"\d{4}-\d{2}-\d{2}", cell) and k >= 2:
            cells[k] = f" {publisher} "
        elif tag and re.fullmatch(r"\s*primary( \((mirror|mirror; currency unconfirmed)\))?\s*", cell):
            cells[k] = f" {tag} "
        elif re.fullmatch(r"\s*\d{4}-\d{2}-\d{2}\s*", cell):
            cells[k] = f" {TODAY} "
    return "|".join(cells)


def tail_edit(seg, tag):
    """The stretch after a link, up to the next link: refresh the date and the strength."""
    seg, n = re.subn(r"(?<!all )checked \d{4}-\d{2}-\d{2}", f"checked {TODAY}", seg, count=1)
    seg, m = re.subn(r"primary \((?:mirror(?:; currency unconfirmed)?|law text via Wikisource mirror[^)]*)\)", tag, seg, count=1)
    if n == 0 and m:
        seg = seg.replace(tag, f"{tag} · checked {TODAY}", 1)
    return seg


for (f, ln), items in sorted(by_line.items()):
    line = files[f][ln - 1]
    is_tax = f.startswith("tax-")
    # right to left, so earlier offsets stay good
    occ = []
    used = defaultdict(int)
    for c in items:
        starts = [m.start() for m in re.finditer(re.escape(c["url"]), line)]
        k = used[c["url"]]
        used[c["url"]] += 1
        if k < len(starts):
            occ.append((starts[k], c))
    pending = None
    for pos, c in sorted(occ, key=lambda x: -x[0]):
        key = key_of.get(c["title"])
        rec = {"file": f, "line": ln, "context": c["context"], "law": key, "old": c["url"], "sections": c["sections"], "action": "left", "why": ""}
        report.append(rec)
        if not key or key == "search":
            rec["why"] = "not a law citation"
            continue
        if key in HOLD:
            rec["why"] = HOLD[key]
            continue
        if (c["context"], key) in HOLD_CTX:
            rec["why"] = HOLD_CTX[(c["context"], key)]
            continue
        end = pos + len(c["url"])
        # find the whole link around the URL
        close = end
        angle = line[close:close + 1] == ">"
        if angle:
            close += 1
        is_md = line[close:close + 1] == ")" and "](" in line[max(0, pos - 3) : pos]
        if not is_md:
            if not line.lstrip().startswith("|"):
                rec["why"] = "bare URL outside a table, by hand"
                continue
            if key in TIER_A:
                doc, kind, name, date = TIER_A[key]
                url = index[doc]["url"].split("#")[0]
                secmap, first = [], None
                for t in c["sections"]:
                    wid = resolve(key, t)
                    pl = page_list(key, wid, doc, c["locator"]) if wid else None
                    if pl:
                        a, b, got = pl
                        first = first or a
                        entry = f"s.{sec_label(wid)} {fmt_pages(a, b, got)}"
                        if entry not in secmap:
                            secmap.append(entry)
                href = url + (f"#page={first}" if first else "")
                pages = f" (file pages: {'; '.join(secmap)})" if secmap else ""
                line = line[:pos] + href + pages + line[end:]
                pending = (f"{kind} (file of {date})", TAG_A)
                rec.update(action="official", doc=doc, new=href, pages=secmap)
            elif is_tax:
                rec["why"] = "gazette only, in a tax file: left for the tax specialist"
            else:
                base_files = official.get(key, {}).get("files", [])
                if base_files:
                    ref, url = (base_files[0].get("date") or "").strip(), base_files[0]["url"]
                    line = line[:pos] + f"{url} (gazette {ref}, as enacted); " + c["url"] + " (unofficial consolidated text, the only copy found of the current wording)" + line[end:]
                    rec.update(action="gazette+wikisource", gazette=[url])
                else:
                    line = line[:pos] + c["url"] + " (unofficial; the state's own copy was not read)" + line[end:]
                    rec.update(action="wikisource kept, noted")
                pending = pending or (None, None)
            continue
        open_br = line.rfind("[", 0, line.rfind("](", 0, pos) + 1)
        # labels may hold nested brackets rarely; walk back to the matching [
        i = line.rfind("](", 0, pos)
        depth = 0
        j = i
        while j >= 0:
            if line[j] == "]":
                depth += 1
            elif line[j] == "[":
                depth -= 1
                if depth == 0:
                    break
            j -= 1
        open_br = j
        next_link = line.find("](", close)
        seg_end = line.rfind("[", close, next_link) if next_link > 0 else -1
        seg_end = seg_end if seg_end > 0 else len(line)
        seg = line[close + 1 : seg_end]
        is_row = line.lstrip().startswith("|")
        rowtail = seg
        if key in TIER_A:
            doc, kind, name, date = TIER_A[key]
            url = index[doc]["url"].split("#")[0]
            secmap = []
            first = None
            miss = []
            for t in c["sections"]:
                wid = resolve(key, t)
                if not wid:
                    miss.append(t)
                    continue
                pl = page_list(key, wid, doc, c["locator"])
                if not pl:
                    miss.append(t)
                    continue
                a, b, got = pl
                first = first or a
                entry = f"s.{sec_label(wid)} {fmt_pages(a, b, got)}"
                if entry not in secmap:
                    secmap.append(entry)
                w = wiki_text[key].get(wid.rstrip("*"))
                if w:
                    q = quote_for(doc, (got or [a])[0], w["text"])
                    if q:
                        cites[(doc, (got or [a])[0], f"{name} s.{sec_label(wid)}")] = q
            if c["sections"] and not secmap:
                rec["why"] = f"no page found for {c['sections']}"
                continue
            if miss:
                rec["unplaced"] = miss
            href = url + (f"#page={first}" if first else "")
            pages = f" (file pages: {'; '.join(secmap)})" if secmap else ""
            new_link = f"[{label_a(key)}]({href})"
            if is_row:
                line = line[:open_br] + new_link + pages + seg + line[seg_end:]
                pending = (f"{kind} (file of {date})", TAG_A)
            else:
                line = line[:open_br] + new_link + pages + tail_edit(seg, TAG_A) + line[seg_end:]
            rec.update(action="official", doc=doc, new=href, pages=secmap)
        elif is_tax:
            rec["why"] = "gazette only, in a tax file: left for the tax specialist"
            continue
        else:
            gz = []
            for t in c["sections"]:
                wid = resolve(key, t)
                b = bag.get(key, {}).get(wid or "", {}) if wid else {}
                top = (b.get("top") or [None])[0]
                # runs of five words outrank the rare-word score wherever the text layer allows them
                pri = (loc[key]["sections"].get(wid) or {}).get("primary") if wid else None
                if pri and pri.get("cov", 0) >= 0.6 and pri.get("first"):
                    top = {"score": 1, "id": pri["id"], "name": pri["name"], "page": pri["first"]}
                if not top or top["score"] < 0.35:
                    continue
                # the section's own heading must be on that page, or the page is only about similar things
                heading = TOK.findall(wiki_text[key][wid.rstrip("*")].get("title") or "")
                on_page = set(TOK.findall(store(top["id"])[top["page"] - 1]))
                if heading and sum(w in on_page for w in heading) < max(1, len(heading) // 2):
                    rec.setdefault("gazette_page_doubtful", []).append(t)
                    continue
                ref, url = gazette_label(key, top["name"])
                if not url:
                    continue
                said = any(url in g for g in gz)
                entry = f"[s.{sec_label(wid)}{'' if said else f', gazette {ref}'}]({url}#page={top['page']})"
                if entry not in gz:
                    gz.append(entry)
                w = wiki_text[key].get(wid.rstrip("*"))
                if w:
                    q = quote_for(top["id"], top["page"], w["text"])
                    if q:
                        cites[(top["id"], top["page"], f"{key} s.{sec_label(wid)}")] = q
            base_files = official.get(key, {}).get("files", [])
            if not c["sections"] and base_files:
                ref, url = (base_files[0].get("date") or "").strip(), base_files[0]["url"]
                gz.append(f"[gazette {ref}]({url})")
            old_label = line[open_br + 1 : i]
            suffix = "unofficial consolidated text, the only copy found of the current wording" if base_files else "unofficial; the state's own copy was not read"
            new_label = old_label if suffix in old_label else f"{old_label}, {suffix}" if old_label and not old_label.isdigit() else f"Wikisource, {suffix}"
            before = (", ".join(gz) + "; ") if gz else ""
            if is_row:
                line = line[:open_br] + before + f"[{new_label}]" + line[i + 1:]
                pending = pending or (None, None)
            else:
                new_tail = tail_edit(seg, TAG_B) if gz else seg
                line = line[:open_br] + before + f"[{new_label}]" + line[i + 1 : close + 1] + new_tail + line[seg_end:]
            rec.update(action="gazette+wikisource" if gz else ("wikisource kept, noted" if not base_files else "wikisource kept, noted, gazette page not placed"), gazette=gz)
    if pending:
        line = row_cells(line, *pending)
    files[f][ln - 1] = line

if APPLY:
    for f, ls in files.items():
        open(ROOT + f, "w", encoding="utf-8").write("\n".join(ls))
json.dump(report, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
with open(cites_path, "w", encoding="utf-8") as o:
    for (d, p, t), q in sorted(cites.items()):
        o.write(f"{d}\t{p}\t{t}\t{q}\n")
tally = defaultdict(lambda: defaultdict(int))
for r in report:
    tally[r["law"]][r["action"]] += 1
for k, v in sorted(tally.items(), key=lambda x: -sum(x[1].values())):
    print(k, dict(v))
print("left:", sum(1 for r in report if r["action"] == "left"), "of", len(report))
if not APPLY:
    # a dry run still shows the result, written beside the citations list
    with open(out_path + ".preview", "w", encoding="utf-8") as o:
        for f, ls in files.items():
            for n, l in enumerate(ls, 1):
                if (f, n) in by_line:
                    o.write(f"{f}:{n}: {l}\n")
