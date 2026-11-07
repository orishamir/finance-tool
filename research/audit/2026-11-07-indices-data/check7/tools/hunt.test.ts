// Kept as evidence (independent check of pass 7): copy into site/app/components/invest/ to run it; HUNT_A, HUNT_M, HUNT_Y, HUNT_R pick the plans, HUNT_IX the indices, HUNT_LOG the log.
// temporary: hunt for plans and picks that throw on the index page (independent check of pass 7)
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { appendFileSync } from "node:fs";
const LOG = process.env.HUNT_LOG ?? "/dev/null";
import { buildWorkbenchBundle } from "../../lib/providers.server";
import { buildInvest, knownIndices } from "../../lib/invest";
import { entered } from "../../lib/value";
import type { WorkbenchInputs } from "../../lib/providers";
import { LabelSheetHost } from "../kit";
import { AccountColumn, allFunds, FundColumn, PairResult, pickOfHeadline } from "./pair";
import { ProvenanceProvider } from "../provenance";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const data = { rules: {}, terms: {}, dimensions: {}, today: t };
const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(LabelSheetHost, null, el) })));
const at = (a: number, m: number, y: number, r: number): WorkbenchInputs => ({ amountNow: a, monthly: m, years: y, grossReturn: r, inflation: 0.02, age: null, income: null, fromGoal: true, returnFromParameter: false, values: { amount: entered(a, "nis", t), monthly: entered(m, "nis_per_month", t), years: entered(y, "years", t), returnV: entered(r * 100, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) } });
const A = (process.env.HUNT_A ?? "0,125000,500000").split(",").map(Number);
const M = (process.env.HUNT_M ?? "0,2500,10000").split(",").map(Number);
const Y = (process.env.HUNT_Y ?? "1,11,40").split(",").map(Number);
const R = (process.env.HUNT_R ?? "0,0.03,0.12").split(",").map(Number);
const plans = A.flatMap((a) => M.flatMap((m) => Y.flatMap((y) => R.map((r) => at(a, m, y, r)))));

describe("hunt", () => {
  const only = process.env.HUNT_IX?.split(",");
  for (const index of knownIndices(bundle).filter((i) => !only || only.includes(i.id))) {
    it(index.id, () => {
      const fails: string[] = [];
      let n = 0;
      for (const p of plans) {
        let view;
        try { view = buildInvest({ bundle, index, plan: p }); } catch (e) { fails.push(`build ${p.amountNow}/${p.monthly}/${p.years}/${p.grossReturn}: ${(e as Error).message}`); continue; }
        const head = pickOfHeadline(view);
        const tag = `${p.amountNow}/${p.monthly}/${p.years}/${p.grossReturn}`;
        for (const f of allFunds(view)) {
          for (const [house, way] of Object.entries(f.byHouse)) {
            const ia = (way as { interaction?: number }).interaction;
            if (typeof ia === "number" && ia < -0.5) fails.push(`negative remainder ${tag} ${house} ${f.rec.id}: ${ia.toFixed(2)}`);
          }
          for (const house of Object.keys(f.byHouse)) {
            const pick = { house, fund: f.rec.id };
            for (const chosen of [true, false]) {
              n++;
              try { html(createElement(PairResult, { view, bundle, plan: p, pick, chosen, onPick: () => undefined })); } catch (e) { fails.push(`pair ${tag} ${house} ${f.rec.id} chosen=${chosen}: ${(e as Error).message.slice(0, 160)}`); }
            }
          }
          const pick = { house: head?.house ?? Object.keys(f.byHouse)[0]!, fund: f.rec.id };
          try { html(createElement(AccountColumn, { view, bundle, years: p.years, pick, onPick: () => undefined })); } catch (e) { fails.push(`accounts ${tag} ${f.rec.id}: ${(e as Error).message.slice(0, 160)}`); }
          try { html(createElement(FundColumn, { view, bundle, plan: p, today: t, pick, onPick: () => undefined } as never)); } catch (e) { fails.push(`funds ${tag} ${f.rec.id}: ${(e as Error).message.slice(0, 160)}`); }
        }
      }
      appendFileSync(LOG, `${index.id} renders ${n} fails ${fails.length}\n` + [...new Set(fails)].slice(0, 40).map((f) => `   ${f}\n`).join(""));
      expect(fails.length).toBe(0);
    }, 1_800_000);
  }
});
