#!/usr/bin/env python3
"""Independent computation of the expected results for tests/golden/scenarios.md.

Written 2026-10-22 as an independent check. Formulas are derived from the
il-finance rule base (.claude/skills/il-finance/references/); docs/method.md is
used only for output definitions, the comparison basis (B1-B3) and the default
assumptions (A-nn). Where a formula here differs from docs/method.md, both are
computed where possible and the difference is listed in workings.md (D-nn).

Run from the repository root:
    python3 tests/golden/expected_calc.py            # writes tests/golden/workings_numbers.md
    python3 tests/golden/expected_calc.py --json     # prints all results as JSON
"""
import json
import math
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = os.path.join(ROOT, '.claude', 'skills', 'il-finance', 'references')

# --------------------------------------------------------------------------
# Rule links, read from the rule base so every step can cite its source.
# --------------------------------------------------------------------------

def _first_link(text):
    """First markdown link target in text, allowing <...> and balanced parens."""
    i = text.find('](')
    while i != -1:
        j = i + 2
        if j < len(text) and text[j] == '<':
            k = text.find('>', j)
            if k != -1:
                return text[j + 1:k]
        depth, k = 1, j
        while k < len(text) and depth:
            if text[k] == '(':
                depth += 1
            elif text[k] == ')':
                depth -= 1
            k += 1
        url = text[j:k - 1]
        if url.startswith('http'):
            return url
        i = text.find('](', k)
    return None


def load_rules():
    rules = {}
    for fn in sorted(os.listdir(REF)):
        if not fn.endswith('.md'):
            continue
        text = open(os.path.join(REF, fn), encoding='utf-8').read()
        for block in re.split(r'(?m)^(?=### )', text):
            m = re.match(r'### ([A-Z0-9]+-\d+) (.*)', block)
            if not m:
                continue
            src = re.search(r'(?m)^- Source: (.*)$', block)
            src = src.group(1) if src else ''
            chk = re.search(r'checked (\d{4}-\d{2}-\d{2})', src)
            strength = re.search(r'checked \d{4}-\d{2}-\d{2} · ([a-z][^·\[]*)', src)
            rules[m.group(1)] = {
                'title': m.group(2).strip(),
                'file': fn,
                'url': _first_link(src),
                'checked': chk.group(1) if chk else '',
                'strength': strength.group(1).strip().rstrip('.').strip() if strength else '',
            }
    return rules


RULES = load_rules()
USED = set()


def load_parameter(pid):
    path = os.path.join(ROOT, 'data', 'parameters', pid + '.json')
    if not os.path.exists(path):
        return None
    return json.load(open(path, encoding='utf-8'))['value']['value']


THETA = load_parameter('tie-threshold')  # P-01, percent


# Site parameters live in data/parameters/ (signed off by the founder).
PARAMETER_DIRS = ['data/parameters']


def param_src(pid):
    for d in PARAMETER_DIRS:
        rel = f'{d}/{pid}.json'
        if os.path.exists(os.path.join(ROOT, rel)):
            return rel
    return None


def load_parameter_file(pid):
    rel = param_src(pid)
    return json.load(open(os.path.join(ROOT, rel), encoding='utf-8')) if rel else None


def tie_text(v1, v2):
    """F-80: options are a tie when |V1 - V2| / max(V1, V2) < theta (P-01)."""
    gap = abs(v1 - v2) / max(v1, v2)
    if THETA is None:
        return f'gap {gap:.2%}; tie not decided (P-01 not set)'
    return f'gap {gap:.2%} → {"tie" if gap < THETA / 100 else "not a tie"} (θ = {THETA}%)'


def L(*ids):
    out = []
    for rid in ids:
        USED.add(rid)
        r = RULES.get(rid)
        if r is None or not r['url']:
            out.append(f'{rid} (NOT IN RULE BASE)')
        else:
            out.append(f'[{rid}](<{r["url"]}>)')
    return ', '.join(out)


# --------------------------------------------------------------------------
# Number helpers
# --------------------------------------------------------------------------

def mrate(r):
    """Monthly rate from an effective annual rate."""
    return (1.0 + r) ** (1.0 / 12.0) - 1.0


def f2(x):
    return f'{(x if abs(x) >= 0.005 else 0.0):,.2f}'


def f6(x):
    return f'{x:.6f}'


def pct(x, d=4):
    return f'{100 * x:.{d}f}%'


class Path:
    """CPI path I_m and exchange-rate path X_m on the monthly grid (scenario convention F-03/F-04)."""

    def __init__(self, pi, f=0.0):
        self.pi, self.f = pi, f

    def I(self, m):
        return (1.0 + self.pi) ** (m / 12.0)

    def X(self, m):
        return (1.0 + self.f) ** (m / 12.0)


def comm_of(v, spec):
    if not spec:
        return 0.0
    c = max(spec.get('min', 0.0), spec['pct'] * v)
    if spec.get('max') is not None:
        c = min(c, spec['max'])
    return c


def solve_buy(cash, spec):
    """Trade value V and commission c with V + c = cash; commission is a % of the trade value (BRK-16)."""
    if not spec or cash <= 0:
        return cash, 0.0
    v = cash / (1.0 + spec['pct'])
    c = spec['pct'] * v
    if c < spec.get('min', 0.0):
        c = spec['min']
        v = cash - c
    if spec.get('max') is not None and c > spec['max']:
        c = spec['max']
        v = cash - c
    return max(v, 0.0), c


BRK60 = [(84120, .10), (120720, .14), (228000, .20), (301200, .31), (560280, .35), (math.inf, .47)]


def bracket_tax(x, sched=BRK60):
    tax, lo = 0.0, 0.0
    for hi, r in sched:
        if x > lo:
            tax += (min(x, hi) - lo) * r
        lo = hi
    return tax


def slice_tax_capped(y, add, cap, sched=BRK60):
    """Tax on `add` stacked on `y`, each slice at min(bracket rate, cap) (TXG-07 reading)."""
    tax, lo = 0.0, 0.0
    top = y + add
    for hi, r in sched:
        a, b = max(lo, y), min(hi, top)
        if b > a:
            tax += (b - a) * min(r, cap)
        lo = hi
    return tax


def marginal_rate(x, sched=BRK60):
    lo = 0.0
    for hi, r in sched:
        if x <= hi:
            return r
        lo = hi
    return sched[-1][1]


# --------------------------------------------------------------------------
# Securities ledger (brokerage, IRA): units, FIFO lots, NAV price in NIS.
# Basis = price paid incl. the half-spread; commission is a % of the trade; fees
# paid from the holding take their units' basis with them; consideration = gross
# sale value; same-year custody/management fees deducted once (TXS-06).
# Decided by the founder 2026-10-22 (D3, all four parts).
# --------------------------------------------------------------------------

class Sec:
    def __init__(self, path, index='I', delta=0.0, spread=0.0, comm=None, custody=None,
                 fx=0.0, fixed_month=0.0, rate=0.25, mgr_fee=0.0, fixed_deductible=True):
        self.path, self.index, self.delta, self.spread = path, index, delta, spread
        self.comm, self.custody, self.fx, self.fixed_month = comm, custody, fx, fixed_month
        self.rate, self.mgr_fee = rate, mgr_fee
        self.fixed_deductible = fixed_deductible
        self.P = 1.0
        self.lots = []  # [units, cost, J]
        self.fees = defaultdict(float)
        self.deductible = defaultdict(float)  # tax year -> TXS-06 expenses
        self.tax_during = 0.0
        self.foreign_tax = 0.0
        self.invested = 0.0  # cash put in by the person (nominal)
        self.notes = []

    def J(self, m):
        return self.path.I(m) if self.index == 'I' else self.path.X(m)

    def units(self):
        return sum(l[0] for l in self.lots)

    def value(self):
        return self.units() * self.P

    def buy(self, cash, m, outlay=True, fx_applies=True):
        if outlay:
            self.invested += cash
        fxfee = self.fx * cash if fx_applies else 0.0
        self.fees['fx'] += fxfee
        v, c = solve_buy(cash - fxfee, self.comm)
        units = v / (self.P * (1.0 + self.spread))
        self.fees['trade'] += c
        self.fees['spread'] += v - units * self.P
        self.lots.append([units, v, self.J(m)])

    def grow(self, g_m):
        self.fees['fund'] += self.value() * self.delta / 12.0
        self.P *= (1.0 + g_m - self.delta / 12.0)

    def take(self, amount, kind, year, deductible):
        """Remove `amount` of value from the holding to pay a fee."""
        if amount <= 0:
            return
        self.fees[kind] += amount
        if deductible:
            self.deductible[year] += amount
        need = amount / self.P
        for lot in self.lots:
            if need <= 0:
                break
            u = min(lot[0], need)
            lot[1] -= lot[1] * (u / lot[0]) if lot[0] > 0 else 0.0
            lot[0] -= u
            need -= u
        self.lots = [l for l in self.lots if l[0] > 1e-12]

    def month_end(self, m):
        year = (m - 1) // 12 + 1
        if self.mgr_fee:
            self.take(self.value() * self.mgr_fee / 12.0, 'manager', year, False)
        if self.fixed_month:
            self.take(self.fixed_month, 'fixed', year, self.fixed_deductible)
        if self.custody and m % 3 == 0 and self.units() > 0:
            fee = max(self.custody.get('min', 0.0), self.custody['pct'] * self.value())
            self.take(fee, 'custody', year, True)

    def distribute(self, m, y_q, w_foreign, il_rate=0.25):
        d = self.value() * y_q
        self.P *= (1.0 - y_q)
        foreign = w_foreign * d
        credit = min(foreign, il_rate * d)
        il = max(0.0, il_rate * d - credit)
        self.foreign_tax += foreign
        self.tax_during += il
        net = d - foreign - il
        self.buy(net, m, outlay=False, fx_applies=False)
        return d, foreign, il

    def liquidate(self, m, rate=None, extra=None):
        """Sell everything at the end of month m. Returns dict with V and the tax computation."""
        rate = self.rate if rate is None else rate
        year = (m - 1) // 12 + 1
        jt = self.J(m)
        ded = self.deductible[year]
        gross = self.units() * self.P * (1.0 - self.spread)
        spread_cost = self.units() * self.P * self.spread
        c = comm_of(gross, self.comm)
        fxfee = self.fx * (gross - c)
        per_lot = [(l[0] * self.P * (1.0 - self.spread)) - l[1] * jt / l[2] for l in self.lots]
        nominal_gain = gross - sum(l[1] for l in self.lots) - ded
        real = sum(per_lot) - ded
        neg_lots = sum(1 for x in per_lot if x < 0)
        proceeds = gross - c - fxfee
        tax = rate * max(0.0, real)
        out = {
            'gross_or_B': gross,
            'exit_commission': c, 'exit_spread': spread_cost, 'exit_fx': fxfee,
            'deductible_exit_year': ded, 'nominal_gain': nominal_gain, 'real_gain': real,
            'tax': tax, 'V': proceeds - tax, 'neg_real_lots': neg_lots, 'I_T': self.path.I(m),
        }
        out['real_V'] = out['V'] / self.path.I(m)
        return out



def contrib_schedule(T, now, monthly, path, real=True, now_lot_index_zero=True, orders=1):
    """Returns dict month -> list of (cash, J_month) where the 'now' lot uses index month 0."""
    sched = defaultdict(list)
    if now:
        sched[1].append((now, 0))
    for m in range(1, T + 1):
        if monthly:
            c = monthly * (path.I(m) if real else 1.0)
            for _ in range(orders):
                sched[m].append((c / orders, m))
    return sched


def run_sec2(sec, T, sched, g_m, dist=None):
    snaps = []
    for m in range(1, T + 1):
        for cash, jm in sched.get(m, []):
            sec.buy(cash, jm)
        sec.grow(g_m)
        if dist and m % 3 == 0:
            sec.distribute(m, dist[0] / 4.0, dist[1])
        sec.month_end(m)
        if m % 12 == 0:
            snaps.append({'m': m, 'B': sec.value(), 'in': sec.invested,
                          'fees': sum(sec.fees.values()), 'tax_during': sec.tax_during,
                          'real_B': sec.value() / sec.path.I(m)})
    return snaps


# --------------------------------------------------------------------------
# Provident-family ledger (kupat gemel lehashkaa, hishtalmut, pension, child savings)
# --------------------------------------------------------------------------

def run_provident(T, sched, r, path, direct=0.0, balfee=lambda m: 0.0, depfee=0.0, ins=0.0):
    """sched: dict month -> list of (amount, J_month). Direct expenses are added to the balance
    fee as in method F-15 (D16 closed as immaterial: PF-10's inside-the-return reading differs
    by a few shekels)."""
    g = mrate(r)
    B = 0.0
    dep = []
    fees = defaultdict(float)
    snaps = []
    for m in range(1, T + 1):
        for a, jm in sched.get(m, []):
            fees['deposit'] += depfee * a
            fees['insurance'] += ins * a
            B += a * (1.0 - depfee - ins)
            dep.append((a, jm, m))
        B *= (1.0 + g)
        fees['balance'] += balfee(m) / 12.0 * B
        fees['direct'] += direct / 12.0 * B
        B -= (balfee(m) + direct) / 12.0 * B
        if m % 12 == 0:
            snaps.append({'m': m, 'B': B, 'in': sum(d[0] for d in dep),
                          'fees': sum(fees.values()), 'real_B': B / path.I(m)})
    return {'B': B, 'deposits': dep, 'fees': dict(fees), 'snaps': snaps}


def kgl_exit(res, path, T):
    dep_sum = sum(a for a, _, _ in res['deposits'])
    indexed = sum(a * path.I(T) / path.I(j) for a, j, _ in res['deposits'])
    nominal_gain = res['B'] - dep_sum
    real_gain = res['B'] - indexed
    t25 = 0.25 * max(0.0, real_gain)
    t15 = 0.15 * max(0.0, nominal_gain)
    return {'dep_sum': dep_sum, 'indexed': indexed, 'nominal_gain': nominal_gain,
            'real_gain': real_gain, 'tax25real': t25, 'tax15nom': t15,
            'V25': res['B'] - t25, 'V15': res['B'] - t15,
            'realV25': (res['B'] - t25) / path.I(T), 'realV15': (res['B'] - t15) / path.I(T)}


# --------------------------------------------------------------------------
# Output assembly
# --------------------------------------------------------------------------

RESULTS = {}
SECTIONS = []


def table(header, rows):
    out = ['| ' + ' | '.join(header) + ' |', '|' + '---|' * len(header)]
    for r in rows:
        out.append('| ' + ' | '.join(str(x) for x in r) + ' |')
    return '\n'.join(out)


def year_table(snaps, extra_cols=None):
    rows = []
    for s in snaps:
        rows.append([s['m'] // 12, f2(s['in']), f2(s['B']), f2(s['fees']), f2(s.get('tax_during', 0.0)),
                     f2(s['real_B'])])
    return table(['Year end', 'Paid in (nominal)', 'Balance (nominal)', 'Fees to date', 'Tax during to date',
                  'Balance / I_m (real)'], rows)


def section(sid, title, status, body, expected):
    SECTIONS[:] = [x for x in SECTIONS if x[0] != sid]
    SECTIONS.append((sid, title, status, body))
    RESULTS[sid] = {'status': status, 'expected': expected}


# --------------------------------------------------------------------------
# Part A
# --------------------------------------------------------------------------

def deposit_ladder(T, now, monthly, path, real, g_month, tax=0.15):
    B = 0.0
    paid = interest = taxes = 0.0
    snaps = []
    for m in range(1, T + 1):
        c = monthly * (path.I(m) if real else 1.0)
        if m == 1:
            c += now
        paid += c
        B += c
        it = B * g_month
        tx = tax * it
        interest += it
        taxes += tx
        B += it - tx
        if m % 12 == 0:
            snaps.append({'m': m, 'B': B, 'in': paid, 'fees': 0.0, 'tax_during': taxes, 'real_B': B / path.I(m)})
    return {'V': B, 'paid': paid, 'interest': interest, 'tax': taxes, 'real_V': B / path.I(T), 'snaps': snaps}


