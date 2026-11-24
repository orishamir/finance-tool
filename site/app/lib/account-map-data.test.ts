// The account map (F-131) on the collected data: what must hold whatever the data says, so a routine refresh never breaks it.
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { bundle, html, lists, plan as fixturePlan, shown } from "../components/invest/render-fixtures";
import { allFunds, pickOfHeadline } from "../components/invest/pair";
import { AccountMapPanel, mapAreas, mapCard, mapPointValue } from "../components/invest/account-map";
import { invest, kit as kitCopy } from "../copy";
import type { AccountMap } from "./account-map";
import { buildInvest, indexById, knownIndices, providersOfInvest, tieShareOf } from "./invest";
import { leftWith, work } from "./invest-work";
import { rankedAt } from "./stretch";
import { entered, type SiteValue } from "./value";
import { fmt } from "./format";
import { chartTextWidth } from "../components/kit/chart-text";
import { lineMeetsBox, regionTones } from "../components/kit/region-map";
import type { WorkbenchInputs } from "./providers";

/** A value the test's setup must have, else the test stops naming what was missing. */
function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`missing: ${what}`);
  return x;
}
const t = bundle.today;
const kitLegend = kitCopy.legend;
const theta = tieShareOf(bundle);
const planAt = (amount: number, monthly: number, years: number): WorkbenchInputs => ({ ...fixturePlan, amountNow: amount, monthly, years, values: { ...fixturePlan.values, amount: entered(amount, "nis", t), monthly: entered(monthly, "nis_per_month", t), years: entered(years, "years", t) } });
const firstOf = (map: AccountMap) => (map.plan.lead.kind === "clear" ? map.plan.lead.first : map.plan.lead.kind === "near" ? map.plan.lead.tied[0] : null);
/** The first account and its lead at a point, from what every account leaves there, sorted here. */
function exactAt(left: ReadonlyMap<string, number>) {
  const [p, q] = [...left].sort((x, y) => y[1] - x[1]);
  return { first: p?.[0], ahead: p && q ? Math.min(1, (p[1] - q[1]) / p[1] / theta) : 1 };
}

