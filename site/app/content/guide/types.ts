import type { ReactNode } from "react";
import type { SiteValue } from "../../lib/value";

export interface ContentProps {
  /** A figure of a rule record shipped with the page, or null when the page does not hold it. */
  figure: (ruleId: string, name: string) => SiteValue | null;
}

export interface GuideContent {
  what: (p: ContentProps) => ReactNode;
  /** Left out where the guide has no such section (lib/guide-nav.ts). */
  who?: (p: ContentProps) => ReactNode;
  /** The "מעבר בין מסלולים" line of the money-in-and-out list, and its rules; only a guide with that section has them. */
  switchLine?: string;
  switchRules?: string[];
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