def s01_s02_s04():
    path = Path(0.03)
    T = 36
    g = mrate(0.035)
    r1 = deposit_ladder(T, 50000, 1000, path, True, g)
    r2 = deposit_ladder(T, 50000, 1000, path, False, g)
    # S04: prime 4.75% - 1.4% = 3.35%
    r4e = deposit_ladder(T, 50000, 1000, path, True, mrate(0.0335))
    income = 12000 * 12
    txi20 = max(0.0, 10920 - max(0.0, income - 69840))
    common = (
        f'| 1 | Monthly rate from the quoted effective annual rate: g = 1.035^(1/12) − 1 | {L("BANK-04")} (effective annual rate is the compounding convention for unlinked shekel deposits); scenario says "effective annual" | g = {f6(g)} |\n'
        f'| 2 | CPI path I_m = 1.03^(m/12) | scenario convention (F-03); no rule | I_36 = {f6(path.I(36))} |\n'
        f'| 4 | Each month the one-month deposit matures: interest = balance × g; 15% withheld; principal plus net interest rolls into a new deposit with the new contribution | {L("TXI-03", "TXI-08", "TXI-07", "BANK-14")} | see table |\n'
        f'| 5 | Low-income deduction from deposit interest: income {f2(income)} exceeds 69,840 by more than 10,920, so the deduction is max(0, 10,920 − (income − 69,840)) | {L("TXI-20")} | {f2(txi20)} |\n'
        f'| 6 | No fees on the deposit (scenario); the last deposit matures on the exit day | {L("TXI-07")} | — |\n'
        f'| 7 | Real value = V_T / I_36 | output definition (method F-06) | see result |\n'
    )
    body1 = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n' + common.replace('| 4 |', '| 3 | Contributions: 50,000 at t = 0 (start of month 1) and C_m = 1,000 × I_m at the start of months 1..36 (constant real) | A-04 default; timing A-05 (Q1) | Σ paid = ' + f2(r1['paid']) + ' |\n| 4 |', 1)
        + '\n\n' + year_table(r1['snaps']) + '\n\n'
        f'Result: V_T = {f2(r1["V"])}; real V_T/I_T = {f2(r1["real_V"])}; fees 0; interest {f2(r1["interest"])}; tax during (15% at each maturity) {f2(r1["tax"])}; tax at exit 0 (the month-36 deposit is taxed at its own maturity on the exit day).'
    )
    section('S01', 'Unlinked bank deposit, one-month ladder', 'computed', body1,
            f'Real V_T/I_T = {f2(r1["real_V"])}; nominal V_T = {f2(r1["V"])}; paid in {f2(r1["paid"])}; fees 0; interest {f2(r1["interest"])}; tax during {f2(r1["tax"])} (15% at each monthly maturity); tax at exit 0; TXI-20 deduction 0. Subject to Q1.')
    body2 = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n' + common.replace('| 4 |', '| 3 | Contributions: 50,000 at t = 0 and C_m = 1,000 (constant nominal) at the start of months 1..36 | A-04 nominal branch | Σ paid = ' + f2(r2['paid']) + ' |\n| 4 |', 1)
        + '\n\n' + year_table(r2['snaps']) + '\n\n'
        f'Result: V_T = {f2(r2["V"])}; real {f2(r2["real_V"])}; interest {f2(r2["interest"])}; tax during {f2(r2["tax"])}.'
    )
    section('S02', 'Same deposit, contributions constant in nominal terms', 'computed', body2,
            f'Real V_T/I_T = {f2(r2["real_V"])}; nominal V_T = {f2(r2["V"])}; paid in {f2(r2["paid"])}; fees 0; tax during {f2(r2["tax"])}; tax at exit 0. Subject to Q1.')
    body4 = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Rate = prime − 1.4% = 4.75% − 1.40% = 3.35%, constant (scenario) | {L("BANK-25")} (prime as the anchor) | 3.35% |\n'
        f'| 2 | Read as an effective annual rate, as in S01: g = 1.0335^(1/12) − 1 (D2 closed: reading it as r/12 changes the result by under 0.1%) | {L("BANK-04")} | g = {f6(mrate(0.0335))} |\n'
        f'| 3 | Tax bucket: prime is neither CPI nor an exchange rate, so the deposit is "not linked": 15% of all interest. This is the rule file\'s own reading, not a published statement | {L("TXI-04", "TXI-03")} (TXI OQ2) | 15% |\n'
        f'| 4 | Ledger as S01 (contributions constant real, monthly maturity, 15% withheld) | {L("TXI-08")} | see below |\n\n'
        f'Result: V_T = {f2(r4e["V"])}; real {f2(r4e["real_V"])}; tax during {f2(r4e["tax"])}.'
    )
    section('S04', 'Prime-linked monthly deposit', 'computed', body4,
            f'Real V_T/I_T = {f2(r4e["real_V"])}; nominal V_T = {f2(r4e["V"])}; fees 0; tax during {f2(r4e["tax"])}; tax at exit 0; label "tax bucket: Tax Authority reading, TXI-04" (strength: the rule file\'s own reading, TXI OQ2). Subject to Q1.')
    return r1


def s03():
    path = Path(0.03)
    P = 100000.0
    rows = []
    tax_total = 0.0
    for k in range(1, 4):
        ratio = path.I(12 * k) / path.I(12 * (k - 1))
        value = P * ratio * 1.012
        linkage = P * (ratio - 1.0)
        real_int = value - P - linkage
        tax = 0.25 * real_int
        tax_total += tax
        rows.append([k, f2(P), f6(ratio), f2(linkage), f2(real_int), f2(tax), f2(value - tax)])
        P = value - tax
    real = P / path.I(36)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Principal and interest linked to CPI; quoted rate is the real rate (1.2%) | {L("BANK-26")} | — |\n'
        f'| 2 | At each 12-month maturity: value = principal × I_end/I_start × 1.012 | {L("BANK-26")}; grid index F-03 | see table |\n'
        f'| 3 | Linkage = principal × (I_end/I_start − 1) is exempt | {L("TXI-05")} | see table |\n'
        f'| 4 | Taxable = "profit above the rise in the index" = value − principal − linkage; rate up to 25% (under 60, passive income starts at 31%, so 25% applies) | {L("TXI-05", "TXI-02", "TXG-08")} | see table |\n'
        f'| 5 | Bank withholds 25% on linked interest at maturity; net rolls into the next one-year deposit | {L("TXI-08", "TXI-07")} | — |\n'
        f'| 6 | Low-income deduction not applied: the profile gives no income (Q3) | {L("TXI-20")} | — |\n\n'
        + table(['Year', 'Principal at start', 'I_end/I_start', 'Linkage (exempt)', 'Real interest', 'Tax 25%', 'Rolled to next year'], rows)
        + f'\n\nResult: V_T = {f2(P)}; real V_T/I_36 = {f2(real)}; fees 0; tax during {f2(tax_total)}; tax at exit 0 (third maturity is the exit day).'
    )
    section('S03', 'CPI-linked one-year deposit', 'computed', body,
            f'Real V_T/I_T = {f2(real)}; nominal V_T = {f2(P)}; fees 0; tax during {f2(tax_total)} (25% of real interest at each maturity, linkage exempt); tax at exit 0. Subject to Q3 (income not given; TXI-20 assumed not to apply).')


def s05():
    path = Path(0.03)
    g = mrate(0.005)
    B = 30000.0
    it_sum = tx_sum = 0.0
    for m in range(1, 13):
        it = B * g
        tx = 0.15 * it
        it_sum += it
        tx_sum += tx
        B += it - tx
    real = B / path.I(12)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Monthly credit rate from 0.5% a year, converted as an effective annual rate (method F-07; D2 closed: reading the 447 rate as r/12 changes V_T by 0.29 NIS) | {L("BANK-04", "BANK-13")} | g = {f6(g)} |\n'
        f'| 2 | Bank withholds 15% of current-account credit interest at monthly crediting | {L("TXI-08", "TXI-03")} | — |\n'
        f'| 3 | TXI-20 deduction: whether current-account interest is "deposit" interest is open (TXI OQ11), and income is not given (Q3); not applied | {L("TXI-20")} | 0 |\n\n'
        f'Result: V_T = {f2(B)}; interest {f2(it_sum)}; tax during {f2(tx_sum)}; real V_T/I_12 = {f2(real)}.'
    )
    section('S05', 'Current-account credit balance', 'computed', body,
            f'Real V_T/I_T = {f2(real)}; nominal V_T = {f2(B)}; fees 0; tax during {f2(tx_sum)} (15% at monthly crediting); tax at exit 0. Subject to Q3.')


def makam_run(cash, y, path, sell_after_months=None):
    spec = {'pct': 0.001, 'min': 20.0}
    p = 100.0 / (1.0 + y)  # 365-day series, N/365 = 1 (GOV-06)
    steps = []
    fees = taxes = 0.0
    # series 1
    v1, c1 = solve_buy(cash, spec)
    face1 = v1 / p * 100.0
    disc1 = face1 - v1
    t1 = 0.15 * disc1
    cash1 = face1 - t1
    fees += c1
    taxes += t1
    steps.append(('Series 1 bought at issue', v1, c1, face1, disc1, t1, cash1))
    v2, c2 = solve_buy(cash1, spec)
    face2 = v2 / p * 100.0
    fees += c2
    if sell_after_months is None:
        disc2 = face2 - v2
        t2 = 0.15 * disc2
        final = face2 - t2
        taxes += t2
        steps.append(('Series 2 bought, redeemed', v2, c2, face2, disc2, t2, final))
        T = 24
        sale = None
    else:
        frac = sell_after_months / 12.0
        ps = 100.0 / (1.0 + y) ** (1.0 - frac)
        gross = face2 * ps / 100.0
        cs = comm_of(gross, spec)
        fees += cs
        gain = gross - v2
        t2 = 0.15 * max(0.0, gain)
        taxes += t2
        final = gross - cs - t2
        sale = (ps, gross, cs, gain, t2)
        steps.append(('Series 2 bought, sold after 6 months', v2, c2 + cs, face2, gain, t2, final))
        T = 12 + sell_after_months
    return {'V': final, 'real_V': final / path.I(T), 'fees': fees, 'tax': taxes, 'steps': steps,
            'sale': sale, 'T': T, 'p': p}


def s06_s07():
    path = Path(0.03)
    a = makam_run(100000.0, 0.039, path)
    b = makam_run(100000.0, 0.039, path, sell_after_months=6)
    rows = [[s[0], f2(s[1]), f2(s[2]), f2(s[3]), f2(s[4]), f2(s[5]), f2(s[6])] for s in a['steps']]
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Price per 100 face = 100 / (1 + y)^(N/365), N = 365 days | {L("GOV-06")} | {f6(a["p"])} |\n'
        f'| 2 | Buy at issue: trade value V and commission c with V + c = cash, c = max(20, 0.1% × V) (commission is a % of the trade) | {L("BRK-16")}; tariff from the scenario | see table |\n'
        f'| 3 | No custody fee on makam at a bank | {L("BRK-17", "BANK-18")} | 0 |\n'
        f'| 4 | At redemption the discount (face − price paid) is interest, taxed and withheld at 15%. Purchase commission is not deducted (no rule allows it) | {L("TXI-01", "TXI-11", "TXI-09")} | see table |\n'
        f'| 5 | Net proceeds buy the next 365-day series; no sale commission at redemption (scenario) | {L("GOV-22", "GOV-23")} | see table |\n'
        f'| 6 | 15% used; the 2025 guide\'s 20% line conflicts (flag) | {L("TXI-11")} (TXI OQ3) | flag |\n\n'
        + table(['Series', 'Trade value', 'Commission', 'Face', 'Discount', 'Tax 15%', 'Cash at redemption'], rows)
        + f'\n\nResult: V_T = {f2(a["V"])}; real V_T/I_24 = {f2(a["real_V"])}; fees (commissions) {f2(a["fees"])}; tax during {f2(a["tax"])} (the second series is taxed at redemption on the exit day); tax at exit 0 beyond that.'
    )
    section('S06', 'Makam rolled yearly', 'computed', body,
            f'Real V_T/I_T = {f2(a["real_V"])}; nominal V_T = {f2(a["V"])}; fees: trade {f2(a["fees"])}, custody 0; tax on the discount {f2(a["tax"])} (15% at each redemption; the month-24 one falls on the exit day); flag "makam rate conflict 15/20%, TXI OQ3".')
    ps, gross, cs, gain, t2 = b['sale']
    rows = [[s[0], f2(s[1]), f2(s[2]), f2(s[3]), f2(s[4]), f2(s[5]), f2(s[6])] for s in b['steps']]
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Series 1 as S06 | {L("GOV-06", "TXI-11")} | see table |\n'
        f'| 2 | Sale price of series 2 after 6 months at the unchanged 3.9% yield: N_remaining/365 taken as 0.5 (grid) | {L("GOV-06")}; Q22 | price {f6(ps)} |\n'
        f'| 3 | Gross sale value; sell commission max(20, 0.1%) | {L("BRK-16")} | gross {f2(gross)}, commission {f2(cs)} |\n'
        f'| 4 | Sale before redemption: capital gain at up to 15%, whole gain treated as real; consideration is the sale price (no rule deducts the sale commission) | {L("TXI-12", "TXS-03")} | gain {f2(gain)}, tax {f2(t2)} |\n'
        f'| 5 | Interest/capital split of the sale price is open but both are 15% | {L("TXI-12")} (TXI OQ3, OQ5) | no effect |\n\n'
        + table(['Series', 'Trade value', 'Commissions', 'Face', 'Discount / gain', 'Tax 15%', 'Cash'], rows)
        + f'\n\nResult: V_T = {f2(b["V"])}; real V_T/I_18 = {f2(b["real_V"])}; fees {f2(b["fees"])}; tax {f2(b["tax"])}.'
    )
    section('S07', 'Makam sold before redemption', 'computed', body,
            f'Real V_T/I_T = {f2(b["real_V"])}; nominal V_T = {f2(b["V"])}; fees: trade {f2(b["fees"])}, custody 0; tax during {f2(a["steps"][0][5])} (series 1 discount); tax at exit {f2(t2)} (15% of the sale gain; sale commission not deducted, D3 decided). Subject to Q22 (days to redemption at the sale).')
    return a


def bond_run(T, cash, coupon, path, linked, coupon_tax, rate_exit=None):
    spec = {'pct': 0.002, 'min': 30.0}
    cust = {'pct': 0.001, 'min': 10.0}
    rate_exit = (0.25 if linked else 0.15) if rate_exit is None else rate_exit

    def price(m):
        return path.I(m) if linked else 1.0  # per 1 face, base index I_0

    lots = []  # [face, cost, J]
    fees = defaultdict(float)
    deductible = defaultdict(float)
    tax_during = 0.0
    coupons = []

    def buy(c, m):
        v, cm = solve_buy(c, spec)
        fees['trade'] += cm
        lots.append([v / price(m), v, path.I(m)])

    def take(amount, m):
        year = (m - 1) // 12 + 1
        fees['custody'] += amount
        deductible[year] += amount
        need = amount / price(m)
        for lot in lots:
            if need <= 0:
                break
            u = min(lot[0], need)
            lot[1] -= lot[1] * u / lot[0]
            lot[0] -= u
            need -= u

    buy(cash, 0)
    last_coupon_net = 0.0
    for m in range(1, T + 1):
        if m % 12 == 0:
            face = sum(l[0] for l in lots)
            cp = coupon * face * (path.I(m) if linked else 1.0)
            tx = coupon_tax * cp
            tax_during += tx
            coupons.append((m, cp, tx))
            if m < T:
                buy(cp - tx, m)
            else:
                last_coupon_net = cp - tx
        if m % 3 == 0:
            val = sum(l[0] for l in lots) * price(m)
            take(max(cust['min'], cust['pct'] * val), m)
    year = (T - 1) // 12 + 1
    face = sum(l[0] for l in lots)
    gross = face * price(T)
    c = comm_of(gross, spec)
    fees['trade'] += c
    ded = deductible[year]
    if linked:
        real = sum(l[0] * price(T) - l[1] * path.I(T) / l[2] for l in lots) - ded
    else:
        real = gross - sum(l[1] for l in lots) - ded
    tax_exit = rate_exit * max(0.0, real)
    V = gross - c - tax_exit + last_coupon_net
    return {'V': V, 'real_V': V / path.I(T), 'fees': dict(fees), 'tax_during': tax_during,
            'tax_exit': tax_exit, 'real_gain': real, 'coupons': coupons, 'gross': gross,
            'exit_comm': c, 'ded': ded, 'face': face}


