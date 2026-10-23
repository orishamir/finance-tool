// The title a rule shows in lists and on cards (F4): the record's Hebrew title, else the first sentence of its Hebrew text, else the English title.
import type { RuleRecord } from "@finance-tool/schema";

export interface ShownTitle {
  text: string;
  /** True when only the English title is left, so the page isolates it as left to right text. */
  english: boolean;
}

/** The first sentence of a Hebrew text: up to the first full stop, question or exclamation mark followed by a space (so "0.8" stays whole). */
export function firstSentence(text: string): string {
  const t = text.trim();
  const m = /^(.+?[.!?])(?:\s|$)/su.exec(t);
  return (m ? m[1]! : t).replace(/[.]$/, "");
}

export function ruleTitle(rule: Pick<RuleRecord, "title" | "title_he" | "text_he">): ShownTitle {
  if (rule.title_he) return { text: rule.title_he, english: false };
  if (rule.text_he) return { text: firstSentence(rule.text_he), english: false };
  return { text: rule.title, english: true };
}