for (const [slug, plan] of [["index-sp500", planAt(10_000, 500, 10)], ["index-sp500", planAt(150_000, 3000, 20)], ["index-ta125", planAt(10_000, 500, 10)]] as const) {
  describe(`${slug} at ${plan.amountNow} ₪ and ${plan.monthly} ₪ a month for ${plan.years} years`, () => {
    const index = need(indexById(bundle, slug), slug);
    const view = buildInvest({ bundle, index, plan });
    const pick = need(pickOfHeadline(view), "the page's pair");
    const answer = work.map(bundle, { index, plan, fund: pick.fund });
    const map = need(answer.kind === "map" ? answer.map : null, "the map");
    const leftAt = leftWith(bundle, index, plan, pick.fund);

    it("with the headline's fund, names at the plan the account the account list shows first", () => {
      const out = lists(view, bundle, plan, pick);
      const ranked = view.providers.filter((p) => allFunds(view).some((f) => rankedAt(f.byHouse[p.id])));
      const at = (id: string) => out.indexOf(`data-pick-key="${id}"`);
      const shownFirst = [...ranked].sort((a, b) => at(a.id) - at(b.id))[0]?.id;
      expect(firstOf(map)).toBe(shownFirst);
    });

    it("with another fund, names at the plan the account that leaves the most with that fund", () => {
      const other = need(
        allFunds(view).find((f) => f.rec.id !== pick.fund && Object.values(f.byHouse).filter(rankedAt).length > 1),
        "a fund other than the headline's, ranked at two accounts",
      );
      const got = work.map(bundle, { index, plan, fund: other.rec.id });
      const otherMap = need(got.kind === "map" ? got.map : null, "the other fund's map");
      const values = Object.values(other.byHouse).filter(rankedAt).sort((a, b) => b.valueN - a.valueN);
      const top = need(values[0], "the other fund's first account");
      const lead = otherMap.plan.lead;
      if (lead.kind === "near") expect(lead.tied).toContain(top.providerId);
      else expect(lead).toEqual({ kind: "clear", first: top.providerId });
      // every account within θ of the first is among those the map names about the same, and no other
      const within = values.filter((w) => (top.valueN - w.valueN) / top.valueN < theta).map((w) => w.providerId);
      expect(lead.kind === "near" ? [...lead.tied].sort() : [top.providerId]).toEqual([...within].sort());
    });

    it("reads its areas as the accounts' own figures do, at points across the map", () => {
      const wrong: string[] = [];
      for (const [fi, fj] of [[0.07, 0.05], [0.2, 0.6], [0.35, 0.3], [0.5, 0.9], [0.66, 0.15], [0.8, 0.45], [0.93, 0.75], [0.12, 0.95]] as const) {
        const i = Math.round(fi * (map.field.cols - 1));
        const j = Math.round(fj * (map.field.rows - 1));
        const a = (map.max.amount * i) / (map.field.cols - 1);
        const m = map.bottom + ((map.max.monthly - map.bottom) * j) / (map.field.rows - 1);
        const want = exactAt(leftAt(a, m, null));
        const k = j * map.field.cols + i;
        const got = { first: map.accounts[map.field.first[k] ?? -1], ahead: map.field.ahead[k] ?? NaN };
        if ((want.ahead > 0.33 && got.first !== want.first) || Math.abs(got.ahead - want.ahead) > 0.15) wrong.push(`(${a}, ${m}): ${JSON.stringify(got)} against ${JSON.stringify(want)}`);
      }
      expect(wrong).toEqual([]);
    });

    it("reads its lowest rows as the accounts do, where a deposit too small for a trade's minimum or a whole unit turns the figures", () => {
      const wrong: string[] = [];
      for (let j = 0; j <= 8; j++)
        for (let i = 0; i < map.field.cols; i += 4) {
          const a = (map.max.amount * i) / (map.field.cols - 1);
          const m = map.bottom + ((map.max.monthly - map.bottom) * j) / (map.field.rows - 1);
          const want = exactAt(leftAt(a, m, null));
          const k = j * map.field.cols + i;
          const got = { first: map.accounts[map.field.first[k] ?? -1], ahead: map.field.ahead[k] ?? NaN };
          if ((want.ahead > 0.33 && got.first !== want.first) || Math.abs(got.ahead - want.ahead) > 0.15) wrong.push(`(${a}, ${m}): ${JSON.stringify(got)} against ${JSON.stringify(want)}`);
        }
      expect(wrong).toEqual([]);
    });

    it("reads the line for no monthly deposit as the accounts do, from just above 0", () => {
      const wrong: string[] = [];
      const n = map.edge.cols - 1;
      for (let i = 0; i <= n; i += 6) {
        const a = Math.max(map.max.amount / 1000, (map.max.amount * i) / n);
        const want = exactAt(leftAt(a, 0, null));
        const got = { first: map.accounts[map.edge.first[i] ?? -1], ahead: map.edge.ahead[i] ?? NaN };
        if ((want.ahead > 0.33 && got.first !== want.first) || Math.abs(got.ahead - want.ahead) > 0.15) wrong.push(`${a}: ${JSON.stringify(got)} against ${JSON.stringify(want)}`);
      }
      expect(wrong).toEqual([]);
    });

    it("shows every account clearly first somewhere within its axes, the line for no monthly deposit included", () => {
      // an even 6 × 6 grid over the map's own range (fitted to the plan), its bottom row at no monthly deposit at all
      const missing: string[] = [];
      const K = 6;
      for (let i = 0; i <= K; i++)
        for (let j = 0; j <= K; j++) {
          if (i + j === 0) continue;
          const [a, m] = [(map.max.amount * i) / K, (map.max.monthly * j) / K];
          const want = exactAt(leftAt(a, m, null));
          if (want.ahead < 1 || !want.first) continue;
          const k = map.accounts.indexOf(want.first);
          const clear = [map.field, map.edge].some((f) => f.first.some((x, n) => x === k && f.ahead[n] === 1));
          if (!clear) missing.push(`${want.first} at (${a}, ${m})`);
        }
      expect(missing).toEqual([]);
    });

    it("a switch is where an account is first and θ ahead of the plan's accounts but itself, and stays so at points past it", () => {
      const lead = map.plan.lead;
      const tied = lead.kind === "near" ? lead.tied : lead.kind === "clear" ? [lead.first] : [];
      for (const [axis, s] of Object.entries(map.switches)) {
        if (!s) continue;
        const at = (v: number) => (axis === "amount" ? leftAt(v, plan.monthly, null) : leftAt(plan.amountNow, v, null));
        for (const f of [1.001, 1.05, 1.2]) {
          const v = s.dir === "up" ? s.at * f : s.at / f;
          const left = at(v);
          const q = need(exactAt(left).first, "the first account");
          const others = tied.filter((id) => id !== q);
          expect(others.length, `${axis} at ${v}`).toBeGreaterThan(0);
          const vq = need(left.get(q), q);
          for (const id of others) expect((vq - (left.get(id) ?? 0)) / vq, `${axis} at ${v}: ${q} against ${id}`).toBeGreaterThanOrEqual(theta);
        }
      }
    });
  });
}