def s08_s09_s10():
    p3 = Path(0.03)
    r8 = bond_run(36, 100000.0, 0.0375, p3, False, 0.15)
    rows = [[m // 12, f2(cp), f2(tx)] for m, cp, tx in r8['coupons']]
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Buy at price 100: trade value V, commission max(30, 0.2% × V), V + c = 100,000 | {L("BRK-16")} | V = {f2(100000 / 1.002)} |\n'
        f'| 2 | Coupon 3.75% of face once a year (scenario input; the coupon frequency of fixed-rate bonds is not sourced, D4) | {L("GOV-13")} (GOV OQ4) | see table |\n'
        f'| 3 | Coupon on an unlinked bond: 15% of the nominal coupon, withheld | {L("TXI-15", "TXI-03", "TXI-09")} | see table |\n'
        f'| 4 | Net coupons at months 12 and 24 bought back at 100 (new lots, commission min 30); the month-36 coupon is paid out | method F-25 convention; {L("BRK-16")} | — |\n'
        f'| 5 | Custody 0.1% of market value per quarter, min 10, taken from the holding (units leave with their cost) | {L("BRK-16")}; convention C9 | Σ {f2(r8["fees"]["custody"])} |\n'
        f'| 6 | Exit: sold at 100 (A-27 = 0); gain on unlinked bond taxed at up to 15%, whole gain real; exit-year custody fees deducted from the gain | {L("TXI-12", "TXS-03", "TXS-06")} | gain {f2(r8["real_gain"])} → tax {f2(r8["tax_exit"])} |\n\n'
        + table(['Year', 'Coupon', 'Tax 15%'], rows)
        + f'\n\nResult: V_T = {f2(r8["V"])}; real V_T/I_36 = {f2(r8["real_V"])}; fees: trade {f2(r8["fees"]["trade"])}, custody {f2(r8["fees"]["custody"])}; tax during {f2(r8["tax_during"])}; tax at exit {f2(r8["tax_exit"])}.'
    )
    section('S08', 'Unlinked fixed-rate government bond', 'computed', body,
            f'Real V_T/I_T = {f2(r8["real_V"])}; nominal V_T = {f2(r8["V"])}; fees: trade {f2(r8["fees"]["trade"])}, custody {f2(r8["fees"]["custody"])}; tax during {f2(r8["tax_during"])} (15% of coupons); tax at exit {f2(r8["tax_exit"])} (gain ≤ 0). Subject to D4.')

    r9 = bond_run(36, 100000.0, 0.019, p3, True, 0.25)
    rows = [[m // 12, f2(cp), f2(tx)] for m, cp, tx in r9['coupons']]
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Principal and coupon linked to CPI up or down; coupon once a year | {L("GOV-11", "GOV-12")} | — |\n'
        f'| 2 | Price = 100 × I_m (base index at purchase I_0; A-27 = 0) | {L("GOV-11")}; F-03 grid | — |\n'
        f'| 3 | Coupon = 1.9% × face × I_m; taxed at 25% as real interest on a fully linked asset (linkage of principal exempt) | {L("TXI-14", "TXI-05", "TXI-02", "TXI-09")} | see table |\n'
        f'| 4 | Net coupons at months 12, 24 reinvested at 100 × I_m | {L("BRK-16")} | — |\n'
        f'| 5 | Custody as S08 on market value | {L("BRK-16")} | Σ {f2(r9["fees"]["custody"])} |\n'
        f'| 6 | Exit: real gain per lot = sale value − cost × I_36/I_buy, less exit-year custody (TXS-06); up to 25% | {L("TXI-14", "TXG-12", "TXS-06")} | real gain {f2(r9["real_gain"])} → tax {f2(r9["tax_exit"])} |\n\n'
        + table(['Year', 'Indexed coupon', 'Tax 25%'], rows)
        + f'\n\nResult: V_T = {f2(r9["V"])}; real {f2(r9["real_V"])}; fees: trade {f2(r9["fees"]["trade"])}, custody {f2(r9["fees"]["custody"])}; tax during {f2(r9["tax_during"])}; tax at exit {f2(r9["tax_exit"])}.  \n'
        'Reading used in step 3: the whole indexed coupon is "profit above the rise in the index" (TXI-05 guide wording); the rule base does not split linkage on the coupon itself.'
    )
    section('S09', 'CPI-linked government bond', 'computed', body,
            f'Real V_T/I_T = {f2(r9["real_V"])}; nominal V_T = {f2(r9["V"])}; fees: trade {f2(r9["fees"]["trade"])}, custody {f2(r9["fees"]["custody"])}; tax during {f2(r9["tax_during"])} (25% of indexed coupons); tax at exit {f2(r9["tax_exit"])}.')

    pm = Path(-0.01)
    r10 = bond_run(36, 100000.0, 0.019, pm, True, 0.25)
    rows = [[m // 12, f2(cp), f2(tx)] for m, cp, tx in r10['coupons']]
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | π = −1%: principal and coupon are reduced with the index, no floor | {L("GOV-12", "GOV-11")} | I_36 = {f6(pm.I(36))} |\n'
        f'| 2 | The reduced coupon is still taxed in full at 25%; interest and linkage are separate incomes (Supreme Court, applied here by analogy from an FX-linked deposit) | {L("TXI-25", "TXI-14")} | tax during {f2(r10["tax_during"])} |\n'
        f'| 3 | The negative linkage on the principal is not offset: a positive linkage would have been exempt | {L("TXI-25", "TXI-05")} | no loss carried |\n'
        f'| 4 | Exit at indexed par: real gain per lot ≤ 0 → no exit tax. Whether the price loss could offset the year\'s coupon (s.92(a)(4)) is open (TXS OQ15) and worth at most about 410 NIS (0.4%), under the 0.5% line | {L("TXI-12", "TXS-17")} | tax at exit {f2(r10["tax_exit"])} |\n\n'
        + table(['Year', 'Indexed coupon', 'Tax 25%'], rows)
        + f'\n\nResult: V_T = {f2(r10["V"])}; real {f2(r10["real_V"])}; fees: trade {f2(r10["fees"]["trade"])}, custody {f2(r10["fees"]["custody"])}.'
    )
    section('S10', 'CPI-linked bond under deflation', 'computed', body,
            f'Real V_T/I_T = {f2(r10["real_V"])}; nominal V_T = {f2(r10["V"])}; fees: trade {f2(r10["fees"]["trade"])}, custody {f2(r10["fees"]["custody"])}; tax during {f2(r10["tax_during"])} (25% of the reduced coupons, TXI-25); tax at exit {f2(r10["tax_exit"])}; flag "real loss not carried, G-07".')
    return r8


def mmf_daily(T, now, monthly, path, boi, delta, real=True):
    sec = Sec(path, delta=delta)
    sched = contrib_schedule(T, now, monthly, path, real)
    snaps = run_sec2(sec, T, sched, mrate(boi))
    out = sec.liquidate(T)
    return sec, snaps, out


def s11_s13_s37():
    path = Path(0.03)
    sec, snaps, out = mmf_daily(24, 50000.0, 1000.0, path, 0.0325, 0.0018)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Gross return of a daily money-market fund: the BoI rate, as the regulator describes these funds (proxy) | {L("MF-34")} | g = {f6(mrate(0.0325))} |\n'
        f'| 2 | Fund fees (management 0.16% + trustee 0.02%) are deducted inside the price: δ/12 a month | {L("MF-16", "MF-20")} | δ = 0.18% |\n'
        f'| 3 | No commission at a bank under a distribution agreement; no custody on money-market funds | {L("MF-26", "BRK-17")} | 0 |\n'
        f'| 4 | Exempt fund: nothing while holding | {L("TXS-12", "TXS-08")} | 0 |\n'
        f'| 5 | Exit: 25% of the real gain, lots FIFO, inflationary amount = cost × (I_T/I_buy − 1) | {L("TXS-12", "TXS-09", "TXS-06", "TXG-12")} | real gain {f2(out["real_gain"])} → tax {f2(out["tax"])} |\n\n'
        + year_table(snaps)
        + f'\n\nResult: V_T = {f2(out["V"])}; real {f2(out["real_V"])}; fund fees {f2(sec.fees["fund"])}; tax at exit {f2(out["tax"])}; lots with negative real gain: {out["neg_real_lots"]}.'
    )
    section('S11', 'Daily money-market fund at a bank', 'computed', body,
            f'Real V_T/I_T = {f2(out["real_V"])}; nominal V_T = {f2(out["V"])}; paid in {f2(sec.invested)}; fees: fund (δ) {f2(sec.fees["fund"])}, trade 0, custody 0; tax during 0; tax at exit {f2(out["tax"])} (25% of real gain {f2(out["real_gain"])}). Subject to Q1.')

    # S13 taxable money-market fund
    sec13 = Sec(path, delta=0.0018)
    sched = contrib_schedule(24, 50000.0, 1000.0, path, True)
    g = mrate(0.0325)
    fund_tax = 0.0
    snaps13 = []
    for m in range(1, 25):
        for cash, jm in sched.get(m, []):
            sec13.buy(cash, jm)
        fund_tax += sec13.value() * 0.15 * g
        sec13.fees['fund'] += sec13.value() * 0.0018 / 12
        sec13.P *= (1.0 + g - 0.0018 / 12 - 0.15 * g)
        if m % 12 == 0:
            snaps13.append({'m': m, 'B': sec13.value(), 'in': sec13.invested, 'fees': sec13.fees['fund'],
                            'tax_during': fund_tax, 'real_B': sec13.value() / path.I(m)})
    V13 = sec13.value()
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Taxable fund: the fund pays tax at individual rates on its income; the holder pays nothing on sale or distributions; a loss cannot be offset | {L("TXS-11", "TXS-24")} | — |\n'
        f'| 2 | Fund-level rate on unlinked shekel interest: 15% of nominal interest (derived in the rule file, not stated by the Tax Authority) | {L("TXS-11", "TXS-12")} (TXS OQ11) | 15% × g each month |\n'
        f'| 3 | Monthly NAV growth = g − δ/12 − 0.15 × g (tax on gross interest; whether fees are deductible at fund level is not in the rule base, Q11) | as above | — |\n'
        f'| 4 | Holder exit tax 0 | {L("TXS-11")} | 0 |\n\n'
        + year_table(snaps13)
        + f'\n\nResult: V_T = {f2(V13)}; real {f2(V13 / path.I(24))}; fund-level tax borne {f2(fund_tax)}.'
    )
    section('S13', 'Taxable shekel money-market fund (derived)', 'computed', body,
            f'Real V_T/I_T = {f2(V13 / path.I(24))}; nominal V_T = {f2(V13)}; fees: fund (δ) {f2(sec13.fees["fund"])}; fund-level tax borne {f2(fund_tax)} (inside the price); holder tax during 0, at exit 0; label "derived, TXS-12(b)"; loss not offsettable (TXS-11). Subject to Q11.')

    # S37 negative real gain
    sec37, snaps37, out37 = mmf_daily(24, 100000.0, 0.0, path, 0.01, 0.0018)
    nominal = out37['V'] + out37['tax'] - 100000.0
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | As S11 with BoI 1%: g = 1.01^(1/12) − 1, δ = 0.18% | {L("MF-34", "MF-16")} | g = {f6(mrate(0.01))} |\n'
        f'| 2 | Real gain = gain − inflationary amount; tax 25% of real gain; a negative real gain gives no tax | {L("TXS-09", "TXS-02", "TXG-12")} | real {f2(out37["real_gain"])} |\n'
        f'| 3 | Whether the real loss is an allowable loss is open; it is not carried | {L("TXG-12")} (TXG OQ13, TXS OQ15) | flag |\n'
    )
    section('S37', 'Negative real gain', 'computed', body,
            f'Real V_T/I_T = {f2(out37["real_V"])}; nominal V_T = {f2(out37["V"])}; nominal gain {f2(nominal)} (positive); real gain {f2(out37["real_gain"])} (negative); tax 0; fees: fund {f2(sec37.fees["fund"])}; flag "real loss not carried, G-07" (TXG OQ13).')


def s12():
    path = Path(0.03)
    sec = Sec(path)
    sec.buy(100000.0, 0)
    g = mrate(0.0357)
    for m in range(1, 13):
        sec.grow(g)
    out = sec.liquidate(12)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Expected yield is net of fund fees, before tax: g = 1.0357^(1/12) − 1, δ = 0 | {L("MF-37")} | g = {f6(g)} |\n'
        f'| 2 | Liquidity only on fixed dates; 3-month dates → the last fixed date before month 14 is month 12 | {L("MF-35")} | exit month 12 |\n'
        f'| 3 | Exempt fund: 25% of real gain at exit | {L("TXS-12", "TXS-09")} | tax {f2(out["tax"])} |\n'
        f'| 4 | No bank commission | {L("MF-26")} | 0 |\n'
    )
    section('S12', 'Renewable money-market fund, quarterly dates', 'computed', body,
            f'Exit at month 12: nominal V = {f2(out["V"])}; real V/I_12 = {f2(out["real_V"])} (V/I_14 = {f2(out["V"] / path.I(14))} if the 2 idle months are counted, Q4); fees 0 (inside the yield); tax at exit {f2(out["tax"])}. Subject to Q4.')


def etf_sec(path, index='I', delta=0.011085, spread=0.0005,
            comm={'pct': 0.003, 'min': 25.0}, custody={'pct': 0.0015, 'min': 15.0}, fx=0.0,
            fixed_month=0.0, mgr_fee=0.0, rate=0.25):
    return Sec(path, index=index, delta=delta, spread=spread, comm=comm, custody=custody, fx=fx,
               fixed_month=fixed_month, mgr_fee=mgr_fee, rate=rate)


def run_etf(T, now, monthly, r, pi, real=True, f=0.0, orders=1, rate=0.25, **kw):
    path = Path(pi, f)
    sec = etf_sec(path, rate=rate, **kw)
    sched = contrib_schedule(T, now, monthly, path, real, orders=orders)
    snaps = run_sec2(sec, T, sched, mrate(r))
    out = sec.liquidate(T)
    return sec, snaps, out, path


def etf_steps(delta_txt, comm_txt, cust_txt, spread_txt, index_txt, extra=''):
    return (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Gross return of the exposure g = (1 + r_g)^(1/12) − 1 (A-01 entered) | method A-01 (input) | — |\n'
        f'| 2 | Fund costs inside the price, δ/12 a month: {delta_txt} | {L("ETF-13", "ETF-14", "MF-16")} | — |\n'
        f'| 3 | Each contribution is one order: trade value V and commission c with V + c = cash, c = {comm_txt} | {L("BRK-16")} | — |\n'
        f'| 4 | Bought at the ask: NAV × (1 + half-spread {spread_txt}); the price paid is the cost basis (commission excluded, G-20) | {L("ETF-06", "ETF-07", "TXG-12")} | — |\n'
        f'| 5 | Custody {cust_txt} of market value at each quarter end, taken from the holding (units leave FIFO with their cost) | {L("BRK-16")}; convention C9 | — |\n'
        f'| 6 | Exit: sell at the bid, commission on the gross sale; consideration = gross sale value | {L("BRK-16", "TXG-12")} | — |\n'
        f'| 7 | Real gain per lot = sale value − cost × J_T/J_buy, index J = {index_txt}; FIFO; exit-year custody (and management) fees deducted once | {L("TXS-06", "TXG-12", "TXS-02")} | — |\n'
        f'| 8 | Tax 25% of the real gain, withheld by the bank (under 60: 25% binds) | {L("TXS-13", "TXS-09", "TXS-05", "TXG-08")} | — |\n'
        + extra
    )


def fees_line(sec, out):
    f = sec.fees
    return (f'trade {f2(f["trade"] + out["exit_commission"])}, spread {f2(f["spread"] + out["exit_spread"])}, '
            f'custody {f2(f["custody"])}, fund (δ) {f2(f["fund"])}'
            + (f', FX {f2(f["fx"] + out["exit_fx"])}' if (f["fx"] or out["exit_fx"]) else '')
            + (f', account {f2(f["fixed"])}' if f["fixed"] else '')
            + (f', IRA manager {f2(f["manager"])}' if f["manager"] else ''))


def s14_s15_s16():
    sec, snaps, out, path = run_etf(60, 20000.0, 2000.0, 0.06, 0.025)
    body = (etf_steps('fixed 0.80% + variable 0.30% + trustee 0.0085% = 1.1085% (tracking difference 0)',
                      'max(25, 0.3% × V)', '0.15% (min 15)', '0.05%', 'CPI (shekel fund, not a foreign-investment fund, TXS-14)')
            + '\n' + year_table(snaps) + '\n\n'
            + f'Exit: gross sale {f2(out["gross_or_B"])}, commission {f2(out["exit_commission"])}, spread {f2(out["exit_spread"])}, '
              f'exit-year custody deducted {f2(out["deductible_exit_year"])}, real gain {f2(out["real_gain"])}, tax {f2(out["tax"])}.  \n'
            + f'Result: V_T = {f2(out["V"])}; real {f2(out["real_V"])}.')
    section('S14', 'Israeli accumulating ETF on a foreign index, bank brokerage', 'computed', body,
            f'Real V_T/I_T = {f2(out["real_V"])}; nominal V_T = {f2(out["V"])}; paid in {f2(sec.invested)}; fees: {fees_line(sec, out)}; tax during 0; tax at exit {f2(out["tax"])} (real gain {f2(out["real_gain"])}). Subject to Q1, Q2.')

    s15, sn15, o15, _ = run_etf(60, 20000.0, 2000.0, 0.06, 0.025, delta=0.0002, spread=0.0,
                                comm={'pct': 0.001, 'min': 10.0})
    body = (etf_steps('trustee 0.02% (manager 0%)', 'max(10, 0.1% × V) (bank mutual-fund line; a distributor may charge only a transaction fee on tracking funds, MF-26)',
                      '0.15% (min 15)', '0 (no exchange trade)', 'CPI', extra=f'| 9 | No distribution fee on tracking funds; order through the distributor | {L("MF-25", "MF-11", "MF-26")} | — |\n')
            + '\n' + year_table(sn15) + '\n\n'
            + f'Result: V_T = {f2(o15["V"])}; real {f2(o15["real_V"])}; tax {f2(o15["tax"])}.')
    section('S15', 'Israeli open tracking fund, same index, no trading costs', 'computed', body,
            f'Real V_T/I_T = {f2(o15["real_V"])}; nominal V_T = {f2(o15["V"])}; fees: {fees_line(s15, o15)}; tax at exit {f2(o15["tax"])}. Subject to Q1, Q2.')

    # S16 TASE-registered foreign fund, FX index
    s16, sn16, o16, p16 = run_etf(60, 100000.0, 0.0, 0.06, 0.025, f=0.01, index='X', delta=0.0007 + 0.0023,
                                  spread=0.0, custody={'pct': 0.0015, 'min': 0.0})
    body = (etf_steps('fixed fee 0.07% + fund-level withholding drag 0.23% (A-11 = 1.5% × 15%, TXF-16)', 'max(25, 0.3% × V)',
                      '0.15% (no minimum given, Q21)', '0 (not given; A-08 default)', 'the exchange rate X_m = 1.01^(m/12): 90% test met (TXF-04)',
                      extra=f'| 9 | Fund-level foreign withholding is a cost inside the fund, not creditable | {L("TXF-16", "TXF-06")} | — |\n'
                            f'| 10 | Accumulating foreign fund: no Israeli rule taxes undistributed income of a non-controlling holder, so tax falls only at sale. No Tax Authority statement was found (Chrome search, 2026-10-22); one secondary source agrees → computes, labelled "secondary source" | {L("TXF-11")} (TXF OQ1) | secondary |\n')
            + '\n' + year_table(sn16) + '\n\n'
            + f'Under the TXF-11 reading: real gain vs X {f2(o16["real_gain"])}, tax {f2(o16["tax"])}, V_T {f2(o16["V"])}, real {f2(o16["real_V"])}.')
    section('S16', 'TASE-registered foreign fund (קרן חוץ), FX index for tax', 'computed', body,
            f'Real V_T/I_T = {f2(o16["real_V"])}; nominal V_T = {f2(o16["V"])}; fees: {fees_line(s16, o16)}; tax at exit {f2(o16["tax"])} (25% of real gain vs the exchange rate, {f2(o16["real_gain"])}); label "secondary source: tax only at sale, not confirmed by the Tax Authority" (TXF-11); row "listed, not ranked". Subject to Q21.')
    return out


# --------------------------------------------------------------------------
# Part B
# --------------------------------------------------------------------------

def kgl_schedule(T, now, monthly, path, real=True):
    s = defaultdict(list)
    if now:
        s[1].append((now, 0))
    for m in range(1, T + 1):
        if monthly:
            s[m].append((monthly * (path.I(m) if real else 1.0), m))
    return s


