# Writes check7's two reader briefs from check6's (same task and person), with check7's whole-page shots at 1440.
import json, glob, sys
root = 'research/audit/2026-11-07-indices-data'
for slug, src in [('msci-acwi', 'brief-acwi-careful.json'), ('sp500', 'brief-sp500-careful.json')]:
    b = json.load(open(f'{root}/check6/{src}'))
    r = b['readers'][0]
    shots = sorted(glob.glob(f'{root}/check7/shots/indices_{slug}-1440/page-*.png')) + [f'{root}/check7/shots/indices_{slug}-1440-sheet.png']
    r['shots'] = shots
    json.dump({'task': b['task'], 'readers': [r]}, open(f'{root}/check7/{src}', 'w'), ensure_ascii=False, indent=1)
    print(src, len(shots))
