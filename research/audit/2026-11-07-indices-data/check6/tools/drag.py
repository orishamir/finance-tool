import json,glob,sys,os
os.chdir('.')
def v(x): 
    return None if x is None or x.get('value') is None else x['value']
out={}
for p in sorted(glob.glob('data/funds/*.json')):
    d=json.load(open(p)); tr=d.get('tracking_record')
    if not tr or not tr.get('years'): continue
    f=d['fees']; fx=v(f.get('fixed_management')); vr=v(f.get('variable_management')); ts=v(f.get('trustee')); pub=v(f.get('tracking_difference_12m'))
    yrs=tr['years']
    listed=(fx or 0)+(vr or 0)+(ts or 0)
    terms=[]
    for y in yrs:
        c=y.get('fees_charged')
        cy=(c['fixed']+c['variable']+c['trustee']) if c else listed
        terms.append(-(y['fund_pct']-y['tracking_pct'])-cy)
    a07=max(0,sum(terms)/len(terms))
    since=tr.get('variable_rate_since','UNDEF')
    vf=None
    if since!='UNDEF' and all(y.get('fees_charged') for y in yrs):
        if since is None: at=yrs
        else:
            fy=int(since[:4])+(0 if since[5:]=='01-01' else 1)
            at=[y for y in yrs if y['year']>=fy]
        if at: vf=sum(y['fees_charged']['variable'] for y in at)/len(at)
    vnew = vf if vf is not None else vr
    out[d['id']]=dict(fixed=fx,var=vr,tr=ts,pub=pub,a07=a07,since=since,years=[(y['year'],y.get('fees_charged',{}).get('variable') if y.get('fees_charged') else None) for y in yrs],vf=vf,
        old=None if pub is not None else (fx or 0)+(vr or 0)+(ts or 0)+a07, new=None if pub is not None else (fx or 0)+(vnew or 0)+(ts or 0)+a07, dom=d.get('domicile'))
json.dump(out,open(sys.argv[1],'w'),indent=0)
for k in sys.argv[2:]:
    o=out[k]; print(k, {x:o[x] for x in ['fixed','var','tr','pub','since','vf','years']}, 'a07=%.4f old=%.4f new=%.4f d=%.4f'%(o['a07'],o['old'] or -1,o['new'] or -1,(o['old'] or 0)-(o['new'] or 0)))