def ceiling_check(sched, T, cap=83641.0):
    years = defaultdict(float)
    for m, lst in sched.items():
        for a, _ in lst:
            years[(m - 1) // 12 + 1] += a
    return {y: (v, v <= cap) for y, v in sorted(years.items())}


def s20_s21_s22():
    path = Path(0.025)
    T = 60
    sched = kgl_schedule(T, 20000.0, 2000.0, path)
    res = run_provident(T, sched, 0.06, path, direct=0.0010, balfee=lambda m: 0.008)
    ex = kgl_exit(res, path, T)
    ceil = ceiling_check(sched, T)
    crows = [[y, f2(v), 'yes' if ok else 'NO'] for y, (v, ok) in ceil.items()]
    snaps = res['snaps']
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Deposits: 20,000 at t = 0 and 2,000 × I_m monthly; no deduction or credit | {L("TXK-01")} | Σ {f2(ex["dep_sum"])} |\n'
        f'| 2 | Annual ceiling 83,641 per person per calendar year, checked at deposit (figure is institution-strength) | {L("KGL-02", "KGL-03", "KGL-04", "TXK-02")} | all years within |\n'
        f'| 3 | Deposit fee 0% (cap 4%); balance fee 0.8%/12 of the month-end balance (cap 1.05%) | {L("KGL-14", "KGL-15", "PF-02", "PF-09")} | — |\n'
        f'| 4 | Direct investment expenses 0.10% added to the balance fee, 0.10%/12 of the month-end balance (method F-15; D16 closed as immaterial) | {L("PF-10")} | — |\n'
        f'| 5 | No tax during | {L("TXK-03")} | 0 |\n'
        f'| 6 | Lump sum at exit: gains are interest income at up to 25%; managers withhold 25% of the real gain (deposits indexed from each deposit month) — institution/secondary strength, label "base: secondary source" | {L("TXK-05", "TXK-06", "TXK-07")} | real gain {f2(ex["real_gain"])} |\n'
        f'| 7 | Sensitivity line: 15% of the nominal gain (s.125C(c) limb) | {L("TXK-06")} (TXK OQ2) | nominal gain {f2(ex["nominal_gain"])} |\n'
        f'| 8 | NII on the deemed interest is open | {L("TXK-05")} (TXK OQ9) | flag G-11 |\n\n'
        + table(['Calendar year', 'Deposits', 'Within 83,641'], crows) + '\n\n'
        + year_table(snaps) + '\n\n'
        + f'Result: B_T = {f2(res["B"])}; 25% real: tax {f2(ex["tax25real"])}, V {f2(ex["V25"])}, real {f2(ex["realV25"])}; 15% nominal: tax {f2(ex["tax15nom"])}, V {f2(ex["V15"])}, real {f2(ex["realV15"])}.'
    )
    section('S20', 'Kupat gemel lehashkaa, list fees', 'computed', body,
            f'Real V_T/I_T = {f2(ex["realV25"])} with 25% of the real gain (label "base: secondary source"); nominal V_T = {f2(ex["V25"])}; alternative 15% of nominal gain: real {f2(ex["realV15"])}, nominal {f2(ex["V15"])}; gross balance {f2(res["B"])}; fees: balance {f2(res["fees"]["balance"])}, direct expenses {f2(res["fees"]["direct"])}, deposit 0; tax during 0; tax at exit {f2(ex["tax25real"])} (alt. {f2(ex["tax15nom"])}); ceiling not reached in any year; flag G-11 (NII on deemed interest). Subject to D15, Q1.')

    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | One ceiling per person per calendar year across all managers: 83,641 in 2026 (institution sources only) | {L("KGL-02", "KGL-03", "TXK-02")} | 83,641 |\n'
        f'| 2 | Checked at deposit, not at year end | {L("KGL-04")} | — |\n'
        f'| 3 | Accepted = min(90,000, 83,641); excess routed to the next goal (D12) | {L("KGL-02")}; product D12 | accepted 83,641, routed {f2(90000 - 83641)} |\n'
        '| 4 | The value of the accepted part over 1 year is not asked for, and no market inputs are given | — | — |\n'
    )
    section('S21', 'Kupat gemel lehashkaa, ceiling breached', 'computed', body,
            f'83,641 accepted; {f2(90000.0 - 83641.0)} routed to the next goal; message shown. The 83,641 figure is institution-strength only (KGL-03; D15).')

    res24 = run_provident(T, sched, 0.06, path, direct=0.0010, balfee=lambda m: 0.005 if m <= 24 else 0.0105)
    res60 = run_provident(T, sched, 0.06, path, direct=0.0010, balfee=lambda m: 0.005)
    e24 = kgl_exit(res24, path, T)
    e60 = kgl_exit(res60, path, T)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | As S20 with a 0.5% balance-fee discount; the scenario has it revert to 1.05% after 24 months | {L("KGL-16", "PF-02")} | — |\n'
        f'| 2 | A discount must last at least 5 years; the CMA circular covers kupat gemel lehashkaa (its scope excludes only sector and guaranteed-return funds). The bylaws\' 2 years is the replaced 2012 rule (checked 2026-10-22) | {L("PF-13", "KGL-16")} | 5 years |\n'
        f'| 3 | So inside the 60-month horizon the fee stays 0.5%; no PF-14 trigger (withdrawal, transfer, deposits stopping) occurs | {L("PF-13", "PF-14")} | B_T {f2(res60["B"])} |\n'
        f'| 3\' | For reference, reverting at month 24 as the scenario states would give B_T {f2(res24["B"])}; the rule does not allow it | {L("PF-13")} | flag |\n'
        f'| 4 | Exit tax as S20 | {L("TXK-07")} | — |\n'
    )
    section('S22', 'Kupat gemel lehashkaa, fee discount expiring', 'computed', body,
            f'Real V_T/I_T = {f2(e60["realV25"])} (25% real), nominal {f2(e60["V25"])}; 15%-nominal alternative real {f2(e60["realV15"])}; balance fees {f2(res60["fees"]["balance"])}; tax at exit {f2(e60["tax25real"])}. The discount cannot revert inside 5 years (PF-13 covers kupat gemel lehashkaa), so the fee stays 0.5% for the whole 60 months; the scenario\'s 24-month reversion is not allowed by the rule (it would give real {f2(e24["realV25"])}). Subject to D15.')
    return ex


def hish_run(T, monthly, path, bal=0.006, direct=0.0011, r=0.06):
    s = defaultdict(list)
    for m in range(1, T + 1):
        s[m].append((monthly, m))
    return run_provident(T, s, r, path, direct=direct, balfee=lambda m: bal)


def s23_s24_s25_s26():
    path = Path(0.025)
    own = hish_run(84, 300.0, path)
    emp = hish_run(84, 900.0, path)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Employee deposit 2.5% × 12,000 = 300 from net salary, no deduction or credit; benefited (≤ 2.5% of determining salary) | {L("TXH-04", "TXH-08", "KH-04")} | 300/month nominal |\n'
        f'| 2 | Employer 7.5% × 12,000 = 900 ≤ 7.5% × 15,712: not taxed at deposit | {L("TXH-01", "TXH-02")} | 900/month |\n'
        f'| 3 | Balance fee 0.6% (cap 2%), no deposit fee; direct expenses 0.11% inside the return | {L("KH-22", "PF-06", "PF-10")} | — |\n'
        f'| 4 | No tax during | {L("TXH-18")} | 0 |\n'
        f'| 5 | Exit at month 84 > 6 years from the first payment date (clock from month 0 per the scenario): all exempt | {L("TXH-09", "KH-11")} | tax 0 |\n\n'
        'Own money:\n\n' + year_table(own['snaps']) + '\n\nEmployer line:\n\n' + year_table(emp['snaps'])
    )
    section('S23', 'Keren hishtalmut, employee, horizon past 6 years', 'computed', body,
            f'Own money (ranked): real V_T/I_T = {f2(own["B"] / path.I(84))}; nominal V_T = {f2(own["B"])}; paid in {f2(own["deposits"] and sum(d[0] for d in own["deposits"]))}; fees: balance {f2(own["fees"]["balance"])}, direct {f2(own["fees"]["direct"])}; tax 0. Employer line "only available here" (900/month): real {f2(emp["B"] / path.I(84))}, nominal {f2(emp["B"])}; both exempt at exit. Subject to Q1.')

    # S24
    own48 = hish_run(48, 300.0, path)
    s_stop = defaultdict(list)
    for m in range(1, 49):
        s_stop[m].append((300.0, m))
    own72_stop = run_provident(72, s_stop, 0.06, path, direct=0.0011, balfee=lambda m: 0.006)
    emp48 = hish_run(48, 900.0, path)
    gains = own48['B'] - 300.0 * 48
    t31 = 0.31 * gains
    emp_gains = emp48['B'] - 900.0 * 48
    emp_dep_tax = bracket_tax(144000 + 43200, [(84120, .10), (120720, .14), (228000, .20), (301200, .31), (560280, .35), (math.inf, .47)]) - bracket_tax(144000, BRK60)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Horizon 48 < 72 months: locked; listed, not ranked, valued at its first lawful exit date (month 72) | method B3; {L("TXH-09", "KH-10")} | — |\n'
        f'| 2 | Value at month 72: contributions stop at the goal\'s horizon (month 48), the balance grows to month 72 (product D16) | {L("TXH-09")} | {f2(own72_stop["B"])} (real {f2(own72_stop["B"] / path.I(72))}) |\n'
        f'| 3 | Opt-in early withdrawal at month 48: own deposits are not taxed again; gains are taxed at ordinary s.121 rates (s.125C(d)(5)); the fund withholds 47% and the excess is refunded (A-14) | {L("TXH-13", "TXH-15", "TXI-06")} | gains {f2(gains)} |\n'
        f'| 4 | Which schedule: the gains are interest income, not personal-effort income, so the s.121 schedule for passive income starts at 31% (salary 144,000 + gains stays below 301,200) | {L("TXG-03", "TXH-11")} | 31% → {f2(t31)} |\n'
        f'| 5 | Withholding 47% at payment, refund through a return | {L("TXH-15", "TXG-25")} | withheld {f2(0.47 * gains)} |\n'
        f'| 6 | Employer line on early withdrawal: benefited employer deposits (43,200) are work income when received, stacked on salary 144,000 → 20% band; their gains at 31% | {L("TXH-13", "TXH-01", "TXG-02", "TXG-03")} | tax on deposits {f2(emp_dep_tax)}, on gains {f2(0.31 * emp_gains)} |\n'
    )
    section('S24', 'Keren hishtalmut, horizon 4 years (locked, listed not ranked)', 'computed', body,
            f'(a) Listed, not ranked, "locked until month 72": value at month 72 = {f2(own72_stop["B"])} nominal, {f2(own72_stop["B"] / path.I(72))} real (deposits stop at month 48, product D16). Exempt then. (b) Opt-in at month 48: balance {f2(own48["B"])}, gains {f2(gains)}; tax at 31% (income not from personal effort, TXG-03) = {f2(t31)} → V = {f2(own48["B"] - t31)}, real {f2((own48["B"] - t31) / path.I(48))}; 47% withheld ({f2(0.47 * gains)}), difference refunded (A-14). Employer line (b): balance {f2(emp48["B"])}, tax on deposits {f2(emp_dep_tax)} + on gains {f2(0.31 * emp_gains)} (31%). NI and health on early-withdrawal gains not modelled (G-27). Subject to Q1.')

    # S25
    cap_sal = 15712.0
    emp_benef = 0.075 * cap_sal
    emp_excess = 0.075 * 20000 - emp_benef
    own_benef = 0.025 * cap_sal
    own_excess = 0.025 * 20000 - own_benef
    tau = marginal_rate(240000 + 12 * emp_excess)
    own_b = hish_run(84, own_benef, path)
    own_x = hish_run(84, own_excess, path)
    ex_own = kgl_exit(own_x, path, 84)
    own_V = own_b['B'] + own_x['B'] - ex_own['tax25real']
    empb = hish_run(84, emp_benef, path)
    empx = hish_run(84, emp_excess, path)
    ex_emp = kgl_exit(empx, path, 84)
    dep_tax = tau * emp_excess * 84
    ni_health = 0.1217 * emp_excess * 84
    emp_net = empb['B'] + empx['B'] - ex_emp['tax25real'] - dep_tax - ni_health
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Determining salary capped at 15,712 a month | {L("TXH-02")} | — |\n'
        f'| 2 | Own deposit 2.5% × 20,000 = 500: benefited part {f2(own_benef)} (2.5% of 15,712), excess {f2(own_excess)} | {L("TXH-08")} | — |\n'
        f'| 3 | Gains on the excess own deposits: 25% of the real gain at withdrawal (two managers state this; institution) | {L("TXH-11")} | tax {f2(ex_own["tax25real"])} |\n'
        f'| 4 | Employer 7.5% × 20,000 = 1,500: benefited {f2(emp_benef)}; excess {f2(emp_excess)} is salary when paid | {L("TXH-01", "TXH-03")} | — |\n'
        f'| 5 | Income tax on the excess at the marginal rate: salary 240,000 + {f2(12 * emp_excess)} a year is in the 31% band | {L("TXG-02", "TXH-03")} | {f2(dep_tax)} over 84 months |\n'
        f'| 6 | Employee NI and health on the excess at the full salary rate 12.17% (salary is above 7,703 a month); that the excess is in the base is an inference | {L("TXG-35", "TXH-01")} | {f2(ni_health)} over 84 months |\n'
        f'| 7 | Gains on the employer excess: 25% of the real gain at withdrawal (institution) | {L("TXH-11")} | tax {f2(ex_emp["tax25real"])} |\n'
        f'| 8 | Benefited parts exempt after 6 years | {L("TXH-09")} | 0 |\n'
    )
    section('S25', 'Keren hishtalmut, salary above the determining-salary cap', 'computed', body,
            f'Own money (500/month): real V_T/I_T = {f2(own_V / path.I(84))}, nominal {f2(own_V)}; benefited {f2(own_benef)}/month exempt, excess {f2(own_excess)}/month taxed 25% of its real gain at exit ({f2(ex_own["tax25real"])}, institution source). Employer line: gross {f2(empb["B"] + empx["B"])}; less tax on the excess at deposit {f2(dep_tax)} (31%) and NI and health {f2(ni_health)} (12.17%, inference), and 25% real on the excess gains at exit {f2(ex_emp["tax25real"])}: net {f2(emp_net)} nominal (deposit-time taxes subtracted at face value, as F-52). Subject to Q1.')



def pension_run(T, path, r, C, credit_year, depfee, ins, bal, employer_month=0.0):
    s_own = defaultdict(list)
    s_emp = defaultdict(list)
    for m in range(1, T + 1):
        s_own[m].append((C * path.I(m) + credit_year / 12.0, m))
        if employer_month:
            s_emp[m].append((employer_month, m))
    own = run_provident(T, s_own, r, path, balfee=lambda m: bal, depfee=depfee, ins=ins)
    emp = run_provident(T, s_emp, r, path, balfee=lambda m: bal, depfee=depfee, ins=ins) if employer_month else None
    return own, emp


def s27_s28_s30():
    path = Path(0.02)
    salary = 10000.0
    E = min(12 * salary, 116400.0)
    cap = 0.07 * E
    existing = 0.06 * 12 * salary
    headroom = max(0.0, cap - max(existing, 0.0))
    credit = 0.35 * headroom  # new deposits per year exceed the headroom
    yr1_C = sum(300.0 * path.I(m) for m in range(1, 13))
    own, emp = pension_run(360, path, 0.05, 300.0, credit, 0.01, 0.015, 0.0022, employer_month=0.125 * salary)
    own_noins, emp_noins = pension_run(360, path, 0.05, 300.0, credit, 0.01, 0.0, 0.0022, employer_month=0.125 * salary)
    tot_y1 = 0.185 * 12 * salary + yr1_C + credit
    tot_y5 = 0.185 * 12 * salary + sum(300.0 * path.I(m) for m in range(49, 61)) + credit
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Credit 35% on employee deposits up to 7% of eligible income, eligible income capped at 116,400 a year | {L("TXP-01", "TXP-02", "TXP-27")} | cap {f2(cap)} |\n'
        f'| 2 | Existing employee deposits 6% × 120,000 = {f2(existing)} use the cap first | {L("TXP-02")} | headroom {f2(headroom)} |\n'
        f'| 3 | New deposits a year (≥ {f2(yr1_C)}) exceed the headroom, so the credit cap binds: credit = 35% × {f2(headroom)} | {L("TXP-01", "TXP-02")} | {f2(credit)} a year |\n'
        f'| 4 | Equal net outlay: gross deposit D_m = 300 × I_m + credit/12 (credit spread evenly; whether payroll gives it monthly is open, TXP OQ6) | method F-30 (B1); {L("TXP-02")} | D_1 = {f2(300 * path.I(1) + credit / 12)} |\n'
        f'| 5 | Beneficiary-member test (16% of average wage = 26,436, employer money counted): year 1 total {f2(tot_y1)}; year 5 {f2(tot_y5)} crosses it with 2026 figures held fixed — no effect: all salary is insured income, so the s.45A(e) cap is the same 8,148 and the s.47(b1) tiers are 0 | {L("TXP-03", "TXP-04", "TXP-06")} | no change |\n'
        f'| 6 | Selected fund fees 1% of deposits + 0.22% of balance (caps 6%, 0.5%); insurance 1.5% of deposits (entered, A-17) | {L("PEN-23", "PF-04", "PEN-15")} | — |\n'
        f'| 7 | Employer 6.5% + 6% severance = 1,250 a month, within the 7.5% and severance ceilings: not taxed at deposit | {L("PEN-03", "TXP-10", "TXP-11")} | — |\n'
        f'| 8 | No tax during; exit at 60 is an annuity whose value needs conversion factors: blocked | {L("TXP-13", "TXP-14")} (PEN OQ7) | blocked (G-03) |\n'
    )
    section('S27', 'Pension deposit by an employee', 'computed', body,
            f'Gross deposit D_m = 300 × I_m + {f2(credit / 12)} (credit {f2(credit)} a year; the 7% cap binds — the scenario title says it does not, see Q18); month-1 gross deposit {f2(300 * path.I(1) + credit / 12)}. Gross balance at 60 (month 360): {f2(own["B"])} nominal, {f2(own["B"] / path.I(360))} real; fees: deposit {f2(own["fees"]["deposit"])}, insurance {f2(own["fees"]["insurance"])}, balance {f2(own["fees"]["balance"])}. Flag "exit: annuity rules, blocked (G-03)"; listed, not ranked. Employer line (1,250/month, same fees and insurance): {f2(emp["B"])} nominal, {f2(emp["B"] / path.I(360))} real ({f2(emp_noins["B"])} if insurance is not charged on employer money, Q18). Subject to Q1, Q18.')

    own30, emp30 = pension_run(360, path, 0.05, 300.0, credit, 0.0, 0.0, 0.005, employer_month=0.125 * salary)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Same tax category as a pension fund: same deposit-side credit as S27 | {L("TXP-24", "TXP-02")} | credit {f2(credit)} a year |\n'
        f'| 2 | Fees 0.5% of balance, 0% of deposits (caps 1.05% / 4%); no pooled insurance | {L("PEN-22", "PEN-35")} | — |\n'
        f'| 3 | Exit blocked as S27 | {L("TXP-14")} (PEN OQ7) | G-03 |\n'
    )
    section('S30', 'Provident fund for annuity vs pension, same money', 'computed', body,
            f'Gross deposit as S27 (300 × I_m + {f2(credit / 12)}). Gross balance at 60: {f2(own30["B"])} nominal, {f2(own30["B"] / path.I(360))} real; balance fees {f2(own30["fees"]["balance"])}; no deposit fee, no insurance. Employer line: {f2(emp30["B"])} nominal, {f2(emp30["B"] / path.I(360))} real. Exit blocked (G-03), listed. Subject to Q1, Q18.')



