import type { ReactNode } from "react";
import type { KeyValueItem } from "../../components/guide/sections";
import type { SiteValue } from "../../lib/value";
import type { BreakTerms } from "../../lib/guide-signature";

export interface ContentProps {
  /** A figure of a rule record shipped with the page, or null when the page does not hold it. */
  figure: (ruleId: string, name: string) => SiteValue | null;
  /** What the collected deposits say about breaking them (F-104), on the bank-deposit guide; null elsewhere. */
  breakTerms?: BreakTerms | null;
}

export interface GuideContent {
  what: (p: ContentProps) => ReactNode;
  /** Left out where the guide has no such section (lib/guide-nav.ts). */
  who?: (p: ContentProps) => ReactNode;
  /** The "מעבר בין מסלולים וקופות" line of the money-in-and-out list, and its rules; only a guide with that section has them. */
  switchLine?: ReactNode | ((p: ContentProps) => ReactNode);
  switchRules?: string[];
  /** More rows of that list, after the shared ones. A rule named here ships with the page, as any rule its prose names. */
  inoutRows?: (p: ContentProps) => KeyValueItem[];
  /** A company-terms row left off this page, where general rules also apply and the company names would mislead. */
  omitCompanyTerms?: readonly string[];
  /** The prose already says when the money is free, so the list does not say it again. */
  omitFreeRow?: boolean;
  /** The guides under "כדאי להכיר גם", where the record's transfer routes would not be the ones a reader of this page wants. */
  relatedIds?: string[];
  /** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
  termIds: string[];
  /** Anything after the tax steps (a blocked route, a note). */
  afterTax?: (p: ContentProps) => ReactNode;
  risks: (p: ContentProps) => ReactNode;
  /** Left out on a guide that omits the section (`omitsSection`). */
  use?: (p: ContentProps) => ReactNode;
}

/** Prose of an exposure guide page (flows 6.6: no timeline, no money-in-and-out section). */
export interface ExposureContent {
  what: (p: ContentProps) => ReactNode;
  /** Optional line above the "how to hold it" cards (which wrappers can hold it, and any tax caveat). */
  holdNote?: (p: ContentProps) => ReactNode;
  risks: (p: ContentProps) => ReactNode;
  /** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
  termIds: string[];
}
