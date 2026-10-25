"""verify_quotes.py --url SUBSTR [--alias REGEX] --pages PDF.pages.json : for each Source segment citing the document,
check that each quoted Hebrew span appears on one of the cited pages; print mismatches and where the text really is."""
import re,sys,glob,json,argparse
ap=argparse.ArgumentParser(); ap.add_argument('--url',required=True); ap.add_argument('--alias',action='append',default=[]); ap.add_argument('--pages',required=True); ap.add_argument('--files',default='.claude/skills/il-finance/references/*.md'); ap.add_argument('--all',action='store_true')
a=ap.parse_args()
pages=json.load(open(a.pages))
def norm(t):
    t=re.sub(r'[‎‏‪-‮⁦-⁩]','',t)
    t=t.replace('״','"').replace('”','"').replace('“','"').replace('׳',"'").replace('’',"'")
    t=re.sub(r'[֑-ׇ]','',t); return re.sub(r'\s+',' ',t).strip()
def squash(t): return re.sub(r'[^א-ת0-9]','',t)
SP=[squash(p) for p in pages]
link_re=re.compile(r'\[((?:[^\[\]]|\[[^\[\]]*\])*)\]\((<[^>]*>|[^()\s]*(?:\([^()]*\)[^()\s]*)*)\)')
NUM=r'(\d+)((?:\s*(?:,|–|-|to|and)\s*\d+(?![\d(.]|[A-Za-zא-ת]))*)'
def pages_of(seg):
    out=set()
    for m in re.finditer(r'(?<![A-Za-z])pp?\.\s*'+NUM,seg):
        nums=[int(x) for x in re.findall(r'\d+',m.group(1)+(m.group(2) or ''))]
        txt=m.group(0)
        # ranges
        parts=re.split(r'\s*(?:,|and)\s*',re.sub(r'^pp?\.\s*','',txt))
        for p in parts:
            r=re.split(r'\s*(?:–|-|to)\s*',p)
            r=[int(x) for x in r if x.isdigit()]
            if len(r)==2: out.update(range(r[0],r[1]+1))
            elif r: out.add(r[0])
    return out
def quotes_of(seg):
    q=re.findall(r'"([^"]{6,})"|`([^`]{6,})`|“([^”]{6,})”',re.sub(r'(?<=[א-ת])"(?=[א-ת])','״',seg))
    res=[]
    for t in q:
        s=next(x for x in t if x)
        s=s.replace('״','"')
        if len(re.findall(r'[א-ת]',s))<5: continue
        for piece in re.split(r'\.\.\.|…',s):
            sq=squash(piece)
            if len(sq)>=8: res.append((piece.strip(),sq))
    return res
bad=0;tot=0
for f in sorted(glob.glob(a.files)):
    for ln,line in enumerate(open(f,encoding='utf8').read().split('\n')):
        if not line.lstrip().startswith('- Source'): continue
        links=list(link_re.finditer(line)); starts=[]
        for m in links:
            if a.url in m.group(2): starts.append(m.start())
        for al in a.alias:
            for m in re.finditer(al,line):
                if not any(l.start()<=m.start()<l.end() for l in links): starts.append(m.start())
        for st in sorted(starts):
            lend=next((l.end() for l in links if l.start()==st), st)
            nxt=[l.start() for l in links if l.start()>st]; dot=line.find('·',lend)
            end=min([dot if dot>=0 else len(line)]+nxt); seg=line[st:end]
            pg=pages_of(seg); qs=quotes_of(seg)
            for piece,sq in qs:
                tot+=1
                where=[i+1 for i,p in enumerate(SP) if sq[:60] in p]
                ok=any(w in pg for w in where)
                if not ok or a.all:
                    if not ok: bad+=1
                    print(f"{'OK ' if ok else 'BAD'} {f.split('/')[-1]}:{ln+1} cited {sorted(pg)} found {where[:6]} :: {piece[:70]}")
print('quotes',tot,'bad',bad)