def s31_s32():
    path = Path(0.02)
    res = {}
    for girl in (False, True):
        g13 = 144 if girl else 156
        grants = [(36, 291.0 * path.I(36)), (g13, 291.0 * path.I(g13)), (252, 582.0 * path.I(252))]
        g = mrate(0.06)
        B = 0.0
        principal = []  # (amount, index month): deposits, addition and grants are not income (TXK-19)
        b18 = None
        for m in range(1, 253):
            if m <= 216:
                k = (m - 1) // 12 + 1
                amt = 2 * 58.0 * path.I(12 * (k - 1))
                B += amt
                principal.append((amt, m))
            B *= (1.0 + g)
            for gm, ga in grants:
                if gm == m:
                    B += ga
                    principal.append((ga, gm))
            if m == 216:
                b18 = (B, list(principal))

        def exit_tax(bal, prin, T):
            real = bal - sum(a * path.I(T) / path.I(j) for a, j in prin)
            return real, 0.25 * max(0.0, real)
        r18, t18 = exit_tax(b18[0], b18[1], 216)
        r21, t21 = exit_tax(B, principal, 252)
        res[girl] = {'b18': b18[0], 'paid18': sum(a for a, j in b18[1] if j <= 216), 'b21': B, 'grants': grants,
                     'r18': r18, 't18': t18, 'r21': r21, 't21': t21}
    bo, gi = res[False], res[True]
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | NII deposits 58 a month (2026), updated once a year on 1 January by the CPI rise: year k deposit = 58 × I_(12(k−1)) (D7 closed: the rule\'s annual step) | {L("CS-03")} | — |\n'
        f'| 2 | Parental addition of the same amount from birth (doubling) → 116 a month in 2026; deposits months 1..216 | {L("CS-04")} | — |\n'
        f'| 3 | Born 2026-01-01 (2017+ cohort): 291 at age 3, 291 at 13 (boy) or 12 (girl), 582 at 21 if nothing was withdrawn; each CPI-updated each 1 January | {L("CS-13")} | sex not given (Q10): both shown |\n'
        f'| 4 | Growth at r_g 6%; no management fees until 21 (NII pays); 0.23% of balance after 21 | {L("CS-18")} | — |\n'
        f'| 5 | Deposits, addition and grants are not income: they are principal | {L("TXK-19")} | — |\n'
        f'| 6 | Tax at withdrawal, provident route: 25% of the real gain, withheld (secondary source, TXK-23; no official rate) | {L("TXK-20", "TXK-23")} | see table |\n\n'
        + table(['Case', 'Paid in by 18', 'Balance at 18', 'Real gain at 18', 'Tax if withdrawn at 18', 'Balance at 21', 'Real gain at 21', 'Tax if withdrawn at 21'],
                [[lab, f2(r['paid18']), f2(r['b18']), f2(r['r18']), f2(r['t18']), f2(r['b21']), f2(r['r21']), f2(r['t21'])]
                 for lab, r in (('boy', bo), ('girl', gi))])
        + '\n\nGrants (nominal): ' + ', '.join(f'month {gm}: {f2(ga)}' for gm, ga in bo['grants'])
    )
    section('S31', 'Child savings, provident route, doubled', 'computed', body,
            f'Gross balance at 18 = {f2(bo["b18"])} (boy) / {f2(gi["b18"])} (girl), real {f2(bo["b18"] / path.I(216))} / {f2(gi["b18"] / path.I(216))}; at 21 = {f2(bo["b21"])} / {f2(gi["b21"])}, real {f2(bo["b21"] / path.I(252))} / {f2(gi["b21"] / path.I(252))}. Tax if withdrawn at 21: {f2(bo["t21"])} / {f2(gi["t21"])} (25% of the real gain, label "secondary source", TXK-23); at 18: {f2(bo["t18"])} / {f2(gi["t18"])}. Grants: {f2(bo["grants"][0][1])} at 3, {f2(291 * path.I(156))} at 13 (boy) or {f2(291 * path.I(144))} at 12 (girl), {f2(bo["grants"][2][1])} at 21. Fees 0 until 21, then 0.23% of balance. Subject to Q10 (sex).')



def s33():
    path = Path(0.025)
    sec = Sec(path, delta=0.011085, spread=0.0005, comm={'pct': 0.001, 'min': 15.0},
              custody={'pct': 0.0005, 'min': 0.0}, mgr_fee=0.003, rate=0.0)
    sec.buy(250000.0, 0)
    snaps = []
    g = mrate(0.06)
    for m in range(1, 61):
        sec.grow(g)
        sec.month_end(m)
        if m % 12 == 0:
            snaps.append({'m': m, 'B': sec.value(), 'in': sec.invested, 'fees': sum(sec.fees.values()),
                          'tax_during': 0.0, 'real_B': sec.value() / path.I(m)})
    out = sec.liquidate(60, rate=0.0)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | An IRA is a provident fund in personal management; an IRA hishtalmut follows hishtalmut tax rules | {L("TXK-16", "TXK-17")} | — |\n'
        f'| 2 | Two fee layers: manager balance fee 0.3% (cap 2%) plus the bank tariff inside the account | {L("IRA-17", "PF-06", "IRA-21")} | — |\n'
        f'| 3 | Holding the S14 ETF: δ = 1.1085%, half-spread 0.05%; buy and sell 0.1% min 15; custody 0.05% a quarter (no minimum given, Q21) | {L("ETF-13", "BRK-16")} | — |\n'
        f'| 4 | r_g 6%, π 2.5% taken from S14 (not restated in S33, Q19) | — | — |\n'
        f'| 5 | No tax inside; exit after the 6-year clock: exempt (balance assumed all benefited, Q19) | {L("TXK-17", "TXH-09")} | 0 |\n\n'
        + year_table(snaps)
    )
    section('S33', 'IRA hishtalmut with brokerage inside', 'computed', body,
            f'Real V_T/I_T = {f2(out["real_V"])}; nominal V_T = {f2(out["V"])}; fees: {fees_line(sec, out)}; tax 0 (exempt). Subject to Q19, Q21.')


# --------------------------------------------------------------------------
# Part C
# --------------------------------------------------------------------------

def s34_s35_s36_s38():
    path = Path(0.025)
    sec, snaps, out, _ = run_etf(60, 300000.0, 0.0, 0.06, 0.025)
    Y = 60000.0
    r = max(0.0, out['real_gain'])
    ts = slice_tax_capped(Y, r, 0.25)
    w = 0.25 * r
    V = out['V'] + out['tax'] - ts
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Ledger as S14 with 300,000 now, no monthly | as S14 | real gain {f2(r)} |\n'
        f'| 2 | Person reaches 60 in the exit tax year: the 10/14/20/31% brackets apply to all taxable income | {L("TXG-04", "TXS-23")} | — |\n'
        f'| 3 | Real capital gain is taxed at a maximum rate of 25% as the top slice; lower brackets apply first | {L("TXG-07", "TXG-08", "TXS-01")} | — |\n'
        f'| 4 | Tax = Σ over the slice from Y = 60,000 to Y + real of min(bracket rate, 25%) | {L("TXG-07")} | {f2(ts)} |\n'
        f'| 5 | Bank withholds 25% regardless; difference refunded through a return or form 0135 (A-14 on) | {L("TXS-23", "TXS-05", "TXG-25")} | withheld {f2(w)}, refund {f2(w - ts)} |\n'
        f'| 6 | Credit points against special-rate income are open; not applied | {L("TXG-05")} (TXG OQ6) | — |\n'
    )
    section('S34', 'Exit at age 60 with low other income', 'computed', body,
            f'Real gain {f2(r)}; tax at the brackets {f2(ts)} (capped at 25% slice by slice, method F-42); 25% withheld {f2(w)}; refund {f2(w - ts)}; V_T after refund {f2(V)}, real {f2(V / path.I(60))}; fees: {fees_line(sec, out)}. Subject to Q2 (exit year = year 5, age 60 reached in it).')

    r35 = bond_run(60, 300000.0, 0.0375, path, False, 0.15)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Ledger as S08 with 300,000 for 60 months, π 2.5% | as S08 | — |\n'
        f'| 2 | Coupons: 15% on unlinked interest is a fixed rate, not reduced at 60 (statute wording "of 15%"; the guide\'s maximum-rate list omits these fields) | {L("TXI-03", "TXG-07", "TXG-08", "TXI-19")} (TXI OQ9) | tax during {f2(r35["tax_during"])} |\n'
        f'| 3 | Capital gain at sale: at par, so ≤ 0 after exit-year custody; no tax. (The rate for unlinked bond gains is worded "not exceeding 15%" — whether 60+ brackets reduce it is open, TXG OQ10 — no effect here) | {L("TXI-12", "TXS-03")} | {f2(r35["real_gain"])} |\n'
    )
    section('S35', 'Exit at 60 holding an unlinked bond (fixed 15% unchanged)', 'computed', body,
            f'Real V_T/I_T = {f2(r35["real_V"])}; nominal V_T = {f2(r35["V"])}; fees: trade {f2(r35["fees"]["trade"])}, custody {f2(r35["fees"]["custody"])}; tax during {f2(r35["tax_during"])} (15% fixed on coupons, unchanged at 60); tax at exit 0 (gain {f2(r35["real_gain"])}). Subject to D4, D12, Q2.')

    p36 = Path(0.02)
    s36, _, o36, _ = run_etf(36, 2000000.0, 0.0, 0.08, 0.02)

    def surtax(Y, real):
        a = 0.03 * max(0.0, Y + real - 721560) - 0.03 * max(0.0, Y - 721560)
        b = 0.02 * max(0.0, real - 721560)
        return a, b
    a3, b2 = surtax(600000.0, max(0.0, o36['real_gain']))
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Ledger as S14 with 2,000,000 now, r_g 8%, π 2%, 36 months | as S14 | real gain {f2(o36["real_gain"])} |\n'
        f'| 2 | Capital-gains tax 25% of real gain (under 60) | {L("TXS-13", "TXS-09")} | {f2(o36["tax"])} |\n'
        f'| 3 | Surtax 3% on taxable income above 721,560; taxable income excludes the inflationary amount: Z = 600,000 + real gain | {L("TXG-09")} | {f2(a3)} |\n'
        f'| 4 | Extra 2% on capital-source income above 721,560, tested on capital income alone (real gain {f2(o36["real_gain"])} < 721,560) | {L("TXG-10")} | {f2(b2)} |\n'
        f'| 5 | Settled through the annual return | {L("TXG-11")} | — |\n'
    )
    V36 = o36['V'] - a3 - b2
    section('S36', 'Surtax year', 'computed', body,
            f'Real gain {f2(o36["real_gain"])}; capital-gains tax {f2(o36["tax"])}; surtax 3% {f2(a3)} on {f2(600000 + o36["real_gain"] - 721560)} above 721,560; 2% capital-source surtax {f2(b2)} (capital income below the threshold); V_T {f2(V36)}, real {f2(V36 / p36.I(36))}; fees: {fees_line(s36, o36)}.')

    # S38 switching
    def run_switch(switch):
        p = Path(0.025)
        sec = etf_sec(p)
        sec.buy(100000.0, 0)
        g = mrate(0.06)
        tax_switch = 0.0
        for m in range(1, 73):
            sec.grow(g)
            sec.month_end(m)
            if switch and m == 36:
                o = sec.liquidate(36)
                tax_switch = o['tax']
                sec = etf_sec(p)
                sec.buy(o['V'], 36, outlay=False)
        o = sec.liquidate(72)
        return o, tax_switch, sec
    o_ns, _, _ = run_switch(False)
    o_s, tsw, _ = run_switch(True)
    pk = Path(0.025)
    sk = kgl_schedule(72, 83641.0, 0.0, pk)
    rk = run_provident(72, sk, 0.06, pk, direct=0.0010, balfee=lambda m: 0.008)
    ek = kgl_exit(rk, pk, 72)
    cost_r = o_ns['real_V'] - o_s['real_V']
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | (a) Moving from fund A to fund B is a sale: tax on A\'s real gain at month 36 (year-3 custody deducted), commission and spread out, net proceeds buy B (same fees as S14) | {L("TXS-21", "TXS-09", "TXS-06", "BRK-16")} | tax at switch {f2(tsw)} |\n'
        f'| 2 | Cost of switching = V_T(no switch) − V_T(switch), real | method F-66 (output definition) | {f2(cost_r)} |\n'
        f'| 3 | (b) A track switch inside a kupat gemel lehashkaa is not a withdrawal and not taxed; no fee in the regulation; a fee rise is permitted but not automatic | {L("TXK-04", "PF-23", "PF-14")} | cost 0 |\n'
        f'| 4 | (b) 100,000 now exceeds the 83,641 annual ceiling: only 83,641 is accepted and 16,359 routed (D12) — the switching cost is 0 either way | {L("KGL-02", "KGL-03")} | note (Q23) |\n'
    )
    section('S38', 'Brokerage switch versus provident track switch', 'computed', body,
            f'(a) Brokerage: real V_T without switch {f2(o_ns["real_V"])}, with switch {f2(o_s["real_V"])}; cost of switching {f2(cost_r)} real (tax paid at the switch {f2(tsw)}). (b) Kupat gemel lehashkaa: cost of switching 0 (TXK-04); note the ceiling accepts only 83,641 of the 100,000 now (Q23); with 83,641 the real value (25% real) is {f2(ek["realV25"])} either way.')
    return out


# --------------------------------------------------------------------------
# Part D
# --------------------------------------------------------------------------

def s39_s48():
    T = 240
    sec, snaps, out, path = run_etf(T, 30000.0, 2000.0, 0.06, 0.025)
    sched = kgl_schedule(T, 30000.0, 2000.0, path)
    rk = run_provident(T, sched, 0.06, path, direct=0.0010, balfee=lambda m: 0.008)
    ek = kgl_exit(rk, path, T)
    ceil = ceiling_check(sched, T)
    max_year = max(v for v, _ in ceil.values())
    sec30, _, out30, _ = run_etf(T, 30000.0, 2000.0, 0.06, 0.025, rate=0.30)
    # F-80 deciding formula: fee drag and tax at exit of each, real
    _, _, out0, _ = run_etf(T, 30000.0, 2000.0, 0.06, 0.025, delta=0.0, spread=0.0, comm=None, custody=None)
    rk0 = run_provident(T, sched, 0.06, path)
    ek0 = kgl_exit(rk0, path, T)
    IT = path.I(T)
    drag_b = out0['real_V'] - out['real_V']
    drag_k = ek0['realV25'] - ek['realV25']
    tax_b = out['tax'] / IT
    tax_k = ek['tax25real'] / IT
    factors = {'fee drag': drag_b - drag_k, 'tax at exit': tax_b - tax_k}
    decider = max(factors, key=lambda k: abs(factors[k]))

    # F-81 sensitivity within P-02 bounds
    sens_rows, sens_text = [], 'P-02 not set'
    bounds = load_parameter_file('sensitivity-bounds')
    if bounds:
        b = bounds['bounds']

        def values(r=0.06, pi=0.025, years=20, m=None):
            m = m or {}
            TT = int(12 * years)
            _, _, ob, pp = run_etf(TT, 30000.0, 2000.0, r, pi, delta=0.011085 * m.get('etf fund fee', 1),
                                   comm={'pct': 0.003 * m.get('trade commission', 1), 'min': 25.0},
                                   custody={'pct': 0.0015 * m.get('custody', 1), 'min': 15.0})
            sk = kgl_schedule(TT, 30000.0, 2000.0, pp)
            rkk = run_provident(TT, sk, r, pp, direct=0.0010 * m.get('kgl direct expenses', 1),
                                balfee=lambda mm: 0.008 * m.get('kgl balance fee', 1))
            return kgl_exit(rkk, pp, TT)['realV25'], ob['real_V']

        def top(v):
            return 'kupat gemel lehashkaa' if v[0] >= v[1] else 'brokerage'
        base_top = top((ek['realV25'], out['real_V']))
        tests = [('yearly return', 'r', 0.06, b['A-01']['lo']['value'] / 100, b['A-01']['hi']['value'] / 100),
                 ('inflation', 'pi', 0.025, b['A-02']['lo']['value'] / 100, b['A-02']['hi']['value'] / 100),
                 ('horizon (years)', 'years', 20, 20 + b['horizon']['lo']['value'], 20 + b['horizon']['hi']['value'])]
        for fee in ('etf fund fee', 'custody', 'trade commission', 'kgl balance fee', 'kgl direct expenses'):
            tests.append((fee + ' (× rate)', fee, 1.0, b['fee_rates']['lo']['value'], b['fee_rates']['hi']['value']))

        def run_at(key, x):
            if key in ('r', 'pi', 'years'):
                return values(**{key: x})
            return values(m={key: x})
        for label, key, base, lo, hi in tests:
            res = []
            for bound in (lo, hi):
                v = run_at(key, bound)
                if top(v) == base_top:
                    res.append(f'no flip at {bound:g}')
                else:
                    a_, z_ = base, bound
                    for _ in range(14):
                        mid = (a_ + z_) / 2
                        if top(run_at(key, mid)) == base_top:
                            a_ = mid
                        else:
                            z_ = mid
                    res.append(f'flips at about {z_:.4g}')
            sens_rows.append([label, f'{base:g}', '; '.join(res)])
        flips = [r_ for r_ in sens_rows if 'flips' in r_[2]]
        sens_text = ('no change flips the result within the bounds' if not flips else
                     'flips: ' + '; '.join(f'{r_[0]} {r_[2]}' for r_ in flips))
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Brokerage with the S14 ETF, 30,000 now + 2,000 × I_m, 240 months | as S14 | real V_T {f2(out["real_V"])} |\n'
        f'| 2 | Kupat gemel lehashkaa with S20 fees; ceiling check (largest calendar year {f2(max_year)} ≤ 83,641) | as S20; {L("KGL-02")} | real V_T {f2(ek["realV25"])} (25% real) / {f2(ek["realV15"])} (15% nominal) |\n'
        f'| 3 | Hishtalmut: the person is an employee, so under product D15 it is listed, not ranked: "only funded through your employer; you already deposit the tax-free maximum" | {L("TXH-08", "KH-02")}; product D15 | listed |\n'
        f'| 4 | Pension extra deposit: existing 6% × 144,000 = 8,640 > cap 8,148 → no credit on new money; exit blocked (G-03) and locked to 60: listed, not ranked | {L("TXP-02", "TXP-14")} | listed |\n'
        f'| 5 | Tie test between the two ranked rows with θ = {THETA}% (P-01) | method F-80 | {tie_text(ek["realV25"], out["real_V"])} |\n'
        f'| 6 | Deciding formula: the larger of the gaps in fee drag (V without fees − V) and in tax at exit, brokerage minus kupat gemel lehashkaa, real | method F-80 | fee drag gap {f2(factors["fee drag"])}; tax gap {f2(factors["tax at exit"])} → {decider} |\n'
        f'| 7 | Sensitivity: move each guess to the P-02 bounds (bisection if the winner changes) | method F-81; {param_src("sensitivity-bounds")} | {sens_text} |\n\n'
        + table(['Guess', 'Base', 'At the bounds'], sens_rows) + '\n'
    )
    section('S39', "Wrapper mode: the founder's ETF-vs-provident case", 'computed', body,
            f'Computed: brokerage (S14 ETF) real V_T/I_T = {f2(out["real_V"])}, nominal {f2(out["V"])}; kupat gemel lehashkaa (S20 fees) real {f2(ek["realV25"])} with 25% real (label "secondary source"), {f2(ek["realV15"])} with 15% nominal. Pension: listed, not ranked (locked, G-03; no credit on new money since 6% × 144,000 > 8,148). Ranking: 1. kupat gemel lehashkaa, 2. brokerage; {tie_text(ek["realV25"], out["real_V"])}. Deciding formula: {decider} (the brokerage pays {f2(drag_b)} in fees against {f2(drag_k)}, real; tax at exit {f2(tax_b)} against {f2(tax_k)}). Hishtalmut: listed, not ranked (employee, product D15). Sensitivity (P-02 bounds): {sens_text}.')
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Re-run S39 brokerage with the TXS-09 rate set to 30% (test only) | {L("TXS-09")} | real V_T {f2(out30["real_V"])} |\n'
        '| 2 | The changed entry is TXS-09; the brokerage value falls by the extra 5% of the real gain | method F-82 | — |\n'
        f'| 3 | Ranking status: the kupat gemel lehashkaa still ranks first; its exit tax comes from TXK-07, not TXS-09, so only the brokerage moves | method F-82 | {tie_text(ek["realV25"], out30["real_V"])} |\n'
    )
    section('S48', 'Revisit after a rule change', 'computed', body,
            f'Changed entry: TXS-09 rate 25% → 30%. Brokerage real V_T/I_T falls from {f2(out["real_V"])} to {f2(out30["real_V"])} (nominal {f2(out["V"])} → {f2(out30["V"])}). Ranking unchanged: the kupat gemel lehashkaa stays first ({tie_text(ek["realV25"], out30["real_V"])}).')


