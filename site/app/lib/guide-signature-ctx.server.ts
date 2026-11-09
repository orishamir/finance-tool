// What every builder of a guide page's "what makes it different" visual reads (guide-signature.server.ts, guide-signature-g2.server.ts).
import type { DepositTerms, FundRecord, ParameterRecord, ProductRecord, RuleRecord } from "@finance-tool/schema";
import type { Bundle } from "./engine";
import type { SignatureData } from "./guide-signature";
import { ruleFigure, type SiteValue } from "./value";

export interface SignatureCtx {
  p05: ParameterRecord;
  allRules: Record<string, RuleRecord>;
  wrappers: ProductRecord[];
  deposits: DepositTerms[];
  funds: FundRecord[];
  t: string;
  /** The page's own bundle, when it has one (already built by the page). */
  own: Bundle | null;
  id: string;
}

export const emptyData = (id: string): SignatureData => ({ id, bundles: {}, facts: {}, gaps: [], ruleIds: [] });

export const figureOf = (c: SignatureCtx, rule: string, name: string): SiteValue | undefined => {
  const r = c.allRules[rule];
  return r ? (ruleFigure(r, name, c.t) ?? undefined) : undefined;
};

export const withRules = (d: SignatureData, ...ids: string[]): SignatureData => ({ ...d, ruleIds: [...new Set([...d.ruleIds, ...ids])] });