describe("a fund no account is ranked with", () => {
  it("has no map, and says its tax rests on an open rule (F-118)", () => {
    const plan = planAt(10_000, 500, 10);
    const found = knownIndices(bundle).flatMap((index) => {
      const view = buildInvest({ bundle, index, plan });
      return allFunds(view)
        .filter((f) => f.beforeTax && !Object.values(f.byHouse).some(rankedAt))
        .map((f) => ({ index, fund: f.rec.id }));
    });
    // each such fund the data holds (a few, to keep the run short)
    for (const f of found.slice(0, 3)) {
      const answer = work.map(bundle, { index: f.index, plan, fund: f.fund });
      expect(answer, f.fund).toEqual({ kind: "unranked", why: "open-rule" });
      // the card stays, saying why there is no map
      const card = mapCard(answer, buildInvest({ bundle, index: f.index, plan }), bundle, "psagot", false);
      expect([card.answer, card.note]).toEqual([invest.before.map.unranked, invest.before.map.unrankedWhy["open-rule"]]);
    }
  });
});

describe("a plan of nothing at all on the collected data", () => {
  it("still has its map, with no account leading at the plan", () => {
    const index = need(indexById(bundle, "index-sp500"), "the S&P 500");
    const plan = planAt(0, 0, 10);
    const pick = need(pickOfHeadline(buildInvest({ bundle, index, plan: planAt(10_000, 500, 10) })), "the page's pair");
    const answer = work.map(bundle, { index, plan, fund: pick.fund });
    expect(answer.kind === "map" ? [answer.map.plan.lead, answer.map.switches, answer.map.accounts.length > 0] : answer).toEqual([{ kind: "empty" }, { amount: null, monthly: null }, true]);
  });
});

