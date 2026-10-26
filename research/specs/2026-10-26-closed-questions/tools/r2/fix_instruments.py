"""r2 (2026-10-26): guide records and tariff notes after main closed BRK OQ11, MF OQ4, TXI OQ2 and TXS OQ15.
Plain text replacement keeps each file's formatting; every replacement asserts its old text."""
import pathlib, re, json
W = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/data')

def edit(rel, pairs, drop=()):
    p = W / rel
    s = p.read_text()
    for old, new in pairs:
        assert old in s, (rel, old[:90])
        s = s.replace(old, new)
    for code in drop:
        # remove a code from the open_questions array, whatever its position
        m = re.search(r'"open_questions": \[(.*?)\]', s, re.S)
        assert m and f'"{code}"' in m.group(1), (rel, code)
        items = [x.strip() for x in m.group(1).split(',') if x.strip()]
        items = [x for x in items if x != f'"{code}"']
        indent = re.search(r'\n(\s*)"open_questions"', s).group(1)
        body = ('\n' + indent + '  ' + (',\n' + indent + '  ').join(items) + '\n' + indent) if items else ''
        s = s[:m.start()] + f'"open_questions": [{body}]' + s[m.end():]
    json.loads(s)
    p.write_text(s)
    print('edited', rel)

edit('instruments/exposures/government-bond-cpi.json', [], drop=['TXS-OQ15'])
edit('instruments/exposures/makam.json', [], drop=['BRK-OQ11'])
edit('instruments/exposures/shekel-cash.json', [], drop=['TXI-OQ2', 'MF-OQ4'])
edit('instruments/wrappers/bank-deposit.json', [], drop=['TXI-OQ2'])
edit('instruments/wrappers/savings-plan.json', [], drop=['TXI-OQ2'])

nonbank = "no rule limits a non-bank member's custody fee on them (BRK-17, BRK-52; BRK open question 11 closed 2026-10-26)"
edit('instruments/wrappers/brokerage-account.json', [
    ("whether non-bank members may is open (BRK OQ11).", f"the ban binds banks only, and {nonbank}."),
], drop=['BRK-OQ11'])
edit('instruments/wrappers/makam.json', [
    ("Whether a non-bank TASE member may charge custody on makam is open (BRK open question 11).",
     "The ban binds banks only: no rule limits a non-bank TASE member's custody fee on makam (BRK-17, BRK-52; BRK open question 11 closed 2026-10-26), so its tariff applies as published."),
], drop=['BRK-OQ11'])

mmf_note_old = ("Under a distribution agreement a distributor may charge the holder nothing for buying, holding or redeeming money-market units (MF-26, reg. 2(ד)). "
                "Whether a non-bank TASE member may charge custody on money-market units is open (BRK open question 11): there the tariff applies as published (MF-27 examples).")
mmf_note_new = ("Under a distribution agreement, a distributor that is not an investment marketer may charge the holder nothing for buying, holding or redeeming money-market units (MF-26, reg. 2(ד)). "
                "Most non-bank TASE members are investment marketers, outside those regulations, and no rule limits their custody fee on money-market units (BRK-17, BRK-52; BRK open question 11 closed 2026-10-26): there the tariff applies as published (MF-27 examples).")
edit('instruments/wrappers/money-market-fund-daily.json', [
    (mmf_note_old, mmf_note_new),
    ("the distributor passes the redemption money on the day the fund pays it (MF-11), but how many business days after the order the cash is usable was not found (MF OQ4);",
     "the redemption money reaches the holder's account on the day the distributor must pass the order to the clearing house in a fund whose investment policy keeps foreign securities at no more than 10% of net assets, and on the next trading day in any other fund (MF-11, prices regulations reg. 15; MF open question 4 closed 2026-10-26);"),
    ('"liquidity-lockup": "blocked:MF-OQ4",', '"liquidity-lockup": "covered",'),
], drop=['MF-OQ4', 'TXS-OQ15', 'BRK-OQ11'])
edit('instruments/wrappers/money-market-fund-renewable.json', [
    (mmf_note_old, mmf_note_new),
    ("; how many business days after the fixed date the cash is usable was not found (MF OQ4)\"",
     "; on a fixed date the redemption money reaches the holder's account on the day the distributor must pass the order to the clearing house in a fund whose investment policy keeps foreign securities at no more than 10% of net assets, and on the next trading day in any other fund (MF-11, prices regulations reg. 15; MF open question 4 closed 2026-10-26)\""),
    ('"liquidity-lockup": "blocked:MF-OQ4",', '"liquidity-lockup": "covered",'),
], drop=['MF-OQ4', 'TXS-OQ15', 'BRK-OQ11'])

for f in ['altshuler-trade', 'excellence', 'ibi', 'psagot']:
    edit(f'fees/{f}@2026-10-23.json', [
        ("the bank ban (BRK-17) does not apply to a non-bank member (BRK OQ11), so no excludes are recorded.",
         "the bank ban (BRK-17) does not apply to a non-bank member, and no rule limits its custody fee on them (BRK-52; BRK open question 11 closed 2026-10-26), so no excludes are recorded."),
    ])