def s42():
    path = Path(0.025)
    T = 120

    def run(bal, direct):
        s = defaultdict(list)
        s[1].append((120000.0, 0))
        for m in range(1, T + 1):
            s[m].append((1200.0, m))
        r = run_provident(T, s, 0.06, path, direct=direct, balfee=lambda m: bal)
        return r['B'] / path.I(T), r
    vF, rF = run(0.0074, 0.0011)
    v0, _ = run(0.0, 0.0)
    vNoBal, _ = run(0.0, 0.0011)
    vNoDir, _ = run(0.0074, 0.0)
    vRed, _ = run(0.0034, 0.0011)
    total = v0 - vF
    c_bal = vNoBal - vF
    c_dir = vNoDir - vF
    rem = total - c_bal - c_dir
    red = vRed - vF
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Holding: 120,000 existing + 300 own + 900 employer a month (constant nominal, as S23), r_g 6%, π 2.5%, 120 months; exempt at exit (past 6 years) | {L("TXH-09", "TXH-18")} | — |\n'
        f'| 2 | Balance fee 0.74% (cap 2%); direct expenses 0.11% inside the return | {L("KH-22", "PF-10")} | — |\n'
        f'| 3 | Real values with all fees, none, and each fee removed | method F-61 (output definition) | V(F) {f2(vF)}, V(∅) {f2(v0)} |\n'
        f'| 4 | Regulator reference: Gemel-Net study-fund track averages 0.34–0.74 (units not confirmed) | {L("KH-23")} | reference |\n'
    )
    p03 = load_parameter_file('fee-verdict-thresholds')
    neg = p03['negotiate_nis']['value'] if p03 else None

    def verdict(cost, reference_below):
        if neg is None:
            return 'not set'
        if cost >= neg and reference_below:
            return 'worth negotiating'
        return 'not worth the effort'
    v_bal = verdict(c_bal, True)
    v_dir = verdict(c_dir, False)
    body += (f'| 5 | Verdicts with the P-03 thresholds: negotiate if the cost is at least {f2(neg)} and a lower reference exists (balance fee: Gemel-Net averages go down to 0.34%); direct expenses have no collected reference (G-14) | method F-62; {param_src("fee-verdict-thresholds")} | balance fee: {v_bal}; direct expenses: {v_dir} |\n')
    section('S42', "Fee materiality on the founder's hishtalmut", 'computed', body,
            f'Real V_T/I_T with fees {f2(vF)}; total fee drag {f2(total)}; cost of balance fee 0.74% = {f2(c_bal)}; cost of direct expenses 0.11% = {f2(c_dir)}; interaction remainder {f2(rem)}; value of cutting the balance fee to 0.34% = {f2(red)} (all real NIS over 10 years). Verdicts (P-03): balance fee "{v_bal}" (reference 0.34%, KH-23); direct expenses "{v_dir}" (no reference collected). Subject to Q20.')


def s43():
    T = 60

    def run(trade=True, custody=True, spread=True, fund=True, fx=True):
        path = Path(0.025, 0.01)
        sec = Sec(path, index='X', delta=0.0003 if fund else 0.0, spread=0.0002 if spread else 0.0,
                  comm={'pct': 0.003, 'min': 25.0} if trade else None,
                  custody={'pct': 0.0015, 'min': 0.0} if custody else None, fx=0.0025 if fx else 0.0)
        sched = contrib_schedule(T, 100000.0, 2000.0, path, True)
        g_nis = (1.06 * 1.01) ** (1 / 12) - 1
        run_sec2(sec, T, sched, g_nis, dist=(0.013, 0.25))
        o = sec.liquidate(T)
        return o['real_V'], sec, o
    vF, sF, oF = run()
    v0, _, _ = run(False, False, False, False, False)
    costs = {}
    for k in ('trade', 'custody', 'spread', 'fund', 'fx'):
        kw = {k: False}
        v, _, _ = run(**kw)
        costs[k] = v - vF
    total = v0 - vF
    rem = total - sum(costs.values())
    ranked = sorted(costs.items(), key=lambda kv: -kv[1])
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | US-domiciled distributing ETF bought through an Israeli bank: USD return 6% with the shekel weakening 1% a year → NIS return (1.06 × 1.01) − 1 | method A-01, A-03 | — |\n'
        f'| 2 | Distributions 1.3% a year, paid quarterly (IVV pays quarterly); US 25% withheld with W-8BEN; Israel 25% with credit → nothing extra (final, A-14) | {L("ETF-30", "TXF-12", "TXF-08", "TXF-17", "TXF-18", "TXF-10")} (TXF OQ3 on what the bank withholds) | — |\n'
        f'| 3 | Fee lines: trade 0.3% min 25; custody 0.15% a quarter; FX 0.25% each way; fund 0.03%; half-spread 0.02% | {L("BRK-16", "BRK-23", "ETF-30")} | — |\n'
        f'| 4 | Exit: real gain against the exchange rate, 25% | {L("TXF-03", "TXF-02")} | tax {f2(oF["tax"])} |\n'
        f'| 5 | Cost of each fee = V(F without f) − V(F), real | method F-61 | see result |\n'
    )
    section('S43', 'Fee materiality on a brokerage plan', 'computed', body,
            'Ranked real fee costs over 5 years: ' + '; '.join(f'{k} {f2(v)}' for k, v in ranked) +
            f'; interaction remainder {f2(rem)}; total drag {f2(total)}; real V_T with all fees {f2(vF)}. Subject to Q15.')


def s44_s45():
    T = 60
    providers = {
        'A list': dict(comm={'pct': 0.003, 'min': 25.0}, custody={'pct': 0.0015, 'min': 15.0}, fixed=0.0),
        'A average': dict(comm={'pct': 0.0021, 'min': 0.0}, custody={'pct': 0.0015, 'min': 15.0}, fixed=0.0),
        'B list': dict(comm={'pct': 0.0025, 'min': 30.0}, custody={'pct': 0.0012, 'min': 20.0}, fixed=0.0),
        'B average': dict(comm={'pct': 0.0019, 'min': 0.0}, custody={'pct': 0.0012, 'min': 20.0}, fixed=0.0),
        'C list': dict(comm={'pct': 0.0008, 'min': 8.0}, custody=None, fixed=15.0),
        'C average': dict(comm={'pct': 0.0007, 'min': 0.0}, custody=None, fixed=15.0),
        'A entered (S45)': dict(comm={'pct': 0.001, 'min': 10.0}, custody={'pct': 0.0015, 'min': 15.0}, fixed=0.0),
    }

    def run(p, orders, horizon=T, drop=None):
        path = Path(0.025)
        comm = None if drop == 'trade' else p['comm']
        cust = None if drop == 'custody' else p['custody']
        fixed = 0.0 if drop == 'fixed' else p['fixed']
        sec = Sec(path, delta=0.011085, spread=0.0005, comm=comm, custody=cust, fixed_month=fixed)
        sched = defaultdict(list)
        sched[1].append((10000.0, 0))
        for m in range(1, horizon + 1):
            for _ in range(orders):
                sched[m].append((2000.0 * path.I(m) / orders, m))
        run_sec2(sec, horizon, sched, mrate(0.06))
        o = sec.liquidate(horizon)
        fees_y1 = None
        return o, sec

    out = {}
    for orders in (1, 10):
        empty_T, _ = run(dict(comm=None, custody=None, fixed=0.0), orders)
        empty_12, _ = run(dict(comm=None, custody=None, fixed=0.0), orders, horizon=12)
        rows = []
        for name, p in providers.items():
            oT, sT = run(p, orders)
            o12, s12 = run(p, orders, horizon=12)
            per_type = {}
            for k in ('trade', 'custody', 'fixed'):
                oo, _ = run(p, orders, drop=k)
                per_type[k] = oo['real_V'] - oT['real_V']
            rows.append((name, empty_T['real_V'] - oT['real_V'], empty_12['V'] - o12['V'],
                         s12.fees['trade'] + s12.fees['custody'] + s12.fees['fixed'] + o12['exit_commission'], per_type))
        out[orders] = (rows, empty_T['real_V'])
    texts = []
    tables = []
    names = {'trade': 'trade commission', 'custody': 'custody', 'fixed': 'monthly account fee'}
    for orders, (rows, v0) in out.items():
        tables.append(f'\n\n{orders} order(s) a month:\n\n' + table(
            ['Provider and level', 'Horizon cost (real)', 'Year-1 cost (liquidation value at 12, nominal)', 'Year-1 fees paid incl. exit commission', 'trade / custody / account (real, horizon)'],
            [[r[0], f2(r[1]), f2(r[2]), f2(r[3]), ' / '.join(f2(r[4][k]) for k in ('trade', 'custody', 'fixed'))] for r in sorted(rows, key=lambda r: r[1])]))
        parts = []
        for level in ('list', 'average'):
            rk = sorted([r for r in rows if r[0].endswith(level)], key=lambda r: r[1])
            top, second = rk[0], rk[1]
            gaps = {k: second[4][k] - top[4][k] for k in ('trade', 'custody', 'fixed')}
            decider = max(gaps, key=lambda k: abs(gaps[k]))
            parts.append(f'{level} level: ' + ', '.join(f'{r[0].split()[0]} {f2(r[1])} (year 1: {f2(r[2])})' for r in rk)
                         + f'; deciding fee type between {top[0].split()[0]} and {second[0].split()[0]}: {names[decider]} '
                         f'(gap {f2(second[1] - top[1])} by type: ' + ', '.join(f'{names[k]} {gaps[k]:+,.2f}' for k in ('trade', 'custody', 'fixed')) + ')'
                         + f'; {tie_text(v0 - top[1], v0 - second[1])}')
        texts.append(f'{orders} order(s)/month — ' + '; '.join(parts))
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 1 | Instrument and market as S14 (r_g 6%, π 2.5%, δ 1.1085%, half-spread 0.05%); 10,000 now + 2,000 × I_m | as S14 | — |\n'
        f'| 2 | Three fee levels: list, regulator average, entered | product D4; {L("BRK-33", "BRK-26")} | averages used as % with no minimum (Q16) |\n'
        f'| 3 | Custody per tariff on market value; broker C monthly fee 15 (deductible as a management fee, Q16) | {L("BRK-16", "BRK-24", "TXS-06")} | — |\n'
        f'| 4 | Horizon cost = V_T(∅) − V_T(F_p), real; ∅ = no provider fees, fund costs and spread kept (Q16) | method F-63 | see tables |\n'
        '| 5 | Broker D: tariff missing → row "not comparable, data missing" | product 3.4 | — |\n'
        f'| 6 | Tie between the top two at each level: |V1 − V2| / max < θ, θ = {THETA}% (site parameter P-01) | method F-80; data/parameters/tie-threshold.json | see result |\n'
        + ''.join(tables)
    )
    section('S44', 'Provider workbench, 1 trade vs 10 trades a month', 'computed', body,
            'Horizon cost = real V_T(no provider fees) − real V_T(provider), cheapest first. ' + ' | '.join(texts) + '. Broker D: "not comparable, data missing". Subject to Q16.')
    a1 = [r for r in out[1][0] if r[0] == 'A entered (S45)'][0]
    a10 = [r for r in out[10][0] if r[0] == 'A entered (S45)'][0]
    section('S45', 'Provider with "entered by you" fee', 'computed', 'See S44 tables, row "A entered (S45)".',
            f'Bank A with entered 0.1% min 10: horizon real cost {f2(a1[1])} (1 order/month), {f2(a10[1])} (10 orders/month); year-1 liquidation-value cost {f2(a1[2])} / {f2(a10[2])}; label "entered by you". Subject to Q16.')


# --------------------------------------------------------------------------
# Filled-in examples. The founder approved on 2026-10-23 filling each missing
# test input from the neighbouring examples; every filled value is labelled.
# --------------------------------------------------------------------------

USD_ILS_0 = 3.107   # BoI representative rate, 2026-10-22 (EDGE EXR RER_USD_ILS)
USD_ILS_SRC = 'https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS?format=csv&lastNObservations=3&labels=name'
IVV_NAV = 776.56    # USD, iShares IVV page, NAV as of 2026-10-21
IVV_SRC = 'https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf'


def filled(text):
    return f'**filled in:** {text}'


def foreign_broker_etf(w_foreign, delta, T=60):
    """US or Irish distributing ETF at a foreign broker: USD 2.5 a trade, FX 0.2% each way."""
    path = Path(0.025, 0.01)
    sec = Sec(path, index='X', delta=delta, spread=0.0, comm=None, custody=None, fx=0.002)
    sched = contrib_schedule(T, 100000.0, 2000.0, path, True)
    g_nis = (1.06 * 1.01) ** (1 / 12) - 1
    estate_month = None
    max_shares = 0.0
    for m in range(1, T + 1):
        sec.comm = {'pct': 0.0, 'min': 2.5 * USD_ILS_0 * path.X(m)}
        for cash, jm in sched.get(m, []):
            sec.buy(cash, jm)
        sec.grow(g_nis)
        if m % 3 == 0:
            sec.distribute(m, 0.013 / 4, w_foreign)
        usd = sec.value() / (USD_ILS_0 * path.X(m))
        if estate_month is None and usd > 60000:
            estate_month = m
        max_shares = max(max_shares, sec.units() / (USD_ILS_0 * IVV_NAV))
    sec.comm = {'pct': 0.0, 'min': 2.5 * USD_ILS_0 * path.X(T)}
    out = sec.liquidate(T)
    return sec, out, path, estate_month, max_shares


def s17_s18_s19():
    rows = {}
    for sid, w, delta in (('S17', 0.25, 0.0003), ('S18', 0.30, 0.0003), ('S19', 0.0, 0.0007 + 0.0023)):
        rows[sid] = foreign_broker_etf(w, delta)
    fill = filled(f'start rate {USD_ILS_0} NIS per USD (Bank of Israel representative rate, 22 Oct 2026, [EDGE](<{USD_ILS_SRC}>)); '
                  f'share price USD {IVV_NAV} ([iShares IVV, NAV 21 Oct 2026](<{IVV_SRC}>)); distributions quarterly (ETF-30); no half-spread given (0)')
    common = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {fill} |\n'
        f'| 1 | Return 6% in USD; shekel weakens 1% a year → NIS return (1.06 × 1.01) − 1 | method A-01, A-03 | — |\n'
        f'| 2 | Each contribution converted at 0.2% and bought with one order; commission USD 2.5 a trade while an order is under 250 shares (it always is here: at most {{shares}} shares) | {L("BRK-36", "BRK-23")} | — |\n'
        f'| 3 | Distributions 1.3% a year, quarterly; foreign withholding credited up to the Israeli 25%; at a foreign broker the Israeli part is paid by advance (timing ignored) | {L("TXF-08", "TXF-17", "TXF-18", "TXF-21")} | — |\n'
        f'| 4 | Exit: sell, commission USD 2.5, convert at 0.2%; 25% of the real gain against the exchange rate, by advance | {L("TXF-03", "TXF-02", "TXF-22")} | — |\n')
    for sid, title, extra, wtext in (
            ('S17', 'US-domiciled distributing ETF at a foreign broker, with W-8BEN', f'| 5 | US withholding 25% with W-8BEN; Israel 25% fully credited → nothing more | {L("TXF-12", "TXF-13")} | — |\n', 'US 25% withheld, nothing more in Israel'),
            ('S18', 'Same ETF without a W-8BEN', f'| 5 | Without W-8BEN the US withholds 30%; credit capped at the Israeli 25%, so 5% is lost | {L("TXF-13", "TXF-18")} | — |\n', 'US 30% withheld; the extra 5% is lost'),
            ('S19', 'Irish distributing ETF at a foreign broker', f'| 5 | Irish fund: expense 0.07% + fund-level US withholding 0.23%; Irish withholding on its distributions open, 0 used; Israel 25% on distributions | {L("TXF-16")} (TXF OQ6) | flag G-05 |\n', 'Irish withholding 0 (open, flagged); Israel 25% by advance')):
        sec, out, path, est, shares = rows[sid]
        body = common.replace('{shares}', f'{shares:.0f}') + extra + (
            f'\nResult: V_T = {f2(out["V"])}; real {f2(out["real_V"])}; foreign tax on distributions {f2(sec.foreign_tax)}, Israeli tax on distributions {f2(sec.tax_during)}; tax at exit {f2(out["tax"])} (real gain {f2(out["real_gain"])}).')
        flag = (f'flag "US estate tax exposure above USD 60,000 (TXF-27)" from month {est}' if sid != 'S19' and est else
                ('no US estate exposure: an Irish fund is not US-situs (TXF-27)' if sid == 'S19' else 'below USD 60,000 throughout'))
        section(sid, title, 'computed', body,
                f'Real V_T/I_T = {f2(out["real_V"])}; nominal V_T = {f2(out["V"])}; fees: {fees_line(sec, out)}; tax during: {wtext} (foreign {f2(sec.foreign_tax)}, Israeli {f2(sec.tax_during)}); tax at exit {f2(out["tax"])}; {flag}; timing note: advances by 30 April ignored. Filled in: start rate {USD_ILS_0} NIS/USD (BoI, 22 Oct 2026), share price USD {IVV_NAV} (iShares, 21 Oct 2026).')