describe("the guides from the plan on the default S&P 500 plan", () => {
  it("runs one along each axis, to its switch, else to a stretch where another is clearly cheaper, else to where the two are equal", () => {
    const index = need(indexById(bundle, "index-sp500"), "the S&P 500");
    const plan = planAt(10_000, 500, 10);
    const pick = need(pickOfHeadline(buildInvest({ bundle, index, plan })), "the page's pair");
    const answer = work.map(bundle, { index, plan, fund: pick.fund });
    const map = need(answer.kind === "map" ? answer.map : null, "the map");
    const out = shown(html(createElement(AccountMapPanel, { view: buildInvest({ bundle, index, plan }), bundle, house: pick.house, map, on: { bundle, ask: { index, plan, fund: pick.fund } } })));
    const bare = (x: string) => x.replace(/[\u2060\u2066-\u2069]/g, "");
    const plain = bare(out);
    // whatever the data says, a guide along each axis: to a switch, else to a stretch, else to the equal point, as the map has them
    for (const axis of ["amount", "monthly"] as const) {
      const s = map.switches[axis];
      const st = map.stretches[axis];
      const e = map.equal[axis];
      const unit = axis === "monthly" ? ` ${invest.before.map.perMonth}` : "";
      if (s) expect(plain).toContain(bare(`${invest.before.map.about}${fmt.nisRough(s.at)}${unit}`));
      else if (st) expect(plain).toContain(bare(`${invest.before.map.between}${fmt.nisRough(st.lo)}`));
      else if (e) expect(plain).toContain(bare(`${invest.before.map.equalAt}${fmt.nisRough(e.at)}${unit}`));
    }
    // with no point kept, nothing under the map
    expect(plain).not.toContain(invest.before.map.planHead);
  });

  it("draws no guide to a switch past the axis's end, where the axis is held at the sliders' reach", () => {
    const index = need(indexById(bundle, "index-sp500"), "the S&P 500");
    const plan = planAt(10_000, 500, 10);
    const view = buildInvest({ bundle, index, plan });
    const pick = need(pickOfHeadline(view), "the page's pair");
    const answer = work.map(bundle, { index, plan, fund: pick.fund });
    const real = need(answer.kind === "map" ? answer.map : null, "the map");
    const past = 2 * real.max.amount;
    const far: AccountMap = { ...real, switches: { ...real.switches, amount: { at: past, dir: "up", to: real.accounts[0] ?? "" } }, stretches: { ...real.stretches, amount: null }, equal: { ...real.equal, amount: null } };
    const out = html(createElement(AccountMapPanel, { view, bundle, house: pick.house, map: far, on: { bundle, ask: { index, plan, fund: pick.fund } } }));
    expect(shown(out).replace(/[\u2060\u2066-\u2069]/g, "")).not.toContain(fmt.nisRough(past));
    // the guides are drawn as with no switch along today's amount: to the axis's end
    const guides = (m: AccountMap) => {
      const h = html(createElement(AccountMapPanel, { view, bundle, house: pick.house, map: m, on: { bundle, ask: { index, plan, fund: pick.fund } } }));
      return [...h.matchAll(/data-mark="guide"><line [^>]*>/g)].map((x) => x[0]);
    };
    expect(guides(far)).toHaveLength(2);
    expect(guides(far)).toEqual(guides({ ...far, switches: { ...far.switches, amount: null } }));
  });
});

describe("a switch's figure on the collected data", () => {
  it("rests on the runs of every account of the plan's tied set and the account it names, its point F-131's and not an entry", () => {
    const index = need(indexById(bundle, "index-sp500"), "the S&P 500");
    const plan = planAt(10_000, 500, 10);
    const view = buildInvest({ bundle, index, plan });
    const pick = need(pickOfHeadline(view), "the page's pair");
    const answer = work.map(bundle, { index, plan, fund: pick.fund });
    const map = need(answer.kind === "map" ? answer.map : null, "the map");
    const on = { bundle, ask: { index, plan, fund: pick.fund } };
    // whatever the data says, three accounts ranked with the fund at 50,000 ₪ today: two taken as tied at the plan, a switch to the third
    const ranked = [...leftWith(bundle, index, plan, pick.fund)(50_000, 500, null).keys()];
    const [a, b, c] = ranked;
    if (!a || !b || !c) throw new Error("three accounts ranked with the fund");
    const near: AccountMap = { ...map, plan: { ...map.plan, lead: { kind: "near", tied: [a, b] } } };
    const v = mapPointValue(view, on, near, { at: 50_000, dir: "up", to: c }, "amount", invest.before.map.switchAbout);
    // beside the plan's own numbers, an input for each account's run
    const plain = new Set<string>(Object.values(invest.planInputs));
    const runs = Object.keys(v.computed_from?.inputs ?? {}).filter((k) => !plain.has(k));
    expect(runs.length, JSON.stringify(runs)).toBe(3);
    // every value it rests on, all the way down
    const all: SiteValue[] = [];
    const walk = (x: SiteValue) => {
      all.push(x);
      // a computed figure's inputs are values the site made with `computed`
      for (const y of Object.values(x.computed_from?.inputs ?? {})) walk(y as SiteValue);
    };
    walk(v);
    expect(all.filter((x) => x.about === invest.before.map.pointAbout)).toEqual([]);
    expect(all.some((x) => x.state === "computed" && x.computed_from?.formula === "F-131" && x.value === 50_000)).toBe(true);
  });
});

