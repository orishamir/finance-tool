"""docs/method.md after main's nine closures and the reviewers (2026-10-26): each change written as a dated line."""
import pathlib
p = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/docs/method.md')
s = p.read_text()
pairs = [
    # F-14: BRK OQ11 closed
    ("at non-bank members per their tariff (BRK OQ11 open: the engine uses the tariff as published and flags it).",
     "at non-bank members per their tariff: no rule limits a non-bank member's custody fee on makam or money-market units, since the bank ban binds banks only and the distribution-fee regulations leave out an investment marketer, which most non-bank members are (BRK-17, BRK-52, MF-26; changed 2026-10-26: BRK OQ11 closed, the line said it was open), so the engine uses the tariff as published."),
    # F-21: TXI OQ2 closed
    ("Prime-linked deposits fall here by the Tax Authority's definition of \"linked\" (TXI-04; the prime case is TXI OQ2, labelled \"reading\");",
     "Prime-linked deposits fall here: the statutory index is the CPI or an exchange rate, and the Tax Authority's guide counts a deposit as unlinked unless fully index-linked (TXI-04; changed 2026-10-26: TXI OQ2 closed, so the prime case is no longer labelled \"reading\");"),
    # F-48: the reason is the formula's own id, no gap
    ("so it is still **blocked** and the wrapper stays \"listed, not ranked\" even when the person opts in, until F-48 is built (G-06).",
     "so it is still **blocked** and the wrapper stays \"listed, not ranked\" even when the person opts in, until F-48 is built. The run's reason is \"F-48\" (not built), and no gap is flagged (changed 2026-10-26, closed-questions review: it returned G-06, which is closed)."),
    # G-06's engine column
    ("| F-48 can be computed; until the engine builds it, it stays blocked and the wrapper is listed, not ranked |",
     "| F-48 can be computed; until the engine builds it, it stays blocked and the wrapper is listed, not ranked, with \"F-48\" as the reason and no gap flag (2026-10-26) |"),
    # the run table's pension and IRA lines
    ("(F-30 to F-32, F-27, F-11, F-15, F-16, F-53; the exit, F-48 and F-49, is blocked, G-03 and G-06).",
     "(F-30 to F-32, F-27, F-11, F-15, F-16, F-53; the exit is blocked: F-49 by G-03, and F-48 because it is not built yet)."),
    ("an IRA provident fund waits for F-48 and F-49, which are blocked (G-03, G-06).",
     "an IRA provident fund waits for F-48 and F-49, which are blocked (F-49 by G-03; F-48 is not built yet)."),
    # G-07: TXG OQ13 and TXS OQ15 answered
    ("real loss when CPI exceeds the nominal gain (TXG OQ13), deflation on exempt-fund units (TXS OQ15) and on linked deposits and bonds (interest still taxed in full and negative linkage not offset, TXI-25; the price loss at sale is TXS OQ15) | F-40 takes `max(0, real)`; no loss is carried |",
     "and deflation on linked deposits and bonds (interest still taxed in full and negative linkage not offset, TXI-25). Answered 2026-10-26: when the CPI rise exceeds the nominal gain, the gain is exempt and there is no capital loss, since a capital loss is measured in nominal terms only (TXG-12, TXS-02; TXG OQ13 closed); when the index falls, the inflationary amount is zero, not negative, so the real gain is the nominal gain and tax never exceeds it, and on a nominal loss the part equal to the fall is not allowable (TXS-02, TXF-03; TXS OQ15 and TXF OQ5 closed) | F-40 takes `max(0, real)`; no loss is carried. The ledgers index each lot's cost by `J_T / J_lot` without a floor, so a falling index would make the real gain larger than the nominal gain; the rule floors the inflationary amount at zero (2026-10-26, not yet in the engine) |"),
    # G-24: TXF OQ5 closed
    ("TXF OQ5, the same question for a foreign security, narrowed 2026-10-26)",
     "TXF OQ5, the same question for a foreign security, closed 2026-10-26 by circular 10/2025, TXF-03)"),
    # G-26: MF OQ4 closed
    ("| G-26 | Money-market fund order cut-off and settlement day (MF OQ3, OQ4) | Open | Liquidity shown as \"same or next business day, unconfirmed\" |",
     "| G-26 | Money-market fund order cut-off and settlement day (MF OQ3, OQ4) | Settlement answered 2026-10-26: the redemption money reaches the holder on the day the distributor must pass the order to the clearing house in a fund whose policy keeps foreign securities at no more than 10% of net assets, otherwise on the next trading day; a fixed-date fund executes orders only on its fixed date (MF-11, prices regulations reg. 15; MF OQ4 closed). Still open: current cut-off hours and Friday orders (MF OQ3) | The guides state the settlement day with MF-11 |"),
]
for old, new in pairs:
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)
p.write_text(s); print('ok')