def s26_fill():
    path = Path(0.025)
    tau26 = marginal_rate(200000 - 9000)
    ded = min(20566.0, 0.045 * min(200000.0, 293397.0))
    benefit = bracket_tax(200000) - bracket_tax(200000 - ded)
    res = {}
    for label, T, deposit_months in (('horizon (month 72)', 72, range(12, 73, 12)),
                                     ('first lawful exit (month 84), deposits stopped at month 72 (product D16)', 84, range(12, 73, 12))):
        s = defaultdict(list)
        for m in deposit_months:
            s[m].append((20566.0, m))
        r = run_provident(T, s, 0.06, path, direct=0.0011, balfee=lambda m: 0.006)
        res[label] = (r['B'], r['B'] / path.I(T))
    rows = [[k, f2(v[0]), f2(v[1])] for k, v in res.items()]
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("r_g 6%, π 2.5%, balance fee 0.6%, direct expenses 0.11% (as the employee study-fund example)")} |\n'
        f'| 1 | Deduction up to 4.5% of income (capped at 293,397): 9,000, worth its marginal tax (200,000 → 191,000, all in the 20% band) | {L("TXH-05", "TXG-02")} | {f2(benefit)} a year |\n'
        f'| 2 | All 20,566 is benefited; gains exempt after 6 years | {L("TXH-08", "TXH-09")} | — |\n'
        f'| 3 | First payment in December of year 1 → 6 years ends at month 84, after the 72-month horizon: locked at the horizon, listed with its value at month 84 | {L("TXH-09", "KH-11")} | — |\n\n'
        + table(['Point', 'Balance (nominal)', 'Real'], rows)
    )
    a, b_ = list(res.values())
    section('S26', 'Self-employed keren hishtalmut', 'computed', body,
            f'Deduction {f2(ded)} a year worth {f2(benefit)} at τ_m = {pct(tau26, 0)}; net outlay {f2(20566 - benefit)} a year for 20,566 deposited. Balance at the 72-month horizon {f2(a[0])} (real {f2(a[1])}), locked until month 84 (6 years from the first payment date); value at month 84, exempt, with deposits stopped at the horizon (product D16): {f2(b_[0])} (real {f2(b_[1])}); listed, not ranked. Filled in: r_g 6%, π 2.5%, fees as the employee study-fund example.')


def s28_s29_fill():
    path = Path(0.02)
    s_own = defaultdict(list)
    s_emp = defaultdict(list)
    for m in range(1, 121):
        s_own[m].append((1000.0 * path.I(m), m))
        s_emp[m].append((0.125 * 15000.0, m))
    own = run_provident(120, s_own, 0.05, path, balfee=lambda m: 0.0022, depfee=0.01, ins=0.015)
    emp = run_provident(120, s_emp, 0.05, path, balfee=lambda m: 0.0022, depfee=0.01, ins=0.015)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("age 30, r_g 5%, π 2%, selected fund 1% of deposits + 0.22% of balance, insurance 1.5% of deposits, employer 6.5% + 6% severance (as the 300 NIS pension example)")} |\n'
        f'| 1 | Existing 6% × 180,000 = 10,800 already exceeds the 8,148 cap → no credit on new money; gross = net = 1,000 × I_m | {L("TXP-02")} | — |\n'
        f'| 2 | Fees and insurance as the pension example | {L("PEN-23", "PEN-15")} | — |\n'
        f'| 3 | Locked until 60 and the annuity exit is blocked: listed with its gross balance at the horizon | {L("TXP-14")} (PEN OQ7) | G-03 |\n'
    )
    section('S28', 'Pension deposit, credit cap binding', 'computed', body,
            f'No part of the extra deposit earns the credit (existing 10,800 > cap 8,148; the text "10,800/year already credited" should read 8,148); gross = net = 1,000 × I_m. Gross balance at the 10-year horizon: {f2(own["B"])} nominal, {f2(own["B"] / path.I(120))} real; fees: deposit {f2(own["fees"]["deposit"])}, insurance {f2(own["fees"]["insurance"])}, balance {f2(own["fees"]["balance"])}; flag "exit: annuity rules, blocked"; listed, locked until 60. Employer line (1,875/month): {f2(emp["B"])} nominal, {f2(emp["B"] / path.I(120))} real. Filled in: age 30, r_g 5%, π 2%, fees, insurance and employer rates as the 300 NIS pension example.')

    inc, dep, thr, cap = 240000.0, 40000.0, 26436.0, 116400.0
    tier1 = min(dep, 0.11 * min(inc, cap))
    base = dep - thr
    ai = min(min(inc, cap), min(inc, 2.5 * cap) - cap)
    tier2 = min(base, 0.07 * ai) + min(0.04 * ai, max(0.0, base - 0.12 * ai))
    ded29 = tier1 + tier2
    rest = dep - ded29
    credited = max(min(rest, 2268.0), min(rest, 0.05 * min(inc, 2 * cap)))
    credit29 = 0.35 * credited
    ded_value = bracket_tax(inc) - bracket_tax(inc - ded29)
    s29 = defaultdict(list)
    for m in range(1, 241):
        s29[m].append((dep / 12.0, m))
    r29 = run_provident(240, s29, 0.05, path, balfee=lambda m: 0.0022, depfee=0.01, ins=0.015)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("r_g 5%, π 2%, fund fees 1% + 0.22%, insurance 1.5% (as the 300 NIS pension example); deposits 40,000/12 a month, constant nominal")} |\n'
        f'| 1 | Deposits 40,000 ≥ 26,436 → beneficiary member | {L("TXP-03")} | yes |\n'
        f'| 2 | First tier: 11% × min(240,000, 116,400) | {L("TXP-06", "TXP-31")} | {f2(tier1)} |\n'
        f'| 3 | Second tier on the base 40,000 − 26,436 with additional income {f2(ai)}: min(base, 7% × AI) + min(4% × AI, base − 12% × AI if positive) | {L("TXP-31")} | {f2(tier2)} |\n'
        f'| 4 | Deduction worth its marginal tax: 240,000 → {f2(inc - ded29)} | {L("TXG-02")} | {f2(ded_value)} |\n'
        f'| 5 | Rest {f2(rest)} to the s.45A(e) credit, cap 5% × min(240,000, 232,800) | {L("TXP-04")} | credited {f2(credited)}, credit {f2(credit29)} |\n'
        f'| 6 | Exit blocked (annuity), listed with the gross balance at the horizon | {L("TXP-14")} (PEN OQ7) | G-03 |\n'
    )
    section('S29', 'Beneficiary member, self-employed', 'computed', body,
            f'Deposit side: deduction {f2(ded29)} (first tier {f2(tier1)}, second tier {f2(tier2)}) worth {f2(ded_value)}; credit 35% × {f2(credited)} = {f2(credit29)}; total relief {f2(ded_value + credit29)} a year, so 40,000 deposited costs {f2(dep - ded_value - credit29)} net. Gross balance at 20 years: {f2(r29["B"])} nominal, {f2(r29["B"] / path.I(240))} real; flag "exit: annuity rules, blocked"; 0.5% credit and age-50 enlargement blocked (G-13). Filled in: r_g 5%, π 2%, fees and insurance as the 300 NIS pension example.')


def s32_fill():
    path = Path(0.02)
    g = mrate(0.03)
    B = 0.0
    paid = 0.0
    grants = 0.0
    for m in range(1, 253):
        if m <= 216:
            k = (m - 1) // 12 + 1
            amt = 2 * 58.0 * path.I(12 * (k - 1))
            B += amt
            paid += amt
        B *= (1.0 + g)
        if m in (36, 156, 252):
            ga = (582.0 if m == 252 else 291.0) * path.I(m)
            B += ga
            grants += ga
        if m == 216:
            b18, int18 = B, B - paid - grants
    int21 = B - paid - grants
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("3% kept after 18 (same rate)")} |\n'
        f'| 1 | Deposits and grants as the provident child-savings example (boy; grant at 13 = month 156; 582 at 21) | {L("CS-03", "CS-04", "CS-13")} | — |\n'
        f'| 2 | Bank track: fixed unlinked 3%, compounded annually-effective | {L("CS-23")} (public rate data stale) | — |\n'
        f'| 3 | Tax at withdrawal on an unlinked bank deposit: 15% of the nominal gain, withheld (secondary source) | {L("TXK-23", "TXK-20")} | — |\n'
    )
    section('S32', 'Child savings, bank route', 'computed', body,
            f'At 18 (boy): {f2(b18)} nominal, {f2(b18 / path.I(216))} real; interest {f2(int18)}; tax if withdrawn {f2(0.15 * int18)}. At 21: {f2(B)} nominal, {f2(B / path.I(252))} real; interest {f2(int21)}; tax if withdrawn {f2(0.15 * int21)} (15% of the nominal gain, label "secondary source"); net {f2(B - 0.15 * int21)}. Flag "rates data stale". Filled in: 3% after 18.')


def s41_fill():
    B = 60000.0
    pi = 0.03
    cc = 0.85 * 0.005
    rows = []
    for name, r in (('one-month deposit, bank average 3.2% ("average paid at this bank last month")', 0.032),
                    ('one-month deposit, own offer 3.6% ("entered by you")', 0.036),
                    ('makam 3.9% (no commission given)', 0.039)):
        rows.append([name, f2(B * ((1 + 0.85 * r) ** (1 / 12) - (1 + cc) ** (1 / 12)))])
    n = (1 + mrate(0.0325) - 0.0018 / 12) ** 12 - 1
    net = n - 0.25 * max(0.0, n - pi)
    rows.append(['daily money-market fund (BoI 3.25%, δ 0.18%), one-year hold', f2(B * ((1 + net) ** (1 / 12) - (1 + cc) ** (1 / 12)))])
    # coverage line (F-83): the current account is the baseline, the three cash options are compared
    cov = [('current account', 'baseline', 'where the money is now (F-60)')]
    cov += [(c, 'compared', 'F-60') for c in ('bank deposit, one month', 'makam', 'daily money-market fund')]
    cs = 'takes the NII amounts and the parent\'s matching deposit only (method section 8; CS-02, CS-04, CS-16)'
    cov += [(c, 'not eligible', cs) for c in ('child savings, provident route', 'child savings, bank route')]
    cov += [(c, 'not evaluated', 'not run by the idle-cash preset (G-28); see the full goal comparison') for c in (
        'savings plan', 'renewable money-market fund', 'government bond', 'brokerage account', 'kupat gemel lehashkaa',
        'keren hishtalmut', 'comprehensive pension fund', 'general pension fund', 'provident fund for annuity',
        'IRA in a study fund', 'IRA in a provident fund')]
    cov += [(t, 'not evaluated', 'tier 2, open questions (G-24)') for t in (
        'savings policies', 'executive insurance', 'structured deposits', 'corporate bonds', 'managed and robo portfolios',
        'foreign-currency deposits', 'REITs', 'gold via funds', 'Amendment 190 deposits')]
    L('CS-02', 'CS-04', 'CS-16')
    order = ['baseline', 'compared', 'not eligible', 'not evaluated']
    counts = [(o, sum(1 for c in cov if c[1] == o)) for o in order]
    assert len({c[0] for c in cov}) == len(cov) == sum(n for _, n in counts)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("π 3% (as the daily money-market fund example)")} |\n'
        f'| 1 | Amount considered: 80,000 − 20,000 that must stay available = 60,000 | product D13 | 60,000 |\n'
        f'| 2 | Current account 0.5%, 15% withheld; deposits and makam 85% of the rate after tax | {L("TXI-08", "TXI-03", "TXI-11")} | — |\n'
        f'| 3 | Daily money-market fund: one-year return {pct(n, 3)}, tax 25% of the part above inflation → {pct(net, 3)} after tax | {L("MF-34", "TXS-12")} | — |\n'
        f'| 4 | Monthly cost = 60,000 × [(1 + r_alt after tax)^(1/12) − (1 + r_cc after tax)^(1/12)] | method F-60 | see table |\n'
        f'| 5 | Coverage line: every tier-1 wrapper and tier-2 instrument accounted for once; the preset runs only the cash options with a sourced or entered rate | method F-60, F-83, G-28; product D17 | see second table |\n\n'
        + table(['Alternative', 'Monthly cost of leaving 60,000 in the current account'], rows)
        + '\n\n' + table(['Candidate', 'Outcome', 'Reason'], [[c, o, r] for c, o, r in cov])
        + f'\n\nConsidered {len(cov)}: ' + ', '.join(f'{o} {n}' for o, n in counts)
    )
    section('S41', 'Idle-cash preset', 'computed', body,
            'Monthly cost of leaving 60,000 in the current account: ' + '; '.join(f'{r[0]} {r[1]}' for r in rows) +
            '. BoI rate labelled as the source of the fund\'s return (proxy). Coverage line (F-83): considered ' + str(len(cov)) + '; ' + '; '.join(f'{o} {n}' for o, n in counts) +
            '; child savings (both routes) not eligible; savings plan, renewable money-market fund, government bond, brokerage account and the provident wrappers not evaluated (G-28); tier 2 not evaluated (G-24). Filled in: π 3% for the fund row.')


def s46_fill():
    path = Path(0.025)
    T = 180

    def run(bal, amt):
        s = defaultdict(list)
        s[1].append((amt, 0))
        r = run_provident(T, s, 0.06, path, balfee=lambda m: bal)
        return r['B'] / path.I(T)
    a_fee, a0 = run(0.009, 80000.0), run(0.0, 80000.0)
    b_fee, b0 = run(0.006, 40000.0), run(0.0, 40000.0)
    a_moved = run(0.006, 80000.0)
    p04 = load_parameter_file('classification-fit')
    marks = {}
    if p04:
        for row in p04['table']:
            marks[row['classification']] = ('fits' if 15 >= row['horizon_min_years']['value'] and 30 >= row['max_fall_pct']['value'] else 'does not fit')
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("r_g 6%, π 2.5% (as the long-term example); fit table P-04")} |\n'
        f'| 1 | Consolidation: annuity fund to annuity fund is a permitted transfer route; barred only in the reg. 4 cases | {L("PF-17")} | allowed |\n'
        f'| 2 | Fee cost over 15 years, real: V(no fee) − V(fee), gross (exit blocked for annuity funds) | method F-61; {L("PF-02")} | see result |\n'
        f'| 3 | Fit marks from the P-04 table | method F-70; {param_src("classification-fit")} | {marks or "not set"} |\n'
        '| 4 | Child-savings default check | (CS OQ10) | blocked |\n'
    )
    section('S46', 'Holdings review: parental kupot gemel', 'computed', body,
            f'Consolidation: allowed (annuity fund to annuity fund, PF-17); barred only if a loan, attachment or started annuity applies. Fee cost over 15 years (real): 0.9% on 80,000 = {f2(a0 - a_fee)}; 0.6% on 40,000 = {f2(b0 - b_fee)}; moving the 80,000 into the 0.6% fund is worth {f2(a_moved - a_fee)}. Fit marks (P-04 table): "כללי" {marks.get("כללי", "no rule")}, "מניות" {marks.get("מניות", "no rule")}. Child-savings default check blocked (CS OQ10). Filled in: r_g 6%, π 2.5%.')


def s47_fill():
    T = 120
    path = Path(0.02)
    dep = deposit_ladder(T, 10000.0, 500.0, path, True, mrate(0.035))
    sec11, sn11, o11 = mmf_daily(T, 10000.0, 500.0, path, 0.0325, 0.0018)
    sec14, sn14, o14, _ = run_etf(T, 10000.0, 500.0, 0.05, 0.02)
    sched = kgl_schedule(T, 10000.0, 500.0, path)
    r20 = run_provident(T, sched, 0.05, path, direct=0.0010, balfee=lambda m: 0.008)
    e20 = kgl_exit(r20, path, T)
    sp = defaultdict(list)
    sp[1].append((10000.0, 0))
    for m in range(1, T + 1):
        sp[m].append((500.0 * path.I(m) + 331.80 / 12, m))
    rp = run_provident(T, sp, 0.05, path, balfee=lambda m: 0.0022, depfee=0.01, ins=0.015)
    rows = [[i + 1, f2(dep['snaps'][i]['real_B']), f2(sn11[i]['real_B']), f2(sn14[i]['real_B']),
             f2(r20['snaps'][i]['real_B']), f2(rp['snaps'][i]['real_B'])] for i in range(10)]
    body = (
        f'{filled("pension row uses the 300 NIS pension example terms (salary 10,000, existing 6%, credit 331.80 a year, fees and insurance)")}\n\n'
        'Real balance before exit tax at each year end (series); exit values below.\n\n'
        + table(['Year', 'Deposit (3.5%)', 'Daily MMF', 'ETF (r_g 5%)', 'Kupat gemel lehashkaa (r_g 5%)', 'Pension, gross (exit blocked)'], rows)
        + f'\n\nExit at year 10 (real): deposit {f2(dep["real_V"])}; MMF {f2(o11["real_V"])}; ETF {f2(o14["real_V"])}; KGL {f2(e20["realV25"])} (25% real); pension: gross {f2(rp["B"] / path.I(T))}, exit blocked.\n\n'
        f'Rules as in the deposit, money-market, ETF, kupat gemel lehashkaa and pension examples ({L("TXI-03", "TXS-12", "TXS-13", "TXK-07", "TXP-02")}). The study fund is not shown: an employee cannot put this money in (product D15), and the illustration has no self-employed income.'
    )
    section('S47', 'Illustrative timeline for guide pages', 'computed', body,
            f'Real value at year 10 after exit tax: deposit {f2(dep["real_V"])}, daily MMF {f2(o11["real_V"])}, ETF {f2(o14["real_V"])}, kupat gemel lehashkaa {f2(e20["realV25"])}; pension gross {f2(rp["B"] / path.I(T))} (exit blocked); yearly series in workings.md. Study fund not shown (product D15). Filled in: pension terms from the 300 NIS pension example.')


