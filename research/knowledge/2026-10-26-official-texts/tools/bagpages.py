"""For a law known only through gazette PDFs, find the page that carries each cited section.

Some gazette PDFs have a doubled, scrambled text layer, so runs of five words fail; this scores each page by
the rare words of the section it holds (idf over the law's own pages), and the page with the section's opening words.
usage (from the official-texts folder): python3 -I tools/bagpages.py <loc.json> <wiki-dir> <library-dir> <out.json> [law-key ...]
out: {law: {section: {"title","amend","top":[{"name","id","page","score","kind"}]}}}
"""
import json,math,re,sys,collections
loc=json.load(open(sys.argv[1],encoding='utf8'))
wdir,lib,out=sys.argv[2],sys.argv[3],sys.argv[4]
keys=sys.argv[5:] or list(loc)
BIDI=re.compile('[‎‏‪-‮⁦-⁩]')
tok=lambda x:re.findall(r'[א-ת]{2,}|\d{2,}',BIDI.sub('',x))
res={}
for k in keys:
    e=loc[k]
    docs={}
    for sid,s in e['sections'].items():
        for d in s.get('docs',[]):
            docs[d['id']]=d['name']
    pages=[]
    for i,n in docs.items():
        try: t=open(f'{lib}/{i}.txt',encoding='utf8').read()
        except OSError: continue
        for p,x in enumerate(t.split('\f'),1):
            pages.append((i,n,p,set(tok(x))))
    N=len(pages) or 1
    df=collections.Counter(w for *_,ws in pages for w in ws)
    wiki={s['id']:s for s in json.load(open(f'{wdir}/{k}.json',encoding='utf8'))['sections']}
    res[k]={}
    for sid,s in e['sections'].items():
        w=wiki.get(sid.rstrip('*'))
        if not w: continue
        text=re.sub('⟦.*?⟧','',w['text'])
        ws=set(tok(text))
        tot=sum(math.log(N/(df.get(x,0)+.5)) for x in ws if df.get(x,0)>0) or 1
        rows=[]
        for i,n,p,set_ in pages:
            sc=sum(math.log(N/(df[x]+.5)) for x in ws & set_)
            rows.append((sc/tot,i,n,p))
        rows.sort(reverse=True)
        res[k][sid]={'title':w.get('title',''),'amend':w.get('amend',''),'words':len(tok(text)),'top':[{'score':round(a,3),'id':i,'name':n,'page':p} for a,i,n,p in rows[:4]]}
json.dump(res,open(out,'w',encoding='utf8'),ensure_ascii=False,indent=0)