describe("the words over the map on TA-125 at 10,000 ₪ today and 10,000 ₪ a month", () => {
  it("stand clear of the guides and of the line where two accounts are equal", () => {
    const index = need(indexById(bundle, "index-ta125"), "TA-125");
    const plan = planAt(10_000, 10_000, 10);
    const view = buildInvest({ bundle, index, plan });
    const pick = need(pickOfHeadline(view), "the page's pair");
    const answer = work.map(bundle, { index, plan, fund: pick.fund });
    const map = need(answer.kind === "map" ? answer.map : null, "the map");
    const out = html(createElement(AccountMapPanel, { view, bundle, house: pick.house, map, on: { bundle, ask: { index, plan, fund: pick.fund } } }));
    const host = need(out.slice(out.indexOf("data-region-map")), "the map in the panel");
    // the words: each absolute span over the drawing, at its left and top, as wide as its text measures
    const words = [...host.matchAll(/<span dir="rtl" class="absolute[^"]*" style="left:([\d.]+)px;top:([\d.]+)px"[^>]*>(.*?)<\/span>(?=<span dir="rtl" class="absolute|<div|<\/div>)/g)].map((x) => {
      const text = (x[3] ?? "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'");
      return { text, b: { x: Number(x[1]), y: Number(x[2]), w: chartTextWidth(text), h: 20 } };
    });
    expect(words.length).toBeGreaterThanOrEqual(2);
    const guides = [...host.matchAll(/data-mark="guide"><line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)].map((x) => [Number(x[1]), Number(x[2]), Number(x[3]), Number(x[4])] as const);
    expect(guides).toHaveLength(2);
    const d = /d="([^"]*)"[^>]*data-mark="equal"/.exec(host)?.[1] ?? "";
    const equal = [...d.matchAll(/M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)/g)].map((x) => [Number(x[1]), Number(x[2]), Number(x[3]), Number(x[4])] as const);
    const crossed = words.flatMap((w) => [...guides, ...equal].filter((l) => lineMeetsBox(l, w.b, 0)).map(() => w.text));
    expect([...new Set(crossed)]).toEqual([]);
  });
});

describe("each account's colour on the map", () => {
  it("is set by the houses' order among the map's accounts, never by their rank at the plan, and colours every account on a map of four", () => {
    const index = need(indexById(bundle, "index-sp500"), "the S&P 500");
    const houses = providersOfInvest(bundle).map((s) => s.id);
    const small = planAt(10_000, 500, 10);
    const pick = need(pickOfHeadline(buildInvest({ bundle, index, plan: small })), "the page's pair");
    for (const plan of [small, planAt(150_000, 3000, 20), planAt(100_000, 0, 10)]) {
      const answer = work.map(bundle, { index, plan, fund: pick.fund });
      const map = need(answer.kind === "map" ? answer.map : null, "the map");
      const order = houses.filter((id) => map.accounts.includes(id));
      const { toneOf } = mapAreas(buildInvest({ bundle, index, plan }), map, order);
      // the first four in the houses' order each their own colour, whatever leads at the plan; the rest the grey
      const tones = order.map((id) => toneOf(id));
      expect(tones.slice(0, 4), `${plan.amountNow}`).toEqual(regionTones(4).slice(0, Math.min(4, order.length)));
      expect(tones.slice(4).every((t) => t === "other")).toBe(true);
      // the same accounts in another order (as a plan that ranks them otherwise has them): the same colours
      const shuffled: AccountMap = { ...map, accounts: [...map.accounts].reverse(), field: { ...map.field, first: map.field.first.map((k) => map.accounts.length - 1 - k) } };
      const again = mapAreas(buildInvest({ bundle, index, plan }), shuffled, order).toneOf;
      for (const id of map.accounts) expect(again(id), id).toBe(toneOf(id));
      // the panel colours them so: the legend names each of the first four, never all of them "אחרות"
      const view = buildInvest({ bundle, index, plan });
      const out = html(createElement(AccountMapPanel, { view, bundle, house: pick.house, map, on: { bundle, ask: { index, plan, fund: pick.fund } } }));
      const from = out.indexOf(`aria-label="${kitLegend}"`);
      expect(from).toBeGreaterThan(0);
      const legend = out.slice(from, out.indexOf("</ul>", from)).replace(/&quot;/g, '"');
      for (const id of order.slice(0, 4)) expect(legend, id).toContain(need(view.providers.find((p) => p.id === id), id).short);
    }
  });
});