def s49_fill():
    T = 240
    path = Path(0.025)
    sec_c, _, oc = mmf_daily(T, 30000.0, 2000.0, path, 0.0325, 0.0018)
    sec_b, _, ob, _ = run_etf(T, 30000.0, 2000.0, 0.03, 0.025, delta=0.0002, spread=0.0, comm={'pct': 0.001, 'min': 10.0})
    first, second = (('cash', oc), ('bonds', ob)) if oc['real_V'] >= ob['real_V'] else (('bonds', ob), ('cash', oc))
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("cash held as the daily money-market fund example (BoI 3.25%, δ 0.18%); bonds held as the low-fee open tracking fund example (δ 0.02%, 0.1% min 10, custody 0.15%/q min 15) at the entered 3%; goal and π as the long-term example")} |\n'
        '| 1 | Loss filter: equity worst fall 40% > accepted 30% → excluded; bonds 10% ≤ 30% kept; cash has no entered worst fall → kept | method F-71 | — |\n'
        f'| 2 | Rank cash and bonds by real value at 20 years after fees and exit tax | method F-80; {L("TXS-12", "TXS-13")} | see result |\n'
    )
    section('S49', 'Exposure mode with entered returns and the loss filter', 'computed', body,
            f'Equity excluded by the filter (40% > 30%). Ranked: 1. {first[0]} {f2(first[1]["real_V"])}, 2. {second[0]} {f2(second[1]["real_V"])} (real); {tie_text(first[1]["real_V"], second[1]["real_V"])}. Bonds\' 3% labelled "entered by you"; cash labelled with the BoI rate (sourced). Filled in: holding wrappers and fees from the money-market and open tracking fund examples.')


def s50_fill():
    path = Path(0.025)

    def run(pct_):
        sec = Sec(path, delta=0.011085, spread=0.0005, comm={'pct': pct_, 'min': 25.0}, custody={'pct': 0.0015, 'min': 15.0})
        sched = contrib_schedule(60, 10000.0, 2000.0, path, True)
        run_sec2(sec, 60, sched, mrate(0.06))
        return sec.liquidate(60)['real_V']
    va, vb = run(0.003), run(0.0025)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("two brokers built from the broker-comparison example: bank A as listed (0.3% min 25, custody 0.15%/q min 15) and a bank A2 identical except 0.25% commission; 10,000 now + 2,000 a month, 5 years, ETF and market as that example")} |\n'
        f'| 1 | Tie when |V1 − V2| / max < θ (P-01 = {THETA}%) | method F-80 | {tie_text(va, vb)} |\n'
    )
    section('S50', 'Tie', 'computed', body,
            f'Bank A2 {f2(vb)} vs bank A {f2(va)} (real, after fees and tax): {tie_text(va, vb)} → declared tie. Filled in: both providers constructed from the broker-comparison example.')


def makam_ladder(T, sched, y):
    """Each contribution buys the newest 12-month makam; redemptions roll into a new series."""
    spec = {'pct': 0.001, 'min': 20.0}
    p0 = 100.0 / (1.0 + y)
    lots = []  # [face, cost, buy_month]
    fees = taxes = final = 0.0
    carry = defaultdict(float)
    for m in range(1, T + 1):
        orders = [c for c, _ in sched.get(m, [])] + ([carry.pop(m)] if m in carry else [])
        for c in orders:
            v, cm = solve_buy(c, spec)
            fees += cm
            lots.append([v / p0 * 100.0, v, m])
        for lot in [l for l in lots if l[2] + 11 == m]:
            t = 0.15 * (lot[0] - lot[1])
            taxes += t
            lots.remove(lot)
            if m < T:
                carry[m + 1] += lot[0] - t
            else:
                final += lot[0] - t
    for lot in lots:
        remaining = lot[2] + 11 - T
        gross = lot[0] * (1.0 / (1.0 + y) ** (remaining / 12.0))
        cs = comm_of(gross, spec)
        t = 0.15 * max(0.0, gross - lot[1])
        fees += cs
        taxes += t
        final += gross - cs - t
    return final, fees, taxes


def bond_monthly(T, sched, coupon):
    """Each contribution buys the fixed-rate bond at par plus accrued interest; coupons once a year."""
    spec = {'pct': 0.002, 'min': 30.0}
    lots = []  # [face, basis at clean price]
    fees = defaultdict(float)
    deductible = defaultdict(float)
    taxes = final_coupon = 0.0
    carry = 0.0
    for m in range(1, T + 1):
        orders = [c for c, _ in sched.get(m, [])] + ([carry] if carry else [])
        carry = 0.0
        accrued = coupon * ((m - 1) % 12) / 12.0
        for c in orders:
            v, cm = solve_buy(c, spec)
            fees['trade'] += cm
            face = v / (1.0 + accrued)
            lots.append([face, face])
        if m % 12 == 0:
            cp = coupon * sum(l[0] for l in lots)
            t = 0.15 * cp
            taxes += t
            if m < T:
                carry = cp - t
            else:
                final_coupon = cp - t
        if m % 3 == 0:
            fee = max(10.0, 0.001 * sum(l[0] for l in lots))
            fees['custody'] += fee
            deductible[(m - 1) // 12 + 1] += fee
            need = fee
            for lot in lots:
                if need <= 0:
                    break
                u = min(lot[0], need)
                lot[1] -= lot[1] * u / lot[0]
                lot[0] -= u
                need -= u
    gross = sum(l[0] for l in lots)
    c = comm_of(gross, spec)
    fees['trade'] += c
    gain = gross - sum(l[1] for l in lots) - deductible[(T - 1) // 12 + 1]
    t = 0.15 * max(0.0, gain)
    taxes += t
    return gross - c - t + final_coupon, dict(fees), taxes


def s40_fill():
    T = 48
    path = Path(0.025)
    sched = contrib_schedule(T, 100000.0, 4000.0, path, True)
    paid = sum(c for lst in sched.values() for c, _ in lst)
    rows = []
    dep = deposit_ladder(T, 100000.0, 4000.0, path, True, mrate(0.035))
    rows.append(('bank deposits, one-month ladder at 3.5%', dep['V'], f'tax {f2(dep["tax"])}'))
    _, _, o11 = mmf_daily(T, 100000.0, 4000.0, path, 0.0325, 0.0018)
    rows.append(('daily money-market fund (BoI 3.25%, δ 0.18%)', o11['V'], f'exit tax {f2(o11["tax"])}'))
    mk, mk_fees, mk_tax = makam_ladder(T, sched, 0.039)
    rows.append(('makam ladder at 3.9%', mk, f'commissions {f2(mk_fees)}, tax {f2(mk_tax)}'))
    bd, bd_fees, bd_tax = bond_monthly(T, sched, 0.0375)
    rows.append(('fixed-rate government bond, 3.75% coupon', bd, f'trade {f2(bd_fees["trade"])}, custody {f2(bd_fees["custody"])}, tax {f2(bd_tax)}'))
    s14, _, o14, _ = run_etf(T, 100000.0, 4000.0, 0.05, 0.025)
    rows.append(('ETF in a bank brokerage account (r_g 5%)', o14['V'], f'fees {f2(sum(s14.fees.values()) + o14["exit_commission"] + o14["exit_spread"])}, exit tax {f2(o14["tax"])}'))
    # current account for the compared money: eligible (any time), so it is ranked too (F-83)
    ca = ca_tax = 0.0
    for m in range(1, T + 1):
        ca += sum(c for c, _ in sched.get(m, []))
        it = ca * mrate(0.005)
        ca_tax += 0.15 * it
        ca += 0.85 * it
    rows.append(('current account at 0.5%', ca, f'tax during {f2(ca_tax)}'))
    ranked = sorted(rows, key=lambda r: -r[1])
    IT = path.I(T)
    # kupat gemel lehashkaa: the 83,641 ceiling binds in year 1
    sk = defaultdict(list)
    sk[1].append((83641.0, 0))
    routed = 100000.0 - 83641.0 + sum(4000.0 * path.I(m) for m in range(1, 13))
    for m in range(13, T + 1):
        sk[m].append((4000.0 * path.I(m), m))
    rk = run_provident(T, sk, 0.05, path, direct=0.0010, balfee=lambda m: 0.008)
    ek = kgl_exit(rk, path, T)
    # coverage line (F-83): one outcome per tier-1 wrapper and tier-2 instrument
    cov = [(r[0], 'ranked', f'rank {i + 1}') for i, r in enumerate(ranked)]
    # the other tier-1 wrapper records (data-schema §2 wrapper IDs)
    cs = 'takes the NII amounts and the parent\'s matching deposit only, not this money (method section 8; CS-02, CS-04, CS-16)'
    cov += [
        ('savings plan', 'not evaluated', 'no savings-plan terms among the inputs (production: data/terms/deposits/, R4)'),
        ('renewable money-market fund', 'not evaluated', 'monthly deposits into fixed-date series are not set (G-30)'),
        ('kupat gemel lehashkaa', 'listed, not ranked', 'the yearly ceiling takes only part of the money (KGL-02, KGL-04; F-05)'),
        ('keren hishtalmut', 'listed, not ranked', 'employee (product D15); locked 6 years (TXH-09)'),
        ('comprehensive pension fund', 'listed, not ranked', 'locked to 60 (PEN-26)'),
        ('general pension fund', 'listed, not ranked', 'locked to 60 (PEN-26)'),
        ('provident fund for annuity', 'listed, not ranked', 'exit as pension, locked to 60 (PEN-34, PEN-26)'),
        ('IRA in a study fund', 'listed, not ranked', 'as the study fund it is held in (IRA-25)'),
        ('IRA in a provident fund', 'listed, not ranked', 'as the provident fund it is held in (IRA-25)'),
        ('child savings, provident route', 'not eligible', cs),
        ('child savings, bank route', 'not eligible', cs),
    ]
    L('KGL-02', 'KGL-04', 'TXH-09', 'PEN-26', 'PEN-34', 'IRA-25', 'CS-02', 'CS-04', 'CS-16')  # register the rules cited in the coverage reasons
    cov += [(t, 'not evaluated', 'tier 2, open questions (G-24)') for t in (
        'savings policies', 'executive insurance', 'structured deposits', 'corporate bonds', 'managed and robo portfolios',
        'foreign-currency deposits', 'REITs', 'gold via funds', 'Amendment 190 deposits')]
    order = ['ranked', 'listed, not ranked', 'not eligible', 'excluded by the person\'s constraint', 'not evaluated']
    counts = [(o, sum(1 for c in cov if c[1] == o)) for o in order]
    assert len({c[0] for c in cov}) == len(cov) == sum(n for _, n in counts)
    # the 50,000 kept available in the current account
    cab = 50000.0
    for m in range(1, T + 1):
        cab += 0.85 * cab * mrate(0.005)
    body = (
        '| Step | What | Rule | Value |\n|---|---|---|---|\n'
        f'| 0 | Filled-in inputs | — | {filled("terms from the earlier examples: deposit ladder 3.5%; daily fund BoI 3.25%, δ 0.18%; makam 3.9%, 0.1% min 20; bond 3.75% yearly, 0.2% min 30, custody 0.1%/q min 10; ETF at r_g 5% with the bank-brokerage ETF fees; kupat gemel lehashkaa fees 0.8% + 0.1%; current account 0.5%")} |\n'
        f'| 1 | 50,000 must stay available at once: kept in the current account (0.5%, 15% at crediting) | product D13; {L("TXI-08")} | {f2(cab)} at 4 years |\n'
        f'| 2 | Compared money: 100,000 now + 4,000 × I_m a month for 48 months, the same in every row | method B1 | paid {f2(paid)} |\n'
        f'| 3 | Makam: each contribution buys a new 12-month series, redemptions roll; open series sold at the horizon at the unchanged yield, 15% on the gain | {L("GOV-06", "TXI-11", "TXI-12", "GOV-23")} | — |\n'
        f'| 4 | Bond: bought at par plus accrued interest; the full coupon taxed 15% (whether the accrued interest paid offsets it is open, so the conservative reading is used; under 0.5%) | {L("TXI-15", "TXI-16", "TXI-12")} | — |\n'
        f'| 5 | Kupat gemel lehashkaa: 100,000 now exceeds the 83,641 yearly ceiling; it takes 83,641 and nothing more in year 1, so {f2(routed)} goes to the next goal. It cannot take the same money, so it is listed, not ranked | {L("KGL-02", "KGL-03", "KGL-04")}; method F-05 | value {f2(ek["V25"])} on what it takes |\n'
        f'| 6 | Study fund: employee, and locked for 6 years → listed, not ranked. Pension: locked to 60 → listed | product D15; {L("TXH-09", "PEN-26")} | listed |\n'
        f'| 7 | Rank by real value at 4 years after fees and tax; tie test between the top two with θ = {THETA}%. The current account also takes the compared money (exit any time), so it is ranked | method F-80, F-83; {L("TXI-08")} | see table |\n'
        f'| 8 | Coverage line: every tier-1 wrapper and tier-2 instrument accounted for once | method F-83; product D17 | see second table |\n\n'
        + table(['Rank', 'Option', 'Nominal V', 'Real V', 'Fees and tax'],
                [[i + 1, r[0], f2(r[1]), f2(r[1] / IT), r[2]] for i, r in enumerate(ranked)])
        + '\n\n' + table(['Candidate', 'Outcome', 'Reason'], [[c, o, r] for c, o, r in cov])
        + f'\n\nConsidered {len(cov)}: ' + ', '.join(f'{o} {n}' for o, n in counts)
    )
    section('S40', "Wrapper mode: the founder's apartment case", 'computed', body,
            f'Ranked (real at 4 years, same money in each): ' + '; '.join(f'{i + 1}. {r[0]} {f2(r[1] / IT)}' for i, r in enumerate(ranked)) +
            f'. Top two: {tie_text(ranked[0][1], ranked[1][1])}. The 50,000 kept available in the current account grows to {f2(cab)} ({f2(cab / IT)} real). Kupat gemel lehashkaa: listed, not ranked (the 83,641 ceiling takes only part of year 1; {f2(routed)} routed to the next goal). Study fund and pension: listed, not ranked (locked). Coverage line (F-83): considered {len(cov)}; ' + '; '.join(f'{o} {n}' for o, n in counts) +
            '; not ranked, with reasons: ' + '; '.join(f'{c} ({o}: {r})' for c, o, r in cov if o != 'ranked') +
            '. Fund variants, tracks and providers inside each wrapper: compared in the workbench (3.4). Filled in: every wrapper\'s terms from the earlier examples.')


def main():
    s01_s02_s04()
    s03()
    s05()
    s06_s07()
    s08_s09_s10()
    s11_s13_s37()
    s12()
    s14_s15_s16()
    s20_s21_s22()
    s23_s24_s25_s26()
    s27_s28_s30()
    s31_s32()
    s33()
    s34_s35_s36_s38()
    s39_s48()
    s42()
    s43()
    s44_s45()
    s17_s18_s19()
    s26_fill()
    s28_s29_fill()
    s32_fill()
    s40_fill()
    s41_fill()
    s46_fill()
    s47_fill()
    s49_fill()
    s50_fill()
    missing = sorted(i for i in USED if i not in RULES or not RULES[i]['url'])
    if missing:
        sys.exit('rules cited but not in the rule base: ' + ', '.join(missing))
    if '--json' in sys.argv:
        print(json.dumps(RESULTS, indent=1, ensure_ascii=False))
        return
    order = sorted(SECTIONS, key=lambda s: int(s[0][1:]))
    groups = defaultdict(list)
    for sid, _, status, _ in order:
        groups[status.split(' ')[0].split(',')[0]].append(sid)
    out = ['## Status at a glance\n\n' + table(
        ['Status', 'Scenarios'],
        [['computed — one expected result (subject to the conventions)', ', '.join(groups['computed'])],
         ['pending — two results, one per side of a difference you decide', ', '.join(groups['pending'])],
         ['partial — some outputs computed, the rest blocked', ', '.join(groups['partial'])],
         ['blocked — missing inputs or an unclear rule', ', '.join(groups['blocked'])]]) + '\n\n## Scenario workings\n']
    for sid, title, status, body in order:
        out.append(f'### {sid} {title}\n\nStatus: {status}.\n\n{body}\n\n**Expected (as written to scenarios.md):** {RESULTS[sid]["expected"]}\n')
    rules_rows = [[f'[{i}](<{RULES[i]["url"]}>)', RULES[i]['title'], RULES[i]['checked'], RULES[i]['strength']]
                  for i in sorted(USED, key=lambda x: (x.split('-')[0], int(x.split('-')[1])))]
    out.append('## Rules cited\n\nStrength is the one recorded on the rule\'s first source.\n\n' + table(['Rule', 'Title', 'Checked', 'Strength'], rules_rows))
    generated = '\n'.join(out)

    golden = os.path.join(ROOT, 'tests', 'golden')
    wpath = os.path.join(golden, 'workings.md')
    start, end = '<!-- generated by expected_calc.py: start -->', '<!-- generated by expected_calc.py: end -->'
    text = open(wpath, encoding='utf-8').read()
    head, rest = text.split(start, 1)
    tail = rest.split(end, 1)[1]
    with open(wpath, 'w', encoding='utf-8') as fh:
        fh.write(head + start + '\n\n' + generated + '\n\n' + end + tail)

    spath = os.path.join(golden, 'scenarios.md')
    lines = open(spath, encoding='utf-8').read().split('\n')
    new, sid = [], None
    for line in lines:
        m = re.match(r'### (S\d\d) ', line)
        if m:
            sid = m.group(1)
        if line.startswith('  - Independent check'):
            continue
        new.append(line)
        if sid and line.startswith('- Expected:') and sid in RESULTS:
            new.append(f'  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section {sid}): '
                       + RESULTS[sid]['expected'])
    with open(spath, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(new))
    print('workings.md and scenarios.md updated; rules cited:', len(USED))


if __name__ == '__main__':
    main()
