import type { ReactNode } from "react";
import type { GlanceItem, RuleRowItem } from "../../components/guide/sections";
import type { SiteValue } from "../../lib/value";
import type { BreakTerms } from "../../lib/guide-signature";

export interface ContentProps {
  /** A figure of a rule record shipped with the page, or null when the page does not hold it. */
  figure: (ruleId: string, name: string) => SiteValue | null;
  /** What the collected deposits say about breaking them (F-104), on the bank-deposit guide; null elsewhere. */
  breakTerms?: BreakTerms | null;
}

/** A fact of a country's product (data/abroad, D114), by its key in the record; `who`, who may open it. */
export type AbroadFacts = (key: string) => SiteValue;

/** The guide's words for one country's product in the note on other countries. */
export interface AbroadCountryWords {
  /** The heading, "ב{מדינה}: …", with the product's name as its pages write it. */
  title: (product: string) => ReactNode;
  /** Two or three sentences: what it is, who may open it, and how it differs from this guide's product, whose figures `p` gives. */
  body: (f: AbroadFacts, p: ContentProps) => ReactNode;
  /** The rules of this guide's product the comparison rests on, shown under the sentences. */
  rules?: readonly string[];
  /** The three facts, under `AbroadWords.heads`. */
  tiles: (f: AbroadFacts) => readonly [ReactNode, ReactNode, ReactNode];
}

/** The note on how the product works in other countries (D114), where the guide has a record under data/abroad/. */
export interface AbroadWords {
  /** The three facts' headings, the same for every country, in the record's `tiles` order. */
  heads: readonly [string, string, string];
  /** What was looked for in a country where nothing like the product was found, said of that country. */
  none?: (country: string) => string;
  /** Every country the record found a product in. */
  countries: Partial<Record<string, AbroadCountryWords>>;
}

export interface GuideContent {
  what: (p: ContentProps) => ReactNode;
  /** Left out where the guide has no such section (lib/guide-nav.ts). */
  who?: (p: ContentProps) => ReactNode;
  /** The "מעבר בין מסלולים וקופות" line of the money-in-and-out list, and its rules; only a guide with that section has them. */
  switchLine?: ReactNode | ((p: ContentProps) => ReactNode);
  switchRules?: string[];
  /** More rows of that list, after the shared ones. A rule named here ships with the page, as any rule its prose names. */
  inoutRows?: (p: ContentProps) => RuleRowItem[];
  /** A company-terms row left off this page, where general rules also apply and the company names would mislead. */
  omitCompanyTerms?: readonly string[];
  /** The prose already says when the money is free, so the list does not say it again. */
  omitFreeRow?: boolean;
  /** The money-in-and-out list already says that moving between tracks is not taxed, so the tax step "while the money is in" does not say it again. */
  omitSwitchInTax?: boolean;
  /** The list of companies that offer it shows open, not behind a toggle. */
  companiesOpen?: boolean;
  /** The guides under "כדאי להכיר גם", where the record's transfer routes would not be the ones a reader of this page wants. */
  relatedIds?: string[];
  /** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
  termIds: string[];
  /** On a guide whose chart runs one amount (`lumpSumIds`), the line under the chart's example that says where money paid in every month goes. */
  lumpNote?: ReactNode;
  /** Anything after the tax steps (a blocked route, a note). */
  afterTax?: (p: ContentProps) => ReactNode;
  risks: (p: ContentProps) => ReactNode;
  /** The note on other countries at the end of "שווה לדעת". */
  abroad?: AbroadWords;
  /** Left out on a guide that omits the section (`omitsSection`). */
  use?: (p: ContentProps) => ReactNode;
}

/** Prose of an exposure guide page (flows 6.6: no timeline, no money-in-and-out section). */
export interface ExposureContent {
  /** The page's own figures for the card beside the title, each as the prose states it; the kind and the currency follow them from the record. */
  glance?: (p: ContentProps) => GlanceItem[];
  what: (p: ContentProps) => ReactNode;
  /** Optional line above the "how to hold it" cards (which wrappers can hold it, and any tax caveat). */
  holdNote?: (p: ContentProps) => ReactNode;
  risks: (p: ContentProps) => ReactNode;
  /** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
  termIds: string[];
}
